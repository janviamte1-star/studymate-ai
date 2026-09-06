import os
from pathlib import Path

from pypdf import PdfReader
from docx import Document


def extract_text(file_path: str) -> str:
    extension = Path(file_path).suffix.lower()

    if extension == ".txt":
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()

    if extension == ".pdf":
        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text

    if extension == ".docx":
        document = Document(file_path)

        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

    raise ValueError(
        "Unsupported file type. Use PDF, DOCX or TXT."
    )