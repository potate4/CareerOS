import uuid
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class VideoAnalysisRequest(BaseModel):
    video_url: str
    
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




