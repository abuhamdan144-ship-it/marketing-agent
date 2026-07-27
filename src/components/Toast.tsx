import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const { isOutdoor } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  const borderLeftColor = {
    success: 'border-l-[#2F9E77]',
    error: 'border-l-[#D64545]',
    warning: 'border-l-[#C9A227]',
    info: 'border-l-[#2E4B8F]',
  };

  const outdoorBgColor = {
    success: 'bg-[#0F6B3D] text-white border-2 border-black',
    error: 'bg-[#B91C1C] text-white border-2 border-black',
    warning: 'bg-[#B45309] text-white border-2 border-black',
    info: 'bg-[#1D4ED8] text-white border-2 border-black',
  }[type];

  const IconComponent = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }[type];

  const iconColor = {
    success: 'text-[#2F9E77]',
    error: 'text-[#D64545]',
    warning: 'text-[#C9A227]',
    info: 'text-[#2E4B8F]',
  }[type];

  const titleText = {
    success: 'SUCCESS',
    error: 'ERROR ALERT',
    warning: 'ATTENTION',
    info: 'SYSTEM NOTICE',
  }[type];

  return (
    <AnimatePresence>
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] max-w-md w-11/12 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 410, damping: 29 }}
          className={`p-3.5 flex items-start justify-between gap-3 text-xs rounded-lg ${
            isOutdoor
              ? `${outdoorBgColor} shadow-none`
              : `bg-white border border-[#E2E5E1] border-l-4 ${borderLeftColor[type]} shadow-ops-panel`
          }`}
        >
          <div className="flex items-start gap-3">
            <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${isOutdoor ? 'text-white' : iconColor}`} strokeWidth={2.5} />
            <div>
              <div className={`ops-eyebrow text-[9px] mb-0.5 ${isOutdoor ? 'text-white font-black' : 'text-[#0F1B33]'}`}>
                {titleText}
              </div>
              <p className={`font-sans leading-snug ${isOutdoor ? 'text-white font-extrabold' : 'font-medium text-[#0F1B33]'}`}>
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-0.5 rounded cursor-pointer transition-colors ${
              isOutdoor ? 'text-white hover:text-black hover:bg-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

