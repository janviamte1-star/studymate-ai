import os

from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def ask_gemini(prompt: str) -> str:
    models = [
        "gemini-3.8-flash",
        "gemini-3.7-flash",
        "gemini-3.6-flash"
    ]

    last_error = None

    for model in models:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )

            return response.text

        except Exception as e:
            last_error = e
            print(f"Model {model} failed: {e}")
            continue

    raise last_error

    return response.text
