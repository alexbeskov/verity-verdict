'use client';

import type { AnalysisMeta } from '@/lib/types';

// Цены ₽ за 1M токенов, проверено на polza.ai 2026-10-29
// null = цена не найдена, показываем только токены
const MODEL_PRICING: Record<string, { prompt: number; completion: number } | null> = {
  'deepseek/deepseek-v4-flash': { prompt: 5.7, completion: 11.4 },
  'deepseek/deepseek-v4.1-flash': { prompt: 11.56, completion: 17.17 },
  'google/gemma-4-26b-a4b-it': null,
};

// Стоимость часа аналитика M&A (оценка)
const ANALYST_HOURLY_RUB = 5000;
const ANALYST_HOURS = 6;

interface Props {
  meta: AnalysisMeta;
}

export default function CostCounter({ meta }: Props) {
  const seconds = (meta.durationMs / 1000).toFixed(1);
  const totalTokens = meta.promptTokens + meta.completionTokens;
  const pricing = MODEL_PRICING[meta.model] ?? null;

  let costRub: number | null = null;
  if (pricing) {
    costRub =
      (meta.promptTokens / 1_000_000) * pricing.prompt +
      (meta.completionTokens / 1_000_000) * pricing.completion;
  }

  const analystCost = ANALYST_HOURLY_RUB * ANALYST_HOURS;

  return (
    <div className="glow-card bg-zinc-900/80 border border-zinc-800/50 rounded-2xl px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-zinc-400">
          Проверка заняла{' '}
          <span className="text-white font-medium">{seconds} сек</span>
        </span>

        <span className="text-zinc-700 hidden sm:block">·</span>

        <span className="text-zinc-400">
          <span className="text-white font-medium">
            {totalTokens.toLocaleString('ru-RU')}
          </span>{' '}
          токенов
        </span>

        {costRub !== null && (
          <>
            <span className="text-zinc-700 hidden sm:block">·</span>
            <span className="text-zinc-400">
              ≈{' '}
              <span className="text-white font-medium">
                {costRub < 0.01 ? '< 0.01' : costRub.toFixed(2)} ₽
              </span>
            </span>
          </>
        )}

        <span className="text-zinc-700 hidden sm:block">·</span>

        <span className="text-zinc-400">
          аналитику потребовалось бы ≈{' '}
          <span className="text-amber-400 font-medium">{ANALYST_HOURS} ч</span>{' '}
          <span className="text-zinc-600 text-xs">
            (~{analystCost.toLocaleString('ru-RU')} ₽, оценка)
          </span>
        </span>
      </div>

      {costRub === null && (
        <p className="text-xs text-zinc-600 mt-1.5">
          Стоимость в ₽: цена модели {meta.model} не определена
        </p>
      )}
    </div>
  );
}
