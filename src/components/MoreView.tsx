import React from 'react';
import { motion } from 'motion/react';
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
      color: 'bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/30',
      badge: 'INTEL CENTER',
    },
    {
      id: 'companies',
      title: 'Companies',
      desc: 'Corporate accounts & camp manager contacts',
      icon: Building2,
      color: 'bg-[#2E4B8F]/20 text-[#2E4B8F] border-[#2E4B8F]/40',
      badge: `${appData.companies.length} LOGGED`,
    },
    {
      id: 'feedback',
      title: 'Feedback',
      desc: 'Customer satisfaction ratings & client notes',
      icon: MessageCircle,
      color: 'bg-[#2F9E77]/10 text-[#2F9E77] border-[#2F9E77]/30',
      badge: `${appData.feedback.length} REVIEWS`,
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
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="bg-[#0F1B33] rounded p-4 border border-white/10 shadow-ops-panel flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1C2A4A] border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
            <Grid className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <h2 className="ops-eyebrow text-[#C9A227]">
              MORE OPERATIONS &amp; WORKSPACE
            </h2>
            <p className="text-[11px] text-[#8891A3] font-mono mt-0.5">
              Select a section below to access detailed registers, analytics, and app settings
            </p>
          </div>
        </div>
      </div>

      {/* Featured Primary Items (Analytics, Companies, Feedback) */}
      <div className="space-y-2.5">
        <h3 className="ops-eyebrow text-[#8891A3]">
          FEATURED REGISTERS &amp; ANALYTICS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(item.id)}
                className="bg-[#0F1B33] rounded p-4 border border-white/10 hover:border-[#C9A227]/40 shadow-ops-panel transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded border ${item.color}`}>
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#8891A3] bg-[#1C2A4A] px-2 py-0.5 rounded border border-white/10">
                    {item.badge}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-white group-hover:text-[#C9A227] transition-colors">
                      {item.title}
                    </h4>
                    <ChevronRight className="w-3.5 h-3.5 text-[#8891A3] group-hover:text-[#C9A227] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-[#8891A3] font-mono mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Secondary Registers */}
      <div className="space-y-2.5">
        <h3 className="ops-eyebrow text-[#8891A3]">
          ADDITIONAL TOOLS &amp; SETTINGS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(item.id)}
                className="bg-[#0F1B33] rounded p-3.5 border border-white/10 hover:border-[#C9A227]/30 shadow-ops-panel transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded shrink-0 border ${
                      item.isComplaint
                        ? 'bg-[#D64545]/10 text-[#D64545] border-[#D64545]/30'
                        : 'bg-[#1C2A4A] text-[#8891A3] border-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-mono font-bold text-white truncate group-hover:text-[#C9A227] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-[#8891A3] font-mono truncate mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[9px] font-mono font-bold text-[#8891A3] bg-[#1C2A4A] px-2 py-0.5 rounded border border-white/5 hidden xs:inline-block">
                    {item.badge}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8891A3] group-hover:text-[#C9A227] group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
