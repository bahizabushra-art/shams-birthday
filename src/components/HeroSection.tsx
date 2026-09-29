import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowDown, Gift, Compass, Cake } from 'lucide-react';
import { appConfig } from '../config/appConfig.ts';

interface HeroSectionProps {
  totalWishes: number;
  onSendWishClick: () => void;
  onSeeAllClick: () => void;
  onOpenRandom: () => void;
  onConstellationClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalWishes,
  onSendWishClick,
  onSeeAllClick,
  onOpenRandom,
  onConstellationClick,
}) => {
  return (
    <section className="relative pt-12 sm:pt-20 pb-12 px-4 text-center max-w-4xl mx-auto flex flex-col items-center">
      {/* 1st Birthday Milestone Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-400/20 to-amber-500/15 border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-medium tracking-wide mb-5 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
      >
        <Cake className="w-3.5 h-3.5 text-amber-300" />
        <span>{appConfig.hero.badge}</span>
      </motion.div>

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-light text-slate-100 tracking-tight leading-[1.08] mb-5"
      >
        Happy 1st Birthday, <br />
        <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.3)]">
          {appConfig.recipientName}
        </span> 🎈
      </motion.h1>

      {/* Sweet Narrative */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="max-w-2xl mx-auto mb-6 space-y-1.5 text-slate-300 text-base sm:text-lg font-light"
      >
        <p className="leading-relaxed">
          {appConfig.hero.leadOne}
        </p>
        <p className="text-xl sm:text-2xl font-serif italic text-amber-200 font-medium">
          “{appConfig.hero.leadTwo}”
        </p>
      </motion.div>

      {/* Live wish counter badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="glass-panel px-4 py-2 rounded-full inline-flex items-center gap-2.5 text-xs sm:text-sm text-slate-200 border border-white/10 mb-7 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
        </span>
        <span>
          <strong className="text-amber-300 font-semibold">{totalWishes} {totalWishes === 1 ? 'blessing' : 'blessings'}</strong> sent to baby Shams.
        </span>
      </motion.div>

      {/* Main Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-4 mb-8 w-full sm:w-auto"
      >
        <button
          onClick={onSendWishClick}
          className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-semibold text-sm sm:text-base tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{appConfig.hero.primaryCta}</span>
          <Sparkles className="w-4 h-4" />
        </button>

        <button
          onClick={onSeeAllClick}
          className="w-full sm:w-auto px-6 py-3.5 rounded-full glass-panel border border-white/15 text-slate-200 hover:text-white hover:border-amber-400/40 hover:bg-white/10 font-medium text-sm sm:text-base tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{appConfig.hero.secondaryCta}</span>
          <ArrowDown className="w-4 h-4 text-slate-400" />
        </button>
      </motion.div>

      {/* Quick Discovery Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg"
      >
        <button
          onClick={onOpenRandom}
          className="glass-panel p-3.5 rounded-2xl border border-white/10 hover:border-amber-400/40 hover:bg-white/5 transition-all text-left flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-medium text-slate-100 group-hover:text-amber-200">
              Surprise Blessing ✨
            </h2>
            <p className="text-[11px] text-slate-400">
              Read a random loving wish for Shams
            </p>
          </div>
        </button>

        <button
          onClick={onConstellationClick}
          className="glass-panel p-3.5 rounded-2xl border border-white/10 hover:border-indigo-400/40 hover:bg-white/5 transition-all text-left flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-medium text-slate-100 group-hover:text-indigo-200">
              Constellation Mode 🌌
            </h2>
            <p className="text-[11px] text-slate-400">
              Explore glowing blessings in the sky
            </p>
          </div>
        </button>
      </motion.div>
    </section>
  );
};
