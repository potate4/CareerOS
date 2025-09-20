from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Job Analysis Schemas
class JobSkill(BaseModel):
    skill_name: str
    skill_type: str  # "technical" or "soft"

class JobAnalysis(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    experience_level: str
    key_responsibilities: List[str]
    learning_topics: List[str]
    assessment_areas: List[str]

# Learning Path Schemas for Job Postings
class JobLearningModule(BaseModel):
    module_name: str
    module_description: str
    estimated_hours: Optional[int]
    difficulty_level: Optional[str]
    skills_covered: Optional[str]
    prerequisites: Optional[str]

# Assessment Schemas for Job Postings
class JobAssessmentQuestion(BaseModel):
    question: str
    question_type: str  # "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"
    options: Optional[str]  # JSON string for multiple choice options
    correct_answer: str
    explanation: Optional[str]
    points: Optional[float]

# Skills Extraction Schema
class ExtractedSkills(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    required_experience: str
    key_concepts: List[str]