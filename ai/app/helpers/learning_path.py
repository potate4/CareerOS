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
from app.schemas.learning_path import FileUploadInfo
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LearningPathAI:
    def __init__(self):
        # Initialize OpenAI
        openai.api_key = settings.OPENAI_API_KEY
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize Qdrant client
        self.qdrant_client = qdrantClient
        
        # Collection names
        self.learning_materials_collection = "learning_materials"
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

    
    async def analyze_career_goal_and_skills(self, career_goal: str, current_skills: List[str], 
                                          experience_level: str, user_materials: List[Dict]) -> Dict[str, Any]:
        """Analyze career goal and generate skill gap analysis using AI"""
        try:
            # Create prompt for skill analysis
            skills_str = ", ".join(current_skills) if current_skills else "None specified"
            materials_summary = self._summarize_user_materials(user_materials)
            
            prompt = f"""
            As a career development AI, analyze the following information:
            
            Career Goal: {career_goal}
            Current Skills: {skills_str}
            Experience Level: {experience_level}
            User Materials: {materials_summary}
            
            Provide a comprehensive analysis in JSON format with:
            1. required_skills: List of skills needed for the career goal
            2. skill_gaps: Skills the user needs to develop
            3. skill_priorities: Priority order (1-5, 5 being highest)
            4. learning_path_outline: High-level learning progression
            5. estimated_weeks: Total estimated learning time
            6. personalized_recommendations: Specific advice based on user's current state
            
            Format as valid JSON only.
            """
            
            response = await self._call_openai_gpt(prompt)
            analysis = json.loads(response)
            
            # Add confidence score based on material availability
            analysis['confidence_score'] = self._calculate_confidence_score(
                user_materials, analysis.get('skill_gaps', [])
            )
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in skill analysis: {e}")
            return self._get_fallback_skill_analysis(career_goal, current_skills)
    
    async def generate_learning_modules(self, skill_analysis: Dict[str, Any], 
                                     learning_pace: str, user_id: int) -> List[Dict[str, Any]]:
        """Generate AI-powered learning modules based on skill analysis"""
        try:
            modules = []
            skill_gaps = skill_analysis.get('skill_gaps', [])
            priorities = skill_analysis.get('skill_priorities', {})
            
            for i, skill in enumerate(skill_gaps):
                priority = priorities.get(skill, 3)
                
                # Generate module content using AI
                module_content = await self._generate_module_content(
                    skill, priority, learning_pace, user_id
                )
                
                # Find relevant resources from user materials
                relevant_materials = await self._find_relevant_materials(skill, user_id)
                
                # Generate online resources
                online_resources = await self._generate_online_resources(skill, priority)
                
                module = {
                    'order_index': i + 1,
                    'skill_focus': skill,
                    'title': module_content['title'],
                    'description': module_content['description'],
                    'difficulty_level': self._map_priority_to_difficulty(priority),
                    'estimated_hours': module_content['estimated_hours'],
                    'learning_objectives': module_content['learning_objectives'],
                    'resources': {
                        'user_materials': relevant_materials,
                        'online_resources': online_resources,
                        'practice_exercises': module_content['practice_exercises']
                    },
                    'assessment_criteria': module_content['assessment_criteria']
                }
                
                modules.append(module)
            
            return modules
            
        except Exception as e:
            logger.error(f"Error generating learning modules: {e}")
            return self._get_fallback_modules(skill_gaps)
    
    async def process_learning_materials(self, file_url: str, file_id: str, file_name: str, file_type: str, user_id: int) -> Dict[str, Any]:
        """Process and index a single learning material from URL"""
        try:
            self._ensure_collections()
            processing_results = {
                'file_id': file_id,
                'filename': file_name,
                'file_type': file_type,
                'chunks_created': 0,
                'chunks_indexed': 0,
                'status': 'processing'
            }
            
            try:
                # Download and extract content from file URL
                content = await self._extract_file_content_from_url(file_url, file_type)
                
                if content:
                    # Use semantic chunking from semantic_chunker.py
                    
                    # Create semantic chunks
                    semantic_chunks = create_semantic_chunks_80(content["text"])
                    
                    # # Prepare chunks for indexing
                    # chunks = []
                    # for i, chunk in enumerate(semantic_chunks):
                    #     chunks.append({
                    #         'content': chunk.page_content,
                    #         'chunk_index': i,
                    #         'metadata': content["metadata"]
                    #     })
                    
                    # Index chunks using qdrant_functions.py
                    print(f"CHUNKS SIZE: {len(semantic_chunks)}")
                    print(semantic_chunks)
                    
                    # Create FileUploadInfo object for qdrant_functions
                    file_info = FileUploadInfo(
                        user_id=user_id,
                        file_id=file_id,
                        file_name=file_name,
                        file_url=file_url,  # Use URL as file_path
                        file_type=file_type,
                        file_size=content.get("file_size", 0),
                        upload_date=datetime.now()
                    )
                    
                    logger.info(f"Uploading chunks to Qdrant")
                    # Upload chunks to Qdrant
                    upload_to_qdrant(
                       
                        file_create=file_info,
                        page_no="1",  # Single page for now
                        semantic_chunks=semantic_chunks,
                        summaries=[chunk.page_content[:100] for chunk in semantic_chunks],  # Simple summaries
                        collection_name=self.learning_materials_collection
                    )
                    logger.info(f"Uploaded chunks to Qdrant")
                    
                    processing_results['chunks_created'] = len(semantic_chunks)
                    processing_results['chunks_indexed'] = len(semantic_chunks)
                    processing_results['status'] = 'completed'
                    
                    logger.info(f"Successfully processed and indexed {file_name}: {len(semantic_chunks)} chunks")
                else:
                    processing_results['status'] = 'failed'
                    processing_results['error'] = 'Failed to extract content'
                    
            except Exception as e:
                logger.error(f"Error processing file {file_name}: {e}")
                processing_results['status'] = 'failed'
                processing_results['error'] = str(e)
            
            return processing_results
            
        except Exception as e:
            logger.error(f"Error in material processing: {e}")
            raise
    
    async def process_web_resources(self, urls: List[str], module_id: int, user_id: int) -> Dict[str, Any]:
        """Process and index web resources (YouTube videos, articles)"""
        try:
            processing_results = {
                'processed_urls': [],
                'failed_urls': [],
                'total_content_indexed': 0
            }
            
            for url in urls:
                try:
                    if 'youtube.com' in url or 'youtu.be' in url:
                        content = await self._extract_youtube_content(url)
                    else:
                        content = await self._extract_web_content(url)
                    
                    if content:
                        # Create chunks and index
                        chunks = self._chunk_web_content(content, url, module_id)
                        indexed_count = await self._index_module_content(chunks, user_id, module_id)
                        
                        processing_results['processed_urls'].append({
                            'url': url,
                            'content_type': content['type'],
                            'chunks_indexed': indexed_count
                        })
                        processing_results['total_content_indexed'] += indexed_count
                    
                except Exception as e:
                    logger.error(f"Error processing URL {url}: {e}")
                    processing_results['failed_urls'].append({
                        'url': url,
                        'error': str(e)
                    })
            
            return processing_results
            
        except Exception as e:
            logger.error(f"Error processing web resources: {e}")
            raise
    
    async def search_learning_materials(self, query: str, user_id: int, limit: int = 10) -> Dict[str, Any]:
        """Search learning materials using RAG for a specific user"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Search for relevant content in learning materials collection
            results = self.qdrant_client.search(
                collection_name=self.learning_materials_collection,
                query_vector=query_embedding,
                query_filter=models.Filter(
                    must=[models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id))]
                ),
                limit=limit
            )
            
            # Format results with metadata
            print(f"RESULTS: {results}")
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
                    'file_id': result.payload.get('file_id', ''),
                    'upload_date': result.payload.get('created_at', ''),
                    'page_no': result.payload.get('page_no', ''),
                    'is_active': result.payload.get('is_active', True)
                
                })
            
            return {
                'query': query,
                'user_id': user_id,
                'results_count': len(formatted_results),
                'results': formatted_results
            }
            
        except Exception as e:
            logger.error(f"Error in search functionality: {e}")
            return {
                'query': query,
                'user_id': user_id,
                'results_count': 0,
                'results': [],
                'error': str(e)
            }

    async def chat_with_learning_resources(self, query: str, module_id: int, user_id: int, 
                                        chat_history: List[Dict] = None) -> Dict[str, Any]:
        """RAG-based chat with learning resources for a specific module"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Search for relevant content in both collections
            user_materials = self.qdrant_client.search(
                collection_name=self.learning_materials_collection,
                query_vector=query_embedding,
                query_filter=models.Filter(
                    must=[models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id))]
                ),
                limit=5
            )
            
            module_content = self.qdrant_client.search(
                collection_name=self.module_content_collection,
                query_vector=query_embedding,
                query_filter=models.Filter(
                    must=[
                        models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id)),
                        models.FieldCondition(key="module_id", match=models.MatchValue(value=module_id))
                    ]
                ),
                limit=5
            )
            
            # Combine and rank results
            all_results = user_materials + module_content
            all_results.sort(key=lambda x: x.score, reverse=True)
            
            # Build context from top results
            context_chunks = []
            for result in all_results[:8]:  # Top 8 most relevant chunks
                context_chunks.append({
                    'content': result.payload['content'],
                    'source': result.payload['source'],
                    'score': result.score
                })
            
            # Generate response using context
            response = await self._generate_contextual_response(
                query, context_chunks, chat_history
            )
            
            return {
                'response': response,
                'sources': [chunk['source'] for chunk in context_chunks],
                'relevance_scores': [chunk['score'] for chunk in context_chunks],
                'context_used': len(context_chunks)
            }
            
        except Exception as e:
            logger.error(f"Error in chat functionality: {e}")
            return {
                'response': "I apologize, but I'm having trouble accessing your learning materials right now. Please try again later.",
                'sources': [],
                'relevance_scores': [],
                'context_used': 0
            }
    
    async def generate_module_assessment(self, module_id: int, skill_focus: str, 
                                       difficulty_level: str, user_id: int) -> Dict[str, Any]:
        """Generate AI-powered assessments for learning modules"""
        try:
            # Get relevant content for the module
            module_content = await self._get_module_content_summary(module_id, user_id)
            
            # Generate assessment using AI
            prompt = f"""
            Create a comprehensive assessment for a learning module with:
            
            Skill Focus: {skill_focus}
            Difficulty Level: {difficulty_level}
            Module Content: {module_content}
            
            Generate a JSON assessment with:
            1. multiple_choice: 5 questions with 4 options each, one correct answer
            2. practical_exercises: 3 hands-on tasks/coding challenges
            3. conceptual_questions: 3 open-ended questions testing understanding
            4. scoring_criteria: How to evaluate performance
            5. estimated_time: Time needed to complete assessment
            6. difficulty_progression: Questions ordered from basic to advanced
            
            Ensure questions test practical application, not just memorization.
            Format as valid JSON only.
            """
            
            response = await self._call_openai_gpt(prompt)
            assessment = json.loads(response)
            
            # Add metadata
            assessment['module_id'] = module_id
            assessment['skill_focus'] = skill_focus
            assessment['created_at'] = datetime.now().isoformat()
            assessment['assessment_id'] = str(uuid.uuid4())
            
            return assessment
            
        except Exception as e:
            logger.error(f"Error generating assessment: {e}")
            return self._get_fallback_assessment(skill_focus, difficulty_level)
    
    async def evaluate_assessment_response(self, assessment_id: str, user_responses: Dict[str, Any], 
                                        user_id: int) -> Dict[str, Any]:
        """Evaluate user responses to module assessment"""
        try:
            # This would typically fetch the original assessment from database
            # For now, we'll use AI to evaluate responses
            
            prompt = f"""
            Evaluate these learning assessment responses:
            
            User Responses: {json.dumps(user_responses, indent=2)}
            
            Provide evaluation in JSON format with:
            1. overall_score: Percentage score (0-100)
            2. section_scores: Scores for each section
            3. correct_answers: Which questions were answered correctly
            4. feedback: Detailed feedback for each section
            5. strengths: What the user did well
            6. improvement_areas: What needs work
            7. recommended_actions: Next steps for learning
            8. knowledge_gaps: Specific topics to review
            
            Format as valid JSON only.
            """
            
            response = await self._call_openai_gpt(prompt)
            evaluation = json.loads(response)
            
            # Add metadata
            evaluation['assessment_id'] = assessment_id
            evaluation['user_id'] = user_id
            evaluation['evaluated_at'] = datetime.now().isoformat()
            
            return evaluation
            
        except Exception as e:
            logger.error(f"Error evaluating assessment: {e}")
            return self._get_fallback_evaluation()
    
    # Helper methods
    
    def _summarize_user_materials(self, materials: List[Dict]) -> str:
        """Summarize user uploaded materials"""
        if not materials:
            return "No materials provided"
        
        summary = f"{len(materials)} files uploaded: "
        file_types = {}
        for material in materials:
            file_type = material.get('file_type', 'unknown')
            file_types[file_type] = file_types.get(file_type, 0) + 1
        
        type_summary = [f"{count} {file_type}" for file_type, count in file_types.items()]
        return summary + ", ".join(type_summary)
    
    async def _call_openai_gpt(self, prompt: str, model: str = "gpt-3.5-turbo") -> str:
        """Call OpenAI GPT API"""
        try:
            response = openai.ChatCompletion.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert learning and career development AI assistant. Always respond with valid JSON when requested."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    def _calculate_confidence_score(self, materials: List[Dict], skill_gaps: List[str]) -> float:
        """Calculate confidence score based on available materials and skill gaps"""
        if not materials or not skill_gaps:
            return 0.5
        
        # Simple scoring based on material availability
        material_score = min(len(materials) / 5, 1.0)  # Max score if 5+ materials
        skill_coverage = 0.8  # Assume good skill gap analysis
        
        return (material_score + skill_coverage) / 2
    
    def _get_fallback_skill_analysis(self, career_goal: str, current_skills: List[str]) -> Dict[str, Any]:
        """Fallback skill analysis when AI fails"""
        return {
            "required_skills": ["Communication", "Problem Solving", "Technical Skills"],
            "skill_gaps": ["Technical Skills", "Advanced Problem Solving"],
            "skill_priorities": {"Technical Skills": 5, "Advanced Problem Solving": 4},
            "learning_path_outline": ["Foundation", "Intermediate", "Advanced"],
            "estimated_weeks": 12,
            "personalized_recommendations": ["Start with fundamentals", "Practice regularly"],
            "confidence_score": 0.3
        }
    
    async def _extract_file_content_from_url(self, file_url: str, file_type: str) -> Optional[Dict[str, Any]]:
        """Extract content from file URL"""
        try:
            import tempfile
            import requests
            
            # Download file from URL
            response = requests.get(file_url, stream=True)
            response.raise_for_status()
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_type}") as temp_file:
                for chunk in response.iter_content(chunk_size=8192):
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            try:
                content = {"text": "", "metadata": {}}
                
                if file_type.lower() == 'pdf':
                    doc = fitz.open(temp_file_path)
                    text = ""
                    for page in doc:
                        text += page.get_text()
                    content["text"] = text
                    content["metadata"] = {"pages": len(doc), "file_type": "pdf"}
                    doc.close()
                    
                elif file_type.lower() in ['docx', 'doc']:
                    doc = Document(temp_file_path)
                    text = ""
                    for paragraph in doc.paragraphs:
                        text += paragraph.text + "\n"
                    content["text"] = text
                    content["metadata"] = {"paragraphs": len(doc.paragraphs), "file_type": "docx"}
                    
                elif file_type.lower() in ['pptx', 'ppt']:
                    prs = Presentation(temp_file_path)
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
                
                return content if content["text"].strip() else None
                
            finally:
                # Clean up temporary file
                import os
                os.unlink(temp_file_path)
            
        except Exception as e:
            logger.error(f"Error extracting content from URL {file_url}: {e}")
            return None

    async def _extract_file_content(self, file_path: str, file_type: str) -> Optional[Dict[str, Any]]:
        """Extract content from uploaded files"""
        try:
            content = {"text": "", "metadata": {}}
            
            if file_type.lower() == 'pdf':
                doc = fitz.open(file_path)
                text = ""
                for page in doc:
                    text += page.get_text()
                content["text"] = text
                content["metadata"] = {"pages": len(doc), "file_type": "pdf"}
                doc.close()
                
            elif file_type.lower() in ['docx', 'doc']:
                doc = Document(file_path)
                text = ""
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
                content["text"] = text
                content["metadata"] = {"paragraphs": len(doc.paragraphs), "file_type": "docx"}
                
            elif file_type.lower() in ['pptx', 'ppt']:
                prs = Presentation(temp_file_path)
                text = ""
                for slide in prs.slides:
                    for shape in slide.shapes:
                        if hasattr(shape, "text"):
                            text += shape.text + "\n"
                content["text"] = text
                content["metadata"] = {"slides": len(prs.slides), "file_type": "pptx"}
            
            return content if content["text"].strip() else None
            
        except Exception as e:
            logger.error(f"Error extracting content from {file_path}: {e}")
            return None
    
    def _chunk_content(self, content: Dict[str, Any], file_info: Dict) -> List[Dict[str, Any]]:
        """Chunk content for vector indexing"""
        text = content["text"]
        chunks = []
        
        # Simple chunking by sentences (can be improved with semantic chunking)
        sentences = re.split(r'[.!?]+', text)
        chunk_size = 3  # 3 sentences per chunk
        
        for i in range(0, len(sentences), chunk_size):
            chunk_text = '. '.join(sentences[i:i+chunk_size]).strip()
            if chunk_text:
                chunks.append({
                    'content': chunk_text,
                    'source': file_info['filename'],
                    'chunk_index': i // chunk_size,
                    'metadata': content["metadata"]
                })
        
        return chunks
    
    async def _index_content_chunks(self, chunks: List[Dict], user_id: int) -> int:
        """Index content chunks in Qdrant"""
        try:
            points = []
            for chunk in chunks:
                # Generate embedding
                embedding = self.embedding_model.encode(chunk['content']).tolist()
                
                # Create point
                point = PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={
                        'content': chunk['content'],
                        'source': chunk['source'],
                        'chunk_index': chunk['chunk_index'],
                        'user_id': user_id,
                        'created_at': datetime.now().isoformat(),
                        **chunk['metadata']
                    }
                )
                points.append(point)
            
            # Upsert points to Qdrant
            self.qdrant_client.upsert(
                collection_name=self.learning_materials_collection,
                points=points
            )
            
            return len(points)
            
        except Exception as e:
            logger.error(f"Error indexing chunks: {e}")
            return 0
    
    async def _generate_module_content(self, skill: str, priority: int, 
                                     learning_pace: str, user_id: int) -> Dict[str, Any]:
        """Generate detailed module content using AI"""
        try:
            prompt = f"""
            Create a detailed learning module for the skill: {skill}
            Priority Level: {priority}/5
            Learning Pace: {learning_pace}
            
            Generate in JSON format:
            1. title: Engaging module title
            2. description: Comprehensive module description
            3. learning_objectives: 5-7 specific learning outcomes
            4. estimated_hours: Based on skill complexity and learning pace
            5. practice_exercises: 3-5 hands-on exercises
            6. assessment_criteria: How to measure mastery
            7. prerequisites: Skills needed before this module
            8. difficulty_progression: How difficulty increases through module
            
            Make it practical and actionable. Format as valid JSON only.
            """
            
            response = await self._call_openai_gpt(prompt)
            return json.loads(response)
            
        except Exception as e:
            logger.error(f"Error generating module content: {e}")
            return {
                "title": f"Learn {skill}",
                "description": f"Master the fundamentals of {skill}",
                "learning_objectives": [f"Understand {skill} basics"],
                "estimated_hours": 10,
                "practice_exercises": ["Basic exercise"],
                "assessment_criteria": "Complete all exercises",
                "prerequisites": [],
                "difficulty_progression": "Beginner to Intermediate"
            }
    
    async def _generate_online_resources(self, skill: str, priority: int) -> List[Dict[str, Any]]:
        """Generate online learning resources for a skill"""
        try:
            prompt = f"""
            Find the best online learning resources for: {skill}
            Priority: {priority}/5
            
            Provide 5-7 resources in JSON format with:
            1. title: Resource title
            2. url: Valid URL
            3. type: VIDEO, COURSE, ARTICLE, TUTORIAL
            4. platform: YouTube, Udemy, Coursera, etc.
            5. duration_minutes: Estimated time
            6. difficulty: BEGINNER, INTERMEDIATE, ADVANCED
            7. is_free: true/false
            8. description: Brief description
            
            Focus on high-quality, reputable sources. Format as JSON array only.
            """
            
            response = await self._call_openai_gpt(prompt)
            return json.loads(response)
            
        except Exception as e:
            logger.error(f"Error generating online resources: {e}")
            return []
    
    def _map_priority_to_difficulty(self, priority: int) -> str:
        """Map priority score to difficulty level"""
        if priority >= 5:
            return "EXPERT"
        elif priority >= 4:
            return "ADVANCED"
        elif priority >= 3:
            return "INTERMEDIATE"
        else:
            return "BEGINNER"
    
    def _get_fallback_modules(self, skill_gaps: List[str]) -> List[Dict[str, Any]]:
        """Fallback modules when AI generation fails"""
        modules = []
        for i, skill in enumerate(skill_gaps):
            modules.append({
                'order_index': i + 1,
                'skill_focus': skill,
                'title': f"Learn {skill}",
                'description': f"Master the fundamentals of {skill}",
                'difficulty_level': "INTERMEDIATE",
                'estimated_hours': 10,
                'learning_objectives': [f"Understand {skill} basics"],
                'resources': {
                    'user_materials': [],
                    'online_resources': [],
                    'practice_exercises': ["Basic exercise"]
                },
                'assessment_criteria': "Complete all exercises"
            })
        return modules
    
    async def _find_relevant_materials(self, skill: str, user_id: int) -> List[Dict[str, Any]]:
        """Find user materials relevant to a specific skill"""
        try:
            query_embedding = self.embedding_model.encode(skill).tolist()
            
            results = self.qdrant_client.search(
                collection_name=self.learning_materials_collection,
                query_vector=query_embedding,
                query_filter=models.Filter(
                    must=[models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id))]
                ),
                limit=5
            )
            
            materials = []
            for result in results:
                materials.append({
                    'content': result.payload['content'],
                    'source': result.payload['source'],
                    'relevance_score': result.score,
                    'chunk_index': result.payload['chunk_index']
                })
            
            return materials
            
        except Exception as e:
            logger.error(f"Error finding relevant materials: {e}")
            return []
    
    async def _extract_youtube_content(self, url: str) -> Optional[Dict[str, Any]]:
        """Extract content from YouTube videos"""
        try:
            ydl_opts = {
                'writesubtitles': True,
                'writeautomaticsub': True,
                'subtitleslangs': ['en'],
                'skip_download': True,
                'quiet': True
            }
            
            with youtube_dl.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                content = {
                    'type': 'video',
                    'title': info.get('title', ''),
                    'description': info.get('description', ''),
                    'duration': info.get('duration', 0),
                    'url': url,
                    'transcript': '',  # Would extract from subtitles
                    'metadata': {
                        'channel': info.get('uploader', ''),
                        'view_count': info.get('view_count', 0),
                        'upload_date': info.get('upload_date', '')
                    }
                }
                
                return content
                
        except Exception as e:
            logger.error(f"Error extracting YouTube content from {url}: {e}")
            return None
    
    async def _extract_web_content(self, url: str) -> Optional[Dict[str, Any]]:
        """Extract content from web articles"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    html = await response.text()
                    
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract title
            title = soup.find('title')
            title_text = title.get_text().strip() if title else ''
            
            # Extract main content (simplified)
            content_tags = soup.find_all(['p', 'h1', 'h2', 'h3', 'article'])
            content_text = '\n'.join([tag.get_text().strip() for tag in content_tags])
            
            return {
                'type': 'article',
                'title': title_text,
                'content': content_text,
                'url': url,
                'metadata': {
                    'word_count': len(content_text.split()),
                    'extraction_date': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error extracting web content from {url}: {e}")
            return None
    
    def _chunk_web_content(self, content: Dict[str, Any], url: str, module_id: int) -> List[Dict[str, Any]]:
        """Chunk web content for indexing"""
        text = content.get('content', '')
        chunks = []
        
        # Chunk by paragraphs for web content
        paragraphs = text.split('\n')
        
        for i, paragraph in enumerate(paragraphs):
            if paragraph.strip():
                chunks.append({
                    'content': paragraph.strip(),
                    'source': url,
                    'source_type': content['type'],
                    'title': content.get('title', ''),
                    'chunk_index': i,
                    'module_id': module_id,
                    'metadata': content.get('metadata', {})
                })
        
        return chunks
    
    async def _index_module_content(self, chunks: List[Dict], user_id: int, module_id: int) -> int:
        """Index module content in Qdrant"""
        try:
            points = []
            for chunk in chunks:
                embedding = self.embedding_model.encode(chunk['content']).tolist()
                
                point = PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={
                        'content': chunk['content'],
                        'source': chunk['source'],
                        'source_type': chunk['source_type'],
                        'title': chunk['title'],
                        'chunk_index': chunk['chunk_index'],
                        'module_id': module_id,
                        'user_id': user_id,
                        'created_at': datetime.now().isoformat(),
                        **chunk['metadata']
                    }
                )
                points.append(point)
            
            self.qdrant_client.upsert(
                collection_name=self.module_content_collection,
                points=points
            )
            
            return len(points)
            
        except Exception as e:
            logger.error(f"Error indexing module content: {e}")
            return 0
    
    async def _generate_contextual_response(self, query: str, context_chunks: List[Dict], 
                                          chat_history: List[Dict] = None) -> str:
        """Generate contextual response using RAG"""
        try:
            # Build context from chunks
            context = "\n\n".join([
                f"Source: {chunk['source']}\nContent: {chunk['content']}" 
                for chunk in context_chunks
            ])
            
            # Build chat history context
            history_context = ""
            if chat_history:
                history_context = "\n".join([
                    f"User: {msg['user']}\nAssistant: {msg['assistant']}" 
                    for msg in chat_history[-3:]  # Last 3 exchanges
                ])
            
            prompt = f"""
            You are a helpful learning assistant. Answer the user's question based on the provided context from their learning materials and resources.
            
            Chat History:
            {history_context}
            
            Context from Learning Materials:
            {context}
            
            User Question: {query}
            
            Provide a helpful, accurate response based on the context. If the context doesn't contain enough information to answer the question, say so and provide general guidance.
            """
            
            response = await self._call_openai_gpt(prompt)
            return response
            
        except Exception as e:
            logger.error(f"Error generating contextual response: {e}")
            return "I apologize, but I'm having trouble processing your question right now. Please try again later."
    
    async def _get_module_content_summary(self, module_id: int, user_id: int) -> str:
        """Get summary of module content for assessment generation"""
        try:
            # This would typically query the database for module content
            # For now, return a generic summary
            return f"Module content summary for module {module_id}"
            
        except Exception as e:
            logger.error(f"Error getting module content summary: {e}")
            return "General learning content"
    
    def _get_fallback_assessment(self, skill_focus: str, difficulty_level: str) -> Dict[str, Any]:
        """Fallback assessment when AI generation fails"""
        return {
            'multiple_choice': [
                {
                    'question': f"What is the main concept of {skill_focus}?",
                    'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                    'correct_answer': 'Option A'
                }
            ],
            'practical_exercises': [
                f"Create a simple project using {skill_focus}"
            ],
            'conceptual_questions': [
                f"Explain how {skill_focus} works in your own words"
            ],
            'scoring_criteria': "Basic understanding demonstration",
            'estimated_time': 30,
            'difficulty_progression': f"{difficulty_level} level assessment"
        }
    
    def _get_fallback_evaluation(self) -> Dict[str, Any]:
        """Fallback evaluation when AI analysis fails"""
        return {
            'overall_score': 75,
            'section_scores': {'multiple_choice': 75, 'practical': 75, 'conceptual': 75},
            'correct_answers': [],
            'feedback': "Good effort, keep practicing!",
            'strengths': ["Problem solving"],
            'improvement_areas': ["Technical knowledge"],
            'recommended_actions': ["Continue learning"],
            'knowledge_gaps': ["Advanced concepts"]
        } 