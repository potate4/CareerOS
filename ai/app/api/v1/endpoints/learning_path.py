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
    LearningPathGenerationRequest,
    MaterialProcessingRequest,
    WebResourceProcessingRequest,
    LearningChatRequest,
    AssessmentGenerationRequest,
    AssessmentSubmissionRequest,
    SkillAnalysisRequest,
    LearningPathResponse,
    MaterialProcessingResult,
    WebResourceProcessingResult,
    ChatResponse,
    Assessment,
    AssessmentEvaluation,
    ComprehensiveLearningPathResponse,
    LearningModuleDetail,
    LearningPathAnalytics,
    ErrorResponse,
    FileUploadInfo,
    SearchQuery,
    SearchResult,
    BulkOperationRequest,
    BulkOperationResponse
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

@router.post("/analyze-skills", response_model=Dict[str, Any])
async def analyze_skills(
    request: SkillAnalysisRequest,
):
    """
    Analyze career goal and current skills to identify gaps and priorities
    """
    try:
        logger.info(f"Analyzing skills for user {request.user_id}")
      
        # Perform skill analysis
        analysis = await learning_ai.analyze_career_goal_and_skills(
            career_goal=request.career_goal,
            current_skills=request.current_skills,
            experience_level=request.experience_level.value,
            user_materials=[material.dict() for material in request.uploaded_materials]
        )
        
        logger.info(f"Skill analysis completed for user {request.user_id}")
        return {
            "success": True,
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in skill analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Skill analysis failed: {str(e)}")

@router.post("/generate", response_model=ComprehensiveLearningPathResponse)
async def generate_learning_path(
    request: LearningPathGenerationRequest,
    background_tasks: BackgroundTasks,
):
    """
    Generate a comprehensive AI-powered learning path
    """
    try:
        logger.info(f"Generating learning path for user {request.user_id}")
        start_time = time.time()
        
       
        
        # Step 1: Analyze skills and career goal
        skill_analysis = await learning_ai.analyze_career_goal_and_skills(
            career_goal=request.career_goal,
            current_skills=request.current_skills,
            experience_level=request.experience_level.value,
            user_materials=[file.dict() for file in request.uploaded_files]
        )
        
        # Step 2: Generate learning modules
        modules = await learning_ai.generate_learning_modules(
            skill_analysis=skill_analysis,
            learning_pace=request.learning_pace.value,
            user_id=request.user_id
        )
        
        # Step 3: Process uploaded materials if any
        material_processing_result = None
        if request.uploaded_files:
            material_processing_result = await learning_ai.process_learning_materials(
                files=[file.dict() for file in request.uploaded_files],
                user_id=request.user_id
            )
        
        # Create path response
        path_id = str(uuid.uuid4())
        path_response = LearningPathResponse(
            user_id=request.user_id,
            career_goal=request.career_goal,
            skill_analysis=skill_analysis,
            modules=modules,
            overall_estimated_weeks=skill_analysis.get('estimated_weeks', 12),
            created_at=datetime.now(),
            path_id=path_id
        )
        
        # Generate initial analytics
        initial_analytics = {
            "user_id": request.user_id,
            "total_learning_time_hours": sum(module.get('estimated_hours', 0) for module in modules),
            "modules_completed": 0,
            "average_score": 0.0,
            "skill_improvements": {},
            "learning_velocity": 0.0,
            "engagement_metrics": {},
            "recommendations": skill_analysis.get('personalized_recommendations', [])
        }
        
        processing_time = time.time() - start_time
        logger.info(f"Learning path generated in {processing_time:.2f}s for user {request.user_id}")
        
        return ComprehensiveLearningPathResponse(
            path_response=path_response,
            material_processing=material_processing_result,
            initial_analytics=initial_analytics,
            next_steps=[
                "Review your personalized learning modules",
                "Start with the first module",
                "Upload additional learning materials if needed",
                "Take module assessments to track progress"
            ],
            success=True,
            message=f"Learning path generated successfully with {len(modules)} modules"
        )
        
    except Exception as e:
        logger.error(f"Error generating learning path: {e}")
        raise HTTPException(status_code=500, detail=f"Learning path generation failed: {str(e)}")

@router.post("/index-file")
async def index_file(
    request: dict,
):
    """
    Index a single file from URL for learning materials
    """
    try:
        user_id = request.get('user_id')
        file_url = request.get('file_url')
        file_id = request.get('file_id')
        file_name = request.get('file_name')
        file_type = request.get('file_type')
        
        # Validate required fields
        if not all([user_id, file_url, file_id, file_name, file_type]):
            raise HTTPException(
                status_code=400, 
                detail="Missing required fields: user_id, file_url, file_id, file_name, file_type"
            )
        

        # Validate file type
        allowed_types = {'pdf', 'docx', 'pptx', 'doc', 'ppt'}
        if file_type.lower() not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file_type}. Allowed: {', '.join(allowed_types)}"
            )
        
        logger.info(f"Indexing file {file_name} for user {user_id}")
        start_time = time.time()
        
        # Process and index the file
        processing_result = await learning_ai.process_learning_materials(
            file_url=file_url,
            file_id=file_id,
            file_name=file_name,
            file_type=file_type,
            user_id=user_id
        )
        
        processing_time = time.time() - start_time
        processing_result['processing_time_seconds'] = processing_time
        
        logger.info(f"File indexing completed in {processing_time:.2f}s for user {user_id}")
        
        return {
            "success": True,
            "message": f"Successfully indexed file {file_name}",
            "result": processing_result
        }
        
    except Exception as e:
        logger.error(f"Error indexing file: {e}")
        raise HTTPException(status_code=500, detail=f"File indexing failed: {str(e)}")

