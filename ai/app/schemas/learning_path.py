from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from enum import Enum

# Enums
class ExperienceLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"

class LearningPace(str, Enum):
    SLOW = "SLOW"
    MODERATE = "MODERATE"
    FAST = "FAST"
    INTENSIVE = "INTENSIVE"

class DifficultyLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"

class ResourceType(str, Enum):
    VIDEO = "VIDEO"
    COURSE = "COURSE"
    ARTICLE = "ARTICLE"
    BOOK = "BOOK"
    EXERCISE = "EXERCISE"
    PROJECT = "PROJECT"
    QUIZ = "QUIZ"
    PODCAST = "PODCAST"
    USER_MATERIAL = "USER_MATERIAL"

class ModuleStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"

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

# Request Schemas

class LearningPathGenerationRequest(BaseModel):
    user_id: int
    career_goal: str = Field(..., min_length=3, max_length=200)
    current_skills: List[str] = Field(default=[], description="List of current skills")
    experience_level: ExperienceLevel
    learning_pace: LearningPace
    uploaded_files: List[FileUploadInfo] = Field(default=[], description="User uploaded learning materials")
    additional_notes: Optional[str] = Field(None, max_length=1000)
    
    @validator('current_skills')
    def validate_skills(cls, v):
        if len(v) > 20:
            raise ValueError('Maximum 20 skills allowed')
        return v

class MaterialProcessingRequest(BaseModel):
    user_id: int
    files: List[FileUploadInfo]
    processing_options: Dict[str, Any] = Field(default={}, description="Additional processing parameters")

class WebResourceProcessingRequest(BaseModel):
    user_id: int
    module_id: int
    urls: List[str] = Field(..., min_items=1, max_items=10)
    
    @validator('urls')
    def validate_urls(cls, v):
        from urllib.parse import urlparse
        for url in v:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                raise ValueError(f'Invalid URL: {url}')
        return v

class LearningChatRequest(BaseModel):
    user_id: int
    module_id: int
    query: str = Field(..., min_length=1, max_length=1000)
    chat_history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous chat messages")
    context_filter: Optional[Dict[str, Any]] = Field(default={}, description="Filter for context search")

class AssessmentGenerationRequest(BaseModel):
    user_id: int
    module_id: int
    skill_focus: str
    difficulty_level: DifficultyLevel
    assessment_type: str = Field(default="comprehensive", description="Type of assessment to generate")
    custom_requirements: Optional[Dict[str, Any]] = Field(default={}, description="Custom assessment requirements")

class AssessmentSubmissionRequest(BaseModel):
    user_id: int
    assessment_id: str
    responses: Dict[str, Any] = Field(..., description="User responses to assessment questions")
    time_taken_minutes: Optional[int] = Field(None, description="Time taken to complete assessment")
    submission_metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional submission data")

class SkillAnalysisRequest(BaseModel):
    user_id: int
    career_goal: str
    current_skills: List[str]
    experience_level: ExperienceLevel
    uploaded_materials: List[FileUploadInfo] = Field(default=[])

# Response Schemas

class SkillGapAnalysis(BaseModel):
    required_skills: List[str]
    skill_gaps: List[str]
    skill_priorities: Dict[str, int]  # skill -> priority (1-5)
    learning_path_outline: List[str]
    estimated_weeks: int
    personalized_recommendations: List[str]
    confidence_score: float = Field(..., ge=0.0, le=1.0)

class LearningResource(BaseModel):
    title: str
    description: str
    url: str
    resource_type: ResourceType
    platform: str
    duration_minutes: Optional[int] = None
    difficulty_level: DifficultyLevel
    is_free: bool = True
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    language: str = "English"
    relevance_score: Optional[float] = Field(None, ge=0.0, le=1.0)

class UserMaterial(BaseModel):
    content: str
    source: str
    chunk_index: int
    relevance_score: float
    file_type: Optional[str] = None

class ModuleResources(BaseModel):
    user_materials: List[UserMaterial]
    online_resources: List[LearningResource]
    practice_exercises: List[str]

class LearningModule(BaseModel):
    order_index: int
    skill_focus: str
    title: str
    description: str
    difficulty_level: DifficultyLevel
    estimated_hours: int
    learning_objectives: List[str]
    resources: ModuleResources
    assessment_criteria: str
    prerequisites: List[str] = Field(default=[])

class LearningPathResponse(BaseModel):
    user_id: int
    career_goal: str
    skill_analysis: SkillGapAnalysis
    modules: List[LearningModule]
    overall_estimated_weeks: int
    created_at: datetime
    path_id: str

