import logging
import httpx
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

class EzamowieniaClient:
    BASE_URL = "https://ezamowienia.gov.pl/mp-readmodels/api"

    def __init__(self, storage_path: str = "storage/attachments"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.client = httpx.AsyncClient(verify=False, timeout=30.0)

    async def close(self):
        await self.client.aclose()

    async def get_notices(
        self,
        date_from: datetime,
        date_to: datetime,
        notice_type: str = "ContractNotice",
        page_size: int = 100,
        search_after: str = None
    ) -> List[Dict[str, Any]]:
        """
        Fetches list of notices from /notice endpoint
        """
        url = "https://ezamowienia.gov.pl/mo-board/api/v1/notice"
        params = {
            "NoticeType": notice_type,
            "PublicationDateFrom": date_from.isoformat(),
            "PublicationDateTo": date_to.isoformat(),
            "PageSize": page_size,
        }
        
        if search_after:
            params["SearchAfter"] = search_after

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error fetching notices: {e}")
            return []

    async def get_tender_details(self, tender_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches full tender details with documents from /Search/GetTender
        """
        url = f"{self.BASE_URL}/Search/GetTender"
        params = {"id": tender_id}
        
        try:
            response = await self.client.get(url, params=params)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error fetching tender details for {tender_id}: {e}")
            return None

    async def download_document(self, document_id: str, tender_id: str, filename: str) -> Optional[str]:
        """
        Downloads a document and saves it to storage. Returns the local path.
        Endpoint: /Tender/DownloadDocument/{tender_id}/{document_id}
        """
        url = f"{self.BASE_URL}/Tender/DownloadDocument/{tender_id}/{document_id}"
        
        # Sanitize filename
        safe_filename = "".join(c for c in filename if c.isalnum() or c in (' ', '.', '_', '-')).strip()
        tender_dir = self.storage_path / tender_id
        tender_dir.mkdir(parents=True, exist_ok=True)
        file_path = tender_dir / safe_filename
        
        try:
            async with self.client.stream("GET", url) as response:
                response.raise_for_status()
                with open(file_path, "wb") as f:
                    async for chunk in response.aiter_bytes():
                        f.write(chunk)
            
            return str(file_path)
        except httpx.HTTPError as e:
            logger.error(f"Error downloading document {document_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error saving document {filename}: {e}")
            return None
