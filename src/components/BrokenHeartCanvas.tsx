import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, HeartCrack, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  baseAlpha: number;
  side: 'left' | 'right';
  brokenOffsetX: number;
  brokenOffsetY: number;
  pulsePhase: number;
  driftSpeed: number;
}

export const BrokenHeartCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isBroken, setIsBroken] = useState(true);
  const [autoCycle, setAutoCycle] = useState(true);
  const particlesRef = useRef<Particle[]>([]);
  const stateRef = useRef({
    isBroken: true,
    progress: 1.0,
    mouse: { x: -1000, y: -1000, active: false },
    heartbeatTime: 0,
  });

  useEffect(() => {
    stateRef.current.isBroken = isBroken;
  }, [isBroken]);

  // Periodic heartbeat / slow fracture & reform cycle
  useEffect(() => {
    if (!autoCycle) return;
    const interval = setInterval(() => {
      setIsBroken((prev) => {
        const next = !prev;
        if (!next) {
          soundEngine.playChime(523.25, 3.2); // C5 chime on healing
        }
        return next;
      });
    }, 8500);

    return () => clearInterval(interval);
  }, [autoCycle]);

  const initParticles = useCallback((width: number, height: number) => {
    const pts: Particle[] = [];
    const count = 460;
    const centerX = width / 2;
    const centerY = height / 2 - 8;
    const scale = Math.min(width, height) * 0.025;

    const colors = [
      '#9B5968', // Muted rose
      '#541E2B', // Wine red
      '#D9D5D6', // Faded moonlight white
      '#752B3B', // Deep crimson
      '#C47A8D', // Bright soft rose
      '#E6C2C9', // Tender blush
      '#85818A', // Gray ash
    ];

    for (let i = 0; i < count; i++) {
      // Rejection sampling for natural heart interior distribution
      let hx = 0;
      let hy = 0;
      let valid = false;

      while (!valid) {
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random());
        hx = 16 * Math.pow(Math.sin(t), 3) * r;
        hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r;
        valid = true;
      }

      const baseX = centerX + hx * scale;
      const baseY = centerY + hy * scale;

      // Jagged fracture line down the middle
      const crackJitter = Math.sin(hy * 0.4) * 8 + (Math.random() - 0.5) * 6;
      const isRight = hx * scale + crackJitter >= 0;
      const side = isRight ? 'right' : 'left';

      // Dispersal trajectory when broken
      const angle = isRight
        ? (Math.random() * 0.6 - 0.3)
        : (Math.PI + Math.random() * 0.6 - 0.3);
      const dist = Math.random() * 65 + 38;

      const brokenOffsetX = Math.cos(angle) * dist;
      const brokenOffsetY = (Math.random() - 0.35) * 45;

      const baseAlpha = Math.random() * 0.6 + 0.35;

      pts.push({
        baseX,
        baseY,
        x: baseX + brokenOffsetX,
        y: baseY + brokenOffsetY,
        vx: 0,
        vy: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2.2 + 1.0,
        alpha: baseAlpha,
        baseAlpha,
        side,
        brokenOffsetX,
        brokenOffsetY,
        pulsePhase: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.6 + 0.8,
      });
    }

    particlesRef.current = pts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    initParticles(rect.width, rect.height);

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Realistic biological Lub-Dub heartbeat calculation
      stateRef.current.heartbeatTime += dt * 1.8;
      const cycle = stateRef.current.heartbeatTime % (Math.PI * 2);
      let beatScale = 1.0;

      // Lub-dub double spike
      if (cycle < 0.25) {
        beatScale = 1.0 + Math.sin((cycle / 0.25) * Math.PI) * 0.07; // Lub
      } else if (cycle > 0.35 && cycle < 0.6) {
        beatScale = 1.0 + Math.sin(((cycle - 0.35) / 0.25) * Math.PI) * 0.05; // Dub
      }

      // Target progress interpolation (1 = fractured, 0 = whole)
      const targetProg = stateRef.current.isBroken ? 1.0 : 0.0;
      const easeSpeed = stateRef.current.isBroken ? 0.028 : 0.04;
      stateRef.current.progress += (targetProg - stateRef.current.progress) * easeSpeed;
      const prog = stateRef.current.progress;

      const particles = particlesRef.current;
      const mouse = stateRef.current.mouse;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2 - 8;

      // Draw Kintsugi golden / rose thread sutures when reforming
      if (prog > 0.05 && prog < 0.85) {
        ctx.save();
        ctx.strokeStyle = `rgba(155, 89, 104, ${(1 - prog) * 0.45})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);

        // Draw connecting suture lines between matching left/right particles
        for (let i = 0; i < 18; i++) {
          const lp = particles[i];
          const rp = particles[particles.length - 1 - i];
          if (lp && rp) {
            ctx.beginPath();
            ctx.moveTo(lp.x, lp.y);
            ctx.quadraticCurveTo(centerX, centerY, rp.x, rp.y);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Draw faint glowing fracture crack when broken
      if (prog > 0.15) {
        ctx.save();
        ctx.shadowColor = '#9B5968';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = `rgba(155, 89, 104, ${prog * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 55);
        ctx.lineTo(centerX - 8, centerY - 25);
        ctx.lineTo(centerX + 9, centerY);
        ctx.lineTo(centerX - 6, centerY + 28);
        ctx.lineTo(centerX + 4, centerY + 55);
        ctx.lineTo(centerX, centerY + 85);
        ctx.stroke();
        ctx.restore();
      }

      // Update and render individual glowing ember particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulsePhase += dt * p.driftSpeed;

        // Base heart position with heartbeat scaling
        const scaledBaseX = centerX + (p.baseX - centerX) * beatScale;
        const scaledBaseY = centerY + (p.baseY - centerY) * beatScale;

        // Target with broken offset
        const targetX = scaledBaseX + p.brokenOffsetX * prog;
        const targetY = scaledBaseY + p.brokenOffsetY * prog;

        // Subtle organic float
        const floatX = Math.cos(p.pulsePhase) * (prog * 2.5);
        const floatY = Math.sin(p.pulsePhase) * (prog * 2.5);

        // Interactive mouse disturbance / magnetic touch
        let mouseForceX = 0;
        let mouseForceY = 0;
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90 && dist > 0.1) {
            const force = (1 - dist / 90) * 14;
            mouseForceX = (dx / dist) * force;
            mouseForceY = (dy / dist) * force;
          }
        }

        // Smooth movement toward target
        p.x += (targetX + floatX + mouseForceX - p.x) * 0.08;
        p.y += (targetY + floatY + mouseForceY - p.y) * 0.08;

        // Draw particle with glowing ember halo
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.9 + (beatScale - 1) * 3), 0, Math.PI * 2);

        ctx.shadowColor = p.color;
        ctx.shadowBlur = prog > 0.5 ? 9 : 14;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.baseAlpha * (0.75 + Math.sin(p.pulsePhase) * 0.25);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas) return;
      const newRect = canvas.getBoundingClientRect();
      canvas.width = newRect.width * dpr;
      canvas.height = newRect.height * dpr;
      ctx.scale(dpr, dpr);
      initParticles(newRect.width, newRect.height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [initParticles]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    stateRef.current.mouse.x = e.clientX - rect.left;
    stateRef.current.mouse.y = e.clientY - rect.top;
    stateRef.current.mouse.active = true;
  };

  const handlePointerLeave = () => {
    stateRef.current.mouse.active = false;
  };

  const toggleHeartState = () => {
    setAutoCycle(false);
    setIsBroken((prev) => {
      const next = !prev;
      if (!next) {
        soundEngine.playChime(659.25, 3.5); // E5 healing chime
      } else {
        soundEngine.playChime(329.63, 2.0); // low sorrow note
      }
      return next;
    });
  };

  const { language } = useLanguage();
  const t = translations[language].heart;

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="relative w-full h-80 sm:h-96 flex items-center justify-center">
        {/* Soft radial glow background */}
        <div className="absolute inset-0 bg-radial from-[#541E2B]/25 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={toggleHeartState}
          className="w-full h-full cursor-pointer touch-none"
          title="Click to gently heal or fracture the heart"
        />

        {/* Center state toggle button */}
        <div className="absolute bottom-3 flex items-center gap-2">
          <button
            onClick={toggleHeartState}
            className="flex items-center gap-2 px-4 py-2 text-xs text-[#D9D5D6] hover:text-[#F1EFF0] bg-[#15151C]/90 hover:bg-[#201D26] border border-[#541E2B]/50 hover:border-[#9B5968] rounded-full transition-all duration-300 backdrop-blur-md shadow-lg shadow-black/40"
          >
            {isBroken ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#9B5968] animate-spin-slow" />
                <span>{t.btnHeal}</span>
                <Sparkles className="w-3 h-3 text-[#D9D5D6]/60" />
              </>
            ) : (
              <>
                <HeartCrack className="w-3.5 h-3.5 text-[#9B5968]" />
                <span>{t.btnBreak}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Heartbreak Quote */}
      <motion.div
        key={`heart-quote-${language}`}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mt-5 px-4 max-w-lg"
      >
        <p className="text-xl sm:text-2xl font-serif-bengali text-[#D9D5D6] leading-relaxed text-glow-subtle font-medium">
          {t.quote[0]}
          <br />
          {t.quote[1]}
          <br />
          {t.quote[2]}
        </p>
      </motion.div>
    </div>
  );
};
