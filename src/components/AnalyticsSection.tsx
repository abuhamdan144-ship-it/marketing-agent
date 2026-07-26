import React, { useMemo } from 'react';
import { motion } from 'motion/react';
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
  Cell 
} from 'recharts';
import { AppData } from '../types';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Users, 
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

const DEFAULT_VISIT_DATA = [
  { month: "Jan '26", visits: 12, people: 240 },
  { month: "Feb '26", visits: 18, people: 390 },
  { month: "Mar '26", visits: 25, people: 580 },
  { month: "Apr '26", visits: 31, people: 710 },
  { month: "May '26", visits: 42, people: 980 },
  { month: "Jun '26", visits: 55, people: 1240 },
];

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
      <div className="bg-[#0B1526] border border-white/10 text-white p-3 rounded shadow-ops-panel space-y-1.5 min-w-[210px] font-mono text-xs">
        <div className="border-b border-white/10 pb-1 flex justify-between items-center">
          <span className="ops-eyebrow text-[#8891A3]">
            OPERATIONAL PERIOD
          </span>
          <span className="text-xs font-bold text-[#C9A227]">
            {label}
          </span>
        </div>
        <div className="space-y-1 pt-0.5">
          {visitsPld && visitsPld.value !== undefined && visitsPld.value !== null && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#8891A3]">DEPLOYMENTS:</span>
              <span className="font-bold text-white">
                {visitsPld.value} visits
              </span>
            </div>
          )}
          {peoplePld && peoplePld.value !== undefined && peoplePld.value !== null && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#8891A3]">REACH:</span>
              <span className="font-bold text-[#4ADE94]">
                {Number(peoplePld.value).toLocaleString()} reached
              </span>
            </div>
          )}
          {projectionPld && projectionPld.value !== undefined && (
            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-1 mt-1">
              <span className="text-[#8891A3]">SLR PROJECTION:</span>
              <span className="font-bold text-[#F27373]">
                {Math.round(Number(projectionPld.value))} visits
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CustomCompetitorTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0B1526] border border-white/10 text-white p-3 rounded shadow-ops-panel space-y-1.5 min-w-[210px] font-mono text-xs">
        <div className="border-b border-white/10 pb-1">
          <p className="font-bold text-white truncate">{data.name}</p>
          <span className="ops-eyebrow text-[#C9A227] mt-0.5 inline-block">
            {data.level}
          </span>
        </div>
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[#8891A3]">LOGS:</span>
            <span className="font-bold text-white">{data.reports}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8891A3]">THREAT SCORE:</span>
            <span className="font-bold text-[#C9A227]">{data.score}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsSection({ appData }: AnalyticsSectionProps) {
  const visitChartData = useMemo(() => {
    let sourceData: Array<{ month: string; visits: number; people: number; rawKey?: string }> = [];
    let isDemo = false;

    if (!appData.visits || appData.visits.length === 0) {
      sourceData = DEFAULT_VISIT_DATA.map(d => ({ ...d }));
      isDemo = true;
    } else {
      const monthlyGroups: Record<string, { visits: number; people: number }> = {};
      
      appData.visits.forEach((v) => {
        if (!v.date) return;
        const monthKey = v.date.substring(0, 7);
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = { visits: 0, people: 0 };
        }
        monthlyGroups[monthKey].visits += 1;
        monthlyGroups[monthKey].people += Number(v.people) || 0;
      });

      const sortedKeys = Object.keys(monthlyGroups).sort();
      
      sourceData = sortedKeys.map((key) => ({
        month: formatMonthYear(key),
        visits: monthlyGroups[key].visits,
        people: monthlyGroups[key].people,
        rawKey: key,
      }));
    }

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

    const dataWithProjection = sourceData.map((d, index) => ({
      ...d,
      projection: Number((slope * index + intercept).toFixed(1))
    }));

    let nextMonthLabel = 'Forecast';
    if (isDemo) {
      nextMonthLabel = "Jul '26 (Fcst)";
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
        nextMonthLabel = `${formatMonthYear(nextKey)} (Fcst)`;
      }
    }

    const forecastedVisits = Math.max(0, slope * n + intercept);

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

  const competitorChartData = useMemo(() => {
    if (!appData.competitors || appData.competitors.length === 0) {
      return { data: DEFAULT_COMPETITOR_DATA, isDemo: true };
    }

    const groups: Record<string, { name: string; reports: number; score: number }> = {};
    
    appData.competitors.forEach((c) => {
      const name = c.name?.trim() || 'Other Competitor';
      if (!groups[name]) {
        groups[name] = { name, reports: 0, score: 0 };
      }
      
      groups[name].reports += 1;
      
      let weight = 2;
      if (c.impact?.toLowerCase() === 'high') weight = 3;
      if (c.impact?.toLowerCase() === 'low') weight = 1;
      groups[name].score += weight;
    });

    const list = Object.values(groups)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
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

  const insights = useMemo(() => {
    const isDemo = visitChartData.isDemo || competitorChartData.isDemo;
    if (isDemo) {
      return [
        {
          title: "STEADY EXPANSION TRACK",
          desc: "Average audience engagement during labor camp drives shows +25% MoM escalation.",
          type: "success"
        },
        {
          title: "RIVAL BRAND AGGRESSION",
          desc: "High competitor monitoring levels logged for Joyalukkas and Western Union.",
          type: "warning"
        },
        {
          title: "FIELD RECOMMENDATION",
          desc: "Targeting high-capacity camp visits during weekend paydays yields maximum lead conversion.",
          type: "info"
        }
      ];
    }

    const list = [];
    const visits = appData.visits;
    const competitors = appData.competitors;

    const totalReach = visits.reduce((acc, curr) => acc + (Number(curr.people) || 0), 0);
    const averageReach = visits.length ? Math.round(totalReach / visits.length) : 0;

    if (visits.length > 0) {
      list.push({
        title: "FIELD OUTREACH PERFORMANCE",
        desc: `${visits.length} logged deployments engaged ~${totalReach} prospective customers face-to-face (${averageReach}/campaign).`,
        type: "success"
      });
    }

    if (competitors.length > 0) {
      const topComp = competitorChartData.data[0];
      list.push({
        title: "PRIMARY RIVAL FOCUS",
        desc: `Intelligence indicates "${topComp.name}" is most tracked, presenting a ${topComp.level} threat.`,
        type: "warning"
      });
    }

    if (list.length < 3) {
      list.push({
        title: "OPERATIONS SUGGESTION",
        desc: "Regularly register field visits, labor camp deployments, and competitor price updates to keep BI synced.",
        type: "info"
      });
    }

    return list;
  }, [appData.visits, appData.competitors, visitChartData.isDemo, competitorChartData.isDemo]);

  const COLORS = ['#C9A227', '#2E4B8F', '#2F9E77', '#D64545', '#1C2A4A', '#8891A3'];

  const isDemoMode = visitChartData.isDemo || competitorChartData.isDemo;

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

  const popMetrics = useMemo(() => {
    const data = visitChartData.data;
    if (data.length < 1) {
      return {
        hasTwoPeriods: false,
        currentPeriodName: 'Current',
        prevPeriodName: 'Previous',
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

    const totalVisits = data.reduce((sum, item) => sum + (item.visits || 0), 0);
    const totalPeople = data.reduce((sum, item) => sum + (item.people || 0), 0);

    if (data.length < 2) {
      const current = data[0];
      return {
        hasTwoPeriods: false,
        currentPeriodName: current.month,
        prevPeriodName: 'Previous',
        currentVisits: current.visits || 0,
        prevVisits: 0,
        visitsGrowth: 100,
        currentPeople: current.people || 0,
        prevPeople: 0,
        peopleGrowth: 100,
        totalVisits,
        totalPeople,
      };
    }

    const current = data[data.length - 2]; // last valid non-forecast item
    const previous = data.length >= 3 ? data[data.length - 3] : data[0];

    const cVis = current.visits || 0;
    const pVis = previous.visits || 0;
    const visitsDiff = cVis - pVis;
    const visitsGrowth = pVis > 0 ? (visitsDiff / pVis) * 100 : cVis > 0 ? 100 : 0;

    const cPeo = current.people || 0;
    const pPeo = previous.people || 0;
    const peopleDiff = cPeo - pPeo;
    const peopleGrowth = pPeo > 0 ? (peopleDiff / pPeo) * 100 : cPeo > 0 ? 100 : 0;

    return {
      hasTwoPeriods: true,
      currentPeriodName: current.month,
      prevPeriodName: previous.month,
      currentVisits: cVis,
      prevVisits: pVis,
      visitsGrowth,
      currentPeople: cPeo,
      prevPeople: pPeo,
      peopleGrowth,
      totalVisits,
      totalPeople,
    };
  }, [visitChartData]);

  return (
    <div className="space-y-4 select-none">
      {/* Title & Badge Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F1B33] text-white p-4 rounded-lg border border-white/10 shadow-ops-panel"
      >
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#C9A227]" />
            <h2 className="ops-eyebrow text-[#C9A227]">OPERATIONS INTELLIGENCE &amp; ANALYTICS</h2>
          </div>
          <p className="text-xs text-[#8891A3] mt-0.5 font-mono">
            Statistical breakdown of outreach performance &amp; market intelligence
          </p>
        </div>
        
        {isDemoMode && (
          <span className="self-start sm:self-center font-mono text-[10px] bg-[#1C2A4A] text-[#C9A227] px-2.5 py-1 rounded border border-white/10 font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            INTERACTIVE BENCHMARK DATA
          </span>
        )}
      </motion.div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Deployment Frequency */}
        <div className="ops-card p-4 flex flex-col justify-between border-l-4 border-l-[#2E4B8F]">
          <div className="flex items-center justify-between">
            <span className="ops-eyebrow text-[#8891A3]">DEPLOYMENTS (PoP)</span>
            <Calendar className="w-4 h-4 text-[#2E4B8F]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-[#0F1B33]">
                {popMetrics.currentVisits}
              </span>
              <span className="text-[10px] font-mono text-[#8891A3]">
                {popMetrics.currentPeriodName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                popMetrics.visitsGrowth >= 0 
                  ? 'bg-[#2F9E77]/10 text-[#2F9E77]' 
                  : 'bg-[#D64545]/10 text-[#D64545]'
              }`}>
                {popMetrics.visitsGrowth >= 0 ? `+${popMetrics.visitsGrowth.toFixed(0)}%` : `${popMetrics.visitsGrowth.toFixed(0)}%`}
              </span>
              <span className="text-[10px] text-[#8891A3] font-mono">
                vs {popMetrics.prevVisits} ({popMetrics.prevPeriodName})
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Audience Reach */}
        <div className="ops-card p-4 flex flex-col justify-between border-l-4 border-l-[#2F9E77]">
          <div className="flex items-center justify-between">
            <span className="ops-eyebrow text-[#8891A3]">REACH (PoP)</span>
            <Users className="w-4 h-4 text-[#2F9E77]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-[#0F1B33]">
                {popMetrics.currentPeople.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-[#8891A3]">
                contacts
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                popMetrics.peopleGrowth >= 0 
                  ? 'bg-[#2F9E77]/10 text-[#2F9E77]' 
                  : 'bg-[#D64545]/10 text-[#D64545]'
              }`}>
                {popMetrics.peopleGrowth >= 0 ? `+${popMetrics.peopleGrowth.toFixed(0)}%` : `${popMetrics.peopleGrowth.toFixed(0)}%`}
              </span>
              <span className="text-[10px] text-[#8891A3] font-mono">
                vs {popMetrics.prevPeople.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Goal */}
        <div className="ops-card p-4 flex flex-col justify-between border-l-4 border-l-[#C9A227]">
          <div className="flex items-center justify-between">
            <span className="ops-eyebrow text-[#8891A3]">MONTHLY TARGET</span>
            <Target className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-mono font-extrabold text-[#0F1B33]">
                {monthlyGoalMetrics.count} <span className="text-xs text-[#8891A3]">/ {monthlyGoalMetrics.targetGoal}</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#C9A227]">
                {monthlyGoalMetrics.percentage}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#EEF0F3] rounded overflow-hidden mt-2 border border-[#E2E5E1]">
              <div 
                style={{ width: `${monthlyGoalMetrics.percentage}%` }}
                className={`h-full transition-all duration-500 ${
                  monthlyGoalMetrics.percentage >= 100 ? 'bg-[#2F9E77]' : 'bg-[#C9A227]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Lifetime Reach */}
        <div className="ops-card p-4 flex flex-col justify-between border-l-4 border-l-[#0F1B33]">
          <div className="flex items-center justify-between">
            <span className="ops-eyebrow text-[#8891A3]">LIFETIME REACH</span>
            <ArrowUpRight className="w-4 h-4 text-[#0F1B33]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-extrabold text-[#0F1B33]">
              {popMetrics.totalPeople.toLocaleString()}
            </span>
            <p className="text-[10px] font-mono text-[#8891A3] mt-1">
              Across {popMetrics.totalVisits} logged operations
            </p>
          </div>
        </div>
      </div>

      {/* Dark Ops Console Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Chart 1: Monthly Visit Growth */}
        <div className="bg-[#0F1B33] text-white rounded-lg p-4 border border-white/10 shadow-ops-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C9A227]" />
                <span className="ops-eyebrow text-[#C9A227]">OUTREACH &amp; CAMPAIGN GROWTH</span>
              </div>
              <span className="bg-[#1C2A4A] text-[#8891A3] font-mono text-[9px] px-2 py-0.5 rounded border border-white/5 font-bold">
                FORECAST: {visitChartData.forecastValue} VISITS
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitChartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitsDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A227" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C9A227" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPeopleDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ADE94" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4ADE94" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#8891A3', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#8891A3', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#8891A3', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomVisitTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', paddingTop: '10px' }}
                  iconType="rect"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="visits" 
                  name="Deployments" 
                  stroke="#C9A227" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVisitsDark)" 
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="projection"
                  name="SLR Trend"
                  stroke="#F27373"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, stroke: '#F27373', fill: '#0F1B33' }}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="people" 
                  name="Reach" 
                  stroke="#4ADE94" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPeopleDark)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Competitor Intelligence */}
        <div className="bg-[#0F1B33] text-white rounded-lg p-4 border border-white/10 shadow-ops-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#F27373]" />
                <span className="ops-eyebrow text-[#F27373]">COMPETITOR MARKET INTEL MAP</span>
              </div>
              <span className="bg-[#1C2A4A] text-[#8891A3] font-mono text-[9px] px-2 py-0.5 rounded border border-white/5 font-bold">
                TOP RIVALS
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitorChartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#8891A3', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }} 
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(val) => val.length > 10 ? `${val.substring(0, 8)}..` : val}
                />
                <YAxis 
                  tick={{ fill: '#8891A3', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomCompetitorTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', paddingTop: '10px' }}
                  iconType="rect"
                />
                <Bar 
                  dataKey="reports" 
                  name="Logs" 
                  fill="#2E4B8F" 
                  radius={[2, 2, 0, 0]}
                >
                  {competitorChartData.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Bar 
                  dataKey="score" 
                  name="Threat Weight" 
                  fill="#C9A227" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Insights Section */}
      <div className="bg-[#0F1B33] text-white rounded-lg p-4 border border-white/10 shadow-ops-panel">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <Sparkles className="w-4 h-4 text-[#C9A227]" />
          <span className="ops-eyebrow text-[#C9A227]">TACTICAL FIELD INSIGHTS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded bg-[#1C2A4A]/80 border border-white/5 space-y-1"
            >
              <div className="flex items-center gap-1.5">
                {insight.type === 'success' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-[#4ADE94]" />
                ) : insight.type === 'warning' ? (
                  <Flame className="w-3.5 h-3.5 text-[#C9A227]" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5 text-[#2E4B8F]" />
                )}
                <span className="ops-eyebrow text-slate-200 text-[10px]">
                  {insight.title}
                </span>
              </div>
              <p className="text-xs text-[#8891A3] leading-relaxed">
                {insight.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

