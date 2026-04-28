import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RiDashboardLine, RiFileList2Line, RiUploadCloud2Line, RiBriefcaseLine, RiRobot2Line, RiLogoutBoxLine } from 'react-icons/ri';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { AuthService } from '@/services/auth.service';
import { cn } from '@/utils/format';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
  { path: '/resume/upload', label: 'Upload Resume', icon: RiUploadCloud2Line },
  { path: '/resume', label: 'My Resumes', icon: RiFileList2Line },
  { path: '/jd/match', label: 'JD Matching', icon: RiBriefcaseLine },
  { path: '/llm', label: 'AI Settings', icon: RiRobot2Line },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);

  const handleLogout = async () => {
    try {
      await AuthService.logout(refreshToken ?? undefined);
    } finally {
      dispatch(logout());
      navigate('/auth/login');
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-surface-900 border-r border-surface-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-surface-800">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <RiFileList2Line className="text-white text-lg" />
          </div>
          <span className="font-bold text-white">
            Resume<span className="gradient-text">AI</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active =
            path === '/resume'
              ? location.pathname === '/resume'
              : path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              )}
            >
              <Icon className="text-lg flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-surface-800 space-y-2">
        {user && (
          <div className="px-3 py-2 rounded-lg bg-surface-800">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-surface-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all duration-150"
        >
          <RiLogoutBoxLine className="text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
};
