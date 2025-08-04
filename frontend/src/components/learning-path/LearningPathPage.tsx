import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Settings,
  Plus,
  Target,
  Clock,
  Award
} from 'lucide-react';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';
import GenerateLearningPath from './GenerateLearningPath';
import CurrentStatus from './CurrentStatus';
import ProgressUpdate from './ProgressUpdate';
import Statistics from './Statistics';

const LearningPathPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname;
    if (path.includes('/generate')) return 'generate';
    if (path.includes('/current')) return 'current';
    if (path.includes('/progress')) return 'progress';
    if (path.includes('/stats')) return 'stats';
    return 'generate';
  });

  const tabs = [
    {
      id: 'generate',
      name: 'Generate Path',
      icon: Plus,
      description: 'Create new learning path',
      path: '/learning-path/generate'
    },
    {
      id: 'current',
      name: 'Current Status',
      icon: Target,
      description: 'View current progress',
      path: '/learning-path/current'
    },
    {
      id: 'progress',
      name: 'Update Progress',
      icon: TrendingUp,
      description: 'Update module progress',
      path: '/learning-path/progress'
    },
    {
      id: 'stats',
      name: 'Statistics',
      icon: BarChart3,
      description: 'View detailed stats',
      path: '/learning-path/stats'
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      navigate(tab.path);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Learning Path</h1>
                <p className="text-slate-600 mt-1">Personalized AI-powered learning journey</p>
              </div>
            </div>
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Career Goal</p>
                    <p className="text-lg font-semibold text-slate-800">Full Stack Developer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Progress</p>
                    <p className="text-lg font-semibold text-slate-800">65%</p>
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
                    <p className="text-lg font-semibold text-slate-800">8 weeks</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Modules</p>
                    <p className="text-lg font-semibold text-slate-800">12/18</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex flex-wrap gap-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px]">
            <Routes>
              <Route path="/" element={<Navigate to="/learning-path/generate" replace />} />
              <Route path="/generate" element={<GenerateLearningPath />} />
              <Route path="/current" element={<CurrentStatus />} />
              <Route path="/progress" element={<ProgressUpdate />} />
              <Route path="/stats" element={<Statistics />} />
            </Routes>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default LearningPathPage; 