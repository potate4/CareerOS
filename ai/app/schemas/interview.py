import uuid
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

from requests.api import options


class VideoAnalysisRequest(BaseModel):
    videoUrl: str
    analysisType: Optional[str] = None
    userId: Optional[int] = None
    jobId: str
    fileId: Optional[int] = None
    
class Pause(BaseModel):
    start: float
    end: float
    duration: float

class Emotion(BaseModel):
    time_sec: float
    emotion: str

class InterviewFeedback(BaseModel):
    transcript: str
    feedback: str

class AudioAnalysis(BaseModel):
    duration: float
    pauses: List[Pause]
    avg_pitch: float
    energy: float
    estimated_wpm: float
    pitch_trend: List[float]
class Transcript(BaseModel):
  timestamp: str
  text: str




