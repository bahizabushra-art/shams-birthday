import React from 'react';
import { motion } from 'motion/react';
import { WishStats } from '../types.ts';
import { Sparkles, Star, ShieldCheck, HeartHandshake } from 'lucide-react';
import { appConfig } from '../config/appConfig.ts';

interface LiveStatsSectionProps {
  stats: WishStats;
}

export const LiveStatsSection: React.FC<LiveStatsSectionProps> = ({ stats }) => {
  const energyCount = Object.keys(stats.energyCounts).length || appConfig.availableEnergies.length;

  const statItems = [
    {
      label: 'Total Wishes',
      value: stats.totalWishes,
      description: 'Blessings received',
      icon: <Sparkles className="w-5 h-5 text-amber-300" />,
      color: 'from-amber-400 to-yellow-500',
    },
    {
      label: 'Stars Created',
      value: stats.totalWishes,
      description: 'Lighting up the universe',
      icon: <Star className="w-5 h-5 text-indigo-300" />,
      color: 'from-indigo-400 to-purple-500',
    },
    {
      label: 'Anonymous Wishes',
      value: stats.anonymousWishes,
      description: 'Silent well-wishers',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-300" />,
      color: 'from-emerald-400 to-teal-500',
    },
    {
      label: 'Wish Energies',
      value: energyCount,
      description: 'Different emotions',
      icon: <HeartHandshake className="w-5 h-5 text-rose-300" />,
      color: 'from-rose-400 to-pink-500',
    },
  ];

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="glass-panel p-5 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-400/30 transition-all shadow-md"
          >
            <div className="p-2.5 rounded-2xl bg-white/5 mb-3 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <span
              className={`text-2xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.color} mb-1`}
            >
              {item.value}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-200 mb-0.5">
              {item.label}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">
              {item.description}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
