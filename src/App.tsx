/**
 * The Last Unspoken Feelings – কিছু অনুভূতি কখনো শেষ হয় না...
 * A Deeply Emotional, Heartbreaking & Cinematic Interactive Storytelling Experience
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { IntroCinematicModal } from './components/IntroCinematicModal';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MemoriesSection } from './components/MemoriesSection';
import { WordsNeverSaidSection } from './components/WordsNeverSaidSection';
import { UnfinishedNovelSection } from './components/UnfinishedNovelSection';
import { StarrySkySection } from './components/StarrySkySection';
import { BrokenHeartCanvas } from './components/BrokenHeartCanvas';
import { MidnightThoughtsSection } from './components/MidnightThoughtsSection';
import { UnspokenConfessionsWall } from './components/UnspokenConfessionsWall';
import { FinalGoodbyeSection } from './components/FinalGoodbyeSection';
import { FallingPetalsCanvas } from './components/FallingPetalsCanvas';
import { RealisticRainCanvas } from './components/RealisticRainCanvas';
import { ThreeWorldCanvas } from './components/ThreeWorldCanvas';
import { AudioBar } from './components/AudioBar';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function StoryApp() {
  const [hasEntered, setHasEntered] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [petalsEnabled, setPetalsEnabled] = useState(true);
  const [rainEnabled, setRainEnabled] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalScroll)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleExploreClick = () => {
    const el = document.getElementById('memories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      key={`app-lang-${language}`}
      className={`min-h-screen bg-[#08090D] text-[#D9D5D6] relative selection:bg-[#541E2B] selection:text-[#F1EFF0] ${
        language === 'bn' ? 'font-bengali' : 'font-sans'
      }`}
    >
      {/* 0. Fullscreen Three.js 3D World */}
      <ThreeWorldCanvas scrollProgress={scrollProgress} />

      {/* 1. Opening Cinematic Curtain */}
      <AnimatePresence>
        {!hasEntered && (
          <IntroCinematicModal
            onEnter={() => setHasEntered(true)}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
          />
        )}
      </AnimatePresence>

      {/* 2. Realistic Rain on Glass Canvas */}
      <RealisticRainCanvas enabled={rainEnabled} interactiveWipe={true} />

      {/* 3. Ambient Falling Rose Petals Canvas */}
      <FallingPetalsCanvas enabled={petalsEnabled} density={28} />

      {/* 3. Top Navigation Bar adhering to Top Bar Contract */}
      <Navbar onReopenIntro={() => setHasEntered(false)} />

      {/* Main Story Content Container */}
      <main className="relative z-10">
        {/* Section 4: Hero – A Broken Soul */}
        <HeroSection onExploreClick={handleExploreClick} />

        {/* Section 5: The Memories That Never Die */}
        <MemoriesSection />

        {/* Section 6: The Words I Never Said (Interactive Diary) */}
        <WordsNeverSaidSection />

        {/* Section 6.5: Unfinished Novel & Deep Emotional Bengali Literature */}
        <UnfinishedNovelSection />

        {/* Section 7: If You Ever Miss Me (Starry Sky Reveal) */}
        <StarrySkySection />

        {/* Section 8: The Broken Heart Particle Canvas */}
        <section id="heart" className="relative py-24 sm:py-32 px-4 bg-[#08090D] border-t border-[#1C1C26]">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <span className="text-xs font-serif-luxury tracking-widest text-[#9B5968] uppercase">
              Chapter IV · The Fractured Soul
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif-bengali font-semibold text-[#F1EFF0] mt-3 mb-2 text-glow-subtle">
              নীরবে ভেঙে যাওয়া একটি হৃদয়...
            </h2>
            <p className="text-xs sm:text-sm text-[#85818A] font-serif-luxury italic">
              “The Broken Heart – Particles of grief drifting apart, seeking wholeness”
            </p>
          </div>

          <BrokenHeartCanvas />
        </section>

        {/* Section 9: Midnight Thoughts */}
        <MidnightThoughtsSection />

        {/* Section 11: The Wall of Unspoken Whispers (Visitor messages) */}
        <UnspokenConfessionsWall />

        {/* Section 10: Final Section – The Last Goodbye */}
        <FinalGoodbyeSection />
      </main>

      {/* Bottom Floating Atmospheric Audio & Ambient Controls */}
      <AudioBar
        petalsEnabled={petalsEnabled}
        setPetalsEnabled={setPetalsEnabled}
        rainEnabled={rainEnabled}
        setRainEnabled={setRainEnabled}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <StoryApp />
    </LanguageProvider>
  );
}
