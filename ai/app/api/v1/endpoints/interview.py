from fastapi import APIRouter, UploadFile, File, HTTPException
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
import requests
import tempfile
from pydantic import BaseModel
from app.core.config import settings
from app.helpers.interview import extract_audio_and_frames, analyze_frames, get_audio_analysis, cleanup_temp_files, get_analysis_and_feedback
import uuid
from app.schemas.interview import VideoAnalysisRequest

router = APIRouter()



@router.post("/analyze")
async def analyze(request: VideoAnalysisRequest):
    video_path = None
    try:
        # Download video from URL
        print(f"[+] Downloading video from: {request.videoUrl}")
        response = requests.get(request.videoUrl)
        response.raise_for_status()
        
        # Create upload directory if it doesn't exist
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Generate unique filename for the video
        video_filename = f"video_{uuid.uuid4()}.webm"
        video_path = os.path.join(settings.UPLOAD_DIR, video_filename)
        
        # Save video to upload directory
        with open(video_path, "wb") as video_file:
            video_file.write(response.content)
            
        print(f"[+] Downloaded video file to: {video_path}")
        response = get_analysis_and_feedback(video_path)
        # cleanup_temp_files()
        
        return response
        
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download video: {str(e)}")
    except Exception as e:
        # Clean up files even if an error occurs
        # cleanup_temp_files()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        cleanup_temp_files()
        # Clean up the downloaded video file
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
            print(f"[+] Cleaned up video file: {video_path}")
