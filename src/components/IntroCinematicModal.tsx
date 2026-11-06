import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, Heart, CloudRain } from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import teddyImg from '../assets/images/sad_cute_teddy_bear_1793981693704.jpg';

interface IntroCinematicModalProps {
  onEnter: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
}

export const IntroCinematicModal: React.FC<IntroCinematicModalProps> = ({
  onEnter,
  audioEnabled,
  setAudioEnabled,
}) => {
  const [step, setStep] = useState(0);
  const [teddyInteracted, setTeddyInteracted] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = translations[language].intro;

  useEffect(() => {
    // Reveal lines sequentially
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2400);
    const t3 = setTimeout(() => setStep(3), 4000);
    const t4 = setTimeout(() => setStep(4), 5600);
    const t5 = setTimeout(() => setStep(5), 7200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const handleEnterWorld = () => {
    if (audioEnabled) {
      soundEngine.start();
    }
    soundEngine.playChime(587.33, 2.5);
    onEnter();
  };

  const handleTeddyClick = () => {
    soundEngine.playChime(659.25, 2.8);
    setTeddyInteracted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.4, ease: 'easeInOut' } }}
      className="fixed inset-0 z-50 bg-[#08090D] flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden"
    >
      {/* Cinematic ambient background glow */}
      <div className="absolute inset-0 bg-radial from-[#541E2B]/20 via-[#0B0C12]/80 to-[#08090D] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#E6A05A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="absolute top-5 sm:top-6 right-5 sm:right-6 flex items-center gap-2.5 z-20">
        {/* Language switch */}
        <div className="flex items-center p-0.5 rounded-full bg-[#15151C]/80 border border-[#27212B] text-xs backdrop-blur-md">
          <button
            onClick={() => setLanguage('bn')}
            className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${language === 'bn' ? 'bg-[#541E2B] text-[#F1EFF0]' : 'text-[#85818A] hover:text-[#D9D5D6]'
              }`}
          >
            বাংলা
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${language === 'en' ? 'bg-[#541E2B] text-[#F1EFF0]' : 'text-[#85818A] hover:text-[#D9D5D6]'
              }`}
          >
            EN
          </button>
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs text-[#85818A] hover:text-[#D9D5D6] bg-[#15151C]/60 border border-[#27212B] backdrop-blur-md transition-colors cursor-pointer"
          aria-label="Toggle audio"
        >
          {audioEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#9B5968]" />
              <span className="font-serif-luxury tracking-wide hidden sm:inline">{t.soundOn}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="font-serif-luxury tracking-wide hidden sm:inline">{t.soundMuted}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Entrance Stage */}
      <div className="relative max-w-4xl w-full z-10 flex flex-col items-center">
        {/* Cute Sad Teddy Bear Hero Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center mb-6 cursor-pointer group"
          onClick={handleTeddyClick}
        >
          {/* Streetlamp ambient warm halo around teddy bear */}
          <div className="absolute -inset-4 bg-radial from-[#F59E0B]/20 via-[#541E2B]/15 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          {/* Framed Image with soft vignette edge */}
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border border-[#541E2B]/60 shadow-2xl shadow-black/80 ring-1 ring-white/10 group-hover:border-[#9B5968] transition-all duration-500">
            <img
              src={teddyImg}
              alt="Heartbroken cute teddy bear sitting alone in the rain holding a rose"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090D]/80 via-transparent to-transparent pointer-events-none" />

            {/* Tiny rain icon indicator */}
            <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#08090D]/60 backdrop-blur-sm border border-white/10">
              <CloudRain className="w-3.5 h-3.5 text-[#85818A]" />
            </div>
          </div>

          {/* Interactive Whisper on Teddy Click */}
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-3 text-center"
          >
            <span className="text-[11px] sm:text-xs font-serif-luxury italic text-[#9B5968] flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-[#9B5968] fill-[#9B5968]/40" />
              {teddyInteracted
                ? language === 'bn'
                  ? '“ও এখনো বৃষ্টির জলে ভিজতে ভিজতে অপেক্ষা করছে...”'
                  : '“He is still waiting in the cold rain...”'
                : language === 'bn'
                  ? 'একটি নিঃসঙ্গ মন · মন খারাপের ছোট সঙ্গী'
                  : 'A heartbroken companion waiting in the rain'}
            </span>
          </motion.div>
        </motion.div>

        {/* Sequential Lines Text Container */}
        <div className="min-h-[160px] sm:min-h-[180px] flex flex-col justify-center items-center space-y-3.5 text-center px-4">
          {t.lines.map((lineText, idx) => (
            <AnimatePresence key={idx}>
              {step > idx && (
                <motion.div
                  initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center"
                >
                  <p
                    className={`text-xl sm:text-2xl md:text-3xl font-serif-bengali tracking-wide leading-snug ${idx === 3
                        ? 'text-[#F1EFF0] font-semibold text-glow-wine'
                        : 'text-[#D9D5D6]/90 font-medium'
                      }`}
                  >
                    {lineText}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Welcome Message & Enter Button */}
        <AnimatePresence>
          {step >= 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center space-y-4 pt-3"
            >
              <div className="space-y-1 text-center px-4">
                <h2 className="text-base sm:text-lg font-serif-bengali text-[#9B5968] font-medium tracking-wide">
                  {t.welcome}
                </h2>
                <p className="text-xs text-[#85818A] font-serif-luxury italic">
                  {t.welcomeSub}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEnterWorld}
                className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#541E2B] to-[#3C151E] hover:from-[#752B3B] hover:to-[#541E2B] text-[#F1EFF0] rounded-full border border-[#9B5968]/50 shadow-xl shadow-[#541E2B]/40 transition-all duration-500 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#D9D5D6] group-hover:scale-110 transition-transform fill-[#9B5968]/40" />
                <span className="text-sm sm:text-base font-serif-bengali font-semibold tracking-wider">
                  {t.enterBtn}
                </span>
                <Sparkles className="w-4 h-4 text-[#85818A] group-hover:rotate-12 transition-transform" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip Link */}
        {step < 5 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            whileHover={{ opacity: 1 }}
            onClick={() => setStep(5)}
            className="text-xs text-[#85818A] hover:text-[#D9D5D6] underline underline-offset-4 font-serif-luxury tracking-widest pt-5 transition-opacity cursor-pointer"
          >
            {t.skip}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};