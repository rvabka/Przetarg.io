from sqlalchemy import select
from sqlalchemy.orm import Session
from src.db.models import NoticeChunk, Notice, Tender
from src.ingestion.services.embedding_service import EmbeddingService
import logging

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.embedding_service = EmbeddingService()

    async def search_tenders(self, query: str, limit: int = 10, threshold: float = 0.7):
        """
        Wyszukuje przetargi na podstawie zapytania semantycznego.
        Agreguje wyniki z chunków do ogłoszeń i przetargów.
        """
        logger.info(f"Searching for: {query}")
        
        # 1. Generate embedding for query
        # We need to ensure the service knows this is a QUERY, not a document
        # We can modify generate_embedding to accept kwargs or add a specific method
        # For now, let's access the internal method or logic if possible.
        # Ideally EmbeddingService should expose this.
        
        # Let's bypass the helper if needed or update helper. 
        # Actually I just updated EmbeddingService to use "retrieval_document" hardcoded.
        # I should make it flexible.
        
        # For now, let's assume I will update EmbeddingService to be more flexible in next step
        # OR I can just use the genai directly here if I import it? 
        # No, clean dependency.
        
        # Update: I will modify EmbeddingService to accept task_type first.
        query_embedding = await self.embedding_service.generate_embedding(query, task_type="retrieval_query")
        if not query_embedding:
            return []

        # 2. Search for similar chunks using pgvector (cosine distance / l2 distance defined by operator)
        # Using cosine distance (<=>) or l2 (<->). 
        # Typically cosine similarity is 1 - cosine distance.
        # pgvector's <=> operator is cosine distance. 
        # So lower is better. matching > (1 - threshold) means distance < threshold (roughly).
        
        # Determine strictness. 
        # Let's simple order by distance.
        
        stmt = select(NoticeChunk, NoticeChunk.embedding.cosine_distance(query_embedding).label("distance")).filter(
            NoticeChunk.embedding.cosine_distance(query_embedding) < threshold
        ).order_by(
            NoticeChunk.embedding.cosine_distance(query_embedding)
        ).limit(limit * 5) # Fetch more chunks to aggregate
        
        # execute() returns KeyedTuple (chunk, distance)
        results = self.db.execute(stmt).all()
        
        # 3. Aggregate results by Tender/Notice
        # We want to return unique tenders with the most relevant matched fragments
        
        results_map = {}
        
        for row in results:
            chunk = row[0]
            distance = row[1]
            
            # Calculate match percentage (0-100%)
            # Cosine distance: 0 = identical, 1 = orthogonal, 2 = opposite
            # We assume relevant range is mostly 0 to 1.
            # Similarity = 1 - distance
            similarity = max(0, 1 - distance)
            match_percentage = int(similarity * 100)
            
            if not chunk.notice:
                continue
                
            tender = chunk.notice.tender
            if not tender:
                continue
                
            if tender.id not in results_map:
                results_map[tender.id] = {
                    "tender": tender,
                    # Score of the tender is the best chunk score
                    "score": match_percentage,
                    "matches": []
                }
            
            # Allow max 3 chunks per tender to show
            if len(results_map[tender.id]["matches"]) < 3:
                results_map[tender.id]["matches"].append({
                    "content": chunk.content,
                    "section": chunk.section_title,
                    "sub_id": chunk.sub_id,
                    "score": match_percentage
                })
        
        # Convert to list and slice
        final_results = list(results_map.values())[:limit]
        
        return final_results
        return final_results

    async def smart_search(self, user_profile: str, limit: int = 10):
        """
        Wyszukiwanie "inteligentne":
        1. Pobiera kandydatów za pomocą wyszukiwania wektorowego (duży limit, niski próg).
        2. Rerankuje kandydatów używając modelu Gemini 2.5 Flash na podstawie user_profile.
        """
        import google.generativeai as genai
        import os
        import json
        
        logger.info(f"Smart searching for profile: {user_profile[:50]}...")
        
        # 1. Broad Retrieval (Vector Search)
        # We query using the profile text itself as a semantic query
        # We set a high threshold to get broad recall (distance < 2.0 basically gets everything sorted by dist)
        candidates = await self.search_tenders(user_profile, limit=20, threshold=2.0)
        
        if not candidates:
            return []
            
        logger.info(f"Retrieved {len(candidates)} candidates for LLM analysis.")
        
        # Configure GenAI
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.error("No GEMINI_API_KEY")
            return candidates # Fallback to vector results
            
        try:
             model = genai.GenerativeModel('gemini-2.5-flash')
        except:
             model = genai.GenerativeModel('gemini-1.5-flash')

        # 2. Reranking / Filtering
        smart_results = []
        
        for item in candidates:
            tender = item['tender']
            matches = item['matches']
            
            # Reduce context to fit in prompt efficiently
            tender_context = f"Tytuł: {tender.title}\n"
            for m in matches:
                tender_context += f"- {m['section']}: {m['content'][:400]}\n"
                
            prompt = f"""
            Jesteś ekspertem od przetargów. Oceniasz czy dane ogłoszenie pasuje do profilu firmy.
            
            PROFIL FIRMY:
            {user_profile}
            
            OGŁOSZENIE (fragmenty):
            {tender_context}
            
            Oceń przydatność tego przetargu dla firmy.
            Odpowiedz w czystym formacie JSON:
            {{
                "relevance_score": (0-100),
                "reason": "krótkie, konkretne uzasadnienie w 1 zdaniu"
            }}
            """
            
            try:
                response = await model.generate_content_async(prompt, generation_config={"response_mime_type": "application/json"})
                text_response = response.text.strip()
                # Basic cleanup if markdown ticks are present
                if text_response.startswith("```json"):
                    text_response = text_response[7:-3]
                
                try:
                    analysis = json.loads(text_response)
                except json.JSONDecodeError:
                    # Fallback pattern match or just skip
                    logger.warning(f"Failed to parse JSON from LLM: {text_response}")
                    continue
                    
                score = analysis.get("relevance_score", 0)
                reason = analysis.get("reason", "")
                
                # Update item with Smart info
                item["score"] = score
                item["smart_reason"] = reason
                
                # Filter out pure garbage (e.g. < 10)
                if score >= 10:
                    smart_results.append(item)
                    
            except Exception as e:
                 logger.error(f"Error in LLM analysis for tender {tender.id}: {e}")
                 # Keep it but with original score? Or skip? Let's skip to be safe.
        
        # Sort by new Smart Score
        smart_results.sort(key=lambda x: x["score"], reverse=True)
        
        return smart_results[:limit]
