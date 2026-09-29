import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Heart, Cake } from 'lucide-react';
import { appConfig } from '../config/appConfig.ts';

export const CountdownSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isToday: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isToday: true, // User verified today is his 1st birthday!
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const [yearStr, monthStr, dayStr] = appConfig.birthdayDate.split('-');
      const targetMonth = parseInt(monthStr, 10) - 1;
      const targetDay = parseInt(dayStr, 10);

      // Birthday is September 30 (or today in user's timezone)
      const isBirthdayToday = (now.getMonth() === targetMonth && (now.getDate() === targetDay || now.getDate() === targetDay - 1));

      if (isBirthdayToday) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true });
        return;
      }

      let targetYear = now.getFullYear();
      let targetDate = new Date(targetYear, targetMonth, targetDay, 0, 0, 0);

      if (targetDate.getTime() < now.getTime()) {
        targetYear += 1;
        targetDate = new Date(targetYear, targetMonth, targetDay, 0, 0, 0);
      }

      const diff = targetDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isToday: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-10 px-4 max-w-4xl mx-auto">
      <div className="glass-panel-golden rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-amber-400/30">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-medium tracking-wide mb-3 border border-amber-400/20">
            <Cake className="w-3.5 h-3.5 text-amber-300" />
            <span>1st Birthday Celebration Milestone</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-normal mb-2">
            {appConfig.countdown.heading}
          </h2>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-4 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-bold text-base sm:text-lg shadow-[0_0_30px_rgba(245,158,11,0.45)]">
              <Sparkles className="w-5 h-5" />
              <span>{appConfig.countdown.todayMessage}</span>
              <Heart className="w-5 h-5 fill-slate-950" />
            </div>

            <p className="mt-3 text-slate-200 text-xs sm:text-sm max-w-md font-light leading-relaxed">
              Born <strong className="text-amber-300 font-medium">30 September 2025</strong> • Celebrating 365 days of sweet giggles and boundless joy!
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
