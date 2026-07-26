import React from 'react';
import { motion } from 'motion/react';
import { CORRIDORS } from '../utils/exportUtils';
import { ExchangeRates } from '../types';
import { Globe, RefreshCw } from 'lucide-react';

interface LiveRatesProps {
  rates: ExchangeRates;
  rateSource: string;
  isFetching: boolean;
  onRefresh: () => void;
  isOnline?: boolean;
}

export default function LiveRates({ rates, rateSource, isFetching, onRefresh, isOnline = true }: LiveRatesProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0F1B33] text-white rounded-lg p-5 border border-white/10 shadow-ops-panel select-none"
    >
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#C9A227]" />
          <span className="ops-eyebrow text-[#C9A227]">FX CORRIDOR BENCHMARKS</span>
          <span className="bg-[#1C2A4A] text-[#8891A3] font-mono text-[9px] px-2 py-0.5 rounded border border-white/5 font-bold">
            1 OMR =
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRefresh}
          disabled={isFetching}
          className={`p-1.5 bg-[#1C2A4A] hover:bg-white/10 rounded text-[#C9A227] transition-colors border border-white/10 cursor-pointer flex items-center justify-center ${
            isFetching ? 'animate-spin opacity-50' : ''
          }`}
          title="Refresh Exchange Rates"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1C2A4A]/60 rounded border border-white/5 mb-3 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#4ADE94] animate-pulse' : 'bg-[#C9A227]'}`} />
          <span className="text-[#8891A3] font-bold">FEED SOURCE:</span>
          <span className="text-slate-200">{rateSource}</span>
        </div>
        <span className="text-[#8891A3] text-[9px]">OMAN FX</span>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 gap-2.5">
        {CORRIDORS.map((c) => {
          const val = rates[c.id];
          const displayVal = val && typeof val === 'number' ? val.toFixed(2) : '--';
          return (
            <motion.div
              key={c.id}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center justify-center p-3 bg-[#1C2A4A] hover:bg-[#1C2A4A]/80 rounded border border-white/5 hover:border-[#C9A227]/30 transition-all text-center"
            >
              <span className="text-xl">
                {c.flag}
              </span>
              <span className="ops-eyebrow text-[#8891A3] text-[9px] mt-1">
                {c.code}
              </span>
              <span className="text-base font-mono font-extrabold text-[#C9A227] mt-0.5">
                {displayVal}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

