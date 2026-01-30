"""
OCR Service - Extract text from PDF and images using Tesseract
Shinkofa Platform - Shizen-Planner Service
"""

import os
import tempfile
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_path
except ImportError as e:
    logging.error(f"OCR dependencies not installed: {e}")
    pytesseract = None
    Image = None
    convert_from_path = None

logger = logging.getLogger(__name__)


class OCRService:
    """
    Service for extracting text from documents using Tesseract OCR

    Supports:
    - PDF files (converted to images first)
    - Image files (PNG, JPG, JPEG, TI FF)
    """

    SUPPORTED_FORMATS = {'.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp'}

    def __init__(self, language: str = 'fra+eng'):
        """
        Initialize OCR service

        Args:
            language: Tesseract language code (e.g., 'fra+eng' for French + English)
        """
        self.language = language

        if pytesseract is None:
            raise ImportError(
                "OCR dependencies not installed. "
                "Please install: pip install pytesseract pdf2image Pillow"
            )

    def extract_text_from_file(self, file_path: str) -> Dict[str, Any]:
        """
        Extract text from a file (PDF or image)

        Args:
            file_path: Path to the file

        Returns:
            Dict with extracted text and metadata:
            {
                "text": "extracted text",
                "pages": ["page 1 text", "page 2 text"],
                "num_pages": 2,
                "file_type": "pdf",
                "success": True,
                "error": None
            }
        """
        path = Path(file_path)

        if not path.exists():
            return self._error_response(f"File not found: {file_path}")

        if path.suffix.lower() not in self.SUPPORTED_FORMATS:
            return self._error_response(
                f"Unsupported file format: {path.suffix}. "
                f"Supported: {', '.join(self.SUPPORTED_FORMATS)}"
            )

        try:
            if path.suffix.lower() == '.pdf':
                return self._process_pdf(file_path)
            else:
                return self._process_image(file_path)

        except Exception as e:
            logger.error(f"OCR extraction failed: {e}", exc_info=True)
            return self._error_response(str(e))

    def _process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Convert PDF to images and extract text from each page
        """
        logger.info(f"Processing PDF: {pdf_path}")

        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=300)

        pages_text = []
        for i, image in enumerate(images):
            logger.info(f"Processing page {i+1}/{len(images)}")
            text = pytesseract.image_to_string(image, lang=self.language)
            pages_text.append(text.strip())

        full_text = "\n\n".join(pages_text)

        return {
            "text": full_text,
            "pages": pages_text,
            "num_pages": len(images),
            "file_type": "pdf",
            "success": True,
            "error": None
        }

    def _process_image(self, image_path: str) -> Dict[str, Any]:
        """
        Extract text from a single image
        """
        logger.info(f"Processing image: {image_path}")

        image = Image.open(image_path)
        text = pytesseract.image_to_string(image, lang=self.language)

        return {
            "text": text.strip(),
            "pages": [text.strip()],
            "num_pages": 1,
            "file_type": "image",
            "success": True,
            "error": None
        }

    def _error_response(self, error_message: str) -> Dict[str, Any]:
        """
        Create error response
        """
        return {
            "text": "",
            "pages": [],
            "num_pages": 0,
            "file_type": None,
            "success": False,
            "error": error_message
        }


# ========================================
# Helper Functions
# ========================================

async def process_document(
    file_path: str,
    language: str = 'fra+eng'
) -> Dict[str, Any]:
    """
    Process a document and extract text

    Args:
        file_path: Path to the document
        language: OCR language

    Returns:
        OCR result dictionary
    """
    service = OCRService(language=language)
    return service.extract_text_from_file(file_path)


def save_uploaded_file(file_content: bytes, filename: str) -> str:
    """
    Save uploaded file to temporary directory

    Args:
        file_content: File bytes
        filename: Original filename

    Returns:
        Path to saved file
    """
    # Create temp directory if not exists
    temp_dir = Path(tempfile.gettempdir()) / "shinkofa_uploads"
    temp_dir.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = temp_dir / filename
    with open(file_path, 'wb') as f:
        f.write(file_content)

    return str(file_path)


def cleanup_temp_file(file_path: str) -> None:
    """
    Remove temporary file after processing

    Args:
        file_path: Path to file to remove
    """
    try:
        Path(file_path).unlink(missing_ok=True)
        logger.info(f"Cleaned up temp file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to cleanup temp file {file_path}: {e}")
