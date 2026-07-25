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
  const actions = [
    { type: 'company', label: 'Company', icon: Building2, desc: 'Add corporate account' },
    { type: 'camp', label: 'Labor Camp', icon: Tent, desc: 'Add labor camp target' },
    { type: 'customer', label: 'Customer', icon: Users, desc: 'Add individual lead' },
    { type: 'visit', label: 'Field Visit', icon: MapPin, desc: 'Log field visit data' },
    { type: 'feedback', label: 'Feedback', icon: MessageCircle, desc: 'Record client response' },
    { type: 'complaint', label: 'Complaint', icon: AlertTriangle, desc: 'File client complaint', isComplaint: true },
    { type: 'competitor', label: 'Competitor Intel', icon: Search, desc: 'Track competitor strategies' },
    { type: 'plan', label: 'New Plan', icon: ClipboardList, desc: 'Formulate marketing plan' },
    { type: 'social', label: 'Social Ad', icon: Smartphone, desc: 'Launch social ad campaign' },
    { type: 'export', label: 'Full Export', icon: Upload, desc: 'Excel database dump', isSpecial: true },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-[var(--gold,#C89B3C)]" strokeWidth={2} />
        <span>Operations Control &amp; Quick Logging</span>
      </h3>
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-5 gap-3">
        {actions.map((act) => {
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
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 transform active:scale-95 cursor-pointer hover:-translate-y-0.5 group ${
                act.isSpecial
                  ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200 hover:border-indigo-400 text-indigo-700'
                  : 'bg-slate-50 hover:bg-slate-100/50 border-slate-100 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="mb-2 group-hover:scale-110 transition-transform">
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
              <span className="text-[9px] text-slate-400 font-medium leading-normal mt-0.5 max-w-[90px] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                {act.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

