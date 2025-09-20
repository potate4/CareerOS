import api from './api';
import {
  JobPosting,
  JobPostingRequest,
  JobLearningPath,
  CandidateSubmission,
  CandidateApplicationRequest,
  JobAssessmentRequest,
  JobAssessmentSummary,
  RecruiterDashboardStats,
  CandidateDashboardStats,
  JobPostingFilters,
  ApplicationStatus,
  JobAssessmentSession,
  JobAssessmentAnswer,
  JobAssessmentResult,
  JobAssessmentScores
} from '../types/jobPosting';

// Job Posting API
export const jobPostingAPI = {
  // Recruiter endpoints
  createJobPosting: async (data: JobPostingRequest): Promise<JobPosting> => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  getRecruiterJobPostings: async (): Promise<JobPosting[]> => {
    const response = await api.get('/jobs/recruiter');
    return response.data;
  },

  getRecruiterJobPosting: async (jobId: number): Promise<JobPosting> => {
    const response = await api.get(`/jobs/recruiter/${jobId}`);
    return response.data;
  },

  updateJobPosting: async (jobId: number, data: JobPostingRequest): Promise<JobPosting> => {
    const response = await api.put(`/jobs/recruiter/${jobId}`, data);
    return response.data;
  },

  toggleJobPostingStatus: async (jobId: number): Promise<JobPosting> => {
    const response = await api.patch(`/jobs/recruiter/${jobId}/toggle-status`);
    return response.data;
  },

  getJobPosting: async (jobId: number): Promise<JobPosting> => {
    const response = await api.get(`/jobs/recruiter/${jobId}`);
    return response.data;
  },

  getJobLearningPath: async (jobId: number): Promise<JobLearningPath> => {
    const response = await api.get(`/jobs/recruiter/${jobId}/learning-path`);
    return response.data;
  },

  // Public endpoints (for candidates)
  getAllActiveJobPostings: async (filters?: JobPostingFilters): Promise<JobPosting[]> => {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('keyword', filters.search);
      const response = await api.get(`/jobs/public/search?${params.toString()}`);
      return response.data;
    }
    
    const response = await api.get('/jobs/public');
    return response.data;
  },

  searchJobPostings: async (keyword: string): Promise<JobPosting[]> => {
    const response = await api.get(`/jobs/public/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  getPublicJobPosting: async (jobId: number): Promise<JobPosting> => {
    const response = await api.get(`/jobs/public/${jobId}`);
    return response.data;
  },

  // Assessment endpoints
  createJobAssessment: async (data: JobAssessmentRequest): Promise<JobAssessmentSummary> => {
    const response = await api.post('/assessments', data);
    return response.data;
  },

  getJobAssessments: async (jobId: number): Promise<JobAssessmentSummary[]> => {
    const response = await api.get(`/jobs/${jobId}/assessments`);
    return response.data;
  },

  getJobAssessmentDetails: async (jobId: number): Promise<JobAssessmentSummary[]> => {
    const response = await api.get(`/jobs/${jobId}/assessments`);
    return response.data;
  },

  deleteJobPosting: async (jobId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/jobs/recruiter/${jobId}`);
    return response.data;
  }
};

// Job Assessment API (Using stored job-specific assessment questions)
export const jobAssessmentAPI = {
  // Candidate endpoints - Use job assessment endpoints that return actual stored questions
  createAssessment: async (jobId: number, options?: { num_questions?: number; difficulty?: string }): Promise<JobAssessmentSession> => {
    const response = await api.post(`/job-assessments/create/${jobId}`, options || {});
    return response.data;
  },

  submitAssessment: async (jobId: number, assessmentId: string, answers: JobAssessmentAnswer[]): Promise<JobAssessmentResult> => {
    const response = await api.post(`/job-assessments/submit/${jobId}`, {
      assessment_id: assessmentId,
      assessment_answers: answers
    });
    return response.data;
  },

  // Recruiter endpoints
  getAssessmentScores: async (jobId: number): Promise<JobAssessmentScores> => {
    const response = await api.get(`/job-assessments/scores/${jobId}`);
    return response.data;
  }
};

// Candidate Application API
export const candidateApplicationAPI = {
  // Candidate endpoints
  applyForJob: async (data: CandidateApplicationRequest): Promise<CandidateSubmission> => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  getCandidateApplications: async (): Promise<CandidateSubmission[]> => {
    const response = await api.get('/applications/candidate');
    return response.data;
  },

  getCandidateLearningPath: async (submissionId: number): Promise<JobLearningPath> => {
    const response = await api.get(`/applications/candidate/${submissionId}/learning-path`);
    return response.data;
  },

  // Recruiter endpoints
  getCandidatesForJob: async (jobId: number): Promise<CandidateSubmission[]> => {
    const response = await api.get(`/applications/recruiter/job/${jobId}`);
    return response.data;
  },

  getAllCandidatesForRecruiter: async (): Promise<CandidateSubmission[]> => {
    const response = await api.get('/applications/recruiter');
    return response.data;
  },

  getQualifiedCandidatesForJob: async (jobId: number): Promise<CandidateSubmission[]> => {
    const response = await api.get(`/applications/recruiter/job/${jobId}/qualified`);
    return response.data;
  },

  updateApplicationStatus: async (
    submissionId: number, 
    status: ApplicationStatus
  ): Promise<CandidateSubmission> => {
    const response = await api.patch(
      `/applications/recruiter/${submissionId}/status?status=${status}`
    );
    return response.data;
  },

  addRecruiterFeedback: async (
    submissionId: number, 
    feedback: string
  ): Promise<CandidateSubmission> => {
    const response = await api.patch(
      `/applications/recruiter/${submissionId}/feedback?feedback=${encodeURIComponent(feedback)}`
    );
    return response.data;
  }
};

