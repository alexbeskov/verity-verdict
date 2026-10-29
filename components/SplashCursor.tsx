'use client';

import { useEffect, useRef } from 'react';

export default function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let raf: number;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      color: string;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];

    const COLORS = [
      'rgba(96,165,250,',   // blue
      'rgba(167,139,250,',  // violet
      'rgba(251,113,133,',  // rose
      'rgba(52,211,153,',   // emerald
      'rgba(251,191,36,',   // amber
    ];

    let colorIdx = 0;

    function spawnParticles(x: number, y: number, count: number, speed: number) {
      const color = COLORS[colorIdx % COLORS.length];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const v = speed * (0.3 + Math.random() * 0.7);
        const maxLife = 40 + Math.random() * 40;
        particles.push({
          x, y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          r: 2 + Math.random() * 3,
          alpha: 0.7 + Math.random() * 0.3,
          color,
          life: maxLife,
          maxLife,
        });
      }
    }

    let lastX = -1, lastY = -1;
    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (lastX >= 0 && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        spawnParticles(e.clientX, e.clientY, 3, 1.5);
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseDown = (e: MouseEvent) => {
      colorIdx++;
      spawnParticles(e.clientX, e.clientY, 30, 6);
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      spawnParticles(t.clientX, t.clientY, 3, 1.5);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('touchmove', onTouchMove);

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.r *= 0.97;

        const t = p.life / p.maxLife;
        const alpha = p.alpha * t * t;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha.toFixed(3)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9999, mixBlendMode: 'screen', opacity: 0.6 }}
    />
  );
}
