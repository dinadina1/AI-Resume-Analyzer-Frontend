import React from 'react';
import { Link } from 'react-router-dom';
import { RiFileList2Line, RiTimeLine } from 'react-icons/ri';
import { cn, formatDate, getScoreColor } from '@/utils/format';

interface Resume {
  id: string;
  originalName: string;
  status: string;
  createdAt: string;
  analysisReports?: Array<{ overallScore: number; status: string }>;
}

interface ResumeCardProps {
  resume: Resume;
  onDelete?: (id: string) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onDelete }) => {
  const report = resume.analysisReports?.[0];
  const score = report?.overallScore;

  const statusBadge: Record<string, string> = {
    PENDING: 'badge-warning',
    PROCESSING: 'badge-primary',
    COMPLETED: 'badge-success',
    FAILED: 'badge-danger',
  };

  return (
    <div className="card-hover p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-danger-500/20 flex items-center justify-center flex-shrink-0">
            <RiFileList2Line className="text-danger-400 text-xl" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-white truncate">{resume.originalName}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <RiTimeLine className="text-surface-500 text-xs" />
              <span className="text-xs text-surface-500">{formatDate(resume.createdAt)}</span>
            </div>
          </div>
        </div>

        {score !== undefined && (
          <div className="flex-shrink-0 text-center">
            <div
              className={cn('text-2xl font-bold', getScoreColor(score))}
            >
              {Math.round(score)}
            </div>
            <div className="text-xs text-surface-500">ATS Score</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={cn('badge', statusBadge[resume.status] ?? 'badge-primary')}>
          {resume.status}
        </span>
        <div className="flex items-center gap-2">
          <Link
            to={`/resume/${resume.id}`}
            className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            View Details →
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(resume.id)}
              className="text-xs text-surface-500 hover:text-danger-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
