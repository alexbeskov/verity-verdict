'use client';

interface Props {
  summary: string;
}

export default function SummaryPanel({ summary }: Props) {
  return (
    <div className="glow-card bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-[0.15em]">
          Резюме для инвестиционного комитета
        </h3>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-xs bg-zinc-800/80 text-zinc-400 rounded-xl hover:text-white transition-all hover:scale-[1.02] border border-zinc-700/50"
        >
          Скачать PDF
        </button>
      </div>
      <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
        {summary}
      </div>
    </div>
  );
}
