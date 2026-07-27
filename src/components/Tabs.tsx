import React, { useRef, useState } from 'react';
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
  LucideIcon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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

interface SidebarTabProps {
  key?: string;
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
  isComplaint?: boolean;
  badge?: number;
  onClick: () => void;
}

function SidebarTabButton({ label, Icon, isActive, isComplaint, badge, onClick }: SidebarTabProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);
  const { isOutdoor } = useTheme();

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (isOutdoor) {
    // HIGH-CONTRAST OUTDOOR MODE STYLING
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-bold cursor-pointer overflow-hidden my-0.5 border-2 transition-all ${
          isActive
            ? 'bg-[#000000] text-[#FFFFFF] border-[#000000] font-extrabold shadow-sm'
            : 'bg-[#FFFFFF] text-[#000000] border-[#000000]/20 hover:border-[#000000] hover:bg-[#F0F0F0]'
        }`}
      >
        <div className="relative flex items-center gap-3 z-10">
          <Icon
            className={`w-4 h-4 shrink-0 ${
              isActive ? 'text-[#FFFFFF]' : isComplaint ? 'text-[#B91C1C]' : 'text-[#000000]'
            }`}
            strokeWidth={isActive ? 2.5 : 2}
          />
          <span className="tracking-tight">{label}</span>
        </div>
        {badge && badge > 0 ? (
          <span className={`relative z-10 font-mono text-[10px] font-black px-1.5 py-0.5 rounded ${
            isActive ? 'bg-[#FFFFFF] text-[#000000]' : 'bg-[#B91C1C] text-[#FFFFFF]'
          }`}>
            {badge}
          </span>
        ) : null}
      </motion.button>
    );
  }

  // OFFICE MODE STYLING
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        setSweepKey((k) => k + 1);
        onClick();
      }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-r-md text-xs font-semibold cursor-pointer overflow-hidden"
      style={{
        color: isActive ? '#ffffff' : '#8891A3',
        fontWeight: isActive ? 700 : 600,
        background: isActive ? 'rgba(201,162,39,0.10)' : 'transparent',
        borderLeft: `2px solid ${isActive ? '#C9A227' : 'transparent'}`,
        transition: 'color 0.2s ease, background 0.3s ease',
      }}
    >
      {isActive && (
        <div className="absolute inset-0 pointer-events-none rounded-r-md" style={{ padding: 1 }}>
          <div
            className="absolute inset-0 rounded-r-md beam-rotate"
            style={{
              background:
                'conic-gradient(from var(--beam-angle, 0deg), transparent 0%, transparent 74%, rgba(201,162,39,0.85) 82%, rgba(255,241,199,0.95) 86%, rgba(201,162,39,0.85) 90%, transparent 98%)',
            }}
          />
          <div className="absolute rounded-r-md" style={{ inset: 1, background: '#101C36' }} />
        </div>
      )}

      {hovering && (
        <div
          className="pointer-events-none absolute inset-0 rounded-r-md"
          style={{
            background: `radial-gradient(90px circle at ${pos.x}% ${pos.y}%, rgba(255,241,199,0.14), rgba(201,162,39,0.08) 45%, transparent 70%)`,
          }}
        />
      )}

      <div key={sweepKey} className="sweep pointer-events-none absolute inset-0 rounded-r-md" />

      <div className="relative flex items-center gap-3 z-10">
        <Icon
          className="w-4 h-4 shrink-0"
          style={{ color: isActive ? '#C9A227' : isComplaint ? '#F27373' : '#8891A3' }}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
        <span>{label}</span>
      </div>
      {badge && badge > 0 ? (
        <span
          className="relative z-10 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md"
          style={{ background: 'rgba(214,69,69,0.2)', color: '#F27373', border: '1px solid rgba(214,69,69,0.3)' }}
        >
          {badge}
        </span>
      ) : null}
    </motion.button>
  );
}

export default function Tabs({ activeTab, onTabChange, badges }: TabsProps) {
  const { isOutdoor } = useTheme();

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
      <style>{`
        @property --beam-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes beam-spin {
          from { --beam-angle: 0deg; }
          to { --beam-angle: 360deg; }
        }
        .beam-rotate {
          animation: beam-spin 3.2s linear infinite;
        }
        @keyframes sweep-once {
          0% { transform: translateX(-120%) skewX(-15deg); opacity: 0; }
          15% { opacity: 0.5; }
          100% { transform: translateX(220%) skewX(-15deg); opacity: 0; }
        }
        .sweep {
          background: linear-gradient(100deg, transparent 40%, rgba(255,255,255,0.16) 50%, transparent 60%);
          animation: sweep-once 0.7s ease-out;
        }
      `}</style>

      {/* Desktop / Tablet Sidebar Navigation */}
      <div className={`hidden lg:flex flex-col w-64 min-h-screen p-4 border-r shrink-0 select-none transition-colors ${
        isOutdoor 
          ? 'bg-[#FFFFFF] text-[#000000] border-r-2 border-black' 
          : 'bg-[#0F1B33] text-[#8891A3] border-white/10'
      }`}>
        <div className="mb-5 px-2.5">
          <span className={`ops-eyebrow text-[10px] ${isOutdoor ? 'text-[#000000] font-black' : 'text-[#8891A3]'}`}>
            OPS NAVIGATION
          </span>
        </div>
        <nav className="space-y-1 flex-1 relative">
          {tabs.map((t) => (
            <SidebarTabButton
              key={t.id}
              label={t.label}
              Icon={t.icon}
              isActive={activeTab === t.id}
              isComplaint={t.isComplaint}
              badge={t.badge}
              onClick={() => onTabChange(t.id)}
            />
          ))}
        </nav>
        <div className={`mt-auto border-t pt-4 px-2.5 ${isOutdoor ? 'border-black' : 'border-white/10'}`}>
          <div className={`ops-eyebrow ${isOutdoor ? 'text-[#000000] font-black' : 'text-[#5B6478]'}`}>
            AL JADEED EXCHANGE
          </div>
          <div className={`font-mono text-[10px] font-extrabold mt-0.5 ${isOutdoor ? 'text-[#000000]' : 'text-slate-400'}`}>
            OPS CONSOLE v3.2
          </div>
        </div>
      </div>

      {/* Persistent Bottom Navigation for Mobile */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 px-2 py-1.5 flex items-center justify-around z-40 select-none transition-colors ${
        isOutdoor 
          ? 'bg-[#FFFFFF] border-t-2 border-black shadow-none' 
          : 'bg-[#0F1B33] border-t border-white/10 shadow-2xl'
      }`}>
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
                className={`w-10 h-8 flex items-center justify-center rounded-md transition-all relative ${
                  isOutdoor
                    ? isActive
                      ? 'bg-[#000000] text-[#FFFFFF] border-2 border-black'
                      : 'bg-[#FFFFFF] text-[#000000] border border-black/20'
                    : isActive
                      ? 'bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/30'
                      : 'text-[#8891A3]'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                {t.badge && t.badge > 0 ? (
                  <span className={`absolute -top-1 -right-1 font-mono text-[9px] font-black px-1 rounded ${
                    isOutdoor ? 'bg-[#B91C1C] text-white border border-black' : 'bg-[#D64545] text-white border border-[#0F1B33]'
                  }`}>
                    {t.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  isOutdoor
                    ? isActive ? 'text-[#000000] font-black underline' : 'text-[#222222] font-bold'
                    : isActive ? 'text-[#C9A227] font-bold' : 'text-[#8891A3] font-medium'
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


