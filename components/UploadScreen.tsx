'use client';

import { useState } from 'react';
import GradientWaves from './GradientWaves';
import CompanySearch from './CompanySearch';
import type { CompanySuggestion } from '@/app/api/company-search/route';

interface Props {
  onStart: (useCached: boolean, customText?: string) => void;
}

type Mode = 'upload' | 'registry';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Выберите компанию',
    desc: 'Найдите контрагента по названию или ИНН, либо загрузите свои документы.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

const REGISTRY_SOURCES = [
  { label: 'ЕГРЮЛ / ФНС', icon: '🏛️' },
  { label: 'Арбитраж', icon: '⚖️' },
  { label: 'СМИ и пресса', icon: '📰' },
  { label: 'Публ. отчётность', icon: '📊' },
];

function buildRegistryPrompt(company: CompanySuggestion): string {
  return `ОБЪЕКТ АНАЛИЗА — РЕАЛЬНАЯ РОССИЙСКАЯ КОМПАНИЯ:
Полное наименование: ${company.fullName}
ИНН: ${company.inn}
ОГРН: ${company.ogrn}
Юридический адрес: ${company.address}
Регион: ${company.region}
Статус: ${company.status === 'ACTIVE' ? 'Действующая' : company.status}

ИСТОЧНИКИ ДЛЯ АНАЛИЗА:
Проведи due diligence используя все публично известные факты об этой компании:
• ЕГРЮЛ — руководители, учредители, виды деятельности, история изменений
• Арбитражные дела (kad.arbitr.ru) — суммы, стороны, результаты
• ФНС — задолженности, блокировки счетов, процедуры банкротства
• Публичная финансовая отчётность (для ПАО — раскрытие на Мосбирже)
• Публикации в СМИ — репутационные риски, скандалы, санкции
• ФССП — исполнительные производства
• Сведения о бенефициарных владельцах и аффилированных структурах

ВАЖНО: Все флаги и выводы основывай исключительно на реальных публичных данных об этой компании. Не используй синтетические данные. Если информация по какому-либо направлению ограничена — укажи это явно в summary и отрази в риск-балле (непрозрачность = повышенный риск).`;
}

export default function UploadScreen({ onStart }: Props) {
  const [mode, setMode] = useState<Mode>('registry');
  const [customText, setCustomText] = useState('');
  const [useCached, setUseCached] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanySuggestion | null>(null);

  const handleCompanySelect = (company: CompanySuggestion) => {
    setSelectedCompany(company);
    setMode('registry');
  };

  const canStart = useCached || (
    mode === 'upload' ? customText.trim().length > 0 : selectedCompany !== null
  );

  const handleStart = () => {
    if (useCached) {
      onStart(true);
    } else if (mode === 'upload') {
      onStart(false, customText);
    } else if (selectedCompany) {
      onStart(false, buildRegistryPrompt(selectedCompany));
    }
  };

  return (
    <div className="space-y-16">
      {/* ── Hero section ── */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-900" />
        <GradientWaves className="opacity-60" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 space-y-8">
          {/* Headline */}
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
              ИИ анализирует данные и выявляет риски — юридические, финансовые, репутационные и структуру собственности.
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

          {/* Mode selector */}
          <div className="space-y-3">
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Источник данных</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Registry card */}
              <button
                onClick={() => setMode('registry')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                  mode === 'registry'
                    ? 'border-violet-500/40 bg-violet-500/5 shadow-[0_0_20px_rgba(139,92,246,0.08)]'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  mode === 'registry' ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-zinc-800'
                }`}>
                  <svg className={`w-4.5 h-4.5 ${mode === 'registry' ? 'text-violet-400' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-white mb-1">Открытые реестры</div>
                <div className="text-xs text-zinc-500 leading-relaxed">ЕГРЮЛ, арбитраж, ФНС, СМИ — анализ по публичным данным</div>
              </button>

              {/* Upload card */}
              <button
                onClick={() => setMode('upload')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                  mode === 'upload'
                    ? 'border-blue-500/40 bg-blue-500/5 shadow-[0_0_20px_rgba(96,165,250,0.08)]'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  mode === 'upload' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-zinc-800'
                }`}>
                  <svg className={`w-4.5 h-4.5 ${mode === 'upload' ? 'text-blue-400' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-white mb-1">Свои документы</div>
                <div className="text-xs text-zinc-500 leading-relaxed">Устав, договоры, отчётность — вставьте текст документов</div>
              </button>
            </div>
          </div>

          {/* Mode content */}
          <div className="glow-card bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 min-h-[120px]">
            {mode === 'registry' ? (
              selectedCompany ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{selectedCompany.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">ИНН {selectedCompany.inn} · ОГРН {selectedCompany.ogrn}</div>
                      <div className="text-xs text-zinc-600 mt-0.5 truncate">{selectedCompany.address}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {REGISTRY_SOURCES.map((src) => (
                      <div key={src.label} className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg">
                        <span className="text-xs">{src.icon}</span>
                        <span className="text-xs text-zinc-400">{src.label}</span>
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-4 gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400 font-medium">Выберите компанию выше</div>
                    <div className="text-xs text-zinc-600 mt-0.5">Начните вводить название или ИНН</div>
                  </div>
                </div>
              )
            ) : (
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Вставьте текст документов для анализа — устав, договоры, финансовую отчётность..."
                className="w-full h-36 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-sm text-zinc-400 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={useCached}
                onChange={(e) => setUseCached(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-800 w-4 h-4 accent-blue-500"
              />
              <span className="group-hover:text-zinc-300 transition-colors">Записанный прогон</span>
              <span className="text-zinc-600 text-xs">(без API)</span>
            </label>

            <button
              onClick={handleStart}
              disabled={!canStart}
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
