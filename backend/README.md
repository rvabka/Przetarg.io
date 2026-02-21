# Przetarg.io Backend

## struktura katalogów

- services/ingestion - moduły odpowiedzialne za pobieranie danych z różnych źródeł (docelowo działające jako mikroserwisy)
- services/ai - moduły odpowiedzialne za analizę danych i przetwarzanie przez AI
- services/api - API

- db - schematy baz danych, katalog alembica, tam żeby były tworzone migracje
- shared - współdzielony kod, np. modele danych, które są używane w wielu miejscach

## instalacja shared

aby zainstalować shared w venv'ie w trybie edytowalnym, należy wykonać komendę:

```bash
pip install -e ./shared
```

shared jest zrobione po to żeby modele między mikroserwisami były wspólne. Wrzucamy tam modele, które są używane w wielu miejscach.


## tworzenie nowej migracji

aby utworzyć nową migrację, należy wykonać komendę:

```bash
cd db
alembic revision --autogenerate -m "nazwa migracji"
```

## wdrażanie migracji

aby wdrożyć migracje, należy wykonać komendę:

```bash
cd db
alembic upgrade head
```

## cofanie migracji

aby cofnąć migracje, należy wykonać komendę:

```bash
cd db
alembic downgrade -1
```