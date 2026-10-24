import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import (
    AsyncOpenAI,
    APIConnectionError,
    APIStatusError,
    AuthenticationError,
    RateLimitError,
)

from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Chatbot"])

MODEL = settings.ai_model or "gpt-4.1-mini"


class ChatMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=20000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=50)


@router.post("/chat")
async def chat(request: ChatRequest):
    api_key = settings.ai_api_key.strip()
    base_url = settings.ai_base_url.strip()

    placeholders = {
        "YOUR_NEW_OPENAI_API_KEY",
        "YOUR_VALID_API_KEY",
        "your_actual_api_key",
    }

    if not api_key or api_key in placeholders:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI API key is missing or still contains a placeholder. "
                "Configure AI_API_KEY in backend/.env."
            ),
        )

    messages = []

    for message in request.messages:
        if message.role not in ("user", "assistant"):
            raise HTTPException(
                status_code=400,
                detail="Message roles must be user or assistant.",
            )

        if not message.content.strip():
            raise HTTPException(
                status_code=400,
                detail="Messages cannot be empty.",
            )

        messages.append(
            {
                "role": message.role,
                "content": message.content,
            }
        )

    if messages[-1]["role"] != "user":
        raise HTTPException(
            status_code=400,
            detail="The last message must be from the user.",
        )

    try:
        async with AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=45.0,
            max_retries=1,
        ) as client:
            response = await client.responses.create(
                model=MODEL,
                instructions=(
                    "You are OpenFix AI, a helpful programming assistant. "
                    "Help users with debugging, web development, Python, "
                    "JavaScript, C++, DSA, artificial intelligence, "
                    "machine learning, and open-source contributions. "
                    "Explain concepts clearly and provide practical examples."
                ),
                input=messages,
            )

        reply = response.output_text

        if not reply or not reply.strip():
            logger.warning("AI provider returned an empty response.")
            raise HTTPException(
                status_code=502,
                detail="The AI service returned an empty response.",
            )

        return {"reply": reply}

    except AuthenticationError:
        logger.warning("AI provider rejected the configured credentials.")
        raise HTTPException(
            status_code=502,
            detail=(
                "The AI provider rejected the API credentials. "
                "Check that your API key is valid and active."
            ),
        )

    except RateLimitError:
        logger.warning("AI provider reported a rate limit or quota issue.")
        raise HTTPException(
            status_code=429,
            detail=(
                "The AI provider reported a rate limit or quota issue. "
                "Check your API account and available quota."
            ),
        )

    except APIConnectionError:
        logger.exception("Could not connect to the AI provider.")
        raise HTTPException(
            status_code=502,
            detail=(
                "Could not connect to the AI provider. "
                "Check your internet connection."
            ),
        )

    except APIStatusError as exc:
        logger.error(
            "AI provider returned HTTP status %s.",
            exc.status_code,
        )
        raise HTTPException(
            status_code=502,
            detail=(
                "The AI provider returned an error. "
                "Check the backend terminal for details."
            ),
        )

    except HTTPException:
        raise

    except Exception:
        logger.exception("Unexpected error in the OpenFix AI chatbot.")
        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected chatbot error occurred. "
                "Check the backend terminal."
            ),
        )

