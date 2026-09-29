import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wish } from '../types.ts';
import { appConfig } from '../config/appConfig.ts';
import { deleteWishApi } from '../lib/api.ts';
import {
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
  Compass,
  Moon,
  Heart,
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

interface PositionedStar {
  wish: Wish;
  x: number;
  y: number;
  isNew: boolean;
  symbol: string;
  glowHex: string;
  floatDuration: number;
  floatDelay: number;
}

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface NightCloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  puffs: Array<{ rx: number; ry: number; r: number }>;
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
  const [hoveredWishId, setHoveredWishId] = useState<number | null>(null);
  const [showListView, setShowListView] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // New Star Arrival Celebration Toast
  const [arrivalToastWish, setArrivalToastWish] = useState<Wish | null>(null);

  // Dimensions
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Deletion state
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stardustRef = useRef<StardustParticle[]>([]);
  const cloudsRef = useRef<NightCloud[]>([]);

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // When newlyAddedWishId changes, trigger arrival sound & notification toast
  useEffect(() => {
    if (newlyAddedWishId) {
      const arrived = wishes.find((w) => w.id === newlyAddedWishId);
      if (arrived) {
        setArrivalToastWish(arrived);
        celestialSound.playStarChime();
        const timer = setTimeout(() => {
          setArrivalToastWish(null);
        }, 7500);
        return () => clearTimeout(timer);
      }
    }
  }, [newlyAddedWishId, wishes]);

  // Calculate star positions across the celestial coordinate plane
  const positionedStars: PositionedStar[] = useMemo(() => {
    const { width, height } = dimensions;
    return wishes.map((wish, idx) => {
      const meta = getStarMeta(wish.star_type);
      const isNew = wish.id === newlyAddedWishId;

      let x = 0;
      let y = 0;

      if (isNew) {
        // Newly added star arrives prominently near center-top
        x = width * 0.5 + Math.sin(idx * 2) * 25;
        y = height * 0.38 + Math.cos(idx * 2) * 20;
      } else {
        // Celestial Fibonacci spiral distribution
        const angle = idx * 137.5 * (Math.PI / 180);
        const r = Math.min(width, height) * 0.38 * Math.sqrt((idx + 1) / Math.max(7, wishes.length));
        x = width / 2 + Math.cos(angle) * r + Math.sin(idx * 3.7) * 24;
        y = height / 2 + Math.sin(angle) * r * 0.72 + Math.cos(idx * 3.1) * 20;
      }

      // Safe bounds within visible viewport
      x = Math.max(80, Math.min(width - 80, x));
      y = Math.max(115, Math.min(height - 120, y));

      return {
        wish,
        x,
        y,
        isNew,
        symbol: meta.symbol,
        glowHex: meta.glowHex,
        floatDuration: 4.2 + (idx % 5) * 0.6,
        floatDelay: (idx % 4) * 0.3,
      };
    });
  }, [wishes, dimensions, newlyAddedWishId]);

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

  // Initialize soft luminous night clouds
  useEffect(() => {
    const { width, height } = dimensions;
    const clouds: NightCloud[] = [
      {
        x: width * 0.1,
        y: height * 0.22,
        width: 380,
        height: 120,
        speed: 0.12,
        opacity: 0.22,
        puffs: [
          { rx: -110, ry: 10, r: 65 },
          { rx: -40, ry: -15, r: 85 },
          { rx: 50, ry: 5, r: 75 },
          { rx: 120, ry: 20, r: 55 },
        ],
      },
      {
        x: width * 0.62,
        y: height * 0.16,
        width: 440,
        height: 140,
        speed: 0.09,
        opacity: 0.18,
        puffs: [
          { rx: -130, ry: 15, r: 70 },
          { rx: -50, ry: -20, r: 90 },
          { rx: 40, ry: -10, r: 80 },
          { rx: 120, ry: 25, r: 60 },
        ],
      },
      {
        x: width * 0.25,
        y: height * 0.68,
        width: 480,
        height: 150,
        speed: 0.15,
        opacity: 0.26,
        puffs: [
          { rx: -140, ry: 10, r: 80 },
          { rx: -60, ry: -15, r: 100 },
          { rx: 30, ry: -5, r: 90 },
          { rx: 130, ry: 20, r: 70 },
        ],
      },
      {
        x: width * 0.78,
        y: height * 0.76,
        width: 420,
        height: 130,
        speed: 0.11,
        opacity: 0.2,
        puffs: [
          { rx: -110, ry: 10, r: 70 },
          { rx: -30, ry: -20, r: 85 },
          { rx: 60, ry: 0, r: 75 },
          { rx: 130, ry: 20, r: 60 },
        ],
      },
    ];
    cloudsRef.current = clouds;
  }, [dimensions]);

  // Canvas background rendering: Moon, night clouds, constellation filaments, & cursor stardust
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const { width, height } = dimensions;
    canvas.width = width;
    canvas.height = height;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Crescent Moon in upper sky with soft atmospheric glow
      const moonX = width > 768 ? width * 0.88 : width * 0.82;
      const moonY = 85;
      const moonRadius = 24;

      const moonAura = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, moonRadius * 4.5);
      moonAura.addColorStop(0, 'rgba(254, 243, 199, 0.22)');
      moonAura.addColorStop(0.5, 'rgba(199, 210, 254, 0.08)');
      moonAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonAura;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Crescent Moon Body
      ctx.save();
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(moonX - 9, moonY - 5, moonRadius * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Soft, Luminous Night Clouds drifting across the sky
      const clouds = cloudsRef.current;
      for (const cloud of clouds) {
        cloud.x += cloud.speed;
        // Wrap around smoothly
        if (cloud.x - cloud.width / 2 > width) {
          cloud.x = -cloud.width / 2;
        }

        ctx.save();
        ctx.globalAlpha = cloud.opacity;

        // Render organic cloud puffs with gentle radial gradients
        for (const puff of cloud.puffs) {
          const px = cloud.x + puff.rx;
          const py = cloud.y + puff.ry;

          const puffGrad = ctx.createRadialGradient(px, py, 5, px, py, puff.r);
          puffGrad.addColorStop(0, 'rgba(30, 41, 59, 0.55)');
          puffGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.35)');
          puffGrad.addColorStop(0.85, 'rgba(30, 58, 138, 0.15)');
          puffGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

          ctx.fillStyle = puffGrad;
          ctx.beginPath();
          ctx.arc(px, py, puff.r, 0, Math.PI * 2);
          ctx.fill();

          // Soft moonlight rim highlight on upper puffs
          if (puff.ry < 0) {
            const rimGrad = ctx.createRadialGradient(px, py - puff.r * 0.3, 2, px, py, puff.r);
            rimGrad.addColorStop(0, 'rgba(224, 231, 255, 0.14)');
            rimGrad.addColorStop(0.5, 'rgba(199, 210, 254, 0.05)');
            rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = rimGrad;
            ctx.beginPath();
            ctx.arc(px, py, puff.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // 3. Interactive user cursor / touch stardust motes
      const particles = stardustRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.016;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 4. Constellation filaments connecting stars
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.14)';
      ctx.lineWidth = 1;
      for (let i = 0; i < positionedStars.length; i++) {
        for (let j = i + 1; j < positionedStars.length; j++) {
          const dx = positionedStars[i].x - positionedStars[j].x;
          const dy = positionedStars[i].y - positionedStars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 170) {
            ctx.beginPath();
            ctx.moveTo(positionedStars[i].x, positionedStars[i].y);
            ctx.lineTo(positionedStars[j].x, positionedStars[j].y);
            ctx.stroke();

            const midX = (positionedStars[i].x + positionedStars[j].x) / 2;
            const midY = (positionedStars[i].y + positionedStars[j].y) / 2;
            ctx.beginPath();
            ctx.arc(midX, midY, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Cursor stardust generator
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const addStardust = (x: number, y: number) => {
      const colors = ['#fde68a', '#c7d2fe', '#fed7aa', '#ffffff'];
      for (let i = 0; i < 2; i++) {
        stardustRef.current.push({
          x: x + (Math.random() * 14 - 7),
          y: y + (Math.random() * 14 - 7),
          vx: Math.random() * 1.2 - 0.6,
          vy: Math.random() * -1.2 - 0.2,
          size: Math.random() * 2 + 1,
          alpha: 0.85,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      if (stardustRef.current.length > 90) {
        stardustRef.current.splice(0, 15);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const pos = getPos(e);
      addStardust(pos.x, pos.y);
    };

    const handleTouch = (e: TouchEvent) => {
      const pos = getPos(e);
      addStardust(pos.x, pos.y);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
      cancelAnimationFrame(animId);
    };
  }, [dimensions, positionedStars]);

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
          text: `"${wish.message}" — for Baby Shams Moni`,
          url,
        });
      } catch {}
    } else {
      copyWishLink(wish.id);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-[#05070e] text-slate-100 overflow-hidden select-none">
      {/* Canvas Night Sky Backdrop (Nebula, Moon, Night Clouds, Constellations) */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />

      {/* Top Navigation Bar - Responsively tuned for Android & Mobile */}
      <div className="relative z-40 px-2.5 sm:px-6 md:px-8 pt-3 pb-2 sm:py-4 flex items-center justify-between pointer-events-none w-full max-w-full">
        <div className="flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto min-w-0">
          <button
            onClick={onGoHome}
            aria-label="Back to Home"
            className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 hover:border-white/20 text-xs sm:text-sm text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg shrink-0 active:scale-95"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Star Counter Pill - Fits perfectly on mobile screens */}
          <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-amber-500/15 backdrop-blur-md border border-amber-400/25 text-[11px] sm:text-xs text-amber-200 font-medium shadow-lg flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300">{wishes.length}</span>
            <span className="hidden sm:inline">
              {wishes.length === 1 ? 'Star' : 'Stars'} in Shams’s Sky
            </span>
            <span className="sm:hidden">
              {wishes.length === 1 ? 'Star' : 'Stars'} in Sky
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto shrink-0">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle celestial audio"
            className={`p-2 rounded-full border transition-all cursor-pointer active:scale-95 ${
              isAudioActive
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/70 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* List View Toggle */}
          <button
            onClick={() => setShowListView(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
            title="Read all wishes as list"
            aria-label="View all stars list"
          >
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">All Stars</span>
          </button>

          {/* Add a Star Button */}
          <button
            onClick={onAddNewWish}
            className="px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-semibold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Add Star</span>
          </button>
        </div>
      </div>

      {/* Floating Instructions (clean celestial aesthetic without AI signs) */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs text-slate-300 shadow-md">
          <Moon className="w-3.5 h-3.5 text-amber-300" />
          <span>Tap any floating star to read its blessing</span>
        </div>
      </div>

      {/* New Star Arrival Floating Toast Banner (Clean Celestial Theme) */}
      <AnimatePresence>
        {arrivalToastWish && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setSelectedWish(arrivalToastWish)}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-500/30 to-amber-500/25 backdrop-blur-xl border border-amber-300/40 shadow-[0_10px_35px_rgba(245,158,11,0.35)] flex items-center gap-3 cursor-pointer pointer-events-auto"
          >
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.8)]">
              🌟
            </div>
            <div className="text-xs">
              <span className="font-semibold text-amber-200">A new star has arrived!</span>{' '}
              <span className="text-slate-200">From {arrivalToastWish.sender_name}</span>
            </div>
            <span className="text-[11px] text-amber-300 underline font-medium">Read blessing →</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Framer Motion Stars Layer */}
      <div className="absolute inset-0 z-30 pointer-events-auto overflow-hidden">
        {positionedStars.map((star, idx) => {
          const isSelected = selectedWish?.id === star.wish.id;
          const isHovered = hoveredWishId === star.wish.id;

          return (
            <motion.div
              key={star.wish.id}
              style={{
                position: 'absolute',
                left: `${star.x}px`,
                top: `${star.y}px`,
              }}
              // Framer Motion: gentle floating entry effect when arriving in the sky
              initial={
                star.isNew
                  ? {
                      opacity: 0,
                      scale: 0.15,
                      y: 75,
                      filter: 'blur(10px)',
                    }
                  : {
                      opacity: 0,
                      scale: 0.4,
                      y: 20,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                filter: 'blur(0px)',
              }}
              transition={{
                duration: star.isNew ? 1.8 : 0.8,
                delay: star.isNew ? 0.15 : (idx % 8) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="-translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              onClick={() => {
                celestialSound.playStarChime();
                setSelectedWish(star.wish);
              }}
              onMouseEnter={() => setHoveredWishId(star.wish.id)}
              onMouseLeave={() => setHoveredWishId(null)}
            >
              {/* Continuous Gentle Floating Celestial Sway */}
              <motion.div
                animate={{
                  y: [-5, 5, -5],
                  rotate: [-1.5, 1.5, -1.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: star.floatDuration,
                  delay: star.floatDelay,
                  ease: 'easeInOut',
                }}
                whileHover={{
                  scale: 1.3,
                  transition: { type: 'spring', stiffness: 350, damping: 18 },
                }}
                whileTap={{ scale: 0.9 }}
                className="relative flex flex-col items-center"
              >
                {/* For Newly Arrived Star: Gentle Floating Ripple Pulse Ring */}
                {star.isNew && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.9 }}
                      animate={{ scale: [1, 2.4, 2.8], opacity: [0.85, 0.3, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute -inset-4 rounded-full border border-amber-300/60 pointer-events-none"
                    />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.9 }}
                      animate={{ scale: [1, 3.2], opacity: [0.6, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: 0.7, ease: 'easeOut' }}
                      className="absolute -inset-6 rounded-full border border-yellow-200/40 pointer-events-none"
                    />
                  </>
                )}

                {/* Star Symbol Floating on Top */}
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  }}
                  className="text-base sm:text-lg mb-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] filter"
                >
                  {star.symbol}
                </motion.div>

                {/* Glowing Star Body */}
                <div className="relative flex items-center justify-center">
                  {/* Outer Breathing Corona */}
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 1],
                      opacity: [0.45, 0.75, 0.45],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.8,
                      ease: 'easeInOut',
                      delay: star.floatDelay,
                    }}
                    style={{
                      backgroundColor: star.glowHex,
                      boxShadow: `0 0 25px 8px ${star.glowHex}88`,
                    }}
                    className={`rounded-full ${
                      star.isNew ? 'w-6 h-6' : 'w-4 h-4'
                    } blur-xs transition-transform`}
                  />

                  {/* Bright Core */}
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
                </div>

                {/* Translucent Clean Name Pill Beneath Star (Pure celestial design, NO AI signs) */}
                <motion.div
                  initial={{ opacity: 0.8 }}
                  animate={{
                    opacity: isHovered || isSelected || star.isNew ? 1 : 0.85,
                    scale: isHovered || isSelected ? 1.08 : 1,
                  }}
                  className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] text-slate-200 font-medium whitespace-nowrap shadow-md flex items-center gap-1.5 group-hover:border-amber-400/50 group-hover:text-amber-200 transition-colors"
                >
                  <span className="text-[9px] text-amber-300">★</span>
                  <span>{star.wish.sender_name}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Aesthetic Component: Bottom-Left Celestial Horizon Seal */}
      <div className="absolute bottom-5 left-5 z-40 pointer-events-none hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/10 text-xs shadow-xl">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
          <Compass className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-serif tracking-wider text-[11px] text-amber-200 font-medium">
            Shams Moni’s Night Sky
          </span>
          <span className="text-[10px] text-slate-400 font-light">
            30 September 2025 • Year One Orbit
          </span>
        </div>
      </div>

      {/* Aesthetic Component: Bottom-Right Soft Audio & Atmosphere Pill */}
      <div className="absolute bottom-5 right-5 z-40 pointer-events-none hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/65 backdrop-blur-md border border-white/10 text-[11px] text-slate-400">
        <Heart className="w-3 h-3 text-rose-400" />
        <span>Dedicated with eternal love</span>
      </div>

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

      {/* List View Drawer / Modal */}
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
