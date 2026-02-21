import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://przetargi_user:przetargi_password@localhost:5433/przetargi_db"
)
