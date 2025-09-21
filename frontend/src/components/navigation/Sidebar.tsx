import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  ChevronLeft, 
  ChevronRight,
  Briefcase,
  Target,
  TrendingUp,
  FileText,
  Users,
  BookOpen,
  PlusCircle,
  UserCheck,
  ClipboardCheck,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { getNavigationItems } from '../../utils/roleUtils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  // Icon mapping for navigation items
  const iconMap: Record<string, any> = {
    'Learning Path': BookOpen,
    'AI Services': Brain,
    'Interview Simulator': Target,
    FutureCast: TrendingUp,
    MindFlow: Users,
    'Recruiter Dashboard': Briefcase,
    'Create Job Posting': PlusCircle,
    'Candidate Dashboard': UserCheck,
    'Browse Jobs': ClipboardCheck,
  };

  // Get navigation items based on user roles
  const navigationItems = getNavigationItems(user?.roles || []).map(item => ({
    ...item,
    icon: iconMap[item.name] || Home
  }));

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  return (
    <div 
      className={`h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out bg-gradient-to-b from-slate-800 to-slate-900 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-white">CareerOS</h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isAIFeature = ['Interview Simulator', 'MindFlow', 'AI Services', 'FutureCast'].includes(item.name);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  active
                    ? isAIFeature 
                      ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg'
                      : 'text-white bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg'
                    : isAIFeature
                      ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:bg-opacity-20'
                      : 'text-gray-300 hover:text-white hover:bg-slate-600 hover:bg-opacity-20'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    active ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      {isAIFeature && (
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>


    </div>
  );
};

export default Sidebar; 