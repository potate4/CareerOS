import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Users, TrendingUp, Eye, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobPostingAPI, candidateApplicationAPI, dashboardAPI } from '../../services/jobPostingAPI';
import { JobPosting, CandidateSubmission, RecruiterDashboardStats, ApplicationStatus } from '../../types/jobPosting';
import  LoadingSpinner  from '../common/LoadingSpinner';
import  Alert  from '../common/Alert';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

interface RecruiterDashboardProps {
  jobId?: number; // Optional - if provided, show candidates for specific job
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<RecruiterDashboardStats | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<CandidateSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'candidates'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, jobPostings, candidates] = await Promise.all([
        dashboardAPI.getRecruiterStats(),
        jobPostingAPI.getRecruiterJobPostings(),
        candidateApplicationAPI.getAllCandidatesForRecruiter()
      ]);

      setStats(dashboardStats);
      setJobs(jobPostings);
      setRecentCandidates(candidates.slice(0, 10));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobId: number) => {
    try {
      await jobPostingAPI.toggleJobPostingStatus(jobId);
      await fetchDashboardData(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle job status');
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const colors = {
      [ApplicationStatus.APPLIED]: 'bg-blue-100 text-blue-800',
      [ApplicationStatus.IN_REVIEW]: 'bg-yellow-100 text-yellow-800',
      [ApplicationStatus.LEARNING_PHASE]: 'bg-purple-100 text-purple-800',
      [ApplicationStatus.ASSESSMENT_PHASE]: 'bg-indigo-100 text-indigo-800',
      [ApplicationStatus.INTERVIEW_SCHEDULED]: 'bg-green-100 text-green-800',
      [ApplicationStatus.INTERVIEW_COMPLETED]: 'bg-teal-100 text-teal-800',
      [ApplicationStatus.ACCEPTED]: 'bg-green-100 text-green-800',
      [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
      [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-6xl mx-auto p-6">
          <Alert type="error" message={error} />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your job postings and candidates</p>
        </div>
        <button
          onClick={() => navigate('/create-job-posting')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Job Posting
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentApplications}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Job Postings
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'candidates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Candidates
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Jobs */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Jobs</h3>
            <div className="space-y-3">
              {stats.topPerformingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.jobTitle}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{job.totalApplications}</p>
                    <p className="text-xs text-gray-500">applications</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Candidates */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Candidates</h3>
            <div className="space-y-3">
              {stats.recentCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{candidate.candidateName}</h4>
                    <p className="text-sm text-gray-600">{candidate.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.applicationStatus)}`}>
                      {candidate.applicationStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.jobTitle}</div>
                        <div className="text-sm text-gray-500">{job.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.totalApplications}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => alert(`View job details for job ID: ${job.id} (Feature coming soon)`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View job details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => alert(`Edit job posting for job ID: ${job.id} (Feature coming soon)`)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit job posting"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleJobStatus(job.id)}
                        className={`${job.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {job.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{candidate.candidateName}</div>
                        <div className="text-sm text-gray-500">{candidate.candidateEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{candidate.jobTitle}</div>
                        <div className="text-sm text-gray-500">{candidate.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.applicationStatus)}`}>
                        {candidate.applicationStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Learning: {Math.round(candidate.learningPathProgress)}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Assessments: {candidate.assessmentsCompleted}/{candidate.totalAssessments}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {candidate.averageAssessmentScore ? (
                        <div className="text-sm font-medium text-gray-900">
                          {Math.round(candidate.averageAssessmentScore)}%
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">N/A</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(candidate.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </AuthenticatedLayout>
  );
};