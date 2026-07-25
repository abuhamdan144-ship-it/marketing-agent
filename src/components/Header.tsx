import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

interface HeaderProps {
  lastUpdate?: string;
  isOnline: boolean;
  rateSource?: string;
  syncStatus?: 'idle' | 'loading' | 'synced' | 'error';
  isForcedOffline?: boolean;
  onToggleForcedOffline?: () => void;
}

export default function Header({ 
  isOnline, 
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
    <header 
      className="sticky top-0 z-50 px-3.5 py-2.5 text-white shadow-md border-b border-white/10"
      style={{
        background: 'linear-gradient(135deg, var(--ink, #16213E) 0%, #1C2A4A 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col justify-between">
        {/* Top Row: Logo, App Name, Status Pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 shrink-0 bg-white/10 rounded-lg border border-white/15">
              <Building2 className="w-4 h-4 text-white" strokeWidth={1.8} />
            </div>
            <h1 className="text-xs sm:text-sm font-bold tracking-tight font-display text-white whitespace-nowrap truncate">
              Marketing Agent Notebook
            </h1>
          </div>

          {/* Single Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-[var(--signal,#2F9E77)]' : 'bg-[var(--ink-30,#A6ACBC)]'
              }`}
            />
            <span
              className={`text-xs font-semibold ${
                isOnline ? 'text-[var(--signal,#2F9E77)]' : 'text-[var(--ink-30,#A6ACBC)]'
              }`}
            >
              {isOnline ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Thin Divider Line */}
        <div className="border-t border-[var(--line,#E2E5E1)]/20 my-2" />

        {/* Bottom Row: Session Uptime Label & Timer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--ink-30,#A6ACBC)]">
            SESSION UPTIME
          </span>
          <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-[var(--gold,#C89B3C)]">
            {formatUptime(uptimeSeconds)}
          </span>
        </div>
      </div>
    </header>
  );
}

