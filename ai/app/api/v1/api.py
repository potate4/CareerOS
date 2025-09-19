from fastapi import APIRouter
from app.api.v1.endpoints import ai_services, interview, files, futurecast, learning_path, mindflow, job_posting

api_router_v1 = APIRouter()
api_router_v1.include_router(ai_services.router, prefix="/ai", tags=["ai-services"])
api_router_v1.include_router(interview.router, prefix="/interview", tags=["interview"])
api_router_v1.include_router(files.router, prefix="/files", tags=["files"])
api_router_v1.include_router(futurecast.router, prefix="/futurecast", tags=["futurecast"])

api_router_v1.include_router(learning_path.router, prefix="/learning-path", tags=["learning-path"])
api_router_v1.include_router(mindflow.router, prefix="/mindflow", tags=["mindflow"])
api_router_v1.include_router(job_posting.router, prefix="/job-posting", tags=["job-posting"])