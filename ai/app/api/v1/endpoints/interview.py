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

router = APIRouter()

UPLOAD_DIR = "/mnt/data/uploads"
FRAME_DIR = "/mnt/data/frames"
AUDIO_SEG_DIR = "/mnt/data/audio_segments"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(FRAME_DIR, exist_ok=True)
os.makedirs(AUDIO_SEG_DIR, exist_ok=True)

# Initialize Gemini
GEMINI_API_KEY = settings.GOOGLE_API_KEY
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")


def extract_audio_and_frames(video_path: str):
    audio_path = os.path.join(UPLOAD_DIR, "audio.wav")
    subprocess.run(["ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audio_path], check=True)
    subprocess.run(["ffmpeg", "-i", video_path, "-vf", "fps=0.5", os.path.join(FRAME_DIR, "frame_%03d.jpg")], check=True)
    return audio_path


def segment_audio(audio_path: str, segment_length_sec=2):
    y, sr = librosa.load(audio_path, sr=16000)
    segment_length = segment_length_sec * sr
    segment_files = []
    for i in range(0, len(y), segment_length):
        segment = y[i:i + segment_length]
        segment_path = os.path.join(AUDIO_SEG_DIR, f"audio_{i // segment_length}.wav")
        sf.write(segment_path, segment, sr)
        segment_files.append(segment_path)
    return segment_files


def analyze_frames():
    emotions = []
    frame_files = sorted([f for f in os.listdir(FRAME_DIR) if f.endswith(".jpg")])
    for idx, frame in enumerate(frame_files):
        frame_path = os.path.join(FRAME_DIR, frame)
        try:
            result = DeepFace.analyze(frame_path, actions=["emotion"], enforce_detection=False)
            emotions.append({"time_sec": idx * 2, "emotion": result[0]["dominant_emotion"]})
        except Exception:
            emotions.append({"time_sec": idx * 2, "emotion": "undetected"})
    return emotions


def get_audio_analysis(audio_path: str):
    y, sr = librosa.load(audio_path, sr=16000)
    duration_sec = librosa.get_duration(y=y, sr=sr)
    intervals = librosa.effects.split(y, top_db=20)
    pauses = []
    for i in range(1, len(intervals)):
        prev_end = intervals[i - 1][1] / sr
        current_start = intervals[i][0] / sr
        if current_start - prev_end > 0.5:
            pauses.append({"start": round(prev_end, 2), "end": round(current_start, 2), "duration": round(current_start - prev_end, 2)})
    return duration_sec, pauses


def get_transcript_and_feedback(audio_path: str, duration: float, pauses: list, emotions: list):
    # Placeholder transcript until Gemini audio transcription is available
    transcript = "Hi, um I think, like, I am a great fit for this job because, uh, I have the required skills..."

    detailed_json = {
        "duration": duration,
        "transcript": transcript,
        "speech_pauses": pauses,
        "emotions": emotions
    }

    prompt = f"""
    Act as an expert AI interview coach. Analyze the following candidate's video interview response.

    Data includes:
    - Transcript (text of the answer)
    - Speaking duration
    - Pauses detected in speech (with timestamps)
    - Detected facial emotions over time (2-second intervals)

    JSON Data:
    {json.dumps(detailed_json, indent=2)}

    Please analyze and provide a comprehensive breakdown:
    1. Clarity of speech
    2. Use of filler words
    3. Naturalness of speech rhythm and pacing
    4. Emotional consistency
    5. Confidence level (from both voice and face)
    6. Areas for improvement
    7. Overall score (0–10) with justification
    8. Timestamped highlights or concerns ("At 12s, long pause", "At 24s, looked nervous")
    """

    response = model.generate_content(prompt)
    return transcript, response.text


@router.post("/analyze")
async def analyze(video: UploadFile = File(...)):
    video_path = os.path.join(UPLOAD_DIR, "video.webm")
    with open(video_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    audio_path = extract_audio_and_frames(video_path)
    frame_emotions = analyze_frames()
    duration, pauses = get_audio_analysis(audio_path)

    print(f"Frame emotions: {frame_emotions}")
    print(f"Duration: {duration}")
    print(f"Pauses: {pauses}")

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
