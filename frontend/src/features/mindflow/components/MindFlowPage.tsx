import React, { useState, useEffect, useRef } from 'react';
import { Video, Save, Play, Download, Trash2, AlertCircle, CheckCircle, Clock, CheckCircle2, XCircle, MessageCircle, Mic, Square, ChevronDown, ChevronRight, Eye, FileText, Calendar, User, Bot, Camera, CameraOff, Brain, Users } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';
import VideoRecorder from '../../interview/components/VideoRecorder';
import { mindflowAPI } from '../services/mindflowAPI';
import { MindFlowRecording, MindFlowRecordingRequest, MindFlowFileAnalysisResponse, MindFlowConversationMessage, MindFlowSessionDTO, ScenarioType, SCENARIO_OPTIONS } from '../types';
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

const MindFlowPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentRecording, setCurrentRecording] = useState<Blob | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileAnalysisData, setFileAnalysisData] = useState<MindFlowFileAnalysisResponse[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // File list state
  const [isFilesCollapsed, setIsFilesCollapsed] = useState(false);
  const [expandedFileId, setExpandedFileId] = useState<number | null>(null);

  // Interactive simulation state
  const [activeSession, setActiveSession] = useState<MindFlowSessionDTO | null>(null);
  const [conversation, setConversation] = useState<MindFlowConversationMessage[]>([]);
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

  // Scenario preferences
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('GENERAL_COMMUNICATION');
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [focusAreas, setFocusAreas] = useState(''); // comma-separated

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
      const fileData = await mindflowAPI.getFileAnalysisData();
      setFileAnalysisData(fileData);
    } catch (err: unknown) {
      console.error('Failed to load MindFlow file analysis data:', err);
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
      const fileName = `mindflow-recording-${Date.now()}.webm`;
      const file = new File([currentRecording], fileName, { type: 'video/webm' });
      const request: MindFlowRecordingRequest = { 
        file, 
        description: description.trim() || undefined, 
        sessionTitle: sessionTitle.trim(), 
        fileType: 'video',
        scenarioType: selectedScenario
      };
      const response = await mindflowAPI.uploadRecording(request);
      if ((response as any).success) {
        setSuccess('MindFlow recording saved successfully!');
        setCurrentRecording(null);
        setSessionTitle('');
        setDescription('');
        await loadFileAnalysisData();
      } else {
        setError((response as any).message || 'Failed to save MindFlow recording');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save MindFlow recording';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecording = async (recordingId: number) => {
    if (!confirm('Delete this MindFlow recording?')) return;
    try {
      await mindflowAPI.deleteRecording(recordingId);
      await loadFileAnalysisData();
      setSuccess('MindFlow recording deleted successfully!');
      if (expandedFileId === recordingId) {
        setExpandedFileId(null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete MindFlow recording';
      setError(errorMessage);
    }
  };

  const handleAnalyzeRecording = async (fileAnalysis: MindFlowFileAnalysisResponse) => {
    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);
    setAnalysisResult(null);
    try {
      const result = await mindflowAPI.analyzeMindFlow(
        fileAnalysis.fileUrl, 
        'comprehensive', 
        fileAnalysis.fileId, 
        user?.id!, 
        fileAnalysis.scenarioType || selectedScenario
      );
      setAnalysisResult(result);
      setSuccess('MindFlow soft skills analysis completed successfully!');
      await loadFileAnalysisData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze MindFlow recording';
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
      console.error('Error setting up MindFlow session recording:', e);
      if (e.name === 'NotReadableError') {
        setError('Camera/microphone is currently in use by another application. Please close other applications and try again.');
      } else if (e.name === 'NotAllowedError') {
        setError('Camera/microphone access denied. Please allow permissions and refresh the page.');
      } else if (e.name === 'NotFoundError') {
        setError('No camera or microphone found. Please connect these devices and try again.');
      } else {
        setError('Failed to start MindFlow session recorder. Please check your camera and microphone.');
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
      console.error('Error starting MindFlow microphone recording:', e);
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
    const focusList = focusAreas
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const data: Record<string, any> = {
      scenarioType: selectedScenario,
      communicationStyle: communicationStyle || undefined,
      difficultyLevel: difficultyLevel || undefined,
      focusAreas: focusList.length ? focusList : undefined,
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
      const session = await mindflowAPI.createSession(Object.keys(initial).length ? initial : undefined);
      setActiveSession(session);
      const start = await mindflowAPI.startSimulation(session.sessionId);
      const history = await mindflowAPI.getConversation(session.sessionId);
      setConversation(history);
      await playTTSMixed(start.audioUrl);
      await startMicRecording();
      setSuccess('MindFlow soft skills training started');
    } catch (e: any) { setError(e.message || 'Failed to start MindFlow simulation'); } finally { setIsSimStarting(false); }
  };

  const uploadBlobAsAudioFile = async (blob: Blob): Promise<string> => {
    const file = new File([blob], `mindflow-answer-${Date.now()}.webm`, { type: 'audio/webm' });
    const resp = await mindflowAPI.uploadAudio(file, 'mindflow-segment', selectedScenario);
    if (!(resp as any).success || !(resp as any).fileUrl) throw new Error((resp as any).message || 'MindFlow audio upload failed');
    return (resp as any).fileUrl as string;
  };

  const pollForNextAIMessage = async (sessionId: string, afterIso?: string, timeoutMs = 90000, intervalMs = 2000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const history = await mindflowAPI.getConversation(sessionId);
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
      const res = await mindflowAPI.processAnswer(activeSession.sessionId, fileUrl);
      if (res && (res as any).status === 'PENDING') {
        const ok = await pollForNextAIMessage(activeSession.sessionId, lastAiTime);
        if (!ok) throw new Error('Processing timed out, please try again');
        return;
      }
      if (res && res.audioUrl) {
        const history = await mindflowAPI.getConversation(activeSession.sessionId);
        setConversation(history);
        await playTTSMixed(res.audioUrl);
        await startMicRecording();
        return;
      }
      const ok = await pollForNextAIMessage(activeSession.sessionId, lastAiTime);
      if (!ok) throw new Error('Processing failed');
    } catch (e: any) { setError(e.message || 'Failed to process MindFlow answer'); } finally { setIsAnswering(false); }
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
      const fileName = `mindflow-session-${Date.now()}.webm`;
      const file = new File([resolved], fileName, { type: 'video/webm' });
      setUploadProgress(1);
      const resp = await mindflowAPI.uploadRecording({ 
        file, 
        fileType: 'video', 
        sessionTitle: 'MindFlow Soft Skills Session', 
        description: 'Combined video + audio (user + AI roleplay)',
        scenarioType: selectedScenario
      }, (p) => setUploadProgress(p));
      if ((resp as any).success) { setSuccess('MindFlow session recording saved'); await loadFileAnalysisData(); } else { setError((resp as any).message || 'Failed to save MindFlow session recording'); }
    } catch (e: any) { setError(e.message || 'Failed to save MindFlow session recording'); } finally {
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
      const ended = await mindflowAPI.endSession(activeSession.sessionId);
      setActiveSession(ended);
      setSuccess('MindFlow session ended');
      if (audioRecorderRef.current && isMicRecording) audioRecorderRef.current.stop();
      await stopAndUploadSessionRecording();
    } catch (e: any) { setError(e.message || 'Failed to end MindFlow session'); } finally { setIsEndingSession(false); }
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-4 text-slate-900">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">MindFlow</div>
                    <div className="text-sm font-normal text-purple-600 mt-1">Soft Skills Development Platform</div>
                  </div>
                </h1>
                <p className="mt-4 text-slate-600 text-lg leading-relaxed max-w-2xl">
                  Develop critical soft skills through immersive AI-powered roleplay scenarios. Master communication, negotiation, leadership, and interpersonal dynamics.
                </p>
              </div>

              {/* Session Status & Controls */}
              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      try { const result = await mindflowAPI.checkMindFlowHealth(); setResult({ message: 'MindFlow service health check', result }); }
                      catch (err: any) { setError(err.message || 'MindFlow health check failed'); }
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      MindFlow Status
                    </div>
                  </button>
                  {activeSession && activeSession.status === 'ACTIVE' && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg">
                      <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                      <span className="text-sm font-semibold text-white">Live Soft Skills Session</span>
                    </div>
                  )}
                </div>

                {/* Main Session Controls */}
                <div className="flex items-center gap-3">
                  {!activeSession || activeSession.status !== 'ACTIVE' ? (
                    <button
                      onClick={createAndStartSession}
                      disabled={isSimStarting}
                      className="px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center gap-3"
                    >
                      <Users className="h-5 w-5" />
                      <span>{isSimStarting ? 'Initializing MindFlow Session...' : 'Begin Soft Skills Training'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={endCurrentSession}
                      disabled={isEndingSession}
                      className="px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:opacity-60 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-3"
                    >
                      <Square className="h-5 w-5" />
                      <span>{isEndingSession ? 'Finalizing Session...' : 'Complete Training'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scenario Preferences */}
            <div className="mb-8 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Scenario Preferences</h2>
              </div>
              
              {/* Scenario Type Selection */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-4">Choose Your Training Scenario</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SCENARIO_OPTIONS.map((scenario) => (
                    <button
                      key={scenario.value}
                      onClick={() => setSelectedScenario(scenario.value)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg ${
                        selectedScenario === scenario.value
                          ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg'
                          : 'border-slate-200 bg-white/70 backdrop-blur-sm hover:border-purple-200 hover:bg-purple-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl ${
                          selectedScenario === scenario.value
                            ? 'bg-purple-100'
                            : 'bg-slate-100'
                        }`}>
                          <span className="text-xl">{scenario.icon}</span>
                        </div>
                        <span className="font-bold text-slate-900">{scenario.label}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{scenario.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Communication Style</label>
                  <select
                    value={communicationStyle}
                    onChange={(e)=>setCommunicationStyle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-slate-900 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="">Choose style...</option>
                    <option>Direct & Clear</option>
                    <option>Diplomatic & Tactful</option>
                    <option>Collaborative & Inclusive</option>
                    <option>Assertive & Confident</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty Level</label>
                  <select
                    value={difficultyLevel}
                    onChange={(e)=>setDifficultyLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-slate-900 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="">Select challenge level...</option>
                    <option>Beginner - Basic interactions</option>
                    <option>Intermediate - Real scenarios</option>
                    <option>Advanced - Complex situations</option>
                    <option>Expert - High-stakes roleplay</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Focus Skills</label>
                  <input
                    value={focusAreas}
                    onChange={(e)=>setFocusAreas(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-slate-900 bg-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="e.g., Empathy, Persuasion, Leadership"
                  />
                </div>
              </div>
              <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-200/50">
                <p className="text-sm text-slate-600">🎯 <strong>Training Focus:</strong> These preferences help our AI create immersive roleplay scenarios specifically designed to develop your chosen soft skills in realistic workplace situations.</p>
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
                      <div className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">MindFlow Studio</h2>
                        <p className="text-sm text-slate-500">Record your soft skills practice</p>
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
                      <h3 className="text-xl font-bold text-slate-900">Save Your MindFlow Recording</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Session Title *</label>
                        <input
                          type="text"
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                          placeholder="e.g., Leadership Communication Practice"
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
                          placeholder="Conflict resolution with team member scenario..."
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
                          <span>Saving MindFlow Session...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Soft Skills Recording</span>
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
                      <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">MindFlow Roleplay</h3>
                        <p className="text-sm text-slate-500">AI-powered soft skills training</p>
                      </div>
                    </div>
                    {activeSession && activeSession.status === 'ACTIVE' && (
                      <button
                        onClick={submitCurrentAnswer}
                        disabled={isAnswering}
                        className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
                      >
                        {isAnswering ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            <span>Processing Response...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" />
                            <span>Submit Response</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {!activeSession ? (
                    <div className="text-center py-12">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-200 inline-block mb-4 shadow-lg">
                        <Users className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-700 mb-2">Ready for Soft Skills Training</h4>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Begin a MindFlow session to practice workplace scenarios with AI-powered roleplay. Develop leadership, communication, and interpersonal skills.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
                      {conversation.map((m, idx) => {
                        const isAI = m.speaker === 'ai';
                        return (
                          <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                            <div className="flex items-start gap-3 max-w-[85%]">
                              {isAI && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-lg flex-shrink-0">
                                  <Bot className="h-4 w-4" />
                                </div>
                              )}
                              <div className={`rounded-2xl p-4 shadow-lg ${isAI ? 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200' : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white'}`}>
                                <div className={`text-xs mb-2 font-medium ${isAI ? 'text-slate-600' : 'text-slate-200'}`}>
                                  {isAI ? 'AI Roleplay Partner' : 'You'} • {new Date(m.createdAt).toLocaleTimeString()}
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
                                Analyzing your soft skills response...
                              </>
                            ) : (
                              <>
                                <Mic className="h-3 w-3" />
                                Share your response, then click "Submit Response"
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
                className="w-full flex items-center justify-between text-left hover:bg-purple-50/50 rounded-xl p-2 -m-2 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">MindFlow Training Library</h3>
                    <p className="text-sm text-slate-500">{fileAnalysisData.length} soft skills training sessions with AI analysis</p>
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
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-200 inline-block mb-4 shadow-lg">
                      <Video className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">No Training Sessions Yet</h4>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Start practicing soft skills scenarios to build your training library. Each session will be saved here with detailed AI analysis.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fileAnalysisData.map((file) => (
                      <div key={file.fileId} className="border border-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200">
                        {/* File Item Header */}
                        <button
                          onClick={() => toggleFileExpanded(file.fileId)}
                          className="w-full p-6 text-left hover:bg-white/80 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                                <Video className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-base font-semibold text-slate-900">
                                    {file.originalFileName}
                                  </span>
                                  {file.scenarioType && (
                                    <span className="text-xs px-3 py-1 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 text-purple-700 font-medium">
                                      {SCENARIO_OPTIONS.find(s => s.value === file.scenarioType)?.label || file.scenarioType}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-slate-500">
                                  {new Date(file.uploadedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {file.analysisStatus === 'COMPLETED' && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-700">Analysis Complete</span>
                                  </div>
                                )}
                                {file.analysisStatus === 'PENDING' && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200">
                                    <Clock className="h-4 w-4 text-amber-600 animate-spin" />
                                    <span className="text-sm font-medium text-amber-700">Processing</span>
                                  </div>
                                )}
                                {file.analysisStatus === 'FAILED' && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-100 to-rose-100 border border-red-200">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-700">Analysis Failed</span>
                                  </div>
                                )}
                                {file.analysisStatus === 'NO_ANALYSIS' && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-200">
                                    <AlertCircle className="h-4 w-4 text-slate-600" />
                                    <span className="text-sm font-medium text-slate-700">Ready to Analyze</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-slate-500">
                                  {expandedFileId === file.fileId ? 'Collapse' : 'Expand'}
                                </span>
                                {expandedFileId === file.fileId ? (
                                  <ChevronDown className="h-5 w-5 text-slate-400" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Expanded File Content */}
                        {expandedFileId === file.fileId && (
                          <div className="border-t border-slate-200/50 p-6 bg-gradient-to-r from-purple-50/80 to-indigo-50/30 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Media Player */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                  <Play className="h-4 w-4" />
                                  Training Session Playback
                                </h4>
                                {isLikelyVideo(file.fileUrl, file.category) ? (
                                  <video
                                    src={file.fileUrl}
                                    controls
                                    playsInline
                                    crossOrigin="anonymous"
                                    controlsList="nodownload"
                                    preload="metadata"
                                    className="w-full rounded-xl aspect-video bg-slate-900 shadow-lg border border-slate-200"
                                  />
                                ) : (
                                  <audio src={file.fileUrl} controls className="w-full rounded-xl shadow-lg" />
                                )}
                              </div>

                              {/* Analysis */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                  <Brain className="h-4 w-4" />
                                  AI Soft Skills Analysis
                                </h4>
                                {file.analysisStatus === 'COMPLETED' && file.detailedAnalysis ? (
                                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200 shadow-sm">
                                    <div className="prose prose-slate prose-sm max-w-none text-sm max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {file.detailedAnalysis}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 bg-white/50 rounded-xl border border-purple-200">
                                    <div className="p-3 rounded-lg bg-purple-100 inline-block mb-3">
                                      <Brain className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">No soft skills analysis available yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Click "Analyze" to get AI feedback on your communication skills</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                              <div className="flex items-center gap-3">
                                {file.analysisStatus === 'NO_ANALYSIS' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleAnalyzeRecording(file); }}
                                    disabled={isAnalyzing}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                  >
                                    {isAnalyzing ? (
                                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                    <span>{isAnalyzing ? 'Analyzing Soft Skills...' : 'Generate Skills Analysis'}</span>
                                  </button>
                                )}

                                <a
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Download</span>
                                </a>
                              </div>

                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteRecording(file.fileId); }}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-200"
                                title="Delete recording"
                              >
                                <Trash2 className="h-4 w-4" />
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
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Uploading MindFlow Session</div>
                    <div className="text-xs text-slate-500">{uploadProgress}% complete</div>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {(error || success) && (
            <div className="fixed bottom-6 right-6 z-40 space-y-3">
              {error && (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-red-50/95 backdrop-blur-sm border border-red-200/50 shadow-2xl max-w-md">
                  <div className="p-1 rounded-lg bg-red-100">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-red-900">MindFlow Error</div>
                    <div className="text-sm text-red-800">{error}</div>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50/95 backdrop-blur-sm border border-emerald-200/50 shadow-2xl max-w-md">
                  <div className="p-1 rounded-lg bg-emerald-100">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-emerald-900">MindFlow Success</div>
                    <div className="text-sm text-emerald-800">{success}</div>
                  </div>
                  <button
                    onClick={() => setSuccess(null)}
                    className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100 transition-colors"
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

export default MindFlowPage;