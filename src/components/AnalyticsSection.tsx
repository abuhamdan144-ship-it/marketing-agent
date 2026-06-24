import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
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
import { TrendingUp, Users, MapPin, ShieldAlert, Sparkles, Calendar, BarChart3, Info } from 'lucide-react';

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

export default function AnalyticsSection({ appData }: AnalyticsSectionProps) {
  // 1. Prepare Visit Growth Data
  const visitChartData = useMemo(() => {
    if (!appData.visits || appData.visits.length === 0) {
      return { data: DEFAULT_VISIT_DATA, isDemo: true };
    }

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
    
    // If we only have 1 or 2 months of real data, pad it slightly for trend aesthetic, or just render
    const formattedList = sortedKeys.map((key) => ({
      month: formatMonthYear(key),
      visits: monthlyGroups[key].visits,
      people: monthlyGroups[key].people,
    }));

    return { data: formattedList, isDemo: false };
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
            Statistical breakdown of Al Jadeed outreach performance and competitive market landscape
          </p>
        </div>
        
        {isDemoMode && (
          <span className="self-start sm:self-center inline-flex items-center gap-1.5 text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 font-bold">
            <Info className="w-3.5 h-3.5" />
            Showing Interactive Sample Data
          </span>
        )}
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
              Monthly overview of registered field campaigns and the total prospective customer reach achieved.
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
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
                <span className="text-base">
                  {insight.type === 'success' ? '📈' : insight.type === 'warning' ? '🔥' : '💡'}
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
