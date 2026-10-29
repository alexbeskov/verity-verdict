'use client';

import Beams from './Beams';

interface Props {
  steps: string[];
}

export default function AnalyzingScreen({ steps }: Props) {
  return (
    <div className="max-w-xl mx-auto relative overflow-hidden">
      <Beams className="opacity-40" />
      <div className="relative z-10 flex items-center gap-4 mb-8">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-1 rounded-full bg-[var(--accent)]/5 pulse-ring" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Идёт проверка...</h2>
          <p className="text-xs text-zinc-500">Анализируем документы с помощью ИИ</p>
        </div>
      </div>

      <div className="relative z-10 space-y-1 glow-card bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800/50">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3 py-2 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="mt-0.5 shrink-0">
              {i < steps.length - 1 ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <span className={`text-sm pt-0.5 ${i < steps.length - 1 ? 'text-zinc-500' : 'text-zinc-200'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
