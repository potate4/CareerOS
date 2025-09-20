/**
 * Role-based access control utilities
 */

export type UserRole = 'candidate' | 'recruiter' | 'admin' | 'user';

export interface RolePermissions {
  canAccessInterviewSimulator: boolean;
  canAccessMindFlow: boolean;
  canAccessLearningPath: boolean;
  canAccessFuturecast: boolean;
  canAccessCandidateDashboard: boolean;
  canAccessJobBrowse: boolean;
  canAccessCreateJobPosting: boolean;
  canAccessRecruiterDashboard: boolean;
  canAccessCandidateManagement: boolean;
  canAccessDashboard: boolean;
  canAccessAIServices: boolean;
}

/**
 * Check if user has a specific role
 */
export const hasRole = (userRoles: string[], role: UserRole): boolean => {
  const roleMap: Record<UserRole, string> = {
    candidate: 'ROLE_CANDIDATE',
    recruiter: 'ROLE_RECRUITER', 
    admin: 'ROLE_ADMIN',
    user: 'ROLE_USER'
  };
  
  return userRoles.includes(roleMap[role]);
};

/**
 * Check if user is admin (can access everything)
 */
export const isAdmin = (userRoles: string[]): boolean => {
  return hasRole(userRoles, 'admin');
};

/**
 * Get user permissions based on roles
 */
export const getUserPermissions = (userRoles: string[]): RolePermissions => {
  const isAdminUser = isAdmin(userRoles);
  const isCandidate = hasRole(userRoles, 'candidate');
  const isRecruiter = hasRole(userRoles, 'recruiter');

  return {
    // Candidate features
    canAccessInterviewSimulator: isAdminUser || isCandidate,
    canAccessMindFlow: isAdminUser || isCandidate,
    canAccessLearningPath: isAdminUser || isCandidate,
    canAccessFuturecast: isAdminUser || isCandidate,
    canAccessCandidateDashboard: isAdminUser || isCandidate,
    canAccessJobBrowse: isAdminUser || isCandidate,
    
    // Recruiter features
    canAccessCreateJobPosting: isAdminUser || isRecruiter,
    canAccessRecruiterDashboard: isAdminUser || isRecruiter,
    canAccessCandidateManagement: isAdminUser || isRecruiter,
    
    // Common features
    canAccessDashboard: true, // Everyone can access dashboard
    
    // Admin-only features
    canAccessAIServices: isAdminUser, // Only admin can access AI services
  };
};

/**
 * Get navigation items based on user roles
 */
export const getNavigationItems = (userRoles: string[]) => {
  const permissions = getUserPermissions(userRoles);
  
  const allItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      description: 'Overview and analytics',
      permission: 'canAccessDashboard'
    },
    {
      name: 'Learning Path',
      href: '/learning-path',
      description: 'AI Learning Path Generator',
      permission: 'canAccessLearningPath'
    },
    {
      name: 'Interview Simulator',
      href: '/interview',
      description: 'AI Interview Simulator',
      permission: 'canAccessInterviewSimulator'
    },
    {
      name: 'FutureCast',
      href: '/futurecast',
      description: 'AI Career Path Simulator',
      permission: 'canAccessFuturecast'
    },
    {
      name: 'MindFlow',
      href: '/mindflow',
      description: 'AI Softskill Development Coach',
      permission: 'canAccessMindFlow'
    },
    {
      name: 'Candidate Dashboard',
      href: '/candidate-dashboard',
      description: 'View job applications and learning progress',
      permission: 'canAccessCandidateDashboard'
    },
    {
      name: 'Browse Jobs',
      href: '/jobs',
      description: 'Browse available job opportunities',
      permission: 'canAccessJobBrowse'
    },
    {
      name: 'Recruiter Dashboard',
      href: '/recruiter-dashboard',
      description: 'Manage job postings and candidates',
      permission: 'canAccessRecruiterDashboard'
    },
    {
      name: 'Create Job Posting',
      href: '/create-job-posting',
      description: 'Create new job posting with AI assistance',
      permission: 'canAccessCreateJobPosting'
    },
    {
      name: 'AI Services',
      href: '/ai-services',
      description: 'AI-powered career tools',
      permission: 'canAccessAIServices'
    }
  ];

  // Filter items based on permissions
  return allItems.filter(item => 
    permissions[item.permission as keyof RolePermissions]
  );
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (userRoles: string[], route: string): boolean => {
  const permissions = getUserPermissions(userRoles);
  
  // Route to permission mapping
  const routePermissions: Record<string, keyof RolePermissions> = {
    '/dashboard': 'canAccessDashboard',
    '/learning-path': 'canAccessLearningPath',
    '/interview': 'canAccessInterviewSimulator',
    '/futurecast': 'canAccessFuturecast',
    '/mindflow': 'canAccessMindFlow',
    '/candidate-dashboard': 'canAccessCandidateDashboard',
    '/jobs': 'canAccessJobBrowse',
    '/recruiter-dashboard': 'canAccessRecruiterDashboard',
    '/create-job-posting': 'canAccessCreateJobPosting',
    '/edit-job-posting': 'canAccessCreateJobPosting', // Same permission as create
    '/job-details': 'canAccessRecruiterDashboard', // Recruiter feature
    '/candidate-list': 'canAccessCandidateManagement',
    '/ai-services': 'canAccessAIServices',
  };

  // Find matching route (handle dynamic routes)
  const matchingPermission = Object.entries(routePermissions).find(([path]) => 
    route.startsWith(path)
  );

  if (matchingPermission) {
    return permissions[matchingPermission[1]];
  }

  // Default: allow access if no specific permission found
  return true;
};
