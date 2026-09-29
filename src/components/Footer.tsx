import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { appConfig } from '../config/appConfig.ts';

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-4 border-t border-white/5 text-center relative z-10">
      <div className="max-w-xl mx-auto flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
          <Sparkles className="w-4 h-4" />
        </div>

        <p className="font-serif text-base sm:text-lg text-slate-200 font-medium">
          {appConfig.footer.signature}
        </p>

        <p className="text-xs text-slate-400 tracking-wider font-light">
          “{appConfig.footer.tagline}”
        </p>

        <div className="text-[10px] text-slate-500 mt-2">
          Made with love for Baby Shams Moni's 1st Birthday • Born 30 September 2025
        </div>
      </div>
    </footer>
  );
};
