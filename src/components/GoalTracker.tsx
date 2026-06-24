import React, { useState, useMemo } from 'react';
import { AppData, Settings } from '../types';
import { Target, TrendingUp, Edit2, CheckCircle2, Award, ArrowUpRight, Flame } from 'lucide-react';

interface GoalTrackerProps {
  appData: AppData;
  onUpdateGoal: (newGoal: number) => void;
}

export default function GoalTracker({ appData, onUpdateGoal }: GoalTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(appData.settings.monthlyVisitGoal || 15);

  const targetGoal = appData.settings.monthlyVisitGoal || 15;

  // 1. Get current month visits
  const currentMonthData = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-indexed
    const monthPrefix = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`; // "YYYY-MM"
    
    const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentMonthVisits = appData.visits.filter(v => v.date && v.date.startsWith(monthPrefix));
    
    const count = currentMonthVisits.length;
    const percentage = Math.min(100, Math.round((count / targetGoal) * 100));
    
    // Status assessment
    // Assuming mid-month is day 15. If current day-of-month fraction is greater than progress fraction, behind.
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
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xl border border-indigo-950 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/20 text-indigo-300">
            <Target className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-200 font-display">
              Monthly Remittance Drive Target
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Tracking campaigns and camp deployments for <strong className="text-slate-200">{currentMonthData.monthName}</strong>
            </p>
          </div>
        </div>

        {/* Quick Edit Target */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <form onSubmit={handleSaveGoal} className="flex items-center gap-1.5 animate-fade-in">
              <input
                type="number"
                min="1"
                max="1000"
                value={goalInput}
                onChange={(e) => setGoalInput(Number(e.target.value))}
                className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg shadow cursor-pointer transition-colors"
              >
                Set
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white font-bold text-[10px] px-1.5 py-1"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setGoalInput(targetGoal);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-300 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5 cursor-pointer transition-all"
            >
              <Edit2 className="w-3 h-3 text-indigo-400" />
              Adjust Target Goal ({targetGoal})
            </button>
          )}
        </div>
      </div>

      {/* Progress Core */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        
        {/* Status circle metrics */}
        <div className="md:col-span-1 flex flex-col items-center justify-center bg-slate-800/40 p-3 rounded-xl border border-white/5 text-center">
          <div className="relative flex items-center justify-center">
            {/* SVG circle percentage tracker */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-800 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={`stroke-indigo-500 fill-none transition-all duration-1000 ${
                  currentMonthData.status === 'completed' ? 'stroke-emerald-400' : 'stroke-indigo-400'
                }`}
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * currentMonthData.percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-extrabold font-display leading-none">
                {currentMonthData.percentage}%
              </span>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Completed
              </p>
            </div>
          </div>

          <div className="mt-3">
            {currentMonthData.status === 'completed' && (
              <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/10">
                <Award className="w-3 h-3" />
                Target Smashed!
              </span>
            )}
            {currentMonthData.status === 'on-track' && (
              <span className="inline-flex items-center gap-1 text-[9px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-md border border-blue-500/10">
                <Flame className="w-3 h-3 text-amber-400" />
                On Track
              </span>
            )}
            {currentMonthData.status === 'behind' && (
              <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-md border border-amber-500/10">
                ⚠️ Run campaigns
              </span>
            )}
          </div>
        </div>

        {/* Progress details and bar */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-2xl font-black font-display text-white">
                {currentMonthData.count} <span className="text-slate-400 text-sm font-normal">/ {targetGoal}</span>
              </span>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Campaigns completed this month
              </p>
            </div>

            <div className="text-right">
              {currentMonthData.remaining > 0 ? (
                <span className="text-xs font-bold text-indigo-300">
                  {currentMonthData.remaining} more to achieve target
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                  <CheckCircle2 className="w-4 h-4" />
                  Monthly Objective Achieved
                </span>
              )}
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Current day of month: {currentMonthData.dayOfMonth} of {currentMonthData.daysInMonth}
              </p>
            </div>
          </div>

          {/* Large custom sleek progress bar */}
          <div className="relative">
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div 
                style={{ width: `${currentMonthData.percentage}%` }}
                className={`h-full rounded-full transition-all duration-1000 relative ${
                  currentMonthData.status === 'completed'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : currentMonthData.status === 'behind'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-400 animate-pulse'
                    : 'bg-gradient-to-r from-indigo-500 to-blue-400'
                }`}
              />
            </div>
            
            {/* Visual marker of elapsed month proportion */}
            <div 
              style={{ left: `${(currentMonthData.dayOfMonth / currentMonthData.daysInMonth) * 100}%` }}
              className="absolute -top-1 -bottom-1 w-0.5 bg-rose-400/60 z-10"
              title="Current time progress marker"
            >
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white font-sans text-[7px] font-bold px-1 rounded-sm shadow-md whitespace-nowrap">
                Today
              </span>
            </div>
          </div>

          {/* Quick micro-insight */}
          <div className="text-[11px] text-slate-400 italic bg-white/5 p-2 rounded-lg border border-white/5">
            {currentMonthData.status === 'completed' ? (
              <span>🌟 <strong>Exceptional outreach work, agent!</strong> You have fully achieved this month's targets. Keep logging visits to build stronger market dominance.</span>
            ) : currentMonthData.status === 'behind' ? (
              <span>⚠️ <strong>Slightly behind pace.</strong> You have {currentMonthData.remaining} visits remaining. Focus on labor camp deployments during the upcoming pay cycle!</span>
            ) : (
              <span>🚀 <strong>Solid progress!</strong> You are perfectly on track to achieve your monthly target goal of {targetGoal} visits.</span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
