import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Feather, Copy, Check, Sparkles, BookmarkCheck } from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

export const UnfinishedNovelSection: React.FC = () => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const { language } = useLanguage();
  const t = translations[language].novel;

  const current = t.chapters[activeChapterIndex] || t.chapters[0];

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`${current.poemLines.join('\n')}\n\n${current.novelQuote}`);
    soundEngine.playChime(659.25, 2.0);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleChapterChange = (idx: number) => {
    soundEngine.playChime(523.25 + idx * 60, 2.8);
    setActiveChapterIndex(idx);
  };

  return (
    <section id="novel" className="relative py-28 sm:py-36 px-4 bg-[#08090D]/90 border-t border-[#1C1C26] overflow-hidden">
      {/* Background ambient reading aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#541E2B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-serif-luxury text-[#9B5968] bg-[#15151C] border border-[#541E2B]/40 mb-4">
            <Feather className="w-3.5 h-3.5" />
            <span className="uppercase tracking-widest">{t.tag}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif-bengali font-bold text-[#F1EFF0] mt-2 mb-4 text-glow-subtle">
            {t.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#85818A] font-serif-luxury italic max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Chapter Selection Ribbon */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
          {t.chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => handleChapterChange(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-serif-bengali whitespace-nowrap transition-all duration-300 ${
                activeChapterIndex === idx
                  ? 'bg-[#541E2B] text-[#F1EFF0] border border-[#9B5968]/70 shadow-lg shadow-[#541E2B]/35'
                  : 'bg-[#15151C]/80 text-[#85818A] hover:text-[#D9D5D6] border border-white/5 hover:bg-[#1E1926]'
              }`}
            >
              <BookmarkCheck className={`w-3.5 h-3.5 ${activeChapterIndex === idx ? 'text-[#F1EFF0]' : 'text-[#85818A]'}`} />
              <span>{ch.title}</span>
            </button>
          ))}
        </div>

        {/* Novel Page Container (Vintage Book Layout) */}
        <div className="relative rounded-3xl bg-[#12131A]/90 border border-[#2B222E] shadow-2xl p-6 sm:p-12 backdrop-blur-md">
          {/* Top Page Metadata */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5 text-xs text-[#85818A]">
            <div className="flex items-center gap-2 font-serif-luxury">
              <BookOpen className="w-4 h-4 text-[#9B5968]" />
              <span className="text-[#9B5968] font-medium">{current.chapterNumber}</span>
              <span aria-hidden="true">·</span>
              <span className="italic">{current.subtitle}</span>
            </div>

            <button
              onClick={handleCopyQuote}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-serif-bengali text-[#85818A] hover:text-[#F1EFF0] bg-[#08090D]/70 hover:bg-[#541E2B]/40 border border-white/5 transition-colors"
              title={t.copyBtn}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.copySuccess}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyBtn}</span>
                </>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.id}-${language}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="mt-8 space-y-8"
            >
              {/* Chapter Title */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif-bengali font-bold text-[#F1EFF0] leading-snug">
                  {current.title}
                </h3>
                <p className="text-xs sm:text-sm font-serif-luxury italic text-[#85818A] mt-1">
                  {current.subtitle}
                </p>
              </div>

              {/* Lead Novelistic Prose */}
              <p className="text-base sm:text-xl font-serif-bengali text-[#D9D5D6] leading-relaxed font-light italic border-l-2 border-[#541E2B] pl-4 sm:pl-6">
                “{current.leadProse}”
              </p>

              {/* Body Prose Paragraphs */}
              <div className="space-y-4 font-serif-bengali text-sm sm:text-base text-[#C2BDC0] leading-relaxed font-normal">
                {current.bodyProse.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {/* Heartbreaking Poetry Inset Block */}
              <div className="my-8 p-6 sm:p-8 rounded-2xl bg-[#090A10]/80 border border-[#541E2B]/50 shadow-inner flex flex-col items-center text-center">
                <Sparkles className="w-4 h-4 text-[#9B5968] mb-3 opacity-80" />
                <div className="space-y-2">
                  {current.poemLines.map((line, lIdx) => (
                    <p
                      key={lIdx}
                      className="text-base sm:text-xl font-serif-bengali font-medium text-[#F1EFF0] leading-relaxed tracking-wide text-glow-wine"
                    >
                      {line}
                    </p>
                  ))}
                </div>
                <div className="w-16 h-px bg-[#541E2B]/60 my-4" />
                <span className="text-xs font-serif-luxury italic text-[#85818A]">
                  {t.authorSign}
                </span>
              </div>

              {/* Concluding Novel Epigram */}
              <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm font-serif-bengali text-[#9B5968] italic font-medium">
                  {current.novelQuote}
                </p>

                <div className="text-xs font-serif-luxury text-[#85818A] shrink-0">
                  {t.pageInfo(activeChapterIndex + 1, t.chapters.length).toUpperCase()}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
