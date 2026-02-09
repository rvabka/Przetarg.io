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
        description="Cosine similarity (higher = better match)",
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


# ---------------------------------------------------------------------------
# Application state (loaded once at startup)
# ---------------------------------------------------------------------------
@dataclass
class AppState:
    model: SentenceTransformer
    table: lancedb.table.Table  # type: ignore[name-defined]
    executor: ThreadPoolExecutor


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

    # Store on app so route handlers can access it.
    _app.state.resources = AppState(
        model=model,
        table=table,
        executor=executor,
    )

    logger.info(
        "Ready — %s rows in table, model dim=%s",
        table.count_rows(),
        model.get_sentence_embedding_dimension(),
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


def _encode_query(state: AppState, text: str) -> list[float]:
    """Blocking call — always run in executor."""
    vec = state.model.encode(text, normalize_embeddings=True)
    return vec.tolist()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get(
    "/search",
    response_model=SearchResponse,
    summary="Semantic CPV search",
    description="Returns the top-K CPV codes most similar to the query.",
)
async def search(
    q: str = Query(..., min_length=1, max_length=512, description="Search phrase (PL or EN)"),
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT, description="Max results"),
) -> SearchResponse:
    state: AppState = app.state.resources
    loop = asyncio.get_running_loop()

    # Run blocking encode in a thread so we don't stall the event loop.
    query_vec: list[float] = await loop.run_in_executor(
        state.executor,
        _encode_query,
        state,
        q,
    )

    # LanceDB search (also CPU-bound but very fast on ~9k rows).
    # Use .to_arrow() instead of .to_pandas() — zero extra dependencies.
    results = (
        state.table.search(query_vec)
        .metric("cosine")
        .limit(limit)
        .to_arrow()
    )

    matches: list[CPVMatch] = [
        CPVMatch(
            cpv_code=results.column("cpv_code")[i].as_py(),
            description=results.column("description")[i].as_py(),
            score=round(1 - results.column("_distance")[i].as_py(), 4),
        )
        for i in range(results.num_rows)
    ]

    return SearchResponse(query=q, count=len(matches), results=matches)


@app.get("/health", response_model=HealthResponse, summary="Health check")
async def health() -> HealthResponse:
    state: AppState = app.state.resources
    return HealthResponse(
        table_rows=state.table.count_rows(),
        model_name=MODEL_NAME,
    )
