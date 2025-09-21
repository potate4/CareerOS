import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { jobPostingAPI, candidateApplicationAPI } from '../../services/jobPostingAPI';
import { JobPosting, JobPostingFilters, CandidateSubmission } from '../../types/jobPosting';
import { JobPostingCard } from '../job/JobPostingCard';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

export const JobBrowse: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<CandidateSubmission[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<JobPostingFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobsAndApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchTerm, filters]);

  const fetchJobsAndApplications = async () => {
    try {
      setLoading(true);
      const [jobsData, applicationsData] = await Promise.all([
        jobPostingAPI.getAllActiveJobPostings(),
        candidateApplicationAPI.getCandidateApplications().catch(() => [])
      ]);
      
      setJobs(jobsData);
      setApplications(applicationsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.jobTitle.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.jobDescription.toLowerCase().includes(searchLower) ||
        (job.requiredSkills && job.requiredSkills.toLowerCase().includes(searchLower)) ||
        (job.location && job.location.toLowerCase().includes(searchLower))
      );
    }

    // Experience level filter
    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      filtered = filtered.filter(job => filters.experienceLevel!.includes(job.experienceLevel));
    }

    // Job type filter
    if (filters.jobType && filters.jobType.length > 0) {
      filtered = filtered.filter(job => filters.jobType!.includes(job.jobType));
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location && job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Company filter
    if (filters.company) {
      filtered = filtered.filter(job => 
        job.company.toLowerCase().includes(filters.company!.toLowerCase())
      );
    }

    // Learning path filter
    if (filters.hasLearningPath !== undefined) {
      filtered = filtered.filter(job => job.hasLearningPath === filters.hasLearningPath);
    }

    // Assessment filter
    if (filters.hasAssessments !== undefined) {
      filtered = filtered.filter(job => job.hasAssessments === filters.hasAssessments);
    }

    setFilteredJobs(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleViewJob = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleApplyToJob = async (jobId: number) => {
    try {
      console.log('🔥 [JobBrowse] Applying to job:', jobId);
      await candidateApplicationAPI.applyForJob({ jobPostingId: jobId });
      console.log('✅ [JobBrowse] Application successful');
      await fetchJobsAndApplications(); // Refresh data
    } catch (err: any) {
      console.error('❌ [JobBrowse] Application failed:', err);
      setError(err.response?.data?.message || 'Failed to apply to job');
    }
  };

  const isJobApplied = (jobId: number): boolean => {
    return applications.some(app => app.jobPostingId === jobId);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
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

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Jobs</h1>
          <p className="text-slate-600">
            Discover opportunities with AI-powered learning paths and assessments
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-lg transition-all shadow-md"
            >
              Search
            </button>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-slate-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    multiple
                    value={filters.experienceLevel || []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, experienceLevel: values as any }));
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ENTRY_LEVEL">Entry Level</option>
                    <option value="JUNIOR">Junior</option>
                    <option value="MID_LEVEL">Mid Level</option>
                    <option value="SENIOR">Senior</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Job Type
                  </label>
                  <select
                    multiple
                    value={filters.jobType || []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, jobType: values as any }));
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasLearningPath || false}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasLearningPath: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Has Learning Path</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasAssessments || false}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasAssessments: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Has Assessment</span>
                </label>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
          <div className="text-sm text-slate-500">
            {applications.length} applications submitted
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert type="error" message={error} className="mb-6" />
        )}

        {/* Job Listings */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobPostingCard
                key={job.id}
                job={job}
                onViewDetails={handleViewJob}
                onApply={handleApplyToJob}
                isApplied={isJobApplied(job.id)}
                className="h-full"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-600">
              Try adjusting your search criteria or filters to find more opportunities.
            </p>
            {(searchTerm || Object.keys(filters).length > 0) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Clear Search and Filters
              </button>
            )}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};
