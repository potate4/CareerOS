from fastapi import APIRouter
from app.api.v1.endpoints import  ai_services, interview, files

api_router_v1 = APIRouter()
api_router_v1.include_router(ai_services.router, prefix="/ai", tags=["ai-services"])
api_router_v1.include_router(interview.router, prefix="/interview", tags=["interview"])
api_router_v1.include_router(files.router, prefix="/files", tags=["files"])