import React from 'react';
import { AppData } from '../types';
import {
  AlertTriangle,
  ClipboardCheck,
  ArrowRight,
  Activity,
  Building2,
  Tent,
  Users,
  MapPin,
  TrendingUp,
  Info,
} from 'lucide-react';

interface OverviewProps {
  appData: AppData;
  onNavigate: (tab: string) => void;
}

export default function Overview({ appData, onNavigate }: OverviewProps) {
  const pendingComplaints = appData.complaints.filter((c) => c.status !== 'Resolved').length;
  const activePlans = appData.plans.filter((p) => p.status === 'Active').length;

  const stats = [
    {
      id: 'companies',
      label: 'Companies',
      icon: Building2,
      count: appData.companies.length,
      color: 'bg-blue-50/50 border-blue-100 hover:border-blue-300 text-blue-700 hover:bg-blue-50',
    },
    {
      id: 'camps',
      label: 'Labor Camps',
      icon: Tent,
      count: appData.camps.length,
      color: 'text-amber-800 shadow-xs',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      count: appData.customers.length,
      color: 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 text-emerald-700 hover:bg-emerald-50',
    },
    {
      id: 'visits',
      label: 'Field Visits',
      icon: MapPin,
      count: appData.visits.length,
      color: 'bg-rose-50/50 border-rose-100 hover:border-rose-300 text-rose-700 hover:bg-rose-50',
    },
    {
      id: 'attendance',
      label: 'Attendance Sheet',
      icon: ClipboardCheck,
      count: appData.attendance.length,
      color: 'bg-purple-50/50 border-purple-100 hover:border-purple-300 text-purple-700 hover:bg-purple-50',
    },
  ];

  const showNoteCard = appData.companies.length === 0 && appData.customers.length === 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--ink,#16213E)]" strokeWidth={1.8} />
          <span>Marketing Operations Overview</span>
        </h3>
        <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-indigo-100">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Live Pulse
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Core Operational Button Cards */}
        {stats.map((s) => {
          const Icon = s.icon;
          const isDimmed = (s.id === 'companies' || s.id === 'customers') && s.count === 0;
          const isCamp = s.id === 'camps';

          return (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className={`lg:col-span-1 flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 transform active:scale-95 cursor-pointer ${
                s.color
              } ${isDimmed ? 'opacity-55' : 'opacity-100'}`}
              style={
                isCamp
                  ? {
                      background: 'linear-gradient(135deg, #FFFDF8 0%, #FFFFFF 100%)',
                      borderColor: 'rgba(200, 155, 60, 0.35)',
                    }
                  : undefined
              }
            >
              <div className="mb-2">
                <Icon
                  className={`w-6 h-6 ${isCamp ? 'text-[var(--gold,#C89B3C)]' : 'text-[var(--ink,#16213E)]'}`}
                  strokeWidth={1.8}
                />
              </div>
              <span className="text-2xl font-extrabold font-display leading-tight">{s.count}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mt-1">
                {s.label}
              </span>
            </button>
          );
        })}

        {/* Combined Status Snapshot Card */}
        <div className="sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 border border-indigo-950 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--coral,#D64545)] shrink-0" strokeWidth={1.8} />
              <span>Operational Snapshot</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400">Attention Required</span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Pending Complaints Item */}
            <button
              onClick={() => onNavigate('complaints')}
              className="text-left space-y-1 group/item hover:opacity-90 cursor-pointer transition-opacity"
            >
              <div className="flex items-center gap-1.5 text-slate-400">
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--coral,#D64545)] shrink-0" strokeWidth={1.8} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Pending Issues</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-display text-white">
                  {pendingComplaints}
                </span>
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5 group-hover/item:text-indigo-400 transition-colors">
                  view <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </button>

            {/* Active Marketing Plans Item */}
            <button
              onClick={() => onNavigate('plans')}
              className="text-left space-y-1 group/item hover:opacity-90 cursor-pointer transition-opacity"
            >
              <div className="flex items-center gap-1.5 text-slate-400">
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={1.8} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Active Plans</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-display text-white">
                  {activePlans}
                </span>
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5 group-hover/item:text-indigo-400 transition-colors">
                  view <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </button>
          </div>

          <div className="text-[9px] text-indigo-300/80 font-medium bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5">
            {pendingComplaints > 0 ? (
              <>
                <AlertTriangle className="w-3 h-3 text-[var(--coral,#D64545)] shrink-0" strokeWidth={1.8} />
                <span>Resolve logged issues immediately to preserve camp trust.</span>
              </>
            ) : (
              <span>✨ Excellent customer sentiment. Zero unresolved disputes!</span>
            )}
          </div>
        </div>
      </div>

      {/* Note Card when Companies and Customers are both 0 */}
      {showNoteCard && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-slate-600 text-xs font-medium">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" strokeWidth={1.8} />
          <span>
            No companies or customers logged yet. Tap Company or Customer below to add your first record — they'll show up here automatically.
          </span>
        </div>
      )}
    </div>
  );
}


