import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Bell,
  Search
} from 'lucide-react';

const TopHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
<header className="h-16 flex items-center justify-end px-6 shadow-sm bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
  {/* Right side - Notifications and Profile */}
  <div className="flex items-center space-x-4">
    {/* Notifications */}
    <button className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
      <Bell size={20} />
    </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <div 
              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg"
            >
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-600">{user?.email}</p>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-slate-600 transition-transform ${
                showProfileMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <User size={16} className="mr-3" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <Settings size={16} className="mr-3" />
                Settings
              </Link>
              <hr className="my-1" />
              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogOut size={16} className="mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader; 