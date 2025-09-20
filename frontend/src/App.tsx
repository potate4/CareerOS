import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';
import RoleDashboardRedirect from './components/common/RoleDashboardRedirect';
import Dashboard from './components/dashboard/Dashboard';
import AuthPage from './components/auth/AuthPage';
import AIServicesPage from './components/ai/AIServicesPage';
import InterviewSimulatorPage from './features/interview/components/InterviewSimulatorPage';

import FuturecastPage from './features/futurecast/components/FuturecastPage';

import LearningPathPage from './components/learning-path/LearningPathPage';
import MindFlowPage from './features/mindflow/components/MindFlowPage';


import { CandidateDashboard } from './components/candidate/CandidateDashboard';
import { JobBrowse } from './components/candidate/JobBrowse';
import { JobDetailedView } from './components/job/JobDetailedView';
import { JobAssessment } from './components/assessment/JobAssessment';
import { CreateJobPosting } from './components/recruiter/CreateJobPosting';
import { EditJobPosting } from './components/recruiter/EditJobPosting';
import { CandidateListView } from './components/recruiter/CandidateListView';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { JobDetails } from './components/recruiter/JobDetails';

import './App.css';

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai-services" 
        element={
          <RoleProtectedRoute>
            <AIServicesPage />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/interview" 
        element={
          <ProtectedRoute>
            <InterviewSimulatorPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mindflow" 
        element={
          <ProtectedRoute>
            <MindFlowPage />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/futurecast"
        element={
          <ProtectedRoute>
            <FuturecastPage />
          </ProtectedRoute>
        }
        />

      <Route 
        path="/learning-path/*" 
        element={
          <ProtectedRoute>
            <LearningPathPage />
          </ProtectedRoute>
        } 

      />
      <Route 
        path="/candidate-dashboard" 
        element={
          <ProtectedRoute>
            <CandidateDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-job-posting" 
        element={
          <ProtectedRoute>
            <CreateJobPosting />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/edit-job-posting/:jobId" 
        element={
          <ProtectedRoute>
            <EditJobPosting />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/candidate-list" 
        element={
          <ProtectedRoute>
            <CandidateListView />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/recruiter-dashboard"
        element={
          <ProtectedRoute>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-details/:jobId"
        element={
          <ProtectedRoute>
            <JobDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobBrowse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:jobId"
        element={
          <ProtectedRoute>
            <JobDetailedView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-assessment/:jobId"
        element={
          <ProtectedRoute>
            <JobAssessment />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<RoleDashboardRedirect />} />
      <Route path="*" element={<RoleDashboardRedirect />} />
    </Routes>
  );
}

export default App;
