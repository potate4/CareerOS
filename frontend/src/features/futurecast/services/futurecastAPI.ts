import api from '../../../services/api';
import { FuturecastRequestDTO, GenerateRoadmapResponse, FuturecastRoadmapDTO, RoadmapProgressDTO } from '../types';

export const futurecastAPI = {
  generateRoadmap: async (payload: FuturecastRequestDTO): Promise<GenerateRoadmapResponse> => {
    const { data } = await api.post('/futurecast/generate-roadmap', payload, { timeout: 0 });
    return data;
  },
  getRoadmap: async (roadmapId: number): Promise<FuturecastRoadmapDTO> => {
    const { data } = await api.get(`/futurecast/roadmaps/${roadmapId}`);
    return data;
  },
  getMyRoadmaps: async (page = 0, size = 10): Promise<{ roadmaps: FuturecastRoadmapDTO[]; totalItems: number; totalPages: number; currentPage: number; } > => {
    const { data } = await api.get('/futurecast/roadmaps', { params: { page, size } });
    return data;
  },
  selectPath: async (roadmapId: number, pathId: string): Promise<{ message: string; selectedPath: { id: number; pathId: string; description: string; isSelected: boolean; } }> => {
    const { data } = await api.put(`/futurecast/roadmaps/${roadmapId}/paths/${pathId}/select`, {});
    return data;
  },
  updateMilestone: async (milestoneId: number, body: { isCompleted: boolean; userNotes?: string }): Promise<{ message: string; milestone?: any }> => {
    const { data } = await api.put(`/futurecast/milestones/${milestoneId}`, body);
    return data;
  },
  markMilestoneComplete: async (milestoneId: number): Promise<{ message: string; milestoneId: number; completedAt?: string }> => {
    const { data } = await api.post(`/futurecast/milestones/${milestoneId}/complete`);
    return data;
  },
  markMilestoneUncomplete: async (milestoneId: number): Promise<{ message: string; milestoneId: number }> => {
    const { data } = await api.post(`/futurecast/milestones/${milestoneId}/uncomplete`);
    return data;
  },
  getProgress: async (roadmapId: number): Promise<RoadmapProgressDTO> => {
    const { data } = await api.get(`/futurecast/roadmaps/${roadmapId}/progress`);
    return data;
  },
  deleteRoadmap: async (roadmapId: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/futurecast/roadmaps/${roadmapId}`);
    return data;
  },
  getUserProfile: async (): Promise<{ hasProfile: boolean; profile?: any }> => {
    const { data } = await api.get('/futurecast/user-profile');
    return data;
  },
  saveUserProfile: async (profile: any): Promise<{ message: string; profile: any }> => {
    const { data } = await api.post('/futurecast/user-profile', profile);
    return data;
  },
  getMarketData: async (careerGoal: string, industry?: string): Promise<{ marketData: any; timestamp: string }> => {
    const { data } = await api.get('/futurecast/market-data', { params: { careerGoal, industry } });
    return data;
  },
}; 