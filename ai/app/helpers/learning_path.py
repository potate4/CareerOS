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