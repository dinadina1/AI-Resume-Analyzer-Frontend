import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RiArrowLeftLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { ResumeService } from '@/services/resume.service';
import { FileUpload } from '@/components/molecules/FileUpload/FileUpload';
import { Button } from '@/components/atoms';
import toast from 'react-hot-toast';

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: () => ResumeService.uploadResume(file!, (pct) => setProgress(pct)),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume uploaded! Analysis is processing...');
      navigate(`/resume/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Upload failed');
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" leftIcon={<RiArrowLeftLine />} size="sm">Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Resume</h1>
          <p className="text-surface-400 text-sm">PDF files only, max 5 MB</p>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <FileUpload
          onFileSelect={setFile}
          uploading={mutation.isPending}
          progress={progress}
          error={mutation.isError ? 'Upload failed. Please try again.' : undefined}
        />

        <Button
          className="w-full"
          disabled={!file || mutation.isPending}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Uploading & Processing...' : 'Analyze Resume'}
        </Button>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">How it works</h3>
        <ol className="space-y-2">
          {[
            'Upload your PDF resume',
            'Our engine extracts text and skills',
            'ATS score calculated across 4 dimensions',
            'Suggestions generated to help you improve',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-surface-400">
              <span className="w-5 h-5 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
