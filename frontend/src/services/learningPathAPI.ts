// Updated learningPathAPI.ts with proper authentication and error handling
import axios from 'axios';
import { 
  LearningPathRequest, 
  LearningPathResponse, 
  ModuleProgressRequest 
} from '../types/learningPath';
import { handleApiError } from '../utils/apiErrorHandler';
import { config } from '../config/env';

// Create API instance with proper configuration (like interviewAPI)
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists (same as interviewAPI)
api.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem(config.tokenKey);
  console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('⚠️ No token found in localStorage');
  }
  
  return requestConfig;
});

// Add response interceptor for error handling (same as interviewAPI)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = handleApiError(error);
    return Promise.reject(apiError);
  }
);

export const learningPathAPI = {
  // Generate a new learning path
  generateLearningPath: async (request: LearningPathRequest): Promise<LearningPathResponse> => {
    try {
      console.log('🚀 Generating learning path with request:', request);
      const response = await api.post('/path/learning', request);
      console.log('✅ Learning path generated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Learning path generation failed:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Error Data:', error.response?.data);
      console.error('Error Headers:', error.response?.headers);
      console.error('Full Error:', error);
      
      // Check specifically for 403 error (Forbidden - likely auth issue)
      if (error.response?.status === 403) {
        console.error('🔒 Forbidden (403) - Check your authentication token');
        const errorMessage = error.response?.data?.message || 'Access forbidden - please check your authentication token';
        throw new Error(errorMessage);
      }
      
      throw handleApiError(error);
    }
  },

  // Get current learning path for user
  getCurrentLearningPath: async (): Promise<LearningPathResponse> => {
    try {
      console.log('📚 Getting current learning path...');
      const response = await api.get('/api/path/current');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get current learning path:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Update module progress
  updateModuleProgress: async (request: ModuleProgressRequest): Promise<LearningPathResponse> => {
    try {
      console.log('📈 Updating module progress:', request);
      const response = await api.post('/api/path/progress', request);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update module progress:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Get learning path statistics
  getLearningPathStats: async (): Promise<any> => {
    try {
      console.log('📊 Getting learning path statistics...');
      const response = await api.get('/api/path/stats');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get learning path stats:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Get all learning paths for user
  getAllLearningPaths: async (): Promise<LearningPathResponse[]> => {
    try {
      console.log('📚 Getting all learning paths...');
      const response = await api.get('/api/path/all');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get all learning paths:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Deactivate current learning path
  deactivateLearningPath: async (): Promise<{ message: string }> => {
    try {
      console.log('🚫 Deactivating current learning path...');
      const response = await api.delete('/api/path/current');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to deactivate learning path:', error.response?.data);
      throw handleApiError(error);
    }
  }
};