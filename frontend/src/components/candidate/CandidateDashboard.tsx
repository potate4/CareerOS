import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, Clock, Award, Search, MapPin, Building, ExternalLink } from 'lucide-react';
import { candidateApplicationAPI, jobPostingAPI, dashboardAPI } from '../../services/jobPostingAPI';
import { CandidateSubmission, JobPosting, CandidateDashboardStats, ApplicationStatus } from '../../types/jobPosting';
import  LoadingSpinner from '../common/LoadingSpinner';
import  Alert  from '../common/Alert';

export const CandidateDashboard: React.FC = () => {
  const [stats, setStats] = useState<CandidateDashboardStats | null>(null);
  const [applications, setApplications] = useState<CandidateSubmission[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'jobs'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, candidateApplications, availableJobs] = await Promise.all([
        dashboardAPI.getCandidateStats(),
        candidateApplicationAPI.getCandidateApplications(),
        jobPostingAPI.getAllActiveJobPostings()
      ]);

      setStats(dashboardStats);
      setApplications(candidateApplications);
      setRecommendedJobs(availableJobs.slice(0, 6)); // Show top 6 recommended jobs
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const handleViewJob = (jobId: number) => {
    window.location.href = `/jobs/${jobId}`;
  };

  const handleApplyToJob = async (jobId: number) => {
    try {
      await candidateApplicationAPI.applyForJob({ jobPostingId: jobId });
      await fetchDashboardData(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to apply to job');
    }
  };

  const handleViewApplication = (applicationId: number) => {
    window.location.href = `/applications/${applicationId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your applications and discover new opportunities</p>
        </div>
        <button
          onClick={() => window.location.href = '/jobs'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Search className="h-4 w-4 mr-2" />
          Browse Jobs
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageScore ? `${Math.round(stats.averageScore)}%` : 'N/A'}
                </p>
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
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Applications
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recommended Jobs
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <button
                onClick={() => setActiveTab('applications')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {applications.slice(0, 5).map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
                    <p className="text-sm text-gray-600">{application.company}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                        <div
                          className={`h-1.5 rounded-full ${getProgressColor(application.learningPathProgress)}`}
                          style={{ width: `${application.learningPathProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(application.learningPathProgress)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.applicationStatus)}`}>
                      {application.applicationStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Recommended Jobs */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
              <button
                onClick={() => setActiveTab('jobs')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recommendedJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{job.jobTitle}</h4>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Building className="h-3 w-3 mr-1" />
                        {job.company}
                      </p>
                      {job.location && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleViewJob(job.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Details"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learning Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{application.jobTitle}</div>
                        <div className="text-sm text-gray-500">{application.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.applicationStatus)}`}>
                        {application.applicationStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(application.learningPathProgress)}`}
                            style={{ width: `${application.learningPathProgress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(application.learningPathProgress)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.averageAssessmentScore ? (
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(application.averageAssessmentScore)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewApplication(application.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedJobs.map((job) => {
            const hasApplied = applications.some(app => app.jobPostingId === job.id);
            
            return (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.jobTitle}</h3>
                    <p className="text-gray-600 flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                    </p>
                    {job.location && (
                      <p className="text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {job.hasLearningPath && (
                      <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                        Learning Path
                      </div>
                    )}
                    {job.hasAssessments && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Assessment
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {job.jobDescription.substring(0, 150)}...
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {job.totalApplications} applications
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewJob(job.id)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    {hasApplied ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                        Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyToJob(job.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};