import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { AppData } from '../types';
import { Target, Edit2, CheckCircle2, Award, Flame, X, AlertTriangle, Rocket, Sparkles } from 'lucide-react';

interface GoalTrackerProps {
  appData: AppData;
  onUpdateGoal: (newGoal: number) => void;
  onHide?: () => void;
}

export default function GoalTracker({ appData, onUpdateGoal, onHide }: GoalTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(appData.settings.monthlyVisitGoal || 15);

  const targetGoal = appData.settings.monthlyVisitGoal || 15;

  // Get current month visits
  const currentMonthData = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-indexed
    const monthPrefix = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`; // "YYYY-MM"
    
    const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentMonthVisits = appData.visits.filter(v => v.date && v.date.startsWith(monthPrefix));
    
    const count = currentMonthVisits.length;
    const percentage = Math.min(100, Math.round((count / targetGoal) * 100));
    
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const monthElapsedFraction = dayOfMonth / daysInMonth;
    const progressFraction = count / targetGoal;

    let status: 'completed' | 'on-track' | 'behind' = 'on-track';
    if (count >= targetGoal) {
      status = 'completed';
    } else if (progressFraction < monthElapsedFraction * 0.8) {
      status = 'behind';
    }

    return {
      monthName,
      count,
      percentage,
      status,
      remaining: Math.max(0, targetGoal - count),
      dayOfMonth,
      daysInMonth
    };
  }, [appData.visits, targetGoal]);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Math.max(1, Math.min(1000, Number(goalInput)));
    onUpdateGoal(parsed);
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0F1B33] text-white rounded-lg p-5 border border-white/10 shadow-ops-panel relative overflow-hidden select-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#C9A227]/10 rounded border border-[#C9A227]/30 text-[#C9A227]">
            <Target className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="ops-eyebrow text-[#C9A227]">REMITTANCE DRIVE TARGET</span>
            <p className="font-mono text-[11px] text-[#8891A3] mt-0.5">
              Campaigns &amp; field deployments for <strong className="text-white">{currentMonthData.monthName}</strong>
            </p>
          </div>
        </div>

        {/* Quick Edit Target */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <form onSubmit={handleSaveGoal} className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="1000"
                value={goalInput}
                onChange={(e) => setGoalInput(Number(e.target.value))}
                className="w-16 bg-[#1C2A4A] border border-white/20 rounded px-2 py-1 text-xs text-center font-mono font-bold text-white focus:outline-none focus:border-[#C9A227]"
              />
              <button
                type="submit"
                className="bg-[#2F9E77] hover:bg-[#2F9E77]/80 text-white font-mono font-bold text-[10px] uppercase px-2 py-1 rounded cursor-pointer transition-colors"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-[#8891A3] hover:text-white font-mono text-[10px] px-1 py-1"
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setGoalInput(targetGoal);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-300 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded border border-white/10 cursor-pointer transition-all"
              >
                <Edit2 className="w-3 h-3 text-[#C9A227]" />
                GOAL ({targetGoal})
              </button>
              {onHide && (
                <button
                  type="button"
                  onClick={onHide}
                  title="Hide Goal Tracker"
                  className="p-1.5 bg-white/5 hover:bg-[#D64545]/20 text-[#8891A3] hover:text-[#F27373] rounded border border-white/10 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Core */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-5 items-center">
        
        {/* Status circle metrics */}
        <div className="md:col-span-1 flex flex-col items-center justify-center bg-[#1C2A4A]/50 p-3 rounded border border-white/5 text-center">
          <div className="relative flex items-center justify-center">
            {/* SVG circle percentage tracker */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-[#0B1526] fill-none"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={`fill-none transition-all duration-1000 ${
                  currentMonthData.status === 'completed' ? 'stroke-[#4ADE94]' : 'stroke-[#C9A227]'
                }`}
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * currentMonthData.percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-mono font-extrabold leading-none text-white">
                {currentMonthData.percentage}%
              </span>
              <p className="ops-eyebrow text-[#8891A3] text-[8px] mt-0.5">
                COMPLETE
              </p>
            </div>
          </div>

          <div className="mt-2.5">
            {currentMonthData.status === 'completed' && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] bg-[#2F9E77]/20 text-[#4ADE94] font-bold px-2 py-0.5 rounded border border-[#2F9E77]/30">
                <Award className="w-3 h-3" />
                TARGET ACHIEVED
              </span>
            )}
            {currentMonthData.status === 'on-track' && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] bg-[#2E4B8F]/30 text-[#8891A3] font-bold px-2 py-0.5 rounded border border-[#2E4B8F]/40">
                <Flame className="w-3 h-3 text-[#C9A227]" />
                ON TRACK
              </span>
            )}
            {currentMonthData.status === 'behind' && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] bg-[#D64545]/20 text-[#F27373] font-bold px-2 py-0.5 rounded border border-[#D64545]/30">
                <AlertTriangle className="w-3 h-3" />
                BEHIND TARGET
              </span>
            )}
          </div>
        </div>

        {/* Progress details and bar */}
        <div className="md:col-span-3 space-y-3.5">
          <div className="flex justify-between items-end">
            <div>
              <div className="font-mono text-2xl font-black text-white">
                {currentMonthData.count} <span className="text-[#8891A3] text-xs font-normal">/ {targetGoal}</span>
              </div>
              <p className="ops-eyebrow text-[#8891A3] text-[9px] mt-0.5">
                CAMPAIGNS LOGGED THIS MONTH
              </p>
            </div>

            <div className="text-right">
              {currentMonthData.remaining > 0 ? (
                <span className="font-mono text-xs font-bold text-[#C9A227]">
                  {currentMonthData.remaining} VISITS NEEDED
                </span>
              ) : (
                <span className="font-mono text-xs font-bold text-[#4ADE94] flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  OBJECTIVE ACHIEVED
                </span>
              )}
              <p className="font-mono text-[10px] text-[#8891A3] mt-0.5">
                DAY {currentMonthData.dayOfMonth} OF {currentMonthData.daysInMonth}
              </p>
            </div>
          </div>

          {/* Large custom sleek progress bar */}
          <div className="relative">
            <div className="h-2.5 w-full bg-[#0B1526] rounded-full overflow-hidden border border-white/10">
              <div 
                style={{ width: `${currentMonthData.percentage}%` }}
                className={`h-full rounded-full transition-all duration-1000 relative ${
                  currentMonthData.status === 'completed'
                    ? 'bg-[#2F9E77]'
                    : currentMonthData.status === 'behind'
                    ? 'bg-[#D64545]'
                    : 'bg-[#C9A227]'
                }`}
              />
            </div>
            
            {/* Visual marker of elapsed month proportion */}
            <div 
              style={{ left: `${(currentMonthData.dayOfMonth / currentMonthData.daysInMonth) * 100}%` }}
              className="absolute -top-1 -bottom-1 w-0.5 bg-[#F27373] z-10"
              title="Current time progress marker"
            >
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#D64545] text-white font-mono text-[7px] font-bold px-1 rounded-xs whitespace-nowrap">
                TODAY
              </span>
            </div>
          </div>

          {/* Micro-insight */}
          <div className="font-mono text-[10px] text-[#8891A3] bg-[#1C2A4A]/60 p-2.5 rounded border border-white/5 flex items-center gap-1.5">
            {currentMonthData.status === 'completed' ? (
              <span><Sparkles className="w-3.5 h-3.5 text-[#4ADE94] inline mr-1" /> Target achieved for this period. Maintain logged field presence for market dominance.</span>
            ) : currentMonthData.status === 'behind' ? (
              <span><AlertTriangle className="w-3.5 h-3.5 text-[#F27373] inline mr-1" /> Behind pace. {currentMonthData.remaining} visits remaining. Prioritize labor camp deployments.</span>
            ) : (
              <span><Rocket className="w-3.5 h-3.5 text-[#C9A227] inline mr-1" /> On track toward target goal of {targetGoal} field visits.</span>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
}

