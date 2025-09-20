import uuid
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

from requests.api import options


class MindFlowAnalysisRequest(BaseModel):
    videoUrl: str
    analysisType: Optional[str] = None
    userId: Optional[int] = None
    jobId: str
    fileId: Optional[int] = None
    
class MindFlowPause(BaseModel):
    start: float
    end: float
    duration: float

class MindFlowEmotion(BaseModel):
    time_sec: float
    emotion: str

class MindFlowFeedback(BaseModel):
    transcript: str
    feedback: str

class MindFlowAudioAnalysis(BaseModel):
    duration: float
    pauses: List[MindFlowPause]
    avg_pitch: float
    energy: float
    estimated_wpm: float
    pitch_trend: List[float]

class MindFlowTranscript(BaseModel):
    timestamp: str
    text: str