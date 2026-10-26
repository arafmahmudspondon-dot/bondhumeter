"use client";

import { useEffect, useRef } from "react";

/**
 * Confetti — a tiny zero-dependency canvas burst for big wins (70%+).
 * Fires once when `fire` flips true, animates ~3s, then removes itself
 * from the DOM. Respects prefers-reduced-motion. Brand-colored pieces
 * plus a few festive accents, no emojis, no libraries.
 */

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  shape: 0 | 1; // rectangle | circle
  life: number;
}

const COLORS = [
  "#e741a8", // brand from
  "#8b5cf6", // brand to
  "#e879f9",
  "#fbbf24",
  "#34d399",
  "#ffffff",
];

export default function Confetti({ fire }: { fire: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!fire || firedRef.current) return;
    firedRef.current = true;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // two side cannons + a center pop
    const pieces: Piece[] = [];
    const spawn = (ox: number, oy: number, angle: number, count: number, power: number) => {
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 1.1;
        const v = power * (0.55 + Math.random() * 0.65);
        pieces.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle + spread) * v,
          vy: Math.sin(angle + spread) * v,
          size: 5 + Math.random() * 6,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          shape: Math.random() > 0.5 ? 1 : 0,
          life: 1,
        });
      }
    };
    spawn(-10, h * 0.75, -Math.PI / 3, 60, 13); // left cannon
    spawn(w + 10, h * 0.75, Math.PI + Math.PI / 3, 60, 13); // right cannon
    spawn(w / 2, h * 0.35, Math.PI / 2, 40, 9); // center pop

    let raf = 0;
    let alive = true;
    const start = performance.now();

    const tick = (now: number) => {
      if (!alive) return;
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      const gravity = 0.32;
      const drag = 0.985;

      for (const p of pieces) {
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        // fade out near the end of the 3s show
        p.life = Math.max(0, 1 - Math.max(0, elapsed - 2100) / 900);

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (elapsed < 3200) {
        raf = requestAnimationFrame(tick);
      } else {
        alive = false;
        canvas.remove();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      canvas.remove();
    };
  }, [fire]);

  if (!fire) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80]"
    />
  );
}
