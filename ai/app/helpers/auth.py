from datetime import datetime, timedelta
import jwt
import requests
from app.core.config import settings

def create_internal_jwt():
    secret = settings.BACKEND_JWT_SECRET
    payload = {
        "sub": "internal-ai-service",
        "exp": datetime.utcnow() + timedelta(minutes=10)
    }
    return jwt.encode(payload, secret, algorithm="HS256")
