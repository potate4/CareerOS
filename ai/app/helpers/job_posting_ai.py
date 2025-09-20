import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sentence_transformers import SentenceTransformer
from app.helpers.llm import (
    get_gemini_text_completion, 
    get_structured_response_learning_modules, 
    get_structured_response_assessment_questions,
    get_structured_response_job_analysis,
    get_structured_response_job_learning_modules,
    get_structured_response_job_assessment_questions,
    get_structured_response_extracted_skills
)
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JobPostingAI:
    def __init__(self):
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
    async def analyze_job_description(self, job_description: str) -> Dict[str, Any]:
        """
        Analyze job description to extract key information for learning path generation
        """
        try:
            logger.info("Analyzing job description for key skills and requirements")
            
            analysis_prompt = f"""
            Analyze this job description and extract the following information:
            
            Job Description:
            {job_description}
            
            Extract:
            - technical_skills: List of technical skills required (programming languages, tools, frameworks, etc.)
            - soft_skills: List of soft skills needed (communication, teamwork, leadership, etc.)
            - experience_level: Required experience level (ENTRY_LEVEL, JUNIOR, MID_LEVEL, SENIOR, EXPERT)
            - key_responsibilities: List of main job responsibilities
            - learning_topics: List of topics candidates should learn for this role
            - assessment_areas: List of areas to focus on for candidate assessment
            
            Be specific and comprehensive in your analysis.
            """
            
            analysis = get_structured_response_job_analysis(analysis_prompt)
            
            if analysis:
                return {
                    'success': True,
                    'analysis': {
                        'technical_skills': analysis.technical_skills,
                        'soft_skills': analysis.soft_skills,
                        'experience_level': analysis.experience_level,
                        'responsibilities': analysis.key_responsibilities,
                        'learning_topics': analysis.learning_topics,
                        'assessment_areas': analysis.assessment_areas
                    }
                }
            else:
                return {'success': False, 'error': 'Failed to get structured AI response'}
                
        except Exception as e:
            logger.error(f"Error analyzing job description: {e}")
            return {'success': False, 'error': str(e)}
    
    
    async def generate_job_learning_path(self, job_analysis: Dict[str, Any], job_title: str) -> Dict[str, Any]:
        """
        Generate learning path modules based on job analysis
        """
        try:
            logger.info(f"Generating learning path for job: {job_title}")
            
            learning_path_prompt = f"""
            Create a comprehensive learning path for candidates applying for this position: {job_title}
            
            Based on this job analysis:
            - Technical Skills Required: {job_analysis.get('technical_skills', [])}
            - Soft Skills Required: {job_analysis.get('soft_skills', [])}
            - Experience Level: {job_analysis.get('experience_level', 'MID_LEVEL')}
            - Key Responsibilities: {job_analysis.get('responsibilities', [])}
            - Learning Topics: {job_analysis.get('learning_topics', [])}
            
            Create 5-8 learning modules that will prepare candidates for this role.
            Each module should have:
            - module_name: Clear, specific name for the learning module
            - module_description: Detailed description of what will be learned in this module
            - estimated_hours: Estimated time to complete (integer between 1-20)
            - difficulty_level: BEGINNER, INTERMEDIATE, ADVANCED, or EXPERT
            - skills_covered: Comma-separated string of skills this module covers
            - prerequisites: Prerequisites for this module (can be null if none)
            
            Focus on practical, job-relevant skills that candidates can apply immediately.
            Progress from foundational concepts to advanced application.
            """
            
            modules = get_structured_response_job_learning_modules(learning_path_prompt)
            
            if modules:
                # Convert Pydantic models to dictionaries
                modules_dict = []
                for module in modules:
                    modules_dict.append({
                        'module_name': module.module_name,
                        'module_description': module.module_description,
                        'estimated_hours': module.estimated_hours or 4,
                        'difficulty_level': module.difficulty_level or 'INTERMEDIATE',
                        'skills_covered': module.skills_covered or '',
                        'prerequisites': module.prerequisites
                    })
                
                return {
                    'success': True,
                    'modules': modules_dict
                }
            else:
                # Fallback to simple module generation
                fallback_modules = self._generate_fallback_modules(job_title, job_analysis)
                return {
                    'success': True,
                    'modules': fallback_modules
                }
                
        except Exception as e:
            logger.error(f"Error generating learning path: {e}")
            return {'success': False, 'error': str(e)}
    
    def _generate_fallback_modules(self, job_title: str, job_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate fallback learning modules when AI fails
        """
        technical_skills = job_analysis.get('technical_skills', [])
        
        modules = [
            {
                'module_name': f'Introduction to {job_title}',
                'module_description': f'Overview of the {job_title} role, responsibilities, and industry context',
                'estimated_hours': 2,
                'difficulty_level': 'BEGINNER',
                'skills_covered': ['Role Understanding', 'Industry Knowledge'],
                'prerequisites': None
            },
            {
                'module_name': 'Core Technical Skills',
                'module_description': f'Essential technical skills including: {", ".join(technical_skills[:5])}',
                'estimated_hours': 8,
                'difficulty_level': 'INTERMEDIATE',
                'skills_covered': technical_skills[:5],
                'prerequisites': 'Basic programming knowledge'
            },
            {
                'module_name': 'Advanced Concepts',
                'module_description': 'Deep dive into advanced topics and best practices',
                'estimated_hours': 6,
                'difficulty_level': 'ADVANCED',
                'skills_covered': ['Advanced Programming', 'System Design', 'Best Practices'],
                'prerequisites': 'Core Technical Skills'
            },
            {
                'module_name': 'Project Work',
                'module_description': 'Hands-on project to demonstrate skills and build portfolio',
                'estimated_hours': 10,
                'difficulty_level': 'INTERMEDIATE',
                'skills_covered': ['Project Management', 'Practical Application'],
                'prerequisites': 'Advanced Concepts'
            }
        ]
        
        return modules
    
    async def generate_job_assessment(self, job_analysis: Dict[str, Any], job_title: str, num_questions: int = 10, difficulty: str = 'INTERMEDIATE') -> Dict[str, Any]:
        """
        Generate assessment questions based on job requirements
        """
        try:
            logger.info(f"Generating assessment for job: {job_title}")
            
            assessment_prompt = f"""
            Create {num_questions} assessment questions for candidates applying for: {job_title}
            
            Based on this job analysis:
            - Technical Skills Required: {job_analysis.get('technical_skills', [])}
            - Assessment Focus Areas: {job_analysis.get('assessment_areas', [])}
            - Experience Level: {job_analysis.get('experience_level', 'MID_LEVEL')}
            - Key Responsibilities: {job_analysis.get('responsibilities', [])}
            
            Difficulty Level: {difficulty}
            
            Create a mix of question types:
            - Multiple choice (60%) - use MULTIPLE_CHOICE
            - True/False (20%) - use TRUE_FALSE
            - Short answer (20%) - use SHORT_ANSWER
            
            For each question provide:
            - question: The question text
            - question_type: MULTIPLE_CHOICE, TRUE_FALSE, or SHORT_ANSWER
            - options: For multiple choice, JSON string like '["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"]', null for others
            - correct_answer: The correct answer
            - explanation: Brief explanation of why this is correct
            - points: Points for this question (default 10.0)
            
            Focus on practical knowledge relevant to the job role.
            """
            
            questions = get_structured_response_job_assessment_questions(assessment_prompt)
            
            if questions:
                # Convert Pydantic models to dictionaries
                questions_dict = []
                for question in questions:
                    questions_dict.append({
                        'question': question.question,
                        'question_type': question.question_type,
                        'options': question.options,
                        'correct_answer': question.correct_answer,
                        'explanation': question.explanation or '',
                        'points': question.points or 10.0
                    })
                
                return {
                    'success': True,
                    'assessment_id': f"job_assessment_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    'questions': questions_dict,
                    'total_questions': len(questions_dict),
                    'difficulty': difficulty,
                    'job_title': job_title
                }
            else:
                # Fallback assessment
                fallback_questions = self._generate_fallback_assessment(job_title, job_analysis, num_questions)
                return {
                    'success': True,
                    'assessment_id': f"fallback_assessment_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    'questions': fallback_questions,
                    'total_questions': len(fallback_questions),
                    'difficulty': difficulty,
                    'job_title': job_title
                }
                
        except Exception as e:
            logger.error(f"Error generating assessment: {e}")
            return {'success': False, 'error': str(e)}
    
    def _generate_fallback_assessment(self, job_title: str, job_analysis: Dict[str, Any], num_questions: int) -> List[Dict[str, Any]]:
        """
        Generate fallback assessment questions
        """
        technical_skills = job_analysis.get('technical_skills', ['Programming', 'Problem Solving'])
        
        questions = []
        
        # Basic questions for any technical role
        basic_questions = [
            {
                'question': f'What are the key responsibilities of a {job_title}?',
                'type': 'SHORT_ANSWER',
                'options': None,
                'correct_answer': 'Various responsibilities including development, testing, and collaboration',
                'explanation': 'This tests understanding of the role',
                'points': 10
            },
            {
                'question': f'Which of these skills is most important for a {job_title}?',
                'type': 'MULTIPLE_CHOICE',
                'options': technical_skills[:4] if len(technical_skills) >= 4 else ['Skill A', 'Skill B', 'Skill C', 'Skill D'],
                'correct_answer': technical_skills[0] if technical_skills else 'Skill A',
                'explanation': 'This skill is fundamental to the role',
                'points': 10
            }
        ]
        
        # Add more questions up to num_questions
        while len(questions) < num_questions:
            for q in basic_questions:
                if len(questions) < num_questions:
                    questions.append(q.copy())
        
        return questions[:num_questions]
    
    async def extract_job_skills_and_requirements(self, job_description: str) -> Dict[str, Any]:
        """
        Extract structured information from job description for learning path and assessment generation
        """
        try:
            logger.info("🔥 [AI_HELPER] Starting extract_job_skills_and_requirements")
            logger.info(f"🔥 [AI_HELPER] Job description length: {len(job_description)}")

            logger.info("🔥 [AI_HELPER] Step 1: Analyzing job description")
            analysis = await self.analyze_job_description(job_description)

            logger.info(f"🔥 [AI_HELPER] Analysis result: {analysis.get('success', False)}")
            if not analysis['success']:
                logger.error(f"🔥 [AI_HELPER] Analysis failed: {analysis.get('error', 'Unknown error')}")
                return {'success': False, 'error': analysis.get('error', 'Analysis failed')}

            job_analysis = analysis['analysis']
            logger.info(f"🔥 [AI_HELPER] Job analysis keys: {list(job_analysis.keys())}")

            # Generate learning path
            logger.info("🔥 [AI_HELPER] Step 2: Generating learning path")
            learning_path = await self.generate_job_learning_path(job_analysis, "Target Role")
            logger.info(f"🔥 [AI_HELPER] Learning path result: {learning_path.get('success', False)}")
            if learning_path.get('success'):
                logger.info(f"🔥 [AI_HELPER] Learning path modules count: {len(learning_path.get('modules', []))}")

            # Generate assessment
            logger.info("🔥 [AI_HELPER] Step 3: Generating assessment")
            assessment = await self.generate_job_assessment(job_analysis, "Target Role")
            logger.info(f"🔥 [AI_HELPER] Assessment result: {assessment.get('success', False)}")
            if assessment.get('success'):
                logger.info(f"🔥 [AI_HELPER] Assessment questions count: {len(assessment.get('questions', []))}")

            result = {
                'success': True,
                'job_analysis': job_analysis,
                'learning_path': learning_path.get('modules', []) if learning_path['success'] else [],
                'assessment': assessment.get('questions', []) if assessment['success'] else [],
                'extracted_at': datetime.now().isoformat()
            }

            logger.info("🔥 [AI_HELPER] Successfully completed extract_job_skills_and_requirements")
            return result

        except Exception as e:
            logger.error(f"❌ [AI_HELPER] Error extracting job skills: {e}")
            logger.error(f"❌ [AI_HELPER] Error type: {type(e).__name__}")
            import traceback
            logger.error(f"❌ [AI_HELPER] Traceback: {traceback.format_exc()}")
            return {'success': False, 'error': str(e)}