import React, { useState, useEffect, useRef } from 'react';
import { Video, Save, Play, Download, Trash2, AlertCircle, CheckCircle, Clock, CheckCircle2, XCircle, MessageCircle, Mic, Square, ChevronDown, ChevronRight, Eye, FileText, Calendar, User, Bot, Camera, CameraOff } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';
import VideoRecorder from './VideoRecorder';
import { interviewAPI } from '../services/interviewAPI';
import { InterviewRecording, InterviewRecordingRequest, FileAnalysisResponse, ConversationMessage, InterviewSessionDTO } from '../types';
import { ApiError } from '../../../utils/apiErrorHandler';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const isLikelyVideo = (url: string, category?: string) => {
  if (category && category.toLowerCase().includes('audio')) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.webm') || lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.mkv');
};

// Best-supported MediaRecorder mime for broader playback (VP8 preferred)
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

const InterviewSimulatorPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentRecording, setCurrentRecording] = useState<Blob | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileAnalysisData, setFileAnalysisData] = useState<FileAnalysisResponse[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // File list state
  const [isFilesCollapsed, setIsFilesCollapsed] = useState(false);
  const [expandedFileId, setExpandedFileId] = useState<number | null>(null);

  // Interactive simulation state
  const [activeSession, setActiveSession] = useState<InterviewSessionDTO | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isSimStarting, setIsSimStarting] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  // Mic recording for interactive answers
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isMicRecording, setIsMicRecording] = useState(false);

  // Continuous session recorder (video + mixed mic + AI)
  const camStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mixDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const ttsAudioElRef = useRef<HTMLAudioElement | null>(null);
  const ttsSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const sessionRecorderRef = useRef<MediaRecorder | null>(null);
  const sessionChunksRef = useRef<Blob[]>([]);
  const sessionStreamRef = useRef<MediaStream | null>(null);
  const sessionMimeRef = useRef<string | undefined>(undefined);

  // Interview preferences
  const [prefRole, setPrefRole] = useState('');
  const [prefSeniority, setPrefSeniority] = useState('');
  const [prefCompany, setPrefCompany] = useState('');
  const [prefFocusAreas, setPrefFocusAreas] = useState(''); // comma-separated
  const [prefLanguage, setPrefLanguage] = useState('');
  const [prefDifficulty, setPrefDifficulty] = useState('');

  useEffect(() => {
    loadFileAnalysisData();
    return () => {
      if (audioRecorderRef.current && isMicRecording) {
        try { audioRecorderRef.current.stop(); } catch {}
      }
      if (sessionRecorderRef.current && sessionRecorderRef.current.state !== 'inactive') {
        try { sessionRecorderRef.current.stop(); } catch {}
      }
      [micStreamRef.current, camStreamRef.current].forEach((s) => {
        if (s) s.getTracks().forEach(t => t.stop());
      });
      micStreamRef.current = null;
      camStreamRef.current = null;
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
        audioCtxRef.current = null;
      }
      ttsAudioElRef.current = null;
    };
  }, []);

  const loadFileAnalysisData = async () => {
    try {
      const fileData = await interviewAPI.getFileAnalysisData();
      setFileAnalysisData(fileData);
    } catch (err: unknown) {
      console.error('Failed to load file analysis data:', err);
    }
  };

  const handleRecordingComplete = (videoBlob: Blob) => {
    setCurrentRecording(videoBlob);
    setError(null);
    setSuccess(null);
  };

  const handleReset = () => {
    setCurrentRecording(null);
    setSessionTitle('');
    setDescription('');
    setError(null);
    setSuccess(null);
  };

  const handleSaveRecording = async () => {
    if (!currentRecording) {
      setError('No recording to save');
      return;
    }
    if (!sessionTitle.trim()) {
      setError('Please provide a session title');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const fileName = `interview-recording-${Date.now()}.webm`;
      const file = new File([currentRecording], fileName, { type: 'video/webm' });
      const request: InterviewRecordingRequest = { file, description: description.trim() || undefined, sessionTitle: sessionTitle.trim(), fileType: 'video' };
      const response = await interviewAPI.uploadRecording(request);
      if ((response as any).success) {
        setSuccess('Recording saved successfully!');
        setCurrentRecording(null);
        setSessionTitle('');
        setDescription('');
        await loadFileAnalysisData();
      } else {
        setError((response as any).message || 'Failed to save recording');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save recording';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecording = async (recordingId: number) => {
    if (!confirm('Delete this recording?')) return;
    try {
      await interviewAPI.deleteRecording(recordingId);
      await loadFileAnalysisData();
      setSuccess('Recording deleted successfully!');
      if (expandedFileId === recordingId) {
        setExpandedFileId(null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete recording';
      setError(errorMessage);
    }
  };

  const handleAnalyzeRecording = async (fileAnalysis: FileAnalysisResponse) => {
    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);
    setAnalysisResult(null);
    try {
      const result = await interviewAPI.analyzeInterview(fileAnalysis.fileUrl, 'comprehensive', fileAnalysis.fileId, user?.id!);
      setAnalysisResult(result);
      setSuccess('Interview analysis completed successfully!');
      await loadFileAnalysisData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze recording';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFileExpanded = (fileId: number) => {
    setExpandedFileId(expandedFileId === fileId ? null : fileId);
  };

  const setupSessionRecording = async () => {
    try {
      if (!micStreamRef.current) {
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (!camStreamRef.current) {
        camStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!mixDestRef.current) mixDestRef.current = audioCtxRef.current.createMediaStreamDestination();
      if (!micSourceRef.current) {
        micSourceRef.current = audioCtxRef.current.createMediaStreamSource(micStreamRef.current!);
        micSourceRef.current.connect(mixDestRef.current);
      }
      const videoTrack = camStreamRef.current.getVideoTracks()[0];
      const mixedAudioTrack = mixDestRef.current.stream.getAudioTracks()[0];
      sessionStreamRef.current = new MediaStream([videoTrack, mixedAudioTrack]);
      sessionChunksRef.current = [];
      const mime = getBestSupportedMime();
      sessionMimeRef.current = mime;
      sessionRecorderRef.current = mime ? new MediaRecorder(sessionStreamRef.current, { mimeType: mime }) : new MediaRecorder(sessionStreamRef.current);
      sessionRecorderRef.current.ondataavailable = (e) => { if (e.data && e.data.size > 0) sessionChunksRef.current.push(e.data); };
      sessionRecorderRef.current.start();
    } catch (e: any) { 
      console.error('Error setting up session recording:', e);
      if (e.name === 'NotReadableError') {
        setError('Camera/microphone is currently in use by another application. Please close other applications and try again.');
      } else if (e.name === 'NotAllowedError') {
        setError('Camera/microphone access denied. Please allow permissions and refresh the page.');
      } else if (e.name === 'NotFoundError') {
        setError('No camera or microphone found. Please connect these devices and try again.');
      } else {
        setError('Failed to start session recorder. Please check your camera and microphone.');
      }
    }
  };

  const playTTSMixed = async (url?: string | null) => {
    if (!url) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!mixDestRef.current) mixDestRef.current = audioCtxRef.current.createMediaStreamDestination();
      if (!ttsAudioElRef.current) { ttsAudioElRef.current = new Audio(); ttsAudioElRef.current.crossOrigin = 'anonymous'; ttsAudioElRef.current.preload = 'auto'; }
      if (!ttsSourceRef.current) {
        ttsSourceRef.current = audioCtxRef.current.createMediaElementSource(ttsAudioElRef.current);
        ttsSourceRef.current.connect(audioCtxRef.current.destination);
        ttsSourceRef.current.connect(mixDestRef.current);
      }
      ttsAudioElRef.current.src = url;
      await ttsAudioElRef.current.play();
    } catch {}
  };

  const startMicRecording = async () => {
    try {
      if (!micStreamRef.current) { micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      const mime = 'audio/webm;codecs=opus';
      const recorder = new MediaRecorder(micStreamRef.current, { mimeType: mime });
      audioRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.start();
      setIsMicRecording(true);
    } catch (e: any) { 
      console.error('Error starting microphone recording:', e);
      if (e.name === 'NotReadableError') {
        setError('Microphone is currently in use by another application. Please close other applications and try again.');
      } else if (e.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow permissions and refresh the page.');
      } else if (e.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Microphone unavailable. Please check your microphone and try again.');
      }
    }
  };

  const stopMicRecordingAndGetBlob = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = audioRecorderRef.current;
      if (!recorder) return resolve(null);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioRecorderRef.current = null;
        setIsMicRecording(false);
        resolve(blob);
      };
      recorder.stop();
    });
  };

  const buildInitialSessionData = () => {
    const focusList = prefFocusAreas
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const data: Record<string, any> = {
      role: prefRole || undefined,
      seniority: prefSeniority || undefined,
      company: prefCompany || undefined,
      focusAreas: focusList.length ? focusList : undefined,
      language: prefLanguage || undefined,
      difficulty: prefDifficulty || undefined,
    };
    // Remove undefined keys
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
    return data;
  };

  const createAndStartSession = async () => {
    try {
      setIsSimStarting(true);
      setError(null);
      setSuccess(null);
      await setupSessionRecording();
      const initial = buildInitialSessionData();
      const session = await interviewAPI.createSession(Object.keys(initial).length ? initial : undefined);
      setActiveSession(session);
      const start = await interviewAPI.startSimulation(session.sessionId);
      const history = await interviewAPI.getConversation(session.sessionId);
      setConversation(history);
      await playTTSMixed(start.audioUrl);
      await startMicRecording();
      setSuccess('Interview session started');
    } catch (e: any) { setError(e.message || 'Failed to start simulation'); } finally { setIsSimStarting(false); }
  };

  const uploadBlobAsAudioFile = async (blob: Blob): Promise<string> => {
    const file = new File([blob], `answer-${Date.now()}.webm`, { type: 'audio/webm' });
    const resp = await interviewAPI.uploadAudio(file, 'interview-segment');
    if (!(resp as any).success || !(resp as any).fileUrl) throw new Error((resp as any).message || 'Audio upload failed');
    return (resp as any).fileUrl as string;
  };

  const pollForNextAIMessage = async (sessionId: string, afterIso?: string, timeoutMs = 90000, intervalMs = 2000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const history = await interviewAPI.getConversation(sessionId);
        const aiMessages = history.filter(h => h.speaker === 'ai');
        const latest = aiMessages[aiMessages.length - 1];
        if (latest) {
          if (!afterIso || new Date(latest.createdAt).getTime() > new Date(afterIso).getTime()) {
            setConversation(history);
            await playTTSMixed(latest.audioUrl || undefined);
            await startMicRecording();
            return true;
          }
        }
      } catch {}
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  };

  const submitCurrentAnswer = async () => {
    if (!activeSession) return;
    try {
      setIsAnswering(true);
      const blob = await stopMicRecordingAndGetBlob();
      if (!blob || blob.size === 0) throw new Error('No audio captured');
      const fileUrl = await uploadBlobAsAudioFile(blob);
      const lastAi = [...conversation].filter(c => c.speaker === 'ai').pop();
      const lastAiTime = lastAi?.createdAt;
      const res = await interviewAPI.processAnswer(activeSession.sessionId, fileUrl);
      if (res && res.status === 'PENDING') {
        const ok = await pollForNextAIMessage(activeSession.sessionId, lastAiTime);
        if (!ok) throw new Error('Processing timed out, please try again');
        return;
      }
      if (res && res.audioUrl) {
        const history = await interviewAPI.getConversation(activeSession.sessionId);
        setConversation(history);
        await playTTSMixed(res.audioUrl);
        await startMicRecording();
        return;
      }
      const ok = await pollForNextAIMessage(activeSession.sessionId, lastAiTime);
      if (!ok) throw new Error('Processing failed');
    } catch (e: any) { setError(e.message || 'Failed to process answer'); } finally { setIsAnswering(false); }
  };

  const stopAndUploadSessionRecording = async () => {
    try {
      if (!sessionRecorderRef.current) return;
      const resolved = await new Promise<Blob | null>((resolve) => {
        sessionRecorderRef.current!.onstop = () => {
          const type = sessionMimeRef.current || 'video/webm';
          const blob = new Blob(sessionChunksRef.current, { type });
          resolve(blob);
        };
        sessionRecorderRef.current!.stop();
      });
      if (!resolved) return;
      const fileName = `interactive-session-${Date.now()}.webm`;
      const file = new File([resolved], fileName, { type: 'video/webm' });
      setUploadProgress(1);
      const resp = await interviewAPI.uploadRecording({ file, fileType: 'video', sessionTitle: 'Interactive Interview Session', description: 'Combined video + audio (user + AI)' }, (p) => setUploadProgress(p));
      if ((resp as any).success) { setSuccess('Session recording saved'); await loadFileAnalysisData(); } else { setError((resp as any).message || 'Failed to save session recording'); }
    } catch (e: any) { setError(e.message || 'Failed to save session recording'); } finally {
      setUploadProgress(0);
      [micStreamRef.current, camStreamRef.current].forEach((s) => { if (s) s.getTracks().forEach(t => t.stop()); });
      micStreamRef.current = null; camStreamRef.current = null;
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
      sessionRecorderRef.current = null; sessionStreamRef.current = null; mixDestRef.current = null; micSourceRef.current = null; ttsSourceRef.current = null; ttsAudioElRef.current = null;
    }
  };

  const endCurrentSession = async () => {
    if (!activeSession) return;
    try {
      setIsEndingSession(true);
      const ended = await interviewAPI.endSession(activeSession.sessionId);
      setActiveSession(ended);
      setSuccess('Session ended');
      if (audioRecorderRef.current && isMicRecording) audioRecorderRef.current.stop();
      await stopAndUploadSessionRecording();
    } catch (e: any) { setError(e.message || 'Failed to end session'); } finally { setIsEndingSession(false); }
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-4 text-slate-900">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">Interview Simulator</div>
                    <div className="text-sm font-normal text-slate-500 mt-1">AI-Powered Practice Platform</div>
                  </div>
                </h1>
                <p className="mt-4 text-slate-600 text-lg leading-relaxed max-w-2xl">
                  Master your interview skills with AI-powered voice interactions, real-time feedback, and comprehensive performance analysis.
                </p>
              </div>

              {/* Session Status & Controls */}
              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      try { const result = await interviewAPI.checkInterviewHealth(); setResult({ message: 'Interview service health check', result }); }
                      catch (err: any) { setError(err.message || 'Health check failed'); }
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Service Status
                    </div>
                  </button>
                  {activeSession && activeSession.status === 'ACTIVE' && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                      <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                      <span className="text-sm font-semibold text-white">Live Interview Session</span>
                    </div>
                  )}
                </div>

                {/* Main Session Controls */}
                <div className="flex items-center gap-3">
                  {!activeSession || activeSession.status !== 'ACTIVE' ? (
                    <button
                      onClick={createAndStartSession}
                      disabled={isSimStarting}
                      className="px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 disabled:opacity-60 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center gap-3"
                    >
                      <Camera className="h-5 w-5" />
                      <span>{isSimStarting ? 'Initializing AI Interview...' : 'Begin Interview Session'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={endCurrentSession}
                      disabled={isEndingSession}
                      className="px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:opacity-60 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-3"
                    >
                      <Square className="h-5 w-5" />
                      <span>{isEndingSession ? 'Finalizing Session...' : 'Complete Interview'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Interview Preferences */}
            <div className="mb-8 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-slate-100">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Interview Preferences</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Role</label>
                  <input
                    value={prefRole}
                    onChange={(e)=>setPrefRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-slate-900 bg-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level</label>
                  <select
                    value={prefSeniority}
                    onChange={(e)=>setPrefSeniority(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-slate-900 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="">Choose level...</option>
                    <option>Intern</option>
                    <option>Junior (0-2 years)</option>
                    <option>Mid-Level (2-5 years)</option>
                    <option>Senior (5-8 years)</option>
                    <option>Staff (8+ years)</option>
                    <option>Principal/Lead</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Company</label>
                  <input
                    value={prefCompany}
                    onChange={(e)=>setPrefCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-slate-900 bg-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="e.g., Google, Startup, FinTech"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Technical Focus Areas</label>
                  <input
                    value={prefFocusAreas}
                    onChange={(e)=>setPrefFocusAreas(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-slate-900 bg-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="e.g., React, TypeScript, System Design, Algorithms"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Interview Language</label>
                  <input
                    value={prefLanguage}
                    onChange={(e)=>setPrefLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-slate-900 bg-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="e.g., English, Spanish"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty Level</label>
                  <select
                    value={prefDifficulty}
                    onChange={(e)=>setPrefDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-slate-900 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="">Select difficulty...</option>
                    <option>Easy - Basic concepts</option>
                    <option>Moderate - Standard questions</option>
                    <option>Hard - Advanced scenarios</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
                <p className="text-sm text-slate-600">💡 <strong>Pro tip:</strong> The more specific your preferences, the better the AI can tailor realistic interview scenarios to match your target role and experience level.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column - Video Recorder (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Recorder */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Recording Studio</h2>
                        <p className="text-sm text-slate-500">Capture your interview practice session</p>
                      </div>
                    </div>
                    {isMicRecording && (
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                        <div className="w-3 h-3 rounded-full animate-pulse bg-white"></div>
                        <span className="text-sm font-bold text-white">Recording Audio</span>
                      </div>
                    )}
                  </div>
                  <VideoRecorder onRecordingComplete={handleRecordingComplete} onReset={handleReset} />
                </div>
                {currentRecording && (
                  <div className="border-t border-slate-200/50 p-6 bg-gradient-to-r from-slate-50/80 to-slate-100/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <Save className="h-5 w-5 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Save Your Interview Recording</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Session Title *</label>
                        <input
                          type="text"
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                          placeholder="e.g., Senior Frontend Developer Practice Session"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Description (Optional)</label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                          placeholder="React interview with system design questions..."
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSaveRecording}
                      disabled={isLoading || !sessionTitle.trim()}
                      className="px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Saving Recording...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Interview Recording</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Live Chat (1/3 width) */}
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 sticky top-6">
                <div className="p-6 border-b border-slate-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Interview Conversation</h3>
                        <p className="text-sm text-slate-500">Real-time AI interview dialogue</p>
                      </div>
                    </div>
                    {activeSession && activeSession.status === 'ACTIVE' && (
                      <button
                        onClick={submitCurrentAnswer}
                        disabled={isAnswering}
                        className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
                      >
                        {isAnswering ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            <span>Processing Response...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" />
                            <span>Submit Answer</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {!activeSession ? (
                    <div className="text-center py-12">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 inline-block mb-4 shadow-lg">
                        <MessageCircle className="h-8 w-8 text-slate-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-700 mb-2">Ready for Interview</h4>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Start an interview session to begin your AI-powered practice conversation. Your dialogue will appear here in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                      {conversation.map((m, idx) => {
                        const isAI = m.speaker === 'ai';
                        return (
                          <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                            <div className="flex items-start gap-3 max-w-[85%]">
                              {isAI && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg flex-shrink-0">
                                  <Bot className="h-4 w-4" />
                                </div>
                              )}
                              <div className={`rounded-2xl p-4 shadow-lg ${isAI ? 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200' : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white'}`}>
                                <div className={`text-xs mb-2 font-medium ${isAI ? 'text-slate-500' : 'text-slate-300'}`}>
                                  {isAI ? 'AI Interviewer' : 'You'} • {new Date(m.createdAt).toLocaleTimeString()}
                                </div>
                                <div className="text-sm leading-relaxed">{m.message}</div>
                                {m.audioUrl && (
                                  <audio src={m.audioUrl} controls className="mt-3 w-full rounded-lg" style={{ maxWidth: '200px', height: '35px' }} />
                                )}
                              </div>
                              {!isAI && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg flex-shrink-0">
                                  <User className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {activeSession.status === 'ACTIVE' && (
                        <div className="text-center py-4">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${isAnswering ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                            {isAnswering ? (
                              <>
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                Processing your response...
                              </>
                            ) : (
                              <>
                                <Mic className="h-3 w-3" />
                                Speak your answer, then click "Submit Answer"
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Files List - Full Width Below */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50">
            <div className="p-6 border-b border-slate-200/50">
              <button
                onClick={() => setIsFilesCollapsed(!isFilesCollapsed)}
                className="w-full flex items-center justify-between text-left hover:bg-slate-50/50 rounded-xl p-2 -m-2 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Interview Recordings</h3>
                    <p className="text-sm text-slate-500">{fileAnalysisData.length} recorded sessions with AI analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">
                    {isFilesCollapsed ? 'Show' : 'Hide'}
                  </span>
                  {isFilesCollapsed ? (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </button>
            </div>

            {!isFilesCollapsed && (
              <div className="p-6">
                {fileAnalysisData.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 inline-block mb-4 shadow-lg">
                      <Video className="h-8 w-8 text-slate-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">No Recordings Yet</h4>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Start practicing interviews to build your recording library. Each session will be saved here with detailed AI analysis.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fileAnalysisData.map((file) => (
                      <div key={file.fileId} className="border border-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200">
                        {/* File Item Header */}
                        <button
                          onClick={() => toggleFileExpanded(file.fileId)}
                          className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Video className="h-5 w-5 text-slate-600" />
                              <span className="text-sm font-medium text-slate-900">
                                {file.originalFileName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {file.analysisStatus === 'COMPLETED' && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span className="text-xs">Ready</span>
                                  </div>
                                )}
                                {file.analysisStatus === 'PENDING' && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-xs">Processing</span>
                                  </div>
                                )}
                                {file.analysisStatus === 'FAILED' && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700">
                                    <XCircle className="h-3 w-3" />
                                    <span className="text-xs">Failed</span>
                                  </div>
                                )}
                                {file.analysisStatus === 'NO_ANALYSIS' && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-200 text-slate-600">
                                    <AlertCircle className="h-3 w-3" />
                                    <span className="text-xs">No Analysis</span>
                                  </div>
                                )}
                              </div>
                              {expandedFileId === file.fileId ? (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 text-left">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </div>
                        </button>

                        {/* Expanded File Content */}
                        {expandedFileId === file.fileId && (
                          <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Media Player */}
                              <div>
                                {isLikelyVideo(file.fileUrl, file.category) ? (
                                  <video
                                    src={file.fileUrl}
                                    controls
                                    playsInline
                                    crossOrigin="anonymous"
                                    controlsList="nodownload"
                                    preload="metadata"
                                    className="w-full rounded-lg aspect-video bg-slate-900"
                                  />
                                ) : (
                                  <audio src={file.fileUrl} controls className="w-full" />
                                )}
                              </div>

                              {/* Analysis */}
                              <div>
                                {file.analysisStatus === 'COMPLETED' && file.detailedAnalysis ? (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-900">Analysis</h4>
                                    <div className="prose prose-slate prose-sm max-w-none text-xs max-h-64 overflow-auto">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {file.detailedAnalysis}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">No analysis available</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                              {file.analysisStatus === 'NO_ANALYSIS' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAnalyzeRecording(file); }}
                                  disabled={isAnalyzing}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                >
                                  {isAnalyzing ? (
                                    <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                                  ) : (
                                    <Play className="h-3 w-3" />
                                  )}
                                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                </button>
                              )}
                              
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-600 text-white hover:bg-slate-700 transition-colors"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </a>
                              
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteRecording(file.fileId); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {(uploadProgress > 0) && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl">
              <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4">
                <div className="text-sm font-medium text-slate-800 mb-2">Uploading session recording... {uploadProgress}%</div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {(error || success) && (
            <div className="fixed bottom-6 right-6 z-40 space-y-3">
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 shadow-lg max-w-md">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span className="font-medium text-red-800">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="p-1 rounded text-red-400 hover:text-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 shadow-lg max-w-md">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium text-green-800">{success}</span>
                  <button
                    onClick={() => setSuccess(null)}
                    className="p-1 rounded text-green-400 hover:text-green-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default InterviewSimulatorPage; 