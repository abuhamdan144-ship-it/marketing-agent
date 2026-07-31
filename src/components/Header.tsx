import React, { useState, useEffect } from 'react';
import { Building2, RefreshCw, ShieldCheck, Cpu, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { ExchangeRates } from '../types';
import RateTicker from './RateTicker';
import { useTheme } from '../context/ThemeContext';

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
  const { isOutdoor, toggleTheme } = useTheme();

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
    <header className={`sticky top-0 z-50 text-white border-b transition-colors ${
      isOutdoor 
        ? 'bg-[#000000] border-black shadow-none' 
        : 'bg-[#0F1B33] border-white/10 shadow-xl'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top Row: Brand & Ops Console Badges */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-lg border ${
              isOutdoor ? 'bg-[#111111] border-white' : 'bg-[#1C2A4A] border-[#C9A227]/30 shadow-inner'
            }`}>
              <Building2 className={`w-5 h-5 ${isOutdoor ? 'text-white' : 'text-[#C9A227]'}`} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`ops-eyebrow tracking-widest text-[9px] ${
                  isOutdoor ? 'text-white font-black' : 'text-[#C9A227]'
                }`}>AGENT BOOK</span>
                <span className={`hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border ${
                  isOutdoor ? 'bg-white text-black border-black' : 'bg-[#1C2A4A] text-slate-300 border-white/10'
                }`}>OPS TERMINAL v3.2</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-sans truncate">
                Field Marketing Operations Console
              </h1>
            </div>
          </div>

          {/* Controls & Live Indicators */}
          <div className="flex items-center gap-2 shrink-0">
            {/* SUNLIGHT / OUTDOOR MODE TOGGLE BUTTON */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-black cursor-pointer transition-all ${
                isOutdoor
                  ? 'bg-[#F59E0B] text-black border-2 border-black font-extrabold shadow-sm'
                  : 'bg-[#1C2A4A] hover:bg-[#2E4B8F]/40 border border-[#C9A227]/40 text-[#C9A227]'
              }`}
              title={isOutdoor ? "Switch to Dark Navy Office Mode" : "Switch to High-Contrast Outdoor Sunlight Mode"}
            >
              {isOutdoor ? (
                <>
                  <Sun className="w-4 h-4 text-black shrink-0 animate-pulse" strokeWidth={2.5} />
                  <span className="font-extrabold">OUTDOOR MODE</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#C9A227] shrink-0" strokeWidth={2} />
                  <span className="hidden sm:inline">OFFICE MODE</span>
                </>
              )}
            </motion.button>

            {onForceResync && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onForceResync}
                disabled={isSyncing}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium cursor-pointer transition-colors disabled:opacity-50 border ${
                  isOutdoor 
                    ? 'bg-[#222222] text-white border-white' 
                    : 'bg-[#1C2A4A] hover:bg-[#2E4B8F]/40 border-white/10 text-slate-200'
                }`}
                title="Force Resync Cloud Database and Clear Stale Cache"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isOutdoor ? 'text-white' : 'text-[#C9A227]'} ${isSyncing ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span className="hidden sm:inline">RESYNC</span>
              </motion.button>
            )}

            {/* Status Indicator Pill */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border shrink-0 ${
              isOutdoor ? 'bg-[#111111] border-white' : 'bg-[#0B1526] border-white/10'
            }`}>
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
              <span className="font-mono text-xs font-bold tracking-wider text-white">
                {isForcedOffline ? 'OFFLINE' : isOnline ? (syncStatus === 'loading' ? 'SYNCING' : 'ONLINE') : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-header status bar */}
        <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-xs ${
          isOutdoor ? 'border-white/20 text-white font-bold' : 'border-white/5 text-[#8891A3]'
        }`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className={`w-3.5 h-3.5 ${isOutdoor ? 'text-[#4ADE94]' : 'text-[#2F9E77]'}`} />
              <span className={`ops-eyebrow ${isOutdoor ? 'text-white' : 'text-[#8891A3]'}`}>DATABASE:</span>
              <span className={`font-mono text-xs font-medium ${isOutdoor ? 'text-white font-bold' : 'text-slate-300'}`}>FIRESTORE ACTIVE</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <Cpu className={`w-3.5 h-3.5 ${isOutdoor ? 'text-white' : 'text-[#2E4B8F]'}`} />
              <span className={`ops-eyebrow ${isOutdoor ? 'text-white' : 'text-[#8891A3]'}`}>NODE:</span>
              <span className={`font-mono text-xs ${isOutdoor ? 'text-white font-bold' : 'text-slate-300'}`}>MUSCAT_HQ_01</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className={`ops-eyebrow ${isOutdoor ? 'text-white font-black' : 'text-[#8891A3]'}`}>SESSION UPTIME:</span>
            <span className={`font-mono font-bold tracking-wider ${isOutdoor ? 'text-white font-black underline' : 'text-[#C9A227]'}`}>
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


