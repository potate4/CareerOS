from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from fastapi.security import HTTPBearer
from typing import List, Dict, Any, Optional
import logging
import uuid
import os
import aiofiles
from pathlib import Path
import time
from datetime import datetime
import requests

from app.helpers.learning_path import LearningPathAI
from app.helpers.auth import create_internal_jwt
from app.core.config import settings
from app.schemas.learning_path import (
    AssessmentAnswerScoreSubmissionRequest,
    FileIndexingRequest,
    FileIndexingResponse,
    FileIndexingResult,
    LearningMaterialsSearchRequest,
    LearningMaterialsSearchResponse,
    LearningModuleGenerateRequest,
    LearningModuleGenerateResponse,
    ChatRequest,
    ChatResponse,
    AssessmentRequest,
    AssessmentResponse,
    AssessmentSubmissionRequest,
    AssessmentSubmissionResponse,
    AssessmentQuestion,
    AssessmentAnswerScore
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

# Initialize AI helper
learning_ai = LearningPathAI()

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/index-file", response_model=FileIndexingResponse)
async def index_file(
    request: FileIndexingRequest,
    background_tasks: BackgroundTasks
):
    """
    Index a single file from URL for learning materials (background task)
    """
    try:
        logger.info(f"Starting background indexing for file {request.file_name} for user {request.user_id}")
        
        # Validate request parameters
        if not request.file_url or not request.file_url.strip():
            raise HTTPException(status_code=400, detail="File URL is required")
        
        if not request.file_name or not request.file_name.strip():
            raise HTTPException(status_code=400, detail="File name is required")
        
        if not request.file_type or not request.file_type.strip():
            raise HTTPException(status_code=400, detail="File type is required")
        
        # Validate file type
        valid_file_types = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt']
        normalized_file_type = request.file_type.lower().strip()
        if normalized_file_type.startswith('application/'):
            if 'pdf' in normalized_file_type:
                normalized_file_type = 'pdf'
            elif 'word' in normalized_file_type or 'document' in normalized_file_type:
                normalized_file_type = 'docx'
            elif 'powerpoint' in normalized_file_type or 'presentation' in normalized_file_type:
                normalized_file_type = 'pptx'
            elif 'text' in normalized_file_type:
                normalized_file_type = 'txt'
        
        if normalized_file_type not in valid_file_types:
            logger.warning(f"Unsupported file type: {request.file_type}, normalized to: {normalized_file_type}")
        
        logger.info(f"Validated request - File: {request.file_name}, Type: {request.file_type} -> {normalized_file_type}, URL: {request.file_url}")
        
        # Add the file indexing task to background tasks
        background_tasks.add_task(
            process_file_indexing,
            request.file_url,
            request.file_id,
            request.file_name,
            normalized_file_type,  # Use normalized file type
            request.user_id,
            request.module_id
        )
        
        # Return immediate response
        return FileIndexingResponse(
            success=True,
            message=f"File indexing started for {request.file_name}",
            result=FileIndexingResult(
                file_id=request.file_id,
                file_name=request.file_name,
                file_type=normalized_file_type,  # Return normalized file type
                chunks_processed=0,
                chunks_indexed=0,
                processing_status="processing",
                metadata={"status": "background_task_started", "normalized_file_type": normalized_file_type}
            ),
            processing_time_seconds=0.0
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting file indexing: {e}")
        raise HTTPException(status_code=500, detail=f"File indexing failed to start: {str(e)}")


async def process_file_indexing(
    file_url: str,
    file_id: str,
    file_name: str,
    file_type: str,
    user_id: int,
    module_id: int
):
    """
    Background task function to process file indexing with callback
    """
    indexing_status = "failed"
    error_message = None
    
    try:
        logger.info(f"Processing file indexing for {file_name} (ID: {file_id})")
        logger.info(f"File details - URL: {file_url}, Type: {file_type}, User: {user_id}, Module: {module_id}")
        start_time = time.time()
        
        # Process and index the file
        processing_result = await learning_ai.process_learning_materials(
            file_url=file_url,
            file_id=file_id,
            file_name=file_name,
            file_type=file_type,
            user_id=user_id,
            module_id=module_id
        )
        
        processing_time = time.time() - start_time
        
        # Determine status based on processing result
        if processing_result and processing_result.get('status', 'failed') == 'completed':
            indexing_status = "completed"
            chunks_created = processing_result.get('chunks_created', 0)
            chunks_indexed = processing_result.get('chunks_indexed', 0)
            logger.info(f"File indexing completed successfully in {processing_time:.2f}s for {file_name} (ID: {file_id})")
            logger.info(f"Indexed {chunks_indexed} chunks from {chunks_created} total chunks")
        else:
            indexing_status = "failed"
            error_message = processing_result.get('error', 'No chunks were successfully indexed') if processing_result else 'Processing failed with no result'
            logger.warning(f"File indexing completed but failed for {file_name} (ID: {file_id}): {error_message}")
        
    except Exception as e:
        indexing_status = "failed"
        error_message = str(e)
        logger.error(f"Error in background file indexing for {file_name} (ID: {file_id}): {e}")
        # Log the full traceback for debugging
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
    
    finally:
        # Always send callback to update status in Java backend
        try:
            await send_indexing_callback(file_id, indexing_status, error_message)
        except Exception as callback_error:
            logger.error(f"Failed to send indexing callback for {file_name} (ID: {file_id}): {callback_error}")
            # Don't re-raise this error as it's not critical to the main processing


async def send_indexing_callback(file_id: str, status: str, error_message: Optional[str] = None):
    """
    Send callback to Java backend to update file indexing status
    """
    try:
        logger.info(f"Sending indexing callback for file ID: {file_id}, status: {status}")
        
        # Create callback payload
        callback_data = {
            "fileId": file_id,
            "status": status,
            "errorMessage": error_message,
            "completedAt": datetime.now().isoformat()
        }
        
        # Create internal JWT for authentication
        jwt = create_internal_jwt()
        
        # Send callback to Java backend
        callback_url = f"{settings.BACKEND_URL}/api/files/indexing-callback"
        
        response = requests.post(
            callback_url,
            json=callback_data,
            headers={"Authorization": f"Bearer {jwt}"},
            timeout=30
        )
        
        if response.status_code == 200:
            logger.info(f"✅ Indexing callback sent successfully for file ID: {file_id}")
        else:
            logger.error(f"❌ Indexing callback failed for file ID: {file_id}, status code: {response.status_code}")
            
    except Exception as e:
        logger.error(f"❌ Error sending indexing callback for file ID: {file_id}: {e}")
        # Don't raise exception here to avoid breaking the background task


@router.post("/search", response_model=LearningMaterialsSearchResponse)
async def search_learning_materials(
    request: LearningMaterialsSearchRequest,
):
    """
    Search learning materials using RAG for a specific user
    """
    try:
        logger.info(f"Searching materials for user {request.user_id}: {request.query}")
        start_time = time.time()
        
        # Search learning materials
        search_result = await learning_ai.search_learning_materials(
            query=request.query,
            user_id=request.user_id,
            limit=request.limit,
            module_id=request.module_id
        )
        
        processing_time = time.time() - start_time
        
        return LearningMaterialsSearchResponse(
            success=True,
            search_result=search_result,
            query=request.query,
            total_results=len(search_result) if isinstance(search_result, list) else 0,
            processing_time_seconds=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error in search functionality: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/generate", response_model=LearningModuleGenerateResponse)
async def generate_learning_path(
    request: LearningModuleGenerateRequest,
):
    """
    Generate a learning path with modules based on user's learning path info
    """
    try:
        logger.info(f"Generating learning path for user {request.user_id}")
        start_time = time.time()
        
        # Generate learning path using AI helper
        learning_path_result = await learning_ai.get_learning_path(
            learning_path_info=request.learning_path_info
        )
        
        processing_time = time.time() - start_time
        
        if not learning_path_result:
            raise HTTPException(status_code=500, detail="Failed to generate learning path")
        
        logger.info(f"Learning path generated in {processing_time:.2f}s for user {request.user_id}")
        
        return LearningModuleGenerateResponse(
            modules=learning_path_result if learning_path_result else []
        )
        
    except Exception as e:
        logger.error(f"Error generating learning path: {e}")
        raise HTTPException(status_code=500, detail=f"Learning path generation failed: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
async def chat_with_learning_assistant(
    request: ChatRequest,
):
    """
    Chat with learning assistant based on user's study materials and context
    """
    try:
        logger.info(f"Chat request from user {request.user_id} for module {request.module_id}")
        logger.info(f"User query: {request.user_query}")
        logger.info(f"Chat history length: {len(request.chat_history)}")
        start_time = time.time()
        
        # Validate request
        if not request.user_query or not request.user_query.strip():
            raise HTTPException(status_code=400, detail="User query cannot be empty")
        
        # Generate chat reply using AI helper
        logger.info(f"Calling generate_chat_reply with user_id={request.user_id}, module_id={request.module_id}")
        chat_reply = await learning_ai.generate_chat_reply(
            user_id=request.user_id,
            module_id=request.module_id,
            chat_history=request.chat_history,
            user_message=request.user_query
        )
        
        processing_time = time.time() - start_time
        
        if not chat_reply:
            raise HTTPException(status_code=500, detail="Failed to generate chat reply")
        
        logger.info(f"Chat reply generated successfully in {processing_time:.2f}s for user {request.user_id}, module {request.module_id}")
        logger.info(f"Reply length: {len(chat_reply)} characters")
        
        return ChatResponse(
            success=True,
            message="Chat reply generated successfully",
            reply=chat_reply,
            user_id=request.user_id,
            module_id=request.module_id,
            processing_time_seconds=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat functionality: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.post("/create-assessment", response_model=AssessmentResponse)
async def create_assessment(
    request: AssessmentRequest,
):
    """
    Create assessment questions for a specific user and module
    """
    try:
        logger.info(f"Creating assessment for user {request.user_id} in module {request.module_id}")
        start_time = time.time()
        
        # Create assessment using AI helper
        assessment_result = await learning_ai.create_assessment(
            user_id=request.user_id,
            module_id=request.module_id,
            assessment_type=request.assessment_type,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )
        
        processing_time = time.time() - start_time
        
        if not assessment_result or not assessment_result.get('success'):
            error_msg = assessment_result.get('error', 'Failed to create assessment') if assessment_result else 'No result returned'
            raise HTTPException(status_code=500, detail=f"Assessment creation failed: {error_msg}")
        
        logger.info(f"Assessment created successfully in {processing_time:.2f}s for user {request.user_id}, module {request.module_id}")
        
        return AssessmentResponse(
            success=True,
            message=assessment_result['message'],
            assessment_id=assessment_result['assessment_id'],
            questions=assessment_result['questions'],
            user_id=assessment_result['user_id'],
            module_id=assessment_result['module_id'],
            assessment_type=assessment_result['assessment_type'],
            difficulty=assessment_result['difficulty'],
            created_at=datetime.fromisoformat(assessment_result['created_at'])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment creation failed: {str(e)}")


@router.post("/score-assessment", response_model=AssessmentSubmissionResponse)
async def score_assessment(
    request: AssessmentSubmissionRequest,
):
    """
    Score an assessment submission and provide feedback
    """
    try:
        logger.info(f"Scoring assessment {request.assessment_id} for user {request.user_id}")
        start_time = time.time()
        
        # Extract questions from the assessment answers (since they contain both question and correct_answer)
        # In a real implementation, you'd send the questions separately or store them
        questions = []
        for answer in request.assessment_answers:
            questions.append(AssessmentAnswerScoreSubmissionRequest(
                question=answer.question,
                correct_answer=answer.correct_answer,
                provided_answer=answer.provided_answer
            ))
        
        if not questions:
            raise HTTPException(status_code=400, detail="No questions found in assessment answers.")
 
        # Score assessment using AI helper
        scoring_result = await learning_ai.score_assessment(
            assessment_id=request.assessment_id,
            user_id=request.user_id,
            module_id=request.module_id,
            questions=questions
        )
        
        processing_time = time.time() - start_time
        
        if not scoring_result or not scoring_result.get('success'):
            error_msg = scoring_result.get('error', 'Failed to score assessment') if scoring_result else 'No result returned'
            raise HTTPException(status_code=500, detail=f"Assessment scoring failed: {error_msg}")
        
        logger.info(f"Assessment scored successfully in {processing_time:.2f}s for user {request.user_id}")
        
        return AssessmentSubmissionResponse(
            success=True,
            message=scoring_result['message'],
            assessment_id=scoring_result['assessment_id'],
            user_id=scoring_result['user_id'],
            module_id=scoring_result['module_id'],
            total_score=scoring_result['total_score'],
            max_score=scoring_result['max_score'],
            percentage=scoring_result['percentage'],
            answers_and_scores=scoring_result['answers_and_scores'],
            overall_feedback=scoring_result['overall_feedback'],
            completed_at=datetime.fromisoformat(scoring_result['completed_at'])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scoring assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment scoring failed: {str(e)}")
