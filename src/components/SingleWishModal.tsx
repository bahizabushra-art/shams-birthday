import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wish } from '../types.ts';
import { appConfig } from '../config/appConfig.ts';
import { Sparkles, X, Share2, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';

interface SingleWishModalProps {
  wish: Wish | null;
  onClose: () => void;
  onCreateNewWish: () => void;
}

export const SingleWishModal: React.FC<SingleWishModalProps> = ({
  wish,
  onClose,
  onCreateNewWish,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!wish) return null;

  const starConfig =
    appConfig.availableStarTypes.find((s) => s.id === wish.star_type.toLowerCase()) ||
    appConfig.availableStarTypes[0];

  const energyConfig =
    appConfig.availableEnergies.find((e) => e.id === wish.wish_energy.toLowerCase()) || {
      id: wish.wish_energy,
      name: wish.wish_energy,
      badgeBg: 'bg-amber-500/15 border-amber-400/30',
      badgeText: 'text-amber-300',
    };

  const copyWishLink = async () => {
    const url = `${window.location.origin}/wish/${wish.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      prompt('Link to this star:', url);
    }
  };

  const shareWish = async () => {
    const url = `${window.location.origin}/wish/${wish.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `A Birthday Star for ${appConfig.recipientName}`,
          text: `"${wish.message}" — sent with love for ${appConfig.recipientName}`,
          url,
        });
      } catch {}
    } else {
      copyWishLink();
    }
  };

  const formattedDate = () => {
    try {
      return new Date(wish.created_at).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Birthday 2026';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="glass-panel-golden w-full max-w-lg rounded-3xl p-6 sm:p-10 border border-amber-400/40 shadow-[0_25px_80px_rgba(245,158,11,0.3)] relative text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Star orb */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-pulse">
            {starConfig.symbol}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-medium mb-3">
            <Sparkles className="w-3 h-3" />
            <span>A star was created for {appConfig.recipientName}</span>
          </div>

          <p className="text-xs text-slate-400 font-light mb-6">
            Someone sent a little piece of {energyConfig.name.toLowerCase()} into Shams’s universe…
          </p>

          {/* Wish content card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/15 text-left mb-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-semibold">
                {wish.wish_energy} • {formattedDate()}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Star #{wish.id}
              </span>
            </div>

            <p className="text-lg sm:text-xl font-serif italic text-slate-100 leading-relaxed mb-6 font-normal">
              “{wish.message}”
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                {wish.is_anonymous ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span className="italic">From someone who loves you</span>
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

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={shareWish}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-semibold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-2"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-950" /> : <Share2 className="w-4 h-4" />}
              <span>{isCopied ? 'Link Copied!' : 'Share This Star'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onCreateNewWish();
              }}
              className="px-5 py-2.5 rounded-full glass-panel border border-white/15 text-slate-200 hover:text-white hover:border-amber-400/30 text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Create your own star</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
