import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { jobPostingAPI } from '../../services/jobPostingAPI';
import { JobPosting, JobPostingRequest, ExperienceLevel, JobType } from '../../types/jobPosting';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

export const EditJobPosting: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<JobPostingRequest>({
    jobTitle: '',
    company: '',
    jobDescription: '',
    requiredSkills: '',
    experienceLevel: ExperienceLevel.MID_LEVEL,
    location: '',
    jobType: JobType.FULL_TIME,
    salaryRange: '',
    generateLearningPath: false,
    generateAssessment: false
  });

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const jobResponse = await jobPostingAPI.getRecruiterJobPosting(parseInt(jobId!));
      setJob(jobResponse);
      
      // Populate form with existing data
      setFormData({
        jobTitle: jobResponse.jobTitle,
        company: jobResponse.company,
        jobDescription: jobResponse.jobDescription,
        requiredSkills: jobResponse.requiredSkills || '',
        experienceLevel: jobResponse.experienceLevel,
        location: jobResponse.location || '',
        jobType: jobResponse.jobType,
        salaryRange: jobResponse.salaryRange || '',
        generateLearningPath: false, // Don't regenerate by default
        generateAssessment: false // Don't regenerate by default
      });
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to load job details'
        : 'Failed to load job details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobId) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const updatedJob = await jobPostingAPI.updateJobPosting(parseInt(jobId), formData);
      setJob(updatedJob);
      setSuccess('Job posting updated successfully!');
      
      // Navigate back to job details after a short delay
      setTimeout(() => {
        navigate(`/job-details/${jobId}`);
      }, 1500);
      
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update job posting'
        : 'Failed to update job posting';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    navigate(`/job-details/${jobId}`);
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

  if (!job) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Alert type="error" message="Job posting not found" />
          <button
            onClick={goBack}
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
      <div className="max-w-4xl mx-auto p-6">
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
              <h1 className="text-2xl font-bold text-slate-900">Edit Job Posting</h1>
              <p className="text-slate-600 mt-1">Update your job posting details</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} className="mb-6" />
        )}
        {success && (
          <Alert type="success" message={success} className="mb-6" />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                required
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Tech Innovations Inc."
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. San Francisco, CA / Remote"
              />
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-slate-700 mb-2">
                Experience Level *
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                required
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={ExperienceLevel.ENTRY_LEVEL}>Entry Level</option>
                <option value={ExperienceLevel.JUNIOR}>Junior</option>
                <option value={ExperienceLevel.MID_LEVEL}>Mid Level</option>
                <option value={ExperienceLevel.SENIOR}>Senior</option>
                <option value={ExperienceLevel.EXPERT}>Expert</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-slate-700 mb-2">
                Job Type *
              </label>
              <select
                id="jobType"
                name="jobType"
                required
                value={formData.jobType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={JobType.FULL_TIME}>Full Time</option>
                <option value={JobType.PART_TIME}>Part Time</option>
                <option value={JobType.CONTRACT}>Contract</option>
                <option value={JobType.INTERNSHIP}>Internship</option>
                <option value={JobType.FREELANCE}>Freelance</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="md:col-span-2">
              <label htmlFor="salaryRange" className="block text-sm font-medium text-slate-700 mb-2">
                Salary Range
              </label>
              <input
                type="text"
                id="salaryRange"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. $80,000 - $120,000"
              />
            </div>

            {/* Job Description */}
            <div className="md:col-span-2">
              <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                required
                rows={8}
                value={formData.jobDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>

            {/* Required Skills */}
            <div className="md:col-span-2">
              <label htmlFor="requiredSkills" className="block text-sm font-medium text-slate-700 mb-2">
                Required Skills
              </label>
              <textarea
                id="requiredSkills"
                name="requiredSkills"
                rows={4}
                value={formData.requiredSkills}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List the key skills and qualifications required..."
              />
            </div>

            {/* AI Options */}
            <div className="md:col-span-2 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">AI Enhancement Options</h3>
              <p className="text-sm text-slate-600 mb-4">
                Note: Enabling these options will regenerate content, replacing existing learning paths and assessments.
              </p>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="generateLearningPath"
                    checked={formData.generateLearningPath}
                    onChange={handleCheckboxChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">
                    Regenerate AI Learning Path
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="generateAssessment"
                    checked={formData.generateAssessment}
                    onChange={handleCheckboxChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">
                    Regenerate AI Assessment
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Job Posting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
};
