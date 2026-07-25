import React, { useState, useMemo } from 'react';
import { Company, Camp, Customer, Visit, Feedback, Complaint, CompetitorIntel, SocialAd, MarketingPlan } from '../types';
import { SOCIAL_PLATFORMS } from '../utils/exportUtils';
import {
  Calendar,
  Search,
  Plus,
  Trash2,
  FolderPlus,
  Building2,
  Tent,
  User,
  Phone,
  MapPin,
  Users,
  FileText,
  Smartphone,
  AlertTriangle,
  ExternalLink,
  DollarSign,
  Filter,
  Navigation,
  Tag,
  Pencil,
} from 'lucide-react';

interface ListsAndTablesProps {
  type: 'companies' | 'camps' | 'customers' | 'visits' | 'feedback' | 'complaints' | 'competitors' | 'social' | 'plans';
  data: any[];
  onDelete: (id: number) => void;
  onOpenModal: (type: string) => void;
  onEdit?: (type: string, item: any) => void;
}

const CATEGORY_OPTIONS = ['All', 'Construction', 'Oil & Gas', 'Facilities Management', 'Cleaning Services', 'Manpower Supply', 'Other'];
const REGION_OPTIONS = ['All', 'Barka', 'Muscat', 'Sohar', 'Buraimi', 'Nizwa', 'Other'];

