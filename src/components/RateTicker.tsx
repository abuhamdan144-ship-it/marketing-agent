import React from 'react';
import { motion } from 'motion/react';
import { ExchangeRates } from '../types';
import { CORRIDORS } from '../utils/exportUtils';
import { TrendingUp, Activity } from 'lucide-react';

interface RateTickerProps {
  rates?: ExchangeRates;
}

export default function RateTicker({ rates }: RateTickerProps) {
  // Duplicate corridors for smooth infinite loop
  const tickerItems = [...CORRIDORS, ...CORRIDORS, ...CORRIDORS];

  return (
    <div className="w-full bg-[#0B1526] border-y border-white/10 overflow-hidden py-1.5 px-3 flex items-center select-none text-xs">
      <div className="flex items-center gap-2 pr-3 bg-[#0B1526] z-10 shrink-0 border-r border-white/10 mr-2 shadow-md">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE94] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2F9E77]"></span>
        </span>
        <span className="ops-eyebrow text-[#C9A227] flex items-center gap-1 font-mono tracking-wider text-[10px]">
          <Activity className="w-3 h-3 text-[#C9A227]" />
          OMR FX TICKER
        </span>
      </div>

      <div className="overflow-hidden w-full relative flex">
        <motion.div
          className="flex items-center gap-6 whitespace-nowrap"
          animate={{ x: ['0%', '-33.333%'] }}
          transition={{
            ease: 'linear',
            duration: 25,
            repeat: Infinity,
          }}
        >
          {tickerItems.map((corridor, idx) => {
            const rawRate = rates ? rates[corridor.id] : undefined;
            const rateVal = typeof rawRate === 'number' ? rawRate.toFixed(2) : rawRate || '---';

            return (
              <div key={`${corridor.id}-${idx}`} className="inline-flex items-center gap-2 text-xs">
                <span className="text-sm leading-none">{corridor.flag}</span>
                <span className="font-semibold text-slate-300 font-mono tracking-tight">1 OMR =</span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {rateVal} {corridor.code}
                </span>
                <TrendingUp className="w-3 h-3 text-[#2F9E77]" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
