import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wish } from '../types.ts';
import { appConfig } from '../config/appConfig.ts';
import { WishConstellation } from './WishConstellation.tsx';
import {
  Sparkles,
  Search,
  Filter,
  Grid,
  Compass,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Heart,
} from 'lucide-react';

interface WallOfWishesProps {
  wishes: Wish[];
  allWishes: Wish[]; // Complete list for constellation view
  total: number;
  currentPage: number;
  totalPages: number;
  selectedEnergy: string;
  searchQuery: string;
  isLoading: boolean;
  viewMode: 'cards' | 'constellation';
  onPageChange: (page: number) => void;
  onEnergyChange: (energy: string) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: 'cards' | 'constellation') => void;
  onSelectWish: (wish: Wish) => void;
}

export const WallOfWishes: React.FC<WallOfWishesProps> = ({
  wishes,
  allWishes,
  total,
  currentPage,
  totalPages,
  selectedEnergy,
  searchQuery,
  isLoading,
  viewMode,
  onPageChange,
  onEnergyChange,
  onSearchChange,
  onViewModeChange,
  onSelectWish,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const getStarConfig = (starType: string) => {
    return (
      appConfig.availableStarTypes.find((s) => s.id === starType.toLowerCase()) ||
      appConfig.availableStarTypes[0]
    );
  };

  const getEnergyConfig = (energyId: string) => {
    return (
      appConfig.availableEnergies.find((e) => e.id === energyId.toLowerCase()) || {
        id: energyId,
        name: energyId.charAt(0).toUpperCase() + energyId.slice(1),
        badgeBg: 'bg-amber-500/15 border-amber-400/30',
        badgeText: 'text-amber-300',
      }
    );
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Birthday 2026';
    }
  };

  const copyWishLink = async (e: React.MouseEvent, wishId: number) => {
    e.stopPropagation();
    const url = `${window.location.origin}/wish/${wishId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(wishId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt('Copy link:', url);
    }
  };

  return (
    <section id="wall-of-wishes" className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
      {/* Title & Subtitle */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-medium tracking-wide mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Living Constellation</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif text-slate-100 font-normal mb-3">
          The Wall of Blessings 💌
        </h2>
        <p className="text-slate-300/80 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
          Every sweet wish left for Baby Shams Moni is recorded permanently in the stars.
        </p>
      </div>

      {/* Control Bar: Mode Toggle, Search, Energy Filters */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 mb-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Mode Switcher */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-900/80 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => onViewModeChange('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => onViewModeChange('constellation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                viewMode === 'constellation'
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Constellation</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by sender or message keywords..."
              className="glass-input w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          </div>

          {/* Total Counter Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
            <span className="font-semibold text-amber-300">{total}</span>
            <span>Stars shining</span>
          </div>
        </div>

        {/* Energy Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            onClick={() => onEnergyChange('all')}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 ${
              selectedEnergy === 'all'
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-medium'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
          >
            All Wishes ({total})
          </button>
          {appConfig.availableEnergies.map((energy) => (
            <button
              key={energy.id}
              onClick={() => onEnergyChange(energy.id)}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 capitalize ${
                selectedEnergy === energy.id
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-medium'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
              }`}
            >
              {energy.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'constellation' ? (
        <WishConstellation wishes={allWishes} onSelectWish={onSelectWish} />
      ) : (
        <div>
          {isLoading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="glass-panel p-6 rounded-2xl border border-white/5 animate-pulse flex flex-col justify-between h-56"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : wishes.length === 0 ? (
            /* Empty State */
            <div className="glass-panel text-center py-16 px-6 rounded-3xl border border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-3xl">
                ✨
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-slate-200 mb-2">
                The sky is still quiet…
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Be the first to create a star and light up this universe for Shams Moni.
              </p>
              <button
                onClick={() => {
                  const el = document.getElementById('create-star');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-semibold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
              >
                Create a Star Now
              </button>
            </div>
          ) : (
            /* Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {wishes.map((wish, index) => {
                const star = getStarConfig(wish.star_type);
                const energy = getEnergyConfig(wish.wish_energy);

                return (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: (index % 6) * 0.06 }}
                    onClick={() => onSelectWish(wish)}
                    className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-400/30 hover:bg-slate-900/70 transition-all cursor-pointer group flex flex-col justify-between shadow-lg relative overflow-hidden"
                  >
                    {/* Top Row: Star Glyph & Energy Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {star.symbol}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {star.label}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${energy.badgeBg} ${energy.badgeText}`}
                      >
                        {wish.wish_energy}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-slate-100 font-serif italic text-base sm:text-lg leading-relaxed mb-6 font-normal">
                      “{wish.message}”
                    </p>

                    {/* Bottom Metadata */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          {wish.is_anonymous ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                              <span className="text-slate-300 italic">Someone who loves you</span>
                            </>
                          ) : (
                            <span>— {wish.sender_name}</span>
                          )}
                        </div>
                        {wish.one_word && (
                          <span className="text-[11px] text-amber-300/80 italic font-serif mt-0.5">
                            “{wish.one_word}”
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => copyWishLink(e, wish.id)}
                          aria-label="Copy wish link"
                          title="Copy wish link"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-amber-300 transition-colors"
                        >
                          {copiedId === wish.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-2 rounded-xl glass-panel border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-2 rounded-xl glass-panel border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
