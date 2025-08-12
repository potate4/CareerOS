import uuid
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

# Enums for better type safety
class WorkEnvironment(str, Enum):
    REMOTE = "remote"
    HYBRID = "hybrid" 
    ONSITE = "onsite"

class CompanySize(str, Enum):
    STARTUP = "startup"
    MID_SIZE = "mid-size"
    ENTERPRISE = "enterprise"

class LearningStyle(str, Enum):
    HANDS_ON = "hands-on"
    THEORETICAL = "theoretical"
    MIXED = "mixed"

class RiskTolerance(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class JobDemandTrend(str, Enum):
    INCREASING = "increasing"
    STABLE = "stable"
    DECREASING = "decreasing"

# Request Schemas
class UserPreferences(BaseModel):
    workEnvironment: Optional[WorkEnvironment] = None
    salary: Optional[float] = None
    salaryRangeMin: Optional[float] = None
    salaryRangeMax: Optional[float] = None
    locationPreferences: Optional[List[str]] = []
    industryPreferences: Optional[List[str]] = []
    companySizePreference: Optional[CompanySize] = None
    learningStyle: Optional[LearningStyle] = None
    riskTolerance: Optional[RiskTolerance] = None

class UserProfile(BaseModel):
    currentRole: str
    skills: List[str]
    education: str
    yoe: Optional[str] = None
    yearsOfExperience: Optional[int] = None
    currentSalary: Optional[float] = None
    certifications: Optional[List[str]] = []
    portfolioProjects: Optional[List[str]] = []
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []

class MarketData(BaseModel):
    averageSalaryGrowth: Optional[float] = 0.08
    jobDemandTrend: Optional[JobDemandTrend] = JobDemandTrend.STABLE
    industryGrowthRate: Optional[float] = 0.10
    competitionLevel: Optional[str] = "medium"
    emergingSkills: Optional[List[str]] = []
    decliningSkills: Optional[List[str]] = []

class FuturecastRequest(BaseModel):
    careerGoal: str = Field(..., description="Target career position")
    timelineYears: int = Field(..., ge=1, le=20, description="Timeline in years (1-20)")
    preferences: UserPreferences
    userProfile: UserProfile
    marketData: Optional[MarketData] = MarketData()
    userId: Optional[int] = None

# Response Schemas
class Milestone(BaseModel):
    year: int
    title: str
    expectedSalary: Optional[float] = None
    skillsToLearn: List[str] = []
    notes: Optional[str] = None
    estimatedTimeToComplete: Optional[str] = None
    prerequisites: Optional[List[str]] = []
    resources: Optional[List[str]] = []

class CareerPath(BaseModel):
    pathId: str
    description: str
    probability: Optional[float] = None  # Success probability 0-1
    difficulty: Optional[str] = None  # easy, medium, hard
    milestones: List[Milestone]
    totalInvestment: Optional[float] = None  # Time/money investment
    riskLevel: Optional[str] = None
    alternativeOptions: Optional[List[str]] = []

class RoadmapData(BaseModel):
    goal: str
    timelineYears: int
    paths: List[CareerPath]
    marketInsights: Optional[Dict[str, Any]] = {}
    recommendedPath: Optional[str] = None  # pathId of recommended path

class FuturecastResponse(BaseModel):
    roadmap: RoadmapData
    explanation: str
    confidence: Optional[float] = None  # AI confidence 0-1
    lastUpdated: Optional[datetime] = None
    roadmapId: Optional[str] = None
