import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Compass, Volume2, VolumeX, Heart, Cake } from 'lucide-react';
import { appConfig } from '../config/appConfig.ts';
import { celestialSound } from '../lib/audio.ts';

interface WelcomeViewProps {
  totalWishes: number;
  onStartSendWish: () => void;
  onExploreSky: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  totalWishes,
  onStartSendWish,
  onExploreSky,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(false);

  const toggleSound = () => {
    const active = celestialSound.toggle();
    setIsAudioActive(active);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 text-center text-slate-100 z-10">
      {/* Top Bar with sound toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-xs text-amber-300">
          <Cake className="w-3.5 h-3.5" />
          <span>1st Birthday • 30 Sept 2025</span>
        </div>

        <button
          onClick={toggleSound}
          aria-label="Toggle celestial audio"
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${
            isAudioActive
              ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAudioActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Centered Content */}
      <div className="max-w-xl mx-auto flex flex-col items-center my-auto py-10">
        {/* Soft glowing sun / star badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-20 h-20 mb-6 rounded-full bg-gradient-to-tr from-amber-400/20 via-yellow-400/20 to-amber-500/20 border border-amber-300/40 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(245,158,11,0.3)]"
        >
          <span>☀️</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-serif text-slate-100 font-light tracking-tight leading-[1.1] mb-4"
        >
          Happy 1st Birthday, <br />
          <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
            {appConfig.recipientName}
          </span> 🎈
        </motion.h1>

        {/* Sweet Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-slate-300 text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed mb-8"
        >
          One whole year of sweet smiles, tiny giggles, and pure joy. Add your own little star to Baby Shams’s night sky.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <button
            onClick={onStartSendWish}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-semibold text-sm sm:text-base tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            <span>Send a Birthday Star 🌟</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreSky}
            className="w-full sm:w-auto px-6 py-4 rounded-full glass-panel border border-white/15 text-slate-200 hover:text-white hover:border-amber-400/30 text-sm sm:text-base font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-amber-300" />
            <span>Look at Shams’s Sky</span>
            <span className="bg-white/10 text-amber-200 px-2 py-0.5 rounded-full text-xs ml-1 font-semibold">
              {totalWishes}
            </span>
          </button>
        </motion.div>
      </div>

      {/* Bottom Minimal Footer */}
      <div className="text-[11px] text-slate-500 font-light flex items-center gap-1.5 pb-2">
        <Heart className="w-3 h-3 text-rose-400" />
        <span>Made with love for Baby Shams Moni • Born 30 September 2025</span>
      </div>
    </div>
  );
};
