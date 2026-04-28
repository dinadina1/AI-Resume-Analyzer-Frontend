import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  RiBriefcaseLine, RiUploadCloud2Line, RiFileList2Line,
  RiRobot2Line, RiShieldCheckLine, RiSparklingLine,
  RiArrowRightLine,
} from 'react-icons/ri';
import { JdService } from '@/services/analysis.service';
import { ResumeService } from '@/services/resume.service';
import { LlmService } from '@/services/analysis.service';
import { Button, Loader } from '@/components/atoms';
import { FileUpload } from '@/components/molecules/FileUpload/FileUpload';
import { cn, getScoreColor } from '@/utils/format';
import toast from 'react-hot-toast';

type ResumeInputMode = 'select' | 'upload';

export const Match: React.FC = () => {
  const [inputMode, setInputMode] = useState<ResumeInputMode>('select');
  const [form, setForm] = useState({ resumeId: '', title: '', content: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  // Fetch completed resumes for select mode
  const { data: resumesData } = useQuery({
    queryKey: ['resumes-select'],
    queryFn: () => ResumeService.getResumes(1, 50),
  });

  // Fetch LLM config to show AI badge
  const { data: llmConfig } = useQuery({
    queryKey: ['llm-config'],
    queryFn: LlmService.getConfig,
  });

  const isAiEnabled = llmConfig?.isEnabled && llmConfig?.hasKey;

  const completedResumes = (resumesData?.resumes ?? []).filter(
    (r: any) => r.status === 'COMPLETED'
  );

  // Upload-then-match flow
  const uploadThenMatchMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile) throw new Error('No file selected');
      // 1. Upload resume
      const uploaded = await ResumeService.uploadResume(uploadFile, (pct) =>
        setUploadProgress(pct)
      );
      // 2. Wait briefly for analysis (polling would be better for large files)
      await new Promise((r) => setTimeout(r, 2000));
      // 3. Match with JD
      return JdService.matchJd({
        resumeId: uploaded.id,
        title: form.title,
        content: form.content,
      });
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(
        data.analysisSource === 'AI' ? '✨ AI match complete!' : 'Match complete!'
      );
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Match failed'),
  });

  // Select-then-match flow
  const matchMutation = useMutation({
    mutationFn: () =>
      JdService.matchJd({
        resumeId: form.resumeId,
        title: form.title,
        content: form.content,
      }),
    onSuccess: (data) => {
      setResult(data);
      toast.success(
        data.analysisSource === 'AI' ? '✨ AI match complete!' : 'Match complete!'
      );
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Match failed'),
  });

  const isPending = uploadThenMatchMutation.isPending || matchMutation.isPending;

  const canSubmit =
    form.title.trim() &&
    form.content.trim() &&
    (inputMode === 'select' ? !!form.resumeId : !!uploadFile);

  const handleSubmit = () => {
    if (inputMode === 'upload') {
      uploadThenMatchMutation.mutate();
    } else {
      matchMutation.mutate();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">JD Matching</h1>
          <p className="text-surface-400 mt-1">
            Compare your resume against a job description
          </p>
        </div>
        {isAiEnabled ? (
          <span className="badge badge-primary flex items-center gap-1.5">
            <RiRobot2Line />
            AI-Powered Active
          </span>
        ) : (
          <Link to="/llm" className="badge badge-warning flex items-center gap-1.5 cursor-pointer hover:opacity-80">
            <RiShieldCheckLine />
            Enable AI
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Input Panel ─── */}
        <div className="card p-6 space-y-5">
          {/* Resume Source Toggle */}
          <div>
            <label className="label mb-2">Resume Source</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-800 rounded-lg">
              {[
                { mode: 'select' as ResumeInputMode, label: 'Select Existing', icon: RiFileList2Line },
                { mode: 'upload' as ResumeInputMode, label: 'Upload New', icon: RiUploadCloud2Line },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => { setInputMode(mode); setResult(null); }}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all',
                    inputMode === mode
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-surface-400 hover:text-white'
                  )}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Resume Input */}
          {inputMode === 'select' ? (
            <div className="space-y-1.5">
              <label className="label">Select Resume</label>
              {completedResumes.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-surface-700 text-center">
                  <p className="text-surface-500 text-sm">No completed resumes yet.</p>
                  <Link to="/resume/upload" className="text-primary-400 text-xs hover:underline mt-1 inline-block">
                    Upload one →
                  </Link>
                </div>
              ) : (
                <select
                  className="input-field"
                  value={form.resumeId}
                  onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
                >
                  <option value="">— Choose a resume —</option>
                  {completedResumes.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.originalName}
                      {r.analysisReports?.[0]?.overallScore != null
                        ? ` (ATS: ${Math.round(r.analysisReports[0].overallScore)})`
                        : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="label">Upload Resume</label>
              <FileUpload
                onFileSelect={setUploadFile}
                uploading={uploadThenMatchMutation.isPending}
                progress={uploadProgress}
              />
            </div>
          )}

          {/* Job Title */}
          <div className="space-y-1.5">
            <label className="label">Job Title</label>
            <input
              className="input-field"
              placeholder="e.g. Senior Frontend Engineer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* JD Content */}
          <div className="space-y-1.5">
            <label className="label">Job Description</label>
            <textarea
              className="input-field min-h-[160px] resize-y text-sm"
              placeholder="Paste the full job description here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            {form.content && (
              <p className="text-xs text-surface-600">{form.content.split(/\s+/).length} words</p>
            )}
          </div>

          {!isAiEnabled ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center space-y-2">
              <p className="text-yellow-400 font-semibold text-sm">⚠️ AI Setup Required</p>
              <p className="text-surface-400 text-xs">
                JD Matching is fully AI-powered and works across all industries.
                Rule-based matching has been removed as it only works for tech roles.
              </p>
              <Link to="/llm">
                <Button size="sm" className="mt-1">Configure AI Provider →</Button>
              </Link>
            </div>
          ) : (
            <Button
              className="w-full"
              leftIcon={<RiRobot2Line />}
              loading={isPending}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {isPending ? 'AI Analyzing...' : 'Run AI Match Analysis'}
            </Button>
          )}
        </div>

        {/* ─── Results Panel ─── */}
        <div className="space-y-4">
          {isPending && (
            <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
              <Loader size="lg" label={isAiEnabled ? 'AI is analyzing...' : 'Analyzing...'} />
              {isAiEnabled && (
                <p className="text-xs text-surface-600 mt-3">This may take 10–20 seconds</p>
              )}
            </div>
          )}

          {!result && !isPending && (
            <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
              <RiBriefcaseLine className="text-5xl text-surface-700 mb-4" />
              <p className="text-surface-500 text-sm">Match results will appear here</p>
            </div>
          )}

          {result && !isPending && (
            <>
              {/* Match Score */}
              <div className="card p-6 text-center animate-slide-up">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {result.analysisSource === 'AI' ? (
                    <span className="badge badge-primary flex items-center gap-1">
                      <RiSparklingLine /> AI Analysis
                    </span>
                  ) : (
                    <span className="badge badge-warning">Rule-Based</span>
                  )}
                </div>
                <p className="text-surface-400 text-sm">Match Score</p>
                <p className={cn('text-7xl font-bold mt-1', getScoreColor(result.matchPercentage))}>
                  {result.matchPercentage}%
                </p>
                <p className="text-surface-500 text-sm mt-2">
                  {result.matchedSkills?.length ?? 0} of {result.totalJdSkills} required skills matched
                </p>
              </div>

              {/* AI Insights */}
              {result.insights && result.insights.length > 0 && (
                <div className="card p-5 animate-slide-up border-primary-600/30">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <RiRobot2Line className="text-primary-400" />
                    AI Insights
                  </h3>
                  <div className="space-y-2">
                    {result.insights.map((insight: string, i: number) => (
                      <div key={i} className="flex gap-2.5 text-sm text-surface-300">
                        <RiArrowRightLine className="text-primary-400 flex-shrink-0 mt-0.5" />
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Skills */}
              {result.matchedSkills?.length > 0 && (
                <div className="card p-5 animate-slide-up">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    ✅ Matched Skills ({result.matchedSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedSkills.map((s: string) => (
                      <span key={s} className="badge badge-success capitalize">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched keywords */}
              {/* {
                result.matchedKeywords && result.matchedKeywords.length > 0 && (
                  <div className="card p-5 animate-slide-up">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      ✅ Matched Keywords ({result.matchedKeywords.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords.map((k: string) => (
                        <span key={k} className="badge badge-success capitalize">{k}</span>
                      ))}
                    </div>
                  </div>
                )
              } */}

              {/* Missing Skills */}
              {result.missingSkills?.length > 0 && (
                <div className="card p-5 animate-slide-up">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    ❌ Missing Skills ({result.missingSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((s: string) => (
                      <span key={s} className="badge badge-danger capitalize">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {
                result.missingKeywords && result.missingKeywords.length > 0 && (
                  <div className="card p-5 animate-slide-up">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      ❌ Missing Keywords ({result.missingKeywords.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((k: string) => (
                        <span key={k} className="badge badge-danger capitalize">{k}</span>
                      ))}
                    </div>
                  </div>
                )
              }

              {/* Suggested keywords */}
              {result.suggestedKeywords && result.suggestedKeywords.length > 0 && (
                <div className="card p-5 animate-slide-up">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    ✅ Suggested Keywords ({result.suggestedKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedKeywords.map((k: string) => (
                      <span key={k} className="badge badge-success capitalize">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* improvements */}
              {result.improvements && result.improvements.length > 0 && (
                <div className="card p-5 animate-slide-up">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    ✅ Improvements ({result.improvements.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.improvements.map((i: string) => (
                      <span key={i} className="badge badge-success capitalize">{i}</span>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
};
