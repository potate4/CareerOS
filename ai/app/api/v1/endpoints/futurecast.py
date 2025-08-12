from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Any, Optional, List
from uuid import UUID
import uuid
from pydantic import BaseModel

from app.core.supabase import supabase
from app.schemas.futurecast import (
    FuturecastRequest, 
    FuturecastResponse, 
)
from app.helpers.futurecast import generate_career_roadmap, breakdown_milestone_to_subtasks

router = APIRouter()

@router.post("/generate-roadmap", response_model=FuturecastResponse)
async def generate_roadmap(
    request: FuturecastRequest,
) -> Any:
    try:
        roadmap_response = generate_career_roadmap(request)
        return roadmap_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")

class MilestoneBreakdownRequest(BaseModel):
    goal: str
    milestoneTitle: str
    milestoneYear: int
    timelineYears: int

class MilestoneTask(BaseModel):
    title: str
    description: str
    estimatedTime: str

class MilestoneBreakdownResponse(BaseModel):
    milestoneTitle: str
    milestoneYear: int
    goal: str
    tasks: List[MilestoneTask]

@router.post("/breakdown", response_model=MilestoneBreakdownResponse)
async def breakdown_milestone(req: MilestoneBreakdownRequest) -> Any:
    try:
        result = breakdown_milestone_to_subtasks(
            goal=req.goal,
            milestone_title=req.milestoneTitle,
            milestone_year=req.milestoneYear,
            timeline_years=req.timelineYears
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to breakdown milestone: {str(e)}")