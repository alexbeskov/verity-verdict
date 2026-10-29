'use client';

import { useEffect, useState } from 'react';
import type { AnalysisResult } from '@/lib/types';

interface Props {
  subscores: AnalysisResult['subscores'];
}

const AXES = [
  { key: 'legal' as const, label: 'Юридические' },
  { key: 'financial' as const, label: 'Финансовые' },
  { key: 'reputation' as const, label: 'Репутационные' },
  { key: 'ownership' as const, label: 'Собственность' },
];

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_R = 80;
const LABEL_OFFSET = 16;

function axisPoint(index: number, n: number, r: number) {
  const angle = (2 * Math.PI * index) / n - Math.PI / 2;
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  };
}

function riskColor(score: number, alpha = 1): string {
  if (score >= 70) return `rgba(239,68,68,${alpha})`;
  if (score >= 40) return `rgba(245,158,11,${alpha})`;
  return `rgba(52,211,153,${alpha})`;
}

function riskStrokeClass(score: number): string {
  if (score >= 70) return 'stroke-red-500';
  if (score >= 40) return 'stroke-amber-500';
  return 'stroke-emerald-400';
}

export default function RadarChart({ subscores }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    let frame: number;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [subscores]);

  const n = AXES.length;

  // Grid polygon points at 25, 50, 75, 100
  function gridPolygon(pct: number) {
    const r = (MAX_R * pct) / 100;
    return AXES.map((_, i) => {
      const p = axisPoint(i, n, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  // Data polygon (animated)
  const dataPoints = AXES.map(({ key }, i) => {
    const r = (MAX_R * subscores[key] * progress) / 100;
    return axisPoint(i, n, r);
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full max-w-[200px] px-3">
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full"
      style={{ overflow: 'visible' }}
      aria-label="Радар рисков"
    >
      {/* Grid rings */}
      {[25, 50, 75, 100].map((pct) => (
        <polygon
          key={pct}
          points={gridPolygon(pct)}
          fill="none"
          stroke={pct === 100 ? '#3f3f46' : '#27272a'}
          strokeWidth={pct === 100 ? 1 : 0.75}
        />
      ))}

      {/* Axis lines */}
      {AXES.map((_, i) => {
        const end = axisPoint(i, n, MAX_R);
        return (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={end.x} y2={end.y}
            stroke="#3f3f46"
            strokeWidth={0.75}
          />
        );
      })}

      {/* Data fill */}
      <polygon
        points={dataPolygon}
        fill="rgba(239,68,68,0.12)"
        stroke="none"
      />

      {/* Data border */}
      <polygon
        points={dataPolygon}
        fill="none"
        stroke="rgba(239,68,68,0.6)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Axis dots */}
      {AXES.map(({ key }, i) => {
        const r = (MAX_R * subscores[key] * progress) / 100;
        const p = axisPoint(i, n, r);
        return (
          <circle
            key={key}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={riskColor(subscores[key])}
            stroke="#18181b"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Labels */}
      {AXES.map(({ key, label }, i) => {
        const p = axisPoint(i, n, MAX_R + LABEL_OFFSET);
        const score = subscores[key];
        const textAnchor =
          Math.abs(p.x - CX) < 5 ? 'middle' : p.x < CX ? 'end' : 'start';
        const dy = p.y < CY ? -2 : 12;
        return (
          <g key={key}>
            <text
              x={p.x}
              y={p.y + dy}
              textAnchor={textAnchor}
              fontSize={9}
              fill="#a1a1aa"
            >
              {label}
            </text>
            <text
              x={p.x}
              y={p.y + dy + 11}
              textAnchor={textAnchor}
              fontSize={10}
              fontWeight="600"
              fill={riskColor(score)}
            >
              {score}
            </text>
          </g>
        );
      })}

      {/* Invisible axis lines for high-risk highlight */}
      {AXES.map(({ key }, i) => {
        if (subscores[key] < 70) return null;
        const end = axisPoint(i, n, (MAX_R * subscores[key]) / 100);
        return (
          <line
            key={`hl-${key}`}
            x1={CX} y1={CY}
            x2={end.x} y2={end.y}
            strokeWidth={1}
            strokeDasharray="3 3"
            className={riskStrokeClass(subscores[key])}
            opacity={0.4}
          />
        );
      })}
    </svg>
    </div>
  );
}
