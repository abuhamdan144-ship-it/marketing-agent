import React from 'react';

interface HeaderProps {
  lastUpdate: string;
  isOnline: boolean;
  rateSource: string;
  syncStatus?: 'idle' | 'loading' | 'synced' | 'error';
  isForcedOffline: boolean;
  onToggleForcedOffline: () => void;
}

export default function Header({ 
  lastUpdate, 
  isOnline, 
  rateSource, 
  syncStatus = 'idle',
  isForcedOffline,
  onToggleForcedOffline
}: HeaderProps) {
  const getSyncBadge = () => {
    if (isForcedOffline) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-md border border-amber-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Forced Offline
        </span>
      );
    }
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

      <div className="flex items-center gap-4">
        {/* Manual Offline Mode Switcher */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-all border border-white/10 shadow-sm">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-100 select-none">
            Forced Offline
          </span>
          <button
            id="offline-toggle-header"
            onClick={onToggleForcedOffline}
            className={`relative inline-flex h-[18px] w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isForcedOffline ? 'bg-amber-400' : 'bg-slate-400/40'
            }`}
            role="switch"
            aria-checked={isForcedOffline}
            title={isForcedOffline ? 'Switch to Online Mode' : 'Switch to Offline Mode'}
          >
            <span
              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isForcedOffline ? 'translate-x-3.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col items-end text-right">
          <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm shadow-sm min-w-[80px]">
            <span className="block text-xs font-bold font-mono tracking-wider text-emerald-300">
              {lastUpdate || 'Loading...'}
            </span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isForcedOffline ? 'bg-amber-400 animate-pulse' : (isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400')
                }`}
              />
              <span className="text-[9px] font-semibold text-white/90">
                {isForcedOffline ? 'Forced Offline' : (isOnline ? 'System Live' : 'Offline Mode')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
