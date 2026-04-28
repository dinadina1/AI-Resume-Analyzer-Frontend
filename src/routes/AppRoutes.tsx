import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Loader } from '@/components/atoms';

// Layouts
import { AuthLayout } from '@/components/templates/AuthLayout/AuthLayout';
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout';

// Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { Resumes } from '@/pages/resume/Resumes';
import { Upload } from '@/pages/resume/Upload';
import { Details } from '@/pages/resume/Details';
import { Match } from '@/pages/jd/Match';
import { AiSettings } from '@/pages/llm/AiSettings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader fullScreen label="Loading..." />}>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="resume" element={<Resumes />} />
          <Route path="resume/upload" element={<Upload />} />
          <Route path="resume/:id" element={<Details />} />
          <Route path="jd/match" element={<Match />} />
          <Route path="llm" element={<AiSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
