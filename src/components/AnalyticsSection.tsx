import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Line,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { AppData, Visit, CompetitorIntel } from '../types';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Info,
  Target,
  Flame,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface AnalyticsSectionProps {
  appData: AppData;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Helper to format "YYYY-MM-DD" or "YYYY-MM" to "MMM 'YY"
function formatMonthYear(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const year = parts[0].substring(2);
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES[monthIdx]} '${year}`;
    }
  }
  return dateStr;
}

// Sample Visit Data when none exists to make sure the app has an immediately stunning design
const DEFAULT_VISIT_DATA = [
  { month: "Jan '26", visits: 12, people: 240 },
  { month: "Feb '26", visits: 18, people: 390 },
  { month: "Mar '26", visits: 25, people: 580 },
  { month: "Apr '26", visits: 31, people: 710 },
  { month: "May '26", visits: 42, people: 980 },
  { month: "Jun '26", visits: 55, people: 1240 },
];

// Sample Competitor Data
const DEFAULT_COMPETITOR_DATA = [
  { name: 'Joyalukkas Exchange', reports: 6, score: 16, level: 'High Impact' },
  { name: 'Western Union', reports: 5, score: 14, level: 'High Impact' },
  { name: 'Unimoni Oman', reports: 4, score: 10, level: 'Medium Impact' },
  { name: 'Lulu Exchange', reports: 3, score: 8, level: 'Medium Impact' },
  { name: 'Modern Exchange', reports: 2, score: 4, level: 'Low Impact' },
];

const CustomVisitTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const visitsPld = payload.find((p: any) => p.dataKey === 'visits');
    const peoplePld = payload.find((p: any) => p.dataKey === 'people');
    const projectionPld = payload.find((p: any) => p.dataKey === 'projection');

    return (
      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-3 rounded-xl shadow-xl space-y-2 min-w-[210px] text-xs font-sans">
        <div className="border-b border-slate-800 pb-1.5 mb-1 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
            Operational Month
          </span>
          <span className="text-xs font-black text-indigo-400">
            {label}
          </span>
        </div>
        <div className="space-y-2 pt-0.5">
          {visitsPld && visitsPld.value !== undefined && visitsPld.value !== null && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2 h-2 rounded-full inline-block bg-[#6366f1]" />
                Deployments Logged
              </div>
              <span className="font-extrabold text-white text-right">
                {visitsPld.value} visits
              </span>
            </div>
          )}
          {peoplePld && peoplePld.value !== undefined && peoplePld.value !== null && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2 h-2 rounded-full inline-block bg-[#10b981]" />
                Audience Reach
              </div>
              <span className="font-extrabold text-white text-right">
                {Number(peoplePld.value).toLocaleString()} reached
              </span>
            </div>
          )}
          {projectionPld && projectionPld.value !== undefined && (
            <div className="flex items-center justify-between gap-4 border-t border-slate-800/40 pt-1.5 mt-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2 h-1 bg-[#f43f5e] inline-block rounded-sm" />
                SLR Trend Projection
              </div>
              <span className="font-extrabold text-rose-400 text-right">
                {Math.round(Number(projectionPld.value))} visits
              </span>
            </div>
          )}
        </div>
        {label?.toLowerCase().includes('forecast') && (
          <div className="border-t border-slate-800/80 pt-1.5 mt-1 text-[9px] text-rose-300 font-semibold flex items-center gap-1">
            🔮 Forecasted trend using Simple Linear Regression.
          </div>
        )}
        {visitsPld && Number(visitsPld.value) >= 30 && (
          <div className="border-t border-slate-800/80 pt-1.5 mt-1 text-[9px] text-indigo-300 font-semibold flex items-center gap-1">
            🚀 Period of high labor camp campaign intensity.
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomCompetitorTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (data.level?.includes('High')) {
      badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    } else if (data.level?.includes('Medium')) {
      badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }

    return (
      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-3 rounded-xl shadow-xl space-y-2 min-w-[210px] text-xs font-sans">
        <div className="border-b border-slate-800 pb-1.5 mb-1">
          <p className="text-xs font-black text-slate-200 line-clamp-1">{data.name}</p>
          <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1 ${badgeColor}`}>
            {data.level}
          </span>
        </div>
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Monitoring Actions</span>
            <span className="font-extrabold text-indigo-300">{data.reports} logs</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Threat Level Weight</span>
            <span className="font-extrabold text-amber-400">{data.score} severity score</span>
          </div>
        </div>
        <div className="border-t border-slate-800/80 pt-1.5 mt-1 text-[9px] text-slate-400 leading-relaxed italic">
          {data.level?.includes('High') ? (
            <span>🚨 Aggressive fee waiver campaigns detected. Critical threat to local camp market share.</span>
          ) : (
            <span>💡 Active remittance operator being standardly monitored.</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsSection({ appData }: AnalyticsSectionProps) {
  // 1. Prepare Visit Growth Data
  const visitChartData = useMemo(() => {
    let sourceData: Array<{ month: string; visits: number; people: number; rawKey?: string }> = [];
    let isDemo = false;

    if (!appData.visits || appData.visits.length === 0) {
      sourceData = DEFAULT_VISIT_DATA.map(d => ({ ...d }));
      isDemo = true;
    } else {
      // Group visits by Year-Month
      const monthlyGroups: Record<string, { visits: number; people: number }> = {};
      
      appData.visits.forEach((v) => {
        if (!v.date) return;
        const monthKey = v.date.substring(0, 7); // "YYYY-MM"
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = { visits: 0, people: 0 };
        }
        monthlyGroups[monthKey].visits += 1;
        monthlyGroups[monthKey].people += Number(v.people) || 0;
      });

      // Sort chronologically
      const sortedKeys = Object.keys(monthlyGroups).sort();
      
      sourceData = sortedKeys.map((key) => ({
        month: formatMonthYear(key),
        visits: monthlyGroups[key].visits,
        people: monthlyGroups[key].people,
        rawKey: key,
      }));
    }

    // Calculate linear regression on sourceData
    const n = sourceData.length;
    let slope = 0;
    let intercept = 0;
    if (n >= 1) {
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += sourceData[i].visits;
        sumXY += i * sourceData[i].visits;
        sumXX += i * i;
      }
      const denominator = n * sumXX - sumX * sumX;
      if (denominator === 0) {
        slope = 0;
        intercept = sumY / n;
      } else {
        slope = (n * sumXY - sumX * sumY) / denominator;
        intercept = (sumY - slope * sumX) / n;
      }
    }

    // Map existing data to include projection values
    const dataWithProjection = sourceData.map((d, index) => ({
      ...d,
      projection: Number((slope * index + intercept).toFixed(1))
    }));

    // Generate next month's forecast point
    let nextMonthLabel = 'Forecast';
    if (isDemo) {
      nextMonthLabel = "Jul '26 (Forecast)";
    } else if (sourceData.length > 0) {
      const lastItem = sourceData[sourceData.length - 1];
      if (lastItem.rawKey) {
        const parts = lastItem.rawKey.split('-');
        let year = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
        const nextKey = `${year}-${month.toString().padStart(2, '0')}`;
        nextMonthLabel = `${formatMonthYear(nextKey)} (Forecast)`;
      }
    }

    const forecastedVisits = Math.max(0, slope * n + intercept);

    // Append forecasted item with undefined visits/people so area curves terminate
    dataWithProjection.push({
      month: nextMonthLabel,
      visits: undefined as any,
      people: undefined as any,
      projection: Number(forecastedVisits.toFixed(1))
    });

    return { 
      data: dataWithProjection, 
      isDemo, 
      forecastValue: Math.round(forecastedVisits) 
    };
  }, [appData.visits]);

  // 2. Prepare Competitor Intel Data
  const competitorChartData = useMemo(() => {
    if (!appData.competitors || appData.competitors.length === 0) {
      return { data: DEFAULT_COMPETITOR_DATA, isDemo: true };
    }

    // Group by competitor name
    const groups: Record<string, { name: string; reports: number; score: number }> = {};
    
    appData.competitors.forEach((c) => {
      const name = c.name?.trim() || 'Other Competitor';
      if (!groups[name]) {
        groups[name] = { name, reports: 0, score: 0 };
      }
      
      groups[name].reports += 1;
      
      // Calculate a score based on impact: High = 3, Medium = 2, Low = 1
      let weight = 2;
      if (c.impact?.toLowerCase() === 'high') weight = 3;
      if (c.impact?.toLowerCase() === 'low') weight = 1;
      groups[name].score += weight;
    });

    const list = Object.values(groups)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6) // limit to top 6 competitors
      .map((item) => {
        let level = 'Low Impact';
        if (item.score >= 10) level = 'High Impact';
        else if (item.score >= 5) level = 'Medium Impact';
        return {
          ...item,
          level
        };
      });

    return { data: list, isDemo: false };
  }, [appData.competitors]);

  // Insights computation
  const insights = useMemo(() => {
    const isDemo = visitChartData.isDemo || competitorChartData.isDemo;
    if (isDemo) {
      return [
        {
          title: "Steady Expansion Track",
          desc: "Average audience engagement during labor camp drives shows a 25% month-on-month escalation in reach.",
          type: "success"
        },
        {
          title: "Competitor Market Aggression",
          desc: "High competitor monitoring levels logged for Joyalukkas and Western Union indicates intense fee and rate wars.",
          type: "warning"
        },
        {
          title: "Field Recommendation",
          desc: "Targeting high-capacity camp visits during weekend paydays yields maximum customer lead conversions.",
          type: "info"
        }
      ];
    }

    const list = [];
    const visits = appData.visits;
    const competitors = appData.competitors;

    // Total reach calculation
    const totalReach = visits.reduce((acc, curr) => acc + (Number(curr.people) || 0), 0);
    const averageReach = visits.length ? Math.round(totalReach / visits.length) : 0;

    if (visits.length > 0) {
      list.push({
        title: "Field Campaign Performance",
        desc: `With ${visits.length} logged deployments, you have engaged approximately ${totalReach} prospective customers face-to-face, averaging ${averageReach} contacts per campaign.`,
        type: "success"
      });
    }

    if (competitors.length > 0) {
      const topComp = competitorChartData.data[0];
      list.push({
        title: "Primary Rival Focus",
        desc: `Intelligence reports indicate "${topComp.name}" is your most tracked competitor, presenting a ${topComp.level} threat level.`,
        type: "warning"
      });
    }

    if (list.length < 3) {
      list.push({
        title: "Operations Suggestion",
        desc: "Regularly register your daily field visits, labor camp deployments, and competitor price updates to keep these business intelligence insights fully synchronized.",
        type: "info"
      });
    }

    return list;
  }, [appData.visits, appData.competitors, visitChartData.isDemo, competitorChartData.isDemo]);

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const isDemoMode = visitChartData.isDemo || competitorChartData.isDemo;

  // 3. Monthly Goal Target calculations
  const monthlyGoalMetrics = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const monthPrefix = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    const targetGoal = appData.settings?.monthlyVisitGoal || 15;
    const currentMonthVisits = appData.visits.filter(v => v.date && v.date.startsWith(monthPrefix));
    const count = currentMonthVisits.length;
    const percentage = Math.min(100, Math.round((count / targetGoal) * 100));
    
    return {
      targetGoal,
      count,
      percentage,
      remaining: Math.max(0, targetGoal - count),
    };
  }, [appData.visits, appData.settings]);

  // 4. Period-over-Period (PoP) Growth Calculations for Customer Visits & Audience Reach
  const popMetrics = useMemo(() => {
    const data = visitChartData.data;
    if (data.length < 1) {
      return {
        hasTwoPeriods: false,
        currentPeriodName: 'Current Period',
        prevPeriodName: 'Previous Period',
        currentVisits: 0,
        prevVisits: 0,
        visitsGrowth: 0,
        currentPeople: 0,
        prevPeople: 0,
        peopleGrowth: 0,
        totalVisits: 0,
        totalPeople: 0,
      };
    }

    const totalVisits = data.reduce((sum, item) => sum + item.visits, 0);
    const totalPeople = data.reduce((sum, item) => sum + item.people, 0);

    if (data.length < 2) {
      const current = data[0];
      return {
        hasTwoPeriods: false,
        currentPeriodName: current.month,
        prevPeriodName: 'Previous',
        currentVisits: current.visits,
        prevVisits: 0,
        visitsGrowth: 100,
        currentPeople: current.people,
        prevPeople: 0,
        peopleGrowth: 100,
        totalVisits,
        totalPeople,
      };
    }

    const current = data[data.length - 1];
    const previous = data[data.length - 2];

    const visitsDiff = current.visits - previous.visits;
    const visitsGrowth = previous.visits > 0 ? (visitsDiff / previous.visits) * 100 : current.visits > 0 ? 100 : 0;

    const peopleDiff = current.people - previous.people;
    const peopleGrowth = previous.people > 0 ? (peopleDiff / previous.people) * 100 : current.people > 0 ? 100 : 0;

    return {
      hasTwoPeriods: true,
      currentPeriodName: current.month,
      prevPeriodName: previous.month,
      currentVisits: current.visits,
      prevVisits: previous.visits,
      visitsGrowth,
      currentPeople: current.people,
      prevPeople: previous.people,
      peopleGrowth,
      totalVisits,
      totalPeople,
    };
  }, [visitChartData]);

  return (
    <div className="space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Operations Intelligence &amp; Analytics
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            Statistical breakdown of agent outreach performance and competitive market landscape
          </p>
        </div>
        
        {isDemoMode && (
          <span className="self-start sm:self-center inline-flex items-center gap-1.5 text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 font-bold">
            <Info className="w-3.5 h-3.5" />
            Showing Interactive Sample Data
          </span>
        )}
      </div>

      {/* Period-over-Period Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Visit Growth */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              Deployment Frequency PoP
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800 font-display">
                {popMetrics.currentVisits}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-sans">
                deployments ({popMetrics.currentPeriodName})
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                popMetrics.visitsGrowth >= 0 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {popMetrics.visitsGrowth >= 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    +{popMetrics.visitsGrowth.toFixed(1)}%
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    {popMetrics.visitsGrowth.toFixed(1)}%
                  </>
                )}
              </span>
              <span className="text-[10px] font-medium text-slate-400 font-sans">
                vs. {popMetrics.prevVisits} in {popMetrics.prevPeriodName}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Reach Growth */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              Audience Reach PoP
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800 font-display">
                {popMetrics.currentPeople.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-sans">
                contacts ({popMetrics.currentPeriodName})
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                popMetrics.peopleGrowth >= 0 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {popMetrics.peopleGrowth >= 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    +{popMetrics.peopleGrowth.toFixed(1)}%
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    {popMetrics.peopleGrowth.toFixed(1)}%
                  </>
                )}
              </span>
              <span className="text-[10px] font-medium text-slate-400 font-sans">
                vs. {popMetrics.prevPeople.toLocaleString()} in {popMetrics.prevPeriodName}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Visit Target Goal Progress */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              Monthly Visit Goal
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-extrabold text-slate-800 font-display">
                {monthlyGoalMetrics.count} <span className="text-xs text-slate-400 font-medium font-sans">/ {monthlyGoalMetrics.targetGoal} visits</span>
              </span>
              <span className="text-xs font-bold text-indigo-600 font-sans">
                {monthlyGoalMetrics.percentage}%
              </span>
            </div>
            
            {/* Custom progress bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
              <div 
                style={{ width: `${monthlyGoalMetrics.percentage}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  monthlyGoalMetrics.percentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
              />
            </div>
            
            <p className="text-[9px] font-bold text-slate-400 mt-2.5 font-sans flex justify-between">
              {monthlyGoalMetrics.remaining > 0 ? (
                <span className="flex items-center gap-1"><Target className="w-3 h-3 text-indigo-500" /> {monthlyGoalMetrics.remaining} more needed to reach goal</span>
              ) : (
                <span className="text-emerald-600 font-extrabold flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Target Achieved!</span>
              )}
            </p>
          </div>
        </div>

        {/* Card 4: Overall Lifetime Metrics */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              Lifetime Program Reach
            </span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800 font-display">
                {popMetrics.totalPeople.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-sans">
                lifetime contacts
              </span>
            </div>
            
            <p className="text-[10px] font-medium text-slate-400 mt-2 font-sans">
              Aggregated across <strong className="text-slate-600 font-extrabold">{popMetrics.totalVisits}</strong> total operations logged to date.
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Monthly Visit Growth */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Outreach &amp; Monthly Visit Growth
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                Outreach Metrics
              </span>
            </div>
            
            <p className="text-xs text-slate-400 font-medium mb-6">
              Monthly overview of registered field campaigns and customer reach. Includes a <strong>Simple Linear Regression (SLR)</strong> trend projection forecasting next month's output at <strong className="text-rose-500 font-bold">{visitChartData.forecastValue} campaigns</strong>.
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitChartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPeople" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomVisitTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }}
                  iconType="circle"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="visits" 
                  name="Deployments Logged" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorVisits)" 
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="projection"
                  name="Trend Projection (SLR)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3.5, stroke: '#f43f5e', strokeWidth: 1.5, fill: '#fff' }}
                  activeDot={{ r: 5 }}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="people" 
                  name="Audience Reach" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorPeople)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Competitors */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Top Competitors Intelligence Map
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                Market Shares
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium mb-6">
              Rival brands mapped by monitoring frequency weighted against their impact level (High, Medium, Low).
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitorChartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(val) => val.length > 12 ? `${val.substring(0, 10)}..` : val}
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomCompetitorTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="reports" 
                  name="Monitoring Actions" 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]}
                >
                  {competitorChartData.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Bar 
                  dataKey="score" 
                  name="Cumulative Threat Score" 
                  fill="#f59e0b" 
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Insights Section */}
      <div className="bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-800 text-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
          AI &amp; Operational Analytics Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded-md bg-slate-700/50 text-indigo-300">
                  {insight.type === 'success' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : insight.type === 'warning' ? (
                    <Flame className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-indigo-400" />
                  )}
                </span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  {insight.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {insight.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
