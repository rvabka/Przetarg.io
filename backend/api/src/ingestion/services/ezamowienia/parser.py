#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Parser ogłoszeń BZP - wyciąga wszystkie pola z HTML ogłoszenia.
Wczytuje html_bodies.json i generuje ustrukturyzowane dane.
"""

from __future__ import annotations

import json
import logging
import re
import sys
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup, NavigableString, Tag

logger = logging.getLogger(__name__)


def load_html_bodies(filepath: str = "html_bodies.json") -> Any:
    """Wczytuje plik JSON z ciałami HTML."""
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Nie znaleziono pliku: {filepath}")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Błąd parsowania JSON w pliku {filepath}: {e}") from e


def clean_text(text: str | None) -> str:
    """Czyści tekst z nadmiarowych białych znaków."""
    if not text:
        return ""
    text = text.replace('\xa0', ' ').replace('\u00a0', ' ')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


# Poprawny wzorzec dla numerów rzymskich I-X
_ROMAN_NUMERAL = r'(?:I|II|III|IV|V|VI|VII|VIII|IX|X)'


def extract_section_title(text: str) -> tuple[str, str] | None:
    """
    Sprawdza czy tekst jest tytułem sekcji, np. 'SEKCJA I - ZAMAWIAJĄCY'.
    Zwraca (numer_sekcji_rzymski, tytuł) lub None.
    """
    match = re.match(
        rf'^\s*SEKCJA\s+({_ROMAN_NUMERAL})\s*[-–—]\s*(.+)',
        text, re.IGNORECASE,
    )
    if match:
        return match.group(1).upper(), match.group(2).strip()
    match = re.match(
        rf'^\s*SEKCJA\s+({_ROMAN_NUMERAL})\s*$',
        text, re.IGNORECASE,
    )
    if match:
        return match.group(1).upper(), ""
    return None


def extract_field_number(text: str) -> tuple[str, str] | None:
    """
    Wyciąga numer pola z tekstu, np. '1.1.)' z '1.1.) Rola zamawiającego'.
    Zwraca (numer, reszta_tekstu) lub None.
    """
    match = re.match(r'^\s*(\d+\.\d+(?:\.\d+)?)\.\)\s*(.*)', text)
    if match:
        return match.group(1), match.group(2).strip()
    return None


def parse_full_text(full_text: str) -> dict:
    """
    Parsuje pełny tekst ogłoszenia linia po linii.
    """
    result: dict = {}
    
    # Podziel na linie i oczyść
    lines = full_text.split('\n')
    lines = [clean_text(line) for line in lines]
    lines = [line for line in lines if line]  # Usuń puste
    
    current_section = None
    current_field_num = None
    current_field_label = None
    current_field_value_lines = []
    
    section_pattern = re.compile(
        rf'^SEKCJA\s+({_ROMAN_NUMERAL})\s*[-–—]\s*(.+)$', re.IGNORECASE,
    )
    section_pattern_no_dash = re.compile(
        rf'^SEKCJA\s+({_ROMAN_NUMERAL})\s*$', re.IGNORECASE,
    )
    field_pattern = re.compile(r'^(\d+\.\d+(?:\.\d+)?)\.\)\s*(.*)')
    criterion_pattern = re.compile(r'^Kryterium\s+(\d+)\s*$', re.IGNORECASE)
    part_pattern = re.compile(r'^Część\s+(\d+)\s*$', re.IGNORECASE)
    
    def save_current_field():
        nonlocal current_field_num, current_field_label, current_field_value_lines
        if current_section is not None and current_field_num is not None:
            section_data = result[current_section]["fields"]
            value = ' '.join(current_field_value_lines).strip()
            
            if current_field_num in section_data:
                existing = section_data[current_field_num]
                if isinstance(existing["value"], list):
                    existing["value"].append(value)
                else:
                    existing["value"] = [existing["value"], value]
            else:
                section_data[current_field_num] = {
                    "label": current_field_label,
                    "value": value
                }
            
            current_field_num = None
            current_field_label = None
            current_field_value_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Sprawdź czy to nagłówek sekcji
        section_match = section_pattern.match(line)
        if not section_match:
            section_match = section_pattern_no_dash.match(line)
        
        if section_match:
            # Zapisz poprzednie pole
            save_current_field()
            
            section_num = section_match.group(1).upper()
            section_title = section_match.group(2).strip() if section_match.lastindex >= 2 else ""
            section_key = f"SEKCJA {section_num}"
            if section_title:
                section_key += f" - {section_title}"
            
            current_section = section_key
            if current_section not in result:
                result[current_section] = {
                    "title": section_key,
                    "fields": {},
                }
            i += 1
            continue
        
        # Sprawdź czy to numer pola
        field_match = field_pattern.match(line)
        if field_match:
            # Zapisz poprzednie pole
            save_current_field()
            
            field_num = field_match.group(1)
            rest = field_match.group(2)
            
            # Etykieta i wartość mogą być w jednej linii oddzielone dwukropkiem
            # lub wartość jest w następnej linii
            if ':' in rest:
                parts = rest.split(':', 1)
                current_field_label = parts[0].strip()
                value_part = parts[1].strip() if len(parts) > 1 else ""
                current_field_value_lines = [value_part] if value_part else []
            else:
                current_field_label = rest
                current_field_value_lines = []
            
            current_field_num = field_num
            
            if current_section is None:
                current_section = "NAGŁÓWEK"
                result[current_section] = {
                    "title": "NAGŁÓWEK",
                    "fields": {},
                }
            
            i += 1
            continue
        
        # Sprawdź kryterium
        crit_match = criterion_pattern.match(line)
        if crit_match:
            save_current_field()
            # Dodaj jako specjalny wpis
            if current_section:
                crit_num = crit_match.group(1)
                crit_key = f"_kryterium_{crit_num}"
                result[current_section]["fields"][crit_key] = {
                    "label": f"Kryterium {crit_num}",
                    "value": "",
                    "type": "separator"
                }
            i += 1
            continue
        
        # Sprawdź "Część X"
        part_match = part_pattern.match(line)
        if part_match:
            save_current_field()
            if current_section:
                part_num = part_match.group(1)
                part_key = f"_czesc_{part_num}"
                result[current_section]["fields"][part_key] = {
                    "label": f"Część {part_num}",
                    "value": "",
                    "type": "separator"
                }
            i += 1
            continue
        
        # To jest kontynuacja wartości bieżącego pola
        if current_field_num is not None:
            current_field_value_lines.append(line)
        
        i += 1
    
    # Zapisz ostatnie pole
    save_current_field()
    
    return result


def format_output(parsed_data: dict) -> str:
    """Formatuje sparsowane dane do czytelnego tekstu."""
    output_lines: list[str] = []
    
    for section_key, section_data in parsed_data.items():
        output_lines.append("")
        output_lines.append("=" * 80)
        output_lines.append(section_data["title"])
        output_lines.append("=" * 80)
        
        for field_key, field_data in section_data["fields"].items():
            if field_data.get("type") == "separator":
                output_lines.append("")
                output_lines.append(f"  --- {field_data['label']} ---")
                continue
            
            label = field_data["label"]
            value = field_data["value"]
            
            if isinstance(value, list):
                value = ' | '.join(value)
            
            if field_key.startswith("_"):
                output_lines.append(f"  {label}: {value}")
            else:
                field_display = f"{field_key}.)"
                if value:
                    output_lines.append(f"  {field_display} {label}: {value}")
                else:
                    output_lines.append(f"  {field_display} {label}:")
    
    return '\n'.join(output_lines)


def format_output_json(parsed_data: dict) -> dict:
    """Konwertuje sparsowane dane do formatu JSON (serializowalnego)."""
    output: dict = {}
    
    for section_key, section_data in parsed_data.items():
        section_out: dict = {}
        section_out["_title"] = section_data["title"]
        
        for field_key, field_data in section_data["fields"].items():
            section_out[field_key] = {
                "label": field_data["label"],
                "value": field_data["value"]
            }
            if "type" in field_data:
                section_out[field_key]["type"] = field_data["type"]
        
        output[section_key] = section_out
    
    return output


def parse_html_advanced(html_content: str) -> dict:
    """
    Parsuje HTML ogłoszenia BZP z użyciem BeautifulSoup.
    Zamienia <br> na newline, wyciąga tekst z zachowaniem struktury bloków,
    a następnie parsuje pełny tekst linia po linii.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    for br in soup.find_all('br'):
        br.replace_with('\n')
    
    text_blocks: list[str] = []
    
    def extract_text_blocks(element, depth=0):
        """Wyciąga bloki tekstu zachowując strukturę."""
        if isinstance(element, NavigableString):
            text = str(element).strip()
            if text:
                text_blocks.append(text)
            return
        
        if isinstance(element, Tag):
            if element.name in ['script', 'style']:
                return
            
            is_block = element.name in [
                'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'table', 'tr', 'li', 'ul', 'ol', 'section', 'article'
            ]
            
            if is_block:
                text_blocks.append('\n')
            
            for child in element.children:
                extract_text_blocks(child, depth + 1)
            
            if is_block:
                text_blocks.append('\n')
    
    extract_text_blocks(soup)
    
    full_text = ''.join(text_blocks)
    full_text = re.sub(r'\n{3,}', '\n\n', full_text)
    
    return parse_full_text(full_text)
