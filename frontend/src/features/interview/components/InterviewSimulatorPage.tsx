import React, { useState, useEffect, useRef } from 'react';
import { Video, Save, Play, Download, Trash2, AlertCircle, CheckCircle, Clock, CheckCircle2, XCircle, MessageCircle, Mic, Square } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';
import VideoRecorder from './VideoRecorder';
import { interviewAPI } from '../services/interviewAPI';
import { InterviewRecording, InterviewRecordingRequest, FileAnalysisResponse, ConversationMessage, InterviewSessionDTO } from '../types';

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

  // New: interactive simulation state
  const [activeSession, setActiveSession] = useState<InterviewSessionDTO | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isSimStarting, setIsSimStarting] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  // New: mic recording for interactive answers
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isMicRecording, setIsMicRecording] = useState(false);

  useEffect(() => {
    loadFileAnalysisData();
    return () => {
      // cleanup audio stream on unmount
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
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
      // Convert Blob to File
      const fileName = `interview-recording-${Date.now()}.webm`;
      const file = new File([currentRecording], fileName, { type: 'video/webm' });

      const request: InterviewRecordingRequest = {
        file,
        description: description.trim() || undefined,
        sessionTitle: sessionTitle.trim(),
        fileType: 'video',
      };

      const response = await interviewAPI.uploadRecording(request);
      
      if (response.success) {
        setSuccess('Recording saved successfully!');
        setCurrentRecording(null);
        setSessionTitle('');
        setDescription('');
        
        // Refresh the file analysis data
        await loadFileAnalysisData();
      } else {
        setError(response.message || 'Failed to save recording');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save recording';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecording = async (recordingId: number) => {
    if (!confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      await interviewAPI.deleteRecording(recordingId);
      await loadFileAnalysisData();
      setSuccess('Recording deleted successfully!');
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
      console.log('🔍 Starting interview analysis for file:', fileAnalysis.fileUrl);
      console.log('🔑 Current token:', localStorage.getItem('token'));
      
      const result = await interviewAPI.analyzeInterview(fileAnalysis.fileUrl, 'comprehensive', fileAnalysis.fileId, user?.id!);
      setAnalysisResult(result);
      setSuccess('Interview analysis completed successfully!');
      
      // Refresh the file analysis data to show updated status
      await loadFileAnalysisData();
    } catch (err: unknown) {
      console.error('❌ Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze recording';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ===== New: Interactive simulation helpers =====
  const startMicRecording = async () => {
    try {
      // request mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const mime = 'audio/webm;codecs=opus';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      audioRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start();
      setIsMicRecording(true);
    } catch (e) {
      console.error('Mic permission/recording failed', e);
      setError('Microphone unavailable. Please allow mic access.');
    }
  };

  const stopMicRecordingAndGetBlob = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = audioRecorderRef.current;
      if (!recorder) return resolve(null);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // cleanup stream
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }
        audioRecorderRef.current = null;
        setIsMicRecording(false);
        resolve(blob);
      };
      recorder.stop();
    });
  };

  const createAndStartSession = async () => {
    try {
      setIsSimStarting(true);
      setError(null);
      setSuccess(null);
      // example initial data, can be driven from UI later
      const session = await interviewAPI.createSession({ role: 'Frontend Developer', seniority: 'Mid' });
      setActiveSession(session);
      const start = await interviewAPI.startSimulation(session.sessionId);
      // fetch history to include the stored AI question
      const history = await interviewAPI.getConversation(session.sessionId);
      setConversation(history);
      // Optionally autoplay TTS using returned audioUrl
      if (start.audioUrl) {
        const audio = new Audio(start.audioUrl);
        audio.play().catch(() => {});
      }
      // Auto-start mic recording for user's answer
      await startMicRecording();
      setSuccess('Interview session started');
    } catch (e: any) {
      setError(e.message || 'Failed to start simulation');
    } finally {
      setIsSimStarting(false);
    }
  };

  const uploadBlobAsAudioFile = async (blob: Blob): Promise<string> => {
    const file = new File([blob], `answer-${Date.now()}.webm`, { type: 'audio/webm' });
    const resp = await interviewAPI.uploadAudio(file, 'interview-segment');
    if (!resp.success || !resp.fileUrl) throw new Error(resp.message || 'Audio upload failed');
    return resp.fileUrl;
  };

  const submitCurrentAnswer = async () => {
    if (!activeSession) return;
    try {
      setIsAnswering(true);
      // stop recording and gather blob
      const blob = await stopMicRecordingAndGetBlob();
      if (!blob || blob.size === 0) {
        throw new Error('No audio captured');
      }
      const fileUrl = await uploadBlobAsAudioFile(blob);
      const res = await interviewAPI.processAnswer(activeSession.sessionId, fileUrl);
      // Refresh history
      const history = await interviewAPI.getConversation(activeSession.sessionId);
      setConversation(history);
      // Play next question audio and auto-start recording again
      if (res.audioUrl) {
        const audio = new Audio(res.audioUrl);
        audio.play().catch(() => {});
      }
      await startMicRecording();
    } catch (e: any) {
      setError(e.message || 'Failed to process answer');
    } finally {
      setIsAnswering(false);
    }
  };

  const endCurrentSession = async () => {
    if (!activeSession) return;
    try {
      setIsEndingSession(true);
      const ended = await interviewAPI.endSession(activeSession.sessionId);
      setActiveSession(ended);
      setSuccess('Session ended');
      // stop mic if recording
      if (audioRecorderRef.current && isMicRecording) {
        audioRecorderRef.current.stop();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
        audioStreamRef.current = null;
      }
      setIsMicRecording(false);
    } catch (e: any) {
      setError(e.message || 'Failed to end session');
    } finally {
      setIsEndingSession(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#384959' }}>
              <Video className="h-8 w-8" style={{ color: '#88BDF2' }} />
              Interview Simulator
            </h1>
            <p className="mt-2" style={{ color: '#6A89A7' }}>
              Record your video interview practice sessions and save them for later review
            </p>
            <div className="mt-4 space-x-4">
              <button
                onClick={async () => {
                  try {
                    const result = await interviewAPI.checkInterviewHealth();
                    console.log('🏥 Interview service health:', result);
                    setResult({
                      message: 'Interview service health check',
                      result
                    });
                  } catch (err: any) {
                    setError(err.message || 'Health check failed');
                  }
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: '#88BDF2' }}
              >
                Test Interview Service
              </button>

              {/* New: Start interactive session */}
              <button
                onClick={createAndStartSession}
                disabled={isSimStarting}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#6A89A7' }}
              >
                {isSimStarting ? 'Starting...' : 'Start Interactive Simulation'}
              </button>

              {activeSession && activeSession.status === 'ACTIVE' && (
                <button
                  onClick={endCurrentSession}
                  disabled={isEndingSession}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#384959' }}
                >
                  {isEndingSession ? 'Ending...' : 'End Session'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recording Section */}
            <div>
              <VideoRecorder 
                onRecordingComplete={handleRecordingComplete}
                onReset={handleReset}
              />

              {/* Save Recording Form */}
              {currentRecording && (
                <div className="mt-6 bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#384959' }}>
                    Save Recording
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                        Session Title *
                      </label>
                      <input
                        type="text"
                        value={sessionTitle}
                        onChange={(e) => setSessionTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        placeholder="e.g., Frontend Developer Interview Practice"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                        Description (Optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        rows={3}
                        placeholder="Describe what you practiced in this session..."
                      />
                    </div>

                    <button
                      onClick={handleSaveRecording}
                      disabled={isLoading || !sessionTitle.trim()}
                      className="w-full px-4 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white transition-colors"
                      style={{ backgroundColor: '#88BDF2' }}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Recording
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Files & Interactive Conversation */}
            <div>
              {/* Conversation UI */}
              <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#384959' }}>
                  <MessageCircle className="h-5 w-5" /> Conversation
                </h3>
                {!activeSession ? (
                  <p className="text-sm" style={{ color: '#6A89A7' }}>Start an interactive simulation to see conversation here.</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-auto pr-2">
                    {conversation.map((m, idx) => (
                      <div key={idx} className={`p-3 rounded-md ${m.speaker === 'ai' ? 'bg-gray-50' : 'bg-blue-50'}`}>
                        <div className="text-xs mb-1" style={{ color: '#6A89A7' }}>{m.speaker.toUpperCase()} · {new Date(m.createdAt).toLocaleTimeString()}</div>
                        <div className="text-sm" style={{ color: '#384959' }}>{m.message}</div>
                        {m.audioUrl && (
                          <audio src={m.audioUrl} controls className="mt-2 w-full" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {activeSession && activeSession.status === 'ACTIVE' && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={submitCurrentAnswer}
                      disabled={isAnswering}
                      className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: '#88BDF2' }}
                    >
                      {isAnswering ? (
                        <>
                          <Square className="h-4 w-4" /> Processing...
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" /> Done
                        </>
                      )}
                    </button>
                    {isMicRecording && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-red-700">Recording...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recordings List */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#384959' }}>
                  Your Files & Analysis Status
                </h3>
                
                {fileAnalysisData.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="mx-auto h-12 w-12 mb-4" style={{ color: '#6A89A7' }} />
                    <p style={{ color: '#6A89A7' }}>
                      No files yet. Start your first video interview practice session!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fileAnalysisData.map((fileAnalysis) => (
                      <div
                        key={fileAnalysis.fileId}
                        className="border rounded-lg p-4"
                        style={{ borderColor: '#6A89A7' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium" style={{ color: '#384959' }}>
                            {fileAnalysis.originalFileName}
                          </h4>
                          <div className="flex items-center gap-2">
                            {/* Analysis Status Icon */}
                            {fileAnalysis.analysisStatus === 'COMPLETED' && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {fileAnalysis.analysisStatus === 'PENDING' && (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            {fileAnalysis.analysisStatus === 'FAILED' && (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            {fileAnalysis.analysisStatus === 'NO_ANALYSIS' && (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                            
                            <button
                              onClick={() => handleDeleteRecording(fileAnalysis.fileId)}
                              className="p-1 rounded-md transition-colors hover:bg-red-100"
                              style={{ color: '#6A89A7' }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm mb-2" style={{ color: '#6A89A7' }}>
                          <span>Uploaded: {new Date(fileAnalysis.uploadedAt).toLocaleDateString()}</span>
                          <span className="capitalize">{fileAnalysis.analysisStatus.toLowerCase().replace('_', ' ')}</span>
                        </div>
                        
                        {fileAnalysis.detailedAnalysis && (
                          <div className="mb-2 p-2 bg-gray-50 rounded text-xs" style={{ color: '#384959' }}>
                            <strong>Analysis:</strong> {fileAnalysis.detailedAnalysis.substring(0, 100)}...
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm" style={{ color: '#6A89A7' }}>
                          <span>{fileAnalysis.category}</span>
                          <div className="flex items-center gap-2">
                            {fileAnalysis.analysisStatus === 'NO_ANALYSIS' && (
                              <button
                                onClick={() => handleAnalyzeRecording(fileAnalysis)}
                                disabled={isAnalyzing}
                                className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                                style={{ backgroundColor: '#88BDF2', color: 'white' }}
                              >
                                {isAnalyzing ? (
                                  <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                              </button>
                            )}
                            
                            {fileAnalysis.analysisStatus === 'COMPLETED' && (
                              <button
                                onClick={() => {
                                  // Show detailed analysis
                                  setAnalysisResult({
                                    detailedAnalysis: fileAnalysis.detailedAnalysis,
                                    analysisId: fileAnalysis.jobId,
                                    status: fileAnalysis.analysisStatus
                                  });
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                                style={{ backgroundColor: '#6A89A7', color: 'white' }}
                              >
                                <CheckCircle className="h-3 w-3" />
                                View Analysis
                              </button>
                            )}
                            
                            <a
                              href={fileAnalysis.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                              style={{ backgroundColor: '#6A89A7', color: 'white' }}
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="mt-6 bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#384959' }}>
                Interview Analysis Results
              </h3>
              
              <div className="space-y-4">
                {analysisResult.analysisText && (
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: '#384959' }}>
                      Analysis Summary
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm leading-relaxed" style={{ color: '#384959' }}>
                        {analysisResult.analysisText}
                      </p>
                    </div>
                  </div>
                )}
                
                {analysisResult.detailedAnalysis && (
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: '#384959' }}>
                      Detailed Analysis
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm overflow-auto" style={{ color: '#384959' }}>
                        {JSON.stringify(analysisResult.detailedAnalysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm" style={{ color: '#6A89A7' }}>
                  <span>Analysis ID: {analysisResult.analysisId}</span>
                  <span>Confidence: {analysisResult.confidenceScore || 'N/A'}</span>
                  <span>Processing Time: {analysisResult.processingTimeMs || 'N/A'}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {(error || success) && (
            <div className="mt-6">
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-md" style={{ backgroundColor: '#FEE2E2' }}>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}
              
              {success && (
                <div className="flex items-center gap-2 p-4 rounded-md" style={{ backgroundColor: '#D1FAE5' }}>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">{success}</span>
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