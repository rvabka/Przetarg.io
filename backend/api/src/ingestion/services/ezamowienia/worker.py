import logging
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any

from sqlalchemy.orm import Session
from src.ingestion.base import BaseIngestionWorker
from src.ingestion.services.ezamowienia.client import EzamowieniaClient
from src.ingestion.services.ezamowienia.client import EzamowieniaClient
from src.ingestion.services.ezamowienia.section_parser import parse_html_sections, chunk_section_content
from src.ingestion.services.embedding_service import EmbeddingService
from src.db.session import SessionLocal
from src.db.models import Tender, Notice, Attachment, NoticeChunk
from src.db.models.enums import NoticeSourceType
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

class EzamowieniaWorker(BaseIngestionWorker):
    def __init__(self):
        self.client = EzamowieniaClient()

    async def run(self):
        logger.info("Starting Ezamowienia ingestion worker (Notice-based)...")
        
        # List of all notice types based on documentation
        NOTICE_TYPES = [
            "ContractNotice",
            "AgreementIntentionNotice",
            "TenderResultNotice",
            "CompetitionNotice",
            "CompetitionResultNotice",
            "NoticeUpdateNotice",
            "AgreementUpdateNotice",
            "ContractPerformingNotice",
            "CircumstancesFulfillmentNotice",
            "SmallContractNotice",
            "ConcessionNotice",
            "ConcessionIntentionAgreementNotice",
            "NoticeUpdateConcession",
            "ConcessionAgreementNotice",
            "ConcessionUpdateAgreementNotice"
        ]

        try:
            # Sync last 1 day for now
            now = datetime.now()
            date_to = now
            date_from = now - timedelta(days=1)
            
            logger.info(f"Fetching notices from {date_from} to {date_to}")
            
            for notice_type in NOTICE_TYPES:
                logger.info(f"Processing Notice Type: {notice_type}")
                search_after = None
                
                while True:
                    notices = await self.client.get_notices(
                        date_from=date_from, 
                        date_to=date_to,
                        notice_type=notice_type,
                        search_after=search_after
                    )
                    
                    if not notices:
                        break
                        
                    logger.info(f"Fetched {len(notices)} notices of type {notice_type}. Processing...")
                    
                    with SessionLocal() as db:
                        for notice_item in notices:
                            try:
                                await self._process_notice(db, notice_item)
                            except Exception as e:
                                logger.error(f"Error processing notice item {notice_item.get('objectId')}: {e}", exc_info=True)
                    
                    # Pagination
                    last_item = notices[-1]
                    search_after = last_item.get("objectId")
                    if not search_after:
                        break
                    
        except Exception as e:
            logger.error(f"Worker failed: {e}", exc_info=True)
        finally:
            await self.client.close()

    async def _process_notice(self, db: Session, item: Dict[str, Any]):
        notice_external_id = item.get("objectId")
        tender_external_id = item.get("tenderId")
        
        if not notice_external_id:
            logger.warning(f"Skipping notice without objectId: {item}")
            return

        # 1. Parse HTML Body to Sections
        html_body = item.get("htmlBody", "")
        sections = []
        if html_body:
            try:
                sections = parse_html_sections(html_body)
            except Exception as e:
                logger.error(f"Failed to parse HTML for notice {notice_external_id}: {e}")

        # 2. Update/Create Tender
        # We assume the notice contains the most up-to-date info for the tender
        tender = db.query(Tender).filter(
            Tender.source == NoticeSourceType.ezamowienia,
            Tender.external_id == tender_external_id
        ).first()

        if not tender:
            tender = Tender(
                source=NoticeSourceType.ezamowienia,
                external_id=tender_external_id,
                title=item.get("orderObject"),
                created_at=datetime.utcnow()
            )
            db.add(tender)
            db.commit()
            db.refresh(tender)
        else:
            # Update title if changed
            if item.get("orderObject") and tender.title != item.get("orderObject"):
                tender.title = item.get("orderObject")
                db.commit()

        # 3. Create Notice Event
        existing_notice = db.query(Notice).filter(
            Notice.source == NoticeSourceType.ezamowienia,
            Notice.notice_id == notice_external_id
        ).first()

        if not existing_notice:
            notice = Notice(
                source=NoticeSourceType.ezamowienia,
                notice_id=notice_external_id,
                tender_id=tender.id,
                title=item.get("noticeNumber"), # Using noticeNumber as title for Notice record
                description=f"Type: {item.get('noticeType')}",
                notice_data={
                    "raw": item,
                    "sections": sections
                },
                created_at=datetime.utcnow()
            )
            db.add(notice)
            db.commit()
            logger.info(f"Created Notice {notice_external_id} for Tender {tender_external_id}")
        else:
             logger.info(f"Notice {notice_external_id} already exists.")

        # 3a. Process Chunks and Embeddings (if new notice)
        if not existing_notice and sections:
            try:
                embedding_service = EmbeddingService()
                chunks_to_add = []
                
                # Iterate over sections and chunk them
                # We can batch embedding generation for efficiency
                all_texts = []
                temp_chunks_data = []

                for section in sections:
                    if not isinstance(section, dict):
                         continue
                         
                    section_title = section.get("section_title")
                    content = section.get("content")
                    if not content:
                        continue
                        
                    sub_chunks = chunk_section_content(content)
                    for sc in sub_chunks:
                        sub_id = sc.get("sub_id")
                        chunk_text = sc.get("content")
                        
                        # Filter out common boilerplate negated sentences
                        # e.g. ") Zamawiający przewiduje udzielenie dotychczasowemu wykonawcy zamówień na podobne usługi lub roboty budowlane: Nie"
                        if "przewiduje udzielenie" in chunk_text and ": Nie" in chunk_text:
                            logger.info(f"Skipping boilerplate chunk: {chunk_text[:50]}...")
                            continue

                        # Prepare for embedding
                        # Prepend Tender Title and Section Title for better context
                        # e.g. "Przebudowa drogi... - SEKCJA IV: ... content ..."
                        # Clean up chunk text (remove leading ") " or similar)
                        clean_chunk_text = chunk_text.lstrip(") .")
                        full_text_for_embedding = f"Przetarg: {tender.title}\nSekcja: {section_title}\nTreść: {clean_chunk_text}"
                        
                        all_texts.append(full_text_for_embedding)
                        temp_chunks_data.append({
                            "notice_pk": notice.id, # Use internal ID
                            "sub_id": sub_id,
                            "section_title": section_title,
                            "content": clean_chunk_text
                        })

                if all_texts:
                    logger.info(f"Generating embeddings for {len(all_texts)} chunks...")
                    # Generate embeddings (now non-blocking)
                    embeddings = await embedding_service.generate_embeddings(all_texts)
                    
                    for i, data in enumerate(temp_chunks_data):
                        if i < len(embeddings):
                            chunk_obj = NoticeChunk(
                                notice_id=data["notice_pk"],
                                sub_id=data["sub_id"],
                                section_title=data["section_title"],
                                content=data["content"], # We store the original or cleaned? Let's store cleaned for display.
                                embedding=embeddings[i]
                            )
                            chunks_to_add.append(chunk_obj)
                            
                    if chunks_to_add:
                        db.add_all(chunks_to_add)
                        db.commit()
                        logger.info(f"Saved {len(chunks_to_add)} chunks with embeddings for notice {notice_external_id}")

            except Exception as e:
                logger.error(f"Error generating embeddings for notice {notice_external_id}: {e}", exc_info=True)


        # 4. Fetch Documents and Update Status (Only if we just created the tender or if explicitly needed)
        # For efficiency, maybe check if we have any docs? 
        # Or just run it every time. Let's run it.
        await self._sync_and_update_details(db, tender)


    async def _sync_and_update_details(self, db: Session, tender: Tender):
        details = await self.client.get_tender_details(tender.external_id)
        if not details:
            return

        # Update Tender Status
        state = details.get("state")
        if state and tender.status != state:
            tender.status = state
            db.commit()
            logger.info(f"Updated status for tender {tender.external_id}: {state}")

        documents = details.get("tenderDocuments", [])
        for doc in documents:
            await self._process_document(db, tender, doc)

    async def _process_document(self, db: Session, tender: Tender, doc_data: Dict[str, Any]):
        attachment = doc_data.get("attachment")
        if not attachment:
            return

        # Skip archived or deleted documents
        if doc_data.get("tenderDocumentState") == "Archived" or doc_data.get("isDeleted") or (attachment and attachment.get("isDeleted")):
            logger.info(f"Skipping archived/deleted document: {doc_data.get('name')}")
            return

        doc_id = doc_data.get("objectId")
        filename = attachment.get("fileName")
        
        if not doc_id or not filename:
            return

        # Check if already exists
        exists = db.query(Attachment).filter(
            Attachment.tender_id == tender.id,
            Attachment.filename == filename
        ).first()
        
        if exists:
            return

        logger.info(f"Downloading document {filename} for tender {tender.external_id}")
        
        local_path = await self.client.download_document(
            document_id=doc_id, 
            tender_id=tender.external_id,
            filename=filename
        )

        if local_path:
            attachment_obj = Attachment(
                tender_id=tender.id,
                filename=filename,
                path=local_path,
                hash=attachment.get("hash")
            )
            db.add(attachment_obj)
            db.commit()
