import axios from 'axios';
import { LoginRequest, SignupRequest, AuthResponse } from '../types/auth';
import { AIAnalysisRequest, AIAnalysisResponse, CareerRecommendationRequest, CareerRecommendationResponse, AIHealthResponse } from '../types/ai';
import { handleApiError } from '../utils/apiErrorHandler';
import { config } from '../config/env';

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

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/signin', credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  signup: async (userData: SignupRequest): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add method to validate token
  validateToken: async (): Promise<boolean> => {
    try {
      await api.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  },

  // Add method to logout
  logout: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export const aiAPI = {
  // Analyze content using AI
  analyzeContent: async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
    try {
      const response = await api.post('/ai/analyze', request);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get career recommendations
  getCareerRecommendations: async (request: CareerRecommendationRequest): Promise<CareerRecommendationResponse> => {
    try {
      const response = await api.post('/ai/career-recommendations', request);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Check AI service health
  checkHealth: async (): Promise<AIHealthResponse> => {
    try {
      const response = await api.get('/ai/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get AI service status
  getStatus: async (): Promise<AIHealthResponse> => {
    try {
      const response = await api.get('/ai/status');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default api; 