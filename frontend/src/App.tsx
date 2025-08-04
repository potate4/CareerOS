import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './components/dashboard/Dashboard';
import AuthPage from './components/auth/AuthPage';
import AIServicesPage from './components/ai/AIServicesPage';
import InterviewSimulatorPage from './features/interview/components/InterviewSimulatorPage';
import LearningPathPage from './components/learning-path/LearningPathPage';
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
          <ProtectedRoute>
            <AIServicesPage />
          </ProtectedRoute>
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
        path="/learning-path/*" 
        element={
          <ProtectedRoute>
            <LearningPathPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
