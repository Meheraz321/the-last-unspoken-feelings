import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CloudRain, HeartCrack, ChevronDown } from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import heroBgImg from '../assets/images/hero_lonely_silhouette_1793979599298.jpg';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { language } = useLanguage();
  const t = translations[language].hero;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[94vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16 px-4">
      {/* Background Cinematic Silhouette Image with Parallax Drift */}
      <div
        className="absolute inset-0 z-0 transition-transform duration-700 ease-out pointer-events-none"
        style={{
          transform: `scale(1.08) translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
        }}
      >
        <img
          src={heroBgImg}
          alt="Lonely silhouette standing under a solitary streetlamp in the rain"
          className="w-full h-full object-cover object-center brightness-[0.82] contrast-[1.08]"
          referrerPolicy="no-referrer"
        />

        {/* Breathing Streetlamp Glow Pulse */}
        <div
          className="absolute pointer-events-none rounded-full blur-3xl"
          style={{
            top: '18%',
            left: '38%',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(230, 160, 90, 0.35) 0%, rgba(84, 30, 43, 0.15) 50%, transparent 80%)',
            animation: 'lampBreath 4.5s ease-in-out infinite',
          }}
        />

        {/* Cinematic Vignette & Deep Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/75 to-[#08090D]/40" />
        <div className="cinematic-vignette absolute inset-0 pointer-events-none" />
      </div>

      {/* Atmospheric misty rain streaks overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 film-grain" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Subtle kicker text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          className="flex items-center gap-2 text-xs sm:text-sm text-[#9B5968] font-serif-luxury uppercase tracking-widest mb-6"
        >
          <CloudRain className="w-3.5 h-3.5 text-[#85818A] animate-bounce" />
          <span>{t.kicker}</span>
        </motion.div>

        {/* Main Headline with subtle breathing text glow */}
        <motion.h1
          key={`headline-${language}`}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl md:text-6xl font-serif-bengali font-semibold text-[#F1EFF0] leading-tight sm:leading-tight md:leading-snug tracking-tight text-glow-subtle max-w-3xl"
        >
          {t.headlinePre}
          <br />
          <span className="text-[#9B5968] italic font-normal">
            {t.headlinePost}
          </span>
        </motion.h1>

        {/* Supporting Emotional Text */}
        <motion.div
          key={`subtext-${language}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="mt-8 sm:mt-10 max-w-2xl text-center px-4"
        >
          <p className="text-base sm:text-xl font-serif-bengali text-[#D9D5D6]/90 leading-relaxed font-light">
            {t.subtextPre}
            <br />
            {t.subtextMid}
            <br />
            {t.subtextPost}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.7 }}
          className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#memories"
            onClick={() => {
              soundEngine.playChime(440, 2.5);
              onExploreClick();
            }}
            className="group flex items-center gap-2.5 px-6 py-3.5 text-sm font-serif-bengali text-[#F1EFF0] bg-[#541E2B]/90 hover:bg-[#752B3B] border border-[#9B5968]/50 rounded-full shadow-xl shadow-[#541E2B]/35 transition-all duration-300 cursor-pointer"
          >
            <HeartCrack className="w-4 h-4 text-[#D9D5D6] group-hover:scale-110 transition-transform" />
            <span>{t.exploreBtn}</span>
          </a>

          <a
            href="#diary"
            onClick={() => soundEngine.playChime(523.25, 2.5)}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-serif-bengali text-[#D9D5D6] hover:text-[#F1EFF0] bg-[#15151C]/80 hover:bg-[#1E1926] border border-white/10 rounded-full transition-all duration-300 backdrop-blur-md cursor-pointer"
          >
            <span>{t.readDiaryBtn}</span>
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-14 sm:mt-16 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={onExploreClick}
        >
          <span className="text-[11px] font-serif-luxury tracking-widest text-[#85818A] uppercase">
            {t.scrollHint}
          </span>
          <ChevronDown className="w-4 h-4 text-[#9B5968]" />
        </motion.div>
      </div>

      <style>{`
        @keyframes lampBreath {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50% { transform: scale(1.18); opacity: 0.95; }
        }
      `}</style>
    </section>
  );
};
