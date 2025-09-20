import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Star, 
  MessageSquare, 
  Save,
  CheckCircle,
  Clock,
  Play,
  Pause,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { LearningPathResponse, LearningModule, ModuleStatus, ModuleProgressRequest } from '../../types/learningPath';

const ProgressUpdate: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPathResponse | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progressData, setProgressData] = useState<ModuleProgressRequest>({
    moduleId: 0,
    progressPercentage: 0,
    status: ModuleStatus.NOT_STARTED,
    userRating: undefined,
    userFeedback: ''
  });

  useEffect(() => {
    fetchCurrentLearningPath();
  }, []);

  const fetchCurrentLearningPath = async () => {
    try {
      setLoading(true);
      const path = await learningPathAPI.getCurrentLearningPath();
      setLearningPath(path);
    } catch (err) {
      console.error('Failed to fetch learning path:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module: LearningModule) => {
    setSelectedModule(module);
    setProgressData({
      moduleId: module.id,
      progressPercentage: module.progressPercentage,
      status: module.status,
      userRating: module.userRating,
      userFeedback: module.userFeedback || ''
    });
  };

  const handleProgressChange = (value: number) => {
    setProgressData(prev => ({ ...prev, progressPercentage: value }));
    
    // Auto-update status based on progress
    if (value === 0) {
      setProgressData(prev => ({ ...prev, status: ModuleStatus.NOT_STARTED }));
    } else if (value === 100) {
      setProgressData(prev => ({ ...prev, status: ModuleStatus.COMPLETED }));
    } else {
      setProgressData(prev => ({ ...prev, status: ModuleStatus.IN_PROGRESS }));
    }
  };

  const handleStatusChange = (status: ModuleStatus) => {
    setProgressData(prev => ({ ...prev, status }));
    
    // Auto-update progress based on status
    if (status === ModuleStatus.COMPLETED) {
      setProgressData(prev => ({ ...prev, progressPercentage: 100 }));
    } else if (status === ModuleStatus.NOT_STARTED) {
      setProgressData(prev => ({ ...prev, progressPercentage: 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    setUpdating(true);
    try {
      await learningPathAPI.updateModuleProgress(progressData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Refresh the learning path data
      await fetchCurrentLearningPath();
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: ModuleStatus) => {
    switch (status) {
      case ModuleStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case ModuleStatus.IN_PROGRESS:
        return <Play className="h-5 w-5 text-blue-600" />;
      case ModuleStatus.NOT_STARTED:
        return <Clock className="h-5 w-5 text-slate-400" />;
      case ModuleStatus.SKIPPED:
        return <Pause className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: ModuleStatus) => {
    switch (status) {
      case ModuleStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ModuleStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ModuleStatus.NOT_STARTED:
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case ModuleStatus.SKIPPED:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Learning Path Found</h3>
          <p className="text-slate-600 mb-6">Generate a learning path to start updating progress.</p>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
            Generate New Path
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Update Progress</h2>
              <p className="text-slate-600">Track your learning journey and provide feedback</p>
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Progress updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Module</h3>
              
              <div className="space-y-3">
                {learningPath.modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleModuleSelect(module)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedModule?.id === module.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(module.status)}
                      <h4 className="font-medium text-slate-800">{module.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{module.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{module.skillFocus}</span>
                      <span className="text-sm font-medium text-slate-700">{module.progressPercentage}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Update Form */}
          <div className="lg:col-span-2">
            {selectedModule ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{selectedModule.title}</h3>
                    <p className="text-slate-600">{selectedModule.description}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Progress Slider */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Progress: {progressData.progressPercentage}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressData.progressPercentage}
                      onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Module Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.values(ModuleStatus).map((status) => (
                        <label
                          key={status}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            progressData.status === status
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={progressData.status === status}
                            onChange={() => handleStatusChange(status)}
                            className="sr-only"
                          />
                          {getStatusIcon(status)}
                          <span className="text-sm font-medium capitalize">
                            {status.replace('_', ' ').toLowerCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Rate this module (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setProgressData(prev => ({ ...prev, userRating: rating }))}
                          className={`p-2 rounded-lg transition-colors ${
                            progressData.userRating && progressData.userRating >= rating
                              ? 'text-yellow-500'
                              : 'text-slate-300 hover:text-yellow-400'
                          }`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                      <span className="text-sm text-slate-500 ml-2">
                        {progressData.userRating ? `${progressData.userRating}/5` : 'Not rated'}
                      </span>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Feedback (optional)
                    </label>
                    <textarea
                      value={progressData.userFeedback}
                      onChange={(e) => setProgressData(prev => ({ ...prev, userFeedback: e.target.value }))}
                      placeholder="Share your thoughts about this module..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleProgressChange(100)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProgressChange(0)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                      Reset Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(ModuleStatus.SKIPPED)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Pause className="h-4 w-4" />
                      Skip Module
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={updating}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all ${
                      updating
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    }`}
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update Progress
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <TrendingUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Select a Module</h3>
                  <p className="text-slate-600">Choose a module from the list to update its progress.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressUpdate; 