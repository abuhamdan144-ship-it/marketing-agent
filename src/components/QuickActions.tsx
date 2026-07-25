import React from 'react';
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5 flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-[var(--gold,#C89B3C)]" strokeWidth={2} />
        <span>Operations Control &amp; Quick Logging</span>
      </h3>

      {/* Full-width Primary Action: Field Visit */}
      <button
        onClick={() => onOpenModal(primaryAction.type)}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[var(--ink,#16213E)] text-white hover:bg-[#1a2748] transition-all duration-200 transform active:scale-[0.99] cursor-pointer shadow-md group mb-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--gold,#C89B3C)] flex items-center justify-center text-[var(--ink,#16213E)] shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <PrimaryIcon className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-white font-display">
                {primaryAction.label}
              </span>
              <span className="text-[9px] uppercase tracking-wider bg-white/10 text-[var(--gold-dim,#F4E9D2)] px-2 py-0.5 rounded-full font-bold">
                Most Frequent
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
              {primaryAction.desc}
            </p>
          </div>
        </div>
        <div className="text-[10px] font-bold text-[var(--gold,#C89B3C)] bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1 shrink-0">
          <span>+ Log Visit</span>
        </div>
      </button>

      {/* 2-Column Grid for Remaining Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {remainingActions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.type}
              onClick={() => {
                if (act.type === 'export') {
                  onExportAll();
                } else {
                  onOpenModal(act.type);
                }
              }}
              style={{ boxShadow: '0 1px 2px rgba(22, 33, 62, 0.04)' }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 transform active:scale-95 cursor-pointer hover:-translate-y-0.5 group ${
                act.isSpecial
                  ? 'bg-gradient-to-br from-indigo-50/80 to-indigo-100/40 border-indigo-200/80 hover:border-indigo-300 text-indigo-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200/60 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="mb-1.5 group-hover:scale-110 transition-transform">
                <Icon
                  className={`w-5 h-5 ${
                    act.isComplaint
                      ? 'text-[var(--coral,#D64545)]'
                      : 'text-[var(--ink,#16213E)]'
                  }`}
                  strokeWidth={1.8}
                />
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
                {act.label}
              </span>
              <span className="text-[9px] text-slate-400 font-medium leading-normal mt-0.5 max-w-[90px] mx-auto hidden sm:block">
                {act.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


