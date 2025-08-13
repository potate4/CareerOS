// Updated learningPathAPI.ts with AI integration and enhanced functionality
import api from './api';
import { 
  LearningPathRequest, 
  LearningPathResponse, 
  ModuleProgressRequest,
  AILearningPathRequest,
  AILearningPathResponse,
  AdaptationResponse,
  LearningPathStatsResponse
} from '../types/learningPath';
import { config } from '../config/env';

// Create a separate API instance for AI services (Python backend)
const aiApi = {
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${config.aiApiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  get: async (endpoint: string) => {
    const response = await fetch(`${config.aiApiUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
};

export const learningPathAPI = {
  // AI-Powered Learning Path Generation (Python Backend)
  generateAILearningPath: async (request: AILearningPathRequest): Promise<AILearningPathResponse> => {
    try {
      console.log('🤖 Generating AI-powered learning path with request:', request);
      const response = await aiApi.post('/generate-learning-path', request);
      console.log('✅ AI learning path generated successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ AI learning path generation failed:', error);
      throw error;
    }
  },

  // AI-Powered Learning Path Adaptation (Python Backend)
  adaptLearningPath: async (learningPathId: number): Promise<AdaptationResponse> => {
    try {
      console.log('🔄 Adapting learning path:', learningPathId);
      const response = await aiApi.post('/adapt-learning-path', { learningPathId });
      console.log('✅ Learning path adapted successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Learning path adaptation failed:', error);
      throw error;
    }
  },

  // Update progress with skill mastery tracking
  updateProgressWithMastery: async (request: ModuleProgressRequest): Promise<LearningPathResponse> => {
    try {
      console.log('📊 Updating progress with mastery tracking:', request);
      const response = await api.post('/path/ai/progress', request);
      console.log('✅ Progress updated with mastery tracking:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update progress with mastery:', error.response?.data);
      throw error;
    }
  },

  // Get AI-enhanced learning path statistics
  getAILearningPathStats: async (): Promise<LearningPathStatsResponse> => {
    try {
      console.log('📊 Getting AI-enhanced learning path statistics...');
      const response = await api.get('/path/ai/stats');
      console.log('✅ AI-enhanced stats retrieved successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get AI-enhanced stats:', error.response?.data);
      throw error;
    }
  },

  // Traditional Learning Path Generation (Java Backend)
  generateLearningPath: async (request: LearningPathRequest): Promise<LearningPathResponse> => {
    try {
      console.log('🚀 Generating traditional learning path with request:', request);
      const response = await api.post('/path/learning', request);
      console.log('✅ Learning path generated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Learning path generation failed:', error);
      throw error;
    }
  },

  // Get current learning path for user
  getCurrentLearningPath: async (): Promise<LearningPathResponse> => {
    try {
      console.log('📚 Getting current learning path...');
      const response = await api.get('/path/current');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get current learning path:', error.response?.data);
      throw error;
    }
  },

  // Update module progress (traditional)
  updateModuleProgress: async (request: ModuleProgressRequest): Promise<LearningPathResponse> => {
    try {
      console.log('📈 Updating module progress:', request);
      const response = await api.post('/path/progress', request);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update module progress:', error.response?.data);
      throw error;
    }
  },

  // Get learning path statistics (traditional)
  getLearningPathStats: async (): Promise<LearningPathStatsResponse> => {
    try {
      console.log('📚 Getting current learning path...');
      const response = await api.get('/path/stats');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get current learning path:', error.response?.data);
      throw error;
    }
  },

  // Get all learning paths for user
  getAllLearningPaths: async (): Promise<LearningPathResponse[]> => {
    try {
      console.log('📚 Getting all learning paths...');
      const response = await api.get('/path/all');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get all learning paths:', error.response?.data);
      throw error;
    }
  },

  // Deactivate current learning path
  deactivateLearningPath: async (): Promise<{ message: string }> => {
    try {
      console.log('🚫 Deactivating current learning path...');
      const response = await api.delete('/path/current');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to deactivate learning path:', error.response?.data);
      throw error;
    }
  },

  // Get skill mastery data
  getSkillMastery: async (): Promise<any[]> => {
    try {
      console.log('🎯 Getting skill mastery data...');
      const response = await api.get('/path/skills/mastery');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get skill mastery data:', error.response?.data);
      throw error;
    }
  },

  // Get market trends (Python Backend)
  getMarketTrends: async (skills: string[]): Promise<any> => {
    try {
      console.log('📊 Getting market trends for skills:', skills);
      const skillsParam = skills.join(',');
      const response = await aiApi.get(`/skills/market-trends?skills=${skillsParam}`);
      console.log('✅ Market trends retrieved successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to get market trends:', error);
      throw error;
    }
  },

  // Update skill mastery
  updateSkillMastery: async (skillMastery: Partial<any>): Promise<any> => {
    try {
      console.log('📊 Updating skill mastery:', skillMastery);
      const response = await api.put(`/path/skills/mastery/${skillMastery.id}`, skillMastery);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update skill mastery:', error.response?.data);
      throw error;
    }
  },

  // Get learning path health status
  getHealthStatus: async (): Promise<any> => {
    try {
      console.log('🏥 Checking learning path service health...');
      const response = await api.get('/path/health');
      return response.data;
    } catch (error: any) {
      console.error('❌ Health check failed:', error.response?.data);
      throw error;
    }
  },

  // Test learning path service
  testService: async (): Promise<any> => {
    try {
      console.log('🧪 Testing learning path service...');
      const response = await api.get('/path/test');
      return response.data;
    } catch (error: any) {
      console.error('❌ Service test failed:', error.response?.data);
      throw error;
    }
  }
};