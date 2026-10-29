'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/lib/types';
import ScoreDisplay from './ScoreDisplay';
import CostCounter from './CostCounter';
import FlagCard from './FlagCard';
import ContradictionCard from './ContradictionCard';
import QuestionsPanel from './QuestionsPanel';
import SummaryPanel from './SummaryPanel';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const TABS = [
  { id: 'flags', label: 'Красные флаги' },
  { id: 'contradictions', label: 'Противоречия' },
  { id: 'questions', label: 'Вопросы собственнику' },
  { id: 'summary', label: 'Резюме для комитета' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ResultScreen({ result, onReset }: Props) {
  const [tab, setTab] = useState<TabId>('flags');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Результат проверки</h2>
        <button
          onClick={onReset}
          className="px-4 py-2.5 text-sm bg-zinc-800/80 text-zinc-400 rounded-xl hover:text-white transition-all hover:scale-[1.02] border border-zinc-700/50"
        >
          Новая проверка
        </button>
      </div>

      <ScoreDisplay result={result} />

      {result.meta && <CostCounter meta={result.meta} />}

      <div className="flex gap-1 bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-1.5 backdrop-blur-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
              tab === t.id
                ? 'tab-active text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            {t.label}
            {t.id === 'flags' && (
              <span className={`ml-1.5 text-xs ${tab === t.id ? 'text-zinc-300' : 'text-zinc-500'}`}>({result.flags.length})</span>
            )}
            {t.id === 'contradictions' && (
              <span className={`ml-1.5 text-xs ${tab === t.id ? 'text-zinc-300' : 'text-zinc-500'}`}>({result.contradictions.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" key={tab}>
        {tab === 'flags' && (
          <div className="space-y-3 stagger-children">
            {result.flags.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">Красные флаги не обнаружены</p>
            ) : (
              result.flags
                .sort((a, b) => {
                  const order = { high: 0, medium: 1, low: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .map((flag) => <FlagCard key={flag.id} flag={flag} />)
            )}
          </div>
        )}

        {tab === 'contradictions' && (
          <div className="space-y-3 stagger-children">
            {result.contradictions.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">Противоречия не обнаружены</p>
            ) : (
              result.contradictions.map((c, i) => (
                <ContradictionCard key={i} contradiction={c} index={i} />
              ))
            )}
          </div>
        )}

        {tab === 'questions' && <QuestionsPanel questions={result.questions} />}
        {tab === 'summary' && <SummaryPanel summary={result.summary} />}
      </div>

      <p className="text-xs text-zinc-600 text-center">
        Результаты формируются ИИ и требуют проверки аналитиком. Демо на синтетических данных.
      </p>
    </div>
  );
}
