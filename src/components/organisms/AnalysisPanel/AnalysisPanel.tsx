import React from 'react';
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { getScoreColor, cn } from '@/utils/format';

interface AnalysisPanelProps {
  report: {
    overallScore: number;
    skillsScore: number;
    keywordsScore: number;
    experienceScore: number;
    formattingScore: number;
    feedback?: Record<string, string>;
    extractedSkills?: string[];
  };
}

const sectionData = (report: AnalysisPanelProps['report']) => [
  { name: 'Skills', score: report.skillsScore, max: 40, color: '#6470f1' },
  { name: 'Keywords', score: report.keywordsScore, max: 30, color: '#10b981' },
  { name: 'Experience', score: report.experienceScore, max: 20, color: '#f59e0b' },
  { name: 'Formatting', score: report.formattingScore, max: 10, color: '#8b5cf6' },
];

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ report }) => {
  const scoreColor = getScoreColor(report.overallScore);
  const sections = sectionData(report);

  const radialData = [{ value: report.overallScore, fill: '#6470f1' }];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Overall Score */}
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="70%" outerRadius="100%"
              data={radialData}
              startAngle={90} endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#1e293b' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-surface-400 text-sm">ATS Score</p>
          <p className={cn('text-6xl font-bold', scoreColor)}>{Math.round(report.overallScore)}</p>
          <p className="text-surface-500 text-sm mt-1">out of 100</p>
          <p className="text-surface-300 text-sm mt-3">
            {report.overallScore >= 75 ? '🎉 Excellent! Your resume is well-optimized.' :
             report.overallScore >= 50 ? '👍 Good, but there is room for improvement.' :
             '⚠️ Your resume needs significant improvements.'}
          </p>
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Score Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sections} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" domain={[0, 40]} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
              formatter={(val, _name, item) => [`${Number(val ?? 0)}/${(item.payload as any)?.max ?? 100}`, 'Score']}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {sections.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skills */}
      {report.extractedSkills && report.extractedSkills.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Detected Skills</h3>
          <div className="flex flex-wrap gap-2">
            {report.extractedSkills.map((skill) => (
              <span key={skill} className="badge badge-primary capitalize">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {report.feedback && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Section Feedback</h3>
          <div className="space-y-3">
            {sections.map(({ name }) => {
              const key = name.toLowerCase() as keyof typeof report.feedback;
              const text = report.feedback?.[key];
              if (!text) return null;
              return (
                <div key={name} className="flex gap-3">
                  <div className="w-1 rounded-full bg-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-surface-300">{name}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
