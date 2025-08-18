export enum ExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum LearningPace {
  SLOW = 'SLOW',
  MODERATE = 'MODERATE',
  FAST = 'FAST'
}

export interface LearningModule {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: string;
}

export interface LearningPath {
  id: number;
  careerGoal: string;
  experienceLevel: string;
  learningPace: string;
  isActive: boolean;
  createdAt: string;
  modules: LearningModule[];
}

export interface LearningPathRequest {
  careerGoal: string;
  experienceLevel: ExperienceLevel;
  learningPace: LearningPace;
  currentSkills: string[];
  additionalNotes?: string;
}

// Chat-related types
export interface ChatMessage {
  speaker: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export interface LearningChatRequest {
  userId: number;
  moduleId: number;
  userQuery: string;
  chatHistory?: ChatMessage[];
}

export interface LearningChatResponse {
  success: boolean;
  message: string;
  reply: string;
  userId: number;
  moduleId: number;
  processingTimeSeconds: number;
  timestamp: string;
}