FROM python:3.11-slim

WORKDIR /app

# Zainstaluj zależności systemowe
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Kopiuj pakiet shared i zainstaluj go
COPY shared /app/shared
RUN pip install -e /app/shared

# Kopiuj wymagania API i zainstaluj
COPY services/api/requirements.txt .
RUN pip install -r requirements.txt

# Kopiuj źródła API
COPY services/api/src /app/services/api/src

# Ustaw PYTHONPATH
ENV PYTHONPATH=/app

# Domyślny port FastAPI to 8000
EXPOSE 8000

# Komenda startowa
CMD ["python", "services/api/src/main.py"]
