export interface AIAnalysisRequest {
  userId: number;
  content: string;
  analysisType: string;
  parameters?: Record<string, any>;
}

export interface AIAnalysisResponse {
  analysisId: string;
  userId: number;
  content: string;
  analysisType: string;
  result: Record<string, any>;
  confidenceScore: number;
  processingTimeMs: number;
  createdAt: string;
  status: string;
}

export interface CareerRecommendationRequest {
  skills: string[];
  experienceYears: number;
  interests: string[];
  location?: string;
}

export interface JobRecommendation {
  jobTitle: string;
  company: string;
  matchScore: number;
  salaryRange: string;
  location: string;
  requirements: string[];
}

export interface CourseRecommendation {
  title: string;
  platform: string;
  duration: string;
  rating: number;
}

export interface MarketTrends {
  hotSkills: string[];
  growingRoles: string[];
  salaryTrends: string;
}

export interface CareerRecommendationResponse {
  recommendationId: string;
  userId: number;
  recommendations: JobRecommendation[];
  skillGaps: string[];
  suggestedCourses: CourseRecommendation[];
  marketTrends: MarketTrends;
  confidenceScore: number;
  createdAt: string;
}

export interface AIHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  version: string;
}

export interface FileUploadRequest {
  file: File;
  description?: string;
  category?: string;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  fileId?: number;
  fileName?: string;
  fileUrl?: string;
  uploadDate?: string;
  category?: string;
  description?: string;
}

export interface FileUpload {
  id: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  uploadDate: string;
  category: string;
  description: string;
  userId: number;
} 