import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Users, BookOpen, FileText, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { jobPostingAPI } from '../../services/jobPostingAPI';
import { JobAssessmentSummary } from '../../types/jobPosting';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

interface JobPosting {
  id: number;
  jobTitle: string;
  company: string;
  jobDescription: string;
  requiredSkills: string;
  experienceLevel: string;
  location: string;
  jobType: string;
  salaryRange: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  recruiterName: string;
  recruiterEmail: string;
  totalApplications: number;
  hasLearningPath: boolean;
  hasAssessments: boolean;
}

interface LearningModule {
  id: number;
  moduleName: string;
  moduleDescription: string;
  estimatedHours: number;
  difficultyLevel: string;
  skillsCovered: string;
  prerequisites: string;
  orderIndex: number;
}

interface AssessmentQuestion {
  id: number;
  questionText: string;
  questionType: string;
  options: string;
  correctAnswer: string;
  explanation: string;
  points: number;
  orderIndex: number;
}

export const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [assessments, setAssessments] = useState<JobAssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'learning' | 'assessment'>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load job details
      const jobResponse = await jobPostingAPI.getJobPosting(parseInt(jobId!));
      setJob(jobResponse);

          // Load learning path if it exists
          if (jobResponse.hasLearningPath) {
            try {
              const learningResponse = await jobPostingAPI.getJobLearningPath(parseInt(jobId!));
              setLearningModules(learningResponse.modules || []);
            } catch (err) {
              console.error('Error loading learning path:', err);
            }
          }

          // Load assessments if they exist
          if (jobResponse.hasAssessments) {
            try {
              const assessmentResponse = await jobPostingAPI.getJobAssessmentDetails(parseInt(jobId!));
              setAssessments(assessmentResponse);
            } catch (err) {
              console.error('Error loading assessments:', err);
            }
          }
    } catch (err: any) {
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/recruiter-dashboard');
  };

  const handleEdit = () => {
    navigate(`/edit-job-posting/${jobId}`);
  };

  const handleToggleStatus = async () => {
    if (!job) return;
    
    try {
      const updatedJob = await jobPostingAPI.toggleJobPostingStatus(job.id);
      setJob(updatedJob);
      setSuccess(`Job posting ${updatedJob.isActive ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to toggle status'
        : 'Failed to toggle status';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    
    try {
      await jobPostingAPI.deleteJobPosting(job.id);
      navigate('/recruiter-dashboard');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete job posting'
        : 'Failed to delete job posting';
      setError(errorMessage);
      setShowDeleteConfirm(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !job) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Alert type="error" message={error || 'Job not found'} />
          <button
            onClick={goBack}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Success/Error Alerts */}
        {success && (
          <Alert type="success" message={success} className="mb-6" />
        )}
        {error && (
          <Alert type="error" message={error} className="mb-6" />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="mr-4 p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{job.jobTitle}</h1>
              <p className="text-slate-600 mt-1">{job.company}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {job.hasLearningPath && (
              <span className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
                <BookOpen className="h-4 w-4 mr-1" />
                Learning Path
              </span>
            )}
            {job.hasAssessments && (
              <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                <FileText className="h-4 w-4 mr-1" />
                Assessment
              </span>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
              <button
                onClick={handleToggleStatus}
                className={`flex items-center px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  job.isActive 
                    ? 'text-orange-700 bg-orange-100 hover:bg-orange-200' 
                    : 'text-green-700 bg-green-100 hover:bg-green-200'
                }`}
                title={job.isActive ? 'Deactivate job posting' : 'Activate job posting'}
              >
                {job.isActive ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                {job.isActive ? 'Deactivate' : 'Activate'}
              </button>
              
              <button
                onClick={handleEdit}
                className="flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                title="Edit job posting"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                title="Delete job posting"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Job Details
            </button>
            {job.hasLearningPath && (
              <button
                onClick={() => setActiveTab('learning')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'learning'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Learning Path ({learningModules.length} modules)
              </button>
            )}
            {job.hasAssessments && (
              <button
                onClick={() => setActiveTab('assessment')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assessment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Assessment ({assessments.length} assessments)
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Job Information</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                  <p className="mt-1">{job.experienceLevel.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Type</label>
                  <p className="mt-1">{job.jobType.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                  <p className="mt-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salaryRange || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applications</label>
                  <p className="mt-1 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {job.totalApplications} applications
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Job Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.jobDescription}</p>
            </div>

            {job.requiredSkills && (
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold mb-4">Required Skills</h3>
                <p className="text-gray-700">{job.requiredSkills}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'learning' && job.hasLearningPath && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Learning Path Modules</h3>
              {learningModules.length > 0 ? (
                <div className="space-y-4">
                  {learningModules.map((module, index) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {index + 1}. {module.moduleName}
                          </h4>
                          <p className="text-gray-600 mt-2">{module.moduleDescription}</p>
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {module.estimatedHours} hours
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {module.difficultyLevel}
                            </span>
                          </div>
                          {module.skillsCovered && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">Skills: </span>
                              <span className="text-sm text-gray-600">{module.skillsCovered}</span>
                            </div>
                          )}
                          {module.prerequisites && (
                            <div className="mt-1">
                              <span className="text-sm font-medium text-gray-700">Prerequisites: </span>
                              <span className="text-sm text-gray-600">{module.prerequisites}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Learning modules are being generated...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assessment' && job.hasAssessments && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Job Assessments</h3>
              {assessments.length > 0 ? (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div key={assessment.id} className="border border-slate-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-lg">{assessment.assessmentName}</h4>
                          {assessment.assessmentDescription && (
                            <p className="text-slate-600 mt-2">{assessment.assessmentDescription}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assessment.assessmentType === 'TECHNICAL_QUIZ' ? 'bg-blue-100 text-blue-800' :
                            assessment.assessmentType === 'CODING_CHALLENGE' ? 'bg-purple-100 text-purple-800' :
                            assessment.assessmentType === 'BEHAVIORAL_TEST' ? 'bg-green-100 text-green-800' :
                            assessment.assessmentType === 'SKILL_ASSESSMENT' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {assessment.assessmentType.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assessment.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                            assessment.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                            assessment.difficultyLevel === 'ADVANCED' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {assessment.difficultyLevel}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-slate-50 p-3 rounded">
                          <div className="font-medium text-slate-700">Questions</div>
                          <div className="text-xl font-bold text-slate-900">{assessment.totalQuestions}</div>
                        </div>
                        {assessment.timeLimitMinutes && (
                          <div className="bg-slate-50 p-3 rounded">
                            <div className="font-medium text-slate-700">Time Limit</div>
                            <div className="text-xl font-bold text-slate-900">{assessment.timeLimitMinutes}m</div>
                          </div>
                        )}
                        {assessment.passingScore && (
                          <div className="bg-slate-50 p-3 rounded">
                            <div className="font-medium text-slate-700">Passing Score</div>
                            <div className="text-xl font-bold text-slate-900">{assessment.passingScore}%</div>
                          </div>
                        )}
                        <div className="bg-slate-50 p-3 rounded">
                          <div className="font-medium text-slate-700">Submissions</div>
                          <div className="text-xl font-bold text-slate-900">{assessment.totalSubmissions}</div>
                        </div>
                      </div>
                      
                      {assessment.maxScore && (
                        <div className="mt-4 text-sm text-slate-600">
                          Maximum Score: {assessment.maxScore} points
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Assessment questions are being generated...</p>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Confirm Delete</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this job posting? This action cannot be undone.
                {job?.totalApplications && job.totalApplications > 0 && (
                  <span className="block mt-2 text-red-600 font-medium">
                    Warning: This job has {job.totalApplications} application(s). Deletion may not be allowed.
                  </span>
                )}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Delete Job Posting
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};