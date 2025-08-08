from urllib3 import response
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
from datetime import datetime
from fastapi import BackgroundTasks
from app.helpers.auth import create_internal_jwt
from app.helpers.interview import convert_text_to_speech
router = APIRouter()

def process_video_and_callback(request_data: dict):
    try:
        print("[+] Starting background video processing")
        # Download video from URL
        print(f"[+] Downloading video from: {request_data['videoUrl']}")
        response = requests.get(request_data['videoUrl'])
        response.raise_for_status()
        
        # # Create upload directory if it doesn't exist
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # # Generate unique filename for the video
        video_filename = f"video_{uuid.uuid4()}.webm"
        video_path = os.path.join(settings.UPLOAD_DIR, video_filename)
        
        # # Save video to upload directory
        with open(video_path, "wb") as video_file:
            video_file.write(response.content)
            
        print(f"[+] Downloaded video file to: {video_path}")
        response = get_analysis_and_feedback(video_path)
        
        # response = " kichu bhallaganema"

        # 2. Analyze video (your actual logic)
        analysis_result = {
            "jobId": request_data['jobId'],
            "analysisData": response,
            "status": "COMPLETED",
            "errorMessage": None
        }

        # 3. Call Java callback API
        jwt = create_internal_jwt()
        callback_url = f"{settings.BACKEND_URL}/api/interview/analysis-callback"
        requests.post(callback_url, json=analysis_result, headers={"Authorization": f"Bearer {jwt}"})

        print("[+] Callback sent")

    except Exception as e:
        print(f"[!] Background processing failed: {str(e)}")
    finally:
        if os.path.exists(video_path):
            os.remove(video_path)
            print(f"[+] Cleaned up: {video_path}")
        cleanup_temp_files()

@router.post("/analyze")
async def analyze(request: VideoAnalysisRequest, background_tasks: BackgroundTasks):
    video_path = None
    try:
        response = {
            "jobId": request.jobId,
            "status": "PENDING",
            "message": "Processing started for job " + str(request.jobId) + " and file id " + str(request.fileId) + " and video url " + str(request.videoUrl) + " and user id " + str(request.userId),
            "createdAt": datetime.now(),
            "estimatedCompletionTime": datetime.now() + timedelta(minutes=5)
        }
        background_tasks.add_task(
            process_video_and_callback,
            {
                "jobId": request.jobId,
                "fileId": request.fileId,
                "videoUrl": request.videoUrl,
                "userId": request.userId
            }
        )
        # response = "Processing started for job " + str(request.jobId) + " and file id " + str(request.fileId) + " and video url " + str(request.videoUrl) + " and user id " + str(request.userId)
        # Download video from URL
        # print(f"[+] Downloading video from: {request.videoUrl}")
        # response = requests.get(request.videoUrl)
        # response.raise_for_status()
        
        # # Create upload directory if it doesn't exist
        # os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # # Generate unique filename for the video
        # video_filename = f"video_{uuid.uuid4()}.webm"
        # video_path = os.path.join(settings.UPLOAD_DIR, video_filename)
        
        # # Save video to upload directory
        # with open(video_path, "wb") as video_file:
        #     video_file.write(response.content)
            
        # print(f"[+] Downloaded video file to: {video_path}")
        # response = get_analysis_and_feedback(video_path)
        # cleanup_temp_files()
        
        return response
        
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download video: {str(e)}")
    except Exception as e:
        # Clean up files even if an error occurs
        # cleanup_temp_files()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        # cleanup_temp_files()
        # Clean up the downloaded video file
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
            print(f"[+] Cleaned up video file: {video_path}")



@router.post("/tts")
async def analyze(text: str, language: str = "en", slow: bool = False):
    
    try:
        response = convert_text_to_speech(text, language, slow)
        
        
        return response
        
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download video: {str(e)}")
    except Exception as e:
        # Clean up files even if an error occurs
        # cleanup_temp_files()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    


