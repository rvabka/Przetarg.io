import os
import logging
from typing import Optional
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables.")
        else:
            genai.configure(api_key=self.api_key)

    async def generate_summary(self, text: str) -> Optional[str]:
        if not self.api_key:
            logger.error("Cannot generate summary: GEMINI_API_KEY is missing.")
            return None
            
        prompt = (
            "Wygeneruj bardzo zwięzłe, ale bogate semantycznie podsumowanie poniższego ogłoszenia o przetargu. "
            "Skup się na: dokładnie co jest przedmiotem zamówienia (najważniejsze słowa kluczowe), "
            "potencjalne technologie (jeśli to IT), wymagane materiały lub obszar realizacji, "
            "ważne wymagania do udziału. Omiń urzędniczy bełkot i formalności. "
            "Podsumowanie musi być krótkie i idealne pod system RAG, gdzie użytkownik wpisuje to, czego szuka.\n\n"
            f"Tekst dokumentu (lub jego fragmenty):\n{text}"
        )

        try:
            model = genai.GenerativeModel("models/gemma-3-27b-it")
            response = await model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=1000,
                )
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating summary via direct Gemini API: {e}")
            return None
