import os
import subprocess
import librosa
import soundfile as sf
from deepface import DeepFace
import json
from app.core.config import settings
import numpy as np
from app.schemas.interview import Transcript, AudioAnalysis, Pause, Emotion, InterviewFeedback
from app.schemas.learning_path import LearningModule
from typing import List
from google import genai 
from google.genai import types
import requests
import base64

GEMINI_API_KEY = settings.GOOGLE_API_KEY
client = genai.Client(api_key=settings.GOOGLE_API_KEY)


def get_gemini_text_completion(prompt: str):

    # Define the grounding tool
    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )
    # Configure generation settings
    config = types.GenerateContentConfig(
        response_mime_type="text/plain",
    )
    
    print("PROMPT: ", prompt)
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config=config
    )

    return response.text

def get_gemini_text_completion_with_search(prompt: str):
    # Define the grounding tool
    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )
    # Configure generation settings
    config = types.GenerateContentConfig(
        tools=[grounding_tool],
        response_mime_type="text/plain",
    )
    
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config=config
    )
    return response.text



def get_structured_response_transcript(prompt: str):
    
    
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={
        'temperature': 1,
        'response_mime_type': 'application/json',
        'response_schema': list[Transcript],
        },
    )

    parsed_response = response.parsed
    
    return parsed_response


def get_structured_response_learning_modules(prompt: str):
    
    
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={
        'temperature': 1,
        'response_mime_type': 'application/json',
        'response_schema': list[LearningModule],
        },
    )

    parsed_response = response.parsed
    
    return parsed_response