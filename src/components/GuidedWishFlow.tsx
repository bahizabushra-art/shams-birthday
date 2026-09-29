import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, ArrowLeft, Check, ShieldCheck, User, X } from 'lucide-react';
import { appConfig, StarTypeConfig } from '../config/appConfig.ts';
import { submitWish } from '../lib/api.ts';
import { Wish } from '../types.ts';

interface GuidedWishFlowProps {
  onWishCreated: (wish: Wish) => void;
  onFinishAndGoToSky: (createdWishId: number) => void;
  onCancel: () => void;
}

export const GuidedWishFlow: React.FC<GuidedWishFlowProps> = ({
  onWishCreated,
  onFinishAndGoToSky,
  onCancel,
}) => {
  // Current screen step: 1 = Name, 2 = Star selection, 3 = Message, 4 = Added confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [senderName, setSenderName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedStar, setSelectedStar] = useState<StarTypeConfig>(appConfig.availableStarTypes[0]);
  const [message, setMessage] = useState('');
  const [oneWord, setOneWord] = useState('');

  // UI submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdWish, setCreatedWish] = useState<Wish | null>(null);

  // Step 1: Submit Name
  const handleNameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnonymous && !senderName.trim()) {
      setErrorMessage('Please enter your name or choose to send anonymously.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(2);
  };

  // Step 2: Choose Star
  const handleStarNext = () => {
    setErrorMessage(null);
    setCurrentStep(3);
  };

  // Step 3: Submit Wish
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMsg = message.trim();
    if (!trimmedMsg) {
      setErrorMessage('Please write a birthday wish for Baby Shams.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await submitWish({
        sender_name: isAnonymous ? 'Someone who loves you' : senderName.trim(),
        message: trimmedMsg,
        wish_energy: 'joy',
        star_type: selectedStar.id,
        one_word: oneWord.trim() || null,
        is_anonymous: isAnonymous,
      });

      // Confetti burst
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#f472b6', '#ffffff'],
        });
      } catch {}

      setCreatedWish(response.wish);
      onWishCreated(response.wish);
      setCurrentStep(4);

      // Auto-transition to sky after 2.8s
      setTimeout(() => {
        onFinishAndGoToSky(response.wish.id);
      }, 2800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send the star right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#070913]/90 backdrop-blur-xl text-slate-100">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,rgba(56,189,248,0.05)_50%,transparent_80%)] pointer-events-none" />

      {/* Top bar with Cancel */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={onCancel}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Exit"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: WHAT IS YOUR NAME */}
          {currentStep === 1 && (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35 }}
              className="glass-panel-golden rounded-3xl p-6 sm:p-10 border border-amber-400/30 shadow-2xl text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                <User className="w-6 h-6" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-normal mb-2">
                What is your name?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-light mb-8 max-w-xs mx-auto">
                Let Baby Shams know who is sending him this little birthday star.
              </p>

              <form onSubmit={handleNameNext} className="space-y-6">
                <div>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    autoFocus
                    value={isAnonymous ? 'Someone who loves you' : senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter your name or family title..."
                    maxLength={60}
                    className={`glass-input w-full px-5 py-3.5 rounded-2xl text-base text-slate-100 placeholder:text-slate-500 text-center ${
                      isAnonymous ? 'opacity-50 cursor-not-allowed bg-slate-900/60' : ''
                    }`}
                  />
                </div>

                {/* Anonymous toggle */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAnonymous(!isAnonymous);
                      setErrorMessage(null);
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isAnonymous
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Send anonymously with love 🤍</span>
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-semibold text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: CHOOSE A STAR */}
          {currentStep === 2 && (
            <motion.div
              key="step-star"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35 }}
              className="glass-panel-golden rounded-3xl p-6 sm:p-9 border border-amber-400/30 shadow-2xl text-center"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <span className="text-xs text-amber-300 font-medium">
                  {selectedStar.meaning}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-normal mb-2">
                Choose a star for Shams
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-light mb-6">
                Pick the little celestial symbol that will glow for him in the night sky.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {appConfig.availableStarTypes.map((star) => {
                  const isSelected = selectedStar.id === star.id;
                  return (
                    <button
                      type="button"
                      key={star.id}
                      onClick={() => setSelectedStar(star)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? `bg-amber-500/20 ${star.tailwindBorder} shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-105`
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-3xl">{star.symbol}</span>
                      <span className="text-xs font-medium text-slate-200">
                        {star.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleStarNext}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-semibold text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 3: WRITE YOUR WISH */}
          {currentStep === 3 && (
            <motion.div
              key="step-message"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35 }}
              className="glass-panel-golden rounded-3xl p-6 sm:p-9 border border-amber-400/30 shadow-2xl text-center"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-amber-300">
                  <span>{selectedStar.symbol}</span>
                  <span className="font-medium">{selectedStar.label}</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-normal mb-1.5">
                Write your birthday wish
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-light mb-6">
                Share a sweet message or blessing for Baby Shams.
              </p>

              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={4}
                    autoFocus
                    required
                    maxLength={appConfig.wishLimit}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Happy 1st Birthday little Shams! May you always grow up healthy, strong, and full of smiles..."
                    className="glass-input w-full p-4 rounded-2xl text-sm sm:text-base text-slate-100 placeholder:text-slate-500 font-light resize-none leading-relaxed"
                  />
                  <div className="text-[11px] text-right text-slate-400 mt-1">
                    {message.length} / {appConfig.wishLimit}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={oneWord}
                    onChange={(e) => setOneWord(e.target.value)}
                    placeholder="One sweet word for Shams (optional, e.g. Sunshine, Angel)..."
                    maxLength={30}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 text-center"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-semibold text-sm sm:text-base tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.55)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Releasing your star…</span>
                    </>
                  ) : (
                    <>
                      <span>Release Star into the Sky 🌟</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: STAR ADDED CONFIRMATION */}
          {currentStep === 4 && (
            <motion.div
              key="step-added"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-panel-golden rounded-3xl p-8 sm:p-12 border border-amber-400/40 shadow-2xl text-center"
            >
              <motion.div
                animate={{ y: [-5, -20, -5], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center text-4xl shadow-[0_0_45px_rgba(245,158,11,0.7)]"
              >
                {selectedStar.symbol}
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
                <Check className="w-3.5 h-3.5" />
                <span>Star Released</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif text-slate-100 font-normal mb-3">
                Your star is added to Shams’s sky! ✨
              </h2>

              <p className="text-slate-300 text-sm max-w-sm mx-auto font-light leading-relaxed mb-8">
                Your blessing is now shining bright alongside everyone else's wishes for Baby Shams.
              </p>

              <button
                type="button"
                onClick={() => onFinishAndGoToSky(createdWish?.id || 0)}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-semibold text-sm tracking-wide shadow-md hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Look at the Night Sky</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
