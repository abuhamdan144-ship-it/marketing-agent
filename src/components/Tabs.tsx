import React from 'react';
import {
  Home,
  TrendingUp,
  ClipboardCheck,
  Building2,
  Tent,
  Users,
  MapPin,
  MessageCircle,
  AlertTriangle,
  Search,
  Smartphone,
  ClipboardList,
  Settings as SettingsIcon,
  MoreHorizontal,
} from 'lucide-react';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges: {
    companies: number;
    camps: number;
    customers: number;
    visits: number;
    attendance?: number;
  };
}

export default function Tabs({ activeTab, onTabChange, badges }: TabsProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance Sheet', icon: ClipboardCheck, badge: badges.attendance },
    { id: 'companies', label: 'Companies', icon: Building2, badge: badges.companies },
    { id: 'camps', label: 'Camps', icon: Tent, badge: badges.camps },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'visits', label: 'Visits', icon: MapPin },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle, isComplaint: true },
    { id: 'competitors', label: 'Competitors', icon: Search },
    { id: 'social', label: 'Social Ads', icon: Smartphone },
    { id: 'plans', label: 'Plans', icon: ClipboardList },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const mobileNavTabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'visits', label: 'Visits', icon: MapPin },
    { id: 'camps', label: 'Camps', icon: Tent, badge: badges.camps },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  const mainTabIds = ['dashboard', 'visits', 'camps', 'customers'];

  return (
    <div>
      {/* Desktop / Tablet Sidebar & Top Navigation */}
      <div className="hidden lg:flex flex-col bg-slate-900 text-slate-300 w-64 min-h-screen p-5 border-r border-slate-800 shrink-0">
        <div className="mb-6 px-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Marketing Workspace
          </div>
        </div>
        <nav className="space-y-1.5 flex-1">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all transform active:scale-98 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      t.isComplaint && !isActive
                        ? 'text-[var(--coral,#D64545)]'
                        : ''
                    }`}
                    strokeWidth={1.8}
                  />
                  <span>{t.label}</span>
                </div>
                {t.badge && t.badge > 0 ? (
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-slate-800 pt-4 px-2">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
            Agent Notebook v3.5
          </div>
          <div className="text-[9px] text-slate-600 font-medium mt-1">
            Build with React, TS &amp; Tailwind
          </div>
        </div>
      </div>

      {/* Persistent Bottom Navigation for Mobile & Small Tablets */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--line,#E2E5E1)] px-1 py-1.5 flex items-center justify-around shadow-2xl z-40 select-none">
        {mobileNavTabs.map((t) => {
          const isActive =
            t.id === 'more'
              ? activeTab === 'more' || !mainTabIds.includes(activeTab)
              : activeTab === t.id;
          const Icon = t.icon;

          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className="flex flex-col items-center justify-center flex-1 py-0.5 cursor-pointer select-none transition-all"
            >
              <div
                className={`w-9 h-7 flex items-center justify-center rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-[var(--gold-dim,#F4E9D2)] text-[var(--ink,#16213E)]'
                    : 'bg-transparent text-[var(--ink-30,#A6ACBC)]'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                {t.badge && t.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-extrabold px-1 rounded-full min-w-[14px] text-center border border-white">
                    {t.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[9px] tracking-tight mt-0.5 whitespace-nowrap font-bold ${
                  isActive ? 'text-[var(--ink,#16213E)]' : 'text-[var(--ink-30,#A6ACBC)]'
                }`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

