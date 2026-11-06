import React, { useState, useEffect } from 'react';
import { PenTool, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/audioSynth';

interface NavbarProps {
  onOpenWhisperModal?: () => void;
  onReopenIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenWhisperModal, onReopenIntro }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLangToggle = (targetLang: 'bn' | 'en') => {
    soundEngine.playChime(659.25, 2.0);
    setLanguage(targetLang);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-[#08090D]/90 backdrop-blur-md border-b border-[#1E1926]/80 py-3 shadow-lg'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={onReopenIntro}
          className="text-base sm:text-lg font-serif-luxury font-medium tracking-wider text-[#F1EFF0] hover:text-[#9B5968] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer text-left"
          title="Click to view intro & teddy bear"
        >
          <span>{t.meta.brand}</span>
          <span className="hidden xl:inline text-xs font-serif-bengali text-[#85818A] font-light">
            · {t.meta.brandSub}
          </span>
        </button>

        {/* Zone 2: clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-serif-bengali text-[#85818A]">
          <a
            href="#memories"
            className="hover:text-[#F1EFF0] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#9B5968]"
          >
            {t.nav.memories}
          </a>
          <a
            href="#diary"
            className="hover:text-[#F1EFF0] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#9B5968]"
          >
            {t.nav.diary}
          </a>
          <a
            href="#novel"
            className="hover:text-[#F1EFF0] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#9B5968]"
          >
            {t.nav.novel}
          </a>
          <a
            href="#heart"
            className="hover:text-[#F1EFF0] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#9B5968]"
          >
            {t.nav.heart}
          </a>
          <a
            href="#midnight"
            className="hover:text-[#F1EFF0] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#9B5968]"
          >
            {t.nav.midnight}
          </a>
        </nav>

        {/* Zone 3: Language Switcher & Primary Action */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Language Switcher Segmented Control */}
          <div className="flex items-center p-0.5 rounded-full bg-[#15151C] border border-[#27212B] text-[11px] font-medium">
            <button
              onClick={() => handleLangToggle('bn')}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                language === 'bn'
                  ? 'bg-[#541E2B] text-[#F1EFF0] shadow-sm'
                  : 'text-[#85818A] hover:text-[#D9D5D6]'
              }`}
              title="বাংলা ভাষায় দেখুন"
            >
              বাংলা
            </button>
            <button
              onClick={() => handleLangToggle('en')}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                language === 'en'
                  ? 'bg-[#541E2B] text-[#F1EFF0] shadow-sm'
                  : 'text-[#85818A] hover:text-[#D9D5D6]'
              }`}
              title="View in English"
            >
              EN
            </button>
          </div>

          <a
            href="#whispers"
            onClick={onOpenWhisperModal}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-serif-bengali font-medium text-[#F1EFF0] bg-[#541E2B]/85 hover:bg-[#752B3B] border border-[#9B5968]/40 rounded-full transition-all duration-300 whitespace-nowrap shrink-0 shadow-sm shadow-[#541E2B]/30"
          >
            <PenTool className="w-3.5 h-3.5 text-[#D9D5D6]" />
            <span>{t.nav.whisperCTA}</span>
          </a>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#85818A] hover:text-[#F1EFF0] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08090D]/98 border-b border-[#1E1926] px-6 py-4 flex flex-col space-y-3 font-serif-bengali text-sm text-[#D9D5D6]">
          <a
            href="#memories"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-white/5 hover:text-[#9B5968]"
          >
            {t.nav.memories}
          </a>
          <a
            href="#diary"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-white/5 hover:text-[#9B5968]"
          >
            {t.nav.diary}
          </a>
          <a
            href="#novel"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-white/5 hover:text-[#9B5968]"
          >
            {t.nav.novel}
          </a>
          <a
            href="#heart"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-white/5 hover:text-[#9B5968]"
          >
            {t.nav.heart}
          </a>
          <a
            href="#midnight"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 hover:text-[#9B5968]"
          >
            {t.nav.midnight}
          </a>
        </div>
      )}
    </header>
  );
};
