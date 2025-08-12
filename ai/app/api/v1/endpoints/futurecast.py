from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Any

from app.schemas.futurecast import FuturecastRequest, FuturecastResponse
from app.helpers.futurecast import generate_career_roadmap

router = APIRouter()

@router.post("/generate-roadmap", response_model=FuturecastResponse)
async def generate_roadmap(request: FuturecastRequest) -> Any:
    """
    Generate a comprehensive career roadmap with multiple paths using AI.
    This endpoint only handles AI generation - database operations are handled by the Java backend.
    """
    try:
        # Generate roadmap using AI
        roadmap_response = generate_career_roadmap(request)
        
        return roadmap_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")