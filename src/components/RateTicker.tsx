import React from 'react';
import { motion } from 'motion/react';
import { ExchangeRates } from '../types';
import { CORRIDORS } from '../utils/exportUtils';
import { TrendingUp, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RateTickerProps {
  rates?: ExchangeRates;
}

export default function RateTicker({ rates }: RateTickerProps) {
  const { isOutdoor } = useTheme();
  // Only show validated live values; repeat once for a seamless loop without clutter.
  const validCorridors = CORRIDORS.filter((corridor) => {
    const value = rates?.[corridor.id];
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
  });
  const tickerItems = validCorridors.length > 1 ? [...validCorridors, ...validCorridors] : validCorridors;

  if (validCorridors.length === 0) return null;

  return (
    <div className={`w-full overflow-hidden py-1.5 px-3 flex items-center select-none text-xs border-y transition-colors ${
      isOutdoor 
        ? 'bg-[#111111] border-black text-white' 
        : 'bg-[#0B1526] border-white/10 text-slate-200'
    }`}>
      <div className={`flex items-center gap-2 pr-3 z-10 shrink-0 border-r mr-2 ${
        isOutdoor 
          ? 'bg-[#111111] border-white' 
          : 'bg-[#0B1526] border-white/10 shadow-md'
      }`}>
        <span className="flex h-2 w-2 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOutdoor ? 'bg-[#4ADE94]' : 'bg-[#4ADE94]'} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isOutdoor ? 'bg-[#0F6B3D]' : 'bg-[#2F9E77]'}`}></span>
        </span>
        <span className={`ops-eyebrow flex items-center gap-1 font-mono tracking-wider text-[10px] ${
          isOutdoor ? 'text-white font-black' : 'text-[#C9A227]'
        }`}>
          <Activity className={`w-3 h-3 ${isOutdoor ? 'text-white' : 'text-[#C9A227]'}`} />
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
            const rawRate = rates?.[corridor.id];
            const rateVal = typeof rawRate === 'number' && Number.isFinite(rawRate) ? rawRate.toFixed(2) : null;
            if (!rateVal) return null;

            return (
              <div key={`${corridor.id}-${idx}`} className="inline-flex items-center gap-2 text-xs">
                <span className="text-sm leading-none">{corridor.flag}</span>
                <span className={`font-mono tracking-tight ${isOutdoor ? 'font-bold text-white' : 'font-semibold text-slate-300'}`}>
                  1 OMR =
                </span>
                <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                  isOutdoor 
                    ? 'bg-white text-black font-extrabold border border-black' 
                    : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20'
                }`}>
                  {rateVal} {corridor.code}
                </span>
                <TrendingUp className={`w-3 h-3 ${isOutdoor ? 'text-[#4ADE94]' : 'text-[#2F9E77]'}`} />
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
