'use client';

import { useState } from 'react';
import GradientWaves from './GradientWaves';
import CompanySearch from './CompanySearch';
import type { CompanySuggestion } from '@/app/api/company-search/route';

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

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Загрузите документы',
    desc: 'Устав, договоры, финансовую отчётность — любые документы контрагента.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'ИИ анализирует риски',
    desc: 'Языковая модель проверяет юридические, финансовые, репутационные риски и структуру собственности.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Получите отчёт',
    desc: 'Скоринг, радар рисков, красные флаги и готовое резюме для инвестиционного комитета.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const ADVANTAGES = [
  { label: 'Скорость', value: '< 60 сек', sub: 'vs 5–7 дней у аналитика' },
  { label: 'Экономия', value: '~30 000 ₽', sub: 'стоимость одной проверки' },
  { label: 'Точность', value: '4 оси', sub: 'юридика, финансы, репутация, собственность' },
  { label: 'Источники', value: 'AI + реестры', sub: 'ЕГРЮЛ, ФНС, арбитраж, СМИ' },
];

export default function UploadScreen({ onStart }: Props) {
  const [mode, setMode] = useState<'demo' | 'custom'>('demo');
  const [customText, setCustomText] = useState('');
  const [useCached, setUseCached] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanySuggestion | null>(null);

  const handleCompanySelect = (company: CompanySuggestion) => {
    setSelectedCompany(company);
    // Auto-fill custom text with company info for analysis
    const info = `Компания: ${company.fullName}\nИНН: ${company.inn}\nОГРН: ${company.ogrn}\nАдрес: ${company.address}\nСтатус: ${company.status}`;
    setCustomText(info);
    setMode('custom');
  };

  return (
    <div className="space-y-16">
      {/* ── Hero section with upload card ── */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-900" />
        <GradientWaves className="opacity-60" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 space-y-8">
          {/* Hero headline */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] text-blue-400 uppercase tracking-widest font-medium">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              AI Due Diligence
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
              Проверьте контрагента<br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                за 60 секунд
              </span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              ИИ анализирует документы и выявляет риски — юридические, финансовые, репутационные и структуру собственности.
            </p>
          </div>

          {/* Company search */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Поиск компании</label>
            <CompanySearch onSelect={handleCompanySelect} />
            {selectedCompany && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-blue-300">{selectedCompany.name} · ИНН {selectedCompany.inn}</span>
                <button onClick={() => setSelectedCompany(null)} className="ml-auto text-zinc-500 hover:text-zinc-300">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Upload card */}
          <div className="glow-card bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                className="w-full h-40 bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/10 transition-all"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-sm text-zinc-400 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={useCached}
                onChange={(e) => setUseCached(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 w-4 h-4 accent-blue-500"
              />
              <span className="group-hover:text-zinc-300 transition-colors">Записанный прогон</span>
              <span className="text-zinc-600 text-xs">(не требует API)</span>
            </label>

            <button
              onClick={() => onStart(useCached, mode === 'custom' ? customText : undefined)}
              disabled={mode === 'custom' && !customText.trim()}
              className="btn-shimmer px-7 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium rounded-xl hover:from-blue-400 hover:to-violet-400 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Запустить проверку →
            </button>
          </div>

          <p className="text-xs text-zinc-600 text-center">
            Результаты формируются ИИ и требуют проверки аналитиком. Демо на синтетических данных.
          </p>
        </div>
      </div>

      {/* ── Advantages strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ADVANTAGES.map((a) => (
          <div key={a.label} className="glow-card bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 text-center">
            <div className="text-2xl font-bold text-white">{a.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{a.sub}</div>
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white text-center">Как это работает</h3>
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-zinc-900/80" />
          <div className="relative z-10 grid sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/50">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    {step.icon}
                  </div>
                  <span className="text-xs font-mono text-zinc-600 font-bold">{step.step}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white mb-1.5">{step.title}</div>
                  <div className="text-xs text-zinc-500 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Use cases ── */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white text-center">Примеры использования</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: 'M&A проверки', desc: 'Быстрая предварительная оценка цели перед полным due diligence.', icon: '🏦' },
            { title: 'Проверка поставщиков', desc: 'Снижение риска мошенничества при закупках и контрактовании.', icon: '📦' },
            { title: 'Кредитный анализ', desc: 'Первичная оценка заёмщика для банков и МФО.', icon: '📊' },
          ].map((uc) => (
            <div key={uc.title} className="glow-card bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-3">
              <div className="text-2xl">{uc.icon}</div>
              <div className="text-sm font-semibold text-white">{uc.title}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{uc.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
