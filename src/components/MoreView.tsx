import React from 'react';
import { AppData } from '../types';
import {
  TrendingUp,
  Building2,
  MessageCircle,
  ClipboardCheck,
  AlertTriangle,
  Search,
  Smartphone,
  ClipboardList,
  Settings as SettingsIcon,
  ChevronRight,
  Grid,
} from 'lucide-react';

interface MoreViewProps {
  appData: AppData;
  onNavigate: (tab: string) => void;
}

export default function MoreView({ appData, onNavigate }: MoreViewProps) {
  const primaryItems = [
    {
      id: 'analytics',
      title: 'Operations Analytics',
      desc: 'Performance trends, charts & conversion intel',
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'Intel Center',
    },
    {
      id: 'companies',
      title: 'Companies',
      desc: 'Corporate accounts & camp manager contacts',
      icon: Building2,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: `${appData.companies.length} logged`,
    },
    {
      id: 'feedback',
      title: 'Feedback',
      desc: 'Customer satisfaction ratings & client notes',
      icon: MessageCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: `${appData.feedback.length} reviews`,
    },
  ];

  const secondaryItems = [
    {
      id: 'attendance',
      title: 'Attendance Register',
      desc: 'Agent monthly attendance logs & signatures',
      icon: ClipboardCheck,
      badge: `${appData.attendance.length} entries`,
    },
    {
      id: 'complaints',
      title: 'Complaints & Disputes',
      desc: 'Customer issues requiring resolution',
      icon: AlertTriangle,
      badge: `${appData.complaints.length} logged`,
      isComplaint: true,
    },
    {
      id: 'competitors',
      title: 'Competitor Intel',
      desc: 'Market competitor rate & strategy tracking',
      icon: Search,
      badge: `${appData.competitors.length} tracked`,
    },
    {
      id: 'social',
      title: 'Social Ad Campaigns',
      desc: 'Digital promotion tracking across channels',
      icon: Smartphone,
      badge: `${appData.social.length} campaigns`,
    },
    {
      id: 'plans',
      title: 'Marketing Plans',
      desc: 'Structured outreach strategies & goals',
      icon: ClipboardList,
      badge: `${appData.plans.length} active`,
    },
    {
      id: 'settings',
      title: 'Settings & Configs',
      desc: 'Agent profile, manager WhatsApp & email relays',
      icon: SettingsIcon,
      badge: 'Configuration',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[var(--gold-dim,#F4E9D2)] flex items-center justify-center text-[var(--ink,#16213E)]">
            <Grid className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[var(--ink,#16213E)] uppercase tracking-wider font-display">
              More Operations &amp; Workspace
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              Select a section below to access detailed registers, analytics, and app settings
            </p>
          </div>
        </div>
      </div>

      {/* Featured Primary Items (Analytics, Companies, Feedback) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Featured Registers &amp; Analytics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer active:scale-98"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${item.color}`}>
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                    {item.badge}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h4>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Registers */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Additional Tools &amp; Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-sm transition-all text-left flex items-center justify-between group cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      item.isComplaint
                        ? 'bg-rose-50 text-[var(--coral,#D64545)]'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 hidden xs:inline-block">
                    {item.badge}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
