import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Star, Cake } from 'lucide-react';
import { appConfig } from '../config/appConfig.ts';

interface LandingEntranceProps {
  onEnter: () => void;
}

export const LandingEntrance: React.FC<LandingEntranceProps> = ({ onEnter }) => {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'ready'>('intro');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('reveal');
    }, 900);

    const timer2 = setTimeout(() => {
      setPhase('ready');
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05070e] text-center px-4 overflow-hidden"
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,rgba(56,189,248,0.06)_40%,transparent_70%)] pointer-events-none" />

      {/* Floating starry particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-200/70"
            style={{
              top: `${Math.sin(i * 13) * 45 + 50}%`,
              left: `${Math.cos(i * 19) * 45 + 50}%`,
              width: `${(i % 3) + 3}px`,
              height: `${(i % 3) + 3}px`,
            }}
            animate={{
              opacity: [0.2, 0.9, 0.3],
              scale: [0.8, 1.4, 0.9],
              y: [0, -12, 0],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: (i % 6) * 0.3,
            }}
          />
        ))}
      </div>

      {/* Skip button top right */}
      <button
        onClick={onEnter}
        className="absolute top-6 right-6 text-xs text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
      >
        Enter Directly →
      </button>

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
        {/* Animated celestial icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-16 h-16 mb-6 rounded-full bg-gradient-to-tr from-amber-400/20 via-sky-400/20 to-yellow-400/20 border border-amber-300/40 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.35)]"
        >
          <span className="text-3xl">☀️</span>
        </motion.div>

        {/* Lead text */}
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.p
              key="intro-text"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="text-amber-200/90 text-sm sm:text-base tracking-[0.2em] uppercase font-medium mb-3"
            >
              Celebrating a very special 1st Birthday…
            </motion.p>
          )}

          {phase !== 'intro' && (
            <motion.div
              key="reveal-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide mb-4">
                <Cake className="w-3.5 h-3.5 text-amber-300" />
                <span>1 Year Old Today • Born 30 Sept 2025</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-slate-100 to-amber-200 font-normal tracking-tight leading-[1.12] mb-4">
                Happy 1st Birthday, <br />
                <span className="italic font-light text-amber-300">{appConfig.recipientName}</span> 🎈
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto font-light leading-relaxed mb-8">
                365 days of sweet smiles and tiny giggles. Enter and leave a little birthday blessing for baby Shams!
              </p>

              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(245, 158, 11, 0.45)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onEnter}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-semibold tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all cursor-pointer text-sm sm:text-base"
              >
                <span>Enter Shams’s 1st Birthday Universe</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
