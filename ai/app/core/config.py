from pydantic_settings import BaseSettings
from pydantic import PostgresDsn
import os
from dotenv import load_dotenv

load_dotenv(override=True)  

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL",)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY:str = os.getenv("SUPABASE_ANON_KEY")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR")
    FRAME_DIR: str = os.getenv("FRAME_DIR")
    AUDIO_SEG_DIR: str = os.getenv("AUDIO_SEG_DIR")
    BACKEND_URL: str = os.getenv("BACKEND_URL")
    BACKEND_JWT_SECRET: str = os.getenv("BACKEND_JWT_SECRET")
    QDRANT_HOST: str = os.getenv("QDRANT_HOST")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY") or ""
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL") or ""

settings = Settings()