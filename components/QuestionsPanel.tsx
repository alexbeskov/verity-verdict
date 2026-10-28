'use client';

interface Props {
  questions: string[];
}

export default function QuestionsPanel({ questions }: Props) {
  return (
    <div className="space-y-2 stagger-children">
      {questions.map((q, i) => (
        <div key={i} className="flex gap-3 bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700/50 transition-all">
          <span className="w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center text-xs text-zinc-400 shrink-0 font-medium">
            {i + 1}
          </span>
          <p className="text-sm text-zinc-300 pt-0.5">{q}</p>
        </div>
      ))}
    </div>
  );
}
