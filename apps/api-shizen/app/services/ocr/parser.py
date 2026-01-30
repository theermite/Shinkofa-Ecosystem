"""
OCR Text Parser - Convert extracted text to structured questionnaire responses
Shinkofa Platform - Shizen-Planner Service
"""

import re
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class OCRTextParser:
    """
    Parse OCR-extracted text to identify questions and answers

    NOTE: This is a basic parser that expects structured text.
    May need customization based on actual document formats.

    Expected formats:
    - "Question X: text" or "X. text"
    - "Réponse: text" or "Answer: text" or direct answer after question
    """

    def __init__(self):
        # Patterns for detecting questions
        self.question_patterns = [
            r'(?:Question|Q)\s*(\d+)\s*[:\-]\s*(.+?)(?=\n|$)',  # "Question 1: text"
            r'(\d+)\.\s*(.+?)(?=\n|$)',  # "1. text"
            r'\*\*(.+?)\?\*\*',  # "**text?**" (markdown format)
        ]

        # Patterns for detecting answers
        self.answer_patterns = [
            r'(?:R[ée]ponse|Answer|R)\s*[:\-]\s*(.+?)(?=\n|$)',
            r'(?:Choix|Choice)\s*[:\-]\s*(.+?)(?=\n|$)',
        ]

    def parse_document(self, text: str) -> Dict[str, Any]:
        """
        Parse OCR text to extract questions and answers

        Args:
            text: Raw OCR-extracted text

        Returns:
            Dict with structured data:
            {
                "questions_found": 10,
                "answers_found": 8,
                "data": [
                    {
                        "question_number": 1,
                        "question_text": "...",
                        "answer": "...",
                        "confidence": "high"
                    }
                ],
                "raw_sections": ["section1", "section2"],
                "parsing_notes": ["note1", "note2"]
            }
        """
        logger.info("Starting OCR text parsing")

        # Clean text
        text = self._clean_text(text)

        # Split into lines for processing
        lines = text.split('\n')

        # Extract questions and answers
        parsed_data = self._extract_qa_pairs(lines)

        # Extract structured sections (if any)
        sections = self._extract_sections(text)

        result = {
            "questions_found": len([d for d in parsed_data if d.get('question_text')]),
            "answers_found": len([d for d in parsed_data if d.get('answer')]),
            "data": parsed_data,
            "raw_sections": sections,
            "parsing_notes": self._generate_parsing_notes(parsed_data)
        }

        logger.info(f"Parsing complete: {result['questions_found']} questions, "
                   f"{result['answers_found']} answers")

        return result

    def _clean_text(self, text: str) -> str:
        """
        Clean and normalize OCR text
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)

        # Normalize line breaks
        text = text.replace('\r\n', '\n').replace('\r', '\n')

        # Remove multiple consecutive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)

        return text.strip()

    def _extract_qa_pairs(self, lines: List[str]) -> List[Dict[str, Any]]:
        """
        Extract question-answer pairs from text lines
        """
        qa_pairs = []
        current_question = None
        current_answer = None

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Try to match question patterns
            question_match = None
            for pattern in self.question_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    question_match = match
                    break

            if question_match:
                # Save previous Q&A pair if exists
                if current_question:
                    qa_pairs.append({
                        "question_number": current_question.get('number'),
                        "question_text": current_question.get('text'),
                        "answer": current_answer,
                        "confidence": self._assess_confidence(current_question, current_answer)
                    })

                # Start new question
                groups = question_match.groups()
                if len(groups) >= 2:
                    current_question = {
                        'number': groups[0] if groups[0].isdigit() else None,
                        'text': groups[1].strip()
                    }
                else:
                    current_question = {
                        'number': None,
                        'text': groups[0].strip() if groups else line
                    }
                current_answer = None
                continue

            # Try to match answer patterns
            answer_match = None
            for pattern in self.answer_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    answer_match = match
                    break

            if answer_match:
                current_answer = answer_match.group(1).strip()
                continue

            # If we have a current question but no explicit answer marker,
            # the next line might be the answer
            if current_question and not current_answer:
                # Simple heuristic: if line is short and looks like an answer
                if len(line) < 200 and not any(p in line.lower() for p in ['question', 'bloc', 'module']):
                    current_answer = line

        # Don't forget last Q&A pair
        if current_question:
            qa_pairs.append({
                "question_number": current_question.get('number'),
                "question_text": current_question.get('text'),
                "answer": current_answer,
                "confidence": self._assess_confidence(current_question, current_answer)
            })

        return qa_pairs

    def _extract_sections(self, text: str) -> List[str]:
        """
        Extract structured sections (e.g., Bloc A, Bloc B, etc.)
        """
        sections = []

        # Look for Bloc markers
        bloc_pattern = r'(?:BLOC|Bloc)\s+([A-I])\s*[:\-]\s*(.+?)(?=BLOC|Bloc|$)'
        matches = re.finditer(bloc_pattern, text, re.IGNORECASE | re.DOTALL)

        for match in matches:
            bloc_id = match.group(1)
            bloc_content = match.group(2)[:200]  # First 200 chars
            sections.append(f"Bloc {bloc_id}: {bloc_content.strip()}")

        return sections

    def _assess_confidence(self, question: Optional[Dict], answer: Optional[str]) -> str:
        """
        Assess confidence level of extracted Q&A pair
        """
        if not question:
            return "none"

        if not answer:
            return "low"  # Question found but no answer

        # High confidence if both question and answer are present and reasonable length
        if len(answer) > 2 and len(question.get('text', '')) > 10:
            return "high"

        return "medium"

    def _generate_parsing_notes(self, parsed_data: List[Dict[str, Any]]) -> List[str]:
        """
        Generate notes about parsing quality and issues
        """
        notes = []

        total = len(parsed_data)
        with_answers = len([d for d in parsed_data if d.get('answer')])
        high_conf = len([d for d in parsed_data if d.get('confidence') == 'high'])

        if total == 0:
            notes.append("⚠️ No questions detected. Document may not be in expected format.")

        if total > 0 and with_answers < total * 0.5:
            notes.append(f"⚠️ Only {with_answers}/{total} questions have answers. "
                        "Consider manual review.")

        if high_conf < total * 0.3:
            notes.append("⚠️ Low confidence in extraction. Manual verification recommended.")

        if total > 0 and with_answers == total:
            notes.append(f"✅ All {total} questions have answers detected!")

        return notes


# ========================================
# Helper Function
# ========================================

def parse_ocr_text(text: str) -> Dict[str, Any]:
    """
    Parse OCR text (convenience function)

    Args:
        text: OCR-extracted text

    Returns:
        Parsed questionnaire data
    """
    parser = OCRTextParser()
    return parser.parse_document(text)
