'use client';

import type { AnalysisResult } from '@/lib/types';
import RadarChart from './RadarChart';

interface Props {
  result: AnalysisResult;
}

const VERDICT_MAP = {
  'go': { label: 'Идти', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  'conditional': { label: 'Идти с условиями', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  'no-go': { label: 'Не идти', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

function scoreTextColor(score: number): string {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-emerald-400';
}

export default function ScoreDisplay({ result }: Props) {
  const verdict = VERDICT_MAP[result.verdict];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (result.score / 100) * circumference;

  return (
    <div className="glow-card bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-6">
      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <div className="relative w-36 h-36 shrink-0 score-glow">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1c1c1e" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              strokeWidth="8" strokeLinecap="round"
              className={result.score >= 70 ? 'stroke-red-500' : result.score >= 40 ? 'stroke-amber-500' : 'stroke-emerald-400'}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${scoreTextColor(result.score)}`}>
              {result.score}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">из 100</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${verdict.bg}`}>
            <span className={`text-sm font-medium ${verdict.color}`}>{verdict.label}</span>
          </div>
          <RadarChart subscores={result.subscores} />
        </div>
      </div>
    </div>
  );
}
