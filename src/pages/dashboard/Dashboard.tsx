import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiAddLine, RiFileList2Line } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { ResumeService } from '@/services/resume.service';
import { ResumeCard } from '@/components/organisms/ResumeCard/ResumeCard';
import { Loader } from '@/components/atoms';
import { Button } from '@/components/atoms';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => ResumeService.getResumes(1, 20),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ResumeService.deleteResume(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted');
    },
    onError: () => toast.error('Failed to delete resume'),
  });

  const resumes = data?.resumes ?? [];
  const totalResumes = data?.total ?? 0;
  const latestScore = resumes[0]?.analysisReports?.[0]?.overallScore;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-surface-400 mt-1">Track and improve your resume performance</p>
        </div>
        <Link to="/resume/upload">
          <Button leftIcon={<RiAddLine />}>Upload Resume</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Resumes', value: totalResumes, icon: RiFileList2Line, color: 'text-primary-400' },
          { label: 'Latest ATS Score', value: latestScore != null ? `${Math.round(latestScore)}/100` : '—', icon: RiFileList2Line, color: latestScore != null ? (latestScore >= 75 ? 'text-accent-400' : latestScore >= 50 ? 'text-yellow-400' : 'text-danger-400') : 'text-surface-400' },
          { label: 'Analyses Run', value: resumes.reduce((acc: number, r: any) => acc + (r.analysisReports?.length ?? 0), 0), icon: RiFileList2Line, color: 'text-accent-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-surface-500 uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Resume List */}
      <div>
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
          Your Resumes
        </h2>
        {isLoading ? (
          <Loader label="Loading resumes..." className="py-12" />
        ) : resumes.length === 0 ? (
          <div className="card p-12 text-center">
            <RiFileList2Line className="text-5xl text-surface-700 mx-auto mb-4" />
            <p className="text-surface-400 font-medium">No resumes yet</p>
            <p className="text-surface-600 text-sm mt-1 mb-6">Upload your first resume to get started</p>
            <Link to="/resume/upload">
              <Button leftIcon={<RiAddLine />}>Upload Resume</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((resume: any) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
