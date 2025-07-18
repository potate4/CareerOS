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
      name: 'AI Services',
      href: '/ai-services',
      icon: Brain,
      description: 'AI-powered career tools'
    },
    {
      name: 'Career Assessment',
      href: '/career-assessment',
      icon: Target,
      description: 'Evaluate your career path'
    },
    {
      name: 'Job Matching',
      href: '/job-matching',
      icon: Briefcase,
      description: 'Find your perfect job'
    },
    {
      name: 'Career Growth',
      href: '/career-growth',
      icon: TrendingUp,
      description: 'Plan your career advancement'
    },
    {
      name: 'Resume Builder',
      href: '/resume-builder',
      icon: FileText,
      description: 'Create professional resumes'
    },
    {
      name: 'Networking',
      href: '/networking',
      icon: Users,
      description: 'Connect with professionals'
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div 
      className={`h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ backgroundColor: '#384959' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4" style={{ backgroundColor: '#6A89A7' }}>
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
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor: active ? '#88BDF2' : 'transparent'
                }}
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