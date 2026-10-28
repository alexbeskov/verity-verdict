'use client';

import { useState } from 'react';
import type { Flag } from '@/lib/types';

interface Props {
  flag: Flag;
}

const SEVERITY = {
  high: { label: 'Высокий', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  medium: { label: 'Средний', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  low: { label: 'Низкий', color: 'bg-zinc-700/50 text-zinc-400 border-zinc-600' },
};

const CATEGORY = {
  legal: 'Юридический',
  financial: 'Финансовый',
  reputation: 'Репутационный',
  ownership: 'Собственность',
};

export default function FlagCard({ flag }: Props) {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY[flag.severity];

  return (
    <div
      className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-700/60 transition-all duration-200 hover:bg-zinc-900"
      onClick={() => setOpen(!open)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {flag.severity === 'high' ? (
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm font-medium text-white">{flag.title}</h3>
              <span className={`px-2 py-0.5 text-xs rounded border ${sev.color}`}>
                {sev.label}
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                {CATEGORY[flag.category]}
              </span>
              {flag.quoteVerified && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Цитата проверена
                </span>
              )}
              {!flag.quoteVerified && flag.source.quote && (
                <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-500 border border-zinc-700">
                  Не подтверждено
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400">{flag.explanation}</p>
          </div>
          <svg
            className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {open && flag.source.quote && (
        <div className="px-4 pb-4 pt-0">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 ml-8">
            <p className="text-xs text-zinc-500 mb-1">
              Источник: <span className="text-zinc-400">{flag.source.doc}</span>
            </p>
            <p className="text-sm text-zinc-300 italic">&laquo;{flag.source.quote}&raquo;</p>
          </div>
        </div>
      )}
    </div>
  );
}
