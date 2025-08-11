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
    } catch (e) { setError('Failed to start session recorder.'); }
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
    } catch { setError('Microphone unavailable. Please allow mic access.'); }
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3 text-slate-900">
                  <div className="p-2 rounded-xl bg-slate-600">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                  Interview Simulator
                </h1>
                <p className="mt-3 text-slate-600 text-lg">
                  Practice realistic interviews with AI-powered voice interactions and instant feedback analysis.
                </p>
              </div>

              {/* Session Status & Controls */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      try { const result = await interviewAPI.checkInterviewHealth(); setResult({ message: 'Interview service health check', result }); }
                      catch (err: any) { setError(err.message || 'Health check failed'); }
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                  >
                    Check Service
                  </button>
                  {activeSession && activeSession.status === 'ACTIVE' && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-sm font-medium text-white">Live Session</span>
                    </div>
                  )}
                </div>

                {/* Main Session Controls */}
                <div className="flex items-center gap-3">
                  {!activeSession || activeSession.status !== 'ACTIVE' ? (
                    <button
                      onClick={createAndStartSession}
                      disabled={isSimStarting}
                      className="px-6 py-3 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      {isSimStarting ? 'Starting Session...' : 'Start Interview'}
                    </button>
                  ) : (
                    <button
                      onClick={endCurrentSession}
                      disabled={isEndingSession}
                      className="px-6 py-3 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-all duration-200 flex items-center gap-2"
                    >
                      <Square className="h-4 w-4" />
                      {isEndingSession ? 'Ending...' : 'End Session'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Interview Preferences */}
            <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Interview preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target role</label>
                  <input value={prefRole} onChange={(e)=>setPrefRole(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900" placeholder="e.g., Frontend Developer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seniority</label>
                  <select value={prefSeniority} onChange={(e)=>setPrefSeniority(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900 bg-white">
                    <option value="">Select...</option>
                    <option>Intern</option>
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Staff</option>
                    <option>Principal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company / Industry</label>
                  <input value={prefCompany} onChange={(e)=>setPrefCompany(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900" placeholder="e.g., Fintech, Shopify" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Focus areas (comma separated)</label>
                  <input value={prefFocusAreas} onChange={(e)=>setPrefFocusAreas(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900" placeholder="e.g., React, System Design, Data Structures" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                  <input value={prefLanguage} onChange={(e)=>setPrefLanguage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900" placeholder="e.g., English" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                  <select value={prefDifficulty} onChange={(e)=>setPrefDifficulty(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900 bg-white">
                    <option value="">Select...</option>
                    <option>Easy</option>
                    <option>Moderate</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">These preferences are sent as initial context so the AI tailors questions for you.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Video Recorder */}
            <div className="space-y-6">
              {/* Video Recorder */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <Video className="h-5 w-5 text-slate-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900">Recording Studio</h2>
                    </div>
                    {isMicRecording && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100">
                        <div className="w-2 h-2 rounded-full animate-pulse bg-red-500"></div>
                        <span className="text-xs font-medium text-red-700">Recording Audio</span>
                      </div>
                    )}
                  </div>
                  <VideoRecorder onRecordingComplete={handleRecordingComplete} onReset={handleReset} />
                </div>
                {currentRecording && (
                  <div className="border-t border-slate-200 p-6 bg-slate-50">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Save Your Recording</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">Session Title *</label>
                        <input
                          type="text"
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                          placeholder="e.g., Frontend Developer Interview Practice"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">Description (Optional)</label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                          placeholder="Brief description of what you practiced..."
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSaveRecording}
                      disabled={isLoading || !sessionTitle.trim()}
                      className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving Recording...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Recording
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Live Chat */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 sticky top-6">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <MessageCircle className="h-4 w-4 text-slate-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Interview Conversation</h3>
                    </div>
                    {activeSession && activeSession.status === 'ACTIVE' && (
                      <button
                        onClick={submitCurrentAnswer}
                        disabled={isAnswering}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {isAnswering ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" />
                            Done Speaking
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {!activeSession ? (
                    <div className="text-center py-8">
                      <div className="p-3 rounded-lg bg-slate-100 inline-block mb-3">
                        <MessageCircle className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">Start an interview session to see the conversation here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-auto">
                      {conversation.map((m, idx) => {
                        const isAI = m.speaker === 'ai';
                        return (
                          <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                            <div className="flex items-start gap-2 max-w-[85%]">
                              {isAI && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-white">
                                  <Bot className="h-3 w-3" />
                                </div>
                              )}
                              <div className={`rounded-lg p-3 ${isAI ? 'bg-slate-100' : 'bg-slate-900 text-white'}`}>
                                <div className="text-xs mb-1 opacity-70">
                                  {new Date(m.createdAt).toLocaleTimeString()}
                                </div>
                                <div className="text-sm">{m.message}</div>
                                {m.audioUrl && (
                                  <audio src={m.audioUrl} controls className="mt-2 w-full" style={{ maxWidth: '200px', height: '30px' }} />
                                )}
                              </div>
                              {!isAI && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-white">
                                  <User className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {activeSession.status === 'ACTIVE' && (
                        <div className="text-xs text-slate-500 text-center py-2">
                          {isAnswering ? 'Processing your response...' : 'Speak your answer, then click "Done Speaking"'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Files List - Full Width Below */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <button
                onClick={() => setIsFilesCollapsed(!isFilesCollapsed)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <FileText className="h-4 w-4 text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Interview Files</h3>
                  <span className="text-xs text-slate-500">({fileAnalysisData.length})</span>
                </div>
                {isFilesCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>

            {!isFilesCollapsed && (
              <div className="p-4">
                {fileAnalysisData.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <div className="p-3 rounded-lg bg-slate-100 inline-block mb-3">
                      <Video className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500">No recordings yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fileAnalysisData.map((file) => (
                      <div key={file.fileId} className="border border-slate-200 rounded-lg overflow-hidden">
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