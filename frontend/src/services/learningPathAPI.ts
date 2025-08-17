// Simplified learningPathAPI.ts for basic learning path functionality
import axios from 'axios';
import { 
  LearningPathRequest, 
  LearningPath
} from '../types/learningPath';
import { handleApiError } from '../utils/apiErrorHandler';
import { config } from '../config/env';

// Create API instance with proper configuration
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
  console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('⚠️ No token found in localStorage');
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

export const learningPathAPI = {
  // Generate a new learning path
  generateLearningPath: async (request: LearningPathRequest): Promise<LearningPath> => {
    try {
      console.log('🚀 Generating learning path with request:', request);
      const response = await api.post('/path/generate', request);
      console.log('✅ Learning path generated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Learning path generation failed:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Get all learning paths for user
  getAllLearningPaths: async (): Promise<LearningPath[]> => {
    try {
      console.log('📚 Getting all learning paths...');
      const response = await api.get('/path/all');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get all learning paths:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Get modules for a specific learning path
  getLearningPathModules: async (learningPathId: number): Promise<LearningPath> => {
    try {
      console.log('📚 Getting modules for learning path:', learningPathId);
      const response = await api.get(`/path/${learningPathId}/modules`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get learning path modules:', error.response?.data);
      throw handleApiError(error);
    }
  }
};