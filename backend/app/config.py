from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    # Application
    app_name: str = "OpenFix AI"

    # Frontend and backend URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://127.0.0.1:8002"

    # Database
    database_url: str = "sqlite:///./openfix.db"

    # Session configuration
    session_secret: str = "development-only-change-me"
    cookie_secure: bool = False

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""

    # GitHub OAuth
    github_client_id: str = ""
    github_client_secret: str = ""
    github_token: str = ""

    # Existing AI configuration
    ai_api_key: str = ""
    ai_base_url: str = "https://api.openai.com/v1"
    ai_model: str = "gpt-4.1-mini"

    # Gemini configuration
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