export default function ListsAndTables({ type, data, onDelete, onOpenModal, onEdit }: ListsAndTablesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Camp Specific Filter & Sort state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [campSortOrder, setCampSortOrder] = useState<'default' | 'payday'>('default');

  const getOrdinal = (day: number): string => {
    if (day >= 11 && day <= 13) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  const getDaysUntilPayday = (salaryDate?: number): number => {
    if (!salaryDate || salaryDate < 1 || salaryDate > 31) return 999;
    const now = new Date();
    const today = now.getDate();
    if (salaryDate >= today) {
      return salaryDate - today;
    } else {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return (daysInMonth - today) + salaryDate;
    }
  };

  // Filter and Sort Data using useMemo for performance
  const processedData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    // First, filter data by search term & specific category/region filters
    const filtered = data.filter((item) => {
      if (type === 'companies') {
        const c = item as Company;
        return (
          c.name.toLowerCase().includes(term) ||
          (c.contact || '').toLowerCase().includes(term) ||
          (c.boss_name || '').toLowerCase().includes(term)
        );
      }
      if (type === 'camps') {
        const c = item as Camp;
        const matchesSearch =
          c.name.toLowerCase().includes(term) ||
          c.location.toLowerCase().includes(term) ||
          c.boss_name.toLowerCase().includes(term) ||
          (c.landmark || '').toLowerCase().includes(term) ||
          (c.region || '').toLowerCase().includes(term) ||
          (c.company || '').toLowerCase().includes(term) ||
          (c.category || '').toLowerCase().includes(term);

        const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
        const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;

        return matchesSearch && matchesCategory && matchesRegion;
      }
      if (type === 'customers') {
        const c = item as Customer;
        return (
          c.name.toLowerCase().includes(term) ||
          (c.phone || '').toLowerCase().includes(term) ||
          (c.location || '').toLowerCase().includes(term)
        );
      }
      if (type === 'visits') {
        const v = item as Visit;
        return v.place.toLowerCase().includes(term) || v.type.toLowerCase().includes(term) || (v.notes || '').toLowerCase().includes(term);
      }
      if (type === 'feedback') {
        const f = item as Feedback;
        return (f.customer || '').toLowerCase().includes(term) || f.feedback.toLowerCase().includes(term);
      }
      if (type === 'complaints') {
        const c = item as Complaint;
        return c.customer.toLowerCase().includes(term) || c.category.toLowerCase().includes(term) || c.description.toLowerCase().includes(term);
      }
      if (type === 'competitors') {
        const c = item as CompetitorIntel;
        return c.name.toLowerCase().includes(term) || c.strategy.toLowerCase().includes(term);
      }
      if (type === 'social') {
        const s = item as SocialAd;
        return s.title.toLowerCase().includes(term) || s.platform.toLowerCase().includes(term);
      }
      if (type === 'plans') {
        const p = item as MarketingPlan;
        return p.title.toLowerCase().includes(term) || p.details.toLowerCase().includes(term);
      }
      return true;
    });

    // Helper to safely parse localized or standard date strings to timestamp
    const parseDateString = (dateStr?: string): number => {
      if (!dateStr) return 0;
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) return parsed;

      // Split typical locale formats: DD/MM/YYYY or MM/DD/YYYY
      const parts = dateStr.split(/[\/\-\.]/);
      if (parts.length === 3) {
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);

        if (parts[0].length === 4) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        }

        if (month > 12) {
          const temp = month;
          month = day;
          day = temp;
        }

        if (year > 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return new Date(year, month - 1, day).getTime();
        }
      }
      return 0;
    };

    // Sort filtered data
    return [...filtered].sort((a, b) => {
      // Special sort for Camps by Upcoming Payday
      if (type === 'camps' && campSortOrder === 'payday') {
        const daysA = getDaysUntilPayday((a as Camp).salaryDate);
        const daysB = getDaysUntilPayday((b as Camp).salaryDate);
        if (daysA !== daysB) {
          return daysA - daysB;
        }
      }

      const timeA = parseDateString(a.date);
      const timeB = parseDateString(b.date);

      if (timeA !== timeB) {
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      }
      // Fallback to id (Date.now() creation timestamp)
      return sortOrder === 'newest' ? b.id - a.id : a.id - b.id;
    });
  }, [data, type, searchTerm, sortOrder, selectedCategory, selectedRegion, campSortOrder]);

  const handleEmptyState = (title: string, btnLabel: string, modalType: string) => (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
      <FolderPlus className="w-10 h-10 text-slate-300 mb-3" strokeWidth={1.5} />
      <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
        Keep operations tracked by registering entries to compile your marketing intelligence.
      </p>
      <button
        onClick={() => onOpenModal(modalType)}
        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
        <span>{btnLabel}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar, Filter Chips & Sort Controls */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                <Search className="w-3.5 h-3.5" strokeWidth={2} />
              </span>
              <input
                type="text"
                placeholder={type === 'camps' ? "Search camp name, landmark, region..." : "Filter list records..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white placeholder-slate-400"
              />
            </div>

            {/* Sort Toggle Buttons */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 w-full sm:w-auto shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setSortOrder('newest');
                  if (type === 'camps') setCampSortOrder('default');
                }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  sortOrder === 'newest' && (type !== 'camps' || campSortOrder === 'default')
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/10'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Calendar className="w-3 h-3 text-indigo-500" />
                Newest First
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOrder('oldest');
                  if (type === 'camps') setCampSortOrder('default');
                }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  sortOrder === 'oldest' && (type !== 'camps' || campSortOrder === 'default')
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/10'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Calendar className="w-3 h-3 text-indigo-500 rotate-180 transform" />
                Oldest First
              </button>
              {type === 'camps' && (
                <button
                  type="button"
                  onClick={() => setCampSortOrder(campSortOrder === 'payday' ? 'default' : 'payday')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    campSortOrder === 'payday'
                      ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                  title="Sort camps with salary dates closest to today"
                >
                  <DollarSign className="w-3 h-3" strokeWidth={2.5} />
                  Upcoming Payday
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              const mapping: { [key: string]: string } = {
                companies: 'company',
                camps: 'camp',
                customers: 'customer',
                visits: 'visit',
                feedback: 'feedback',
                complaints: 'complaint',
                competitors: 'competitor',
                social: 'social',
                plans: 'plan',
              };
              onOpenModal(mapping[type]);
            }}
            className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Register New Entry</span>
          </button>
        </div>

        {/* Filter Chips for Camps view (Category and Region) */}
        {type === 'camps' && (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400" />
                Category:
              </span>
              {CATEGORY_OPTIONS.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Region Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Region:
              </span>
              {REGION_OPTIONS.map((reg) => {
                const isActive = selectedRegion === reg;
                return (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    {reg}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Render based on Type */}
      {processedData.length === 0 ? (
        data.length === 0 ? (
          type === 'companies'
            ? handleEmptyState('No registered companies yet', 'Add Corporate Partner', 'company')
            : type === 'camps'
            ? handleEmptyState('No labor camps listed', 'List Labor Camp', 'camp')
            : type === 'customers'
            ? handleEmptyState('No customer records', 'Enroll Customer', 'customer')
            : type === 'visits'
            ? handleEmptyState('No field visits logged', 'Log Field Visit', 'visit')
            : type === 'feedback'
            ? handleEmptyState('No customer reviews recorded', 'Add Client Feedback', 'feedback')
            : type === 'complaints'
            ? handleEmptyState('No registered complaints', 'Log Customer Issue', 'complaint')
            : type === 'competitors'
            ? handleEmptyState('No competitor intelligence recorded', 'Record Market Intel', 'competitor')
            : type === 'social'
            ? handleEmptyState('No social ad campaigns listed', 'Launch Ad Campaign', 'social')
            : handleEmptyState('No strategic plans configured', 'Create Action Plan', 'plan')
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-400 font-medium">
            No matching results found for "{searchTerm}"
          </div>
        )
      ) : (
        <div className="space-y-3">
          {/* 1. Companies view */}
          {type === 'companies' &&
            processedData.map((item, idx) => {
              const c = item as Company;
              return (
                <div
                  key={c.id}
                  className="bg-slate-50 hover:bg-indigo-50/10 rounded-xl p-4 border border-slate-100 hover:border-indigo-100 transition-all duration-200 relative group"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {onEdit && (
                      <button
                        onClick={() => onEdit('company', c)}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                        title="Edit Company Details"
                      >
                        <Pencil className="w-3 h-3 text-indigo-600" strokeWidth={2} />
                        <span>Edit</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pr-24">
                    <span className="text-xs font-bold text-indigo-600 font-mono">
                      #{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">{c.name}</h4>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-indigo-700" strokeWidth={1.8} />
                      <span>Corporate Account</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-500 font-medium">
                    {c.contact && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                        <span>Contact: <strong className="text-slate-700">{c.contact}</strong></span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                        <span>Phone: <strong className="text-slate-700 font-mono">{c.phone}</strong></span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                        <span>Address: <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                          title="Open address in Google Maps"
                        >
                          <span>{c.address}</span>
                          <ExternalLink className="w-3 h-3 text-indigo-500" strokeWidth={2} />
                        </a></span>
                      </div>
                    )}
                  </div>
                  {c.boss_name && (
                    <div className="mt-3 p-2.5 bg-white rounded-lg border border-slate-200/60 text-xs">
                      <p className="font-semibold text-slate-700 flex items-center gap-1">
                        <Tent className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.8} />
                        <span>Associated Labor Camp Manager:</span>
                      </p>
                      <p className="text-slate-500 mt-1 font-medium">
                        {c.boss_name} {c.boss_phone ? `· ${c.boss_phone}` : ''}
                      </p>
                    </div>
                  )}
                  {c.notes && (
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed font-medium bg-slate-100 p-2.5 rounded-lg border border-slate-200/40 flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                      <span className="italic">{c.notes}</span>
                    </p>
                  )}
                  <div className="mt-3 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                    Registered On {c.date}
                  </div>
                </div>
              );
            })}

          {/* 2. Camps view */}
          {type === 'camps' &&
            processedData.map((item, idx) => {
              const c = item as Camp;
              const daysLeft = c.salaryDate ? getDaysUntilPayday(c.salaryDate) : null;
              return (
                <div
                  key={c.id}
                  className="bg-slate-50 hover:bg-amber-50/20 rounded-2xl p-4 border border-slate-200/80 hover:border-amber-300 transition-all duration-200 relative group space-y-3"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {onEdit && (
                      <button
                        onClick={() => onEdit('camp', c)}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                        title="Edit Camp Details"
                      >
                        <Pencil className="w-3 h-3 text-indigo-600" strokeWidth={2} />
                        <span>Edit</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </button>
                  </div>

                  {/* Header Row */}
                  <div className="flex flex-wrap items-center gap-2 pr-24">
                    <span className="text-xs font-bold text-amber-600 font-mono">
                      #{idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{c.name}</h4>

                    {/* Region Badge */}
                    {c.region && (
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-indigo-100">
                        <MapPin className="w-3 h-3 text-indigo-600" strokeWidth={1.8} />
                        <span>{c.region}</span>
                      </span>
                    )}

                    {/* Category Tag */}
                    {c.category && (
                      <span className="bg-amber-100/80 text-amber-900 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-amber-200">
                        <Tag className="w-3 h-3 text-amber-700" strokeWidth={1.8} />
                        <span>{c.category}</span>
                      </span>
                    )}

                    {/* Payday Badge */}
                    {c.salaryDate && (
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                        <Calendar className="w-3 h-3 text-emerald-600" strokeWidth={1.8} />
                        <span>Payday: {getOrdinal(c.salaryDate)}</span>
                        {daysLeft !== null && daysLeft <= 5 && (
                          <span className="ml-0.5 bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                            {daysLeft === 0 ? 'TODAY' : `${daysLeft}d left`}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Location & Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-medium bg-white p-3 rounded-xl border border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                      <span>Address: {c.mapsLink ? (
                        <a
                          href={c.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                          title="Open in Google Maps"
                        >
                          <span>{c.location}</span>
                          <ExternalLink className="w-3 h-3 text-indigo-500" strokeWidth={2} />
                        </a>
                      ) : c.location ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.location + (c.landmark ? ', ' + c.landmark : ''))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                          title="Search address in Google Maps"
                        >
                          <span>{c.location}</span>
                          <ExternalLink className="w-3 h-3 text-indigo-500" strokeWidth={2} />
                        </a>
                      ) : (
                        <strong className="text-slate-800">-</strong>
                      )}</span>
                    </div>

                    {c.landmark && (
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                        <span>Landmark: <strong className="text-slate-800">{c.landmark}</strong></span>
                      </div>
                    )}

                    {c.company && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                        <span>Company: <strong className="text-slate-800">{c.company}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                      <span>Total Workers: <strong className="text-slate-800">{c.workers || 'N/A'}</strong></span>
                    </div>
                  </div>

                  {/* Google Maps Link if provided or available */}
                  {(c.mapsLink || c.location) && (
                    <div className="pt-0.5">
                      <a
                        href={c.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.location + (c.landmark ? ', ' + c.landmark : ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-600" strokeWidth={1.8} />
                        <span>Open in Google Maps</span>
                      </a>
                    </div>
                  )}

                  {/* Boss Info */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-xs">
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                      <span>Camp Boss:</span>
                    </p>
                    <p className="text-slate-500 mt-1 font-medium">
                      {c.boss_name} · <strong className="font-mono text-slate-700">{c.boss_phone}</strong>
                    </p>
                  </div>

                  {/* Notes */}
                  {c.notes && (
                    <p className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-100 p-2.5 rounded-xl border border-slate-200/40 flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                      <span className="italic">{c.notes}</span>
                    </p>
                  )}

                  <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                    Registered On {c.date}
                  </div>
                </div>
              );
            })}

          {/* 3. Customers view */}
          {type === 'customers' && (
            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-inner bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Segment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {processedData.map((item, idx) => {
                    const c = item as Customer;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-indigo-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{c.name}</td>
                        <td className="py-2.5 px-4 font-mono">{c.phone || '-'}</td>
                        <td className="py-2.5 px-4">
                          {c.location ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                              title="Open location in Google Maps"
                            >
                              <span>{c.location}</span>
                              <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0" strokeWidth={1.8} />
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold text-[10px]">
                            {c.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('customer', c)}
                                className="text-indigo-600 hover:text-indigo-800 font-bold p-1 cursor-pointer"
                                title="Edit Customer"
                              >
                                <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(c.id)}
                              className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Visits view */}
          {type === 'visits' && (
            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-inner bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Location Visited</th>
                    <th className="py-3 px-4">Activity Category</th>
                    <th className="py-3 px-4">Est. Audience</th>
                    <th className="py-3 px-4">Key Findings</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {processedData.map((item, idx) => {
                    const v = item as Visit;
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-rose-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">
                          {v.place ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.place)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                              title="Search place in Google Maps"
                            >
                              <span>{v.place}</span>
                              <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0" strokeWidth={1.8} />
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-bold uppercase text-[9px]">
                            {v.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono">{v.people}</td>
                        <td className="py-2.5 px-4 max-w-xs truncate" title={v.notes}>
                          {v.notes || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('visit', v)}
                                className="text-indigo-600 hover:text-indigo-800 font-bold p-1 cursor-pointer"
                                title="Edit Visit"
                              >
                                <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(v.id)}
                              className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                              title="Delete Visit"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Feedback view */}
          {type === 'feedback' && (
            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-inner bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Vibe Level</th>
                    <th className="py-3 px-4">Rating Index</th>
                    <th className="py-3 px-4">Detailed Comments</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {processedData.map((item, idx) => {
                    const f = item as Feedback;
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">
                          {f.customer || 'Anonymous'}
                        </td>
                        <td className="py-2.5 px-4 font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              f.type === 'Positive'
                                ? 'bg-emerald-50 text-emerald-700'
                                : f.type === 'Negative'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {f.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-amber-500 font-mono tracking-widest font-bold">
                          {f.rating} / 5
                        </td>
                        <td className="py-2.5 px-4 max-w-xs truncate" title={f.feedback}>
                          {f.feedback}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('feedback', f)}
                                className="text-indigo-600 hover:text-indigo-800 font-bold p-1 cursor-pointer"
                                title="Edit Feedback"
                              >
                                <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(f.id)}
                              className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                              title="Delete Feedback"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. Complaints view */}
          {type === 'complaints' && (
            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-inner bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {processedData.map((item, idx) => {
                    const c = item as Complaint;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-rose-600">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{c.customer}</td>
                        <td className="py-3 px-4 font-semibold text-slate-500">
                          {c.category}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.status === 'Open'
                                ? 'bg-rose-50 text-[var(--coral,#D64545)] border border-rose-200 animate-pulse'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate" title={c.description}>
                          {c.description}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('complaint', c)}
                                className="text-indigo-600 hover:text-indigo-800 font-bold p-1 cursor-pointer"
                                title="Edit Complaint"
                              >
                                <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(c.id)}
                              className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                              title="Delete Complaint"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[var(--coral,#D64545)]" strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 7. Competitor Strategies view */}
          {type === 'competitors' && (
            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-inner bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Competitor</th>
                    <th className="py-3 px-4">Promotion Strategy</th>
                    <th className="py-3 px-4">Impact Threat</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {processedData.map((item, idx) => {
                    const c = item as CompetitorIntel;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                        <td className="py-3 px-4 text-slate-700">{c.strategy}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              c.impact === 'High'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : c.impact === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {c.impact} Threat
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate" title={c.notes}>
                          {c.notes || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('competitor', c)}
                                className="text-indigo-600 hover:text-indigo-800 font-bold p-1 cursor-pointer"
                                title="Edit Competitor Intel"
                              >
                                <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(c.id)}
                              className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                              title="Delete Competitor Intel"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 8. Social Ads view */}
          {type === 'social' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {processedData.map((item) => {
                const s = item as SocialAd;
                const platformInfo = SOCIAL_PLATFORMS[s.platform as keyof typeof SOCIAL_PLATFORMS];
                return (
                  <div
                    key={s.id}
                    className="p-4 bg-slate-50 border border-slate-100 hover:border-slate-300 rounded-xl transition-all relative"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      {onEdit && (
                        <button
                          onClick={() => onEdit('social', s)}
                          className="px-2 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                          title="Edit Campaign"
                        >
                          <Pencil className="w-3 h-3 text-indigo-600" strokeWidth={2} />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(s.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2 pr-20">
                      <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" strokeWidth={1.8} />
                      <h4 className="text-sm font-bold text-slate-800">{s.title}</h4>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500 font-medium">
                      <div>
                        Platform:{' '}
                        <span className="font-bold text-slate-700">
                          {platformInfo?.name || s.platform}
                        </span>
                      </div>
                      {s.budget && (
                        <div>
                          Ad Budget: <strong className="text-slate-800">{s.budget}</strong>
                        </div>
                      )}
                      <div>
                        Campaign Status:{' '}
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded font-bold">
                          {s.status}
                        </span>
                      </div>
                    </div>
                    {s.notes && (
                      <p className="mt-2.5 text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                        "{s.notes}"
                      </p>
                    )}
                    <div className="mt-3 text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
                      Launched on {s.date}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 9. Marketing Plans view */}
          {type === 'plans' &&
            processedData.map((item, idx) => {
              const p = item as MarketingPlan;
              return (
                <div
                  key={p.id}
                  className="bg-slate-50 hover:bg-emerald-50/10 rounded-xl p-4 border border-slate-100 hover:border-emerald-200 transition-all duration-200 relative group"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {onEdit && (
                      <button
                        onClick={() => onEdit('plan', p)}
                        className="px-2 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                        title="Edit Plan"
                      >
                        <Pencil className="w-3 h-3 text-emerald-600" strokeWidth={2} />
                        <span>Edit</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(p.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pr-20">
                    <span className="text-xs font-bold text-emerald-600 font-mono">
                      #{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">{p.title}</h4>
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      {p.status}
                    </span>
                  </div>
                  {p.budget && (
                    <div className="mt-2 text-xs font-medium text-slate-500">
                      Proposed Budget:{' '}
                      <strong className="text-slate-800">{p.budget}</strong>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed font-medium bg-white p-3 rounded-lg border border-slate-200/50 whitespace-pre-wrap">
                    {p.details}
                  </p>
                  <div className="mt-3 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                    Formulated On {p.date}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

