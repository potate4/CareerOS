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

from app.helpers.learning_path import LearningPathAI
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
):
    """
    Index a single file from URL for learning materials
    """
    try:
        logger.info(f"Indexing file {request.file_name} for user {request.user_id}")
        start_time = time.time()
        
        # Process and index the file
        processing_result = await learning_ai.process_learning_materials(
            file_url=request.file_url,
            file_id=request.file_id,
            file_name=request.file_name,
            file_type=request.file_type,
            user_id=request.user_id
        )
        
        processing_time = time.time() - start_time
        
        # Create indexing result
        indexing_result = FileIndexingResult(
            file_id=request.file_id,
            file_name=request.file_name,
            file_type=request.file_type,
            chunks_processed=processing_result.get('total_chunks', 0),
            chunks_indexed=processing_result.get('indexed_successfully', 0),
            processing_status="completed" if processing_result.get('indexed_successfully', 0) > 0 else "failed",
            metadata=processing_result
        )
        
        logger.info(f"File indexing completed in {processing_time:.2f}s for user {request.user_id}")
        
        return FileIndexingResponse(
            success=True,
            message=f"Successfully indexed file {request.file_name}",
            result=indexing_result,
            processing_time_seconds=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error indexing file: {e}")
        raise HTTPException(status_code=500, detail=f"File indexing failed: {str(e)}")


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
