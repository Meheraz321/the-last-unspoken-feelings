import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../utils/audioSynth';

interface Droplet {
  x: number;
  y: number;
  r: number;
  sliding: boolean;
  vy: number;
  trail: { x: number; y: number; r: number }[];
  life: number;
}

interface RainCanvasProps {
  enabled?: boolean;
  interactiveWipe?: boolean;
}

export const RealisticRainCanvas: React.FC<RainCanvasProps> = ({
  enabled = true,
  interactiveWipe = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wipeMaskRef = useRef<HTMLCanvasElement | null>(null);
  const isPointerDownRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Offscreen mask canvas for condensation wiping
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    wipeMaskRef.current = maskCanvas;

    const droplets: Droplet[] = [];
    const maxDroplets = Math.min(180, Math.floor(width * 0.12));

    const spawnDroplet = (sliding = false): Droplet => ({
      x: Math.random() * width,
      y: sliding ? Math.random() * 50 : Math.random() * height,
      r: sliding ? Math.random() * 2.8 + 2.5 : Math.random() * 1.8 + 0.8,
      sliding,
      vy: sliding ? Math.random() * 4 + 3 : 0,
      trail: [],
      life: Math.random() * 200 + 100,
    });

    for (let i = 0; i < maxDroplets; i++) {
      droplets.push(spawnDroplet(Math.random() < 0.15));
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      maskCanvas.width = width;
      maskCanvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();
    let nextSlideTrigger = performance.now() + 1800;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Periodically trigger a static droplet to begin sliding down the glass
      if (time > nextSlideTrigger) {
        const staticOnes = droplets.filter((d) => !d.sliding);
        if (staticOnes.length > 0) {
          const chosen = staticOnes[Math.floor(Math.random() * staticOnes.length)];
          chosen.sliding = true;
          chosen.vy = Math.random() * 3 + 2;
          chosen.r = Math.min(chosen.r * 1.5, 4.5);
        }
        nextSlideTrigger = time + Math.random() * 1500 + 1200;
      }

      // Draw condensation mask fade recovery (mist slowly returns)
      if (maskCtx) {
        maskCtx.fillStyle = 'rgba(0, 0, 0, 0.015)';
        maskCtx.fillRect(0, 0, width, height);
      }

      // Update and draw raindrops
      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i];

        if (d.sliding) {
          d.y += d.vy * (dt * 60);
          d.x += (Math.random() - 0.5) * 0.4; // subtle meandering
          d.vy += 0.08; // subtle acceleration

          // Leave wet trail droplets
          if (Math.random() < 0.35) {
            d.trail.push({
              x: d.x + (Math.random() - 0.5) * 1.5,
              y: d.y,
              r: Math.random() * (d.r * 0.45) + 0.6,
            });
            if (d.trail.length > 18) d.trail.shift();
          }

          // Merge with nearby static droplets
          for (let j = 0; j < droplets.length; j++) {
            if (i !== j && !droplets[j].sliding) {
              const other = droplets[j];
              const dx = other.x - d.x;
              const dy = other.y - d.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < d.r + other.r + 3) {
                d.r = Math.min(d.r + other.r * 0.4, 5.5);
                d.vy += 0.4;
                other.y = -20;
                other.x = Math.random() * width;
              }
            }
          }

          // Reset when offscreen
          if (d.y > height + 20) {
            Object.assign(d, spawnDroplet(false));
            d.y = -10;
          }
        }

        // Render trail drops
        for (let t = 0; t < d.trail.length; t++) {
          const tr = d.trail[t];
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, tr.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(217, 213, 214, 0.18)';
          ctx.fill();
        }

        // Draw main raindrop on glass with realistic 3D refraction highlight & shadow
        ctx.save();
        ctx.beginPath();
        // Droplet shape (slightly elongated vertically when sliding)
        if (d.sliding) {
          ctx.ellipse(d.x, d.y, d.r * 0.85, d.r * 1.3, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        }

        // Inner refracted dark rim
        ctx.fillStyle = 'rgba(15, 17, 24, 0.35)';
        ctx.fill();

        // White glossy reflection pin-point
        ctx.beginPath();
        ctx.arc(d.x - d.r * 0.28, d.y - d.r * 0.28, d.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();

        // Bottom meniscus rim light
        ctx.beginPath();
        ctx.arc(d.x, d.y + d.r * 0.2, d.r * 0.7, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  // Pointer interactions for wiping foggy glass
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    wipeAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    wipeAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    lastPointerRef.current = null;
  };

  const wipeAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Erase raindrops where cursor touches
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const grad = ctx.createRadialGradient(x, y, 10, x, y, 45);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={interactiveWipe ? handlePointerDown : undefined}
      onPointerMove={interactiveWipe ? handlePointerMove : undefined}
      onPointerUp={interactiveWipe ? handlePointerUp : undefined}
      className="fixed inset-0 pointer-events-none z-25"
      style={{ opacity: 0.75 }}
      aria-hidden="true"
    />
  );
};
