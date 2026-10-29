'use client';

import { useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

export default function GradientWaves({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let mouseX = 0.5;
    let targetX = 0.5;
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
      targetX = (e.clientX - rect.left) / rect.width;
    };
    window.addEventListener('mousemove', onMouseMove);

    let t = 0;

    function draw() {
      t += 0.008;
      mouseX += (targetX - mouseX) * 0.03;

      const w = canvas!.width;
      const h = canvas!.height;

      ctx.clearRect(0, 0, w, h);

      // Draw 4 wave layers
      const waves = [
        { amp: 0.06, freq: 1.8, speed: 1.0,  yBase: 0.45, alpha: 0.18, hue: 220 + mouseX * 30 },
        { amp: 0.05, freq: 2.3, speed: 1.3,  yBase: 0.55, alpha: 0.14, hue: 260 + mouseX * 20 },
        { amp: 0.07, freq: 1.5, speed: 0.8,  yBase: 0.50, alpha: 0.12, hue: 200 + mouseX * 40 },
        { amp: 0.04, freq: 3.0, speed: 1.6,  yBase: 0.48, alpha: 0.10, hue: 280 + mouseX * 15 },
      ];

      for (const wave of waves) {
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 4) {
          const nx = x / w;
          const y = wave.yBase * h
            + Math.sin(nx * wave.freq * Math.PI * 2 + t * wave.speed) * wave.amp * h
            + Math.sin(nx * wave.freq * 0.5 * Math.PI * 2 + t * wave.speed * 0.7 + 1) * wave.amp * 0.5 * h;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0,   `hsla(${wave.hue}, 80%, 60%, ${wave.alpha})`);
        grad.addColorStop(0.5, `hsla(${wave.hue + 30}, 70%, 50%, ${wave.alpha * 1.5})`);
        grad.addColorStop(1,   `hsla(${wave.hue + 60}, 80%, 60%, ${wave.alpha})`);

        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Light glow that follows mouse
      const gx = mouseX * w;
      const radial = ctx.createRadialGradient(gx, h * 0.5, 0, gx, h * 0.5, w * 0.4);
      radial.addColorStop(0, `hsla(${220 + mouseX * 60}, 100%, 70%, 0.06)`);
      radial.addColorStop(1, `hsla(220, 100%, 50%, 0)`);
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, w, h);

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