// Dashboard API
export const dashboardAPI = {
  getRecruiterStats: async (): Promise<RecruiterDashboardStats> => {
    // This would typically be a dedicated endpoint, but for now we'll aggregate data
    const [jobs, candidates] = await Promise.all([
      jobPostingAPI.getRecruiterJobPostings(),
      candidateApplicationAPI.getAllCandidatesForRecruiter()
    ]);

    const activeJobs = jobs.filter(job => job.isActive);
    const recentCandidates = candidates
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 10);
    
    const recentApplications = candidates.filter(candidate => {
      const submittedDate = new Date(candidate.submittedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return submittedDate >= weekAgo;
    }).length;

    const topPerformingJobs = jobs
      .sort((a, b) => b.totalApplications - a.totalApplications)
      .slice(0, 5);

    return {
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      totalApplications: candidates.length,
      recentApplications,
      averageApplicationsPerJob: jobs.length > 0 ? candidates.length / jobs.length : 0,
      topPerformingJobs,
      recentCandidates
    };
  },

  getCandidateStats: async (): Promise<CandidateDashboardStats> => {
    try {
      // Fetch data with individual error handling for better resilience
      let applications: CandidateSubmission[] = [];
      let activeJobs: JobPosting[] = [];

      try {
        applications = await candidateApplicationAPI.getCandidateApplications();
        console.log('📊 Dashboard API - Loaded applications:', applications.length);
      } catch (err) {
        console.error('📊 Dashboard API - Failed to load applications:', err);
        applications = [];
      }

      try {
        activeJobs = await jobPostingAPI.getAllActiveJobPostings();
        console.log('📊 Dashboard API - Loaded active jobs:', activeJobs.length);
      } catch (err) {
        console.error('📊 Dashboard API - Failed to load active jobs:', err);
        activeJobs = [];
      }

      const inProgressStatuses = [
        ApplicationStatus.LEARNING_PHASE,
        ApplicationStatus.ASSESSMENT_PHASE,
        ApplicationStatus.IN_REVIEW,
        ApplicationStatus.INTERVIEW_SCHEDULED
      ];

      const completedStatuses = [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.INTERVIEW_COMPLETED,
        ApplicationStatus.WITHDRAWN
      ];

      const inProgress = applications.filter(app => inProgressStatuses.includes(app.applicationStatus)).length;
      const completed = applications.filter(app => completedStatuses.includes(app.applicationStatus)).length;

      const scoresWithValues = applications
        .map(app => app.averageAssessmentScore)
        .filter(score => score !== undefined && score !== null) as number[];
      
      const averageScore = scoresWithValues.length > 0 
        ? scoresWithValues.reduce((sum, score) => sum + score, 0) / scoresWithValues.length
        : undefined;

      const recentApplications = applications
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 10);

      const recommendedJobs = activeJobs
        .sort((a, b) => (b.totalApplications || 0) - (a.totalApplications || 0))
        .slice(0, 6);

      console.log('📊 Dashboard API - Final stats:', {
        totalApplications: applications.length,
        inProgress,
        completed,
        recommendedJobsCount: recommendedJobs.length
      });

      return {
        totalApplications: applications.length,
        inProgress,
        completed,
        averageScore,
        recentApplications,
        recommendedJobs
      };
    } catch (error) {
      console.error('📊 Dashboard API - Critical error in getCandidateStats:', error);
      throw error;
    }
  }
};

// AI Integration API (through backend)
export const jobAIAPI = {
  extractSkillsAndGenerate: async (jobDescription: string) => {
    console.log('🔥 [FRONTEND] Starting AI analysis request');
    console.log('🔥 [FRONTEND] Job description length:', jobDescription.length);
    console.log('🔥 [FRONTEND] Making POST to /jobs/ai-analyze');

    try {
      const response = await api.post('/jobs/ai-analyze', jobDescription, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      console.log('🔥 [FRONTEND] Response received');
      console.log('🔥 [FRONTEND] Response status:', response.status);
      console.log('🔥 [FRONTEND] Response data:', response.data);

      return response.data;
    } catch (error: unknown) {
      console.error('❌ [FRONTEND] API call failed');
      console.error('❌ [FRONTEND] Error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const errorWithResponse = error as { response?: { status?: number; data?: unknown } };
        console.error('❌ [FRONTEND] Error response:', errorWithResponse.response);
        console.error('❌ [FRONTEND] Error status:', errorWithResponse.response?.status);
        console.error('❌ [FRONTEND] Error data:', errorWithResponse.response?.data);
      }
      throw error;
    }
  }
};