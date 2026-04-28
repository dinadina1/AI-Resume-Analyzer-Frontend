import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { RiFileList2Line } from 'react-icons/ri';
import { useAppSelector } from '@/app/hooks';

export const AuthLayout: React.FC = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-950 via-surface-900 to-surface-950 p-12 border-r border-surface-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <RiFileList2Line className="text-white text-lg" />
          </div>
          <span className="font-bold text-white text-lg">
            Resume<span className="gradient-text">AI</span>
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Land your dream job with{' '}
            <span className="gradient-text">AI-powered</span> resume analysis
          </h1>
          <p className="text-surface-400 text-lg">
            Get instant ATS scores, skill gap analysis, and actionable suggestions to make your resume stand out.
          </p>

          {[
            { emoji: '🎯', text: 'ATS Score Analysis (0–100)' },
            { emoji: '🔍', text: 'Job Description Matching' },
            { emoji: '💡', text: 'Smart Improvement Suggestions' },
            { emoji: '⚡', text: 'Real-time Background Processing' },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-xl">{emoji}</span>
              <span className="text-surface-300 text-sm">{text}</span>
            </div>
          ))}
        </div>

        <p className="text-surface-600 text-sm">© 2024 ResumeAI. Built for job seekers.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
