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
  getProgress: async (roadmapId: number): Promise<RoadmapProgressDTO> => {
    const { data } = await api.get(`/futurecast/roadmaps/${roadmapId}/progress`);
    return data;
  }
}; 