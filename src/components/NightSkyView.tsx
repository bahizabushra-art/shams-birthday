import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wish } from '../types.ts';
import { appConfig } from '../config/appConfig.ts';
import { deleteWishApi } from '../lib/api.ts';
import {
  Sparkles,
  Plus,
  Home,
  X,
  Volume2,
  VolumeX,
  List,
  Share2,
  Check,
  ShieldCheck,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { celestialSound } from '../lib/audio.ts';

interface NightSkyViewProps {
  wishes: Wish[];
  newlyAddedWishId?: number | null;
  onGoHome: () => void;
  onAddNewWish: () => void;
  onWishDeleted: (deletedId: number) => void;
  initialSelectedWish?: Wish | null;
}

interface SkyStar {
  wish: Wish;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  symbol: string;
  glowHex: string;
  isNew: boolean;
  pulseOffset: number;
  driftSpeedX: number;
  driftSpeedY: number;
}

export const NightSkyView: React.FC<NightSkyViewProps> = ({
  wishes,
  newlyAddedWishId,
  onGoHome,
  onAddNewWish,
  onWishDeleted,
  initialSelectedWish,
}) => {
  const [selectedWish, setSelectedWish] = useState<Wish | null>(initialSelectedWish || null);
  const [hoveredWish, setHoveredWish] = useState<{ wish: Wish; x: number; y: number } | null>(null);
  const [showListView, setShowListView] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Deletion state
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const toggleSound = () => {
    const active = celestialSound.toggle();
    setIsAudioActive(active);
  };

  const getStarMeta = (starType: string) => {
    const found = appConfig.availableStarTypes.find((s) => s.id === starType.toLowerCase());
    return found || appConfig.availableStarTypes[0];
  };

  useEffect(() => {
    if (initialSelectedWish) {
      setSelectedWish(initialSelectedWish);
    }
  }, [initialSelectedWish]);

  const handleDelete = async (wishId: number) => {
    setIsDeleting(true);
    try {
      await deleteWishApi(wishId);
      onWishDeleted(wishId);
      if (selectedWish?.id === wishId) {
        setSelectedWish(null);
      }
      setConfirmDeleteId(null);
    } catch (err: any) {
      alert(err.message || 'Could not remove star. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Canvas interactive rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      computeStars();
    };

    window.addEventListener('resize', handleResize);

    let skyStars: SkyStar[] = [];

    const computeStars = () => {
      skyStars = wishes.map((wish, idx) => {
        const meta = getStarMeta(wish.star_type);
        const isNew = wish.id === newlyAddedWishId;

        let x = 0;
        let y = 0;

        if (isNew) {
          x = width * 0.5 + (Math.random() * 40 - 20);
          y = height * 0.38 + (Math.random() * 30 - 15);
        } else {
          // Golden ratio spiral distribution
          const angle = idx * 137.5 * (Math.PI / 180);
          const r = Math.min(width, height) * 0.42 * Math.sqrt((idx + 1) / Math.max(8, wishes.length));
          x = width / 2 + Math.cos(angle) * r + (Math.sin(idx * 4.3) * 22);
          y = height / 2 + Math.sin(angle) * r * 0.72 + (Math.cos(idx * 3.7) * 22);
        }

        // Keep inside bounds
        x = Math.max(50, Math.min(width - 50, x));
        y = Math.max(90, Math.min(height - 100, y));

        return {
          wish,
          x,
          y,
          baseX: x,
          baseY: y,
          size: isNew ? 11 : 7.5,
          symbol: meta.symbol,
          glowHex: meta.glowHex,
          isNew,
          pulseOffset: idx * 0.45,
          driftSpeedX: (Math.random() * 0.4 - 0.2),
          driftSpeedY: (Math.random() * 0.4 - 0.2),
        };
      });
    };

    computeStars();

    let frame = 0;
    const render = () => {
      frame += 0.022;
      ctx.clearRect(0, 0, width, height);

      // Draw faint, dreamy constellation lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      for (let i = 0; i < skyStars.length; i++) {
        for (let j = i + 1; j < skyStars.length; j++) {
          const dx = skyStars[i].x - skyStars[j].x;
          const dy = skyStars[i].y - skyStars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 155) {
            ctx.beginPath();
            ctx.moveTo(skyStars[i].x, skyStars[i].y);
            ctx.lineTo(skyStars[j].x, skyStars[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw each wish star
      for (const star of skyStars) {
        // Soft floating drift
        star.x = star.baseX + Math.sin(frame * 0.8 + star.pulseOffset) * 6;
        star.y = star.baseY + Math.cos(frame * 0.8 + star.pulseOffset) * 5;

        const pulse = Math.sin(frame + star.pulseOffset) * 2;
        const currentRadius = star.size + pulse;

        // Big outer aura if newly created
        if (star.isNew) {
          const auraGrad = ctx.createRadialGradient(star.x, star.y, 1, star.x, star.y, currentRadius * 5.5);
          auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.5)');
          auraGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.18)');
          auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(star.x, star.y, currentRadius * 5.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Multi-layered warm glowing corona
        const glowGrad = ctx.createRadialGradient(star.x, star.y, 1, star.x, star.y, currentRadius * 3.6);
        glowGrad.addColorStop(0, star.glowHex + 'dd');
        glowGrad.addColorStop(0.5, star.glowHex + '44');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(star.x, star.y, currentRadius * 3.6, 0, Math.PI * 2);
        ctx.fill();

        // Bright sparkling core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, Math.max(3, currentRadius * 0.65), 0, Math.PI * 2);
        ctx.fill();

        // Soft sender name label under each star
        ctx.font = '10px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
        ctx.textAlign = 'center';
        ctx.fillText(star.wish.sender_name, star.x, star.y + currentRadius + 14);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Mouse & Touch interaction
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const pos = getPos(e);
      let found: SkyStar | null = null;
      for (const s of skyStars) {
        const dx = pos.x - s.x;
        const dy = pos.y - s.y;
        if (Math.sqrt(dx * dx + dy * dy) < 28) {
          found = s;
          break;
        }
      }

      if (found) {
        canvas.style.cursor = 'pointer';
        setHoveredWish({ wish: found.wish, x: found.x, y: found.y });
      } else {
        canvas.style.cursor = 'default';
        setHoveredWish(null);
      }
    };

    const handleCanvasClick = (e: MouseEvent | TouchEvent) => {
      const pos = getPos(e);
      for (const s of skyStars) {
        const dx = pos.x - s.x;
        const dy = pos.y - s.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
          setSelectedWish(s.wish);
          break;
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasClick, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('touchstart', handleCanvasClick);
      cancelAnimationFrame(animId);
    };
  }, [wishes, newlyAddedWishId]);

  const copyWishLink = async (id: number) => {
    const url = `${window.location.origin}/wish/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      prompt('Link to this star:', url);
    }
  };

  const shareWish = async (wish: Wish) => {
    const url = `${window.location.origin}/wish/${wish.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `1st Birthday Blessing for Shams`,
          text: `"${wish.message}" — for Baby Shams Moni ✨`,
          url,
        });
      } catch {}
    } else {
      copyWishLink(wish.id);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-20 flex flex-col bg-[#05070e] text-slate-100 overflow-hidden">
      {/* Canvas Night Sky */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-auto" />

      {/* Top Navigation Bar */}
      <div className="relative z-30 px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 hover:border-white/20 text-xs sm:text-sm text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="px-3.5 py-1.5 rounded-full bg-amber-500/15 backdrop-blur-md border border-amber-400/25 text-xs sm:text-sm text-amber-200 font-medium shadow-lg">
            <span className="font-semibold text-amber-300">{wishes.length}</span> {wishes.length === 1 ? 'Star' : 'Stars'} in Shams’s Sky
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle celestial audio"
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isAudioActive
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/70 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* List View Toggle */}
          <button
            onClick={() => setShowListView(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
            title="Read all wishes as list"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">All Stars</span>
          </button>

          {/* Add a Star Button */}
          <button
            onClick={onAddNewWish}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-semibold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Star</span>
          </button>
        </div>
      </div>

      {/* Floating Instructions */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs text-slate-300 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Tap or click any star to read the blessing</span>
        </div>
      </div>

      {/* Hover preview tooltip */}
      <AnimatePresence>
        {hoveredWish && !selectedWish && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute',
              left: `${Math.min(window.innerWidth - 270, Math.max(20, hoveredWish.x - 110))}px`,
              top: `${Math.max(80, hoveredWish.y - 120)}px`,
            }}
            onClick={() => setSelectedWish(hoveredWish.wish)}
            className="z-30 w-60 glass-panel-golden p-3 rounded-2xl border border-amber-400/40 shadow-2xl pointer-events-auto cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
              <span className="font-semibold text-[11px] truncate">
                {hoveredWish.wish.sender_name}
              </span>
              <span className="text-[10px] text-slate-400">View Star →</span>
            </div>
            <p className="text-xs text-slate-100 font-serif italic line-clamp-2">
              “{hoveredWish.wish.message}”
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Star Wish Card Modal */}
      <AnimatePresence>
        {selectedWish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35 }}
              className="glass-panel-golden w-full max-w-md rounded-3xl p-6 sm:p-8 border border-amber-400/40 shadow-[0_20px_70px_rgba(245,158,11,0.3)] relative text-center"
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedWish(null);
                  setConfirmDeleteId(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                {getStarMeta(selectedWish.star_type).symbol}
              </div>

              <div className="text-xs text-amber-300 font-medium mb-2 uppercase tracking-wider">
                1st Birthday Star • Shams Moni
              </div>

              <p className="text-lg sm:text-xl font-serif italic text-slate-100 leading-relaxed mb-6 font-normal">
                “{selectedWish.message}”
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400 mb-6">
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  {selectedWish.is_anonymous ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span className="italic">Someone who loves you</span>
                    </>
                  ) : (
                    <span>— {selectedWish.sender_name}</span>
                  )}
                </div>
                {selectedWish.one_word && (
                  <span className="text-amber-300/80 italic font-serif text-sm">
                    “{selectedWish.one_word}”
                  </span>
                )}
              </div>

              {/* Confirmation inline dialog for Remove Star */}
              {confirmDeleteId === selectedWish.id ? (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs mb-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Remove this star from Shams’s sky?</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDelete(selectedWish.id)}
                      disabled={isDeleting}
                      className="px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? 'Removing…' : 'Yes, Remove'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Actions row: Share, Remove, Back */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => shareWish(selectedWish)}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-semibold text-xs tracking-wide shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Link Copied' : 'Share'}</span>
                </button>

                {confirmDeleteId !== selectedWish.id && (
                  <button
                    onClick={() => setConfirmDeleteId(selectedWish.id)}
                    className="px-3.5 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                    title="Remove this star from the sky"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Star</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedWish(null);
                    setConfirmDeleteId(null);
                  }}
                  className="px-4 py-2 rounded-full glass-panel border border-white/15 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
                >
                  Back to Sky
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* List View Drawer / Modal with Remove Star capability */}
      <AnimatePresence>
        {showListView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-white/15 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <h3 className="text-lg font-serif text-slate-100 font-medium">
                    All Birthday Stars ({wishes.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dedicated with love to Baby Shams Moni
                  </p>
                </div>
                <button
                  onClick={() => setShowListView(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {wishes.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-sm">
                    No stars have been released yet. Be the first to create one!
                  </p>
                ) : (
                  wishes.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-amber-400/30 transition-all flex items-start justify-between gap-3"
                    >
                      <div
                        onClick={() => {
                          setSelectedWish(w);
                          setShowListView(false);
                        }}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{getStarMeta(w.star_type).symbol}</span>
                          <span className="text-xs font-semibold text-slate-200">
                            {w.sender_name}
                          </span>
                        </div>
                        <p className="text-sm font-serif italic text-slate-300 line-clamp-2">
                          “{w.message}”
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(w.id)}
                        disabled={isDeleting}
                        title="Remove star"
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