@router.post("/upload-materials", response_model=MaterialProcessingResult)
async def upload_learning_materials(
    user_id: int = Form(...),
    files: List[UploadFile] = File(...),
):
    """
    Upload and process learning materials (PDF, DOCX, PPTX)
    """
    try:
        logger.info(f"Processing {len(files)} files for user {user_id}")
        start_time = time.time()
        
    
        # Validate file types
        allowed_types = {'.pdf', '.docx', '.pptx', '.doc', '.ppt'}
        file_infos = []
        
        for file in files:
            file_extension = Path(file.filename).suffix.lower()
            if file_extension not in allowed_types:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file type: {file_extension}. Allowed: {', '.join(allowed_types)}"
                )
            
            # Save file
            file_id = str(uuid.uuid4())
            file_path = UPLOAD_DIR / f"{user_id}_{file_id}_{file.filename}"
            
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            file_infos.append(FileUploadInfo(
                user_id=user_id,
                filename=file.filename,
                file_path=str(file_path),
                file_type=file_extension[1:],  # Remove dot
                file_size=len(content),
                upload_date=datetime.now()
            ))
        
        # Process materials
        processing_result = await learning_ai.process_learning_materials(
            files=[file_info.dict() for file_info in file_infos],
            user_id=user_id
        )
        
        processing_time = time.time() - start_time
        processing_result['processing_time_seconds'] = processing_time
        processing_result['summary'] = f"Processed {len(file_infos)} files, indexed {processing_result['indexed_successfully']} chunks"
        
        logger.info(f"Material processing completed in {processing_time:.2f}s for user {user_id}")
        
        return MaterialProcessingResult(**processing_result)
        
    except Exception as e:
        logger.error(f"Error processing materials: {e}")
        raise HTTPException(status_code=500, detail=f"Material processing failed: {str(e)}")

