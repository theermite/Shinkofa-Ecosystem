"""
Admin routes for questionnaire management
Super Admin only
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pathlib import Path
import json

router = APIRouter(prefix="/admin/questions", tags=["admin-questions"])

# Path to questions index
QUESTIONS_INDEX_PATH = Path(__file__).parent.parent / "data" / "questions-index.json"


@router.get("/index")
async def get_questions_index():
    """
    Get index of all questionnaire questions
    Returns question numbers, titles, modules, for navigation

    Super Admin only
    """
    if not QUESTIONS_INDEX_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questions index not found. Run generate_questions_index.py first."
        )

    with open(QUESTIONS_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)

    return index


@router.get("/search")
async def search_questions(query: str):
    """
    Search questions by text
    Returns matching questions

    Super Admin only
    """
    if not QUESTIONS_INDEX_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questions index not found."
        )

    with open(QUESTIONS_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)

    # Search in question text, annotation, module
    query_lower = query.lower()
    results = []

    for q in index['questions']:
        if (query_lower in q['text'].lower() or
            (q['annotation'] and query_lower in q['annotation'].lower()) or
            (q['module'] and query_lower in q['module'].lower())):
            results.append(q)

    return {
        'query': query,
        'total_results': len(results),
        'results': results
    }


@router.get("/by-number/{question_number}")
async def get_question_by_number(question_number: int):
    """
    Get specific question by number

    Super Admin only
    """
    if not QUESTIONS_INDEX_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questions index not found."
        )

    with open(QUESTIONS_INDEX_PATH, 'r', encoding='utf-8') as f:
        index = json.load(f)

    # Find question by number
    question = next((q for q in index['questions'] if q['number'] == question_number), None)

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question {question_number} not found"
        )

    return question
