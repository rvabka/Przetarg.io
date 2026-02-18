"""
Async FastAPI server – semantic search over CPV codes.
"""

from __future__ import annotations

import asyncio
import logging
import numpy as np
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
THREAD_POOL_WORKERS: int = 4
FETCH_MULTIPLIER: int = 5
MIN_SIMILARITY: float = 0.3

logger = logging.getLogger("uvicorn.error")


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------
class CPVMatch(BaseModel):
    cpv_code: str = Field(..., examples=["45000000-7"])
    description: str = Field(..., examples=["Construction work"])
    score: float = Field(..., examples=[0.82])


class SearchResponse(BaseModel):
    query: str
    count: int
    results: list[CPVMatch]


class HealthResponse(BaseModel):
    status: str = "ok"
    table_rows: int
    model_name: str
    search_mode: str = "hybrid"


# ---------------------------------------------------------------------------
# Application state
# ---------------------------------------------------------------------------
@dataclass
class AppState:
    model: SentenceTransformer
    table: lancedb.table.Table  # type: ignore[name-defined]
    executor: ThreadPoolExecutor
    fts_available: bool = False


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    logger.info("Loading embedding model: %s …", MODEL_NAME)
    model = SentenceTransformer(MODEL_NAME)

    logger.info("Opening LanceDB table '%s' from %s …", TABLE_NAME, DB_PATH)
    db = lancedb.connect(DB_PATH)
    table = db.open_table(TABLE_NAME)

    executor = ThreadPoolExecutor(
        max_workers=THREAD_POOL_WORKERS,
        thread_name_prefix="embed",
    )

    fts_ok = False
    try:
        table.create_fts_index("description", replace=True)
        fts_ok = True
        logger.info("FTS index ready on 'description' column.")
    except Exception as exc:
        logger.warning("Could not create FTS index (vector-only mode): %s", exc)

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

    yield
    executor.shutdown(wait=False)
    logger.info("Shutdown complete.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="CPV Code Search (RAG)",
    version="1.0.0",
    lifespan=lifespan,
)

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
    vec = state.model.encode("query: " + text, normalize_embeddings=True)
    return vec.tolist()


def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two vectors. Assumes both are normalized."""
    return float(np.dot(a, b))


# ---------------------------------------------------------------------------
# Query preprocessing for long texts
# ---------------------------------------------------------------------------
import re

# Polish stop words — common words that add noise to keyword search
_STOP_WORDS: set[str] = {
    "i", "w", "z", "na", "do", "od", "o", "się", "jest", "to",
    "że", "co", "jak", "za", "po", "ale", "tak", "lub", "oraz", "też",
    "czy", "dla", "przez", "ze", "już", "jego", "jej", "ich", "tego",
    "tej", "ten", "ta", "te", "być", "został", "została", "zostało",
    "będzie", "może", "nr", "poz", "dnia", "roku", "sp", "ul",
    "zgodnie", "ramach", "które", "który", "która", "których",
    "przedmiotem", "zamówienia", "zamawiający", "wykonawca",
    "zamówienie", "publiczne", "postępowania", "umowy", "umowa",
    "załącznik", "formularz", "warunkach", "warunków", "określonych",
    "szczegółowo", "stanowiącym", "wskazany", "wskazanych",
    "przepisami", "ustawy", "rozporządzeniu", "sprawie",
}

_SHORT_QUERY_THRESHOLD = 200  # chars — below this, use query as-is


def _prepare_query(raw_query: str) -> tuple[str, str]:
    """Prepare a long query for search.

    Returns (vector_query, fts_query):
      - vector_query: first sentence / meaningful chunk for embedding
      - fts_query: unique keywords from full text for FTS
    """
    q = raw_query.strip()

    if len(q) <= _SHORT_QUERY_THRESHOLD:
        return q, q

    # --- Vector query: extract first meaningful sentence ---
    # Polish procurement pattern: "Przedmiotem zamówienia jest ..."
    # Numbered sections like "2.", "3." mark boundaries
    first_sentence = re.split(r'(?<=[.!?])\s*(?:\d+[\.\)]|\n)', q)[0].strip()
    # Cap at ~500 chars for the embedding model
    vec_query = first_sentence[:500]

    # --- FTS query: extract keywords from full text ---
    words = re.findall(r'[a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ]{3,}', q.lower())
    keywords = [w for w in words if w not in _STOP_WORDS]
    # Deduplicate, keep order
    seen: set[str] = set()
    unique: list[str] = []
    for w in keywords:
        if w not in seen:
            seen.add(w)
            unique.append(w)
    fts_query = " ".join(unique[:30])  # top 30 unique keywords

    return vec_query, fts_query


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=1, max_length=10000),
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
) -> SearchResponse:
    state: AppState = app.state.resources
    loop = asyncio.get_running_loop()
    fetch_n = limit * FETCH_MULTIPLIER

    # Preprocess query — split into optimised vector/FTS parts
    vec_query, fts_query = _prepare_query(q)

    # 1. Encode the semantic part for vector search
    query_vec: list[float] = await loop.run_in_executor(
        state.executor, _encode_query, state, vec_query,
    )
    query_np = np.array(query_vec, dtype=np.float32)

    # 2. Vector search — get candidates
    vec_results = (
        state.table.search(query_vec)
        .metric("cosine")
        .limit(fetch_n)
        .to_arrow()
    )

    # 3. FTS search — use extracted keywords
    fts_results = None
    if state.fts_available:
        try:
            fts_results = (
                state.table.search(fts_query, query_type="fts")
                .limit(fetch_n)
                .to_arrow()
            )
        except Exception as exc:
            logger.debug("FTS failed for '%s': %s", fts_query, exc)

    # 4. Collect ALL unique candidates from both sources
    candidates: dict[str, dict] = {}
    fts_codes: set[str] = set()

    for i in range(vec_results.num_rows):
        code = vec_results.column("cpv_code")[i].as_py()
        if code not in candidates:
            candidates[code] = {
                "description": vec_results.column("description")[i].as_py(),
                "vector": vec_results.column("vector")[i].as_py(),
            }

    if fts_results is not None:
        for i in range(fts_results.num_rows):
            code = fts_results.column("cpv_code")[i].as_py()
            fts_codes.add(code)
            if code not in candidates:
                candidates[code] = {
                    "description": fts_results.column("description")[i].as_py(),
                    "vector": fts_results.column("vector")[i].as_py(),
                }

    # 5. Score: FTS match = cosine + bonus, vector-only = cosine alone
    #    FTS finds keyword matches (very precise), vector finds semantic
    #    matches (noisy on short texts). FTS should dominate when it hits.
    FTS_BONUS = 0.1

    results: list[CPVMatch] = []
    for code, data in candidates.items():
        doc_np = np.array(data["vector"], dtype=np.float32)
        sim = _cosine_sim(query_np, doc_np)

        # Boost FTS hits — keyword match on short text is a strong signal
        final_score = sim + FTS_BONUS if code in fts_codes else sim

        if sim >= MIN_SIMILARITY:
            results.append(
                CPVMatch(
                    cpv_code=code,
                    description=data["description"],
                    score=round(min(final_score, 1.0), 4),
                )
            )

    # 6. Sort by real similarity
    results.sort(key=lambda m: m.score, reverse=True)
    results = results[:limit]

    return SearchResponse(query=q, count=len(results), results=results)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    state: AppState = app.state.resources
    return HealthResponse(
        table_rows=state.table.count_rows(),
        model_name=MODEL_NAME,
        search_mode="hybrid (vector+FTS)" if state.fts_available else "vector-only",
    )