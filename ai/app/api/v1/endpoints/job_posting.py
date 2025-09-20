from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from pydantic import BaseModel

from app.helpers.job_posting_ai import JobPostingAI
from app.helpers.auth import create_internal_jwt
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

# Initialize AI helper
job_posting_ai = JobPostingAI()

# Request/Response Models
class JobAnalysisRequest(BaseModel):
    job_description: str
    job_title: str
    company: str
    experience_level: Optional[str] = "MID_LEVEL"

class JobAnalysisResponse(BaseModel):
    success: bool
    job_analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class JobLearningPathRequest(BaseModel):
    job_description: str
    job_title: str
    company: str
    experience_level: Optional[str] = "MID_LEVEL"

class JobLearningPathResponse(BaseModel):
    success: bool
    modules: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None

class JobAssessmentRequest(BaseModel):
    job_description: str
    job_title: str
    company: str
    experience_level: Optional[str] = "MID_LEVEL"
    num_questions: Optional[int] = 10
    difficulty: Optional[str] = "INTERMEDIATE"

class JobAssessmentResponse(BaseModel):
    success: bool
    assessment_id: Optional[str] = None
    questions: Optional[List[Dict[str, Any]]] = None
    total_questions: Optional[int] = None
    difficulty: Optional[str] = None
    error: Optional[str] = None

class JobSkillsExtractionRequest(BaseModel):
    job_description: str

class JobSkillsExtractionResponse(BaseModel):
    success: bool
    job_analysis: Optional[Dict[str, Any]] = None
    learning_path: Optional[List[Dict[str, Any]]] = None
    assessment: Optional[List[Dict[str, Any]]] = None
    extracted_at: Optional[str] = None
    error: Optional[str] = None

@router.post("/analyze-job", response_model=JobAnalysisResponse)
async def analyze_job_description(request: JobAnalysisRequest):
    """
    Analyze job description to extract skills, requirements, and create structured data
    """
    try:
        logger.info(f"Analyzing job description for: {request.job_title} at {request.company}")
        
        result = await job_posting_ai.analyze_job_description(request.job_description)
        
        if result['success']:
            return JobAnalysisResponse(
                success=True,
                job_analysis=result['analysis']
            )
        else:
            return JobAnalysisResponse(
                success=False,
                error=result.get('error', 'Job analysis failed')
            )
            
    except Exception as e:
        logger.error(f"Error in job analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Job analysis failed: {str(e)}")

@router.post("/generate-learning-path", response_model=JobLearningPathResponse)
async def generate_job_learning_path(request: JobLearningPathRequest):
    """
    Generate learning path modules based on job requirements
    """
    try:
        logger.info(f"Generating learning path for: {request.job_title}")
        
        # First analyze the job description
        analysis_result = await job_posting_ai.analyze_job_description(request.job_description)
        
        if not analysis_result['success']:
            return JobLearningPathResponse(
                success=False,
                error="Failed to analyze job description"
            )
        
        # Generate learning path based on analysis
        learning_path_result = await job_posting_ai.generate_job_learning_path(
            analysis_result['analysis'], 
            request.job_title
        )
        
        if learning_path_result['success']:
            return JobLearningPathResponse(
                success=True,
                modules=learning_path_result['modules']
            )
        else:
            return JobLearningPathResponse(
                success=False,
                error=learning_path_result.get('error', 'Learning path generation failed')
            )
            
    except Exception as e:
        logger.error(f"Error generating learning path: {e}")
        raise HTTPException(status_code=500, detail=f"Learning path generation failed: {str(e)}")

@router.post("/generate-assessment", response_model=JobAssessmentResponse)
async def generate_job_assessment(request: JobAssessmentRequest):
    """
    Generate assessment questions based on job requirements
    """
    try:
        logger.info(f"Generating assessment for: {request.job_title}")
        
        # First analyze the job description
        analysis_result = await job_posting_ai.analyze_job_description(request.job_description)
        
        if not analysis_result['success']:
            return JobAssessmentResponse(
                success=False,
                error="Failed to analyze job description"
            )
        
        # Generate assessment based on analysis
        assessment_result = await job_posting_ai.generate_job_assessment(
            analysis_result['analysis'],
            request.job_title,
            request.num_questions,
            request.difficulty
        )
        
        if assessment_result['success']:
            return JobAssessmentResponse(
                success=True,
                assessment_id=assessment_result['assessment_id'],
                questions=assessment_result['questions'],
                total_questions=assessment_result['total_questions'],
                difficulty=assessment_result['difficulty']
            )
        else:
            return JobAssessmentResponse(
                success=False,
                error=assessment_result.get('error', 'Assessment generation failed')
            )
            
    except Exception as e:
        logger.error(f"Error generating assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment generation failed: {str(e)}")

@router.post("/extract-skills-and-generate", response_model=JobSkillsExtractionResponse)
async def extract_skills_and_generate_content(request: JobSkillsExtractionRequest):
    """
    Extract skills from job description and generate both learning path and assessment
    """
    try:
        logger.info("🔥 [AI_ENDPOINT] Received extract-skills-and-generate request")
        logger.info(f"🔥 [AI_ENDPOINT] Job description length: {len(request.job_description)}")
        logger.info(f"🔥 [AI_ENDPOINT] Job description preview: {request.job_description[:100]}...")

        logger.info("🔥 [AI_ENDPOINT] Calling job_posting_ai.extract_job_skills_and_requirements")
        result = await job_posting_ai.extract_job_skills_and_requirements(request.job_description)

        logger.info(f"🔥 [AI_ENDPOINT] AI processing result: {result.get('success', False)}")
        if not result['success']:
            logger.error(f"🔥 [AI_ENDPOINT] AI processing failed: {result.get('error', 'Unknown error')}")
        else:
            logger.info(f"🔥 [AI_ENDPOINT] Learning path modules: {len(result.get('learning_path', []))}")
            logger.info(f"🔥 [AI_ENDPOINT] Assessment questions: {len(result.get('assessment', []))}")

        if result['success']:
            response = JobSkillsExtractionResponse(
                success=True,
                job_analysis=result['job_analysis'],
                learning_path=result['learning_path'],
                assessment=result['assessment'],
                extracted_at=result['extracted_at']
            )
            logger.info("🔥 [AI_ENDPOINT] Successfully created response object")
            return response
        else:
            error_response = JobSkillsExtractionResponse(
                success=False,
                error=result.get('error', 'Skills extraction failed')
            )
            logger.error(f"🔥 [AI_ENDPOINT] Returning error response: {result.get('error', 'Skills extraction failed')}")
            return error_response

    except Exception as e:
        logger.error(f"❌ [AI_ENDPOINT] Error in skills extraction: {e}")
        logger.error(f"❌ [AI_ENDPOINT] Error type: {type(e).__name__}")
        import traceback
        logger.error(f"❌ [AI_ENDPOINT] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Skills extraction failed: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Health check endpoint for job posting AI service
    """
    return {
        "status": "healthy",
        "service": "job-posting-ai",
        "timestamp": datetime.now().isoformat()
    }