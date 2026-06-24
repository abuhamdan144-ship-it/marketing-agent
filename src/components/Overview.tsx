import React from 'react';
import { AppData } from '../types';

interface OverviewProps {
  appData: AppData;
  onNavigate: (tab: string) => void;
}

export default function Overview({ appData, onNavigate }: OverviewProps) {
  const stats = [
    {
      id: 'companies',
      label: 'Companies',
      icon: '🏢',
      count: appData.companies.length,
      color: 'bg-blue-50 border-blue-100 hover:border-blue-300 text-blue-700 hover:bg-blue-100/50',
    },
    {
      id: 'camps',
      label: 'Labor Camps',
      icon: '🏕️',
      count: appData.camps.length,
      color: 'bg-amber-50 border-amber-100 hover:border-amber-300 text-amber-700 hover:bg-amber-100/50',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: '👥',
      count: appData.customers.length,
      color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300 text-emerald-700 hover:bg-emerald-100/50',
    },
    {
      id: 'visits',
      label: 'Field Visits',
      icon: '📍',
      count: appData.visits.length,
      color: 'bg-rose-50 border-rose-100 hover:border-rose-300 text-rose-700 hover:bg-rose-100/50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
        📊 Marketing Operations Overview
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 transform active:scale-95 cursor-pointer ${s.color}`}
          >
            <span className="text-3xl mb-1.5">{s.icon}</span>
            <span className="text-2xl font-extrabold font-display leading-tight">{s.count}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
