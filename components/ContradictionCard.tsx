'use client';

import { useState } from 'react';
import type { Contradiction } from '@/lib/types';

interface Props {
  contradiction: Contradiction;
  index: number;
}

export default function ContradictionCard({ contradiction, index }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-700/60 transition-all duration-200 hover:bg-zinc-900"
      onClick={() => setOpen(!open)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-6 h-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xs text-red-400 shrink-0">
            {index + 1}
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white mb-1">{contradiction.title}</h3>
            <p className="text-sm text-zinc-400">{contradiction.explanation}</p>
          </div>
          <svg
            className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-0 space-y-2 ml-9">
          {contradiction.sources.map((s, i) => (
            <div key={i} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-1">
                Документ: <span className="text-zinc-400">{s.doc}</span>
              </p>
              <p className="text-sm text-zinc-300 italic">&laquo;{s.quote}&raquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
