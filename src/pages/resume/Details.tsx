import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RiArrowLeftLine, RiRefreshLine } from 'react-icons/ri';
import { ResumeService } from '@/services/resume.service';
import { AnalysisService, SuggestionService } from '@/services/analysis.service';
import { AnalysisPanel } from '@/components/organisms/AnalysisPanel/AnalysisPanel';
import { Loader, Button } from '@/components/atoms';

export const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: resume, isLoading: resumeLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => ResumeService.getResume(id!),
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      return status === 'PROCESSING' || status === 'PENDING' ? 3000 : false;
    },
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
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

  if (resumeLoading) return <Loader label="Loading resume..." className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" leftIcon={<RiArrowLeftLine />} size="sm">Back</Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">{resume?.originalName}</h1>
          <p className="text-surface-500 text-sm">Resume Analysis</p>
        </div>
      </div>

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

      {resume?.status === 'FAILED' && (
        <div className="card p-8 text-center border-danger-500/30">
          <p className="text-danger-400 font-medium">Analysis failed</p>
          <p className="text-surface-500 text-sm mt-1">Please try uploading the resume again</p>
        </div>
      )}

      {latestReport && !isProcessing && (
        <>
          <AnalysisPanel
            report={{
              ...latestReport,
              feedback: latestReport.feedback
                ? typeof latestReport.feedback === 'string'
                  ? JSON.parse(latestReport.feedback)
                  : latestReport.feedback
                : undefined,
            }}
          />

          {suggestions && suggestions.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                💡 Improvement Suggestions ({suggestions.length})
              </h3>
              <div className="space-y-3">
                {suggestions.map((s: any, i: number) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-surface-800">
                    <span className={`badge flex-shrink-0 ${s.source === 'AI' ? 'badge-primary' : 'badge-warning'}`}>
                      {s.source === 'AI' ? '✨ AI' : s.category}
                    </span>
                    <p className="text-sm text-surface-300">{s.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
