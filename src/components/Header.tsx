import React, { useState, useEffect } from 'react';
import { Building2, RefreshCw, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { ExchangeRates } from '../types';
import RateTicker from './RateTicker';

interface HeaderProps {
  lastUpdate?: string;
  isOnline: boolean;
  rates?: ExchangeRates;
  rateSource?: string;
  syncStatus?: 'idle' | 'loading' | 'synced' | 'error';
  isForcedOffline?: boolean;
  onToggleForcedOffline?: () => void;
  onForceResync?: () => void;
  isSyncing?: boolean;
}

export default function Header({ 
  isOnline, 
  rates,
  syncStatus = 'synced',
  isForcedOffline = false,
  onForceResync,
  isSyncing = false
}: HeaderProps) {
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0F1B33] text-white shadow-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top Row: Brand & Ops Console Badges */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 shrink-0 bg-[#1C2A4A] rounded-lg border border-[#C9A227]/30 shadow-inner">
              <Building2 className="w-5 h-5 text-[#C9A227]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="ops-eyebrow text-[#C9A227] tracking-widest text-[9px]">AL JADEED EXCHANGE</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#1C2A4A] text-slate-300 rounded border border-white/10">OPS TERMINAL v3.2</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-sans truncate">
                Field Marketing Operations Console
              </h1>
            </div>
          </div>

          {/* Controls & Live Indicators */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onForceResync && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onForceResync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1C2A4A] hover:bg-[#2E4B8F]/40 border border-white/10 text-xs font-mono font-medium text-slate-200 cursor-pointer transition-colors disabled:opacity-50"
                title="Force Resync Cloud Database and Clear Stale Cache"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#C9A227] ${isSyncing ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span className="hidden sm:inline">RESYNC CLOUD</span>
              </motion.button>
            )}

            {/* Status Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0B1526] border border-white/10 shrink-0">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isForcedOffline ? 'bg-amber-400' : isOnline && syncStatus !== 'error' ? 'bg-[#4ADE94]' : 'bg-[#F27373]'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isForcedOffline ? 'bg-amber-500' : isOnline && syncStatus !== 'error' ? 'bg-[#2F9E77]' : 'bg-[#D64545]'
                  }`}
                />
              </span>
              <span className="font-mono text-xs font-semibold tracking-wider text-slate-200">
                {isForcedOffline ? 'OFFLINE' : isOnline ? (syncStatus === 'loading' ? 'SYNCING' : 'ONLINE') : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-header status bar */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#8891A3]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2F9E77]" />
              <span className="ops-eyebrow text-[#8891A3]">DATABASE:</span>
              <span className="font-mono text-xs font-medium text-slate-300">FIRESTORE ACTIVE</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#2E4B8F]" />
              <span className="ops-eyebrow text-[#8891A3]">NODE:</span>
              <span className="font-mono text-xs text-slate-300">MUSCAT_HQ_01</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="ops-eyebrow text-[#8891A3]">SESSION UPTIME:</span>
            <span className="font-mono font-bold text-[#C9A227] tracking-wider">
              {formatUptime(uptimeSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Marquee Ticker directly below header */}
      <RateTicker rates={rates} />
    </header>
  );
}


