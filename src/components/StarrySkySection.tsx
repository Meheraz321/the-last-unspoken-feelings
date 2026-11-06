import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Moon, Star, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

interface WishStar {
  x: number;
  y: number;
  alpha: number;
  size: number;
  pulsePhase: number;
  glowColor: string;
}

export const StarrySkySection: React.FC = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [userStars, setUserStars] = useState<WishStar[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { language } = useLanguage();
  const t = translations[language].missMe;

  const starsRef = useRef<{ x: number; y: number; r: number; alpha: number; pulse: number }[]>([]);
  const shootingStarsRef = useRef<{ x: number; y: number; len: number; speed: number; angle: number; alpha: number }[]>([]);

  const initSky = useCallback((w: number, h: number) => {
    const list = [];
    for (let i = 0; i < 200; i++) {
      list.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        alpha: Math.random() * 0.75 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = list;
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

    initSky(rect.width, rect.height);

    let lastTime = performance.now();
    let nextShootingStarTime = performance.now() + 2000;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Deep celestial radial background
      const grad = ctx.createRadialGradient(
        rect.width * 0.8,
        rect.height * 0.2,
        15,
        rect.width / 2,
        rect.height / 2,
        rect.width * 0.9
      );
      grad.addColorStop(0, '#1B1526');
      grad.addColorStop(0.35, '#120E1C');
      grad.addColorStop(0.7, '#0C0C14');
      grad.addColorStop(1, '#08090D');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Distant undulating cosmic nebula
      const nebulaGlow = ctx.createRadialGradient(
        rect.width * 0.35,
        rect.height * 0.65,
        20,
        rect.width * 0.35,
        rect.height * 0.65,
        220
      );
      nebulaGlow.addColorStop(0, 'rgba(84, 30, 43, 0.18)');
      nebulaGlow.addColorStop(0.5, 'rgba(155, 89, 104, 0.08)');
      nebulaGlow.addColorStop(1, 'rgba(8, 9, 13, 0)');
      ctx.fillStyle = nebulaGlow;
      ctx.beginPath();
      ctx.arc(rect.width * 0.35, rect.height * 0.65, 220, 0, Math.PI * 2);
      ctx.fill();

      // Crescent Moon with soft corona
      ctx.save();
      const moonX = rect.width * 0.84;
      const moonY = 85;

      const moonAura = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 130);
      moonAura.addColorStop(0, 'rgba(217, 213, 214, 0.28)');
      moonAura.addColorStop(0.4, 'rgba(155, 89, 104, 0.14)');
      moonAura.addColorStop(1, 'rgba(8, 9, 13, 0)');
      ctx.fillStyle = moonAura;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 130, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E8E5E7';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#120E1C';
      ctx.beginPath();
      ctx.arc(moonX + 11, moonY - 5, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Background ambient stars
      const bgStars = starsRef.current;
      for (let i = 0; i < bgStars.length; i++) {
        const s = bgStars[i];
        s.pulse += dt * 1.4;
        const currentAlpha = s.alpha * (0.65 + Math.sin(s.pulse) * 0.35);

        ctx.fillStyle = '#D9D5D6';
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Check shooting star spawn
      if (time > nextShootingStarTime) {
        shootingStarsRef.current.push({
          x: Math.random() * rect.width * 0.75,
          y: Math.random() * (rect.height * 0.35),
          len: Math.random() * 95 + 75,
          speed: Math.random() * 450 + 400,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.18,
          alpha: 1.0,
        });
        nextShootingStarTime = time + Math.random() * 4000 + 3000;
      }

      // Render Shooting Stars
      const sStars = shootingStarsRef.current;
      for (let i = sStars.length - 1; i >= 0; i--) {
        const ss = sStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed * dt;
        ss.y += Math.sin(ss.angle) * ss.speed * dt;
        ss.alpha -= dt * 1.1;

        if (ss.alpha <= 0 || ss.x > rect.width || ss.y > rect.height) {
          sStars.splice(i, 1);
          continue;
        }

        ctx.save();
        const headX = ss.x;
        const headY = ss.y;
        const tailX = ss.x - Math.cos(ss.angle) * ss.len * ss.alpha;
        const tailY = ss.y - Math.sin(ss.angle) * ss.len * ss.alpha;

        const starGrad = ctx.createLinearGradient(headX, headY, tailX, tailY);
        starGrad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
        starGrad.addColorStop(0.3, `rgba(155, 89, 104, ${ss.alpha * 0.7})`);
        starGrad.addColorStop(1, 'rgba(8, 9, 13, 0)');

        ctx.strokeStyle = starGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(headX, headY, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw constellation lines connecting placed memory stars
      if (userStars.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(155, 89, 104, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 4]);

        for (let i = 0; i < userStars.length; i++) {
          for (let j = i + 1; j < userStars.length; j++) {
            const s1 = userStars[i];
            const s2 = userStars[j];
            const dx = s1.x - s2.x;
            const dy = s1.y - s2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 180) {
              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // Draw user placed memory stars
      userStars.forEach((star) => {
        star.pulsePhase += dt * 1.8;
        const flare = star.size * (0.85 + Math.sin(star.pulsePhase) * 0.25);

        ctx.save();
        ctx.shadowColor = star.glowColor;
        ctx.shadowBlur = 18;
        ctx.fillStyle = star.glowColor;
        ctx.globalAlpha = 0.95;

        const cx = star.x;
        const cy = star.y;

        ctx.beginPath();
        ctx.moveTo(cx, cy - flare);
        ctx.lineTo(cx + flare * 0.25, cy - flare * 0.25);
        ctx.lineTo(cx + flare, cy);
        ctx.lineTo(cx + flare * 0.25, cy + flare * 0.25);
        ctx.lineTo(cx, cy + flare);
        ctx.lineTo(cx - flare * 0.25, cy + flare * 0.25);
        ctx.lineTo(cx - flare, cy);
        ctx.lineTo(cx - flare * 0.25, cy - flare * 0.25);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas) return;
      const newRect = canvas.getBoundingClientRect();
      canvas.width = newRect.width * dpr;
      canvas.height = newRect.height * dpr;
      ctx.scale(dpr, dpr);
      initSky(newRect.width, newRect.height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [initSky, userStars]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const chimes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const chosenPitch = chimes[Math.floor(Math.random() * chimes.length)];
    soundEngine.playChime(chosenPitch, 3.2);

    const colors = ['#F1EFF0', '#9B5968', '#E6C2C9', '#F3D2D9', '#D9D5D6'];
    const newStar: WishStar = {
      x,
      y,
      size: Math.random() * 5 + 6,
      alpha: 1,
      pulsePhase: Math.random() * Math.PI,
      glowColor: colors[Math.floor(Math.random() * colors.length)],
    };

    setUserStars((prev) => [...prev.slice(-20), newStar]);
  };

  return (
    <section id="miss-me" className="relative py-24 sm:py-32 px-4 overflow-hidden border-t border-[#1C1C26]">
      <div className="max-w-4xl mx-auto text-center">
        {!isRevealed ? (
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-[#9B5968] mb-4 font-serif-luxury">
              {t.tag}
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif-bengali text-[#D9D5D6] mb-8 font-medium">
              {t.preTitle}
            </h2>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsRevealed(true);
                soundEngine.playChime(587.33, 3.0);
              }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#15151C] hover:bg-[#1E1924] border border-[#541E2B] hover:border-[#9B5968] text-[#F1EFF0] rounded-full shadow-lg shadow-[#541E2B]/20 transition-all duration-500 cursor-pointer"
            >
              <Moon className="w-5 h-5 text-[#9B5968] group-hover:text-[#D9D5D6] transition-colors" />
              <span className="text-lg font-serif-bengali font-semibold tracking-wide">
                {t.btnText}
              </span>
              <Sparkles className="w-4 h-4 text-[#85818A] group-hover:rotate-12 transition-transform" />
            </motion.button>

            <p className="text-xs text-[#85818A] mt-4 font-light italic font-serif-luxury">
              {t.btnSub}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl overflow-hidden border border-[#541E2B]/50 bg-[#08090D] shadow-2xl p-6 sm:p-10"
          >
            {/* Sky Canvas */}
            <div className="relative w-full h-[400px] sm:h-[480px] rounded-xl overflow-hidden border border-[#1E1926]/70">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair"
                title="Click anywhere to light a memory star"
              />

              {/* Poetic Message Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-center bg-radial from-transparent via-[#08090D]/35 to-[#08090D]/75">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 1.2 }}
                  className="max-w-xl"
                >
                  <p className="text-2xl sm:text-3xl font-serif-bengali text-[#F1EFF0] leading-relaxed font-semibold text-glow-subtle">
                    {t.revealedMain[0]}
                    <br />
                    {t.revealedMain[1]}
                    <br />
                    {t.revealedMain[2]}
                    <br />
                    {t.revealedMain[3]}
                  </p>
                </motion.div>
              </div>

              {/* Sky interaction hints */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#85818A] pointer-events-auto">
                <span className="flex items-center gap-1.5 bg-[#08090D]/70 px-3.5 py-1.5 rounded-full border border-white/5 backdrop-blur-sm text-[11px] sm:text-xs">
                  <Star className="w-3.5 h-3.5 text-[#9B5968] animate-pulse" />
                  {t.hintText}
                </span>

                <button
                  onClick={() => setIsRevealed(false)}
                  className="flex items-center gap-1 text-xs text-[#85818A] hover:text-[#D9D5D6] bg-[#08090D]/70 px-3 py-1.5 rounded-full border border-white/5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t.closeBtn}
                </button>
              </div>
            </div>

            {/* Quick dedications count if user clicked stars */}
            {userStars.length > 0 && (
              <div className="mt-4 text-xs text-[#9B5968] flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.starCountMsg(userStars.length)}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};
