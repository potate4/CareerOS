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

  // Candidate gets candidate dashboard (prioritized first)
  if (hasRole(user.roles, 'candidate')) {
    return <Navigate to="/candidate-dashboard" replace />;
  }

  // Recruiter gets recruiter dashboard
  if (hasRole(user.roles, 'recruiter')) {
    return <Navigate to="/recruiter-dashboard" replace />;
  }

  // Admin gets AI services as their primary dashboard
  if (isAdmin(user.roles)) {
    return <Navigate to="/ai-services" replace />;
  }

  // Default fallback to candidate dashboard
  return <Navigate to="/candidate-dashboard" replace />;
};

export default RoleDashboardRedirect;

