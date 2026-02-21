# Ten plik jest proxy do shared.database, aby zachować wsteczną kompatybilność
from shared.database import SessionLocal, get_db, engine