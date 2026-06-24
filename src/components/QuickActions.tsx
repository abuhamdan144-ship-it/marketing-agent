import React from 'react';

interface QuickActionsProps {
  onOpenModal: (type: string) => void;
  onExportAll: () => void;
}

export default function QuickActions({ onOpenModal, onExportAll }: QuickActionsProps) {
  const actions = [
    { type: 'company', label: 'Company', icon: '🏢', desc: 'Add corporate account' },
    { type: 'camp', label: 'Labor Camp', icon: '🏕️', desc: 'Add labor camp target' },
    { type: 'customer', label: 'Customer', icon: '👤', desc: 'Add individual lead' },
    { type: 'visit', label: 'Field Visit', icon: '📍', desc: 'Log field visit data' },
    { type: 'feedback', label: 'Feedback', icon: '💬', desc: 'Record client response' },
    { type: 'complaint', label: 'Complaint', icon: '⚠️', desc: 'File client complaint' },
    { type: 'competitor', label: 'Competitor Intel', icon: '🏪', desc: 'Track competitor strategies' },
    { type: 'plan', label: 'New Plan', icon: '📋', desc: 'Formulate marketing plan' },
    { type: 'social', label: 'Social Ad', icon: '📱', desc: 'Launch social ad campaign' },
    { type: 'export', label: 'Full Export', icon: '📤', desc: 'Excel database dump', isSpecial: true },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
        ⚡ Operations Control &amp; Quick Logging
      </h3>
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-5 gap-3">
        {actions.map((act) => (
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
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
              {act.icon}
            </span>
            <span className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
              {act.label}
            </span>
            <span className="text-[9px] text-slate-400 font-medium leading-normal mt-0.5 max-w-[90px] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
              {act.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
