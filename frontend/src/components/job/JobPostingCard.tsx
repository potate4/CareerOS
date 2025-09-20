import React from 'react';
import { JobPosting, ExperienceLevel, JobType } from '../../types/jobPosting';
import { MapPin, Building, DollarSign, Clock, Users, BookOpen, FileText, Calendar } from 'lucide-react';

interface JobPostingCardProps {
  job: JobPosting;
  onViewDetails?: (jobId: number) => void;
  onApply?: (jobId: number) => void;
  showActions?: boolean;
  isApplied?: boolean;
  className?: string;
}

export const JobPostingCard: React.FC<JobPostingCardProps> = ({
  job,
  onViewDetails,
  onApply,
  showActions = true,
  isApplied = false,
  className = ''
}) => {
  const formatExperienceLevel = (level: ExperienceLevel): string => {
    return level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatJobType = (type: JobType): string => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{job.jobTitle}</h3>
            <div className="flex items-center text-slate-600 mb-2">
              <Building className="h-4 w-4 mr-2" />
              <span className="font-medium">{job.company}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatJobType(job.jobType)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Posted {formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Status and Features */}
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              {job.hasLearningPath && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Learning Path
                </span>
              )}
              {job.hasAssessments && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  <FileText className="h-3 w-3 mr-1" />
                  Assessment
                </span>
              )}
            </div>
            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
              job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {job.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm font-medium text-slate-700">Experience Level:</span>
            <p className="text-sm text-slate-600">{formatExperienceLevel(job.experienceLevel)}</p>
          </div>
          {job.salaryRange && (
            <div>
              <span className="text-sm font-medium text-slate-700">Salary:</span>
              <p className="text-sm text-slate-600 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                {job.salaryRange}
              </p>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div className="mb-4">
          <p className="text-sm text-slate-700 line-clamp-3">
            {job.jobDescription.length > 200 
              ? `${job.jobDescription.substring(0, 200)}...`
              : job.jobDescription
            }
          </p>
        </div>

        {/* Skills */}
        {job.requiredSkills && (
          <div className="mb-4">
            <span className="text-sm font-medium text-slate-700">Required Skills:</span>
            <p className="text-sm text-slate-600 mt-1">{job.requiredSkills}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center text-sm text-slate-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{job.totalApplications} applications</span>
          </div>
          
          {showActions && (
            <div className="flex space-x-3">
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(job.id)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  View Details
                </button>
              )}
              {onApply && !isApplied && (
                <button
                  onClick={() => onApply(job.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Apply Now
                </button>
              )}
              {isApplied && (
                <span className="px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-md">
                  Applied
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

