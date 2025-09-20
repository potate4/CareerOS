import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { hasRole, isAdmin } from '../../utils/roleUtils';

/**
 * Component that redirects users to their appropriate dashboard based on role
 */
const RoleDashboardRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  // If not authenticated, redirect to auth page
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin can access general dashboard
  if (isAdmin(user.roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Recruiter gets recruiter dashboard
  if (hasRole(user.roles, 'recruiter')) {
    return <Navigate to="/recruiter-dashboard" replace />;
  }

  // Candidate gets candidate dashboard
  if (hasRole(user.roles, 'candidate')) {
    return <Navigate to="/candidate-dashboard" replace />;
  }

  // Default fallback to general dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RoleDashboardRedirect;
