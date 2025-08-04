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
  ADVANCED = 'ADVANCED'
}

export enum LearningPace {
  SLOW = 'SLOW',
  MODERATE = 'MODERATE',
  FAST = 'FAST'
}

export interface LearningResource {
  id: number;
  title: string;
  description: string;
  url: string;
  resourceType: ResourceType;
  platform: string;
  durationMinutes: number;
  difficultyLevel: DifficultyLevel;
  rating: number;
  isFree: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
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
  learningResources: LearningResource[];
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
  currentStage: DifficultyLevel;
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
  currentStage: DifficultyLevel;
  overallProgress: number;
  estimatedCompletionWeeks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  modules: LearningModule[];
  statistics: PathStatistics;
} 