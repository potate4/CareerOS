import React, { useState, useEffect } from 'react';
import { Video, Save, Play, Download, Trash2, AlertCircle, CheckCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';
import VideoRecorder from './VideoRecorder';
import { interviewAPI } from '../services/interviewAPI';
import { InterviewRecording, InterviewRecordingRequest, FileAnalysisResponse } from '../types';

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

  useEffect(() => {
    loadFileAnalysisData();
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
      
      const result = await interviewAPI.analyzeInterview(fileAnalysis.fileUrl, "comprehensive", fileAnalysis.fileId, user?.id!);
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

            {/* Recordings List */}
            <div>
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