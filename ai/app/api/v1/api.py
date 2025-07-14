from fastapi import APIRouter
from app.api.v1.endpoints import audios
api_router_v1 = APIRouter()

api_router_v1.include_router(audios.router, prefix="/audios", tags=["audios"])
