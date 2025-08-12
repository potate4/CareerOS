import os
import subprocess
import librosa
import soundfile as sf
from deepface import DeepFace
import json
from app.core.config import settings
import numpy as np
from app.schemas.interview import Transcript, AudioAnalysis, Pause, Emotion, InterviewFeedback
from typing import List
from google import genai 
import requests
import base64

GEMINI_API_KEY = settings.GOOGLE_API_KEY
client = genai.Client(api_key=settings.GOOGLE_API_KEY)

def get_gemini_text_completion(prompt: str):


    print("PROMPT: ", prompt)
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={
        'temperature': 1,
        'response_mime_type': 'text/plain',
        },
    )

    return response.text



