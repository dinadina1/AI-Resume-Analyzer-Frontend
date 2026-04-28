import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../organisms/Navbar/Navbar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-surface-950">
      <Navbar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
