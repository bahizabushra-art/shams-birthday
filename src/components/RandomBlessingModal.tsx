import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, RefreshCw, Gift, Share2, Check, ShieldCheck } from 'lucide-react';
import { Wish } from '../types.ts';
import { fetchRandomWish } from '../lib/api.ts';
import { appConfig } from '../config/appConfig.ts';
import confetti from 'canvas-confetti';

interface RandomBlessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewWish: (wish: Wish) => void;
}

export const RandomBlessingModal: React.FC<RandomBlessingModalProps> = ({
  isOpen,
  onClose,
  onViewWish,
}) => {
  const [wish, setWish] = useState<Wish | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const loadRandomWish = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRandomWish();
      setWish(data);
      // Gentle celebratory burst
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f43f5e', '#a855f7'],
        });
      } catch {}
    } catch (err: any) {
      setError(err.message || 'Could not catch a star right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRandomWish();
    }
  }, [isOpen]);

  const copyWishLink = async (id: number) => {
    const url = `${window.location.origin}/wish/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      prompt('Link to this blessing:', url);
    }
  };

  if (!isOpen) return null;

  const starConfig = wish
    ? appConfig.availableStarTypes.find((s) => s.id === wish.star_type.toLowerCase()) ||
      appConfig.availableStarTypes[0]
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="glass-panel-golden w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-amber-400/40 shadow-[0_20px_70px_rgba(245,158,11,0.25)] relative overflow-hidden text-center"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Heading */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-medium mb-3">
            <Gift className="w-3.5 h-3.5" />
            <span>Random Cosmic Blessing</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif text-slate-100 font-normal mb-1">
            A little wish found its way to you…
          </h3>
          <p className="text-xs text-slate-400 mb-6 font-light">
            Pulled from the stars dedicated to {appConfig.recipientName}
          </p>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
              <span className="text-xs text-slate-400 tracking-wider">
                Catching a falling star…
              </span>
            </div>
          ) : error ? (
            <div className="py-8">
              <p className="text-rose-300 text-sm mb-4">{error}</p>
              <button
                onClick={loadRandomWish}
                className="px-4 py-2 rounded-full bg-white/10 text-xs text-slate-200 hover:bg-white/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : wish ? (
            <div>
              {/* Star Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                {starConfig?.symbol || '✨'}
              </div>

              {/* Wish content card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/15 text-left mb-6 relative">
                <span className="text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-semibold mb-3 inline-block">
                  {wish.wish_energy}
                </span>

                <p className="text-base sm:text-lg font-serif italic text-slate-100 leading-relaxed mb-4">
                  “{wish.message}”
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    {wish.is_anonymous ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span className="italic">Someone who loves you</span>
                      </>
                    ) : (
                      <span>— {wish.sender_name}</span>
                    )}
                  </div>
                  {wish.one_word && (
                    <span className="text-amber-300/80 italic font-serif text-sm">
                      “{wish.one_word}”
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={loadRandomWish}
                  className="px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-semibold text-xs tracking-wide shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Catch Another Star ✨</span>
                </button>

                <button
                  onClick={() => copyWishLink(wish.id)}
                  className="px-4 py-2.5 rounded-full glass-panel border border-white/15 text-slate-200 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
