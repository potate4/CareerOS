import axios from 'axios';
import { MindFlowRecordingRequest, MindFlowRecordingResponse, MindFlowRecording, MindFlowFileAnalysisResponse, MindFlowSessionDTO, MindFlowConversationMessage, MindFlowStartSimulationResponse, MindFlowProcessAnswerResponse, ScenarioType } from '../types';
import { handleApiError } from '../../../utils/apiErrorHandler';
import { config } from '../../../config/env';

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem(config.tokenKey);
  console.log('🔑 MindFlow Token from localStorage:', token ? 'Present' : 'Missing');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 MindFlow Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('⚠️ MindFlow No token found in localStorage');
  }
  
  // Don't override Content-Type for multipart requests
  if (requestConfig.data instanceof FormData) {
    delete requestConfig.headers['Content-Type'];
  }
  
  return requestConfig;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = handleApiError(error);
    return Promise.reject(apiError);
  }
);

export const mindflowAPI = {
  // Upload MindFlow recording (supports large files)
  uploadRecording: async (request: MindFlowRecordingRequest, onProgress?: (percent: number) => void): Promise<MindFlowRecordingResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      if (request.description) {
        formData.append('description', request.description);
      }
      if (request.sessionTitle) {
        formData.append('sessionTitle', request.sessionTitle);
      }
      if (request.scenarioType) {
        formData.append('scenarioType', request.scenarioType);
      }
      formData.append('category', 'mindflow-recording');
      formData.append('fileType', 'video');

      const response = await api.post('/files/file-upload-and-get-url', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Disable timeout for large uploads
        timeout: 0,
        onUploadProgress: (evt) => {
          if (!onProgress) return;
          const total = evt.total || 0;
          const loaded = evt.loaded || 0;
          if (total > 0) {
            const percent = Math.round((loaded / total) * 100);
            onProgress(percent);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upload audio and get public URL
  uploadAudio: async (file: File, description?: string, scenarioType?: string): Promise<MindFlowRecordingResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description) formData.append('description', description);
      if (scenarioType) formData.append('scenarioType', scenarioType);
      formData.append('category', 'mindflow-audio');
      formData.append('fileType', 'audio');
      const response = await api.post('/files/file-upload-and-get-url', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's MindFlow recordings
  getMyRecordings: async (): Promise<MindFlowRecording[]> => {
    try {
      const response = await api.get('/files/my-uploads/mindflow-recording');
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get file analysis data for MindFlow
  getFileAnalysisData: async (): Promise<MindFlowFileAnalysisResponse[]> => {
    try {
      const response = await api.get('/mindflow/files/analysis');
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete MindFlow recording
  deleteRecording: async (recordingId: number): Promise<void> => {
    try {
      await api.delete(`/files/delete/${recordingId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Analyze MindFlow recording
  analyzeMindFlow: async (videoUrl: string, analysisType: string, fileId: number, userId: number, scenarioType?: string): Promise<any> => {
    try {
      const response = await api.post('/mindflow/analyze', {
        videoUrl,
        analysisType,
        fileId,
        userId,
        scenarioType: scenarioType || 'GENERAL_COMMUNICATION'
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Check MindFlow service health
  checkMindFlowHealth: async (): Promise<any> => {
    try {
      const response = await api.get('/mindflow/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get MindFlow job status
  getJobStatus: async (jobId: string): Promise<any> => {
    try {
      const response = await api.get(`/mindflow/job/${jobId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's MindFlow jobs
  getUserJobs: async (): Promise<any[]> => {
    try {
      const response = await api.get('/mindflow/jobs');
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Session management
  createSession: async (sessionData?: any): Promise<MindFlowSessionDTO> => {
    try {
      const response = await api.post('/mindflow/sessions', {
        initialSessionData: sessionData ? JSON.stringify(sessionData) : '{}',
        scenarioType: sessionData?.scenarioType || 'GENERAL_COMMUNICATION'
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  listSessions: async (status?: string): Promise<MindFlowSessionDTO[]> => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/mindflow/sessions', { params });
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getSession: async (sessionId: string): Promise<MindFlowSessionDTO> => {
    try {
      const response = await api.get(`/mindflow/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateSession: async (sessionId: string, updates: any): Promise<MindFlowSessionDTO> => {
    try {
      const response = await api.patch(`/mindflow/sessions/${sessionId}`, updates);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  endSession: async (sessionId: string): Promise<MindFlowSessionDTO> => {
    try {
      const response = await api.post(`/mindflow/sessions/${sessionId}/end`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Conversation management
  getConversation: async (sessionId: string): Promise<MindFlowConversationMessage[]> => {
    try {
      const response = await api.get(`/mindflow/sessions/${sessionId}/conversation`);
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  addConversationMessage: async (sessionId: string, message: { speaker: 'ai' | 'user'; message: string; audioUrl?: string }): Promise<any> => {
    try {
      const response = await api.post(`/mindflow/sessions/${sessionId}/conversation`, message);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Simulation helpers
  startSimulation: async (sessionId: string): Promise<MindFlowStartSimulationResponse> => {
    try {
      const response = await api.post(`/mindflow/sessions/${sessionId}/start`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  processAnswer: async (sessionId: string, audioUrl: string): Promise<MindFlowProcessAnswerResponse> => {
    try {
      const response = await api.post(`/mindflow/sessions/${sessionId}/answer`, { audioUrl });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};