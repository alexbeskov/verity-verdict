'use client';

import { useState } from 'react';

interface Props {
  onStart: (useCached: boolean, customText?: string) => void;
}

const DEMO_FILES = [
  { name: 'company-info.txt', label: 'Сведения о компании' },
  { name: 'charter.txt', label: 'Устав (фрагмент)' },
  { name: 'supply-contract.txt', label: 'Договор поставки' },
  { name: 'financials.txt', label: 'Финансовая отчётность' },
  { name: 'customers.txt', label: 'Список покупателей' },
];

export default function UploadScreen({ onStart }: Props) {
  const [mode, setMode] = useState<'demo' | 'custom'>('demo');
  const [customText, setCustomText] = useState('');
  const [useCached, setUseCached] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glow-card bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">ООО «ТрансЛогик Групп»</h2>
        </div>

        <div className="flex gap-1 mb-5 bg-zinc-800/50 rounded-xl p-1">
          <button
            onClick={() => setMode('demo')}
            className={`flex-1 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
              mode === 'demo'
                ? 'tab-active text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Демо-пакет
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
              mode === 'custom'
                ? 'tab-active text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Свой текст
          </button>
        </div>

        {mode === 'demo' ? (
          <div className="space-y-2 stagger-children">
            <p className="text-sm text-zinc-400 mb-3">Пакет документов (5 файлов):</p>
            {DEMO_FILES.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-3 px-4 py-2.5 bg-zinc-800/40 rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700/80 transition-colors">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm text-zinc-300">{file.label}</span>
                <span className="text-xs text-zinc-600 ml-auto font-mono">{file.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Вставьте текст документов для анализа..."
            className="w-full h-48 bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-[var(--accent)]/30 focus:ring-1 focus:ring-[var(--accent)]/10 transition-all"
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 text-sm text-zinc-400 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={useCached}
            onChange={(e) => setUseCached(e.target.checked)}
            className="rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500 focus:ring-offset-0 w-4 h-4 accent-red-500"
          />
          <span className="group-hover:text-zinc-300 transition-colors">Записанный прогон</span>
          <span className="text-zinc-600 text-xs">(не требует API)</span>
        </label>

        <button
          onClick={() => onStart(useCached, mode === 'custom' ? customText : undefined)}
          disabled={mode === 'custom' && !customText.trim()}
          className="btn-shimmer px-7 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Запустить проверку
        </button>
      </div>

      <p className="text-xs text-zinc-600 text-center">
        Результаты формируются ИИ и требуют проверки аналитиком. Демо на синтетических данных.
      </p>
    </div>
  );
}
