import sys
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
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

@app.get("/config")
def get_config():
    return {"environment": os.environ.get("ENVIRONMENT", "PRODUCTION")}


from supabase import create_client

# --- SETUP AUTH ---
security = HTTPBearer(auto_error=False)

class MockUser:
    def __init__(self):
        self.id = "local-dev"
        self.email = "local@dev.environment"

def get_supabase_client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY")
    if not url or not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase credentials (SUPABASE_URL or SUPABASE_ANON_KEY) are missing in environment variables."
        )
    return create_client(url, key)

def verify_supabase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    env = os.environ.get("ENVIRONMENT", "PRODUCTION")
    if env == "LOCAL":
        return MockUser()
        
    if not credentials:
        raise HTTPException(status_code=401, detail="Brak autoryzacji (Missing Authentication Token)")
        
    token = credentials.credentials
    try:
        supabase = get_supabase_client()
        logger.info(f"Otrzymano żądanie uwierzytelnienia. Weryfikacja przez klienta Supabase, token: {token[:15]}...")
        # Weryfikacja autentyczności tokenu wprost w usługach Gotrue Supabase
        user_response = supabase.auth.get_user(token)
        
        if user_response and user_response.user:
            logger.info(f"Autoryzacja pomyślna. Użytkownik bazy danych ID: {user_response.user.id}, Email: {user_response.user.email}")
            return user_response.user
        else:
            raise Exception("Pusta odpowiedź z Supabase.")
    except Exception as e:
        logger.error(f"Autoryzacja odrzucona przez instancję Supabase: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {e}")

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
async def search_tenders(q: str, limit: int = 10, threshold: int = 60, user: dict = Depends(verify_supabase_token)):
    # Dystans jest konwertowany z powrotem funkcją odwrotną: (1 - dopasowanie%)^0.5
    sim_threshold = threshold / 100.0
    dist_threshold = max(0.0, (1.0 - sim_threshold)) ** 0.5
    
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
                "matches": item["matches"],
                "attachments": [{"id": a.id, "filename": a.filename} for a in tender.attachments]
            })
            
    return serialized

from pydantic import BaseModel

class SmartSearchRequest(BaseModel):
    user_profile: str
    limit: int = 10

@app.post("/search/smart")
async def smart_search_tenders(req: SmartSearchRequest, user: dict = Depends(verify_supabase_token)):
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
                "matches": item["matches"],
                "attachments": [{"id": a.id, "filename": a.filename} for a in tender.attachments]
            })
            
    return serialized

from fastapi import HTTPException

@app.get("/attachments/{attachment_id}")
async def download_attachment(attachment_id: int, user: dict = Depends(verify_supabase_token)):
    with SessionLocal() as db:
        attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
        if not attachment:
            raise HTTPException(status_code=404, detail="Attachment not found")
        
        # Verify the file exists on disk
        if not os.path.exists(attachment.path):
            raise HTTPException(status_code=404, detail="File not found on disk")
            
        return FileResponse(
            path=attachment.path, 
            filename=attachment.filename,
            media_type="application/octet-stream"
        )


if __name__ == "__main__":
    uvicorn.run(
        app,  # Przekazujemy obiekt app, a nie string, gdy uruchamiamy bezpośrednio
        host="0.0.0.0",
        port=8000,
    )
