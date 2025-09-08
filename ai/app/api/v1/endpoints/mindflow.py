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
from app.helpers.mindflow import extract_mindflow_audio_and_frames, analyze_mindflow_frames, get_mindflow_audio_analysis, cleanup_mindflow_temp_files, get_mindflow_analysis_and_feedback
import uuid
from app.schemas.mindflow import MindFlowAnalysisRequest
from datetime import datetime
from fastapi import BackgroundTasks
from app.helpers.auth import create_internal_jwt
from app.helpers.mindflow import convert_mindflow_speech_to_text, generate_mindflow_scenario_question
from app.core.supabase import supabase
from typing import Optional, List, Dict, Any

router = APIRouter()

# Request models for MindFlow soft skills training
class MindFlowTTSRequest(BaseModel):
    text: str
    language: str = "en"
    slow: bool = False

class MindFlowSTTRequest(BaseModel):
    audioUrl: str

class GenerateMindFlowQuestionRequest(BaseModel):
    sessionId: Optional[str] = None
    userId: Optional[int] = None
    initialData: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, Any]]] = None
    prompt: Optional[str] = None


def process_mindflow_video_and_callback(request_data: dict):
    try:
        print("[+] Starting background MindFlow video processing")
        # Download video from URL
        print(f"[+] MindFlow: Downloading video from: {request_data['videoUrl']}")
        response = requests.get(request_data['videoUrl'])
        response.raise_for_status()
        
        # Create upload directory if it doesn't exist
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Generate unique filename for the video
        video_filename = f"mindflow_video_{uuid.uuid4()}.webm"
        video_path = os.path.join(settings.UPLOAD_DIR, video_filename)
        
        # Save video to upload directory
        with open(video_path, "wb") as video_file:
            video_file.write(response.content)
            
        print(f"[+] MindFlow: Downloaded video file to: {video_path}")
        response = get_mindflow_analysis_and_feedback(video_path)
        
        # Analyze video (MindFlow soft skills analysis)
        analysis_result = {
            "jobId": request_data['jobId'],
            "analysisData": response,
            "status": "COMPLETED",
            "errorMessage": None
        }

        # Call Java callback API
        jwt = create_internal_jwt()
        callback_url = f"{settings.BACKEND_URL}/api/mindflow/analysis-callback"
        requests.post(callback_url, json=analysis_result, headers={"Authorization": f"Bearer {jwt}"})

        print("[+] MindFlow callback sent")

    except Exception as e:
        print(f"[!] MindFlow background processing failed: {str(e)}")
    finally:
        if os.path.exists(video_path):
            os.remove(video_path)
            print(f"[+] MindFlow: Cleaned up: {video_path}")
        cleanup_mindflow_temp_files()

@router.post("/analyze")
async def analyze_mindflow(request: MindFlowAnalysisRequest, background_tasks: BackgroundTasks):
    video_path = None
    try:
        response = {
            "jobId": request.jobId,
            "status": "PENDING",
            "message": "MindFlow processing started for job " + str(request.jobId) + " and file id " + str(request.fileId) + " and video url " + str(request.videoUrl) + " and user id " + str(request.userId),
            "createdAt": datetime.now(),
            "estimatedCompletionTime": datetime.now() + timedelta(minutes=5)
        }
        background_tasks.add_task(
            process_mindflow_video_and_callback,
            {
                "jobId": request.jobId,
                "fileId": request.fileId,
                "videoUrl": request.videoUrl,
                "userId": request.userId
            }
        )
        
        return response
        
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"MindFlow failed to download video: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MindFlow analysis failed: {str(e)}")
    finally:
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
            print(f"[+] MindFlow: Cleaned up video file: {video_path}")

# Generate soft skills scenario question
@router.post("/generate-question")
async def generate_mindflow_question(req: GenerateMindFlowQuestionRequest):
    try:
        print("MindFlow Question Request:", req)
        print("--------------------------------")
        print("MindFlow Initial Data:", req.initialData)
        print("MindFlow History:", req.history)
        print("--------------------------------")
        parts: List[str] = []
        # Always include instruction, prefer provided prompt text
        if req.prompt and req.prompt.strip():
            parts.append(req.prompt.strip())
        else:
            parts.append("You are a soft skills trainer. Ask a relevant question to the user to evaluate their soft skills based on the initial data and history.")
        # Always include context when provided
        if req.initialData:
            parts.append("Initial Data: " + json.dumps(req.initialData))
        if req.history:
            parts.append("History: " + json.dumps(req.history))
        composed_prompt = "\n".join(parts)
        question = generate_mindflow_scenario_question(composed_prompt)
        
        if isinstance(question, dict) and question.get("error"):
            raise HTTPException(status_code=500, detail=question.get("error"))
        
        return {"question": question}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MindFlow question generation failed: {str(e)}")

# TTS for MindFlow scenarios
@router.post("/tts")
async def mindflow_tts(req: MindFlowTTSRequest):
    audio_path = None
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        audio_filename = f"mindflow_tts_{uuid.uuid4()}.mp3"
        audio_path = os.path.join(settings.UPLOAD_DIR, audio_filename)

        # Generate audio file locally
        from gtts import gTTS
        tts = gTTS(text=req.text, lang=req.language, slow=req.slow)
        tts.save(audio_path)

        # Read bytes and upload to Supabase storage
        with open(audio_path, "rb") as audio_file:
            audio_bytes = audio_file.read()
        print("[+] MindFlow TTS upload start")
        supabase.storage.from_('utils').upload(audio_filename, audio_bytes, file_options={"content-type": "audio/mpeg"})
        print("[+] MindFlow TTS upload end")
        url = supabase.storage.from_('utils').get_public_url(audio_filename)
        public_url = url.rstrip('?')
        return {"audioUrl": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MindFlow TTS failed: {str(e)}")
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except Exception:
                pass

# STT for MindFlow scenarios
@router.post("/stt")
async def mindflow_stt(req: MindFlowSTTRequest):
    try:
        result = convert_mindflow_speech_to_text(req.audioUrl)
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
        raise HTTPException(status_code=500, detail=f"MindFlow STT failed: {str(e)}")