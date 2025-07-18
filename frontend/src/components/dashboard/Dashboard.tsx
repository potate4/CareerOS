import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

const Dashboard: React.FC = () => {
  const { user, isLoading, logout } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#6A89A7 ' }}>
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 mb-4" style={{ color: '#384959' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p style={{ color: '#384959' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#6A89A7 ' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#384959' }}>Access Denied</h2>
          <p style={{ color: '#384959' }}>Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#384959' }}>Dashboard</h1>
            <p className="mt-2" style={{ color: '#6A89A7' }}>Welcome back, {user?.firstName}!</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Information Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#384959' }}>User Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium" style={{ color: '#6A89A7' }}>Personal Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium" style={{ color: '#384959' }}>Name:</span>
                      <span className="text-sm" style={{ color: '#384959' }}>
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium" style={{ color: '#384959' }}>Username:</span>
                      <span className="text-sm" style={{ color: '#384959' }}>{user?.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium" style={{ color: '#384959' }}>Email:</span>
                      <span className="text-sm" style={{ color: '#384959' }}>{user?.email}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium" style={{ color: '#6A89A7' }}>Account Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium" style={{ color: '#384959' }}>User ID:</span>
                      <span className="text-sm" style={{ color: '#384959' }}>{user?.id}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: '#384959' }}>Roles:</span>
                      <div className="mt-1">
                        {user?.roles?.map((role, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
                            style={{ backgroundColor: '#88BDF2', color: '#384959' }}
                          >
                            {role}
                          </span>
                        )) || <span className="text-sm" style={{ color: '#6A89A7' }}>No roles assigned</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#384959' }}>Quick Stats</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#6A89A7 ' }}>
                  <div className="text-2xl font-bold" style={{ color: '#384959' }}>0</div>
                  <div className="text-sm" style={{ color: '#6A89A7' }}>AI Sessions</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#6A89A7 ' }}>
                  <div className="text-2xl font-bold" style={{ color: '#384959' }}>0</div>
                  <div className="text-sm" style={{ color: '#6A89A7' }}>Assessments</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#6A89A7 ' }}>
                  <div className="text-2xl font-bold" style={{ color: '#384959' }}>0</div>
                  <div className="text-sm" style={{ color: '#6A89A7' }}>Job Matches</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#6A89A7 ' }}>
                  <div className="text-2xl font-bold" style={{ color: '#384959' }}>0</div>
                  <div className="text-sm" style={{ color: '#6A89A7' }}>Resumes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#384959' }}>Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                className="px-4 py-3 rounded-md text-sm font-medium transition-colors text-white"
                style={{ backgroundColor: '#88BDF2' }}
              >
                Start AI Assessment
              </button>
              <button 
                className="px-4 py-3 rounded-md text-sm font-medium transition-colors text-white"
                style={{ backgroundColor: '#88BDF2' }}
              >
                Build Resume
              </button>
              <button 
                onClick={logout}
                className="px-4 py-3 rounded-md text-sm font-medium transition-colors text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: '#6A89A7' }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard; 