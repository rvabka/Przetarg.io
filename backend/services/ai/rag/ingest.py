"""
One-shot ingestion script — loads CPV codes from a tree-structured JSON,
encodes each code's description individually, and writes a LanceDB table.

Usage
-----
    python ingest.py                          # defaults: cpv-2008-tree.json -> ./lancedb
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

from schema import CPV_SCHEMA, EMBEDDING_DIM, MODEL_NAME, TABLE_NAME

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
DEFAULT_INPUT: str = "cpv-2008-tree.json"
DEFAULT_DB_PATH: str = "./lancedb"
BATCH_SIZE: int = 256  # encode in chunks to keep peak RAM low


# ---------------------------------------------------------------------------
# Tree flattening (no enrichment — each code stands alone)
# ---------------------------------------------------------------------------
def _flatten_tree(nodes: list[dict]) -> list[dict[str, str]]:
    """Recursively collect every node as {code, description}."""
    records: list[dict[str, str]] = []
    for node in nodes:
        records.append({
            "code": node["code"],
            "description": node["description"],
        })
        records.extend(_flatten_tree(node.get("children", [])))
    return records


def load_cpv_tree(path: Path) -> list[dict[str, str]]:
    """Load tree JSON and flatten it into a flat list of records."""
    with path.open(encoding="utf-8") as fh:
        tree: list[dict] = json.load(fh)
    if not tree:
        sys.exit(f"[ERROR] No records found in {path}")

    records = _flatten_tree(tree)
    print(f"[INFO]  Loaded {len(records):,} CPV records from {path}")
    return records


# ---------------------------------------------------------------------------
# Encoding
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# Record building
# ---------------------------------------------------------------------------
def build_records(
    flat: list[dict[str, str]],
    vectors: list[list[float]],
) -> list[dict[str, Any]]:
    """Merge flat data with vectors into LanceDB-ready dicts."""
    records: list[dict[str, Any]] = []
    for item, vec in zip(flat, vectors, strict=True):
        records.append({
            "vector": vec,
            "cpv_code": item["code"],
            "description": item["description"],
        })
    return records


# ---------------------------------------------------------------------------
# Ingestion pipeline
# ---------------------------------------------------------------------------
def ingest(input_path: Path, db_path: str) -> None:
    """End-to-end ingestion pipeline."""
    t0 = time.perf_counter()

    # 1. Load and flatten tree
    flat = load_cpv_tree(input_path)

    # 2. Load model & encode each description individually
    print(f"[INFO]  Loading model: {MODEL_NAME} …")
    model = SentenceTransformer(MODEL_NAME)
    actual_dim = model.get_sentence_embedding_dimension()
    assert actual_dim == EMBEDDING_DIM, (
        f"Model dim mismatch: expected {EMBEDDING_DIM}, got {actual_dim}"
    )

    texts = ["passage: " + r["description"] for r in flat]
    vectors = encode_descriptions(model, texts)

    # 3. Write to LanceDB (overwrite if exists)
    print(f"[INFO]  Writing LanceDB table '{TABLE_NAME}' to {db_path} …")
    db = lancedb.connect(db_path)
    tbl = db.create_table(
        TABLE_NAME,
        data=build_records(flat, vectors),
        schema=CPV_SCHEMA,
        mode="overwrite",
    )
    print(f"[INFO]  Table rows: {tbl.count_rows():,}")

    # 4. Create FTS index for hybrid search
    print("[INFO]  Creating FTS index on 'description' …")
    tbl.create_fts_index("description", replace=True)
    print("[INFO]  FTS index created.")

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
        help=f"Path to the CPV tree JSON file (default: {DEFAULT_INPUT})",
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
