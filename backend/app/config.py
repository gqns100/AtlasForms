from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Personal Finance Manager"
    database_url: str = "sqlite:///./finance.db"
    secret_key: str = "your-secret-key-here"  # In production, this should be in environment variables
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
