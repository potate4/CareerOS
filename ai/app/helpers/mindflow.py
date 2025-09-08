import os
import subprocess
import librosa
import soundfile as sf
from deepface import DeepFace
import json
from app.core.config import settings
import numpy as np
from app.schemas.mindflow import MindFlowTranscript, MindFlowAudioAnalysis, MindFlowPause, MindFlowEmotion, MindFlowFeedback
from typing import List
from google import genai 
import requests
import base64
import uuid
import speech_recognition as sr
from gtts import gTTS
from typing import Dict

UPLOAD_DIR = settings.UPLOAD_DIR
FRAME_DIR = settings.FRAME_DIR
AUDIO_SEG_DIR = settings.AUDIO_SEG_DIR
GEMINI_API_KEY = settings.GOOGLE_API_KEY
client = genai.Client(api_key=settings.GOOGLE_API_KEY)

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(FRAME_DIR, exist_ok=True)
os.makedirs(AUDIO_SEG_DIR, exist_ok=True)


def get_gemini_mindflow_completion(prompt: str):
    print("MINDFLOW PROMPT: ", prompt)
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={
        'temperature': 1,
        'response_mime_type': 'text/plain',
        },
    )

    return response.text


def extract_mindflow_audio_and_frames(video_path: str):
    audio_path = os.path.join(UPLOAD_DIR, "mindflow_audio.wav")
    subprocess.run(["ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audio_path], check=True)
    subprocess.run(["ffmpeg", "-i", video_path, "-vf", "fps=0.5", os.path.join(FRAME_DIR, "mindflow_frame_%03d.jpg")], check=True)
    return audio_path

def analyze_mindflow_frames() -> List[MindFlowEmotion]:
    emotions = []
    frame_files = sorted([f for f in os.listdir(FRAME_DIR) if f.startswith("mindflow_frame_") and f.endswith(".jpg")])
    for idx, frame in enumerate(frame_files):
        frame_path = os.path.join(FRAME_DIR, frame)
        try:
            result = DeepFace.analyze(frame_path, actions=["emotion"], enforce_detection=False)
            emotions.append(MindFlowEmotion(time_sec=idx * 2, emotion=result[0]["dominant_emotion"]))
        except Exception:
            emotions.append(MindFlowEmotion(time_sec=idx * 2, emotion="undetected"))
    return emotions

def get_mindflow_audio_analysis(audio_path: str) -> MindFlowAudioAnalysis:
    y, sr = librosa.load(audio_path, sr=16000)
    duration = librosa.get_duration(y=y, sr=sr)

    # --- Pause Detection ---
    intervals = librosa.effects.split(y, top_db=20)
    pauses = []
    for i in range(1, len(intervals)):
        prev_end = intervals[i - 1][1] / sr
        current_start = intervals[i][0] / sr
        if current_start - prev_end > 0.5:
            pauses.append(MindFlowPause(
                start=round(prev_end, 2),
                end=round(current_start, 2),
                duration=round(current_start - prev_end, 2)
            ))

    # --- Pitch Analysis ---
    pitch = librosa.yin(y, fmin=50, fmax=300, sr=sr)
    avg_pitch = np.nanmean(pitch)
    pitch_trend = pitch.tolist()[::sr // 2]  # downsample for timeline

    # --- Energy (Loudness) ---
    energy = np.square(y).mean()

    # --- Speaking Rate Estimate ---
    total_words = int(duration / 0.4)  # ~1 word per 400ms (approx.)
    estimated_wpm = (total_words / duration) * 60

    return MindFlowAudioAnalysis(
        duration=round(duration, 2),
        pauses=pauses,
        avg_pitch=round(float(avg_pitch), 2),
        energy=round(float(energy), 6),
        estimated_wpm=round(estimated_wpm, 2),
        pitch_trend=pitch_trend
    )

def generate_mindflow_transcripts(file_path: str) -> List[MindFlowTranscript]:
    
    myfile = client.files.upload(file=file_path)

    prompt = "Transcribe this audio with timestamps (in seconds with respect to the audio file) and with proper transcription text. Speaker is practicing soft skills communication."

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=[prompt, myfile],
        config={
        'temperature': 1,
        'response_mime_type': 'text/plain',
        },
    )

    format_reponse_prompt = f"""Format the response in a JSON format. The response should be a list of objects, each object should have a timestamp and a text.\n {response.text}"""
  
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=format_reponse_prompt,
        config={
        'temperature': 1,
        'response_mime_type': 'application/json',
        'response_schema': list[MindFlowTranscript],
        },
    )

    parsed_response = response.parsed
    if isinstance(parsed_response, list):
        return parsed_response
    else:
        # Fallback to empty list if parsing fails
        return []

def get_mindflow_analysis_and_feedback(video_path):

    audio_path = extract_mindflow_audio_and_frames(video_path)

    
    print("[+] GENERATING MINDFLOW EMOTIONS")
    emotions = analyze_mindflow_frames()
    print("[+] MINDFLOW EMOTIONS: ", emotions)

    print("[+] GENERATING MINDFLOW AUDIO ANALYSIS")
    audio_analysis = get_mindflow_audio_analysis(audio_path)
    print("[+] MINDFLOW AUDIO ANALYSIS: ", audio_analysis.dict())


    print("[+] GENERATING MINDFLOW TRANSCRIPT")
    transcript = generate_mindflow_transcripts(audio_path)
    print("[+] MINDFLOW TRANSCRIPT: ", transcript)

    prompt = f"""
    Act as an expert soft skills communication coach. Analyze the following candidate's roleplay scenario response for soft skills development.

    Data includes:
    - Transcript (text of the response, with timestamps)
    - Duration of the communication
    - Pauses detected in speech (with timestamps)
    - Average pitch of the speech
    - Energy of the speech
    - Estimated words per minute
    - Pitch trend of the speech
    - Detected facial emotions over time (2-second intervals)

    data is given below delimited by ```

    data: ```
    Transcript:
    {json.dumps([t.dict() for t in transcript] if transcript else [], indent=2)}
    
    Audio Analysis:
    {json.dumps(audio_analysis.dict(), indent=2)}
    
    Emotions:
    {json.dumps([e.dict() for e in emotions], indent=2)}
    ```

    Please analyze and provide comprehensive feedback for soft skills development. 
    Consider the following components and provide feedback for each:
    1. Communication clarity and articulation
    2. Emotional intelligence and empathy
    3. Confidence and assertiveness
    4. Active listening cues (even in response)
    5. Persuasion and negotiation skills
    6. Conflict resolution approach
    7. Professional tone and presence
    8. Body language and emotional consistency
    9. Areas for improvement
    10. Overall soft skills score (0–10) with justification
    11. Timestamped highlights ("At 12s, showed good empathy", "At 24s, could be more assertive")
    12. Specific recommendations for improving soft skills performance
    
    Focus on workplace communication scenarios like:
    - Salary negotiations
    - Difficult conversations with colleagues
    - Team conflict resolution
    - Client communication
    - Leadership presence
    """
    print("MINDFLOW PROMPT: ", prompt)
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={
        'temperature': 1,
        'response_mime_type': 'text/plain',
        },
    )
    feedback_text = response.text if response.text else "No feedback available"
    print("MINDFLOW ANSWER: ", feedback_text)
    return feedback_text


