import React from 'react';
import { motion } from 'motion/react';
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
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, badge: badges.attendance },
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
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'visits', label: 'Visits', icon: MapPin },
    { id: 'camps', label: 'Camps', icon: Tent, badge: badges.camps },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  const mainTabIds = ['dashboard', 'visits', 'camps', 'customers'];

  return (
    <div>
      {/* Desktop / Tablet Sidebar Navigation */}
      <div className="hidden lg:flex flex-col bg-[#0F1B33] text-[#8891A3] w-64 min-h-screen p-4 border-r border-white/10 shrink-0 select-none">
        <div className="mb-5 px-2.5">
          <span className="ops-eyebrow text-[#8891A3] text-[10px]">OPS NAVIGATION</span>
        </div>
        <nav className="space-y-1 flex-1 relative">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange(t.id)}
                className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-r-md text-xs font-semibold cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#rgba(201,162,39,0.12)] bg-[#C9A227]/10 text-white font-bold border-l-2 border-[#C9A227]'
                    : 'hover:bg-white/5 text-[#8891A3] hover:text-slate-200 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-[#C9A227]'
                        : t.isComplaint
                        ? 'text-[#F27373]'
                        : 'text-[#8891A3]'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{t.label}</span>
                </div>
                {t.badge && t.badge > 0 ? (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#D64545]/20 text-[#F27373] border border-[#D64545]/30">
                    {t.badge}
                  </span>
                ) : null}
              </motion.button>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4 px-2.5">
          <div className="ops-eyebrow text-[#5B6478]">AL JADEED EXCHANGE</div>
          <div className="font-mono text-[10px] text-slate-400 font-semibold mt-0.5">
            OPS CONSOLE v3.2
          </div>
        </div>
      </div>

      {/* Persistent Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0F1B33] border-t border-white/10 px-2 py-1 flex items-center justify-around shadow-2xl z-40 select-none">
        {mobileNavTabs.map((t) => {
          const isActive =
            t.id === 'more'
              ? activeTab === 'more' || !mainTabIds.includes(activeTab)
              : activeTab === t.id;
          const Icon = t.icon;

          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(t.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer relative"
            >
              <div
                className={`w-9 h-7 flex items-center justify-center rounded-md transition-all relative ${
                  isActive
                    ? 'bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/30'
                    : 'text-[#8891A3]'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
                {t.badge && t.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 font-mono text-[9px] font-bold bg-[#D64545] text-white px-1 rounded border border-[#0F1B33]">
                    {t.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                  isActive ? 'text-[#C9A227] font-bold' : 'text-[#8891A3]'
                }`}
              >
                {t.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}


