export interface InterviewRecording {
  id?: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  uploadDate: string;
  category: 'interview-recording';
  description?: string;
  userId: number;
  duration?: number;
  sessionTitle?: string;
  fileType: 'video' | 'audio';
}

export interface InterviewRecordingRequest {
  file: File;
  description?: string;
  sessionTitle?: string;
  fileType: 'video' | 'audio';
}

export interface InterviewRecordingResponse {
  success: boolean;
  message: string;
  fileId?: number;
  fileName?: string;
  fileUrl?: string;
  uploadDate?: string;
  category?: string;
  description?: string;
  sessionTitle?: string;
  fileType?: 'video' | 'audio';
}

export interface FileAnalysisResponse {
  fileId: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  category: string;
  uploadedAt: string;
  jobId?: string;
  analysisStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'NO_ANALYSIS';
  analysisType?: string;
  detailedAnalysis?: string;
  errorMessage?: string;
  analysisCreatedAt?: string;
  analysisUpdatedAt?: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  mediaRecorder: MediaRecorder | null;
  videoChunks: Blob[];
  videoBlob: Blob | null;
  videoUrl: string | null;
  stream: MediaStream | null;
}

export interface InterviewSession {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: 'recording' | 'paused' | 'completed' | 'saved';
  recordingUrl?: string;
  fileType: 'video' | 'audio';
} 