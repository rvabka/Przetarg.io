from datetime import datetime
import random
from .models import Tender, Notice, Attachment, NoticeSourceType

class ModelFactory:
    """
    Klasa pomocnicza do generowania przykładowych danych dla modeli.
    """
    
    @staticmethod
    def create_fake_tender(index: int = 1) -> Tender:
        return Tender(
            source=random.choice(list(NoticeSourceType)),
            external_id=f"fake-tender-{index}-{random.randint(1000, 9999)}",
            title=f"Przykładowy Przetarg nr {index}: {random.choice(['Budowa drogi', 'Dostawa serwerów', 'Usługi sprzątania'])}",
            status=random.choice(["Initiated", "In Progress", "Published"]),
            created_at=datetime.utcnow()
        )

    @staticmethod
    def create_fake_notice(tender_id: int, index: int = 1) -> Notice:
        return Notice(
            notice_id=f"fake-notice-{tender_id}-{index}",
            tender_id=tender_id,
            title=f"Ogłoszenie nr {index} dla przetargu {tender_id}",
            source=NoticeSourceType.ezamowienia,
            notice_data={"type": "FakeNotice", "content": "To jest automatycznie wygenerowane ogłoszenie."},
            created_at=datetime.utcnow()
        )

    @staticmethod
    def create_fake_attachment(tender_id: int, index: int = 1) -> Attachment:
        filenames = ["dokumentacja.pdf", "siwz.docx", "zalacznik_cenowy.xlsx", "projekt.zip"]
        fname = random.choice(filenames)
        return Attachment(
            tender_id=tender_id,
            filename=f"{index}_{fname}",
            path=f"/app/storage/attachments/fake/{tender_id}/{index}_{fname}",
            created_at=datetime.utcnow()
        )
