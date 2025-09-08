export interface MindFlowRecording {
  id?: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  uploadDate: string;
  category: 'mindflow-recording';
  description?: string;
  userId: number;
  duration?: number;
  sessionTitle?: string;
  fileType: 'video' | 'audio';
  scenarioType?: string;
}

export interface MindFlowRecordingRequest {
  file: File;
  description?: string;
  sessionTitle?: string;
  fileType: 'video' | 'audio';
  scenarioType?: string;
}

export interface MindFlowRecordingResponse {
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
  scenarioType?: string;
}

export interface MindFlowFileAnalysisResponse {
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
  scenarioType?: string;
}

export interface MindFlowRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  mediaRecorder: MediaRecorder | null;
  videoChunks: Blob[];
  videoBlob: Blob | null;
  videoUrl: string | null;
  stream: MediaStream | null;
}

export interface MindFlowSessionDTO {
  sessionId: string;
  userId: number;
  status: 'ACTIVE' | 'ENDED';
  sessionData?: string;
  scenarioType?: string;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
}

export interface MindFlowConversationMessage {
  sessionId: string;
  userId: number;
  speaker: 'ai' | 'user';
  message: string;
  audioUrl?: string | null;
  createdAt: string;
}

export interface MindFlowStartSimulationResponse {
  question: string;
  audioUrl?: string | null;
}

export interface MindFlowProcessAnswerResponse {
  transcript: string;
  nextQuestion: string;
  audioUrl?: string | null;
}

export type ScenarioType = 
  | 'SALARY_NEGOTIATION'
  | 'DIFFICULT_CONVERSATION'  
  | 'TEAM_CONFLICT'
  | 'CLIENT_RELATIONS'
  | 'LEADERSHIP'
  | 'GENERAL_COMMUNICATION';

export interface ScenarioOption {
  value: ScenarioType;
  label: string;
  description: string;
  icon: string;
}

export const SCENARIO_OPTIONS: ScenarioOption[] = [
  {
    value: 'SALARY_NEGOTIATION',
    label: 'Salary Negotiation',
    description: 'Practice asking for raises, discussing compensation, and negotiating job offers',
    icon: '💰'
  },
  {
    value: 'DIFFICULT_CONVERSATION',
    label: 'Difficult Conversations',
    description: 'Handle performance issues, give feedback, and address workplace conflicts',
    icon: '🗣️'
  },
  {
    value: 'TEAM_CONFLICT',
    label: 'Team Conflict Resolution',
    description: 'Mediate disputes, build consensus, and manage team dynamics',
    icon: '🤝'
  },
  {
    value: 'CLIENT_RELATIONS',
    label: 'Client Relations',
    description: 'Manage client expectations, handle complaints, and build relationships',
    icon: '👥'
  },
  {
    value: 'LEADERSHIP',
    label: 'Leadership Moments',
    description: 'Make tough decisions, inspire teams, and demonstrate executive presence',
    icon: '👨‍💼'
  },
  {
    value: 'GENERAL_COMMUNICATION',
    label: 'General Communication',
    description: 'Improve overall workplace communication and professional presence',
    icon: '💬'
  }
];