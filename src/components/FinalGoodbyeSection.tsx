import React from 'react';
import { motion } from 'motion/react';
import { ArrowUp, Feather } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/audioSynth';

export const FinalGoodbyeSection: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language].goodbye;

  const handleScrollToTop = () => {
    soundEngine.playChime(523.25, 2.5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen py-28 sm:py-36 px-4 bg-[#050608] flex flex-col items-center justify-center text-center overflow-hidden border-t border-[#1C1C26]">
      {/* Deep dark void with extremely subtle vignette */}
      <div className="absolute inset-0 bg-radial from-[#15151C]/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center space-y-12">
        <span className="text-xs font-serif-luxury tracking-widest text-[#9B5968] uppercase">
          {t.tag}
        </span>

        {/* Sequential Slow Reveal Sentences */}
        <div className="space-y-8 sm:space-y-10">
          {t.sentences.map((sentence, idx) => (
            <motion.div
              key={`${idx}-${language}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 1.1, delay: idx * 0.25 }}
              className="flex flex-col items-center"
            >
              <p className="text-xl sm:text-2xl md:text-3xl font-serif-bengali text-[#D9D5D6] leading-relaxed font-light">
                “{sentence}”
              </p>
            </motion.div>
          ))}
        </div>

        {/* The Climactic Farewell Revelation */}
        <motion.div
          key={`climactic-${language}`}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.8 }}
          className="pt-12 sm:pt-16 pb-8 border-t border-[#27212B]/70 w-full flex flex-col items-center"
        >
          <div className="p-3 rounded-full bg-[#541E2B]/20 border border-[#541E2B]/40 mb-6">
            <Feather className="w-5 h-5 text-[#9B5968]" />
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif-bengali font-bold text-[#F1EFF0] leading-tight text-glow-wine">
            “{t.climactic[0]}
            <br />
            <span className="text-[#9B5968] font-normal">
              {t.climactic[1]}”
            </span>
          </h2>

          {/* Underneath Sub-text */}
          <div className="mt-8 max-w-lg">
            <p className="text-lg sm:text-xl font-serif-bengali text-[#D9D5D6]/90 font-medium">
              “{t.underneath[0]}
              <br />
              {t.underneath[1]}”
            </p>
          </div>
        </motion.div>

        {/* The Single Glowing Rose Petal disappearing into darkness */}
        <div className="relative pt-6 flex flex-col items-center">
          <motion.div
            animate={{
              y: [0, 45, 90],
              opacity: [0.9, 0.5, 0],
              rotate: [0, 20, 45],
            }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-5 h-7 relative"
          >
            <div
              className="w-full h-full rounded-full bg-[#541E2B] shadow-lg shadow-[#9B5968]/50"
              style={{
                clipPath: 'polygon(50% 0%, 100% 40%, 80% 100%, 50% 90%, 20% 100%, 0% 40%)',
              }}
            />
          </motion.div>

          <span className="text-[11px] font-serif-luxury italic text-[#85818A] tracking-widest mt-6">
            {t.dissolvingPetal}
          </span>
        </div>

        {/* Action to revisit / back to top */}
        <div className="pt-10 flex items-center gap-4">
          <button
            onClick={handleScrollToTop}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-serif-bengali text-[#D9D5D6] hover:text-[#F1EFF0] bg-[#15151C] hover:bg-[#1E1926] border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-[#9B5968]" />
            <span>{t.returnBtn}</span>
          </button>
        </div>

        {/* Footer quiet copyright */}
        <footer className="pt-12 text-center text-xs text-[#85818A] font-serif-luxury tracking-wide border-t border-white/5 w-full">
          <p>{t.copyright}</p>
          <p className="mt-1 text-[11px] opacity-60">{t.dedication}</p>
        </footer>
      </div>
    </section>
  );
};
