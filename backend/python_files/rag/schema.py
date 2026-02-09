"""
Shared LanceDB / Pydantic schema for the CPV-code vector store.

Both ``ingest.py`` (write path) and ``main.py`` (read path) import this
single source of truth so the table layout can never drift between the two.
"""

from __future__ import annotations

from lancedb.pydantic import LanceModel, Vector


EMBEDDING_DIM: int = 384
TABLE_NAME: str = "cpv_codes"
MODEL_NAME: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


class CPVRecord(LanceModel):
    """One row in the ``cpv_codes`` LanceDB table.

    Attributes
    ----------
    vector : Vector(384)
        Dense embedding produced by *paraphrase-multilingual-MiniLM-L12-v2*.
    cpv_code : str
        Official CPV code, e.g. ``"45000000-7"``.
    description : str
        Human-readable description in the original language (Polish).
    """

    vector: Vector(EMBEDDING_DIM)  # type: ignore[valid-type]
    cpv_code: str
    description: str
