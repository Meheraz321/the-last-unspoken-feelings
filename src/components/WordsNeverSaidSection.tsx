import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/audioSynth';
import vintageImg from '../../assets/images/vintage_journal_letter_1793979600973.jpg';

export const WordsNeverSaidSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const { language } = useLanguage();
  const t = translations[language].diary;

  const currentEntry = t.pages[currentPage] || t.pages[0];
  const fullText = currentEntry.paragraphs.join('\n\n');

  // Typewriter effect on page or language switch
  useEffect(() => {
    setIsTyping(true);
    setTypewriterIndex(0);

    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx += 2;
      setTypewriterIndex(charIdx);
      if (charIdx >= fullText.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [currentPage, fullText, language]);

  const handleNext = () => {
    if (currentPage < t.pages.length - 1) {
      soundEngine.playChime(587.33, 2.0);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      soundEngine.playChime(523.25, 2.0);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const restartTyping = () => {
    soundEngine.playChime(659.25, 2.0);
    setIsTyping(true);
    setTypewriterIndex(0);
    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx += 2;
      setTypewriterIndex(charIdx);
      if (charIdx >= fullText.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 28);
  };

  return (
    <section id="diary" className="relative py-24 sm:py-32 px-4 bg-[#08090D] overflow-hidden border-t border-[#1C1C26]">
      {/* Decorative background aura */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#541E2B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
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

        {/* Vintage Diary Book Container */}
        <div className="relative rounded-2xl bg-[#15151C]/80 border border-[#27212B] shadow-2xl p-6 sm:p-10 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Vintage Journal Still Life Image */}
            <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-[#27212B] group">
              <img
                src={vintageImg}
                alt="Vintage open handwritten diary with fountain pen and a dried dark rose petal"
                className="w-full h-72 sm:h-96 lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-4 left-4 right-4 text-xs text-[#D9D5D6]/90 font-serif-luxury italic">
                {t.pageIndicator(currentPage + 1, t.pages.length)}
              </div>
            </div>

            {/* Right Column: Handwritten Ink & Typewriter Prose */}
            <div className="lg:col-span-7 flex flex-col justify-between min-h-[380px] sm:min-h-[420px]">
              <div>
                {/* Entry header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5 text-xs text-[#85818A]">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#9B5968]" />
                    <span className="font-serif-luxury tracking-wide">{currentEntry.date}</span>
                  </div>

                  <button
                    onClick={restartTyping}
                    className="flex items-center gap-1 text-[11px] text-[#85818A] hover:text-[#D9D5D6] transition-colors"
                    title={t.replayTyping}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.replayTyping}</span>
                  </button>
                </div>

                {/* Entry Title */}
                <h3 className="text-base sm:text-lg font-serif-bengali text-[#9B5968] font-medium mt-4 mb-4">
                  {currentEntry.title}
                </h3>

                {/* Typewriter Prose Body with handwriting style */}
                <div className="relative font-serif-bengali text-base sm:text-xl text-[#F1EFF0] leading-relaxed whitespace-pre-line tracking-wide min-h-[180px]">
                  {fullText.slice(0, typewriterIndex)}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-5 bg-[#9B5968] ml-1 animate-pulse" />
                  )}
                </div>

                {/* Concluding Quote */}
                {!isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mt-6 pt-4 border-t border-white/5"
                  >
                    <p className="text-xs sm:text-sm font-serif-luxury italic text-[#85818A] leading-relaxed">
                      {currentEntry.quote}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Diary Page Navigation */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-1.5 text-xs font-serif-bengali px-3.5 py-1.5 rounded-full border transition-all ${currentPage === 0
                      ? 'opacity-30 border-white/5 cursor-not-allowed text-[#85818A]'
                      : 'border-white/10 hover:border-[#9B5968] text-[#D9D5D6] hover:bg-white/5'
                    }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t.prevPage}</span>
                </button>

                <div className="text-xs font-serif-luxury tracking-widest text-[#85818A]">
                  {t.pageIndicator(currentPage + 1, t.pages.length).toUpperCase()}
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentPage === t.pages.length - 1}
                  className={`flex items-center gap-1.5 text-xs font-serif-bengali px-3.5 py-1.5 rounded-full border transition-all ${currentPage === t.pages.length - 1
                      ? 'opacity-30 border-white/5 cursor-not-allowed text-[#85818A]'
                      : 'border-white/10 hover:border-[#9B5968] text-[#D9D5D6] hover:bg-white/5'
                    }`}
                >
                  <span>{t.nextPage}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};