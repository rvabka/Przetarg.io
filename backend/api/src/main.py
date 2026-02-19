import sys
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from fastapi import FastAPI, Request
import uvicorn
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Dodajemy katalog główny projektu do PYTHONPATH, aby importy 'src.*' działały
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.ingestion.services.ezamowienia.worker import EzamowieniaWorker
from src.services.search_service import SearchService
from src.db.session import SessionLocal
from src.db.models import Tender, Notice, Attachment

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing application...")

    scheduler = AsyncIOScheduler()
    worker = EzamowieniaWorker()

    # zapisujemy worker w stanie aplikacji
    app.state.ezamowienia_worker = worker
    app.state.scheduler = scheduler

    # Job cykliczny (co 15 minut)
    scheduler.add_job(
        worker.run,
        trigger="interval",
        minutes=15,
        id="ezamowienia_interval_job",
        replace_existing=True,
    )

    # Job startowy (po 3 sekundach od startu)
    scheduler.add_job(
        worker.run,
        trigger="date",
        run_date=datetime.now() + timedelta(seconds=3),
        id="ezamowienia_initial_job",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started.")

    yield

    logger.info("Shutting down scheduler...")
    scheduler.shutdown()


app = FastAPI(lifespan=lifespan)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure static directory exists
# Use absolute path relative to this file
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(current_dir, "static")
os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def read_index():
    return FileResponse(os.path.join(static_dir, 'search.html'))


# --- ROUTES ---

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/tenders")
def get_tenders():
    with SessionLocal() as db:
        tenders = db.query(Tender).limit(100).all()
        return tenders


@app.get("/notices")
def get_notices():
    with SessionLocal() as db:
        notices = db.query(Notice).limit(100).all()
        return notices


@app.get("/stats")
def stats():
    with SessionLocal() as db:
        total_tenders = db.query(Tender).count()
        total_notices = db.query(Notice).count()
        total_documents = db.query(Attachment).count()

    return {
        "tenders": total_tenders,
        "notices": total_notices,
        "documents": total_documents,
    }


@app.get("/search")
async def search_tenders(q: str, limit: int = 10, threshold: int = 60):
    # Threshold in UI is 0-100%, we convert to cosine distance threshold (0.0-1.0)
    # Higher percentage = Lower distance
    # Match > 60% => Distance < 0.4
    # similarity = 1 - distance
    # distance = 1 - similarity
    
    sim_threshold = threshold / 100.0
    dist_threshold = 1.0 - sim_threshold
    
    with SessionLocal() as db:
        service = SearchService(db)
        results = await service.search_tenders(q, limit=limit, threshold=dist_threshold)
        
        # Serialize results
        serialized = []
        for item in results:
            tender = item["tender"]
            serialized.append({
                "tender_id": tender.id,
                "external_id": tender.external_id,
                "title": tender.title,
                "status": tender.status,
                "score": item["score"],
                "matches": item["matches"]
            })
            
    return serialized

from pydantic import BaseModel

class SmartSearchRequest(BaseModel):
    user_profile: str
    limit: int = 10

@app.post("/search/smart")
async def smart_search_tenders(req: SmartSearchRequest):
    with SessionLocal() as db:
        service = SearchService(db)
        results = await service.smart_search(req.user_profile, limit=req.limit)
        
        # Serialize results
        serialized = []
        for item in results:
            tender = item["tender"]
            serialized.append({
                "tender_id": tender.id,
                "external_id": tender.external_id,
                "title": tender.title,
                "status": tender.status,
                "score": item["score"],
                "smart_reason": item.get("smart_reason", ""),
                "matches": item["matches"]
            })
            
    return serialized


if __name__ == "__main__":
    uvicorn.run(
        app,  # Przekazujemy obiekt app, a nie string, gdy uruchamiamy bezpośrednio
        host="0.0.0.0",
        port=8000,
    )
