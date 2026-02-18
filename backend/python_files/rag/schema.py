"""
Shared LanceDB / PyArrow schema for the CPV-code vector store.

Both ``ingest.py`` (write path) and ``main.py`` (read path) import this
single source of truth so the table layout can never drift between the two.
"""

from __future__ import annotations

import pyarrow as pa

EMBEDDING_DIM: int = 1024
TABLE_NAME: str = "cpv_codes"
MODEL_NAME: str = "sdadas/mmlw-retrieval-roberta-large"

CPV_SCHEMA: pa.Schema = pa.schema(
    [
        pa.field("vector", pa.list_(pa.float32(), EMBEDDING_DIM)),
        pa.field("cpv_code", pa.utf8()),
        pa.field("description", pa.utf8()),
    ]
)
