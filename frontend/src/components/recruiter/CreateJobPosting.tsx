import React, { useState } from 'react';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobPostingAPI, jobAIAPI } from '../../services/jobPostingAPI';
import { JobPostingRequest, ExperienceLevel, JobType } from '../../types/jobPosting';
import  LoadingSpinner  from '../common/LoadingSpinner';
import  Alert  from '../common/Alert';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

export const CreateJobPosting: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<JobPostingRequest>({
    jobTitle: '',
    company: '',
    jobDescription: '',
    requiredSkills: '',
    experienceLevel: ExperienceLevel.MID_LEVEL,
    location: '',
    jobType: JobType.FULL_TIME,
    salaryRange: '',
    generateLearningPath: true,
    generateAssessment: true
  });

  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState<any>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAIAnalysis = async () => {
    if (!formData.jobDescription || !formData.jobTitle) {
      setError('Please provide job title and description for AI analysis');
      return;
    }

    try {
      setAiAnalyzing(true);
      const analysis = await jobAIAPI.extractSkillsAndGenerate(formData.jobDescription);
      
      if (analysis.success) {
        setJobAnalysis(analysis);
        
        // Auto-populate required skills if extracted
        if (analysis.job_analysis?.technical_skills) {
          setFormData(prev => ({
            ...prev,
            requiredSkills: analysis.job_analysis.technical_skills.join(', ')
          }));
        }
      } else {
        setError('AI analysis failed: ' + (analysis.error || 'Unknown error'));
      }
    } catch (err: any) {
      setError('AI analysis failed: ' + (err.message || 'Network error'));
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobTitle || !formData.company || !formData.jobDescription) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await jobPostingAPI.createJobPosting(formData);
      setSuccess(true);
      
      // Redirect to recruiter dashboard after a delay
      setTimeout(() => {
        navigate('/recruiter-dashboard');
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/recruiter-dashboard');
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={goBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Job Posting</h1>
            <p className="text-gray-600 mt-1">Post a new job and generate learning paths for candidates</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}

      {success && (
        <div className="mb-6">
          <Alert 
            type="success" 
            message="Job posting created successfully! Redirecting to job details..." 
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your company name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Level *
                    </label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {Object.values(ExperienceLevel).map(level => (
                        <option key={level} value={level}>
                          {level.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type *
                    </label>
                    <select
                      id="jobType"
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {Object.values(JobType).map(type => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., San Francisco, Remote"
                    />
                  </div>

                  <div>
                    <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Salary Range
                    </label>
                    <input
                      type="text"
                      id="salaryRange"
                      name="salaryRange"
                      value={formData.salaryRange}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., $80k - $120k"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                AI Features
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="generateLearningPath"
                    name="generateLearningPath"
                    checked={formData.generateLearningPath}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="generateLearningPath" className="ml-2 text-sm text-gray-700">
                    Generate AI Learning Path for candidates
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="generateAssessment"
                    name="generateAssessment"
                    checked={formData.generateAssessment}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="generateAssessment" className="ml-2 text-sm text-gray-700">
                    Generate AI Assessment questions
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAIAnalysis}
                  disabled={aiAnalyzing || !formData.jobDescription}
                  className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  {aiAnalyzing ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Job with AI
                    </>
                  )}
                </button>

                {jobAnalysis && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">AI Analysis Results:</h4>
                    <div className="text-sm text-purple-800">
                      <p>✓ Learning path generated with {jobAnalysis.learning_path?.length || 0} modules</p>
                      <p>✓ Assessment created with {jobAnalysis.assessment?.length || 0} questions</p>
                      <p>✓ Skills and requirements extracted</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Job Description */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description *</h3>
              
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide a detailed job description including responsibilities, requirements, and what makes this role exciting..."
                required
              />
            </div>

            {/* Required Skills */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
              
              <textarea
                id="requiredSkills"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List the key skills required for this position (comma-separated)"
              />
              
              <p className="text-sm text-gray-500 mt-2">
                Tip: Use the AI analysis to automatically extract skills from your job description
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={goBack}
            className="mr-4 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Creating Job Posting...</span>
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4 mr-2" />
                Create Job Posting
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </AuthenticatedLayout>
  );
};