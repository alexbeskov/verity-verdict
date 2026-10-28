'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import type { AnalysisResult } from '@/lib/types';
import UploadScreen from '@/components/UploadScreen';
import AnalyzingScreen from '@/components/AnalyzingScreen';
import ResultScreen from '@/components/ResultScreen';

type AppState = 'upload' | 'analyzing' | 'result' | 'error';

export default function Home() {
  const [state, setState] = useState<AppState>('upload');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleStart = useCallback(async (useCached: boolean, customText?: string) => {
    setState('analyzing');
    setSteps([]);
    setError('');

    try {
      const body: Record<string, unknown> = { useCached };

      if (customText) {
        body.documents = [{ name: 'custom-input.txt', content: customText }];
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (eventType === 'step') {
              setSteps(prev => [...prev, data]);
            } else if (eventType === 'result') {
              const parsed = JSON.parse(data) as AnalysisResult;
              setResult(parsed);
              setState('result');
            } else if (eventType === 'error') {
              throw new Error(data);
            }
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(msg);
      setState('error');
    }
  }, []);

  const handleReset = useCallback(() => {
    setState('upload');
    setSteps([]);
    setResult(null);
    setError('');
  }, []);

  return (
    <div className="flex-1 flex flex-col aurora-bg">
      <header className="glass border-b border-zinc-800/50 sticky top-0 z-50 no-print">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.webp"
              alt="Verity Verdict"
              width={36}
              height={36}
              className="invert"
              priority
            />
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg font-semibold text-white tracking-tight">Verity</h1>
              <span className="text-lg font-light text-zinc-400 tracking-tight">Verdict</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="red-line-accent w-12 hidden sm:block" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium">MVP Demo</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {state === 'upload' && (
          <div className="animate-fade-in-up">
            <UploadScreen onStart={handleStart} />
          </div>
        )}
        {state === 'analyzing' && (
          <div className="animate-fade-in">
            <AnalyzingScreen steps={steps} />
          </div>
        )}
        {state === 'result' && result && (
          <div className="animate-fade-in-up">
            <ResultScreen result={result} onReset={handleReset} />
          </div>
        )}
        {state === 'error' && (
          <div className="max-w-xl mx-auto text-center space-y-4 animate-fade-in-up">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-zinc-400">{error}</p>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 text-sm bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-all hover:scale-[1.02] border border-zinc-700"
            >
              Попробовать снова
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800/50 no-print">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-center gap-3">
          <div className="red-line-accent w-8" />
          <span className="text-xs text-zinc-600">
            Verity Verdict &mdash; AI-помощник аналитика. Не является заменой профессиональной экспертизы.
          </span>
          <div className="red-line-accent w-8 rotate-180" />
        </div>
      </footer>
    </div>
  );
}
