import os
import shutil

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Note, ChatMessage
from services.document_service import extract_text
from ai import ask_gemini
from services.quiz_service import generate_quiz

# Create database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudyMate AI API",
    version="1.0.0"
)

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://studymate-ai-blond-five.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Upload folder
# -------------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------------
# HOME
# -------------------------
@app.get("/")
def home():
    return {
        "message": "StudyMate AI Backend is running! 🎮",
        "status": "online"
    }

# -------------------------
# UPLOAD NOTES
# -------------------------
@app.post("/notes/upload")
async def upload_note(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    allowed_extensions = [".pdf", ".docx", ".txt"]
    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are supported."
        )

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        content = extract_text(file_path)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not read file: {error}"
        )

    note = Note(
        user_id=1,
        filename=file.filename,
        content=content
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return {
        "message": "Note uploaded successfully! 🎮",
        "note_id": note.id,
        "filename": file.filename,
        "characters": len(content)
    }

# -------------------------
# GET NOTES
# -------------------------
@app.get("/notes")
def get_notes(db: Session = Depends(get_db)):
    notes = db.query(Note).all()
    return [
        {
            "id": note.id,
            "filename": note.filename,
            "characters": len(note.content or "")
        }
        for note in notes
    ]

# -------------------------
# AI CHAT
# -------------------------
@app.post("/chat")
async def chat(
    question: str,
    db: Session = Depends(get_db)
):
    notes = db.query(Note).all()

    if not notes:
        raise HTTPException(
            status_code=400,
            detail="Upload notes first."
        )

    notes_text = "\n\n".join(note.content for note in notes)

    prompt = f"""
    You are StudyMate AI, a friendly college study buddy.

    Answer the student's question using the provided study notes.

    STUDY NOTES:
    {notes_text}

    STUDENT QUESTION:
    {question}

    Rules:
- Talk like a friendly college study buddy, not like a textbook.
- Use simple, easy-to-understand language.
- Keep answers short and focused unless the student asks for more detail.
- Start with a simple direct answer.
- Break explanations into small paragraphs or bullet points.
- Use a simple real-life or college-related example when it helps.
- Highlight important terms using **bold text**.
- When explaining a difficult concept, use this structure when appropriate:
  1. 🧠 Simple meaning
  2. 📌 Example
  3. 🎯 Remember this
- Avoid unnecessary formal words and complicated sentences.
- Do not repeat the question unnecessarily.
- If the answer is not present in the study notes, clearly say that it is not covered in the notes.
- If the answer is not in the notes, you may give a general explanation only if it is useful, but clearly label it as general knowledge.
- Never pretend that information from general knowledge came from the uploaded notes.
- Do not invent information.
"""

    answer = ask_gemini(prompt)

    message = ChatMessage(
        user_id=1,
        question=question,
        answer=answer
    )

    db.add(message)
    db.commit()

    return {
        "question": question,
        "answer": answer
    }


# -------------------------
# CHAT HISTORY
# -------------------------
@app.get("/chat/history")
def get_chat_history(db: Session = Depends(get_db)):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == 1)
        .order_by(ChatMessage.id.desc())
        .all()
    )

    return [
        {
            "id": message.id,
            "question": message.question,
            "answer": message.answer
        }
        for message in messages
    ]

# -------------------------
# GENERATE QUIZ
# -------------------------
@app.post("/quiz/generate")
def generate_ai_quiz(db: Session = Depends(get_db)):
    notes = db.query(Note).all()

    if not notes:
        raise HTTPException(
            status_code=400,
            detail="Upload notes first."
        )

    notes_text = "\n\n".join(note.content for note in notes)

    quiz = generate_quiz(notes_text, 10)

    return {
        "questions": quiz
    }