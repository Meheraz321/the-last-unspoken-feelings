import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, CloudRain, Disc, Sliders, ChevronDown } from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

interface AudioBarProps {
  petalsEnabled: boolean;
  setPetalsEnabled: (val: boolean) => void;
  rainEnabled: boolean;
  setRainEnabled: (val: boolean) => void;
}

export const AudioBar: React.FC<AudioBarProps> = ({
  petalsEnabled,
  setPetalsEnabled,
  rainEnabled,
  setRainEnabled,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [preset, setPreset] = useState<'midnight-rain-piano' | 'solitary-rain' | 'piano-whispers'>('midnight-rain-piano');
  const [isExpanded, setIsExpanded] = useState(false);

  const { language } = useLanguage();
  const t = translations[language].audio;

  useEffect(() => {
    setIsPlaying(soundEngine.getIsPlaying());
    setVolume(soundEngine.getVolume());
  }, []);

  const togglePlay = () => {
    const active = soundEngine.toggle();
    setIsPlaying(active);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
    if (!isPlaying && val > 0) {
      soundEngine.start();
      setIsPlaying(true);
    }
  };

  const handlePresetChange = (newPreset: 'midnight-rain-piano' | 'solitary-rain' | 'piano-whispers') => {
    setPreset(newPreset);
    soundEngine.setPreset(newPreset);
    if (!isPlaying) {
      soundEngine.start();
      setIsPlaying(true);
    }
  };

  return (
    <aside
      aria-label="Ambient atmosphere controls"
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end pointer-events-auto"
    >
      {/* Expanded Controls Drawer */}
      {isExpanded && (
        <div className="mb-2 p-4 w-72 rounded-2xl bg-[#15151C]/95 border border-[#541E2B]/60 shadow-2xl backdrop-blur-md text-xs text-[#D9D5D6] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 font-serif-bengali">
            <span className="font-medium text-[#F1EFF0]">{t.title}</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#85818A] hover:text-[#D9D5D6] cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Sound Preset Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#85818A] uppercase font-serif-luxury tracking-wider">
              {t.modeLabel}
            </span>
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => handlePresetChange('midnight-rain-piano')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-serif-bengali transition-colors flex items-center justify-between cursor-pointer ${
                  preset === 'midnight-rain-piano'
                    ? 'bg-[#541E2B] text-[#F1EFF0]'
                    : 'bg-[#08090D]/60 hover:bg-white/5 text-[#85818A]'
                }`}
              >
                <span>{t.modes.rainPiano}</span>
                <Music className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handlePresetChange('solitary-rain')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-serif-bengali transition-colors flex items-center justify-between cursor-pointer ${
                  preset === 'solitary-rain'
                    ? 'bg-[#541E2B] text-[#F1EFF0]'
                    : 'bg-[#08090D]/60 hover:bg-white/5 text-[#85818A]'
                }`}
              >
                <span>{t.modes.rainGlass}</span>
                <CloudRain className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handlePresetChange('piano-whispers')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-serif-bengali transition-colors flex items-center justify-between cursor-pointer ${
                  preset === 'piano-whispers'
                    ? 'bg-[#541E2B] text-[#F1EFF0]'
                    : 'bg-[#08090D]/60 hover:bg-white/5 text-[#85818A]'
                }`}
              >
                <span>{t.modes.pianoSolo}</span>
                <Disc className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#85818A]">
              <span>{t.volume}</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-[#9B5968] bg-[#08090D] h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Petals & Rain Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-serif-bengali text-xs">{t.petals}</span>
              <button
                onClick={() => setPetalsEnabled(!petalsEnabled)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-serif-bengali transition-colors cursor-pointer ${
                  petalsEnabled
                    ? 'bg-[#541E2B] text-[#F1EFF0]'
                    : 'bg-[#08090D] text-[#85818A]'
                }`}
              >
                {petalsEnabled ? t.toggleOn : t.toggleOff}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-serif-bengali text-xs">{t.rain}</span>
              <button
                onClick={() => setRainEnabled(!rainEnabled)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-serif-bengali transition-colors cursor-pointer ${
                  rainEnabled
                    ? 'bg-[#541E2B] text-[#F1EFF0]'
                    : 'bg-[#08090D] text-[#85818A]'
                }`}
              >
                {rainEnabled ? t.toggleOn : t.toggleOff}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Floating Audio Pill */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#15151C]/90 border border-[#541E2B]/50 shadow-xl backdrop-blur-md">
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-serif-bengali text-[#F1EFF0] bg-[#541E2B]/80 hover:bg-[#752B3B] transition-colors cursor-pointer"
          title={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#F1EFF0] animate-pulse" />
              <span className="hidden sm:inline">{t.statusActive}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#85818A]" />
              <span className="hidden sm:inline">{t.statusMuted}</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-full text-[#85818A] hover:text-[#F1EFF0] hover:bg-white/5 transition-colors cursor-pointer"
          title="Open atmosphere settings"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
