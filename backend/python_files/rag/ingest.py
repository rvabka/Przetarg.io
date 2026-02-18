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

from schema import CPV_SCHEMA, EMBEDDING_DIM, MODEL_NAME, TABLE_NAME

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


# ---------------------------------------------------------------------------
# CPV hierarchy enrichment
# ---------------------------------------------------------------------------
def _build_code_lookup(raw: list[dict[str, str]]) -> dict[str, str]:
    """Map 8-digit base code (no check digit) → description."""
    return {item["code"].split("-")[0]: item["description"] for item in raw}


def _enrich_description(
    code: str,
    description: str,
    lookup: dict[str, str],
) -> str:
    """Append ancestor category names AFTER the leaf description.

    Leaf-first ordering ensures the model gives highest weight to the
    specific item, while ancestors provide supporting context.

    Example for 45262690 ("Remont starych budynków"):
        "Remont starych budynków (Roboty wykończeniowe, [...] | Roboty budowlane)"
    """
    base = code.split("-")[0]  # e.g. "45262690"
    ancestors: list[str] = []

    for sig_digits in range(2, len(base)):
        parent_base = base[:sig_digits] + "0" * (8 - sig_digits)
        if parent_base != base and parent_base in lookup:
            ancestors.append(lookup[parent_base])

    if ancestors:
        # Reverse: most specific ancestor first, broadest last
        ancestors.reverse()
        return description + " (" + " | ".join(ancestors) + ")"
    return description


def enrich_descriptions(
    raw: list[dict[str, str]],
) -> list[str]:
    """Return enriched description for every record (same order as *raw*)."""
    lookup = _build_code_lookup(raw)
    enriched = [
        _enrich_description(item["code"], item["description"], lookup)
        for item in raw
    ]
    n_enriched = sum(1 for e, r in zip(enriched, raw) if e != r["description"])
    print(f"[INFO]  Enriched {n_enriched:,}/{len(raw):,} descriptions with ancestors.")
    return enriched


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

    # 2. Enrich descriptions with parent-category context
    enriched = enrich_descriptions(raw)

    # 3. Load model & encode ENRICHED descriptions (better embeddings)
    print(f"[INFO]  Loading model: {MODEL_NAME} …")
    model = SentenceTransformer(MODEL_NAME)
    assert model.get_sentence_embedding_dimension() == EMBEDDING_DIM, (
        f"Model dim mismatch: expected {EMBEDDING_DIM}, "
        f"got {model.get_sentence_embedding_dimension()}"
    )
    vectors = encode_descriptions(model, enriched)

    # 4. Write to LanceDB (overwrite if exists)
    print(f"[INFO]  Writing LanceDB table '{TABLE_NAME}' to {db_path} …")
    db = lancedb.connect(db_path)
    tbl = db.create_table(
        TABLE_NAME,
        data=build_records(raw, vectors),
        schema=CPV_SCHEMA,
        mode="overwrite",
    )
    print(f"[INFO]  Table rows: {tbl.count_rows():,}")

    # 5. Create FTS index for hybrid search
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
