import json
from ai import ask_gemini


def generate_quiz(notes_text: str, number_of_questions: int = 10):

    prompt = f"""
Create a multiple-choice quiz from the study notes below.

Create exactly {number_of_questions} questions.

Return ONLY valid JSON.

Format:

[
  {{
    "question": "Question",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "Option A",
    "explanation": "Short explanation"
  }}
]

STUDY NOTES:

{notes_text}
"""

    response = ask_gemini(prompt)

    response = response.strip()

    if response.startswith("```"):
        response = response.replace("```json", "")
        response = response.replace("```", "")

    return json.loads(response)