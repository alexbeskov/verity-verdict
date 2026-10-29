'use client';

import { useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

export default function Beams({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let mouseX = 0;
    let mouseY = 0;
    let raf: number;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', onMouseMove);

    interface Beam {
      x: number;
      y: number;
      angle: number;
      length: number;
      width: number;
      speed: number;
      hue: number;
      alpha: number;
      phase: number;
    }

    const beams: Beam[] = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      angle: (i / 12) * Math.PI * 2 + Math.random() * 0.5,
      length: 0.4 + Math.random() * 0.4,
      width: 1 + Math.random() * 2.5,
      speed: 0.003 + Math.random() * 0.004,
      hue: 200 + i * 15 + Math.random() * 30,
      alpha: 0.08 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    function draw() {
      t += 1;
      const w = canvas!.width;
      const h = canvas!.height;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (const beam of beams) {
        const cx = beam.x * w;
        const cy = beam.y * h;
        const angle = beam.angle + Math.sin(t * beam.speed + beam.phase) * 0.3;
        const len = beam.length * Math.max(w, h);

        const x1 = cx - Math.cos(angle) * len * 0.2;
        const y1 = cy - Math.sin(angle) * len * 0.2;
        const x2 = cx + Math.cos(angle) * len;
        const y2 = cy + Math.sin(angle) * len;

        // Mouse influence
        const mx = mouseX / w;
        const my = mouseY / h;
        const dist = Math.hypot(mx - beam.x, my - beam.y);
        const influence = Math.max(0, 1 - dist * 3);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        const alpha = beam.alpha + influence * 0.15;
        grad.addColorStop(0,   `hsla(${beam.hue}, 90%, 65%, 0)`);
        grad.addColorStop(0.3, `hsla(${beam.hue}, 90%, 65%, ${alpha})`);
        grad.addColorStop(0.7, `hsla(${beam.hue + 20}, 80%, 60%, ${alpha * 0.8})`);
        grad.addColorStop(1,   `hsla(${beam.hue + 40}, 80%, 60%, 0)`);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = (beam.width + influence * 3) * (w / 400);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}
