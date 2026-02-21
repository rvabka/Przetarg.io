"""
Stream-filter a large JSONL file (~12 GB), keeping only the required fields.

Usage:
    python filter_jsonl.py input.jsonl output.jsonl
    python filter_jsonl.py input.jsonl  # writes to input_filtered.jsonl
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

KEEP_FIELDS: set[str] = {
    "orderObject",
    "cpvCode",
    "publicationDate",
    "organizationName",
    "organizationCity",
    "organizationCountry",
    "tenderId",
    "contractors",
    "htmlBody",
    "objectId",
    "orderType",
    "procedureResult",
}


def filter_line(raw: str) -> str | None:
    """Parse one JSONL line, keep only KEEP_FIELDS, return as JSON string."""
    raw = raw.strip()
    if not raw:
        return None
    obj = json.loads(raw)
    filtered = {k: v for k, v in obj.items() if k in KEEP_FIELDS}
    return json.dumps(filtered, ensure_ascii=False)


def run(src: Path, dst: Path) -> None:
    total_bytes = src.stat().st_size
    processed = 0
    written = 0
    errors = 0
    last_pct = -1

    with open(src, "r", encoding="utf-8") as fin, \
         open(dst, "w", encoding="utf-8") as fout:

        for line_no, line in enumerate(fin, 1):
            processed += len(line.encode("utf-8"))

            try:
                result = filter_line(line)
            except json.JSONDecodeError as exc:
                errors += 1
                if errors <= 10:
                    print(f"  [WARN] line {line_no}: {exc}", file=sys.stderr)
                continue

            if result is not None:
                fout.write(result + "\n")
                written += 1

            # progress every 1%
            pct = int(processed * 100 / total_bytes)
            if pct > last_pct:
                last_pct = pct
                print(
                    f"\r  [{pct:3d}%]  {processed / 1e9:.2f} / {total_bytes / 1e9:.2f} GB  |  "
                    f"{written:,} records written  |  {errors} errors",
                    end="",
                    flush=True,
                )

    print()
    print(f"[DONE] {written:,} records → {dst}")
    if errors:
        print(f"[WARN] {errors} lines skipped (parse errors)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Filter large JSONL — keep only selected fields")
    parser.add_argument("input", type=Path, help="Source JSONL file")
    parser.add_argument("output", type=Path, nargs="?", default=None, help="Destination (default: <input>_filtered.jsonl)")
    args = parser.parse_args()

    if not args.input.exists():
        sys.exit(f"[ERROR] File not found: {args.input}")

    dst = args.output or args.input.with_stem(args.input.stem + "_filtered")
    print(f"[INFO] {args.input}  →  {dst}")
    print(f"[INFO] Keeping fields: {', '.join(sorted(KEEP_FIELDS))}")
    run(args.input, dst)


if __name__ == "__main__":
    main()
