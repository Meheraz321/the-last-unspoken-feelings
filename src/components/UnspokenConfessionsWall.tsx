import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Flame, Send, MessageCircle } from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

interface Confession {
  id: string;
  sender: string;
  recipient: string;
  text: string;
  date: string;
  candles: number;
}

const INITIAL_CONFESSIONS: Confession[] = [
  {
    id: 'conf-1',
    sender: 'এক নিঃসঙ্গ পথিক · A Solitary Wanderer',
    recipient: 'তোমার জন্য · For You',
    text: 'জানো, তোমার প্রিয় গানটা যখনই কোথাও বাজে, আমি এখনো থমকে দাঁড়াই। কেউ জানে না সেই তিন মিনিটের জন্য আমি আবার আমাদের পুরনো পৃথিবীতে ফিরে যাই। / Whenever your song plays in the café, I freeze for three whole minutes, reliving the universe we once built.',
    date: '০২:১৫ AM',
    candles: 42,
  },
  {
    id: 'conf-2',
    sender: 'Anonymous',
    recipient: 'To My Lost Constellation',
    text: 'I still check if you looked at my story, even though I know you muted me long ago. I hope you found the happiness I failed to give you.',
    date: '11:40 PM',
    candles: 38,
  },
  {
    id: 'conf-3',
    sender: 'একটি অপূর্ণ কবিতা · An Unfinished Verse',
    recipient: 'স্মৃতির ঠিকানায় · To Old Memories',
    text: 'তুমি বলেছিলে কখনো একা ফেলে যাবে না। সেই কথাটা আজও মনে পড়ে, যখন প্রতি রাতে নিজের সাথে একা একা কথা বলি। / You promised you would never leave me alone in the dark. That promise echoes every midnight.',
    date: '৩ দিন আগে · 3d ago',
    candles: 67,
  },
  {
    id: 'conf-4',
    sender: 'S.',
    recipient: 'যার আর কোনো খোঁজ নেই · The Lost Soul',
    text: 'তোমার নম্বরটা কন্ট্যাক্ট লিস্টে আজও সেভ করা আছে। কোনোদিন কল করব না জেনেও কেন ডিলিট করতে পারি না, তার কোনো উত্তর আমার কাছে নেই। / Your number still rests in my contact list; I will never dial it, yet I can never bring myself to erase it.',
    date: '৫ দিন আগে · 5d ago',
    candles: 54,
  },
];

export const UnspokenConfessionsWall: React.FC = () => {
  const [confessions, setConfessions] = useState<Confession[]>(() => {
    try {
      const saved = localStorage.getItem('unspoken_confessions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CONFESSIONS;
  });

  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [text, setText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [litMap, setLitMap] = useState<Record<string, boolean>>({});

  const { language } = useLanguage();
  const t = translations[language].whispers;

  useEffect(() => {
    try {
      localStorage.setItem('unspoken_confessions', JSON.stringify(confessions));
    } catch {
      // ignore
    }
  }, [confessions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newConf: Confession = {
      id: `conf-${Date.now()}`,
      sender: senderName.trim() || (language === 'bn' ? 'এক অচেনা মন' : 'A Silent Heart'),
      recipient: recipientName.trim() || (language === 'bn' ? 'যার জন্য লেখা' : 'To You'),
      text: text.trim(),
      date: language === 'bn' ? 'এইমাত্র' : 'Just now',
      candles: 1,
    };

    soundEngine.playChime(783.99, 3.2); // G5 resonant chime
    setConfessions([newConf, ...confessions]);
    setText('');
    setSenderName('');
    setRecipientName('');
    setShowForm(false);
  };

  const handleLightCandle = (id: string) => {
    if (litMap[id]) return;
    soundEngine.playChime(659.25, 2.5); // E5 chime
    setLitMap((prev) => ({ ...prev, [id]: true }));
    setConfessions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, candles: c.candles + 1 } : c))
    );
  };

  return (
    <section id="whispers" className="relative py-24 sm:py-32 px-4 bg-[#08090D] border-t border-[#1C1C26]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-serif-luxury tracking-widest text-[#9B5968] uppercase">
            {t.tag}
          </span>

          <h2 className="text-2xl sm:text-4xl font-serif-bengali font-semibold text-[#F1EFF0] mt-3 mb-3 text-glow-subtle">
            {t.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#85818A] font-serif-luxury italic mb-8">
            {t.subtitle}
          </p>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs sm:text-sm font-serif-bengali text-[#F1EFF0] bg-[#541E2B]/90 hover:bg-[#752B3B] border border-[#9B5968]/50 shadow-lg shadow-[#541E2B]/30 transition-all duration-300 cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-[#D9D5D6]" />
            <span>{showForm ? t.closeFormBtn : t.openFormBtn}</span>
          </button>
        </div>

        {/* Input Form Drawer */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="max-w-xl mx-auto mb-12 p-6 rounded-2xl bg-[#15151C] border border-[#541E2B]/70 shadow-2xl overflow-hidden"
            >
              <h3 className="text-base font-serif-bengali text-[#F1EFF0] font-medium mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#9B5968]" />
                <span>{t.formTitle}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder={t.senderPlaceholder}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="px-3.5 py-2 text-xs font-serif-bengali bg-[#08090D] border border-white/10 rounded-lg text-[#F1EFF0] placeholder-[#85818A] focus:outline-none focus:border-[#9B5968]"
                />
                <input
                  type="text"
                  placeholder={t.recipientPlaceholder}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="px-3.5 py-2 text-xs font-serif-bengali bg-[#08090D] border border-white/10 rounded-lg text-[#F1EFF0] placeholder-[#85818A] focus:outline-none focus:border-[#9B5968]"
                />
              </div>

              <textarea
                required
                rows={3}
                placeholder={t.textPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-serif-bengali bg-[#08090D] border border-white/10 rounded-lg text-[#F1EFF0] placeholder-[#85818A] focus:outline-none focus:border-[#9B5968] resize-none mb-4"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-1.5 text-xs text-[#85818A] hover:text-[#D9D5D6] cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-serif-bengali text-[#F1EFF0] bg-[#541E2B] hover:bg-[#752B3B] border border-[#9B5968]/50 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.submitBtn}</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Confession Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {confessions.map((c) => {
            const hasLit = litMap[c.id];

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-[#15151C]/60 hover:bg-[#1A1822] border border-[#27212B] p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#85818A] mb-3">
                    <span className="font-serif-bengali text-[#9B5968]">
                      {c.sender} <span className="text-[#85818A]">→</span> {c.recipient}
                    </span>
                    <span className="font-serif-luxury italic text-[11px]">{c.date}</span>
                  </div>

                  <p className="text-sm sm:text-base font-serif-bengali text-[#D9D5D6] leading-relaxed">
                    “{c.text}”
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#85818A]">
                  <span className="font-serif-luxury italic text-[11px]">
                    {t.whisperTag}
                  </span>

                  <button
                    onClick={() => handleLightCandle(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                      hasLit
                        ? 'bg-[#541E2B]/50 text-[#F1EFF0] border border-[#9B5968]/50'
                        : 'bg-[#08090D]/60 hover:bg-[#541E2B]/30 text-[#85818A] hover:text-[#D9D5D6] border border-white/5'
                    }`}
                    title="Light a tribute candle"
                  >
                    <Flame className={`w-3.5 h-3.5 ${hasLit ? 'text-[#9B5968] fill-[#9B5968]' : ''}`} />
                    <span>{c.candles}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
