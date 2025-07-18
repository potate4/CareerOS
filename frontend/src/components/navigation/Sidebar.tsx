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
  Users
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      name: 'LifeScript',
      href: '/lifescript',
      icon: Home,
      description: 'AI Journaling and Reflection'
    },
    {
      name: 'AI Services',
      href: '/ai-services',
      icon: Brain,
      description: 'AI-powered career tools'
    },
    {
      name: 'Interview Simulator',
      href: '/interview',
      icon: Target,
      description: 'AI Interview Simulator'
    },
    {
      name: 'Learning Flow',
      href: '/learning',
      icon: Briefcase,
      description: 'AI Learning Path Generator'
    },
    {
      name: 'FutureCast',
      href: '/futurecast',
      icon: TrendingUp,
      description: 'AI Career Path Simulator'
    },
    {
      name: 'SkillForge',
      href: '/skillforge',
      icon: FileText,
      description: 'Gamified AI Skill Development'
    },
    {
      name: 'MindFlow',
      href: '/mindflow',
      icon: Users,
      description: 'AI Softskill Development Coach'
    },
    {
      name: 'Job Posting',
      href: '/posting',
      icon: FileText,
      description: 'Gamified AI Skill Development'
    },
    {
      name: 'Candidate Matching',
      href: '/matching',
      icon: Users,
      description: 'AI Softskill Development Coach'
    },
    {
      name: 'Assesment Creator',
      href: '/assesment',
      icon: FileText,
      description: 'Sets up interview questions and sends them to candidates'
    },
    {
      name: 'Interview Evaluation',
      href: '/evaluation',
      icon: Users,
      description: 'Evaluates interview performance and provides feedback'
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div 
      className={`h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out bg-slate-800 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-slate-600">
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
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  active
                    ? 'text-white bg-slate-600'
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
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
                    <div className="text-sm font-medium">{item.name}</div>
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