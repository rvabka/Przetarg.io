FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the shared package first
COPY shared /app/shared
RUN pip install -e /app/shared

# Copy the ai services (they are imported as services.ai)
COPY services/ai /app/services/ai

# Copy requirements and install
COPY services/ingestion/ezamowienia/requirements.txt .
RUN pip install -r requirements.txt

# Copy the worker source
COPY services/ingestion/ezamowienia/src /app/services/ingestion/ezamowienia/src

# Set PYTHONPATH to include /app so imports like 'shared.*' and 'services.*' work
ENV PYTHONPATH=/app

# Create storage directory
RUN mkdir -p /app/storage/attachments

# Run the worker
CMD ["python", "services/ingestion/ezamowienia/src/main.py"]
