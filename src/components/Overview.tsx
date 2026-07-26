import React from 'react';
import { motion } from 'motion/react';
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
      accent: 'border-l-4 border-l-[#2E4B8F]',
    },
    {
      id: 'camps',
      label: 'Labor Camps',
      icon: Tent,
      count: appData.camps.length,
      accent: 'border-l-4 border-l-[#C9A227]',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      count: appData.customers.length,
      accent: 'border-l-4 border-l-[#2F9E77]',
    },
    {
      id: 'visits',
      label: 'Field Visits',
      icon: MapPin,
      count: appData.visits.length,
      accent: 'border-l-4 border-l-[#D64545]',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: ClipboardCheck,
      count: appData.attendance.length,
      accent: 'border-l-4 border-l-[#8891A3]',
    },
  ];

  const showNoteCard = appData.companies.length === 0 && appData.customers.length === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="ops-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-[#E2E5E1] pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#0F1B33]" strokeWidth={2} />
          <span className="ops-eyebrow text-[#0F1B33]">FIELD OPERATIONS OVERVIEW</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#2F9E77] bg-[#2F9E77]/10 px-2.5 py-1 rounded border border-[#2F9E77]/20 flex items-center gap-1.5">
          <Activity className="w-3 h-3 animate-pulse text-[#2F9E77]" />
          LIVE METRICS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {/* Core Metric Cards */}
        {stats.map((s) => {
          const Icon = s.icon;
          const isDimmed = (s.id === 'companies' || s.id === 'customers') && s.count === 0;

          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate(s.id)}
              className={`lg:col-span-1 bg-white p-3.5 rounded-lg border border-[#E2E5E1] hover:border-[#0F1B33]/30 shadow-xs flex flex-col justify-between text-left cursor-pointer transition-all ${s.accent} ${
                isDimmed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center justify-between text-[#8891A3] mb-2">
                <Icon className="w-4 h-4 text-[#0F1B33]" strokeWidth={1.8} />
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">QTY</span>
              </div>
              <div>
                <span className="text-2xl font-mono font-extrabold text-[#0F1B33] tracking-tight block">
                  {s.count}
                </span>
                <span className="ops-eyebrow text-[9px] mt-0.5 block truncate">
                  {s.label}
                </span>
              </div>
            </motion.button>
          );
        })}

        {/* Combined Status Snapshot Card */}
        <div className="sm:col-span-2 lg:col-span-2 bg-[#0F1B33] text-white rounded-lg p-4 border border-white/10 flex flex-col justify-between relative overflow-hidden shadow-ops-panel">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <span className="ops-eyebrow text-[#C9A227] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C9A227]" strokeWidth={2} />
              OPS STATUS SNAPSHOT
            </span>
            <span className="font-mono text-[9px] text-[#8891A3] font-bold">REALTIME</span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-3">
            {/* Pending Complaints Item */}
            <button
              onClick={() => onNavigate('complaints')}
              className="text-left space-y-1 group hover:opacity-90 cursor-pointer transition-opacity"
            >
              <span className="ops-eyebrow text-[#8891A3]">PENDING ISSUES</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-extrabold text-[#F27373]">
                  {pendingComplaints}
                </span>
                <span className="text-[10px] font-mono text-[#8891A3] group-hover:text-white transition-colors flex items-center gap-0.5">
                  VIEW <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </button>

            {/* Active Marketing Plans Item */}
            <button
              onClick={() => onNavigate('plans')}
              className="text-left space-y-1 group hover:opacity-90 cursor-pointer transition-opacity"
            >
              <span className="ops-eyebrow text-[#8891A3]">ACTIVE PLANS</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-extrabold text-[#4ADE94]">
                  {activePlans}
                </span>
                <span className="text-[10px] font-mono text-[#8891A3] group-hover:text-white transition-colors flex items-center gap-0.5">
                  VIEW <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </button>
          </div>

          <div className="font-mono text-[10px] text-slate-300 bg-[#1C2A4A] p-2 rounded border border-white/5 flex items-center gap-1.5">
            {pendingComplaints > 0 ? (
              <>
                <AlertTriangle className="w-3 h-3 text-[#F27373] shrink-0" strokeWidth={2} />
                <span>Resolve disputes to maintain camp partner confidence.</span>
              </>
            ) : (
              <span className="text-[#4ADE94]">✓ Zero unresolved disputes logged. Operations clear.</span>
            )}
          </div>
        </div>
      </div>

      {/* Note Card when Companies and Customers are both 0 */}
      {showNoteCard && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg border border-[#E2E5E1] bg-slate-50 text-slate-700 text-xs">
          <Info className="w-4 h-4 text-[#2E4B8F] shrink-0" strokeWidth={2} />
          <span>
            No companies or customers logged yet. Use Quick Actions or Navigation to add your first record.
          </span>
        </div>
      )}
    </motion.div>
  );
}



