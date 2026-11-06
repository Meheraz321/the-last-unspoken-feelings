import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Clock, MessageSquare, MapPin, X, Flame, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import memoryRainImg from '../assets/images/faded_memory_rain_1793979600381.jpg';

interface MemoryCardItem {
  id: string;
  title: string;
  category: string;
  timeTag: string;
  detailStory: string;
  chatTranscript?: { sender: string; text: string; time: string }[];
}

export const MemoriesSection: React.FC = () => {
  const [activeMemory, setActiveMemory] = useState<MemoryCardItem | null>(null);
  const [litMemories, setLitMemories] = useState<Record<string, number>>({
    'mem-1': 142,
    'mem-2': 189,
    'mem-3': 324,
    'mem-4': 210,
  });

  const { language } = useLanguage();
  const t = translations[language].memories;

  const cardIcons = [Bookmark, Clock, MessageSquare, MapPin];

  const handleLightCandle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playChime(659.25, 2.5); // E5 warm chime
    setLitMemories((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  return (
    <section id="memories" className="relative py-24 sm:py-32 px-4 bg-[#0B0C12]/60 overflow-hidden">
      {/* Decorative background aura */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#541E2B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#151523]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-serif-luxury tracking-widest text-[#9B5968] uppercase">
            {t.chapterTag}
          </span>

          <h2 className="text-2xl sm:text-4xl font-serif-bengali font-semibold text-[#F1EFF0] mt-3 mb-4 text-glow-subtle">
            {t.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#85818A] font-serif-luxury italic">
            {t.subtitle}
          </p>
        </div>

        {/* 4 Emotional Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {t.cards.map((card, idx) => {
            const Icon = cardIcons[idx % cardIcons.length];
            const isLit = (litMemories[card.id] || 0) > 0;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: idx * 0.15 }}
                whileHover={{ y: -4 }}
                onClick={() => setActiveMemory(card)}
                className="group relative cursor-pointer rounded-2xl bg-[#15151C]/70 hover:bg-[#1A1822] border border-[#27212B] hover:border-[#541E2B]/80 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 shadow-lg shadow-black/40 flex flex-col justify-between"
              >
                {/* Top card metadata */}
                <div>
                  <div className="flex items-center justify-between text-xs text-[#85818A] mb-5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-[#9B5968]" />
                      <span>{card.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-serif-luxury italic">{card.timeTag}</span>
                    </div>

                    <button
                      onClick={(e) => handleLightCandle(card.id, e)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-[#08090D]/60 hover:bg-[#541E2B]/40 text-[#D9D5D6] border border-white/5 transition-colors"
                      title={t.candleTribute}
                    >
                      <Flame className={`w-3.5 h-3.5 ${isLit ? 'text-[#9B5968] fill-[#9B5968]' : 'text-[#85818A]'}`} />
                      <span>{litMemories[card.id]}</span>
                    </button>
                  </div>

                  {/* Emotional Message */}
                  <h3 className="text-lg sm:text-xl font-serif-bengali text-[#F1EFF0] font-medium leading-relaxed group-hover:text-[#F1EFF0] transition-colors">
                    “{card.title}”
                  </h3>
                </div>

                {/* Card footer CTA */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#85818A] group-hover:text-[#9B5968] transition-colors">
                  <span className="font-serif-bengali">{t.readMore}</span>
                  <Sparkles className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Nostalgic rain photography callout strip */}
        <div className="mt-12 rounded-2xl overflow-hidden border border-[#27212B] relative h-48 sm:h-56 flex items-center justify-center p-6 text-center">
          <img
            src={memoryRainImg}
            alt="Raindrops trickling on window pane overlooking night city bokeh"
            className="absolute inset-0 w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[#08090D]/60 backdrop-blur-[2px]" />
          <div className="relative z-10 max-w-xl">
            <p className="text-base sm:text-lg font-serif-bengali text-[#F1EFF0] font-light leading-relaxed">
              {t.callout}
            </p>
          </div>
        </div>
      </div>

      {/* Detail Memory Modal */}
      <AnimatePresence>
        {activeMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090D]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-lg bg-[#15151C] border border-[#541E2B] rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveMemory(null)}
                className="absolute top-5 right-5 p-1.5 text-[#85818A] hover:text-[#F1EFF0] rounded-full hover:bg-white/5 transition-colors"
                aria-label={t.modalClose}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-[#9B5968] font-serif-luxury uppercase tracking-wider mb-3">
                <span>{activeMemory.category}</span>
                <span aria-hidden="true">·</span>
                <span>{activeMemory.timeTag}</span>
              </div>

              <h4 className="text-xl font-serif-bengali font-semibold text-[#F1EFF0] leading-snug">
                “{activeMemory.title}”
              </h4>

              {/* Memory Story Prose */}
              <div className="mt-5 text-sm sm:text-base font-serif-bengali text-[#D9D5D6]/90 leading-relaxed space-y-3">
                <p>{activeMemory.detailStory}</p>
              </div>

              {/* Optional Old Chat Transcript */}
              {activeMemory.chatTranscript && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <span className="text-xs text-[#85818A] font-serif-bengali block mb-3">
                    {t.archivedTitle}
                  </span>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {activeMemory.chatTranscript.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'
                          }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-serif-bengali ${msg.sender === 'me'
                              ? 'bg-[#541E2B]/80 text-[#F1EFF0] rounded-br-none'
                              : 'bg-[#27212B]/90 text-[#D9D5D6] rounded-bl-none'
                            }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-[#85818A] mt-0.5 px-1 font-mono">
                          {msg.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Light candle inside modal */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={(e) => handleLightCandle(activeMemory.id, e)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-serif-bengali bg-[#541E2B]/70 hover:bg-[#752B3B] text-[#F1EFF0] transition-colors"
                >
                  <Flame className="w-4 h-4 text-[#F1EFF0] fill-[#9B5968]" />
                  <span>{t.candleTribute} ({litMemories[activeMemory.id] || 0})</span>
                </button>

                <button
                  onClick={() => setActiveMemory(null)}
                  className="text-xs text-[#85818A] hover:text-[#D9D5D6]"
                >
                  {t.modalClose}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};