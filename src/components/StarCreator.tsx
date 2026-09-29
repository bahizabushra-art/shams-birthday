import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Send, Check, Copy, Share2, Eye, ShieldCheck, Heart, User, Cake } from 'lucide-react';
import { appConfig, WishEnergyConfig, StarTypeConfig } from '../config/appConfig.ts';
import { submitWish } from '../lib/api.ts';
import { Wish } from '../types.ts';

interface StarCreatorProps {
  onWishCreated: (wish: Wish) => void;
  onViewWish: (wish: Wish) => void;
}

export const StarCreator: React.FC<StarCreatorProps> = ({ onWishCreated, onViewWish }) => {
  // Step selections
  const [selectedStar, setSelectedStar] = useState<StarTypeConfig>(appConfig.availableStarTypes[0]);
  const [selectedEnergy, setSelectedEnergy] = useState<WishEnergyConfig>(appConfig.availableEnergies[0]);
  const [isCustomEnergy, setIsCustomEnergy] = useState(false);
  const [customEnergyText, setCustomEnergyText] = useState('');

  // Form fields
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [oneWord, setOneWord] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdWish, setCreatedWish] = useState<Wish | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // When energy changes, pre-fill placeholder suggestion if message is empty
  const handleEnergySelect = (energy: WishEnergyConfig) => {
    setIsCustomEnergy(false);
    setSelectedEnergy(energy);
    if (!message.trim()) {
      setMessage(energy.defaultPrompt);
    }
  };

  const handleCustomEnergySelect = () => {
    setIsCustomEnergy(true);
  };

  const triggerCelebrationConfetti = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#f43f5e', '#ffffff'],
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedMsg = message.trim();
    if (!trimmedMsg) {
      setErrorMsg('Please write a heartfelt birthday blessing for baby Shams.');
      return;
    }

    if (trimmedMsg.length > appConfig.wishLimit) {
      setErrorMsg(`Wish cannot exceed ${appConfig.wishLimit} characters.`);
      return;
    }

    if (!isAnonymous && !senderName.trim()) {
      setErrorMsg('Please provide your name, or toggle anonymous blessing.');
      return;
    }

    const finalEnergy = isCustomEnergy
      ? (customEnergyText.trim() || 'Blessing')
      : selectedEnergy.id;

    setIsSubmitting(true);

    try {
      const response = await submitWish({
        sender_name: isAnonymous ? 'Someone who loves you' : senderName.trim(),
        message: trimmedMsg,
        wish_energy: finalEnergy,
        star_type: selectedStar.id,
        one_word: oneWord.trim() || null,
        is_anonymous: isAnonymous,
      });

      triggerCelebrationConfetti();
      setCreatedWish(response.wish);
      onWishCreated(response.wish);
    } catch (err: any) {
      setErrorMsg(err.message || 'Your star could not take off this time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCreatedWish(null);
    setMessage('');
    setSenderName('');
    setOneWord('');
    setIsAnonymous(false);
    setIsCustomEnergy(false);
    setCustomEnergyText('');
    setSelectedEnergy(appConfig.availableEnergies[0]);
    setSelectedStar(appConfig.availableStarTypes[0]);
    setErrorMsg(null);
  };

  const copyWishLink = async (wishId: number) => {
    const url = `${window.location.origin}/wish/${wishId}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      prompt('Copy this link to your blessing:', url);
    }
  };

  const shareWish = async (wish: Wish) => {
    const url = `${window.location.origin}/wish/${wish.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `1st Birthday Blessing for ${appConfig.recipientName}`,
          text: `I just sent a 1st birthday blessing to Baby ${appConfig.recipientName}! 🎂✨`,
          url,
        });
      } catch (err) {
        // Ignored
      }
    } else {
      copyWishLink(wish.id);
    }
  };

  return (
    <section id="create-star" className="py-14 sm:py-20 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-medium tracking-wide mb-3">
          <Cake className="w-3.5 h-3.5" />
          <span>1st Birthday Blessing Forge</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif text-slate-100 font-normal mb-2">
          Create a Star for Baby Shams 🌟
        </h2>
        <p className="text-slate-300/80 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
          Choose a star, write a sweet blessing, and send it into Shams’s 1st birthday sky.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {createdWish ? (
          /* Success Card View */
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="glass-panel-golden rounded-3xl p-6 sm:p-10 border border-amber-400/40 text-center relative overflow-hidden shadow-[0_15px_60px_rgba(245,158,11,0.2)]"
          >
            {/* Animated launch symbol */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-pulse">
              {selectedStar.symbol}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-medium mb-3">
              <Check className="w-3.5 h-3.5" />
              <span>Blessing Added to Shams’s Universe</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif text-slate-100 font-normal mb-2">
              Your star is now shining for Baby Shams! ✨
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-6 font-light">
              Thank you for sharing your love and blessings on his 1st birthday.
            </p>

            {/* Generated Wish Preview Card */}
            <div className="max-w-md mx-auto glass-panel p-6 rounded-2xl border border-white/15 text-left mb-6 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{selectedStar.symbol}</span>
                <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-medium">
                  {createdWish.wish_energy} • 1st Birthday
                </span>
              </div>
              <p className="text-base sm:text-lg font-serif italic text-slate-100 leading-relaxed mb-4">
                “{createdWish.message}”
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
                <span className="font-medium text-slate-200">
                  — {createdWish.sender_name}
                </span>
                {createdWish.one_word && (
                  <span className="text-amber-300/80 font-serif italic text-sm">
                    “{createdWish.one_word}”
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onViewWish(createdWish)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-semibold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>See My Star</span>
              </button>

              <button
                onClick={() => copyWishLink(createdWish.id)}
                className="px-5 py-2.5 rounded-full glass-panel border border-white/15 text-slate-200 hover:text-white hover:border-amber-400/40 text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Link Copied!' : 'Copy Blessing Link 🔗'}</span>
              </button>

              <button
                onClick={() => shareWish(createdWish)}
                className="px-5 py-2.5 rounded-full glass-panel border border-white/15 text-slate-200 hover:text-white hover:border-indigo-400/40 text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-indigo-300" />
                <span>Share</span>
              </button>

              <button
                onClick={handleResetForm}
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs sm:text-sm transition-all cursor-pointer"
              >
                Send Another Blessing
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main Creation Form */
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl p-6 sm:p-9 border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.6)] space-y-8"
          >
            {/* Step 1: Choose a Star Symbol */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                  Step 1 — Choose a Star Symbol
                </span>
                <span className="text-xs text-slate-400">
                  {selectedStar.meaning}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {appConfig.availableStarTypes.map((star) => {
                  const isSelected = selectedStar.id === star.id;
                  return (
                    <button
                      type="button"
                      key={star.id}
                      onClick={() => setSelectedStar(star)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 group ${
                        isSelected
                          ? `bg-amber-500/15 ${star.tailwindBorder} shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-[1.03]`
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {star.symbol}
                      </span>
                      <span className="text-xs font-medium text-slate-200">
                        {star.label}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight line-clamp-1">
                        {star.meaning}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Your Birthday Blessing */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                  Step 2 — Choose Your Blessing Theme
                </span>
                <span className="text-xs text-slate-400">
                  Select a sentiment for Baby Shams
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {appConfig.availableEnergies.map((energy) => {
                  const isSelected = !isCustomEnergy && selectedEnergy.id === energy.id;
                  return (
                    <button
                      type="button"
                      key={energy.id}
                      onClick={() => handleEnergySelect(energy)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-400/15 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-semibold text-slate-100">
                          {energy.name}
                        </span>
                        {isSelected && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal italic line-clamp-2">
                        “{energy.defaultPrompt}”
                      </p>
                    </button>
                  );
                })}

                {/* Option: Custom feeling */}
                <button
                  type="button"
                  onClick={handleCustomEnergySelect}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isCustomEnergy
                      ? 'bg-amber-400/15 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-semibold text-slate-100">
                      My Own Blessing ✨
                    </span>
                    {isCustomEnergy && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Write your own personal blessing theme
                  </p>
                </button>
              </div>

              {isCustomEnergy && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customEnergyText}
                    onChange={(e) => setCustomEnergyText(e.target.value)}
                    placeholder="Enter your theme (e.g. Endless Giggles, Big Hugs, Bright Future)..."
                    maxLength={40}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>

            {/* Step 3: Write the Birthday Blessing */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label htmlFor="wish-message" className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                  Step 3 — Write Your Birthday Blessing
                </label>
                <span
                  className={`text-xs ${
                    message.length > appConfig.wishLimit - 30 ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {message.length} / {appConfig.wishLimit}
                </span>
              </div>
              <textarea
                id="wish-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a warm, loving message for Baby Shams on his 1st birthday…"
                maxLength={appConfig.wishLimit}
                rows={4}
                required
                className="glass-input w-full p-4 rounded-2xl text-slate-100 text-sm sm:text-base leading-relaxed placeholder:text-slate-500 font-light resize-none transition-all"
              />
            </div>

            {/* Step 4: Add Your Name & Details */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                  Step 4 — Add Your Name
                </span>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    isAnonymous
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Send Secret Blessing 🤍</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sender-name-input" className="block text-xs text-slate-400 mb-1.5">
                    Your name or family title
                  </label>
                  <div className="relative">
                    <input
                      id="sender-name-input"
                      type="text"
                      disabled={isAnonymous}
                      value={isAnonymous ? 'Someone who loves you' : senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Auntie Sarah, Uncle Farhan, Dadu..."
                      maxLength={100}
                      className={`glass-input w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 ${
                        isAnonymous ? 'opacity-60 cursor-not-allowed bg-slate-900/60' : ''
                      }`}
                    />
                    <User className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="one-word-input" className="block text-xs text-slate-400 mb-1.5">
                    One sweet word for Shams <span className="text-slate-500">(optional)</span>
                  </label>
                  <input
                    id="one-word-input"
                    type="text"
                    value={oneWord}
                    onChange={(e) => setOneWord(e.target.value)}
                    placeholder="e.g. Sunshine, Angel, Precious, Champ..."
                    maxLength={30}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
                {errorMsg}
              </div>
            )}

            {/* Step 5: Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Selected:</span>
                <span className="text-slate-200 font-medium">{selectedStar.label}</span>
                <span>•</span>
                <span className="text-slate-200 font-medium">
                  {isCustomEnergy ? (customEnergyText || 'Blessing') : selectedEnergy.name}
                </span>
                {isAnonymous && (
                  <>
                    <span>•</span>
                    <span className="text-amber-300">Anonymous</span>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-semibold text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Adding to Shams’s Universe…</span>
                  </>
                ) : (
                  <>
                    <span>Send Birthday Blessing ✨</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </section>
  );
};
