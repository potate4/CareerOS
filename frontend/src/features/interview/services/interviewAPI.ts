import axios from 'axios';
import { InterviewRecordingRequest, InterviewRecordingResponse, InterviewRecording } from '../types';
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
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
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

export const interviewAPI = {
  // Upload interview recording
  uploadRecording: async (request: InterviewRecordingRequest): Promise<InterviewRecordingResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      if (request.description) {
        formData.append('description', request.description);
      }
      if (request.sessionTitle) {
        formData.append('sessionTitle', request.sessionTitle);
      }
      formData.append('category', 'interview-recording');
      formData.append('fileType', 'video');

      const response = await api.post('/files/file-upload-and-get-url', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's interview recordings
  getMyRecordings: async (): Promise<InterviewRecording[]> => {
    try {
      const response = await api.get('/files/my-uploads/interview-recording');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get specific recording by ID
  getRecordingById: async (recordingId: number): Promise<InterviewRecording> => {
    try {
      const response = await api.get(`/files/upload/${recordingId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete recording
  deleteRecording: async (recordingId: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/files/upload/${recordingId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
}; 