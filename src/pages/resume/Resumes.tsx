import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  RiFileList2Line, RiAddLine, RiDeleteBin2Line,
  RiEyeLine, RiTimeLine, RiSearchLine, RiFilterLine, RiDownloadLine,
} from 'react-icons/ri';
import { ResumeService } from '@/services/resume.service';
import { Loader, Button } from '@/components/atoms';
import { cn, formatDate, formatFileSize, getScoreColor, getScoreLabel } from '@/utils/format';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'badge-warning',
  PROCESSING: 'badge-primary',
  COMPLETED: 'badge-success',
  FAILED: 'badge-danger',
};

export const Resumes: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['resumes', 'all'],
    queryFn: () => ResumeService.getResumes(1, 50),
    refetchInterval: (query) => {
      const resumes = (query.state.data as any)?.resumes ?? [];
      const hasProcessing = resumes.some(
        (r: any) => r.status === 'PENDING' || r.status === 'PROCESSING'
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ResumeService.deleteResume(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted');
      setConfirmDelete(null);
    },
    onError: () => toast.error('Failed to delete resume'),
  });

  const handleDownload = async (id: string, name: string) => {
    try {
      await ResumeService.downloadResume(id, name);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download resume');
    }
  };

  const resumes: any[] = data?.resumes ?? [];

  const filtered = resumes.filter((r) => {
    const matchesSearch = r.originalName?.toLowerCase().includes(search?.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Resumes</h1>
          <p className="text-surface-400 mt-1">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/resume/upload">
          <Button leftIcon={<RiAddLine />}>Upload New</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            className="input-field pl-9"
            placeholder="Search resumes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <RiFilterLine className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <select
            className="input-field pl-9 pr-4 min-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Resume List */}
      {isLoading ? (
        <Loader label="Loading resumes..." className="py-20" />
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <RiFileList2Line className="text-5xl text-surface-700 mx-auto mb-4" />
          <p className="text-surface-400 font-medium">
            {resumes.length === 0 ? 'No resumes yet' : 'No resumes match your filters'}
          </p>
          {resumes.length === 0 && (
            <Link to="/resume/upload" className="mt-4 inline-block">
              <Button leftIcon={<RiAddLine />} size="sm">Upload your first resume</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((resume: any) => {
            const report = resume.analysisReports?.[0];
            const score = report?.overallScore;
            const isProcessing = resume.status === 'PENDING' || resume.status === 'PROCESSING';

            return (
              <div
                key={resume.id}
                className="card p-5 hover:border-surface-700 transition-all duration-200 animate-fade-in"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-danger-500/15 flex items-center justify-center flex-shrink-0">
                    <RiFileList2Line className="text-danger-400 text-2xl" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {resume.originalName}
                    </p>
                    <div className="flex items-center flex-wrap gap-3 mt-1">
                      <span className={cn('badge text-xs', STATUS_COLORS[resume.status] ?? 'badge-primary')}>
                        {isProcessing && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                        )}
                        {resume.status}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-surface-500">
                        <RiTimeLine />
                        {formatDate(resume.createdAt)}
                      </span>
                      {resume.fileSize && (
                        <span className="text-xs text-surface-600">
                          {formatFileSize(resume.fileSize)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  {score !== undefined && !isProcessing && (
                    <div className="flex-shrink-0 text-center px-4 border-l border-surface-800">
                      <p className={cn('text-3xl font-bold', getScoreColor(score))}>
                        {Math.round(score)}
                      </p>
                      <p className="text-xs text-surface-500">ATS Score</p>
                      <p className={cn('text-xs font-medium mt-0.5', getScoreColor(score))}>
                        {getScoreLabel(score)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Link
                      to={`/resume/${resume.id}`}
                      className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                      title="View Details"
                    >
                      <RiEyeLine className="text-lg" />
                    </Link>
                    {resume.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleDownload(resume.id, resume.originalName)}
                        className="p-2 rounded-lg text-surface-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                        title="Download PDF"
                      >
                        <RiDownloadLine className="text-lg" />
                      </button>
                    )}
                    {confirmDelete === resume.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteMutation.mutate(resume.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs text-danger-400 hover:text-danger-300 font-medium"
                        >
                          {deleteMutation.isPending ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-surface-500 hover:text-surface-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(resume.id)}
                        className="p-2 rounded-lg text-surface-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
                        title="Delete"
                      >
                        <RiDeleteBin2Line className="text-lg" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar for processing */}
                {isProcessing && (
                  <div className="mt-3 h-1 bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full animate-pulse-slow w-2/3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
