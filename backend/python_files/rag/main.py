"""
Async FastAPI server – semantic search over CPV codes.

Startup
-------
    uvicorn main:app --host 0.0.0.0 --port 8000

Production (multi-worker)
-------------------------
    # Gunicorn with Uvicorn workers gives true parallelism.
    # Each worker loads its own copy of the model + LanceDB table into memory,
    # so scaling = N workers × 1 model.  Because the workload is read-only
    # (no writes after ingest) there are zero locking / consistency concerns.
    #
    #   gunicorn main:app -k uvicorn.workers.UvicornWorker \
    #       --workers 4 --bind 0.0.0.0:8000
"""

from __future__ import annotations

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import AsyncIterator

import lancedb
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

from schema import MODEL_NAME, TABLE_NAME

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DB_PATH: str = "./lancedb"
DEFAULT_LIMIT: int = 10
MAX_LIMIT: int = 50
THREAD_POOL_WORKERS: int = 4  # threads for blocking model.encode()
RRF_K: int = 60  # constant for Reciprocal Rank Fusion
FETCH_MULTIPLIER: int = 3  # over-fetch factor for hybrid merging

logger = logging.getLogger("uvicorn.error")


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------
class CPVMatch(BaseModel):
    """A single search hit returned to the client."""

    cpv_code: str = Field(..., examples=["45000000-7"])
    description: str = Field(..., examples=["Construction work"])
    score: float = Field(
        ...,
        description="Relevance score (higher = better match, normalised 0-1)",
        examples=[0.82],
    )


class SearchResponse(BaseModel):
    """Envelope returned by ``GET /search``."""

    query: str
    count: int
    results: list[CPVMatch]


class HealthResponse(BaseModel):
    status: str = "ok"
    table_rows: int
    model_name: str
    search_mode: str = "hybrid"


# ---------------------------------------------------------------------------
# Application state (loaded once at startup)
# ---------------------------------------------------------------------------
@dataclass
class AppState:
    model: SentenceTransformer
    table: lancedb.table.Table  # type: ignore[name-defined]
    executor: ThreadPoolExecutor
    fts_available: bool = False


# ---------------------------------------------------------------------------
# Lifespan — load model + DB exactly once
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Initialise heavy resources on startup, tear down on shutdown."""

    logger.info("Loading embedding model: %s …", MODEL_NAME)
    model = SentenceTransformer(MODEL_NAME)

    logger.info("Opening LanceDB table '%s' from %s …", TABLE_NAME, DB_PATH)
    db = lancedb.connect(DB_PATH)
    table = db.open_table(TABLE_NAME)

    executor = ThreadPoolExecutor(
        max_workers=THREAD_POOL_WORKERS,
        thread_name_prefix="embed",
    )

    # Build / refresh FTS index so hybrid search works out of the box.
    fts_ok = False
    try:
        table.create_fts_index("description", replace=True)
        fts_ok = True
        logger.info("FTS index ready on 'description' column.")
    except Exception as exc:
        logger.warning("Could not create FTS index (vector-only mode): %s", exc)

    # Store on app so route handlers can access it.
    _app.state.resources = AppState(
        model=model,
        table=table,
        executor=executor,
        fts_available=fts_ok,
    )

    logger.info(
        "Ready — %s rows, dim=%s, search=%s",
        table.count_rows(),
        model.get_sentence_embedding_dimension(),
        "hybrid (vector+FTS)" if fts_ok else "vector-only",
    )

    yield  # -------- app is serving --------

    executor.shutdown(wait=False)
    logger.info("Shutdown complete.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="CPV Code Search (RAG)",
    version="1.0.0",
    description="Semantic search over ~9 000 Common Procurement Vocabulary codes.",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server (and any localhost origin) to call us
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _encode_query(state: AppState, text: str) -> list[float]:
    """Blocking call — always run in executor."""
    vec = state.model.encode(text, normalize_embeddings=True)
    return vec.tolist()


# ---------------------------------------------------------------------------
# Hybrid search helpers
# ---------------------------------------------------------------------------
def _vector_only(
    results,  # pyarrow.Table
    limit: int,
) -> list[CPVMatch]:
    """Extract matches from a pure vector search result."""
    return [
        CPVMatch(
            cpv_code=results.column("cpv_code")[i].as_py(),
            description=results.column("description")[i].as_py(),
            score=round(1 - results.column("_distance")[i].as_py(), 4),
        )
        for i in range(min(results.num_rows, limit))
    ]


def _rrf_merge(
    vec_results,   # pyarrow.Table — sorted by ascending _distance
    fts_results,   # pyarrow.Table — sorted by descending BM25 _score
    limit: int,
) -> list[CPVMatch]:
    """Reciprocal Rank Fusion: combine vector + FTS rankings."""
    scores: dict[str, float] = {}
    meta: dict[str, str] = {}  # cpv_code → description

    for rank in range(vec_results.num_rows):
        code = vec_results.column("cpv_code")[rank].as_py()
        meta.setdefault(code, vec_results.column("description")[rank].as_py())
        scores[code] = scores.get(code, 0.0) + 1.0 / (RRF_K + rank + 1)

    for rank in range(fts_results.num_rows):
        code = fts_results.column("cpv_code")[rank].as_py()
        meta.setdefault(code, fts_results.column("description")[rank].as_py())
        scores[code] = scores.get(code, 0.0) + 1.0 / (RRF_K + rank + 1)

    ranked = sorted(scores, key=lambda c: scores[c], reverse=True)[:limit]

    if not ranked:
        return []

    max_score = scores[ranked[0]]
    return [
        CPVMatch(
            cpv_code=code,
            description=meta[code],
            score=round(scores[code] / max_score, 4),
        )
        for code in ranked
    ]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get(
    "/search",
    response_model=SearchResponse,
    summary="Semantic CPV search",
    description="Hybrid search (vector + full-text) over CPV codes with RRF ranking.",
)
async def search(
    q: str = Query(..., min_length=1, max_length=512, description="Search phrase (PL or EN)"),
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT, description="Max results"),
) -> SearchResponse:
    state: AppState = app.state.resources
    loop = asyncio.get_running_loop()

    fetch_limit = min(limit * FETCH_MULTIPLIER, MAX_LIMIT * FETCH_MULTIPLIER)

    # 1. Vector search (always)
    query_vec: list[float] = await loop.run_in_executor(
        state.executor,
        _encode_query,
        state,
        q,
    )
    vec_results = (
        state.table.search(query_vec)
        .metric("cosine")
        .limit(fetch_limit)
        .to_arrow()
    )

    # 2. FTS search (if available)
    fts_results = None
    if state.fts_available:
        try:
            fts_results = (
                state.table.search(q, query_type="fts")
                .limit(fetch_limit)
                .to_arrow()
            )
        except Exception as exc:
            logger.debug("FTS search failed for query '%s': %s", q, exc)

    # 3. Merge with RRF or fall back to vector-only
    if fts_results is not None and fts_results.num_rows > 0:
        matches = _rrf_merge(vec_results, fts_results, limit)
    else:
        matches = _vector_only(vec_results, limit)

    return SearchResponse(query=q, count=len(matches), results=matches)


@app.get("/health", response_model=HealthResponse, summary="Health check")
async def health() -> HealthResponse:
    state: AppState = app.state.resources
    return HealthResponse(
        table_rows=state.table.count_rows(),
        model_name=MODEL_NAME,
        search_mode="hybrid (vector+FTS)" if state.fts_available else "vector-only",
    )
