import sys
import os
import random
from datetime import datetime

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from shared.database import SessionLocal, engine
from shared.models import Base, Tender, Notice, Attachment, NoticeSourceType

def seed_data():
    print("Seeding example data...")
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Tender).count() > 0:
            print("Database already contains data, skipping seed.")
            return

        # Używamy seederów na poziomie modeli
        Tender.seed(db, count=5)
        
        # Pobieramy stworzone przetargi żeby dodać im ogłoszenia i załączniki
        tenders = db.query(Tender).all()
        for t in tenders:
            Notice.seed(db, tender_id=t.id, count=random.randint(1, 2))
            Attachment.seed(db, tender_id=t.id, count=random.randint(3, 5))

        print("Seed finished successfully!")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
