export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum ModuleStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export enum ResourceType {
  VIDEO = 'VIDEO',
  COURSE = 'COURSE',
  ARTICLE = 'ARTICLE',
  BOOK = 'BOOK',
  EXERCISE = 'EXERCISE',
  PROJECT = 'PROJECT',
  QUIZ = 'QUIZ',
  PODCAST = 'PODCAST'
}

export enum ExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum LearningPace {
  SLOW = 'SLOW',
  MODERATE = 'MODERATE',
  FAST = 'FAST',
  INTENSIVE = 'INTENSIVE'
}

export enum LearningStage {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export interface LearningResource {
  id: number;
  title: string;
  description: string;
  url: string;
  platform: string;
  durationMinutes: number;
  rating: number;
  isFree: boolean;
  language: string;
}

export interface LearningModule {
  id: number;
  title: string;
  description: string;
  skillFocus: string;
  difficultyLevel: DifficultyLevel;
  estimatedHours: number;
  progressPercentage: number;
  status: ModuleStatus;
  userRating?: number;
  userFeedback?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  resources: LearningResource[];
}

export interface PathStatistics {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  averageRating: number;
  totalEstimatedHours: number;
  completedHours: number;
  overallProgress: number;
}

export interface LearningPath {
  id: number;
  careerGoal: string;
  currentStage: LearningStage;
  overallProgress: number;
  estimatedCompletionWeeks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  modules: LearningModule[];
  statistics: PathStatistics;
}

export interface LearningPathRequest {
  careerGoal: string;
  currentSkills: string[];
  experienceLevel: ExperienceLevel;
  learningPace: LearningPace;
  additionalNotes?: string;
}

export interface ModuleProgressRequest {
  moduleId: number;
  progressPercentage: number;
  status: ModuleStatus;
  userRating?: number;
  userFeedback?: string;
}

export interface LearningPathResponse {
  id: number;
  careerGoal: string;
  currentStage: LearningStage;
  overallProgress: number;
  estimatedCompletionWeeks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  modules: LearningModule[];
  statistics: PathStatistics;
} 
// types/learningPath.ts
// types/learningPath.ts
// types/learningPath.ts
export interface LearningPathStatsResponse {
  userId: number;
  username: string;
  careerGoal: string | null;
  currentStage: string | null;
  overallProgress: number;
  estimatedCompletionWeeks: number;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  averageRating: number;
  totalEstimatedHours: number;
  completedHours: number;
  message?: string; // For error cases
}

export interface MessageResponse {
  message: string;
}