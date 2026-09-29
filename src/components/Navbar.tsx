import React, { useState } from 'react';
import { Sparkles, Volume2, VolumeX, Gift, Compass } from 'lucide-react';
import { appConfig } from '../config/appConfig.ts';
import { celestialSound } from '../lib/audio.ts';

interface NavbarProps {
  totalWishes: number;
  onOpenRandom: () => void;
  onSelectConstellation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalWishes,
  onOpenRandom,
  onSelectConstellation,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(false);

  const toggleSound = () => {
    const newState = celestialSound.toggle();
    setIsAudioActive(newState);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 max-w-6xl mx-auto w-full">
      <nav className="glass-panel rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.37)] border border-white/10 backdrop-blur-md">
        {/* Brand */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-lg font-medium text-slate-100 group-hover:text-amber-200 transition-colors leading-tight">
              Baby Shams Moni
            </span>
            <span className="text-[10px] text-amber-300/80 tracking-wider uppercase font-light">
              1st Birthday 🎈
            </span>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <button
            onClick={() => scrollTo('create-star')}
            className="hover:text-amber-300 transition-colors cursor-pointer"
          >
            Send a Wish
          </button>
          <button
            onClick={() => scrollTo('wall-of-wishes')}
            className="hover:text-amber-300 transition-colors cursor-pointer"
          >
            Wall of Wishes
          </button>
          <button
            onClick={() => {
              onSelectConstellation();
              scrollTo('wall-of-wishes');
            }}
            className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Constellation</span>
          </button>
          <button
            onClick={onOpenRandom}
            className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-medium transition-colors cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Surprise Shams</span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label={isAudioActive ? 'Mute ambient sound' : 'Play celestial sound'}
            title={isAudioActive ? 'Mute celestial ambience' : 'Play celestial ambience'}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isAudioActive
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Surprise Button on mobile */}
          <button
            onClick={onOpenRandom}
            className="md:hidden p-2 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs"
            title="Surprise Shams"
          >
            <Gift className="w-4 h-4" />
          </button>

          {/* Quick CTA */}
          <button
            onClick={() => scrollTo('create-star')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-semibold text-xs tracking-wide shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
          >
            <span>Wish Shams</span>
            <span className="bg-slate-950/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {totalWishes}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
};
