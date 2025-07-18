from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import os
import shutil
import subprocess
import librosa
import soundfile as sf
from deepface import DeepFace
from datetime import timedelta
import google.generativeai as genai
import json
from app.core.config import settings
from app.helpers.interview import extract_audio_and_frames, analyze_frames, get_audio_analysis, get_transcript_and_feedback

router = APIRouter()
UPLOAD_DIR = "/mnt/data/uploads"


@router.post("/analyze")
async def analyze(video: UploadFile = File(...)):
    video_path = os.path.join(UPLOAD_DIR, "video.webm")
    with open(video_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    audio_path = extract_audio_and_frames(video_path)
    frame_emotions = analyze_frames()
    data = get_audio_analysis(audio_path)

    print(f"Frame emotions: {frame_emotions}")
    print(f"Duration: {data}")
   

    # transcript, feedback = get_transcript_and_feedback(audio_path, duration, pauses, frame_emotions)

    # response = {
    #     "transcript": transcript,
    #     "frame_emotions": frame_emotions,
    #     "speech_analysis": {
    #         "duration_sec": duration,
    #         "pauses": pauses
    #     },
    #     "gemini_feedback": feedback
    # }

    return JSONResponse(content="response")
