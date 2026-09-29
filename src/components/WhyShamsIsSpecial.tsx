import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Sun, Smile, Baby } from 'lucide-react';
import { appConfig } from '../config/appConfig.ts';

export const WhyShamsIsSpecial: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'smile':
        return <Smile className="w-5 h-5 text-amber-300" />;
      case 'baby':
        return <Baby className="w-5 h-5 text-sky-300" />;
      case 'sun':
      default:
        return <Sun className="w-5 h-5 text-yellow-300" />;
    }
  };

  return (
    <section className="py-14 sm:py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-medium tracking-wide mb-3">
          <Heart className="w-3.5 h-3.5" />
          <span>Our Little Prince’s First Year</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-slate-100 font-normal mb-2">
          {appConfig.milestones.heading}
        </h2>
        <p className="text-slate-300/80 text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
          {appConfig.milestones.subtitle} (Born 30 September 2025)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {appConfig.milestones.cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-amber-400/30 hover:bg-slate-900/60 transition-all flex flex-col justify-between shadow-md group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] uppercase tracking-wider text-amber-300 font-medium px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                  {card.tag}
                </span>
                <div className="p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                  {getIcon(card.icon)}
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-serif text-slate-100 font-medium mb-2 group-hover:text-amber-200 transition-colors">
                {card.title}
              </h3>

              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed font-light">
                {card.description}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Year One with Shams Moni</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
