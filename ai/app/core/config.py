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

settings = Settings()