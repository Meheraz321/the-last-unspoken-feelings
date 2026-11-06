import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  curl: number;
  curlSpeed: number;
  color: string;
  opacity: number;
  layer: 'fore' | 'mid' | 'back';
}

interface FallingPetalsCanvasProps {
  density?: number;
  enabled?: boolean;
}

export const FallingPetalsCanvas: React.FC<FallingPetalsCanvasProps> = ({
  density = 34,
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, targetX: 0 });
  const windRef = useRef({ strength: 0, targetStrength: 0, changeTimer: 0 });

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX - width / 2) * 0.0003;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const colors = [
      '#541E2B', // Broken wine
      '#752B3B', // Velvet crimson
      '#9B5968', // Muted rose
      '#3C151E', // Dark burgundy
      '#85384A', // Rosewood
      '#A8586A', // Soft blossom
    ];

    const petals: Petal[] = [];

    const createPetal = (initialY?: number): Petal => {
      const rand = Math.random();
      let layer: 'fore' | 'mid' | 'back' = 'mid';
      let size = Math.random() * 8 + 8;
      let speedY = Math.random() * 0.9 + 0.6;
      let opacity = Math.random() * 0.4 + 0.35;

      if (rand < 0.2) {
        layer = 'fore';
        size = Math.random() * 8 + 16;
        speedY = Math.random() * 1.2 + 1.2;
        opacity = Math.random() * 0.3 + 0.2;
      } else if (rand > 0.65) {
        layer = 'back';
        size = Math.random() * 5 + 4;
        speedY = Math.random() * 0.4 + 0.35;
        opacity = Math.random() * 0.25 + 0.15;
      }

      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : Math.random() * height - height,
        size,
        speedY,
        speedX: Math.random() * 0.6 - 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.025,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.025 + 0.015,
        curl: Math.random() * 0.3,
        curlSpeed: Math.random() * 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity,
        layer,
      };
    };

    for (let i = 0; i < density; i++) {
      petals.push(createPetal(Math.random() * height));
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flip), 1);

      if (p.layer === 'fore') {
        ctx.filter = 'blur(1.5px)';
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;

      ctx.beginPath();
      // Realistic organic curved rose petal with natural cup curvature
      const s = p.size;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.7, -s * 0.5, s * 1.3, s * 0.6, 0, s * 1.45);
      ctx.bezierCurveTo(-s * 1.3, s * 0.6, -s * 0.7, -s * 0.5, 0, 0);
      ctx.fill();

      // Soft center vein
      if (p.layer !== 'back') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.quadraticCurveTo(s * 0.08, s * 0.6, 0, s * 1.2);
        ctx.stroke();
      }

      ctx.restore();
    };

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Interpolate mouse wind
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;

      // Natural periodic wind gusts
      windRef.current.changeTimer -= dt;
      if (windRef.current.changeTimer <= 0) {
        windRef.current.targetStrength = (Math.random() - 0.45) * 1.2;
        windRef.current.changeTimer = Math.random() * 4 + 3;
      }
      windRef.current.strength += (windRef.current.targetStrength - windRef.current.strength) * 0.02;

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        const layerMultiplier = p.layer === 'fore' ? 1.4 : p.layer === 'back' ? 0.6 : 1.0;

        // Flutter oscillation & wind drift
        p.y += p.speedY * layerMultiplier * (dt * 60);
        const flutter = Math.sin(p.y * 0.012 + p.rotation) * 0.8;
        p.x += (p.speedX + flutter + windRef.current.strength + mouseRef.current.x * 25) * layerMultiplier * (dt * 60);

        p.rotation += p.rotationSpeed * layerMultiplier;
        p.flip += p.flipSpeed * layerMultiplier;

        // Respawn when falling out of viewport
        if (p.y > height + 35) {
          Object.assign(p, createPetal(-25));
        }
        if (p.x < -40) p.x = width + 30;
        if (p.x > width + 40) p.x = -30;

        drawPetal(p);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [density, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{ opacity: 0.9 }}
      aria-hidden="true"
    />
  );
};
