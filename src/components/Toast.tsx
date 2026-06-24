import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  const bgColors = {
    success: 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/10',
    error: 'bg-rose-600 text-white border-rose-500 shadow-rose-600/10',
    warning: 'bg-amber-500 text-slate-900 border-amber-400 shadow-amber-500/10',
    info: 'bg-slate-900 text-white border-slate-800 shadow-slate-900/10',
  };

  const icons = {
    success: '✅',
    error: '⚠️',
    warning: '🔸',
    info: 'ℹ️',
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-11/12 animate-bounce">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl font-semibold text-xs text-center justify-center transition-all ${bgColors[type]}`}
      >
        <span>{icons[type]}</span>
        <span className="tracking-wide leading-relaxed">{message}</span>
      </div>
    </div>
  );
}
