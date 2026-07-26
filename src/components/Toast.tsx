import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
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
          className={`bg-white border border-[#E2E5E1] border-l-4 ${borderLeftColor[type]} rounded-lg p-3.5 shadow-ops-panel flex items-start justify-between gap-3 text-xs`}
        >
          <div className="flex items-start gap-3">
            <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} strokeWidth={2.2} />
            <div>
              <div className="ops-eyebrow text-[#0F1B33] text-[9px] mb-0.5">{titleText}</div>
              <p className="font-sans font-medium text-[#0F1B33] leading-snug">{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

