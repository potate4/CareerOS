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
  CandidateFilters,
  ApplicationStatus
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
    const response = await api.get(`/assessments/job/${jobId}`);
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
  getCandidatesForJob: async (jobId: number, filters?: CandidateFilters): Promise<CandidateSubmission[]> => {
    const response = await api.get(`/applications/recruiter/job/${jobId}`);
    return response.data;
  },

  getAllCandidatesForRecruiter: async (filters?: CandidateFilters): Promise<CandidateSubmission[]> => {
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
    const [applications, activeJobs] = await Promise.all([
      candidateApplicationAPI.getCandidateApplications(),
      jobPostingAPI.getAllActiveJobPostings()
    ]);

    const inProgress = applications.filter(app => 
      app.applicationStatus === ApplicationStatus.LEARNING_PHASE ||
      app.applicationStatus === ApplicationStatus.ASSESSMENT_PHASE ||
      app.applicationStatus === ApplicationStatus.IN_REVIEW
    ).length;

    const completed = applications.filter(app => 
      app.applicationStatus === ApplicationStatus.ACCEPTED ||
      app.applicationStatus === ApplicationStatus.REJECTED ||
      app.applicationStatus === ApplicationStatus.INTERVIEW_COMPLETED
    ).length;

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
      .sort((a, b) => b.totalApplications - a.totalApplications)
      .slice(0, 6);

    return {
      totalApplications: applications.length,
      inProgress,
      completed,
      averageScore,
      recentApplications,
      recommendedJobs
    };
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
    } catch (error: any) {
      console.error('❌ [FRONTEND] API call failed');
      console.error('❌ [FRONTEND] Error:', error);
      console.error('❌ [FRONTEND] Error response:', error.response);
      console.error('❌ [FRONTEND] Error status:', error.response?.status);
      console.error('❌ [FRONTEND] Error data:', error.response?.data);
      throw error;
    }
  }
};