import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  RiFileSearchLine, RiTimeLine, RiCheckLine, RiCloseLine,
  RiArrowRightLine, RiSearchLine, RiBarChartBoxLine,
  RiLightbulbLine,
  RiInformationLine,
} from 'react-icons/ri';
import { JdService } from '@/services/analysis.service';
import { Loader } from '@/components/atoms';
import { cn, formatDate } from '@/utils/format';

const scoreColor = (pct: number) =>
  pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';

const scoreBg = (pct: number) =>
  pct >= 75 ? 'bg-emerald-500/15 border-emerald-500/30' : pct >= 50 ? 'bg-amber-500/15 border-amber-500/30' : 'bg-red-500/15 border-red-500/30';

interface MatchDetail {
  id: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  createdAt: string;
  jobDescription: { id: string; title: string; content: string; createdAt: string };
  resume: { id: string; originalName: string };
  missingKeywords: string[];
  suggestedKeywords: string[];
  insights: string[];
  improvements: string[];
}

export const JdHistory: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null);
  const [search, setSearch] = useState('');

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['jd-matches'],
    queryFn: () => JdService.getMyMatches(),
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['jd-match', selectedMatch?.id],
    queryFn: () => JdService.getMatchById(selectedMatch!.id),
    enabled: !!selectedMatch?.id,
  });

  const filtered: MatchDetail[] = matches.filter((m: MatchDetail) =>
    m.jobDescription?.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.resume?.originalName?.toLowerCase().includes(search.toLowerCase())
  );

  const activeDetail: MatchDetail = (detail as MatchDetail) ?? selectedMatch!;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">JD Match History</h1>
          <p className="text-surface-400 mt-1">{matches.length} match{matches.length !== 1 ? 'es' : ''} total</p>
        </div>
        <Link
          to="/jd/match"
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
        >
          <RiFileSearchLine /> New Match
        </Link>
      </div>

      {/* Layout: list + detail */}
      <div className="flex gap-6" style={{ minHeight: '70vh' }}>
        {/* Left — Match List */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-3">
          {/* Search */}
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              className="input-field pl-9"
              placeholder="Search by role or resume..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <Loader label="Loading matches..." className="py-12" />
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <RiBarChartBoxLine className="text-4xl text-surface-700 mx-auto mb-3" />
              <p className="text-surface-400">
                {matches.length === 0 ? 'No matches yet' : 'Nothing matches your search'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
              {filtered.map((m: MatchDetail) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={cn(
                    'w-full text-left card p-4 hover:border-primary-500/40 transition-all duration-150',
                    selectedMatch?.id === m.id && 'border-primary-500/50 bg-primary-500/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0', scoreBg(m.matchPercentage))}>
                      <span className={cn('text-lg font-bold', scoreColor(m.matchPercentage))}>
                        {m.matchPercentage}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {m.jobDescription?.title ?? 'Untitled Role'}
                      </p>
                      <p className="text-xs text-surface-500 truncate mt-0.5">
                        {m.resume?.originalName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-surface-600 mt-1">
                        <RiTimeLine />
                        {formatDate(m.createdAt)}
                      </div>
                    </div>
                    <RiArrowRightLine className={cn('text-surface-600 flex-shrink-0 transition-transform', selectedMatch?.id === m.id && 'text-primary-400 translate-x-0.5')} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Detail View */}
        <div className="flex-1 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>

          {!selectedMatch ? (
            <div className="card h-full flex flex-col items-center justify-center text-center p-12">
              <RiBarChartBoxLine className="text-5xl text-surface-700 mb-4" />
              <p className="text-surface-400 font-medium">Select a match to see details</p>
              <p className="text-surface-600 text-sm mt-1">Click any match from the list on the left</p>
            </div>
          ) : detailLoading ? (
            <div className="card h-full flex items-center justify-center">
              <Loader label="Loading details..." />
            </div>
          ) : activeDetail ? (
            <MatchDetailPanel match={activeDetail} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

const MatchDetailPanel: React.FC<{ match: MatchDetail }> = ({ match }) => {
  const [showJd, setShowJd] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">{match.jobDescription?.title}</h2>
            <p className="text-sm text-surface-400 mt-1">Resume: {match.resume?.originalName}</p>
            <p className="text-xs text-surface-600 mt-1">{formatDate(match.createdAt)}</p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className={cn('text-5xl font-extrabold', scoreColor(match.matchPercentage))}>
              {match.matchPercentage}%
            </p>
            <p className="text-xs text-surface-500 mt-1">ATS Match</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-4">
          <div className="h-2.5 bg-surface-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700',
                match.matchPercentage >= 75 ? 'bg-emerald-500' :
                  match.matchPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${match.matchPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-surface-600 mt-1">
            <span>0%</span>
            <span className={scoreColor(match.matchPercentage)}>{match.matchPercentage}% match</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Matched */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <RiCheckLine className="text-base" /> Matched Skills ({match.matchedSkills?.length ?? 0})
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {match.matchedSkills?.length > 0 ? (
              match.matchedSkills.map((s, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-xs text-surface-600">None detected</p>
            )}
          </div>
        </div>

        {/* Missing */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <RiCloseLine className="text-base" /> Missing Skills ({match.missingSkills?.length ?? 0})
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {match.missingSkills?.length > 0 ? (
              match.missingSkills.map((s, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/20">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-xs text-surface-600">Nothing missing — great fit!</p>
            )}
          </div>
        </div>
      </div>

      {/* missing keywords */}
      {match.missingKeywords && match.missingKeywords.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <RiCloseLine className="text-base" /> Missing Keywords ({match.missingKeywords?.length ?? 0})
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {match.missingKeywords.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* suggested keywords */}
      {match.suggestedKeywords && match.suggestedKeywords.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
            <RiCheckLine className="text-base" /> Suggested Keywords ({match.suggestedKeywords?.length ?? 0})
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {match.suggestedKeywords.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-md bg-green-500/15 text-green-300 border border-green-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* insights */}
      {match.insights && match.insights.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <RiInformationLine className="text-base" /> Insights ({match.insights?.length ?? 0})
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {match.insights.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* improvements */}
      {match.improvements && match.improvements.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
            <RiLightbulbLine className="text-base" /> Improvements ({match.improvements?.length ?? 0})
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {match.improvements.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-md bg-yellow-500/15 text-yellow-300 border border-yellow-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}


      {/* Job Description */}
      <div className="card p-5">
        <button
          onClick={() => setShowJd(!showJd)}
          className="w-full text-left flex items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-white">Job Description</h3>
          <span className="text-xs text-primary-400">{showJd ? 'Hide' : 'Show'}</span>
        </button>
        {showJd && (
          <p className="text-xs text-surface-400 mt-3 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {match.jobDescription?.content}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to={`/resume/${match.resume?.id}`}
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
        >
          View Full Analysis
        </Link>
        <Link
          to="/jd/match"
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
        >
          <RiFileSearchLine /> Run New Match
        </Link>
      </div>
    </div>
  );
};
