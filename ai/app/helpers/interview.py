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

def analyze_frames() -> List[Emotion]:
    emotions = []
    frame_files = sorted([f for f in os.listdir(FRAME_DIR) if f.endswith(".jpg")])
    for idx, frame in enumerate(frame_files):
        frame_path = os.path.join(FRAME_DIR, frame)
        try:
            result = DeepFace.analyze(frame_path, actions=["emotion"], enforce_detection=False)
            emotions.append(Emotion(time_sec=idx * 2, emotion=result[0]["dominant_emotion"]))
        except Exception:
            emotions.append(Emotion(time_sec=idx * 2, emotion="undetected"))
    return emotions

def get_audio_analysis(audio_path: str) -> AudioAnalysis:
    y, sr = librosa.load(audio_path, sr=16000)
    duration = librosa.get_duration(y=y, sr=sr)

    # --- Pause Detection ---
    intervals = librosa.effects.split(y, top_db=20)
    pauses = []
    for i in range(1, len(intervals)):
        prev_end = intervals[i - 1][1] / sr
        current_start = intervals[i][0] / sr
        if current_start - prev_end > 0.5:
            pauses.append(Pause(
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

    return AudioAnalysis(
        duration=round(duration, 2),
        pauses=pauses,
        avg_pitch=round(float(avg_pitch), 2),
        energy=round(float(energy), 6),
        estimated_wpm=round(estimated_wpm, 2),
        pitch_trend=pitch_trend
    )

def generate_transcripts(file_path: str) -> List[Transcript]:
    
    myfile = client.files.upload(file=file_path)

    prompt = "Transcribe this audio with timestamps (in seconds with respect to the audio file) and with proper transcription text. Speaker is an interviewee."


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
        'response_schema': list[Transcript],
        },
    )

    parsed_response = response.parsed
    if isinstance(parsed_response, list):
        return parsed_response
    else:
        # Fallback to empty list if parsing fails
        return []

def get_analysis_and_feedback(video_path):

    audio_path = extract_audio_and_frames(video_path)

    
    print("[+]GENETATING EMOTIONS")
    emotions = analyze_frames()
    print("[+]EMOTIONS: ", emotions)

    print("[]GENETATING AUDIO ANALYSIS")
    audio_analysis = get_audio_analysis(audio_path)
    print("[+]AUDIO ANALYSIS: ", audio_analysis.dict())


    print("[+]GENETATING TRANSCRIPT")
    transcript = generate_transcripts(audio_path)
    print("[+]TRANSCRIPT: ", transcript)

    prompt = f"""
    Act as an expert AI interview coach. Analyze the following candidate's video interview response.

    Data includes:
    - Transcript (text of the answer, with timestamps)
    - Duration of the interview
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

    Please analyze and provide a comprehensive breakdown and feedback for the candidate. 
    Consider the following components and provide feedback for each of them:
    1. Clarity of speech
    2. Use of filler words
    3. Naturalness of speech rhythm and pacing
    4. Emotional consistency
    5. Confidence level (from both voice and face)
    6. Areas for improvement
    7. Overall score (0–10) with justification
    8. Timestamped highlights or concerns ("At 12s, long pause", "At 24s, looked nervous")
    9. Feedback for the candidate to improve their performance
    
    """
    print("PROMPT: ", prompt)
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={
        'temperature': 1,
        'response_mime_type': 'text/plain',
        },
    )
    feedback_text = response.text if response.text else "No feedback available"
    print("ANSWER: ", feedback_text)
    return feedback_text








