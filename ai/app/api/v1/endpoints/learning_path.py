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
    FileIndexingRequest,
    FileIndexingResponse,
    FileIndexingResult,
    LearningMaterialsSearchRequest,
    LearningMaterialsSearchResponse,
    LearningModuleGenerateRequest,
    LearningModuleGenerateResponse
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
        
        # Add the file indexing task to background tasks
        background_tasks.add_task(
            process_file_indexing,
            request.file_url,
            request.file_id,
            request.file_name,
            request.file_type,
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
                file_type=request.file_type,
                chunks_processed=0,
                chunks_indexed=0,
                processing_status="processing",
                metadata={"status": "background_task_started"}
            ),
            processing_time_seconds=0.0
        )
        
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
            logger.info(f"File indexing completed successfully in {processing_time:.2f}s for {file_name} (ID: {file_id})")
            logger.info(f"Indexed {processing_result.get('chunks_indexed', 0)} chunks from {processing_result.get('chunks_created', 0)} total chunks")
        else:
            indexing_status = "failed"
            error_message = "No chunks were successfully indexed"
            logger.warning(f"File indexing completed but no chunks indexed for {file_name} (ID: {file_id})")
        
    except Exception as e:
        indexing_status = "failed"
        error_message = str(e)
        logger.error(f"Error in background file indexing for {file_name} (ID: {file_id}): {e}")
    
    finally:
        # Always send callback to update status in Java backend
        await send_indexing_callback(file_id, indexing_status, error_message)


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
            limit=request.limit
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
