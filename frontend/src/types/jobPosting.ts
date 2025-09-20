// Job Posting Types
export enum ExperienceLevel {
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  JUNIOR = 'JUNIOR',
  MID_LEVEL = 'MID_LEVEL',
  SENIOR = 'SENIOR',
  EXPERT = 'EXPERT'
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE'
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  IN_REVIEW = 'IN_REVIEW',
  LEARNING_PHASE = 'LEARNING_PHASE',
  ASSESSMENT_PHASE = 'ASSESSMENT_PHASE',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum AssessmentType {
  TECHNICAL_QUIZ = 'TECHNICAL_QUIZ',
  CODING_CHALLENGE = 'CODING_CHALLENGE',
  BEHAVIORAL_TEST = 'BEHAVIORAL_TEST',
  SKILL_ASSESSMENT = 'SKILL_ASSESSMENT',
  MIXED = 'MIXED'
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export interface JobPosting {
  id: number;
  jobTitle: string;
  company: string;
  jobDescription: string;
  requiredSkills?: string;
  experienceLevel: ExperienceLevel;
  location?: string;
  jobType: JobType;
  salaryRange?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  recruiterName?: string;
  recruiterEmail?: string;
  totalApplications: number;
  hasLearningPath: boolean;
  hasAssessments: boolean;
  learningPath?: JobLearningPath[];
  assessments?: JobAssessmentSummary[];
}

export interface JobPostingRequest {
  jobTitle: string;
  company: string;
  jobDescription: string;
  requiredSkills?: string;
  experienceLevel: ExperienceLevel;
  location?: string;
  jobType: JobType;
  salaryRange?: string;
  generateLearningPath?: boolean;
  generateAssessment?: boolean;
}

// Learning Path Types
export interface JobLearningPath {
  id: number;
  jobPostingId: number;
  generatedByAi: boolean;
  careerGoal: string;
  experienceLevel: string;
  learningPace: string;
  isActive: boolean;
  createdAt: string;
  modules: JobLearningModule[];
}

export interface JobLearningModule {
  id: number;
  moduleName: string;
  moduleDescription: string;
  orderIndex: number;
  estimatedHours?: number;
  difficultyLevel?: DifficultyLevel;
  skillsCovered?: string;
  prerequisites?: string;
  createdAt: string;
}

// Assessment Types
export interface JobAssessmentSummary {
  id: number;
  assessmentName: string;
  assessmentDescription?: string;
  assessmentType: AssessmentType;
  difficultyLevel: DifficultyLevel;
  timeLimitMinutes?: number;
  passingScore?: number;
  maxScore?: number;
  isActive: boolean;
  createdAt: string;
  totalQuestions: number;
  totalSubmissions: number;
}

export interface JobAssessment {
  id: number;
  assessmentName: string;
  assessmentDescription?: string;
  assessmentType: AssessmentType;
  difficultyLevel: DifficultyLevel;
  timeLimitMinutes?: number;
  passingScore?: number;
  maxScore?: number;
  isActive: boolean;
  createdAt: string;
  questions: JobAssessmentQuestion[];
  submissions: CandidateAssessmentSubmission[];
}

export interface JobAssessmentQuestion {
  id: number;
  questionText: string;
  questionType: QuestionType;
  options?: string;
  correctAnswer: string;
  explanation?: string;
  points?: number;
  orderIndex: number;
  timeLimitSeconds?: number;
  createdAt: string;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  CODING = 'CODING',
  FILL_IN_BLANK = 'FILL_IN_BLANK'
}

// Candidate Application Types
export interface CandidateSubmission {
  id: number;
  jobPostingId: number;
  jobTitle: string;
  company: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  applicationStatus: ApplicationStatus;
  overallScore?: number;
  learningPathCompleted: boolean;
  learningPathProgress: number;
  assessmentsCompleted: number;
  totalAssessments: number;
  averageAssessmentScore?: number;
  notes?: string;
  recruiterFeedback?: string;
  submittedAt: string;
  lastActivityAt: string;
}

export interface CandidateAssessmentSubmission {
  id: number;
  candidateSubmissionId: number;
  jobAssessmentId: number;
  candidateId: number;
  scoreAchieved?: number;
  maxScore?: number;
  percentageScore?: number;
  timeTakenMinutes?: number;
  isPassed?: boolean;
  submissionStatus: SubmissionStatus;
  aiFeedback?: string;
  recruiterFeedback?: string;
  startedAt: string;
  submittedAt?: string;
  evaluatedAt?: string;
  answerSubmissions: CandidateAnswerSubmission[];
}

export enum SubmissionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  EVALUATED = 'EVALUATED',
  EXPIRED = 'EXPIRED'
}

export interface CandidateAnswerSubmission {
  id: number;
  questionId: number;
  providedAnswer: string;
  isCorrect?: boolean;
  pointsEarned?: number;
  maxPoints?: number;
  timeTakenSeconds?: number;
  aiEvaluation?: string;
  submittedAt: string;
}

// Request Types
export interface CandidateApplicationRequest {
  jobPostingId: number;
  coverLetter?: string;
  notes?: string;
}

export interface JobAssessmentRequest {
  jobPostingId: number;
  assessmentName: string;
  assessmentDescription?: string;
  assessmentType: AssessmentType;
  difficultyLevel: DifficultyLevel;
  timeLimitMinutes?: number;
  numberOfQuestions?: number;
  passingScore?: number;
  generateWithAI?: boolean;
}

// Dashboard Types
export interface RecruiterDashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  recentApplications: number;
  averageApplicationsPerJob: number;
  topPerformingJobs: JobPosting[];
  recentCandidates: CandidateSubmission[];
}

export interface CandidateDashboardStats {
  totalApplications: number;
  inProgress: number;
  completed: number;
  averageScore?: number;
  recentApplications: CandidateSubmission[];
  recommendedJobs: JobPosting[];
}

// Filter Types
export interface JobPostingFilters {
  experienceLevel?: ExperienceLevel[];
  jobType?: JobType[];
  location?: string;
  company?: string;
  hasLearningPath?: boolean;
  hasAssessments?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface CandidateFilters {
  applicationStatus?: ApplicationStatus[];
  experienceLevel?: ExperienceLevel[];
  minScore?: number;
  maxScore?: number;
  learningPathCompleted?: boolean;
  assessmentsCompleted?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

// Job Assessment Types (Based on existing AI assessment system)
export interface JobAssessmentQuestion {
  question: string;
  correct_answer?: string;
  options?: string[];
  question_type?: string;
  difficulty?: string;
  explanation?: string;
}

export interface JobAssessmentSession {
  success: boolean;
  message: string;
  assessment_id: string;
  questions: JobAssessmentQuestion[];
  job_id: number;
  candidate_id: number;
  assessment_type: string;
  difficulty: string;
  created_at: string;
}

export interface JobAssessmentAnswer {
  question: string;
  correct_answer: string;
  provided_answer: string;
}

export interface JobAssessmentAnswerScore {
  question: string;
  correct_answer: string;
  provided_answer: string;
  score: number;
  feedback?: string;
  is_correct: boolean;
}

export interface JobAssessmentResult {
  success: boolean;
  message: string;
  assessment_id: string;
  job_id: number;
  candidate_id: number;
  total_score: number;
  max_score: number;
  percentage: number;
  answers_and_scores: JobAssessmentAnswerScore[];
  overall_feedback: string;
  completed_at: string;
}

export interface JobAssessmentScores {
  success: boolean;
  message: string;
  jobId: number;
  note: string;
}