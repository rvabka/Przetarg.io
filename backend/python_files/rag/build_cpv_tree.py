"""
Buduje drzewo CPV z płaskiej listy kodów.

Logika hierarchii CPV:
  - Kod CPV ma format XXXXXXXX-Y (8 cyfr + cyfra kontrolna)
  - Im więcej zer na końcu 8-cyfrowej części, tym wyższy poziom:
      03000000 → dywizja   (poziom 2 znaczących cyfr)
      03100000 → grupa     (poziom 3)
      03110000 → klasa     (poziom 4)
      03111000 → kategoria (poziom 5)
      03111100 → podkat.   (poziom 6)
      03111110 → ...       (poziom 7)
      03111111 → liść      (poziom 8)
  - Rodzic danego kodu to najbliższy kod wyżej w hierarchii,
    który jest jego prefiksem (po odcięciu zer).

Użycie:
    python build_cpv_tree.py
    → zapisuje cpv-2008-tree.json
"""

import json
from pathlib import Path


def get_level(code: str) -> int:
    """Ile znaczących cyfr ma kod (bez zer końcowych, min 2)."""
    digits = code.split("-")[0]  # '03111100' (8 znaków)
    # Odcinamy zera od końca, ale minimum 2 cyfry (dywizja)
    stripped = digits.rstrip("0") or digits[:2]
    return len(stripped)


def find_parent_key(digits: str, level: int, index: dict) -> str | None:
    """Szuka najbliższego rodzica w drzewie (o 1 poziom wyżej, potem 2, itd.)."""
    for parent_level in range(level - 1, 1, -1):
        # Weź pierwsze parent_level cyfr, dopełnij zerami do 8
        parent_digits = digits[:parent_level].ljust(8, "0")
        if parent_digits in index:
            return parent_digits
    return None


def build_tree(flat_codes: list[dict]) -> list[dict]:
    # Indeks: digits (8 znaków) → node
    index: dict[str, dict] = {}
    roots: list[dict] = []

    # Sortujemy po kodzie żeby rodzice byli przed dziećmi
    flat_codes.sort(key=lambda c: c["code"])

    for entry in flat_codes:
        code = entry["code"]          # '03111100-3'
        desc = entry["description"]
        digits = code.split("-")[0]    # '03111100'
        level = get_level(code)

        node = {
            "code": code,
            "description": desc,
            "children": [],
        }

        parent_key = find_parent_key(digits, level, index)

        if parent_key is not None:
            index[parent_key]["children"].append(node)
        else:
            roots.append(node)

        index[digits] = node

    return roots


def main():
    src = Path(__file__).parent / "cpv-2008.json"
    dst = Path(__file__).parent / "cpv-2008-tree.json"

    with open(src, encoding="utf-8") as f:
        flat = json.load(f)

    tree = build_tree(flat)

    with open(dst, "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)

    # Statystyki
    total = len(flat)
    root_count = len(tree)
    print(f"Załadowano {total} kodów CPV")
    print(f"Drzew korzeniowych: {root_count}")
    print(f"Zapisano → {dst}")


if __name__ == "__main__":
    main()
