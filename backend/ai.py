import os
import time

from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def ask_gemini(prompt: str) -> str:
    models = [
        "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.7-flash"
    ]

    last_error = None

    for model in models:

        # Try each model up to 3 times
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )

                return response.text

            except Exception as e:
                last_error = e

                print(
                    f"Model {model} failed "
                    f"(attempt {attempt + 1}/3): {e}"
                )

                if attempt < 2:
                    time.sleep(2 ** attempt)

        print(f"Moving to next model: {model}")

    raise last_error