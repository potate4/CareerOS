import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Star,
  ExternalLink,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { LearningPathResponse, LearningModule, ModuleStatus, DifficultyLevel, LearningStage } from '../../types/learningPath';

const CurrentStatus: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPathResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentLearningPath();
  }, []);

  const fetchCurrentLearningPath = async () => {
    try {
      setLoading(true);
      const path = await learningPathAPI.getCurrentLearningPath();
      setLearningPath(path);
    } catch (err) {
      setError('No active learning path found. Generate one to get started!');
    } finally {
      setLoading(false);
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

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return 'bg-green-100 text-green-700';
      case DifficultyLevel.INTERMEDIATE:
        return 'bg-yellow-100 text-yellow-700';
      case DifficultyLevel.ADVANCED:
        return 'bg-orange-100 text-orange-700';
      case DifficultyLevel.EXPERT:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-slate-300';
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

  if (error || !learningPath) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Learning Path Found</h3>
          <p className="text-slate-600 mb-6">{error}</p>
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
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {learningPath.careerGoal}
              </h2>
              <p className="text-slate-600">
                Current Stage: <span className="font-semibold capitalize">{learningPath.currentStage.toLowerCase()}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-800">
                {Math.round(learningPath.overallProgress)}%
              </div>
              <div className="text-sm text-slate-600">Overall Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(learningPath.overallProgress)}`}
              style={{ width: `${learningPath.overallProgress}%` }}
            ></div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Modules</p>
                  <p className="text-lg font-semibold text-slate-800">{learningPath.statistics.totalModules}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-lg font-semibold text-slate-800">{learningPath.statistics.completedModules}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Time Left</p>
                  <p className="text-lg font-semibold text-slate-800">{learningPath.estimatedCompletionWeeks} weeks</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Star className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Rating</p>
                  <p className="text-lg font-semibold text-slate-800">{learningPath.statistics.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Learning Modules</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPath.modules.map((module) => (
              <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(module.status)}
                      <h4 className="text-lg font-semibold text-slate-800">{module.title}</h4>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{module.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficultyLevel)}`}>
                        {module.difficultyLevel.toLowerCase()}
                      </span>
                      <span className="text-xs text-slate-500">
                        {module.estimatedHours}h • {module.skillFocus}
                      </span>
                    </div>
                  </div>
                  
                  {module.userRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-slate-700">{module.userRating}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{module.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(module.progressPercentage)}`}
                      style={{ width: `${module.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(module.status)}`}>
                    {module.status.replace('_', ' ').toLowerCase()}
                  </span>
                  <span className="text-xs text-slate-500">Module {module.orderIndex}</span>
                </div>

                {/* Learning Resources */}
                {module.resources.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-slate-700">Resources:</h5>
                    <div className="space-y-2">
                      {module.resources.slice(0, 3).map((resource) => (
                        <div key={resource.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-slate-700 flex-1 truncate">{resource.title}</span>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                      {module.resources.length > 3 && (
                        <div className="text-xs text-slate-500 text-center">
                          +{module.resources.length - 3} more resources
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {module.status === ModuleStatus.NOT_STARTED && (
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Start Module
                    </button>
                  )}
                  {module.status === ModuleStatus.IN_PROGRESS && (
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Continue
                    </button>
                  )}
                  {module.status === ModuleStatus.COMPLETED && (
                    <button className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm">
                      Review
                    </button>
                  )}
                  <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentStatus; 