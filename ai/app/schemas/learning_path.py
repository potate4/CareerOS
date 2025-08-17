from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from enum import Enum

#

# File Upload Schema
class FileUploadInfo(BaseModel):
    user_id: Optional[int] = None
    file_id: Optional[str] = None
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    file_url: Optional[str] = None
    upload_date: Optional[datetime] = None
    module_id: Optional[int] = None

# Index File Endpoint Schemas
class FileIndexingRequest(BaseModel):
    user_id: int = Field(..., description="ID of the user uploading the file")
    file_url: str = Field(..., description="URL of the file to be indexed")
    file_id: str = Field(..., description="Unique identifier for the file")
    file_name: str = Field(..., description="Name of the file")
    file_type: str = Field(..., description="Type/extension of the file")
    

class FileIndexingResult(BaseModel):
    file_id: str
    file_name: str
    file_type: str
    chunks_processed: int
    chunks_indexed: int
    processing_status: str
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default={})

class FileIndexingResponse(BaseModel):
    success: bool
    message: str
    result: FileIndexingResult
    processing_time_seconds: float
    timestamp: datetime = Field(default_factory=datetime.now)

# Search Endpoint Schemas
class LearningMaterialsSearchRequest(BaseModel):
    user_id: int = Field(..., description="ID of the user searching materials")
    query: str = Field(..., min_length=1, max_length=500, description="Search query text")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of results to return")
    filters: Optional[Dict[str, Any]] = Field(default={}, description="Additional search filters")
    
    @validator('query')
    def validate_query(cls, v):
        if not v.strip():
            raise ValueError('Query cannot be empty or whitespace only')
        return v.strip()

class LearningMaterialsSearchResponse(BaseModel):
    success: bool
    search_result: Dict[str, Any]
    query: str
    total_results: int
    processing_time_seconds: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.now) 