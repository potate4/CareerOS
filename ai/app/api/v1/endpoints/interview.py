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
from app.helpers.interview import convert_speech_to_text, generate_interview_question
from app.core.supabase import supabase
from typing import Optional, List, Dict, Any

router = APIRouter()

# Request models to ensure JSON body parsing and Java-compatible field names
class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    slow: bool = False

class STTRequest(BaseModel):
    audioUrl: str

class GenerateQuestionRequest(BaseModel):
    sessionId: Optional[str] = None
    userId: Optional[int] = None
    initialData: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, Any]]] = None
    prompt: Optional[str] = None


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
        
        return response
        
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download video: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
            print(f"[+] Cleaned up video file: {video_path}")

# New endpoint: generate interview question expected by Java service
@router.post("/generate-question")
async def generate_question(req: GenerateQuestionRequest):
    try:
        print(req)
        print("--------------------------------")
        print(req.initialData   )
        print(req.history)
        print("--------------------------------")
        parts: List[str] = []
        # Always include instruction, prefer provided prompt text
        if req.prompt and req.prompt.strip():
            parts.append(req.prompt.strip())
        else:
            parts.append("You are an interview simulator. Ask a concise, relevant next question.")
        # Always include context when provided
        if req.initialData:
            parts.append("Initial Data: " + json.dumps(req.initialData))
        if req.history:
            parts.append("History: " + json.dumps(req.history))
        composed_prompt = "\n".join(parts)
        question = generate_interview_question(composed_prompt)
        if isinstance(question, dict) and question.get("error"):
            raise HTTPException(status_code=500, detail=question.get("error"))
        return {"question": question}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

# Updated endpoint: TTS returns audioUrl by uploading to Supabase; accepts JSON body
@router.post("/tts")
async def tts(req: TTSRequest):
    audio_path = None
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        audio_filename = f"tts_{uuid.uuid4()}.mp3"
        audio_path = os.path.join(settings.UPLOAD_DIR, audio_filename)

        # Generate audio file locally
        from gtts import gTTS
        tts = gTTS(text=req.text, lang=req.language, slow=req.slow)
        tts.save(audio_path)

        # Read bytes and upload to Supabase storage
        with open(audio_path, "rb") as audio_file:
            audio_bytes = audio_file.read()
        print("[+] TTS upload start")
        supabase.storage.from_('utils').upload(audio_filename, audio_bytes, file_options={"content-type": "audio/mpeg"})
        print("[+] TTS upload end")
        url = supabase.storage.from_('utils').get_public_url(audio_filename)
        public_url = url.rstrip('?')
        return {"audioUrl": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except Exception:
                pass

# Updated endpoint: STT accepts JSON body with audioUrl and returns transcript (matching Java expectation)
@router.post("/stt")
async def stt(req: STTRequest):
    try:
        result = convert_speech_to_text(req.audioUrl)
        if isinstance(result, dict) and result.get("error"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        return {
            "transcript": result.get("text", ""),
            "confidence": result.get("confidence"),
            "language": result.get("language")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")
    
