import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MessageSquare, CheckCircle, XCircle, Clock, TrendingUp, User, Mail, Calendar } from 'lucide-react';
import { candidateApplicationAPI } from '../../services/jobPostingAPI';
import { CandidateSubmission, ApplicationStatus } from '../../types/jobPosting';
import  LoadingSpinner  from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

interface CandidateListViewProps {
  jobId?: number; // Optional - if provided, show candidates for specific job
}

export const CandidateListView: React.FC<CandidateListViewProps> = ({ jobId }) => {
  const [candidates, setCandidates] = useState<CandidateSubmission[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [scoreFilter, setScoreFilter] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'progress'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  useEffect(() => {
    filterAndSortCandidates();
  }, [candidates, searchTerm, statusFilter, scoreFilter, sortBy, sortOrder]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      let candidatesData;
      
      if (jobId) {
        candidatesData = await candidateApplicationAPI.getCandidatesForJob(jobId);
      } else {
        candidatesData = await candidateApplicationAPI.getAllCandidatesForRecruiter();
      }
      
      setCandidates(candidatesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCandidates = () => {
    let filtered = [...candidates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(candidate => candidate.applicationStatus === statusFilter);
    }

    // Score filter
    filtered = filtered.filter(candidate => {
      const score = candidate.averageAssessmentScore || 0;
      return score >= scoreFilter.min && score <= scoreFilter.max;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'score':
          comparison = (a.averageAssessmentScore || 0) - (b.averageAssessmentScore || 0);
          break;
        case 'date':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'progress':
          comparison = a.learningPathProgress - b.learningPathProgress;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredCandidates(filtered);
  };

  const handleStatusUpdate = async (submissionId: number, newStatus: ApplicationStatus) => {
    try {
      await candidateApplicationAPI.updateApplicationStatus(submissionId, newStatus);
      await fetchCandidates(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddFeedback = async (submissionId: number, feedback: string) => {
    try {
      await candidateApplicationAPI.addRecruiterFeedback(submissionId, feedback);
      await fetchCandidates(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add feedback');
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

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600 font-semibold';
    if (score >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const exportCandidates = () => {
    const csvContent = [
      ['Name', 'Email', 'Job Title', 'Status', 'Learning Progress', 'Assessment Score', 'Applied Date'].join(','),
      ...filteredCandidates.map(candidate => [
        candidate.candidateName,
        candidate.candidateEmail,
        candidate.jobTitle,
        candidate.applicationStatus,
        `${candidate.learningPathProgress}%`,
        candidate.averageAssessmentScore ? `${candidate.averageAssessmentScore}%` : 'N/A',
        new Date(candidate.submittedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates-${jobId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {jobId ? 'Job Candidates' : 'All Candidates'}
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportCandidates}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}

      {/* Filters */}
      <div className={`mb-6 bg-white p-4 rounded-lg shadow border transition-all ${showFilters ? 'block' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search candidates..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ApplicationStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Score Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score Range</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                value={scoreFilter.min}
                onChange={(e) => setScoreFilter(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Min"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                min="0"
                max="100"
                value={scoreFilter.max}
                onChange={(e) => setScoreFilter(prev => ({ ...prev, max: parseInt(e.target.value) || 100 }))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'progress')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date Applied</option>
                <option value="score">Assessment Score</option>
                <option value="progress">Learning Progress</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more candidates.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  {!jobId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                  )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.candidateName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {candidate.candidateEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    {!jobId && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.jobTitle}
                          </div>
                          <div className="text-sm text-gray-500">{candidate.company}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={candidate.applicationStatus}
                        onChange={(e) => handleStatusUpdate(candidate.id, e.target.value as ApplicationStatus)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(candidate.applicationStatus)}`}
                      >
                        {Object.values(ApplicationStatus).map(status => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <TrendingUp className="h-3 w-3 mr-1 text-purple-600" />
                          Learning: {Math.round(candidate.learningPathProgress)}%
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          Tests: {candidate.assessmentsCompleted}/{candidate.totalAssessments}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {candidate.averageAssessmentScore ? (
                        <span className={`text-sm font-medium ${getScoreColor(candidate.averageAssessmentScore)}`}>
                          {Math.round(candidate.averageAssessmentScore)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(candidate.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const feedback = prompt('Add feedback for this candidate:');
                            if (feedback) {
                              handleAddFeedback(candidate.id, feedback);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Add feedback"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(candidate.id, ApplicationStatus.ACCEPTED)}
                          className="text-green-600 hover:text-green-900"
                          title="Accept"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(candidate.id, ApplicationStatus.REJECTED)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
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