import os
import json
import hashlib
import logging
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import asyncio
import aiohttp
import fitz  # PyMuPDF for PDF processing
from docx import Document  # python-docx for DOCX processing
from pptx import Presentation  # python-pptx for PPT processing
import youtube_dl
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import openai
from sentence_transformers import SentenceTransformer
import qdrant_client
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams, PointStruct
import uuid
from datetime import datetime, timedelta
import re
from app.core.qdrant import qdrantClient
from app.core.config import settings
from qdrant_client.http import models as rest
from app.helpers.semantic_chunker import create_semantic_chunks_80
from app.helpers.qdrant_functions import upload_to_qdrant
from app.schemas.learning_path import FileUploadInfo, ChatMessage, AssessmentQuestion
from qdrant_client.models import Filter, FieldCondition, MatchValue, Range

from app.helpers.llm import get_gemini_text_completion, get_gemini_text_completion_with_search, get_structured_response_learning_modules, get_structured_response_assessment_questions, get_structured_response_assessment_answers_and_scores
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LearningPathAI:
    def __init__(self):
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize Qdrant client
        self.qdrant_client = qdrantClient
        
        # Collection names
        self.learning_materials_collection = "learning_materials23"
        self.module_content_collection = "module_content"
        
        # Ensure collections exist
        self._ensure_collections()
    
    def _ensure_collections(self):
        """Ensure Qdrant collections exist"""
        try:
            collections = self.qdrant_client.get_collections().collections
            collection_names = [col.name for col in collections]
            
            if self.learning_materials_collection not in collection_names:
                self.qdrant_client.create_collection(
                    collection_name=self.learning_materials_collection,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                )
                logger.info(f"Created collection: {self.learning_materials_collection}")

                # Create payload indexes
                self.qdrant_client.create_payload_index(
                    collection_name=self.learning_materials_collection,
                    field_name="module_id",
                    field_schema=rest.PayloadSchemaType.INTEGER
                )
                self.qdrant_client.create_payload_index(
                    collection_name=self.learning_materials_collection,
                    field_name="user_id",
                    field_schema=rest.PayloadSchemaType.INTEGER
                )
                self.qdrant_client.create_payload_index(
                    collection_name=self.learning_materials_collection,
                    field_name="file_id",
                    field_schema=rest.PayloadSchemaType.KEYWORD
                )
                self.qdrant_client.create_payload_index(
                    collection_name=self.learning_materials_collection,
                    field_name="is_active",
                    field_schema=rest.PayloadSchemaType.BOOLEAN
                )
         
            
            if self.module_content_collection not in collection_names:
                self.qdrant_client.create_collection(
                    collection_name=self.module_content_collection,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                )
                logger.info(f"Created collection: {self.module_content_collection}")
                
        except Exception as e:
            logger.error(f"Error ensuring collections: {e}")

    
    async def process_learning_materials(self, file_url: str, file_id: str, file_name: str, file_type: str, user_id: int, module_id: int) -> Dict[str, Any]:
        """Process and index a single learning material from URL"""
        try:
            self._ensure_collections()
            processing_results = {
                'file_id': file_id,
                'filename': file_name,
                'file_type': file_type,
                'chunks_created': 0,
                'chunks_indexed': 0,
                'status': 'processing',
                'module_id': module_id
            }
            
            logger.info(f"Starting to process file: {file_name} (ID: {file_id}) of type: {file_type}")
            logger.info(f"File URL: {file_url}")
            
            try:
                # Download and extract content from file URL
                content = await self._extract_file_content_from_url(file_url, file_type)
                
                if content and content.get("text"):
                    logger.info(f"Successfully extracted content from {file_name}, text length: {len(content['text'])}")
                    
                    # Use semantic chunking from semantic_chunker.py
                    semantic_chunks = create_semantic_chunks_80(content["text"])
                    logger.info(f"Created {len(semantic_chunks)} semantic chunks from {file_name}")
                    
                    # Create FileUploadInfo object for qdrant_functions
                    file_info = FileUploadInfo(
                        user_id=user_id,
                        file_id=file_id,
                        file_name=file_name,
                        file_url=file_url,  # Use URL as file_path
                        file_type=file_type,
                        file_size=content.get("file_size", 0),
                        upload_date=datetime.now(),
                        module_id=module_id
                    )
                    
                    logger.info(f"Uploading {len(semantic_chunks)} chunks to Qdrant for {file_name}")
                    # Upload chunks to Qdrant
                    upload_to_qdrant(
                        file_create=file_info,
                        page_no="1",  # Single page for now
                        semantic_chunks=semantic_chunks,
                        summaries=[chunk.page_content[:100] for chunk in semantic_chunks],  # Simple summaries
                        collection_name=self.learning_materials_collection
                    )
                    logger.info(f"Successfully uploaded chunks to Qdrant for {file_name}")
                    
                    processing_results['chunks_created'] = len(semantic_chunks)
                    processing_results['chunks_indexed'] = len(semantic_chunks)
                    processing_results['status'] = 'completed'
                    
                    logger.info(f"Successfully processed and indexed {file_name}: {len(semantic_chunks)} chunks")
                else:
                    error_msg = 'Failed to extract content or content is empty'
                    if content and not content.get("text"):
                        error_msg = 'Content extracted but text is empty'
                    elif not content:
                        error_msg = 'Failed to extract content from file'
                    
                    logger.error(f"Content extraction failed for {file_name}: {error_msg}")
                    processing_results['status'] = 'failed'
                    processing_results['error'] = error_msg
                    
            except Exception as e:
                logger.error(f"Error processing file {file_name}: {e}")
                processing_results['status'] = 'failed'
                processing_results['error'] = str(e)
            
            return processing_results
            
        except Exception as e:
            logger.error(f"Error in material processing: {e}")
            raise
    

    async def search_learning_materials(self, query: str, user_id: int, limit: int = 10, module_id: int = None) -> Dict[str, Any]:
        """Search learning materials using RAG for a specific user and optionally by module"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Build filter conditions - both user_id AND module_id must match
            search_filter = Filter(
                    must=[
                    FieldCondition(
                        key="user_id",
                        match=MatchValue(value=user_id)
                    ),
                    FieldCondition(
                        key="module_id",
                        match=MatchValue(value=module_id)
                    )
                ]
            )       
            

            
            logger.info(f"Searching with filter: user_id={user_id}, module_id={module_id}, conditions={search_filter}")
            
            # Search for relevant content in learning materials collection
            results = self.qdrant_client.search(
                collection_name=self.learning_materials_collection,
                query_vector=query_embedding,
                query_filter=search_filter,
                limit=limit
            )
            
            logger.info(f"Found {len(results)} results matching the filter criteria")
            
            # Format results with metadata
            formatted_results = []
            for result in results:
                formatted_results.append({
                    'chunk_id': result.id,
                    'content': result.payload['content'],
                    'source': result.payload.get('source', ''),
                    'filename': result.payload.get('file_name', ''),
                    'file_type': result.payload.get('type', ''),
                    'relevance_score': result.score,
                    'file_url': result.payload.get('file_url', ''),
                    'file_name': result.payload.get('file_name', ''),
                    'file_type': result.payload.get('file_type', ''),
                    'file_size': result.payload.get('file_size', ''),
                    'user_id': result.payload.get('user_id', ''),
                    'module_id': result.payload.get('module_id', ''),
                    'file_id': result.payload.get('file_id', ''),
                    'upload_date': result.payload.get('created_at', ''),
                    'page_no': result.payload.get('page_no', ''),
                    'is_active': result.payload.get('is_active', True)
                
                })
            
            return {
                'query': query,
                'user_id': user_id,
                'module_id': module_id,
                'results_count': len(formatted_results),
                'results': formatted_results
            }
            
        except Exception as e:
            logger.error(f"Error in search functionality: {e}")
            return {
                'query': query,
                'user_id': user_id,
                'module_id': module_id,
                'results_count': 0,
                'results': [],
                'error': str(e)
            }

    async def _extract_file_content_from_url(self, file_url: str, file_type: str) -> Optional[Dict[str, Any]]:
        """Extract content from file URL"""
        try:
            import requests
            from pathlib import Path
            
            # Normalize file type - handle MIME types and extensions
            file_type = file_type.lower().strip()
            if file_type.startswith('application/'):
                # Extract extension from MIME type
                if 'pdf' in file_type:
                    file_type = 'pdf'
                elif 'word' in file_type or 'document' in file_type:
                    file_type = 'docx'
                elif 'powerpoint' in file_type or 'presentation' in file_type:
                    file_type = 'pptx'
                elif 'text' in file_type:
                    file_type = 'txt'
            
            # Remove any remaining MIME type prefixes
            if '/' in file_type:
                file_type = file_type.split('/')[-1]
            
            logger.info(f"Normalized file type: {file_type} for URL: {file_url}")
            
            # Create uploads directory if it doesn't exist
            # Use absolute path to avoid working directory issues
            current_file = Path(__file__)
            project_root = current_file.parent.parent.parent.parent  # Go up to ai/ directory
            uploads_dir = project_root / "uploads"
            uploads_dir.mkdir(exist_ok=True)
            
            logger.info(f"Using uploads directory: {uploads_dir.absolute()}")
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}.{file_type}"
            file_path = uploads_dir / safe_filename
            
            # Download file from URL
            logger.info(f"Downloading file from: {file_url}")
            response = requests.get(file_url, stream=True, timeout=60)
            response.raise_for_status()
            
            # Check if we actually got content
            if response.headers.get('content-length'):
                expected_size = int(response.headers['content-length'])
                logger.info(f"Expected file size: {expected_size} bytes")
            
            # Save file to uploads directory
            with open(file_path, 'wb') as f:
                downloaded_size = 0
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:  # Filter out keep-alive chunks
                        f.write(chunk)
                        downloaded_size += len(chunk)
            
            logger.info(f"Downloaded {downloaded_size} bytes to: {file_path}")
            
            # Verify file was downloaded and has content
            if not file_path.exists() or file_path.stat().st_size == 0:
                raise Exception(f"Downloaded file is empty or doesn't exist: {file_path}")
                
            try:
                content = {"text": "", "metadata": {}}
                
                if file_type == 'pdf':
                    doc = fitz.open(str(file_path))
                    text = ""
                    for page in doc:
                        text += page.get_text()
                    content["text"] = text
                    content["metadata"] = {"pages": len(doc), "file_type": "pdf"}
                    doc.close()
                    
                elif file_type in ['docx', 'doc']:
                    doc = Document(str(file_path))
                    text = ""
                    for paragraph in doc.paragraphs:
                        text += paragraph.text + "\n"
                    content["text"] = text
                    content["metadata"] = {"paragraphs": len(doc.paragraphs), "file_type": "docx"}
                    
                elif file_type in ['pptx', 'ppt']:
                    prs = Presentation(str(file_path))
                    text = ""
                    for slide in prs.slides:
                        for shape in slide.shapes:
                            if hasattr(shape, "text"):
                                text += shape.text + "\n"
                    content["text"] = text
                    content["metadata"] = {"slides": len(prs.slides), "file_type": "pptx"}
                
                # Add file size metadata
                content["metadata"]["file_size"] = len(content["text"])
                content["metadata"]["source_url"] = file_url
                content["metadata"]["local_path"] = str(file_path)
                content["metadata"]["processed_file_type"] = file_type
                
                # Only return content if we successfully extracted text
                if content["text"].strip():
                    logger.info(f"Successfully extracted content from {file_path}, text length: {len(content['text'])}")
                    return content
                else:
                    logger.warning(f"No text content extracted from {file_path}")
                    return None
                
            finally:
                # Clean up the downloaded file after processing
                try:
                    if file_path.exists():
                        file_path.unlink()
                        logger.info(f"Cleaned up temporary file: {file_path}")
                except Exception as cleanup_error:
                    logger.warning(f"Failed to cleanup file {file_path}: {cleanup_error}")
            
        except Exception as e:
            logger.error(f"Error extracting content from URL {file_url}: {e}")
            return None


    async def get_learning_path(self, learning_path_info: str) -> Dict[str, Any]:
        """Get learning path for a specific user"""
        try:
            prompt = f"""
            Create a list of learning modules (2-10) based on the learning path info: {learning_path_info}
            Return the list of learning modules in a structured format.
            """
            response = get_structured_response_learning_modules(prompt)
            return response
        except Exception as e:
            logger.error(f"Error in get_learning_path: {e}")
            return None
    
    async def generate_chat_reply(self, user_id: int, module_id: int, chat_history: List[ChatMessage], user_message: str):
        """Generate a chat reply for a specific user and module based on study materials"""
        try:
            logger.info(f"Generating chat reply for user {user_id}, module {module_id}")
            
            # Search for relevant learning materials for this user and module
            # Use a general query to get context from the user's materials
            knowledge_base = await self.search_learning_materials(
                query="learning materials and content",
                user_id=user_id,
                module_id=module_id,  # Always filter by specific module
                limit=10  # Get more context for better responses
            )
            
            logger.info(f"Retrieved {knowledge_base.get('results_count', 0)} learning materials for user {user_id}, module {module_id}")
            
            # Format chat history for context
            chat_context = ""
            if chat_history:
                chat_context = "\n".join([
                    f"{msg.role}: {msg.content}" for msg in chat_history[-10:]  # Last 10 messages for context
                ])
            
            # Format knowledge base for context
            knowledge_context = ""
            if knowledge_base and knowledge_base.get('results'):
                knowledge_context = "\n".join([
                    f"Content: {result.get('content', '')[:200]}..." 
                    for result in knowledge_base['results'][:5]  # Top 5 most relevant results
                ])
            
            prompt = f"""
            You are a helpful learning assistant. Use the following context to answer the user's question:

            **User's Learning Materials:**
            {knowledge_context if knowledge_context else "No specific learning materials found for this user/module."}

            **Recent Chat History:**
            {chat_context if chat_context else "No previous chat history."}

            **User's Current Question:**
            {user_message}

            **Instructions:**
            - Provide a helpful, educational response based on the available learning materials
            - If the materials don't contain relevant information, provide general guidance
            - Keep responses concise but informative
            - Use a friendly, encouraging tone
            - If appropriate, suggest related topics or next steps for learning

            **Response:**
            """
            
            logger.info(f"Generating AI response for user {user_id}")
            answer = get_gemini_text_completion(prompt)
            
            if answer:
                logger.info(f"Successfully generated chat reply for user {user_id}")
                return answer
            else:
                logger.warning(f"AI returned empty response for user {user_id}")
                return "I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question or ask me something else about your learning materials."
                
        except Exception as e:
            logger.error(f"Error in generate_chat_reply: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again later."
        
    async def create_assessment(self, user_id: int, module_id: int, assessment_type: str = "quiz", num_questions: int = 5, difficulty: str = "medium") -> Dict[str, Any]:
        """Create assessment questions for a specific user and module based on study materials"""
        try:
            logger.info(f"Creating {assessment_type} assessment for user {user_id}, module {module_id}")
            
            # Search for relevant learning materials for this user and module
            knowledge_base = await self.search_learning_materials(
                query="learning materials and content",
                user_id=user_id,
                module_id=module_id,
                limit=15  # Get more context for better question generation
            )
            
            logger.info(f"Retrieved {knowledge_base.get('results_count', 0)} learning materials for assessment generation")
            
            # Format knowledge base for context
            knowledge_context = ""
            if knowledge_base and knowledge_base.get('results'):
                knowledge_context = "\n".join([
                    f"Content: {result.get('content', '')[:300]}..." 
                    for result in knowledge_base['results'][:8]  # Top 8 most relevant results
                ])
            else:
                knowledge_context = "General knowledge about the subject matter."
            
            # Generate assessment questions using structured response
            prompt = f"""
            Based on the following learning materials, create {num_questions} assessment questions for a {difficulty} level {assessment_type}.

            **Learning Materials Context:**
            {knowledge_context}

            **Requirements:**
            - Generate exactly {num_questions} questions
            - Questions should be {difficulty} difficulty level
            - Mix of question types: text-based, multiple choice, and true/false
            - Questions should test understanding of key concepts
            - Include correct answers and explanations where appropriate
            - Make questions relevant to the learning materials provided

            **Question Types to Include:**
            - Text-based questions (require written answers)
            - Multiple choice questions (with 4 options)
            - True/false questions

            **Format:**
            Return the questions in a structured format that can be parsed.
            """
            
            logger.info(f"Generating assessment questions for user {user_id}")
            
            try:
                questions = get_structured_response_assessment_questions(prompt)
                logger.info(f"Successfully generated {len(questions) if questions else 0} assessment questions")
                
                if questions and len(questions) > 0:
                    # Generate unique assessment ID
                    assessment_id = f"assessment_{user_id}_{module_id}_{int(datetime.now().timestamp())}"
                    
                    return {
                        "success": True,
                        "message": f"Assessment created successfully with {len(questions)} questions",
                        "assessment_id": assessment_id,
                        "questions": questions,
                        "user_id": user_id,
                        "module_id": module_id,
                        "assessment_type": assessment_type,
                        "difficulty": difficulty,
                        "created_at": datetime.now().isoformat()
                    }
                else:
                    logger.warning("AI returned empty or invalid questions")
                    return {
                        "success": False,
                        "message": "Failed to generate assessment questions",
                        "error": "AI returned empty response"
                    }
                    
            except Exception as ai_error:
                logger.error(f"Error in AI question generation: {ai_error}")
                return {
                    "success": False,
                    "message": "Failed to generate assessment questions",
                    "error": str(ai_error)
                }
                
        except Exception as e:
            logger.error(f"Error in create_assessment: {e}")
            return {
                "success": False,
                "message": "Failed to create assessment",
                "error": str(e)
            }
    
    async def score_assessment(self, assessment_id: str, user_id: int, module_id: int, questions: List[AssessmentQuestion], answers: List[Dict[str, str]]) -> Dict[str, Any]:
        """Score an assessment submission and provide feedback"""
        try:
            logger.info(f"Scoring assessment {assessment_id} for user {user_id}")
            
            if not questions or not answers:
                return {
                    "success": False,
                    "message": "Invalid assessment data",
                    "error": "Missing questions or answers"
                }
            
            # Prepare scoring prompt
            scoring_data = []
            for i, question in enumerate(questions):
                if i < len(answers):
                    answer_key = list(answers[i].keys())[0] if answers[i] else ""
                    user_answer = list(answers[i].values())[0] if answers[i] else ""
                    scoring_data.append({
                        "question": question.question,
                        "correct_answer": question.correct_answer or "",
                        "provided_answer": user_answer,
                        "question_type": question.question_type
                    })
            
            scoring_prompt = f"""
            Score the following assessment answers and provide detailed feedback:

            **Assessment Data:**
            {json.dumps(scoring_data, indent=2)}

            **Scoring Instructions:**
            - Score each answer on a scale of 0.0 to 1.0
            - Provide constructive feedback for each answer
            - Determine if each answer is correct
            - Give an overall assessment of performance
            - Be encouraging and educational in feedback

            **Scoring Criteria:**
            - 1.0: Completely correct answer
            - 0.8-0.9: Mostly correct with minor issues
            - 0.6-0.7: Partially correct
            - 0.4-0.5: Some understanding but significant errors
            - 0.0-0.3: Incorrect or no understanding shown

            Return the scoring results in a structured format.
            """
            
            logger.info(f"Scoring assessment answers for user {user_id}")
            
            try:
                scored_results = get_structured_response_assessment_answers_and_scores(scoring_prompt)
                logger.info(f"Successfully scored assessment for user {user_id}")
                
                if scored_results and len(scored_results) > 0:
                    # Calculate total score
                    total_score = sum(result.score for result in scored_results)
                    max_score = len(scored_results)
                    percentage = (total_score / max_score) * 100 if max_score > 0 else 0
                    
                    # Generate overall feedback
                    if percentage >= 90:
                        overall_feedback = "Excellent work! You have a strong understanding of the material."
                    elif percentage >= 80:
                        overall_feedback = "Great job! You have a good grasp of the concepts."
                    elif percentage >= 70:
                        overall_feedback = "Good work! You understand most of the material with room for improvement."
                    elif percentage >= 60:
                        overall_feedback = "You're on the right track! Review the areas where you struggled."
                    else:
                        overall_feedback = "Keep studying! Focus on understanding the core concepts better."
                    
                    return {
                        "success": True,
                        "message": "Assessment scored successfully",
                        "assessment_id": assessment_id,
                        "user_id": user_id,
                        "module_id": module_id,
                        "total_score": total_score,
                        "max_score": max_score,
                        "percentage": round(percentage, 1),
                        "answers_and_scores": scored_results,
                        "overall_feedback": overall_feedback,
                        "completed_at": datetime.now().isoformat()
                    }
                else:
                    logger.warning("AI returned empty scoring results")
                    return {
                        "success": False,
                        "message": "Failed to score assessment",
                        "error": "AI returned empty scoring response"
                    }
                    
            except Exception as ai_error:
                logger.error(f"Error in AI scoring: {ai_error}")
                return {
                    "success": False,
                    "message": "Failed to score assessment",
                    "error": str(ai_error)
                }
                
        except Exception as e:
            logger.error(f"Error in score_assessment: {e}")
            return {
                "success": False,
                "message": "Failed to score assessment",
                "error": str(e)
            }
        