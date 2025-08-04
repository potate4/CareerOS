import api from './api';
import { 
  LearningPathRequest, 
  LearningPathResponse, 
  ModuleProgressRequest 
} from '../types/learningPath';

export const learningPathAPI = {
  // Generate a new learning path
  generateLearningPath: async (request: LearningPathRequest): Promise<LearningPathResponse> => {
    try {
      const response = await api.post('/api/path/learning', request);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current learning path for user
  getCurrentLearningPath: async (): Promise<LearningPathResponse> => {
    try {
      const response = await api.get('/api/path/current');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update module progress
  updateModuleProgress: async (request: ModuleProgressRequest): Promise<LearningPathResponse> => {
    try {
      const response = await api.post('/api/path/progress', request);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get learning path statistics
  getLearningPathStats: async (): Promise<any> => {
    try {
      const response = await api.get('/api/path/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all learning paths for user
  getAllLearningPaths: async (): Promise<LearningPathResponse[]> => {
    try {
      const response = await api.get('/api/path/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Deactivate current learning path
  deactivateLearningPath: async (): Promise<{ message: string }> => {
    try {
      const response = await api.delete('/api/path/current');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 