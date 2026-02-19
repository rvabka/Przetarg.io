import os
import google.generativeai as genai
import logging
from typing import List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        logger.info("Initializing EmbeddingService with Gemini API...")
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables. Embeddings will fail.")
        else:
            genai.configure(api_key=api_key)
            logger.info("Gemini API configured.")

    async def generate_embedding(self, text: str, task_type: str = "retrieval_document") -> List[float]:
        """
        Generuje embedding dla podanego tekstu używając models/gemini-embedding-001.
        Zwraca listę floatów (wektor 3072-wymiarowy).
        
        task_type: 'retrieval_document' (default) or 'retrieval_query'
        """
        import asyncio
        if not text:
            return []
            
        loop = asyncio.get_running_loop()
        
        def _generate_sync():
            try:
                result = genai.embed_content(
                    model="models/gemini-embedding-001",
                    content=text,
                    task_type=task_type,
                    title="Tender Section" if task_type == "retrieval_document" else None
                )
                return result['embedding']
            except Exception as e:
                logger.error(f"Error generating embedding via Gemini: {e}")
                return []

        return await loop.run_in_executor(None, _generate_sync)
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generuje embeddingi dla listy tekstów asynchronicznie (w osobnym wątku),
        aby nie blokować pętli zdarzeń API.
        """
        import asyncio
        from functools import partial
        
        if not texts:
            return []
            
        loop = asyncio.get_running_loop()
        
        # Funkcja pomocnicza do uruchomienia w executorze
        def _generate_batch_sync(batch_texts):
            batch_embeddings = []
            for text in batch_texts:
                try:
                    # Wywołanie synchroniczne API Gemini
                    result = genai.embed_content(
                        model="models/gemini-embedding-001",
                        content=text,
                        task_type="retrieval_document",
                        title="Tender Section"
                    )
                    batch_embeddings.append(result['embedding'])
                except Exception as e:
                    logger.error(f"Error generating embedding via Gemini: {e}")
                    batch_embeddings.append([])
            return batch_embeddings

        try:
            # Dzielimy na mniejsze batche, aby mimo wszystko nie zapchać
            # Chociaż tutaj run_in_executor i tak wrzuci to w wątek.
            # Dla uproszczenia wrzucamy cały proces przetwarzania listy do wątku.
            # Jeśli lista jest bardzo długa, warto to podzielić, ale Executor sobie poradzi.
            
            # Uruchomienie w domyślnym executorze (ThreadPoolExecutor)
            return await loop.run_in_executor(None, _generate_batch_sync, texts)
            
        except Exception as e:
            logger.error(f"Error generating embeddings batch async: {e}")
            return []


