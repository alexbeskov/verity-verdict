'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CompanySuggestion } from '@/app/api/company-search/route';

interface Props {
  onSelect: (company: CompanySuggestion) => void;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Действует', color: 'text-emerald-400' },
  LIQUIDATED: { label: 'Ликвидирована', color: 'text-red-400' },
  LIQUIDATING: { label: 'Ликвидируется', color: 'text-amber-400' },
  REORGANIZING: { label: 'Реорганизация', color: 'text-blue-400' },
};

export default function CompanySearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompanySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/company-search?q=${encodeURIComponent(q)}`);
      const data: CompanySuggestion[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 280);
  };

  const handleSelect = (company: CompanySuggestion) => {
    setQuery(company.name);
    setOpen(false);
    onSelect(company);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSelect(results[activeIdx]); }
    if (e.key === 'Escape') { setOpen(false); }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M16.65 16.65A8 8 0 1116.65 2.35a8 8 0 010 14.3z" />
        </svg>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Название компании или ИНН..."
          className="w-full pl-10 pr-10 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />

        {/* Loading spinner */}
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-zinc-600 border-t-blue-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-72 overflow-y-auto">
          {results.map((c, i) => {
            const st = STATUS_LABEL[c.status] ?? { label: c.status, color: 'text-zinc-500' };
            return (
              <button
                key={c.inn}
                onMouseDown={() => handleSelect(c)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-zinc-800/50 last:border-0 ${
                  activeIdx === i ? 'bg-zinc-800/80' : 'hover:bg-zinc-800/50'
                }`}
              >
                <div className="w-8 h-8 shrink-0 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-zinc-200 truncate">{c.name}</span>
                    <span className={`text-[10px] font-medium ${st.color} shrink-0`}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-zinc-500 font-mono">ИНН {c.inn}</span>
                    {c.region && <span className="text-xs text-zinc-600">· {c.region}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