class MaterialProcessingResult(BaseModel):
    processed_files: List[Dict[str, Any]]
    failed_files: List[Dict[str, Any]]
    total_chunks: int
    indexed_successfully: int
    processing_time_seconds: float
    summary: str

class WebResourceProcessingResult(BaseModel):
    processed_urls: List[Dict[str, Any]]
    failed_urls: List[Dict[str, Any]]
    total_content_indexed: int
    processing_time_seconds: float
    module_id: int

class ChatResponse(BaseModel):
    response: str
    sources: List[str]
    relevance_scores: List[float]
    context_used: int
    chat_id: str
    timestamp: datetime
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)

class AssessmentQuestion(BaseModel):
    question_id: str
    question: str
    question_type: str  # multiple_choice, practical, conceptual
    options: Optional[List[str]] = None  # For multiple choice
    correct_answer: Optional[str] = None
    points: int
    difficulty: DifficultyLevel

class Assessment(BaseModel):
    assessment_id: str
    module_id: int
    skill_focus: str
    difficulty_level: DifficultyLevel
    questions: List[AssessmentQuestion]
    estimated_time_minutes: int
    total_points: int
    passing_score: int
    instructions: str
    created_at: datetime

class AssessmentEvaluation(BaseModel):
    assessment_id: str
    user_id: int
    overall_score: float = Field(..., ge=0.0, le=100.0)
    section_scores: Dict[str, float]
    correct_answers: List[str]
    detailed_feedback: Dict[str, str]
    strengths: List[str]
    improvement_areas: List[str]
    recommended_actions: List[str]
    knowledge_gaps: List[str]
    next_steps: List[str]
    evaluated_at: datetime
    grade: str  # A, B, C, D, F

class LearningProgress(BaseModel):
    user_id: int
    module_id: int
    progress_percentage: float = Field(..., ge=0.0, le=100.0)
    status: ModuleStatus
    time_spent_hours: float
    last_accessed: datetime
    assessments_completed: int
    average_assessment_score: Optional[float] = None

class LearningAnalytics(BaseModel):
    user_id: int
    total_learning_time_hours: float
    modules_completed: int
    average_score: float
    skill_improvements: Dict[str, float]  # skill -> improvement percentage
    learning_velocity: float  # modules per week
    engagement_metrics: Dict[str, Any]
    recommendations: List[str]

# Complex Response Schemas

class ComprehensiveLearningPathResponse(BaseModel):
    path_response: LearningPathResponse
    material_processing: Optional[MaterialProcessingResult] = None
    initial_analytics: LearningAnalytics
    next_steps: List[str]
    success: bool
    message: str

class LearningModuleDetail(BaseModel):
    module: LearningModule
    progress: Optional[LearningProgress] = None
    available_assessments: List[Assessment]
    chat_history: List[ChatResponse] = Field(default=[])
    resource_processing_status: Dict[str, str]

class SkillProgressTracking(BaseModel):
    skill: str
    initial_level: DifficultyLevel
    current_level: DifficultyLevel
    progress_percentage: float
    modules_related: List[int]
    assessments_completed: int
    average_score: float
    improvement_timeline: List[Dict[str, Any]]

class LearningPathAnalytics(BaseModel):
    user_id: int
    path_id: str
    overall_progress: float
    modules_analytics: List[LearningProgress]
    skill_progress: List[SkillProgressTracking]
    time_analytics: Dict[str, float]
    engagement_patterns: Dict[str, Any]
    predictive_insights: Dict[str, Any]
    recommendations: List[str]

# Error Response Schema
class ErrorResponse(BaseModel):
    error: str
    detail: str
    timestamp: datetime
    request_id: Optional[str] = None

# Utility Schemas
class SearchQuery(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    limit: int = Field(default=10, ge=1, le=50)
    user_id: int

class SearchResult(BaseModel):
    content: str
    source: str
    relevance_score: float
    metadata: Dict[str, Any]
    type: str  # material, resource, content

class BulkOperationRequest(BaseModel):
    user_id: int
    operation_type: str
    items: List[Dict[str, Any]]
    options: Dict[str, Any] = Field(default={})

class BulkOperationResponse(BaseModel):
    operation_id: str
    total_items: int
    successful_items: int
    failed_items: int
    errors: List[Dict[str, Any]]
    results: List[Dict[str, Any]]
    processing_time_seconds: float

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