import uuid
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class singleTurn(BaseModel):
    text: str
    speaker: str


class KeyTopic(BaseModel):
  topic: str

class Audio(BaseModel):
    id: uuid.UUID
    fileName: str
    fileUploadPath: str
    
    supabasePath: str
    agentName: str
    status: str
    transcript: Optional[List[Dict[str, Any]]] = None  # Updated to store a list of dictionaries
    conversation_quality: Optional[str] = None
    client_sentiment: Optional[str] = None
    mistakes: Optional[str] = None
    agent_score: Optional[str] = None
    recommendations: Optional[str] = None
    reason: Optional[str] = None
    better_script: Optional[List[singleTurn]] = None

    # new columns for scoring

    key_topics: Optional[str] = None
    key_topics_list: Optional[List[KeyTopic]] = None
    positive_sentiment_score: Optional[float] = 0
    negative_sentiment_score: Optional[float] = 0
    neutral_sentiment_score: Optional[float] = 0
    sentiment: Optional[str] = None
    outcome: Optional[str] = None
    summary: Optional[str] = None
    actionables: Optional[str] = None

    uploaded_at: datetime
    updated_at: datetime

class ConversationAnalysis(BaseModel):
    conversation_quality: str
    client_sentiment: str
    mistakes: str 
    agent_score: float
    recommendations: str
    reason: str
    better_script: List[singleTurn]

class ConversationAnalysisNew(BaseModel):
    
    conversation_quality: str
    client_sentiment: str
    agent_mistakes: str 
    agent_score: float
    agent_recommendations: str
    call_reason: str
    # better_script: List[singleTurn]
    positive_sentiment_score: float
    negative_sentiment_score: float
    neutral_sentiment_score: float

    # new columns for scoring
    key_topics: Optional[str] = None
    sentiment: Optional[str] = None
    outcome: Optional[str] = None
    summary: Optional[str] = None
    actionables: Optional[str] = None



class Transcript(BaseModel):
  speaker: str
  text: str

class Transcripts(BaseModel):
  transcripts: list[Transcript]


# New schemas for statistics endpoints

class DailyProcessingStats(BaseModel):
    date: str
    count: int

class WordCloudItem(BaseModel):
    text: str
    value: int

class PopularTopic(BaseModel):
    topic: str
    count: int

# Agent statistics schema
class AgentStats(BaseModel):
    agent_name: str
    total_calls: int
    avg_sentiment_score: Optional[float] = None
    positive_calls: int = 0
    negative_calls: int = 0
    neutral_calls: int = 0
    avg_agent_score: Optional[float] = None
    key_topics: List[str] = []

class AgentDetailedStats(BaseModel):
    agent_name: str
    total_calls: int
    calls_by_date: List[Dict[str, Any]] = []
    sentiment_distribution: Dict[str, int] = {}
    top_topics: List[Dict[str, Any]] = []
    performance_metrics: Dict[str, Any] = {}

# Add a schema for CSAT scores
class AgentCSAT(BaseModel):
    agent_name: str
    total_calls: int
    csat_percentage: float

class DashboardStats(BaseModel):
    total_calls: int
    calls_today: int
    calls_this_week: int
    calls_this_month: int
    avg_sentiment_score: Optional[float] = None
    sentiment_distribution: Dict[str, int] = {}
    top_agents: List[Dict[str, Any]] = []
    recent_calls: List[Dict[str, Any]] = []

class AllTimeStats(BaseModel):
    total_calls: int
    total_agents: int
    avg_calls_per_agent: float
    sentiment_distribution: Dict[str, int] = {}
    avg_sentiment_score: Optional[float] = None
    top_agents: List[Dict[str, Any]] = []
    top_topics: List[Dict[str, Any]] = []
    monthly_trend: List[Dict[str, Any]] = []
    avg_agent_score: Optional[float] = None


class WordCloudData(BaseModel):
    text: str
    value: int

