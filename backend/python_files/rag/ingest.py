"""
One-shot ingestion script — loads CPV codes from JSON, encodes them with
``paraphrase-multilingual-MiniLM-L12-v2``, and writes a LanceDB table.

Usage
-----
    python ingest.py                          # defaults: cpv-2008.json -> ./lancedb
    python ingest.py --input data.json --db ./my_db
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Any

import lancedb
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

from schema import CPVRecord, EMBEDDING_DIM, MODEL_NAME, TABLE_NAME

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
DEFAULT_INPUT: str = "cpv-2008.json"
DEFAULT_DB_PATH: str = "./lancedb"
BATCH_SIZE: int = 512  # encode in chunks to keep peak RAM low


def load_cpv_data(path: Path) -> list[dict[str, str]]:
    """Read the JSON file and return a list of ``{code, description}`` dicts."""
    with path.open(encoding="utf-8") as fh:
        data: list[dict[str, str]] = json.load(fh)
    if not data:
        sys.exit(f"[ERROR] No records found in {path}")
    print(f"[INFO]  Loaded {len(data):,} CPV records from {path}")
    return data


def encode_descriptions(
    model: SentenceTransformer,
    descriptions: list[str],
    batch_size: int = BATCH_SIZE,
) -> list[list[float]]:
    """Encode descriptions in batches with a progress bar."""
    all_vectors: list[list[float]] = []
    for i in tqdm(range(0, len(descriptions), batch_size), desc="Encoding"):
        batch = descriptions[i : i + batch_size]
        vecs = model.encode(batch, show_progress_bar=False, normalize_embeddings=True)
        all_vectors.extend(vecs.tolist())
    return all_vectors


def build_records(
    raw: list[dict[str, str]],
    vectors: list[list[float]],
) -> list[dict[str, Any]]:
    """Merge raw data with vectors into LanceDB-ready dicts."""
    records: list[dict[str, Any]] = []
    for item, vec in zip(raw, vectors, strict=True):
        records.append(
            {
                "vector": vec,
                "cpv_code": item["code"],
                "description": item["description"],
            }
        )
    return records


def ingest(input_path: Path, db_path: str) -> None:
    """End-to-end ingestion pipeline."""
    t0 = time.perf_counter()

    # 1. Load raw data
    raw = load_cpv_data(input_path)
    descriptions = [r["description"] for r in raw]

    # 2. Load model & encode
    print(f"[INFO]  Loading model: {MODEL_NAME} …")
    model = SentenceTransformer(MODEL_NAME)
    assert model.get_sentence_embedding_dimension() == EMBEDDING_DIM, (
        f"Model dim mismatch: expected {EMBEDDING_DIM}, "
        f"got {model.get_sentence_embedding_dimension()}"
    )
    vectors = encode_descriptions(model, descriptions)

    # 3. Write to LanceDB (overwrite if exists)
    print(f"[INFO]  Writing LanceDB table '{TABLE_NAME}' to {db_path} …")
    db = lancedb.connect(db_path)
    tbl = db.create_table(
        TABLE_NAME,
        data=build_records(raw, vectors),
        schema=CPVRecord.to_arrow_schema(),
        mode="overwrite",
    )
    print(f"[INFO]  Table rows: {tbl.count_rows():,}")

    elapsed = time.perf_counter() - t0
    print(f"[DONE]  Ingestion finished in {elapsed:.1f}s")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ingest CPV codes into LanceDB")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path(DEFAULT_INPUT),
        help=f"Path to the CPV JSON file (default: {DEFAULT_INPUT})",
    )
    parser.add_argument(
        "--db",
        type=str,
        default=DEFAULT_DB_PATH,
        help=f"LanceDB directory (default: {DEFAULT_DB_PATH})",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    ingest(args.input, args.db)
