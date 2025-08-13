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
  
  // New AI-related fields
  skillMasteryLevel?: number;
  prerequisites?: string;
  marketRelevanceScore?: number;
  timeSpentHours?: number;
  lastPracticeDate?: string;
  nextPracticeDate?: string;
  aiRecommended?: boolean;
  adaptationPriority?: number;
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
  
  // New AI-related fields
  aiGenerated?: boolean;
  lastAiUpdate?: string;
  marketDemandScore?: number;
  currentMarketTrends?: string;
  interviewPerformanceScore?: number;
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
  
  // New AI-related fields
  aiGenerated?: boolean;
  lastAiUpdate?: string;
  marketDemandScore?: number;
  currentMarketTrends?: string;
  interviewPerformanceScore?: number;
}

// New AI-specific interfaces
export interface AILearningPathRequest extends Omit<LearningPathRequest, 'currentSkills'> {
  userId?: number;
  username?: string;
  email?: string;
  currentSkills: Record<string, number>; // skill_name -> mastery_level (0.0 to 1.0)
  interviewPerformance?: InterviewPerformance;
  marketTrends?: MarketTrend[];
  learningHistory?: LearningHistory;
}

export interface InterviewPerformance {
  overallScore?: number;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  lastInterviewDate?: string;
}

export interface MarketTrend {
  skillName: string;
  demandScore: number;
  salaryTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  jobPostingsCount?: number;
  growthRatePercentage?: number;
  trendingDirection: 'UP' | 'DOWN' | 'STABLE';
}

export interface LearningHistory {
  completedModules: number;
  totalHoursSpent: number;
  averageRating: number;
  lastActivityDate?: string;
}

export interface AILearningPathResponse {
  modules: AILearningModule[];
  estimatedWeeks: number;
  marketDemandScore: number;
  marketTrends: string;
  skillGapAnalysis: SkillGapAnalysis;
  learningStrategy: string;
}

export interface AILearningModule {
  title: string;
  description: string;
  skillFocus: string;
  difficultyLevel: string;
  estimatedHours: number;
  marketRelevance: number;
  prerequisites?: string;
}

export interface SkillGapAnalysis {
  totalSkillsRequired: number;
  currentSkills: number;
  skillsToLearn: number;
  prioritySkills: string[];
  estimatedTimeToMastery: string;
}

export interface AdaptationRequest {
  learningPathId: number;
  currentProgress: number;
  currentStage: string;
  estimatedCompletionWeeks: number;
  recentProgress: any[];
  updatedSkillLevels: Record<string, number>;
  marketChanges: any;
}

export interface AdaptationResponse {
  updatedModules: any[];
  newModules: AILearningModule[];
  overallProgress: number;
  currentStage: string;
  estimatedWeeks: number;
  adaptationReason: string;
}

// Enhanced statistics response
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
  
  // AI-specific stats
  aiGenerated?: boolean;
  marketDemandScore?: number;
  lastAiUpdate?: string;
  nextAdaptationDate?: string;
  interviewPerformanceScore?: number;
  
  message?: string; // For error cases
}

export interface MessageResponse {
  message: string;
}

// Skill mastery tracking
export interface SkillMastery {
  id: number;
  skillName: string;
  masteryLevel: number;
  experienceHours: number;
  lastAssessmentDate?: string;
  assessmentScore?: number;
  marketDemandLevel?: number;
  trendingUp: boolean;
}

// Market trends
export interface MarketTrendData {
  id: number;
  skillName: string;
  demandScore: number;
  salaryTrend: string;
  jobPostingsCount?: number;
  growthRatePercentage?: number;
  trendingDirection: string;
  marketRegion?: string;
  industryFocus?: string;
  lastUpdated: string;
  dataSource?: string;
  confidenceScore?: number;
}