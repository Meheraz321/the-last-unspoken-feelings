import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Moon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/audioSynth';

export const MidnightThoughtsSection: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [liveTime, setLiveTime] = useState('');

  const { language } = useLanguage();
  const t = translations[language].midnight;

  // Live clock tracker
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      setLiveTime(`${hrs}:${mins}:${secs}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const active = t.thoughts[selectedIndex] || t.thoughts[0];

  const handleSelectThought = (idx: number) => {
    soundEngine.playChime(523.25 + idx * 45, 2.0);
    setSelectedIndex(idx);
  };

  return (
    <section id="midnight" className="relative py-24 sm:py-32 px-4 bg-[#0B0C12] border-t border-[#1C1C26] overflow-hidden">
      {/* Background moonlight effect */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-[#151523]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-serif-luxury tracking-widest text-[#9B5968] uppercase">
            {t.chapterTag}
          </span>

          <h2 className="text-2xl sm:text-4xl font-serif-bengali font-semibold text-[#F1EFF0] mt-3 mb-3 text-glow-subtle">
            {t.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#85818A] font-serif-luxury italic">
            {t.subtitle}
          </p>
        </div>

        {/* Digital Clock Box & Interactive Hours */}
        <div className="relative rounded-2xl bg-[#15151C]/70 border border-[#27212B] p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Top Clock Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#08090D] border border-[#541E2B]/50">
                <Clock className="w-5 h-5 text-[#9B5968]" />
              </div>
              <div>
                <span className="text-xs text-[#85818A] font-serif-luxury uppercase tracking-wider block">
                  {t.simulatedHour}
                </span>
                <span className="text-xl sm:text-2xl font-mono text-[#F1EFF0] tracking-wider">
                  {active.hourVal} <span className="text-xs text-[#9B5968]">AM/PM</span>
                </span>
              </div>
            </div>

            {/* Real System Clock */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#85818A] bg-[#08090D]/60 px-3.5 py-1.5 rounded-full border border-white/5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#9B5968] animate-ping" />
              <span>{t.liveTimeLabel}: {liveTime}</span>
            </div>
          </div>

          {/* Midnight Hours Navigation Tabs */}
          <div className="mt-8 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {t.thoughts.map((th, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectThought(idx)}
                className={`px-4 py-2 text-xs font-serif-bengali rounded-full whitespace-nowrap transition-all duration-300 ${
                  selectedIndex === idx
                    ? 'bg-[#541E2B] text-[#F1EFF0] border border-[#9B5968]/70 shadow-md shadow-[#541E2B]/30'
                    : 'bg-[#08090D]/60 text-[#85818A] hover:text-[#D9D5D6] border border-white/5 hover:bg-[#1A1822]'
                }`}
              >
                {th.timeLabel}
              </button>
            ))}
          </div>

          {/* Active Thought Display */}
          <div className="mt-10 py-6 min-h-[200px] flex flex-col items-center justify-center text-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedIndex}-${language}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                {/* Main Midnight Quote */}
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif-bengali font-semibold text-[#F1EFF0] leading-snug sm:leading-relaxed text-glow-subtle">
                  “{active.quote}”
                </h3>

                {/* Context Reflection */}
                <div className="mt-6 pt-5 border-t border-white/5 text-xs sm:text-sm font-serif-bengali text-[#D9D5D6]/70 max-w-lg mx-auto">
                  {active.context}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#85818A]">
            <span className="flex items-center gap-1.5 font-serif-luxury italic">
              <Moon className="w-3.5 h-3.5 text-[#9B5968]" />
              {t.stillnessQuote}
            </span>
            <span className="font-serif-bengali text-[#85818A]">
              {t.footerNote}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