def cleanup_mindflow_temp_files():
    """
    Clean up all temporary files and directories created during MindFlow analysis.
    This should be called after the analysis response is sent.
    """
    import shutil
    
    # Clean up uploaded video file
    video_path = os.path.join(UPLOAD_DIR, "video.webm")
    print("MINDFLOW VIDEO PATH: ", video_path)
    if os.path.exists(video_path):
        os.remove(video_path)
    
    # Clean up extracted audio file
    audio_path = os.path.join(UPLOAD_DIR, "mindflow_audio.wav")
    print("MINDFLOW AUDIO PATH: ", audio_path)
    if os.path.exists(audio_path):
        os.remove(audio_path)
    
    # Clean up all frame images
    print("MINDFLOW FRAME DIR: ", FRAME_DIR)
    if os.path.exists(FRAME_DIR):
        for file in os.listdir(FRAME_DIR):
            if file.startswith("mindflow_frame_") and file.endswith(".jpg"):
                os.remove(os.path.join(FRAME_DIR, file))
    
    print("MindFlow temporary files cleaned up successfully")
    

# MindFlow-specific helper functions for interactive soft skills training

def convert_mindflow_speech_to_text(audio_url: str) -> Dict:
    """Convert speech to text for MindFlow soft skills training"""
    input_audio_path = None
    wav_audio_path = None
    try:
        response = requests.get(audio_url)
        response.raise_for_status()
        print("[+] MindFlow: downloaded audio file")
        
        # Save original audio bytes to a temp file (extension-agnostic)
        input_audio_filename = f"mindflow_audio_src_{uuid.uuid4()}"
        input_audio_path = os.path.join(UPLOAD_DIR, input_audio_filename)
        with open(input_audio_path, "wb") as audio_file:
            audio_file.write(response.content)
        print("[+] MindFlow: saved source audio to", input_audio_path)
        
        # Convert to PCM WAV 16kHz mono using ffmpeg to satisfy SpeechRecognition
        wav_audio_filename = f"mindflow_audio_{uuid.uuid4()}.wav"
        wav_audio_path = os.path.join(UPLOAD_DIR, wav_audio_filename)
        try:
            completed = subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-i",
                    input_audio_path,
                    "-acodec",
                    "pcm_s16le",
                    "-ar",
                    "16000",
                    "-ac",
                    "1",
                    wav_audio_path,
                ],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            print("[+] MindFlow: converted audio to wav at", wav_audio_path)
        except subprocess.CalledProcessError as cpe:
            err = cpe.stderr.decode(errors="ignore") if cpe.stderr else str(cpe)
            return {"error": f"MindFlow audio conversion failed: {err}"}
        except Exception as ffmpeg_err:
            return {"error": f"MindFlow audio conversion failed: {ffmpeg_err}"}
        
        # Process with SpeechRecognition on the converted WAV
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_audio_path) as source:
            audio_data = recognizer.record(source)
        print("[+] MindFlow: processed audio file")
        try:
            text = recognizer.recognize_google(audio_data)
            confidence = 0.9
        except sr.UnknownValueError:
            text = ""
            confidence = 0.0
        except sr.RequestError:
            return {"error": "MindFlow speech recognition service unavailable"}
        print("[+] MindFlow: recognized text", text)
        return {
            "text": text,
            "confidence": confidence,
            "language": "en-US"
        }
    except Exception as e:
        return {"error": f"MindFlow speech-to-text failed: {str(e)}"}
    finally:
        for path in [input_audio_path, wav_audio_path]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass

