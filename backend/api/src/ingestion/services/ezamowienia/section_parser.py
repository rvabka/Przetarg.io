#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Uproszczony parser semantyczny dla ogłoszeń eZamówienia.
Dzieli tekst na sekcje (SEKCJA I, II itd.) i wyciąga ich zawartość jako tekst.
"""

import re
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

def parse_html_sections(html_content: str) -> list[dict]:
    """
    Parsuje HTML ogłoszenia, dzieląc go na sekcje.
    Zwraca listę słowników: 
    [
      {"section_title": "SEKCJA I - ...", "content": "treść sekcji..."},
      ...
    ]
    """
    if not html_content:
        return []

    # 1. Konwersja HTML do czystego tekstu z zachowaniem struktury
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Zamiana <br> na nowe linie
    for br in soup.find_all('br'):
        br.replace_with('\n')
    
    text_content = soup.get_text(separator='\n', strip=True)
    
    # 2. Podział na linie i identyfikacja nagłówków sekcji
    lines = text_content.split('\n')
    sections = []
    current_section_title = "WSTĘP"
    current_section_content = []
    
    # Regex dla nagłówków sekcji: "SEKCJA I - NAZWA" lub "SEKCJA I"
    # Obsługuje rzymskie I-X (i więcej w razie potrzeby, ale zazwyczaj to max X)
    section_pattern = re.compile(
        r'^\s*SEKCJA\s+(?:I|II|III|IV|V|VI|VII|VIII|IX|X)+\s*(?:[-–—]\s*(.*))?$', 
        re.IGNORECASE
    )
    
    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:
            continue
            
        match = section_pattern.match(stripped_line)
        if match:
            # Zapisz poprzednią sekcję
            if current_section_content:
                sections.append({
                    "section_title": current_section_title,
                    "content": "\n".join(current_section_content).strip()
                })
            
            # Rozpocznij nową sekcję
            # Używamy pełnej linii jako klucza (np. "SEKCJA I - ZAMAWIAJĄCY")
            # Normalizujemy spacje
            current_section_title = re.sub(r'\s+', ' ', stripped_line)
            current_section_content = []
        else:
            current_section_content.append(stripped_line)
            
    # Zapisz ostatnią sekcję
    if current_section_content:
        sections.append({
            "section_title": current_section_title,
            "content": "\n".join(current_section_content).strip()
        })
        
    return sections


def chunk_section_content(section_text: str) -> list[dict]:
    """
    Dzieli treść sekcji na mniejsze fragmenty na podstawie punktacji (np. 4.1.9.))
    Zwraca listę: [{"sub_id": "4.1.9", "content": "..."}]
    """
    chunks = []
    lines = section_text.split('\n')
    current_sub_id = None
    current_content = []

    # Regex dla punktacji: "1.)", "1.1.)", "4.1.9.)", "IV.1.3)" itp.
    # Zakładamy, że numer kończy się kropką i nawiasem lub samym nawiasem
    sub_pattern = re.compile(r'^\s*(\d+(?:\.\d+)*|[IVX]+(?:\.\d+)*)(?:\.|\))\s*(.*)$')

    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:
            continue
            
        match = sub_pattern.match(stripped_line)
        # Dodatkowe sprawdzenie, żeby nie łapać przypadkowych liczb
        # Wymagamy, żeby po numerze następował tekst lub żeby to była typowa numeracja BZP
        if match:
            sub_id = match.group(1)
            rest = match.group(2)
            
            # Jeśli mamy poprzedni chunk, zapisujemy go
            if current_content:
                chunks.append({
                    "sub_id": current_sub_id or "HEADER",
                    "content": "\n".join(current_content).strip()
                })
            
            current_sub_id = sub_id
            current_content = [rest] if rest else []
        else:
            current_content.append(stripped_line)
            
    # Zapisz ostatni chunk
    if current_content:
        chunks.append({
            "sub_id": current_sub_id or "HEADER",
            "content": "\n".join(current_content).strip()
        })
        
    return chunks
