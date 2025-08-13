import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Star,
  Award,
  Target,
  CheckCircle,
  Play,
  Pause,
  AlertCircle,
  Activity,
  Zap,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { LearningPathResponse, ModuleStatus, DifficultyLevel } from '../../types/learningPath';

const Statistics: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPathResponse | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [path, pathStats] = await Promise.all([
        learningPathAPI.getCurrentLearningPath(),
        learningPathAPI.getLearningPathStats()
      ]);
      setLearningPath(path);
      setStats(pathStats);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'No active learning path found. Generate one to view statistics.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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
            <BarChart3 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Statistics Available</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
              Generate New Path
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { statistics } = learningPath;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Learning Statistics</h2>
                <p className="text-slate-600">Detailed analytics of your learning journey</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>
          
          {/* AI Generated Badge */}
          {learningPath.aiGenerated && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              <Zap className="h-4 w-4" />
              AI-Powered Learning Path
            </div>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Career Goal</p>
                <p className="text-lg font-semibold text-slate-800">{learningPath.careerGoal}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Overall Progress</p>
                <p className="text-lg font-semibold text-slate-800">{Math.round(learningPath.overallProgress || 0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Time Left</p>
                <p className="text-lg font-semibold text-slate-800">{learningPath.estimatedCompletionWeeks || 12} weeks</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-orange-100">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Rating</p>
                <p className="text-lg font-semibold text-slate-800">{(statistics?.averageRating || 0).toFixed(1)}/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Module Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Module Status</h3>
            
            {statistics && statistics.totalModules > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-slate-700">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(statistics.completedModules / statistics.totalModules) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{statistics.completedModules}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Play className="h-5 w-5 text-blue-600" />
                    <span className="text-slate-700">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(statistics.inProgressModules / statistics.totalModules) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{statistics.inProgressModules}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-700">Not Started</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-slate-400 h-2 rounded-full"
                        style={{ width: `${(statistics.notStartedModules / statistics.totalModules) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{statistics.notStartedModules}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <AlertCircle className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-600 text-sm">No modules available</p>
              </div>
            )}
          </div>

          {/* Time Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Time Analytics</h3>
            
            {statistics ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-slate-700">Total Estimated Hours</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-800">{statistics.totalEstimatedHours || 0}h</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-slate-700">Completed Hours</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-800">{statistics.completedHours || 0}h</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <span className="text-slate-700">Remaining Hours</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-800">
                    {(statistics.totalEstimatedHours || 0) - (statistics.completedHours || 0)}h
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <AlertCircle className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-600 text-sm">No time data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Module Analysis */}
        {learningPath.modules && learningPath.modules.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Module Analysis</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Module</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Progress</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Difficulty</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {learningPath.modules.map((module) => (
                    <tr key={module.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-slate-800">{module.title}</div>
                          <div className="text-sm text-slate-500">{module.skillFocus || 'General'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(module.status || ModuleStatus.NOT_STARTED)}
                          <span className="text-sm capitalize">
                            {(module.status || ModuleStatus.NOT_STARTED).replace('_', ' ').toLowerCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(module.progressPercentage || 0)}`}
                              style={{ width: `${module.progressPercentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-700">{module.progressPercentage || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficultyLevel || DifficultyLevel.BEGINNER)}`}>
                          {(module.difficultyLevel || DifficultyLevel.BEGINNER).toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {module.userRating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-slate-700">{module.userRating}/5</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Not rated</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-slate-700">{module.estimatedHours || 8}h</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                <AlertCircle className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Modules Available</h3>
              <p className="text-slate-600 text-sm">No learning modules have been created for this path yet.</p>
            </div>
          </div>
        )}

        {/* Performance Insights */}
        {statistics && statistics.totalModules > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-200">
                  <Zap className="h-5 w-5 text-blue-700" />
                </div>
                <h4 className="font-semibold text-slate-800">Learning Pace</h4>
              </div>
              <p className="text-slate-600 text-sm mb-2">You're progressing at a steady pace</p>
              <div className="text-2xl font-bold text-blue-700">
                {Math.round((statistics.completedModules / statistics.totalModules) * 100)}%
              </div>
              <p className="text-xs text-slate-500">completion rate</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-200">
                  <Award className="h-5 w-5 text-green-700" />
                </div>
                <h4 className="font-semibold text-slate-800">Quality Score</h4>
              </div>
              <p className="text-slate-600 text-sm mb-2">Based on your module ratings</p>
              <div className="text-2xl font-bold text-green-700">
                {(statistics.averageRating || 0).toFixed(1)}/5
              </div>
              <p className="text-xs text-slate-500">average rating</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-200">
                  <BookOpen className="h-5 w-5 text-purple-700" />
                </div>
                <h4 className="font-semibold text-slate-800">Time Efficiency</h4>
              </div>
              <p className="text-slate-600 text-sm mb-2">Hours completed vs estimated</p>
              <div className="text-2xl font-bold text-purple-700">
                {statistics.totalEstimatedHours > 0 ? 
                  Math.round((statistics.completedHours / statistics.totalEstimatedHours) * 100) : 0}%
              </div>
              <p className="text-xs text-slate-500">time efficiency</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Performance Data</h3>
            <p className="text-slate-600">Start learning to see your performance insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics; 