import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  BookOpen, 
  FileText,
  Calendar,
  Building,
  Award,
  PlayCircle,
  CheckCircle
} from 'lucide-react';
import { jobPostingAPI, candidateApplicationAPI } from '../../services/jobPostingAPI';
import { JobPosting, JobLearningPath, JobAssessmentSummary } from '../../types/jobPosting';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

export const JobDetailedView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [learningPath, setLearningPath] = useState<JobLearningPath | null>(null);
  const [assessments, setAssessments] = useState<JobAssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'assessment'>('overview');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

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
      const jobResponse = await jobPostingAPI.getPublicJobPosting(parseInt(jobId!));
      setJob(jobResponse);

      // Load learning path if available
      if (jobResponse.hasLearningPath) {
        try {
          const learningResponse = await jobPostingAPI.getJobLearningPath(parseInt(jobId!));
          setLearningPath(learningResponse);
        } catch (err) {
          console.error('Error loading learning path:', err);
        }
      }

      // Load assessments if available
      if (jobResponse.hasAssessments) {
        try {
          // First try to use assessments from the job response
          if (jobResponse.assessments && jobResponse.assessments.length > 0) {
            setAssessments(jobResponse.assessments);
          } else {
            // Fallback to separate API call
            const assessmentResponse = await jobPostingAPI.getJobAssessments(parseInt(jobId!));
            setAssessments(assessmentResponse);
          }
        } catch (err) {
          console.error('Error loading assessments:', err);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? (err as { message: string }).message 
        : 'Failed to load job details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToJob = async () => {
    if (!job || applying) return;
    
    try {
      console.log('🔥 Applying to job:', job.id);
      setApplying(true);
      await candidateApplicationAPI.applyForJob({ jobPostingId: job.id });
      setApplied(true);
      console.log('✅ Application successful');
      // Refresh job data to update application count
      await loadJobDetails();
    } catch (err: unknown) {
      console.error('❌ Application failed:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to apply to job'
        : 'Failed to apply to job';
      setError(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = () => {
    // TODO: Implement save job functionality
    alert('Save job functionality coming soon!');
  };

  const handleTakeAssessment = () => {
    if (!job) return;
    console.log('🔥 Navigating to assessment for job:', job.id);
    navigate(`/job-assessment/${job.id}`);
  };

  const formatExperienceLevel = (level: string): string => {
    return level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatJobType = (type: string): string => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors = {
      'BEGINNER': 'bg-green-100 text-green-800',
      'INTERMEDIATE': 'bg-yellow-100 text-yellow-800',
      'ADVANCED': 'bg-orange-100 text-orange-800',
      'EXPERT': 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const getAssessmentTypeColor = (type: string): string => {
    const colors = {
      'TECHNICAL_QUIZ': 'bg-blue-100 text-blue-800',
      'CODING_CHALLENGE': 'bg-purple-100 text-purple-800',
      'BEHAVIORAL_TEST': 'bg-green-100 text-green-800',
      'SKILL_ASSESSMENT': 'bg-indigo-100 text-indigo-800',
      'MIXED': 'bg-slate-100 text-slate-800'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-800';
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
            onClick={() => navigate(-1)}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{job.jobTitle}</h1>
              <div className="flex items-center space-x-4 mt-2 text-slate-600">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  <span className="font-medium">{job.company}</span>
                </div>
                {job.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {job.hasLearningPath && (
              <span className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
                <BookOpen className="h-4 w-4 mr-1" />
                Learning Path Available
              </span>
            )}
            {job.hasAssessments && (
              <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                <FileText className="h-4 w-4 mr-1" />
                Assessment Required
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-slate-600">Job Type</p>
                <p className="font-semibold text-slate-900">{formatJobType(job.jobType)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <Award className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-slate-600">Experience</p>
                <p className="font-semibold text-slate-900">{formatExperienceLevel(job.experienceLevel)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-slate-600">Salary</p>
                <p className="font-semibold text-slate-900">{job.salaryRange || 'Not specified'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-slate-600">Applications</p>
                <p className="font-semibold text-slate-900">{job.totalApplications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Job Overview
            </button>
            {job.hasLearningPath && (
              <button
                onClick={() => setActiveTab('learning')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'learning'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Learning Path ({learningPath?.modules?.length || 0} modules)
              </button>
            )}
            {job.hasAssessments && (
              <button
                onClick={() => setActiveTab('assessment')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assessment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Assessments ({assessments.length})
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Job Description</h3>
              <div className="prose max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap">{job.jobDescription}</p>
              </div>
            </div>

            {job.requiredSkills && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Required Skills</h3>
                <p className="text-slate-700">{job.requiredSkills}</p>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">What We Offer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.hasLearningPath && (
                  <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600 mr-3 mt-1" />
                    <div>
                      <h4 className="font-medium text-purple-900">Personalized Learning Path</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        AI-generated learning modules tailored to this role to help you succeed.
                      </p>
                    </div>
                  </div>
                )}
                {job.hasAssessments && (
                  <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-900">Skills Assessment</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Demonstrate your capabilities through targeted assessments.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'learning' && job.hasLearningPath && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Learning Path</h3>
                  <p className="text-slate-600 mt-1">
                    Complete these modules to build the skills needed for this role
                  </p>
                </div>
                {learningPath && (
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Generated by AI</p>
                    <p className="text-xs text-slate-500">
                      Estimated {learningPath.modules?.reduce((total, module) => total + (module.estimatedHours || 0), 0)} hours
                    </p>
                  </div>
                )}
              </div>

              {learningPath?.modules && learningPath.modules.length > 0 ? (
                <div className="space-y-4">
                  {learningPath.modules
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((module, index) => (
                    <div key={module.id} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-2">{module.moduleName}</h4>
                            <p className="text-slate-700 mb-3">{module.moduleDescription}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                              {module.estimatedHours && (
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {module.estimatedHours} hours
                                </span>
                              )}
                              {module.difficultyLevel && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficultyLevel)}`}>
                                  {module.difficultyLevel.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              )}
                            </div>

                            {module.skillsCovered && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-slate-700">Skills Covered: </span>
                                <span className="text-sm text-slate-600">{module.skillsCovered}</span>
                              </div>
                            )}

                            {module.prerequisites && (
                              <div>
                                <span className="text-sm font-medium text-slate-700">Prerequisites: </span>
                                <span className="text-sm text-slate-600">{module.prerequisites}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start Module
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <p>Learning modules are being generated...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assessment' && job.hasAssessments && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Skills Assessments</h3>
                  <p className="text-slate-600 mt-1">
                    Complete these assessments to demonstrate your qualifications
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">{assessments.length} assessments</p>
                </div>
              </div>

              {assessments.length > 0 ? (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div key={assessment.id} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="font-semibold text-slate-900">{assessment.assessmentName}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAssessmentTypeColor(assessment.assessmentType)}`}>
                              {assessment.assessmentType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assessment.difficultyLevel)}`}>
                              {assessment.difficultyLevel.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>

                          {assessment.assessmentDescription && (
                            <p className="text-slate-700 mb-3">{assessment.assessmentDescription}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                            <div>
                              <span className="font-medium">Questions:</span>
                              <p>{assessment.totalQuestions}</p>
                            </div>
                            {assessment.timeLimitMinutes && (
                              <div>
                                <span className="font-medium">Time Limit:</span>
                                <p>{assessment.timeLimitMinutes} minutes</p>
                              </div>
                            )}
                            {assessment.passingScore && (
                              <div>
                                <span className="font-medium">Passing Score:</span>
                                <p>{assessment.passingScore}%</p>
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Submissions:</span>
                              <p>{assessment.totalSubmissions}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <button 
                            onClick={handleTakeAssessment}
                            className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Take Assessment
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <p>Assessments are being generated...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apply Section */}
        <div className="bg-white p-6 rounded-lg border mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Ready to Apply?</h3>
              <p className="text-slate-600 mt-1">
                Join {job.totalApplications} other candidates who have applied for this position.
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleSaveJob}
                className="px-6 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Save Job
              </button>
              {applied ? (
                <div className="flex items-center px-6 py-3 text-sm font-medium text-green-800 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Applied Successfully
                </div>
              ) : (
                <button 
                  onClick={handleApplyToJob}
                  disabled={applying}
                  className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
