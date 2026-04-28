import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  RiArrowLeftLine, RiRefreshLine, RiDownloadLine, RiEyeLine,
} from 'react-icons/ri';
import { ResumeService } from '@/services/resume.service';
import { AnalysisService, SuggestionService } from '@/services/analysis.service';
import { AnalysisPanel } from '@/components/organisms/AnalysisPanel/AnalysisPanel';
import { ResumePreview } from '@/components/organisms/ResumePreview/ResumePreview';
import { Loader, Button } from '@/components/atoms';
import toast from 'react-hot-toast';

export const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: resume, isLoading: resumeLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => ResumeService.getResume(id!),
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      return status === 'PROCESSING' || status === 'PENDING' ? 3000 : false;
    },
  });

  const { data: reports } = useQuery({
    queryKey: ['reports', id],
    queryFn: () => AnalysisService.getReportsByResume(id!),
    enabled: resume?.status === 'COMPLETED',
  });

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', id],
    queryFn: () => SuggestionService.getSuggestions(id!),
    enabled: resume?.status === 'COMPLETED',
  });

  const latestReport = reports?.[0];
  const isProcessing = resume?.status === 'PENDING' || resume?.status === 'PROCESSING';

  const parsedFeedback = (() => {
    if (!latestReport?.feedback) return undefined;
    if (typeof latestReport.feedback === 'string') {
      try { return JSON.parse(latestReport.feedback); } catch { return undefined; }
    }
    return latestReport.feedback;
  })();

  // Merge suggestions from the report feedback.suggestions + the suggestions endpoint
  const allSuggestions = (() => {
    const fromFeedback: { message: string; source: string }[] =
      parsedFeedback?.suggestions?.map((s: string) => ({ message: s, source: 'AI' })) ?? [];
    const fromApi: { message: string; source: string }[] =
      (suggestions as any[])?.map((s: any) => ({ message: s.message, source: s.source ?? 'AI' })) ?? [];
    // Deduplicate by message
    const seen = new Set<string>();
    return [...fromFeedback, ...fromApi].filter((s) => {
      if (seen.has(s.message)) return false;
      seen.add(s.message);
      return true;
    });
  })();

  const handleDownload = async () => {
    if (!resume) return;
    setDownloading(true);
    try {
      await ResumeService.downloadResume(resume.id, resume.originalName);
      toast.success('Resume downloaded!');
    } catch {
      toast.error('Failed to download resume');
    } finally {
      setDownloading(false);
    }
  };

  if (resumeLoading) return <Loader label="Loading resume..." className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link to="/resume">
            <Button variant="ghost" leftIcon={<RiArrowLeftLine />} size="sm">Back</Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{resume?.originalName}</h1>
            <p className="text-surface-500 text-sm">Resume Analysis</p>
          </div>
        </div>

        {/* Action buttons */}
        {resume?.status === 'COMPLETED' && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RiEyeLine />}
              onClick={() => setShowPreview(true)}
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RiDownloadLine />}
              onClick={handleDownload}
              loading={downloading}
            >
              Download PDF
            </Button>
          </div>
        )}
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="card p-8 text-center">
          <Loader label="Analyzing your resume..." size="lg" className="mb-4" />
          <p className="text-surface-400 text-sm">This usually takes 10–30 seconds</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-600">
            <RiRefreshLine className="animate-spin" />
            Auto-refreshing every 3 seconds...
          </div>
        </div>
      )}

      {/* Failed state */}
      {resume?.status === 'FAILED' && (
        <div className="card p-8 text-center border-danger-500/30">
          <p className="text-danger-400 font-medium">Analysis failed</p>
          <p className="text-surface-500 text-sm mt-1">Please try uploading the resume again</p>
        </div>
      )}

      {/* Analysis results */}
      {latestReport && !isProcessing && (
        <>
          <AnalysisPanel
            report={{
              ...latestReport,
              feedback: parsedFeedback,
            }}
          />

          {/* Suggestions */}
          {allSuggestions.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  💡 AI Suggestions ({allSuggestions.length})
                </h3>
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  <RiEyeLine className="text-sm" />
                  Add to Preview
                </button>
              </div>
              <div className="space-y-3">
                {allSuggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-surface-800">
                    <span className={`badge flex-shrink-0 ${s.source === 'AI' ? 'badge-primary' : 'badge-warning'}`}>
                      {s.source === 'AI' ? '✨ AI' : s.source}
                    </span>
                    <p className="text-sm text-surface-300">{s.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {showPreview && latestReport?.rawText && (
        <ResumePreview
          rawText={latestReport.rawText}
          resumeName={resume?.originalName ?? 'resume'}
          suggestions={allSuggestions}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
