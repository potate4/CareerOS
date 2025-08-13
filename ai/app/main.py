import os
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import logging
from datetime import datetime, timedelta
import json
import openai

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CareerOS AI Learning Path Service",
    description="AI-powered learning path generation and adaptation service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic models for request/response
class SkillData(BaseModel):
    skillName: str
    masteryLevel: float
    experienceHours: Optional[float] = 0.0
    lastAssessmentDate: Optional[str] = None

class InterviewPerformance(BaseModel):
    overallScore: Optional[float] = None
    technicalScore: Optional[float] = None
    communicationScore: Optional[float] = None
    problemSolvingScore: Optional[float] = None
    lastInterviewDate: Optional[str] = None

class MarketTrend(BaseModel):
    skillName: str
    demandScore: float
    salaryTrend: str  # INCREASING, DECREASING, STABLE
    jobPostingsCount: Optional[int] = None
    growthRatePercentage: Optional[float] = None
    trendingDirection: str  # UP, DOWN, STABLE

class LearningHistory(BaseModel):
    completedModules: int
    totalHoursSpent: float
    averageRating: float
    lastActivityDate: Optional[str] = None

class LearningPathRequest(BaseModel):
    userId: int
    username: str
    email: Optional[str] = None
    careerGoal: str
    currentSkills: Dict[str, float]  # skill_name -> mastery_level
    experienceLevel: str  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    learningPace: str  # SLOW, MODERATE, FAST, INTENSIVE
    additionalNotes: Optional[str] = None
    interviewPerformance: Optional[InterviewPerformance] = None
    marketTrends: Optional[List[MarketTrend]] = None
    learningHistory: Optional[LearningHistory] = None

class LearningModule(BaseModel):
    title: str
    description: str
    skillFocus: str
    difficultyLevel: str  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    estimatedHours: int
    marketRelevance: float
    prerequisites: Optional[str] = None

class LearningPathResponse(BaseModel):
    modules: List[LearningModule]
    estimatedWeeks: int
    marketDemandScore: float
    marketTrends: str
    skillGapAnalysis: Dict[str, Any]
    learningStrategy: str

class AdaptationRequest(BaseModel):
    learningPathId: int
    currentProgress: float
    currentStage: str
    estimatedCompletionWeeks: int
    recentProgress: List[Dict[str, Any]]
    updatedSkillLevels: Dict[str, float]
    marketChanges: Dict[str, Any]

class AdaptationResponse(BaseModel):
    updatedModules: List[Dict[str, Any]]
    newModules: List[LearningModule]
    overallProgress: float
    currentStage: str
    estimatedWeeks: int
    adaptationReason: str

# Initialize AI service
from services.ai_service import ai_service
from core.ai_config import ai_config, AIConfig

# Dependency for authentication
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # For development/testing, accept any non-empty token
    # In production, implement proper JWT verification against your Java backend
    token = credentials.credentials
    if not token or token.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )
    
    # Log the token for debugging (remove in production)
    logger.info(f"Token received: {token[:20]}...")
    
    return token

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CareerOS AI Learning Path Service",
        "version": "1.0.0",
        "status": "operational",
        "ai_services": AIConfig.get_available_services(),
        "endpoints": [
            "/docs",
            "/generate-learning-path",
            "/adapt-learning-path"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Learning Path Service",
        "timestamp": datetime.now().isoformat(),
        "ai_model": "Advanced AI Service with GPT Integration",
        "available_services": AIConfig.get_available_services(),
        "primary_service": ai_config.PRIMARY_AI_SERVICE
    }

@app.post("/generate-learning-path", response_model=LearningPathResponse)
async def generate_learning_path(
    request: LearningPathRequest,
    token: str = Depends(verify_token)
):
    """Generate a personalized learning path using AI analysis"""
    try:
        logger.info(f"Received learning path generation request for user {request.userId}")
        
        # Convert Pydantic model to dict for AI service
        request_dict = request.dict()
        
        # Generate learning path using AI service
        ai_response = ai_service.generate_learning_path(request_dict)
        
        # Convert AI response to LearningPathResponse
        modules = []
        for module_data in ai_response.get("modules", []):
            module = LearningModule(
                title=module_data.get("title", "Untitled Module"),
                description=module_data.get("description", "No description"),
                skillFocus=module_data.get("skillFocus", "General"),
                difficultyLevel=module_data.get("difficultyLevel", "BEGINNER"),
                estimatedHours=module_data.get("estimatedHours", 10),
                marketRelevance=module_data.get("marketRelevance", 7.0),
                prerequisites=module_data.get("prerequisites")
            )
            modules.append(module)
        
        response = LearningPathResponse(
            modules=modules,
            estimatedWeeks=ai_response.get("estimatedWeeks", 12),
            marketDemandScore=ai_response.get("marketDemandScore", 7.5),
            marketTrends=ai_response.get("marketTrends", "Market analysis not available"),
            skillGapAnalysis=ai_response.get("skillGapAnalysis", {}),
            learningStrategy=ai_response.get("learningStrategy", "Standard learning approach")
        )
        
        logger.info(f"Successfully generated learning path with {len(response.modules)} modules")
        return response
        
    except Exception as e:
        logger.error(f"Error generating learning path: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning path: {str(e)}"
        )

@app.post("/adapt-learning-path", response_model=AdaptationResponse)
async def adapt_learning_path(
    request: AdaptationRequest,
    token: str = Depends(verify_token)
):
    """Adapt existing learning path based on progress and market changes"""
    try:
        logger.info(f"Received learning path adaptation request for path {request.learningPathId}")
        
        # Adapt learning path using AI
        response = ai_service.adapt_learning_path(request.dict())
        
        logger.info(f"Successfully adapted learning path")
        return response
        
    except Exception as e:
        logger.error(f"Error adapting learning path: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to adapt learning path: {str(e)}"
        )

@app.get("/skills/market-trends")
async def get_market_trends(
    skills: str,
    token: str = Depends(verify_token)
):
    """Get market trends for specific skills"""
    try:
        skill_list = [s.strip() for s in skills.split(",")]
        trends = []
        
        for skill in skill_list:
            demand_score = 7.0  # Default market demand score
            trends.append({
                "skill": skill,
                "demandScore": demand_score,
                "trendingDirection": "UP" if demand_score > 8.0 else "STABLE",
                "lastUpdated": datetime.now().isoformat()
            })
        
        return {"trends": trends}
        
    except Exception as e:
        logger.error(f"Error getting market trends: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get market trends: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)