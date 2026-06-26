import React from 'react';

interface HeaderProps {
  lastUpdate: string;
  isOnline: boolean;
  rateSource: string;
  syncStatus?: 'idle' | 'loading' | 'synced' | 'error';
}

export default function Header({ lastUpdate, isOnline, rateSource, syncStatus = 'idle' }: HeaderProps) {
  const getSyncBadge = () => {
    switch (syncStatus) {
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] bg-sky-500/20 text-sky-200 px-2 py-0.5 rounded-md border border-sky-400/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            Syncing Cloud...
          </span>
        );
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Cloud Active
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-md border border-amber-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Offline Fallback
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] bg-slate-500/20 text-slate-200 px-2 py-0.5 rounded-md border border-slate-400/20">
            Cloud Ready
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-4 py-3.5 shadow-lg border-b border-blue-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 text-2xl bg-white/15 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
          🏦
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight font-display sm:text-lg">
            Marketing Agent Notebook
          </h1>
          <p className="text-[10px] text-blue-200/80 font-medium flex items-center gap-2">
            Complete Operations &amp; Intelligence Dashboard
            {getSyncBadge()}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end text-right">
        <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm shadow-sm min-w-[80px]">
          <span className="block text-xs font-bold font-mono tracking-wider text-emerald-300">
            {lastUpdate || 'Loading...'}
          </span>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[9px] font-semibold text-white/90">
              {isOnline ? 'System Live' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