@router.post("/process-web-resources", response_model=WebResourceProcessingResult)
async def process_web_resources(
    request: WebResourceProcessingRequest,
):
    """
    Process and index web resources (YouTube videos, articles) for a learning module
    """
    try:
        logger.info(f"Processing {len(request.urls)} web resources for module {request.module_id}")
        start_time = time.time()
        
      
        # Process web resources
        processing_result = await learning_ai.process_web_resources(
            urls=request.urls,
            module_id=request.module_id,
            user_id=request.user_id
        )
        
        processing_time = time.time() - start_time
        processing_result['processing_time_seconds'] = processing_time
        processing_result['module_id'] = request.module_id
        
        logger.info(f"Web resource processing completed in {processing_time:.2f}s")
        
        return WebResourceProcessingResult(**processing_result)
        
    except Exception as e:
        logger.error(f"Error processing web resources: {e}")
        raise HTTPException(status_code=500, detail=f"Web resource processing failed: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
async def chat_with_learning_resources(
    request: LearningChatRequest,
):
    """
    Chat with learning resources using RAG for a specific module
    """
    try:
        logger.info(f"Processing chat query for user {request.user_id}, module {request.module_id}")
        
        
        # Process chat query
        chat_result = await learning_ai.chat_with_learning_resources(
            query=request.query,
            module_id=request.module_id,
            user_id=request.user_id,
            chat_history=request.chat_history
        )
        
        # Create response
        response = ChatResponse(
            response=chat_result['response'],
            sources=chat_result['sources'],
            relevance_scores=chat_result['relevance_scores'],
            context_used=chat_result['context_used'],
            chat_id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            confidence_score=sum(chat_result['relevance_scores']) / len(chat_result['relevance_scores']) 
                           if chat_result['relevance_scores'] else 0.0
        )
        
        logger.info(f"Chat response generated for user {request.user_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error in chat functionality: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.post("/search")
async def search_learning_materials(
    request: dict,
):
    """
    Search learning materials using RAG for a specific user
    """
    try:
        user_id = request.get('user_id')
        query = request.get('query')
        limit = request.get('limit', 10)
        
        # Validate required fields
        if not all([user_id, query]):
            raise HTTPException(
                status_code=400, 
                detail="Missing required fields: user_id, query"
            )
        

        # Validate limit
        if limit < 1 or limit > 50:
            limit = 10  # Default to 10 if invalid
        
        logger.info(f"Searching materials for user {user_id}: {query}")
        
        # Search learning materials
        search_result = await learning_ai.search_learning_materials(
            query=query,
            user_id=user_id,
            limit=limit
        )
        
        return {
            "success": True,
            "search_result": search_result
        }
        
    except Exception as e:
        logger.error(f"Error in search functionality: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/generate-assessment", response_model=Assessment)
async def generate_module_assessment(
    request: AssessmentGenerationRequest,
):
    """
    Generate AI-powered assessment for a learning module
    """
    try:
        logger.info(f"Generating assessment for module {request.module_id}")
        
        # Generate assessment
        assessment_data = await learning_ai.generate_module_assessment(
            module_id=request.module_id,
            skill_focus=request.skill_focus,
            difficulty_level=request.difficulty_level.value,
            user_id=request.user_id
        )
        
        # Convert to response format
        questions = []
        total_points = 0
        
        # Process multiple choice questions
        for i, mc_q in enumerate(assessment_data.get('multiple_choice', [])):
            questions.append({
                "question_id": f"mc_{i}",
                "question": mc_q['question'],
                "question_type": "multiple_choice",
                "options": mc_q['options'],
                "correct_answer": mc_q['correct_answer'],
                "points": 5,
                "difficulty": request.difficulty_level
            })
            total_points += 5
        
        # Process practical exercises
        for i, exercise in enumerate(assessment_data.get('practical_exercises', [])):
            questions.append({
                "question_id": f"practical_{i}",
                "question": exercise,
                "question_type": "practical",
                "options": None,
                "correct_answer": None,
                "points": 10,
                "difficulty": request.difficulty_level
            })
            total_points += 10
        
        # Process conceptual questions
        for i, concept_q in enumerate(assessment_data.get('conceptual_questions', [])):
            questions.append({
                "question_id": f"conceptual_{i}",
                "question": concept_q,
                "question_type": "conceptual",
                "options": None,
                "correct_answer": None,
                "points": 8,
                "difficulty": request.difficulty_level
            })
            total_points += 8
        
        assessment = Assessment(
            assessment_id=assessment_data['assessment_id'],
            module_id=request.module_id,
            skill_focus=request.skill_focus,
            difficulty_level=request.difficulty_level,
            questions=questions,
            estimated_time_minutes=assessment_data.get('estimated_time', 60),
            total_points=total_points,
            passing_score=int(total_points * 0.7),  # 70% passing
            instructions="Complete all questions to the best of your ability. Practical exercises should include working code or detailed explanations.",
            created_at=datetime.now()
        )
        
        logger.info(f"Assessment generated with {len(questions)} questions")
        return assessment
        
    except Exception as e:
        logger.error(f"Error generating assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment generation failed: {str(e)}")

@router.post("/submit-assessment", response_model=AssessmentEvaluation)
async def submit_assessment(
    request: AssessmentSubmissionRequest,
):
    """
    Submit and evaluate assessment responses
    """
    try:
        logger.info(f"Evaluating assessment {request.assessment_id} for user {request.user_id}")
        

        
        # Evaluate assessment
        evaluation_data = await learning_ai.evaluate_assessment_response(
            assessment_id=request.assessment_id,
            user_responses=request.responses,
            user_id=request.user_id
        )
        
        # Determine grade based on score
        score = evaluation_data['overall_score']
        if score >= 90:
            grade = "A"
        elif score >= 80:
            grade = "B"
        elif score >= 70:
            grade = "C"
        elif score >= 60:
            grade = "D"
        else:
            grade = "F"
        
        evaluation = AssessmentEvaluation(
            assessment_id=request.assessment_id,
            user_id=request.user_id,
            overall_score=evaluation_data['overall_score'],
            section_scores=evaluation_data['section_scores'],
            correct_answers=evaluation_data['correct_answers'],
            detailed_feedback=evaluation_data['feedback'],
            strengths=evaluation_data['strengths'],
            improvement_areas=evaluation_data['improvement_areas'],
            recommended_actions=evaluation_data['recommended_actions'],
            knowledge_gaps=evaluation_data['knowledge_gaps'],
            next_steps=evaluation_data.get('next_steps', evaluation_data['recommended_actions']),
            evaluated_at=datetime.now(),
            grade=grade
        )
        
        logger.info(f"Assessment evaluation completed with score {score}%")
        return evaluation
        
    except Exception as e:
        logger.error(f"Error evaluating assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment evaluation failed: {str(e)}")

@router.get("/module/{module_id}", response_model=LearningModuleDetail)
async def get_module_details(
    module_id: int,
    user_id: int,
):
    """
    Get detailed information about a learning module including progress and resources
    """
    try:
        logger.info(f"Fetching module {module_id} details for user {user_id}")
        
        # Verify user authorization
   
        # This would typically fetch from database
        # For now, return a mock response
        module_detail = {
            "module": {
                "order_index": 1,
                "skill_focus": "Python Programming",
                "title": "Master Python Fundamentals",
                "description": "Learn Python programming from basics to advanced concepts",
                "difficulty_level": "INTERMEDIATE",
                "estimated_hours": 20,
                "learning_objectives": [
                    "Understand Python syntax",
                    "Work with data structures",
                    "Implement algorithms"
                ],
                "resources": {
                    "user_materials": [],
                    "online_resources": [],
                    "practice_exercises": ["Build a calculator", "Create a web scraper"]
                },
                "assessment_criteria": "Complete all exercises and pass the assessment",
                "prerequisites": ["Basic programming knowledge"]
            },
            "progress": None,
            "available_assessments": [],
            "chat_history": [],
            "resource_processing_status": {"status": "completed"}
        }
        
        return LearningModuleDetail(**module_detail)
        
    except Exception as e:
        logger.error(f"Error fetching module details: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch module details: {str(e)}")

@router.post("/search", response_model=List[SearchResult])
async def search_learning_content(
    request: SearchQuery,
):
    """
    Search through learning materials and resources
    """
    try:
        logger.info(f"Searching content for user {request.user_id}: {request.query}")
        
      
        
        # Generate query embedding
        query_embedding = learning_ai.embedding_model.encode(request.query).tolist()
        
        # Search in both collections
        search_results = []
        
        # Search user materials
        user_results = learning_ai.qdrant_client.search(
            collection_name=learning_ai.learning_materials_collection,
            query_vector=query_embedding,
            query_filter={"must": [{"key": "user_id", "match": {"value": request.user_id}}]},
            limit=request.limit // 2
        )
        
        for result in user_results:
            search_results.append(SearchResult(
                content=result.payload['content'],
                source=result.payload['source'],
                relevance_score=result.score,
                metadata=result.payload,
                type="user_material"
            ))
        
        # Search module content
        module_results = learning_ai.qdrant_client.search(
            collection_name=learning_ai.module_content_collection,
            query_vector=query_embedding,
            query_filter={"must": [{"key": "user_id", "match": {"value": request.user_id}}]},
            limit=request.limit // 2
        )
        
        for result in module_results:
            search_results.append(SearchResult(
                content=result.payload['content'],
                source=result.payload['source'],
                relevance_score=result.score,
                metadata=result.payload,
                type="module_content"
            ))
        
        # Sort by relevance
        search_results.sort(key=lambda x: x.relevance_score, reverse=True)
        
        logger.info(f"Found {len(search_results)} search results")
        return search_results[:request.limit]
        
    except Exception as e:
        logger.error(f"Error in search: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/analytics/{user_id}", response_model=LearningPathAnalytics)
async def get_learning_analytics(
    user_id: int,
    path_id: Optional[str] = None,
):
    """
    Get comprehensive learning analytics for a user
    """
    try:
        logger.info(f"Fetching analytics for user {user_id}")
        
        # Verify user authorization
        if current_user["id"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized access")
        
        # Mock analytics data (would be computed from actual data)
        analytics = LearningPathAnalytics(
            user_id=user_id,
            path_id=path_id or "default_path",
            overall_progress=45.7,
            modules_analytics=[],
            skill_progress=[],
            time_analytics={
                "total_hours": 23.5,
                "this_week": 4.2,
                "average_session": 1.8
            },
            engagement_patterns={
                "preferred_time": "evening",
                "learning_streak": 7,
                "completion_rate": 0.85
            },
            predictive_insights={
                "estimated_completion": "2024-04-15",
                "risk_factors": [],
                "optimization_suggestions": ["More practice exercises"]
            },
            recommendations=[
                "Focus on practical exercises",
                "Take more assessments",
                "Review difficult concepts"
            ]
        )
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Analytics retrieval failed: {str(e)}")

@router.delete("/materials/{user_id}")
async def delete_user_materials(
    user_id: int,
    material_ids: Optional[List[str]] = None,
):
    """
    Delete user learning materials from vector database
    """
    try:
        logger.info(f"Deleting materials for user {user_id}")
        
       
        
        if material_ids:
            # Delete specific materials
            learning_ai.qdrant_client.delete(
                collection_name=learning_ai.learning_materials_collection,
                points_selector={"ids": material_ids}
            )
            deleted_count = len(material_ids)
        else:
            # Delete all user materials
            learning_ai.qdrant_client.delete(
                collection_name=learning_ai.learning_materials_collection,
                points_selector={"filter": {"must": [{"key": "user_id", "match": {"value": user_id}}]}}
            )
            deleted_count = "all"
        
        logger.info(f"Deleted {deleted_count} materials for user {user_id}")
        return {"success": True, "deleted": deleted_count}
        
    except Exception as e:
        logger.error(f"Error deleting materials: {e}")
        raise HTTPException(status_code=500, detail=f"Material deletion failed: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Health check endpoint for learning path AI service
    """
    try:
        # Test connections
        collections = learning_ai.qdrant_client.get_collections()
        
        return {
            "status": "healthy",
            "service": "Learning Path AI",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "qdrant_collections": len(collections.collections),
            "features": [
                "skill_analysis",
                "learning_path_generation",
                "file_indexing_from_url",
                "semantic_chunking",
                "rag_search",
                "rag_chat",
                "assessment_generation",
                "progress_analytics"
            ],
            "endpoints": [
                "/index-file",
                "/search",
                "/chat",
                "/generate-assessment",
                "/upload-materials"
            ]
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "Learning Path AI",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        } 