import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { canAccessRoute } from '../../utils/roleUtils';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * Component that protects routes based on user roles
 * Redirects to fallback path if user doesn't have permission
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/dashboard' 
}) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading while auth is being initialized
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If no user, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user can access current route
  const canAccess = canAccessRoute(user.roles, location.pathname);

  // If user cannot access route, redirect to fallback
  if (!canAccess) {
    console.warn(`User with roles [${user.roles.join(', ')}] attempted to access unauthorized route: ${location.pathname}`);
    return <Navigate to={fallbackPath} replace />;
  }

  // User has permission, render children
  return <>{children}</>;
};

export default RoleProtectedRoute;
