import asyncio
import logging
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Add project root to PYTHONPATH to allow imports from services.* and shared.*
# Assuming we are in backend/services/ingestion/ezamowienia/src/main.py
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# Move up to ezamowienia, then ingestion, then services, then backend
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "..", ".."))
sys.path.append(BACKEND_DIR)

# Also add the local src to path for convenience
sys.path.append(os.path.join(CURRENT_DIR, "."))

from services.ingestion.ezamowienia.src.worker import EzamowieniaWorker

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ezamowienia-main")

async def main():
    logger.info("Starting Ezamowienia Worker Service...")
    worker = EzamowieniaWorker()
    
    interval_minutes = int(os.getenv("WORKER_INTERVAL_MINUTES", "60"))
    
    while True:
        try:
            logger.info(f"Running ingestion cycle at {datetime.now()}")
            await worker.run()
            logger.info(f"Cycle finished. Waiting {interval_minutes} minutes...")
        except Exception as e:
            logger.error(f"Error in worker cycle: {e}", exc_info=True)
        
        await asyncio.sleep(interval_minutes * 60)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Worker service stopped by user.")
