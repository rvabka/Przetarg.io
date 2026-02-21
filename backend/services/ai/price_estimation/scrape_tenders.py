"""
Scraper for ezamowienia.gov.pl API - TenderResultNotice
Pobiera wszystkie ogłoszenia o wynikach postępowań i zapisuje do pliku JSONL (streaming).
"""

import httpx
import json
import time
import sys
from pathlib import Path
from datetime import datetime

BASE_URL = "https://ezamowienia.gov.pl/mo-board/api/v1/notice"

DEFAULT_PARAMS = {
    "NoticeType": "TenderResultNotice",
    "PublicationDateFrom": "2001-01-01",
    "PublicationDateTo": "2027-01-01",
    "PageSize": 500,
}

OUTPUT_DIR = Path(__file__).parent / "data"
TIMEOUT = 60  # seconds per request
MAX_RETRIES = 5
RETRY_DELAY = 5  # seconds


def fetch_page(client: httpx.Client, search_after: str | None = None) -> list[dict]:
    """Pobiera pojedynczą stronę wyników z API (kursor: SearchAfter = objectId)."""
    params = {**DEFAULT_PARAMS}
    if search_after:
        params["SearchAfter"] = search_after

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            request = client.build_request("GET", BASE_URL, params=params)
            print(f"  [→] {request.url}")
            response = client.send(request)
            response.raise_for_status()
            return response.json()
        except (httpx.HTTPStatusError, httpx.RequestError, httpx.TimeoutException) as e:
            print(f"  [!] Błąd (cursor={search_after}), próba {attempt}/{MAX_RETRIES}: {e}")
            if attempt < MAX_RETRIES:
                wait = RETRY_DELAY * attempt
                print(f"  [~] Ponawiam za {wait}s...")
                time.sleep(wait)
            else:
                print(f"  [X] Nie udało się pobrać strony po {MAX_RETRIES} próbach.")
                raise


def scrape_all_notices(output_file: Path) -> int:
    """Pobiera wszystkie strony wyników i streamuje je do pliku JSONL."""
    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Sprawdź czy istnieje plik postępu (resume)
    progress_file = output_file.with_suffix(".progress")
    search_after: str | None = None
    total_records = 0
    page = 0

    # Resume: wczytaj ostatni kursor jeśli plik istnieje
    if progress_file.exists() and output_file.exists():
        progress = json.loads(progress_file.read_text(encoding="utf-8"))
        search_after = progress.get("search_after")
        total_records = progress.get("total_records", 0)
        page = progress.get("page", 0)
        print(f"[↻] Wznawiam od strony {page + 1}, rekord {total_records}, cursor={search_after}")
        mode = "a"  # dopisuj do istniejącego pliku
    else:
        mode = "w"

    with (
        open(output_file, mode, encoding="utf-8") as f,
        httpx.Client(
            headers={"Accept": "application/json"},
            timeout=TIMEOUT,
            follow_redirects=True,
        ) as client,
    ):
        while True:
            page += 1
            print(f"[>] Pobieram stronę {page} (dotychczas: {total_records} rekordów)...")

            try:
                records = fetch_page(client, search_after)
            except Exception:
                print(f"[!] Przerywam pobieranie po błędzie na stronie {page}.")
                break

            if not records:
                print(f"[✓] Strona {page} pusta — koniec danych.")
                break

            # Zapisz każdy rekord jako osobną linię (JSONL)
            for record in records:
                f.write(json.dumps(record, ensure_ascii=False))
                f.write("\n")
            f.flush()  # wymuszamy zapis na dysk

            total_records += len(records)
            print(f"  [+] Pobrano {len(records)} rekordów (łącznie: {total_records})")

            # Kursor do następnej strony = objectId ostatniego rekordu
            search_after = records[-1].get("objectId")
            if not search_after:
                print("[!] Brak objectId w ostatnim rekordzie — nie można kontynuować paginacji.")
                break

            # Zapisz postęp (do resume po crashu)
            progress_file.write_text(
                json.dumps(
                    {"search_after": search_after, "total_records": total_records, "page": page},
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )

            # Jeśli dostaliśmy mniej niż PageSize, to ostatnia strona
            if len(records) < DEFAULT_PARAMS["PageSize"]:
                print("[✓] Ostatnia strona — pobrano wszystkie dane.")
                break

            time.sleep(1)  # rate limiting

    # Usuń plik postępu po zakończeniu
    if progress_file.exists():
        progress_file.unlink()

    return total_records


def main():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = OUTPUT_DIR / f"tender_results_{timestamp}.jsonl"

    print("=" * 60)
    print("  eZamówienia.gov.pl — Scraper TenderResultNotice")
    print("=" * 60)
    print(f"  URL bazowy: {BASE_URL}")
    print(f"  Plik wyjściowy: {output_file}")
    print(f"  Format: JSONL (1 rekord = 1 linia)")
    print(f"  PageSize: {DEFAULT_PARAMS['PageSize']}")
    print(f"  Zakres dat: {DEFAULT_PARAMS['PublicationDateFrom']} — {DEFAULT_PARAMS['PublicationDateTo']}")
    print("=" * 60)
    print()

    start = time.time()
    total = scrape_all_notices(output_file)
    elapsed = time.time() - start

    if total > 0:
        # Symlink/kopia do "latest" dla łatwego dostępu
        latest_file = OUTPUT_DIR / "tender_results_latest.jsonl"
        if latest_file.exists():
            latest_file.unlink()
        import shutil
        shutil.copy2(output_file, latest_file)
        print(f"\n[✓] Kopia → {latest_file}")
    else:
        print("\n[!] Nie pobrano żadnych rekordów.")
        sys.exit(1)

    print(f"\n[i] Czas wykonania: {elapsed:.1f}s")
    print(f"[i] Łącznie rekordów: {total}")
    size_mb = output_file.stat().st_size / (1024 * 1024)
    print(f"[i] Rozmiar pliku: {size_mb:.1f} MB")


if __name__ == "__main__":
    main()
