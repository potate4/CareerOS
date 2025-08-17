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
  Zap,
  MessageCircle,
  Brain,
  FileText,
  Upload
} from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { LearningPathResponse, LearningModule, ModuleStatus, DifficultyLevel, LearningStage } from '../../types/learningPath';
import LearningChat from './LearningChat';
import AssessmentModal from './AssessmentModal';

const CurrentStatus: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPathResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModuleForChat, setSelectedModuleForChat] = useState<LearningModule | null>(null);
  const [selectedModuleForAssessment, setSelectedModuleForAssessment] = useState<LearningModule | null>(null);

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

  const handleStartChat = (module: LearningModule) => {
    setSelectedModuleForChat(module);
  };

  const handleStartAssessment = (module: LearningModule) => {
    setSelectedModuleForAssessment(module);
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
        return 'bg-green-50 border-green-200 text-green-800';
      case ModuleStatus.IN_PROGRESS:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case ModuleStatus.NOT_STARTED:
        return 'bg-slate-50 border-slate-200 text-slate-600';
      case ModuleStatus.SKIPPED:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return 'bg-green-100 text-green-800';
      case DifficultyLevel.INTERMEDIATE:
        return 'bg-yellow-100 text-yellow-800';
      case DifficultyLevel.ADVANCED:
        return 'bg-orange-100 text-orange-800';
      case DifficultyLevel.EXPERT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStageColor = (stage: LearningStage) => {
    switch (stage) {
      case LearningStage.BEGINNER:
        return 'bg-green-100 text-green-800';
      case LearningStage.INTERMEDIATE:
        return 'bg-blue-100 text-blue-800';
      case LearningStage.ADVANCED:
        return 'bg-purple-100 text-purple-800';
      case LearningStage.EXPERT:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-600';
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

  if (error || !learningPath) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Target className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Active Learning Path</h3>
          <p className="text-slate-600 mb-6">{error || 'Generate a learning path to see your progress'}</p>
          <button 
            onClick={() => window.location.href = '/learning-path/generate'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            <Zap className="h-5 w-5" />
            Generate Learning Path
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Path Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{learningPath.careerGoal}</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(learningPath.currentStage)}`}>
                    {learningPath.currentStage}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{learningPath.estimatedCompletionWeeks} weeks estimated</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{learningPath.overallProgress?.toFixed(0) || 0}%</div>
              <div className="text-sm text-slate-600">Overall Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${learningPath.overallProgress || 0}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-xl font-bold text-green-600">
                  {learningPath.statistics?.completedModules || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-xl font-bold text-blue-600">
                  {learningPath.statistics?.inProgressModules || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Remaining</p>
                <p className="text-xl font-bold text-orange-600">
                  {learningPath.statistics?.notStartedModules || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Rating</p>
                <p className="text-xl font-bold text-purple-600">
                  {learningPath.statistics?.averageRating?.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Banner */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="h-6 w-6 text-cyan-600" />
            <h3 className="text-lg font-semibold text-slate-800">AI-Powered Learning Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-cyan-600" />
              <span className="text-slate-700">Chat with your learning materials</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-600" />
              <span className="text-slate-700">AI-generated assessments</span>
            </div>
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-cyan-600" />
              <span className="text-slate-700">Intelligent content indexing</span>
            </div>
          </div>
        </div>

        {/* Learning Modules */}
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-6">Learning Modules</h3>
          <div className="space-y-4">
            {learningPath.modules && learningPath.modules.length > 0 ? (
              learningPath.modules.map((module) => (
                <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-slate-800">{module.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(module.difficultyLevel)}`}>
                            {module.difficultyLevel}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(module.status)}`}>
                            {module.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-3">{module.description}</p>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{module.estimatedHours} hours</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{module.skillFocus}</span>
                          </div>
                          {module.userRating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{module.userRating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusIcon(module.status)}
                        <span className="text-2xl font-bold text-slate-700">
                          {module.progressPercentage || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${module.progressPercentage || 0}%` }}
                      />
                    </div>

                    {/* AI-Powered Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleStartChat(module)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-colors text-sm font-medium"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat with Materials
                      </button>

                      <button
                        onClick={() => handleStartAssessment(module)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors text-sm font-medium"
                      >
                        <Brain className="h-4 w-4" />
                        AI Assessment
                      </button>

                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                        <ExternalLink className="h-4 w-4" />
                        View Resources
                      </button>

                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                        <TrendingUp className="h-4 w-4" />
                        Update Progress
                      </button>
                    </div>

                    {/* Learning Objectives */}
                    {module.learningObjectives && module.learningObjectives.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <h5 className="text-sm font-semibold text-slate-700 mb-2">Learning Objectives:</h5>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {module.learningObjectives.slice(0, 3).map((objective, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                              <span>{objective}</span>
                            </li>
                          ))}
                          {module.learningObjectives.length > 3 && (
                            <li className="text-blue-600 font-medium">
                              +{module.learningObjectives.length - 3} more objectives
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Modules Available</h3>
                <p className="text-slate-600">Your learning path doesn't have any modules yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-800">Recommended Next Steps</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Continue with your current module or start the next one</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Use AI chat to clarify doubts and deepen understanding</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Take AI assessments to track your progress</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Upload additional learning materials for better personalization</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Modal */}
      {selectedModuleForChat && (
        <LearningChat
          moduleId={selectedModuleForChat.id}
          moduleName={selectedModuleForChat.title}
          isOpen={!!selectedModuleForChat}
          onClose={() => setSelectedModuleForChat(null)}
        />
      )}

      {/* AI Assessment Modal */}
      {selectedModuleForAssessment && (
        <AssessmentModal
          moduleId={selectedModuleForAssessment.id}
          moduleName={selectedModuleForAssessment.title}
          skillFocus={selectedModuleForAssessment.skillFocus}
          isOpen={!!selectedModuleForAssessment}
          onClose={() => setSelectedModuleForAssessment(null)}
        />
      )}
    </div>
  );
};

export default CurrentStatus; 