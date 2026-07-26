import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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

  // Filter and Sort Data using useMemo
  const processedData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
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

    const parseDateString = (dateStr?: string): number => {
      if (!dateStr) return 0;
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) return parsed;

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

    return [...filtered].sort((a, b) => {
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
      return sortOrder === 'newest' ? b.id - a.id : a.id - b.id;
    });
  }, [data, type, searchTerm, sortOrder, selectedCategory, selectedRegion, campSortOrder]);

  const handleEmptyState = (title: string, btnLabel: string, modalType: string) => (
    <div className="flex flex-col items-center justify-center p-10 text-center border border-dashed border-[#E2E5E1] rounded-lg bg-white">
      <FolderPlus className="w-8 h-8 text-[#8891A3] mb-2" strokeWidth={1.5} />
      <span className="ops-eyebrow text-[#0F1B33] text-xs">{title}</span>
      <p className="text-xs text-[#8891A3] mt-1 max-w-[280px]">
        Keep operations tracked by registering entries to compile your marketing intelligence.
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => onOpenModal(modalType)}
        className="mt-4 px-3.5 py-2 bg-[#0F1B33] hover:bg-[#1C2A4A] text-[#C9A227] font-mono font-bold text-xs rounded border border-[#C9A227]/30 shadow-xs cursor-pointer flex items-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
        <span>{btnLabel.toUpperCase()}</span>
      </motion.button>
    </div>
  );

  return (
    <div className="space-y-4 select-none">
      {/* Search Bar, Filter Chips & Sort Controls */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8891A3]">
                <Search className="w-3.5 h-3.5" strokeWidth={2} />
              </span>
              <input
                type="text"
                placeholder={type === 'camps' ? "Search camp, landmark, region..." : "Search records..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#E2E5E1] focus:border-[#0F1B33] focus:outline-none bg-white font-sans text-[#0F1B33] placeholder-[#8891A3]"
              />
            </div>

            {/* Sort Toggle Buttons */}
            <div className="flex items-center gap-1 bg-[#EEF0F3] p-1 rounded border border-[#E2E5E1] w-full sm:w-auto font-mono">
              <button
                type="button"
                onClick={() => {
                  setSortOrder('newest');
                  if (type === 'camps') setCampSortOrder('default');
                }}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  sortOrder === 'newest' && (type !== 'camps' || campSortOrder === 'default')
                    ? 'bg-[#0F1B33] text-white'
                    : 'text-[#8891A3] hover:text-[#0F1B33]'
                }`}
              >
                <Calendar className="w-3 h-3 text-[#C9A227]" />
                NEWEST
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOrder('oldest');
                  if (type === 'camps') setCampSortOrder('default');
                }}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  sortOrder === 'oldest' && (type !== 'camps' || campSortOrder === 'default')
                    ? 'bg-[#0F1B33] text-white'
                    : 'text-[#8891A3] hover:text-[#0F1B33]'
                }`}
              >
                <Calendar className="w-3 h-3 text-[#C9A227] rotate-180" />
                OLDEST
              </button>
              {type === 'camps' && (
                <button
                  type="button"
                  onClick={() => setCampSortOrder(campSortOrder === 'payday' ? 'default' : 'payday')}
                  className={`flex-1 sm:flex-none px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    campSortOrder === 'payday'
                      ? 'bg-[#C9A227] text-[#0F1B33]'
                      : 'text-[#8891A3] hover:text-[#0F1B33]'
                  }`}
                  title="Sort camps with salary dates closest to today"
                >
                  <DollarSign className="w-3 h-3" strokeWidth={2.5} />
                  PAYDAY NEAR
                </button>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
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
            className="w-full md:w-auto px-3.5 py-1.5 bg-[#0F1B33] hover:bg-[#1C2A4A] text-[#C9A227] font-mono font-bold text-xs rounded border border-[#C9A227]/30 shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            <span>REGISTER NEW ENTRY</span>
          </motion.button>
        </div>

        {/* Filter Chips for Camps view */}
        {type === 'camps' && (
          <div className="space-y-1.5 pt-2 border-t border-[#E2E5E1]">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <span className="ops-eyebrow text-[#8891A3] text-[9px] shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                CATEGORY:
              </span>
              {CATEGORY_OPTIONS.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold transition-colors shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#0F1B33] text-[#C9A227]'
                        : 'bg-white text-[#8891A3] border border-[#E2E5E1] hover:text-[#0F1B33]'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <span className="ops-eyebrow text-[#8891A3] text-[9px] shrink-0 mr-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                REGION:
              </span>
              {REGION_OPTIONS.map((reg) => {
                const isActive = selectedRegion === reg;
                return (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold transition-colors shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#2E4B8F] text-white'
                        : 'bg-white text-[#8891A3] border border-[#E2E5E1] hover:text-[#0F1B33]'
                    }`}
                  >
                    {reg.toUpperCase()}
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
          <div className="p-8 text-center bg-white rounded border border-[#E2E5E1] text-xs text-[#8891A3] font-mono">
            No matching records found for "{searchTerm}"
          </div>
        )
      ) : (
        <div className="space-y-2.5">
          {/* 1. Companies view */}
          {type === 'companies' &&
            processedData.map((item, idx) => {
              const c = item as Company;
              return (
                <div
                  key={c.id}
                  className="ops-card p-4 space-y-2 relative group"
                >
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit('company', c)}
                        className="px-2 py-0.5 text-[10px] font-mono font-bold text-[#2E4B8F] bg-[#2E4B8F]/10 hover:bg-[#2E4B8F]/20 rounded border border-[#2E4B8F]/30 cursor-pointer flex items-center gap-1"
                        title="Edit Company Details"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>EDIT</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-1 text-[#8891A3] hover:text-[#D64545] cursor-pointer transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pr-20">
                    <span className="font-mono text-xs font-bold text-[#C9A227]">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold text-[#0F1B33]">{c.name}</h4>
                    <span className="bg-[#0F1B33] text-[#C9A227] text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                      CORPORATE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5B6478]">
                    {c.contact && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#8891A3] shrink-0" />
                        <span>Contact: <strong className="text-[#0F1B33]">{c.contact}</strong></span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#8891A3] shrink-0" />
                        <span>Phone: <strong className="text-[#0F1B33] font-mono">{c.phone}</strong></span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-[#8891A3] shrink-0" />
                        <span>Address: <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#2E4B8F] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{c.address}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a></span>
                      </div>
                    )}
                  </div>

                  {c.boss_name && (
                    <div className="p-2 bg-[#EEF0F3] rounded border border-[#E2E5E1] text-xs">
                      <span className="ops-eyebrow text-[#0F1B33]">CAMP MANAGER</span>
                      <p className="text-[#0F1B33] font-medium mt-0.5 font-mono">
                        {c.boss_name} {c.boss_phone ? `· ${c.boss_phone}` : ''}
                      </p>
                    </div>
                  )}

                  {c.notes && (
                    <p className="text-xs text-[#5B6478] bg-[#EEF0F3] p-2 rounded border border-[#E2E5E1] italic">
                      "{c.notes}"
                    </p>
                  )}

                  <div className="ops-eyebrow text-[#8891A3] text-[9px]">
                    REGISTERED ON {c.date}
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
                  className="ops-card p-4 space-y-2.5 relative group border-l-4 border-l-[#C9A227]"
                >
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit('camp', c)}
                        className="px-2 py-0.5 text-[10px] font-mono font-bold text-[#2E4B8F] bg-[#2E4B8F]/10 hover:bg-[#2E4B8F]/20 rounded border border-[#2E4B8F]/30 cursor-pointer flex items-center gap-1"
                        title="Edit Camp Details"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>EDIT</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-1 text-[#8891A3] hover:text-[#D64545] cursor-pointer transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Header Row */}
                  <div className="flex flex-wrap items-center gap-2 pr-20">
                    <span className="font-mono text-xs font-bold text-[#C9A227]">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-base font-bold text-[#0F1B33]">{c.name}</h4>

                    {c.region && (
                      <span className="bg-[#2E4B8F]/10 text-[#2E4B8F] font-mono text-[9px] px-2 py-0.5 rounded font-bold border border-[#2E4B8F]/20">
                        {c.region.toUpperCase()}
                      </span>
                    )}

                    {c.category && (
                      <span className="bg-[#C9A227]/10 text-[#0F1B33] font-mono text-[9px] px-2 py-0.5 rounded font-bold border border-[#C9A227]/30">
                        {c.category.toUpperCase()}
                      </span>
                    )}

                    {c.salaryDate && (
                      <span className="bg-[#2F9E77]/10 text-[#2F9E77] font-mono text-[9px] px-2 py-0.5 rounded font-bold border border-[#2F9E77]/30 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>PAYDAY: {getOrdinal(c.salaryDate)}</span>
                        {daysLeft !== null && daysLeft <= 5 && (
                          <span className="ml-1 bg-[#2F9E77] text-white px-1.5 py-0.2 rounded text-[8px] font-black">
                            {daysLeft === 0 ? 'TODAY' : `${daysLeft}D LEFT`}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5B6478] bg-[#EEF0F3] p-2.5 rounded border border-[#E2E5E1]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8891A3] shrink-0" />
                      <span>Address: {c.mapsLink ? (
                        <a
                          href={c.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#2E4B8F] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{c.location}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="font-bold text-[#0F1B33]">{c.location || '-'}</span>
                      )}</span>
                    </div>

                    {c.landmark && (
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-[#8891A3] shrink-0" />
                        <span>Landmark: <strong className="text-[#0F1B33]">{c.landmark}</strong></span>
                      </div>
                    )}

                    {c.company && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#8891A3] shrink-0" />
                        <span>Company: <strong className="text-[#0F1B33]">{c.company}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#8891A3] shrink-0" />
                      <span>Workers: <strong className="font-mono text-[#0F1B33]">{c.workers || 'N/A'}</strong></span>
                    </div>
                  </div>

                  {/* Boss Info */}
                  <div className="p-2 bg-white rounded border border-[#E2E5E1] text-xs">
                    <span className="ops-eyebrow text-[#0F1B33]">CAMP BOSS CONTACT</span>
                    <p className="text-[#0F1B33] font-medium mt-0.5 font-mono">
                      {c.boss_name} · <strong className="text-[#2E4B8F]">{c.boss_phone}</strong>
                    </p>
                  </div>

                  {c.notes && (
                    <p className="text-xs text-[#5B6478] bg-[#EEF0F3] p-2 rounded border border-[#E2E5E1] italic">
                      "{c.notes}"
                    </p>
                  )}

                  <div className="ops-eyebrow text-[#8891A3] text-[9px]">
                    REGISTERED ON {c.date}
                  </div>
                </div>
              );
            })}

          {/* 3. Customers view */}
          {type === 'customers' && (
            <div className="overflow-x-auto rounded border border-[#E2E5E1] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0F1B33] text-white font-mono text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">CUSTOMER</th>
                    <th className="py-2.5 px-3">PHONE</th>
                    <th className="py-2.5 px-3">LOCATION</th>
                    <th className="py-2.5 px-3">SEGMENT</th>
                    <th className="py-2.5 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E1] font-medium text-[#0F1B33]">
                  {processedData.map((item, idx) => {
                    const c = item as Customer;
                    return (
                      <tr key={c.id} className="hover:bg-[#EEF0F3]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#C9A227]">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0F1B33]">{c.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[#2E4B8F]">{c.phone || '-'}</td>
                        <td className="py-2.5 px-3">
                          {c.location ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#2E4B8F] hover:underline inline-flex items-center gap-1"
                            >
                              <span>{c.location}</span>
                              <ExternalLink className="w-3 h-3 text-[#8891A3]" />
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-[#EEF0F3] rounded text-[#0F1B33] font-mono text-[9px] font-bold border border-[#E2E5E1]">
                            {c.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('customer', c)}
                                className="text-[#2E4B8F] p-1 cursor-pointer hover:opacity-80"
                                title="Edit Customer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(c.id)}
                              className="text-[#D64545] p-1 cursor-pointer hover:opacity-80"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
            <div className="overflow-x-auto rounded border border-[#E2E5E1] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0F1B33] text-white font-mono text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">LOCATION</th>
                    <th className="py-2.5 px-3">CATEGORY</th>
                    <th className="py-2.5 px-3">EST. AUDIENCE</th>
                    <th className="py-2.5 px-3">KEY FINDINGS</th>
                    <th className="py-2.5 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E1] font-medium text-[#0F1B33]">
                  {processedData.map((item, idx) => {
                    const v = item as Visit;
                    return (
                      <tr key={v.id} className="hover:bg-[#EEF0F3]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#C9A227]">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0F1B33]">
                          {v.place ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.place)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#2E4B8F] hover:underline inline-flex items-center gap-1"
                            >
                              <span>{v.place}</span>
                              <ExternalLink className="w-3 h-3 text-[#8891A3]" />
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-[#C9A227]/15 text-[#0F1B33] rounded font-mono font-bold text-[9px] border border-[#C9A227]/30">
                            {v.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2E4B8F]">{v.people}</td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-[#5B6478]" title={v.notes}>
                          {v.notes || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('visit', v)}
                                className="text-[#2E4B8F] p-1 cursor-pointer hover:opacity-80"
                                title="Edit Visit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(v.id)}
                              className="text-[#D64545] p-1 cursor-pointer hover:opacity-80"
                              title="Delete Visit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
            <div className="overflow-x-auto rounded border border-[#E2E5E1] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0F1B33] text-white font-mono text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">CLIENT</th>
                    <th className="py-2.5 px-3">SENTIMENT</th>
                    <th className="py-2.5 px-3">RATING</th>
                    <th className="py-2.5 px-3">COMMENTS</th>
                    <th className="py-2.5 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E1] font-medium text-[#0F1B33]">
                  {processedData.map((item, idx) => {
                    const f = item as Feedback;
                    return (
                      <tr key={f.id} className="hover:bg-[#EEF0F3]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2F9E77]">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0F1B33]">
                          {f.customer || 'Anonymous'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                              f.type === 'Positive'
                                ? 'bg-[#2F9E77]/10 text-[#2F9E77] border border-[#2F9E77]/20'
                                : f.type === 'Negative'
                                ? 'bg-[#D64545]/10 text-[#D64545] border border-[#D64545]/20'
                                : 'bg-[#C9A227]/10 text-[#0F1B33] border border-[#C9A227]/20'
                            }`}
                          >
                            {f.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#C9A227] font-mono font-bold">
                          {f.rating} / 5
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-[#5B6478]" title={f.feedback}>
                          {f.feedback}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('feedback', f)}
                                className="text-[#2E4B8F] p-1 cursor-pointer hover:opacity-80"
                                title="Edit Feedback"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(f.id)}
                              className="text-[#D64545] p-1 cursor-pointer hover:opacity-80"
                              title="Delete Feedback"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
            <div className="overflow-x-auto rounded border border-[#E2E5E1] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0F1B33] text-white font-mono text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">CLIENT</th>
                    <th className="py-2.5 px-3">CATEGORY</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3">DESCRIPTION</th>
                    <th className="py-2.5 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E1] font-medium text-[#0F1B33]">
                  {processedData.map((item, idx) => {
                    const c = item as Complaint;
                    return (
                      <tr key={c.id} className="hover:bg-[#EEF0F3]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#D64545]">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0F1B33]">{c.customer}</td>
                        <td className="py-2.5 px-3 text-[#5B6478] font-mono text-[10px]">{c.category.toUpperCase()}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                              c.status === 'Resolved'
                                ? 'bg-[#2F9E77]/10 text-[#2F9E77] border border-[#2F9E77]/20'
                                : c.status === 'Open'
                                ? 'bg-[#D64545]/10 text-[#D64545] border border-[#D64545]/20 animate-pulse'
                                : 'bg-[#C9A227]/10 text-[#0F1B33] border border-[#C9A227]/20'
                            }`}
                          >
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-[#5B6478]" title={c.description}>
                          {c.description}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('complaint', c)}
                                className="text-[#2E4B8F] p-1 cursor-pointer hover:opacity-80"
                                title="Edit Complaint"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(c.id)}
                              className="text-[#D64545] p-1 cursor-pointer hover:opacity-80"
                              title="Delete Complaint"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* 7. Competitor Intel view */}
          {type === 'competitors' && (
            <div className="overflow-x-auto rounded border border-[#E2E5E1] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0F1B33] text-white font-mono text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">COMPETITOR</th>
                    <th className="py-2.5 px-3">PROMOTION STRATEGY</th>
                    <th className="py-2.5 px-3">IMPACT THREAT</th>
                    <th className="py-2.5 px-3">NOTES</th>
                    <th className="py-2.5 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E1] font-medium text-[#0F1B33]">
                  {processedData.map((item, idx) => {
                    const c = item as CompetitorIntel;
                    return (
                      <tr key={c.id} className="hover:bg-[#EEF0F3]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0F1B33]">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0F1B33]">{c.name}</td>
                        <td className="py-2.5 px-3 text-[#5B6478]">{c.strategy}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                              c.impact === 'High'
                                ? 'bg-[#D64545]/10 text-[#D64545] border border-[#D64545]/20'
                                : c.impact === 'Medium'
                                ? 'bg-[#C9A227]/10 text-[#0F1B33] border border-[#C9A227]/20'
                                : 'bg-[#2F9E77]/10 text-[#2F9E77] border border-[#2F9E77]/20'
                            }`}
                          >
                            {c.impact.toUpperCase()} THREAT
                          </span>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-[#5B6478]" title={c.notes}>
                          {c.notes || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onEdit && (
                              <button
                                onClick={() => onEdit('competitor', c)}
                                className="text-[#2E4B8F] p-1 cursor-pointer hover:opacity-80"
                                title="Edit Competitor Intel"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(c.id)}
                              className="text-[#D64545] p-1 cursor-pointer hover:opacity-80"
                              title="Delete Competitor Intel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
                    className="ops-card p-4 space-y-2 relative group"
                  >
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit('social', s)}
                          className="px-2 py-0.5 text-[10px] font-mono font-bold text-[#2E4B8F] bg-[#2E4B8F]/10 hover:bg-[#2E4B8F]/20 rounded border border-[#2E4B8F]/30 cursor-pointer flex items-center gap-1"
                          title="Edit Campaign"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>EDIT</span>
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(s.id)}
                        className="p-1 text-[#8891A3] hover:text-[#D64545] cursor-pointer transition-colors"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 pr-20">
                      <Smartphone className="w-4 h-4 text-[#2E4B8F] shrink-0" />
                      <h4 className="text-sm font-bold text-[#0F1B33]">{s.title}</h4>
                    </div>
                    <div className="space-y-1 text-xs text-[#5B6478]">
                      <div>
                        Platform: <strong className="text-[#0F1B33]">{platformInfo?.name || s.platform}</strong>
                      </div>
                      {s.budget && (
                        <div>
                          Budget: <strong className="font-mono text-[#0F1B33]">{s.budget}</strong>
                        </div>
                      )}
                      <div>
                        Status:{' '}
                        <span className="px-2 py-0.5 bg-[#2E4B8F]/10 text-[#2E4B8F] font-mono text-[9px] rounded font-bold">
                          {s.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {s.notes && (
                      <p className="text-xs text-[#5B6478] bg-[#EEF0F3] p-2 rounded border border-[#E2E5E1] italic">
                        "{s.notes}"
                      </p>
                    )}
                    <div className="ops-eyebrow text-[#8891A3] text-[9px]">
                      LAUNCHED ON {s.date}
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
                  className="ops-card p-4 space-y-2 relative group border-l-4 border-l-[#2F9E77]"
                >
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit('plan', p)}
                        className="px-2 py-0.5 text-[10px] font-mono font-bold text-[#2F9E77] bg-[#2F9E77]/10 hover:bg-[#2F9E77]/20 rounded border border-[#2F9E77]/30 cursor-pointer flex items-center gap-1"
                        title="Edit Plan"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>EDIT</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(p.id)}
                      className="p-1 text-[#8891A3] hover:text-[#D64545] cursor-pointer transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pr-20">
                    <span className="font-mono text-xs font-bold text-[#2F9E77]">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold text-[#0F1B33]">{p.title}</h4>
                    <span className="bg-[#2F9E77]/10 text-[#2F9E77] font-mono text-[9px] px-2 py-0.5 rounded font-bold border border-[#2F9E77]/20">
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                  {p.budget && (
                    <div className="text-xs text-[#5B6478]">
                      Proposed Budget: <strong className="font-mono text-[#0F1B33]">{p.budget}</strong>
                    </div>
                  )}
                  <p className="text-xs text-[#0F1B33] leading-relaxed bg-[#EEF0F3] p-2.5 rounded border border-[#E2E5E1] whitespace-pre-wrap">
                    {p.details}
                  </p>
                  <div className="ops-eyebrow text-[#8891A3] text-[9px]">
                    FORMULATED ON {p.date}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}


