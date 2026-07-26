import React from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Tent,
  Users,
  MapPin,
  MessageCircle,
  AlertTriangle,
  Search,
  ClipboardList,
  Smartphone,
  Upload,
  Zap,
} from 'lucide-react';

interface QuickActionsProps {
  onOpenModal: (type: string) => void;
  onExportAll: () => void;
}

export default function QuickActions({ onOpenModal, onExportAll }: QuickActionsProps) {
  const primaryAction = {
    type: 'visit',
    label: 'Field Visit',
    icon: MapPin,
    desc: 'Log field visit data & location notes',
  };

  const remainingActions = [
    { type: 'company', label: 'Company', icon: Building2, desc: 'Add corporate account' },
    { type: 'camp', label: 'Labor Camp', icon: Tent, desc: 'Add labor camp target' },
    { type: 'customer', label: 'Customer', icon: Users, desc: 'Add individual lead' },
    { type: 'feedback', label: 'Feedback', icon: MessageCircle, desc: 'Record client response' },
    { type: 'complaint', label: 'Complaint', icon: AlertTriangle, desc: 'File client complaint', isComplaint: true },
    { type: 'competitor', label: 'Competitor Intel', icon: Search, desc: 'Track competitor strategies' },
    { type: 'plan', label: 'New Plan', icon: ClipboardList, desc: 'Formulate marketing plan' },
    { type: 'social', label: 'Social Ad', icon: Smartphone, desc: 'Launch social ad campaign' },
    { type: 'export', label: 'Full Export', icon: Upload, desc: 'Excel database dump', isSpecial: true },
  ];

  const PrimaryIcon = primaryAction.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="ops-card p-5 space-y-3"
    >
      <div className="flex items-center justify-between border-b border-[#E2E5E1] pb-2.5">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#C9A227]" strokeWidth={2.2} />
          <span className="ops-eyebrow text-[#0F1B33]">OPERATIONS CONTROL &amp; QUICK LOGGING</span>
        </div>
      </div>

      {/* Full-width Primary Action: Field Visit */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onOpenModal(primaryAction.type)}
        className="w-full flex items-center justify-between p-3.5 rounded-lg bg-[#0F1B33] text-white hover:bg-[#1C2A4A] transition-colors cursor-pointer border border-[#C9A227]/30 shadow-ops-panel group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#C9A227] flex items-center justify-center text-[#0F1B33] font-bold shadow-xs shrink-0">
            <PrimaryIcon className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                {primaryAction.label}
              </span>
              <span className="ops-eyebrow text-[#C9A227] bg-[#C9A227]/15 px-1.5 py-0.5 rounded border border-[#C9A227]/30 text-[8px]">
                HIGH FREQUENCY
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
              {primaryAction.desc}
            </p>
          </div>
        </div>
        <div className="font-mono text-xs font-bold text-[#C9A227] bg-white/5 px-2.5 py-1 rounded border border-white/10 flex items-center gap-1 shrink-0">
          <span>+ LOG VISIT</span>
        </div>
      </motion.button>

      {/* Grid for Remaining Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5">
        {remainingActions.map((act) => {
          const Icon = act.icon;
          return (
            <motion.button
              key={act.type}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (act.type === 'export') {
                  onExportAll();
                } else {
                  onOpenModal(act.type);
                }
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-colors cursor-pointer hover:border-[#0F1B33]/30 ${
                act.isSpecial
                  ? 'bg-[#1C2A4A]/5 border-[#2E4B8F]/30 text-[#0F1B33]'
                  : 'bg-white border-[#E2E5E1] text-[#0F1B33]'
              }`}
            >
              <div className="mb-1">
                <Icon
                  className={`w-4 h-4 ${
                    act.isComplaint
                      ? 'text-[#D64545]'
                      : 'text-[#0F1B33]'
                  }`}
                  strokeWidth={2}
                />
              </div>
              <span className="text-xs font-bold text-[#0F1B33] tracking-tight">
                {act.label}
              </span>
              <span className="text-[9px] text-[#8891A3] font-medium mt-0.5 max-w-[90px] mx-auto hidden sm:block truncate">
                {act.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}



