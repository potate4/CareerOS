import React, { useState, useRef, useEffect } from 'react';
import { Video, Square, Pause, Play, Save, Trash2, Mic, MicOff, Video as VideoIcon, VideoOff, AlertCircle } from 'lucide-react';
import { RecordingState } from '../types';

// Pick the best supported MediaRecorder mime for wide compatibility
const getBestSupportedMime = (): string | undefined => {
  const candidates = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm'
  ];
  for (const m of candidates) {
    if ((window as any).MediaRecorder && (window as any).MediaRecorder.isTypeSupported && (window as any).MediaRecorder.isTypeSupported(m)) {
      return m;
    }
  }
  return undefined;
};

interface VideoRecorderProps {
  onRecordingComplete: (videoBlob: Blob) => void;
  onReset: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onRecordingComplete, onReset }) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    mediaRecorder: null,
    videoChunks: [],
    videoBlob: null,
    videoUrl: null,
    stream: null,
  });

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        (videoRef.current as any).srcObject = stream;
      }
      
      setRecordingState(prev => ({ ...prev, stream }));
      setHasPermission(true);
      setIsCameraOn(true);
      
      return stream;
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      setHasPermission(false);
      alert('Unable to access camera and microphone. Please check permissions.');
      return null;
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      const stream = await requestPermissions();
      if (!stream) return;
    }

    try {
      const stream = recordingState.stream || await requestPermissions();
      if (!stream) return;

      const mime = getBestSupportedMime();
      const mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      const videoChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        videoChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const type = mime || 'video/webm';
        const videoBlob = new Blob(videoChunks, { type });
        const videoUrl = URL.createObjectURL(videoBlob);
        
        setRecordingState(prev => ({
          ...prev,
          videoBlob,
          videoUrl,
          isRecording: false,
          isPaused: false,
        }));

        onRecordingComplete(videoBlob);
      };

      mediaRecorder.start();
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        mediaRecorder,
        videoChunks,
        duration: 0,
      }));

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check your camera and microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (recordingState.mediaRecorder && recordingState.isRecording) {
      recordingState.mediaRecorder.stop();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const pauseRecording = () => {
    if (recordingState.mediaRecorder && recordingState.isRecording) {
      recordingState.mediaRecorder.pause();
      setRecordingState(prev => ({ ...prev, isPaused: true }));
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (recordingState.mediaRecorder && recordingState.isPaused) {
      recordingState.mediaRecorder.resume();
      setRecordingState(prev => ({ ...prev, isPaused: false }));
      
      // Restart timer
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    }
  };

  const resetRecording = () => {
    if (recordingState.mediaRecorder) {
      (recordingState.mediaRecorder.stream as MediaStream).getTracks().forEach(track => track.stop());
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (recordingState.videoUrl) {
      URL.revokeObjectURL(recordingState.videoUrl);
    }

    if (videoRef.current) {
      (videoRef.current as any).srcObject = null;
    }

    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      mediaRecorder: null,
      videoChunks: [],
      videoBlob: null,
      videoUrl: null,
      stream: null,
    });

    setHasPermission(null);
    setIsCameraOn(false);

    onReset();
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (recordingState.stream) {
        (recordingState.stream as MediaStream).getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        (videoRef.current as any).srcObject = null;
      }
      setIsCameraOn(false);
      setHasPermission(null);
    } else {
      await requestPermissions();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recordingState.videoUrl) {
        URL.revokeObjectURL(recordingState.videoUrl);
      }
      if (recordingState.stream) {
        (recordingState.stream as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2 text-slate-900">Video Recorder</h3>
        <div className="text-3xl font-mono font-bold text-slate-600">
          {formatTime(recordingState.duration)}
        </div>
      </div>

      {/* Video Preview */}
      <div className="mb-6">
        <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="mx-auto h-12 w-12 mb-2 text-slate-400" />
                <p className="text-sm text-slate-500">Camera is off</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camera Controls */}
      <div className="flex justify-center mb-4">
        <button
          onClick={toggleCamera}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white ${
            isCameraOn ? 'bg-slate-600 hover:bg-slate-700' : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {isCameraOn ? (
            <>
              <VideoOff className="h-4 w-4" />
              Turn Off Camera
            </>
          ) : (
            <>
              <VideoIcon className="h-4 w-4" />
              Turn On Camera
            </>
          )}
        </button>
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!recordingState.isRecording && !recordingState.videoBlob && (
          <button
            onClick={startRecording}
            disabled={!isCameraOn}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800"
          >
            <Video className="h-5 w-5" />
            Start Recording
          </button>
        )}

        {recordingState.isRecording && !recordingState.isPaused && (
          <>
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-colors bg-slate-600 hover:bg-slate-700"
            >
              <Pause className="h-5 w-5" />
              Pause
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-colors bg-slate-800 hover:bg-slate-900"
            >
              <Square className="h-5 w-5" />
              Stop
            </button>
          </>
        )}

        {recordingState.isRecording && recordingState.isPaused && (
          <>
            <button
              onClick={resumeRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-colors bg-slate-900 hover:bg-slate-800"
            >
              <Play className="h-5 w-5" />
              Resume
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-colors bg-slate-800 hover:bg-slate-900"
            >
              <Square className="h-5 w-5" />
              Stop
            </button>
          </>
        )}

        {recordingState.videoBlob && (
          <>
            <button
              onClick={resetRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-colors bg-slate-600 hover:bg-slate-700"
            >
              <Trash2 className="h-5 w-5" />
              Reset
            </button>
          </>
        )}
      </div>

      {/* Recording Preview */}
      {recordingState.videoUrl && (
        <div className="mt-4">
          <h4 className="text-lg font-medium mb-2 text-slate-900">Recording Preview</h4>
          <video controls className="w-full rounded-xl">
            <source src={recordingState.videoUrl} type="video/webm" />
            Your browser does not support the video element.
          </video>
        </div>
      )}

      {/* Recording Status */}
      {recordingState.isRecording && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100">
            <div className="w-3 h-3 bg-slate-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">Recording...</span>
          </div>
        </div>
      )}

      {/* Permission Status */}
      {hasPermission === false && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100">
            <AlertCircle className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              Camera access denied. Please enable camera and microphone permissions.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder; 