def cleanup_temp_files():
    """
    Clean up all temporary files and directories created during analysis.
    This should be called after the analysis response is sent.
    """
    import shutil
    
    # Clean up uploaded video file
    video_path = os.path.join(UPLOAD_DIR, "video.webm")
    print("VIDEO PATH: ", video_path)
    if os.path.exists(video_path):
        os.remove(video_path)
    
    # Clean up extracted audio file
    audio_path = os.path.join(UPLOAD_DIR, "audio.wav")
    print("AUDIO PATH: ", audio_path)
    if os.path.exists(audio_path):
        os.remove(audio_path)
    
    # Clean up all frame images
    print("FRAME DIR: ", FRAME_DIR)
    if os.path.exists(FRAME_DIR):
        for file in os.listdir(FRAME_DIR):
            if file.endswith(".jpg"):
                os.remove(os.path.join(FRAME_DIR, file))
    
    # Clean up all audio segments
    print("AUDIO SEG DIR: ", AUDIO_SEG_DIR)
    if os.path.exists(AUDIO_SEG_DIR):
        for file in os.listdir(AUDIO_SEG_DIR):
            if file.endswith(".wav"):
                os.remove(os.path.join(AUDIO_SEG_DIR, file))
    
    print("Temporary files cleaned up successfully")
    
    


# New helper functions for interactive interview

def convert_speech_to_text(audio_url: str) -> Dict:
    """Convert speech to text using Google's speech recognition"""
    input_audio_path = None
    wav_audio_path = None
    try:
        response = requests.get(audio_url)
        response.raise_for_status()
        print("[+] downloaded audio file")
        
        # Save original audio bytes to a temp file (extension-agnostic)
        input_audio_filename = f"audio_src_{uuid.uuid4()}"
        input_audio_path = os.path.join(UPLOAD_DIR, input_audio_filename)
        with open(input_audio_path, "wb") as audio_file:
            audio_file.write(response.content)
        print("[+] saved source audio to", input_audio_path)
        
        # Convert to PCM WAV 16kHz mono using ffmpeg to satisfy SpeechRecognition
        wav_audio_filename = f"audio_{uuid.uuid4()}.wav"
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
            print("[+] converted audio to wav at", wav_audio_path)
        except subprocess.CalledProcessError as cpe:
            err = cpe.stderr.decode(errors="ignore") if cpe.stderr else str(cpe)
            return {"error": f"Audio conversion failed: {err}"}
        except Exception as ffmpeg_err:
            return {"error": f"Audio conversion failed: {ffmpeg_err}"}
        
        # Process with SpeechRecognition on the converted WAV
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_audio_path) as source:
            audio_data = recognizer.record(source)
        print("[+] processed audio file")
        try:
            text = recognizer.recognize_google(audio_data)
            confidence = 0.9
        except sr.UnknownValueError:
            text = ""
            confidence = 0.0
        except sr.RequestError:
            return {"error": "Speech recognition service unavailable"}
        print("[+] recognized text", text)
        return {
            "text": text,
            "confidence": confidence,
            "language": "en-US"
        }
    except Exception as e:
        return {"error": f"Speech-to-text failed: {str(e)}"}
    finally:
        for path in [input_audio_path, wav_audio_path]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass

def convert_text_to_speech(text: str, language: str = "en", slow: bool = False) -> Dict:
    """Convert text to speech using Google's TTS"""
    audio_path = None
    try:
        # Generate audio with gTTS
        
        audio_filename = f"tts_{uuid.uuid4()}.mp3"
        audio_path = os.path.join(UPLOAD_DIR, audio_filename)
        
        tts = gTTS(text=text, lang=language, slow=slow)
        tts.save(audio_path)
        
        # Convert to base64
        with open(audio_path, "rb") as audio_file:
            audio_bytes = audio_file.read()
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        
        # Estimate duration based on word count
        word_count = len(text.split())
        estimated_duration = word_count / 3  # Approx. 3 words per second
        
        return {
            "audio_base64": audio_base64,
            "duration": estimated_duration,
            "text": text,
            "format": "mp3"
        }
    except Exception as e:
        return {"error": f"Text-to-speech failed: {str(e)}"}
    finally:
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)

def generate_interview_question(prompt: str):
    """Generate interview questions using Gemini AI"""
    
    try:
        ai_response = get_gemini_text_completion(prompt)
        
        return ai_response
    except Exception as e:
        return {"error": f"Question generation failed: {str(e)}"}
