export type Preferences = Record<string, any>;

export interface FuturecastRequestDTO {
  careerGoal: string;
  timelineYears: number;
  preferences?: Preferences;
  userProfile?: Record<string, any>;
  marketData?: Record<string, any>;
}

export interface SubtaskDTO {
  id: number;
  title: string;
  description?: string;
  estimatedTime?: string;
  position?: number;
}

export interface MilestoneDTO {
  id: number;
  year: number;
  title: string;
  expectedSalary?: number;
  notes?: string;
  estimatedTimeToComplete?: string;
  isCompleted?: boolean;
  completedAt?: string;
  subtasks?: SubtaskDTO[];
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CareerPathDTO {
  id: number;
  pathId: string; // "path1" | "path2" | ...
  description: string;
  difficulty?: Difficulty;
  probability?: number;
  riskLevel?: RiskLevel;
  totalInvestment?: number;
  isSelected?: boolean;
  milestones: MilestoneDTO[];
}

export type RoadmapStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'SHARED';

export interface FuturecastRoadmapDTO {
  id: number;
  careerGoal: string;
  timelineYears: number;
  explanation?: string;
  confidence?: number;
  recommendedPathId?: string;
  status?: RoadmapStatus;
  isPublic?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  paths: CareerPathDTO[];
}

export interface GenerateRoadmapResponse {
  message: string;
  roadmapId: number;
  careerGoal: string;
  timelineYears: number;
  confidence?: number;
  createdAt?: string;
}

export interface RoadmapProgressDTO {
  roadmapId: number | string;
  overallProgress: number;
  selectedPathProgress?: number;
  totalMilestones: number;
  completedMilestones: number;
} 