import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Target, Clock, Calendar, MessageCircle, Brain, Trash2 } from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { LearningPath, LearningModule } from '../../types/learningPath';
import LearningChat from './LearningChat';
import AssessmentModal from './AssessmentModal';

const AllLearningPaths: React.FC = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<number>>(new Set());
  const [selectedModuleForChat, setSelectedModuleForChat] = useState<LearningModule | null>(null);
  const [selectedModuleForAssessment, setSelectedModuleForAssessment] = useState<LearningModule | null>(null);
  const [loadingModules, setLoadingModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchAllLearningPaths();
  }, []);

  const fetchAllLearningPaths = async () => {
    try {
      setLoading(true);
      // Just fetch learning paths without modules to avoid N+1 queries
      const paths = await learningPathAPI.getAllLearningPaths();
      setLearningPaths(paths);
      // Auto-expand the active learning path
      const activePath = paths.find(path => path.isActive);
      if (activePath) {
        setExpandedPaths(new Set([activePath.id]));
        // Load modules for the active path
        await loadModulesForPath(activePath.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch learning paths');
    } finally {
      setLoading(false);
    }
  };

  const loadModulesForPath = async (pathId: number) => {
    try {
      setLoadingModules(prev => new Set(prev).add(pathId));
      const pathWithModules = await learningPathAPI.getLearningPathModules(pathId);
      
      // Update the learning path with modules
      setLearningPaths(prev => prev.map(path => 
        path.id === pathId ? pathWithModules : path
      ));
    } catch (err: any) {
      console.error('Failed to load modules for path:', pathId, err);
    } finally {
      setLoadingModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(pathId);
        return newSet;
      });
    }
  };

  const togglePathExpansion = async (pathId: number) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(pathId)) {
      // Collapse the path
      newExpanded.delete(pathId);
    } else {
      // Expand the path and load modules if not already loaded
      newExpanded.add(pathId);
      const path = learningPaths.find(p => p.id === pathId);
      if (path && (!path.modules || path.modules.length === 0)) {
        await loadModulesForPath(pathId);
      }
    }
    setExpandedPaths(newExpanded);
  };

  const handleStartChat = (module: LearningModule) => {
    setSelectedModuleForChat(module);
  };

  const handleStartAssessment = (module: LearningModule) => {
    setSelectedModuleForAssessment(module);
  };

  const handleDeactivatePath = async (pathId: number) => {
    try {
      await learningPathAPI.deactivateLearningPath();
      // Refresh the list
      fetchAllLearningPaths();
    } catch (err: any) {
      console.error('Failed to deactivate learning path:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <BookOpen className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">{error}</p>
        </div>
        <button
          onClick={fetchAllLearningPaths}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (learningPaths.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600 mb-4">
          <BookOpen className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">No learning paths found</p>
          <p className="text-sm">Create your first learning path to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">All Learning Paths</h2>
          <p className="text-slate-600 mt-1">
            {learningPaths.length} learning path{learningPaths.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            Active: {learningPaths.filter(p => p.isActive).length}
          </span>
        </div>
      </div>

      {/* Learning Paths List */}
      <div className="space-y-4">
        {learningPaths.map((path) => (
          <div
            key={path.id}
            className={`bg-white rounded-xl border transition-all duration-200 ${
              path.isActive 
                ? 'border-blue-200 shadow-md' 
                : 'border-slate-200 shadow-sm'
            }`}
          >
            {/* Path Header */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                {/* Learning Path Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{path.careerGoal}</h3>
                    {path.isActive && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {path.experienceLevel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {path.learningPace} Pace
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(path.createdAt).toLocaleDateString()}
                    </span>
                    {path.modules && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {path.modules.length} modules
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePathExpansion(path.id)}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {expandedPaths.has(path.id) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                  
                  {path.isActive && (
                    <button
                      onClick={() => handleDeactivatePath(path.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deactivate path"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expandable Modules Section */}
            {expandedPaths.has(path.id) && (
              <div className="border-t border-slate-100 bg-slate-50 rounded-b-xl">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-slate-600" />
                    Learning Modules
                  </h4>
                  
                  {loadingModules.has(path.id) ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-slate-600">Loading modules...</span>
                    </div>
                  ) : path.modules && path.modules.length > 0 ? (
                    <div className="grid gap-4">
                      {path.modules.map((module) => (
                        <div
                          key={module.id}
                          className="bg-white rounded-lg border border-slate-200 p-4"
                        >
                          {/* Module content */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="font-medium text-slate-800">{module.title}</h5>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                  Module {module.orderIndex}
                                </span>
                              </div>
                              
                              <p className="text-sm text-slate-600 mb-3">{module.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(module.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Module Actions */}
                          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => handleStartChat(module)}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Chat
                            </button>
                            
                            <button
                              onClick={() => handleStartAssessment(module)}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Brain className="h-4 w-4" />
                              Assessment
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                      <p>No modules found for this learning path</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Modal */}
      {selectedModuleForChat && (
        <LearningChat
          moduleId={selectedModuleForChat.id}
          moduleName={selectedModuleForChat.title}
          isOpen={!!selectedModuleForChat}
          onClose={() => setSelectedModuleForChat(null)}
        />
      )}

      {/* Assessment Modal */}
      {selectedModuleForAssessment && (
        <AssessmentModal
          moduleId={selectedModuleForAssessment.id}
          moduleName={selectedModuleForAssessment.title}
          skillFocus="General Learning"
          isOpen={!!selectedModuleForAssessment}
          onClose={() => setSelectedModuleForAssessment(null)}
        />
      )}
    </div>
  );
};

export default AllLearningPaths; 