import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from google import genai
from google.genai import errors

from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Chatbot"])




MODEL = settings.gemini_model

SYSTEM_INSTRUCTIONS = """
You are OpenFix AI, a helpful programming assistant.

Help users with:
- Debugging and fixing code
- HTML, CSS, JavaScript, React, and web development
- Python, Java, C++, and DSA
- Artificial intelligence and machine learning
- Git, GitHub, and open-source contributions

Explain concepts clearly using practical examples.
When fixing code, explain the cause of the issue and provide a solution.
Be friendly, accurate, and beginner-friendly.
"""


class ChatMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=20000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=50)


@router.post("/chat")
async def chat(request: ChatRequest):
    api_key = settings.gemini_api_key.strip()

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is missing. Check backend/.env.",
        )

    conversation = []

    for message in request.messages:
        if message.role not in ("user", "assistant"):
            raise HTTPException(
                status_code=400,
                detail="Message roles must be user or assistant.",
            )

        content = message.content.strip()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Messages cannot be empty.",
            )

        conversation.append(
            {
                "role": "user" if message.role == "user" else "model",
                "parts": [{"text": content}],
            }
        )

    if conversation[-1]["role"] != "user":
        raise HTTPException(
            status_code=400,
            detail="The last message must be from the user.",
        )

    try:
        client = genai.Client(api_key=api_key)

        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=conversation,
            config={
                "system_instruction": SYSTEM_INSTRUCTIONS,
                "temperature": 0.7,
            },
        )

        reply = response.text

        if not reply or not reply.strip():
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty response.",
            )

        return {"reply": reply.strip()}

    
    except errors.APIError as exc:
        logger.error(
            "Gemini API error: code=%s, message=%s",
            exc.code,
            exc.message,
        )

        if exc.code in (401, 403):
            raise HTTPException(
                status_code=502,
                detail="Gemini rejected the API credentials. Check your API key.",
            )

        if exc.code == 429:
            raise HTTPException(
                status_code=429,
                detail="Gemini quota or rate limit reached. Check your API usage limits.",
            )

        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {exc.message}",
        )



        if exc.code == 401 or exc.code == 403:
            raise HTTPException(
                status_code=502,
                detail="Gemini API rejected the credentials. Check your API key.",
            )

        if exc.code == 429:
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota or rate limit reached. Check your Google AI Studio usage limits.",
            )

        raise HTTPException(
            status_code=502,
            detail="Gemini API returned an error. Check the backend terminal.",
        )

    except HTTPException:
        raise

    except Exception:
        logger.exception("Unexpected chatbot error.")

        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Check the backend terminal.",
        )