def generate_mindflow_scenario_question(prompt: str):
    """Generate soft skills scenario questions using Gemini AI"""
    
    try:
        # Enhanced prompt for soft skills scenarios
        mindflow_enhanced_prompt = f"""
        You are an expert soft skills trainer and roleplay coach. Your role is to facilitate workplace communication scenarios.
        
        You should create realistic, challenging workplace situations that help develop:
        - Communication skills
        - Negotiation abilities  
        - Conflict resolution
        - Emotional intelligence
        - Leadership presence
        - Professional assertiveness
        
        Available scenario types:
        1. Salary Negotiation - Practice asking for raises, discussing compensation
        2. Difficult Conversations - Handle performance issues, give feedback
        3. Team Conflicts - Mediate disputes, build consensus
        4. Client Relations - Manage expectations, handle complaints
        5. Leadership Moments - Make tough decisions, inspire teams
        
        Your responses should be conversational, realistic, and emotionally intelligent. 
        Adapt your personality and approach based on the scenario context.
        
        Original request: {prompt}
        """
        
        ai_response = get_gemini_mindflow_completion(mindflow_enhanced_prompt)
        
        return ai_response
    except Exception as e:
        print("MINDFLOW ERROR: ", e)
        return {"error": f"MindFlow question generation failed: {str(e)}"}