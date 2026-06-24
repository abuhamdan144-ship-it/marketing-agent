import React, { useState } from 'react';
import { Company, Camp, Customer, Visit, Feedback, Complaint, CompetitorIntel, SocialAd, MarketingPlan } from '../types';
import { SOCIAL_PLATFORMS } from '../utils/exportUtils';

interface ListsAndTablesProps {
  type: 'companies' | 'camps' | 'customers' | 'visits' | 'feedback' | 'complaints' | 'competitors' | 'social' | 'plans';
  data: any[];
  onDelete: (id: number) => void;
  onOpenModal: (type: string) => void;
}

export default function ListsAndTables({ type, data, onDelete, onOpenModal }: ListsAndTablesProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Data
  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
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
      return (
        c.name.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term) ||
        c.boss_name.toLowerCase().includes(term)
      );
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

  const handleEmptyState = (title: string, btnLabel: string, modalType: string) => (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
      <span className="text-4xl mb-3">📂</span>
      <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
        Keep operations tracked by registering entries to compile your marketing intelligence.
      </p>
      <button
        onClick={() => onOpenModal(modalType)}
        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
      >
        {btnLabel}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar & Add Button */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Filter list records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
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
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            ➕ Register New Entry
          </button>
        </div>
      )}

      {/* Render based on Type */}
      {filteredData.length === 0 ? (
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
            filteredData.map((item, idx) => {
              const c = item as Company;
              return (
                <div
                  key={c.id}
                  className="bg-slate-50 hover:bg-indigo-50/10 rounded-xl p-4 border border-slate-100 hover:border-indigo-100 transition-all duration-200 relative group"
                >
                  <button
                    onClick={() => onDelete(c.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 text-xs font-semibold p-1 cursor-pointer"
                    title="Delete Entry"
                  >
                    🗑️
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 font-mono">
                      #{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">{c.name}</h4>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      🏢 Corporate Account
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-500 font-medium">
                    {c.contact && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">👤</span>
                        <span>Contact: <strong className="text-slate-700">{c.contact}</strong></span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">📞</span>
                        <span>Phone: <strong className="text-slate-700 font-mono">{c.phone}</strong></span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <span className="text-sm">📍</span>
                        <span>Address: <strong className="text-slate-700">{c.address}</strong></span>
                      </div>
                    )}
                  </div>
                  {c.boss_name && (
                    <div className="mt-3 p-2.5 bg-white rounded-lg border border-slate-200/60 text-xs">
                      <p className="font-semibold text-slate-700 flex items-center gap-1">
                        <span>⛺</span> Associated Labor Camp Manager:
                      </p>
                      <p className="text-slate-500 mt-1 font-medium">
                        {c.boss_name} {c.boss_phone ? `· 📞 ${c.boss_phone}` : ''}
                      </p>
                    </div>
                  )}
                  {c.notes && (
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed font-medium bg-slate-100 p-2.5 rounded-lg border border-slate-200/40">
                      📝 <span className="italic">{c.notes}</span>
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
            filteredData.map((item, idx) => {
              const c = item as Camp;
              return (
                <div
                  key={c.id}
                  className="bg-slate-50 hover:bg-amber-50/10 rounded-xl p-4 border border-slate-100 hover:border-amber-200 transition-all duration-200 relative group"
                >
                  <button
                    onClick={() => onDelete(c.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 text-xs font-semibold p-1 cursor-pointer"
                  >
                    🗑️
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-600 font-mono">
                      #{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">{c.name}</h4>
                    <span className="bg-amber-50 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      🏕️ Labor Camp
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">📍</span>
                      <span>Location: <strong className="text-slate-700">{c.location}</strong></span>
                    </div>
                    {c.company && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🏢</span>
                        <span>Company: <strong className="text-slate-700">{c.company}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">👷</span>
                      <span>Total Workers: <strong className="text-slate-700">{c.workers || 'N/A'}</strong></span>
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 bg-white rounded-lg border border-slate-200/60 text-xs">
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                      <span>👤</span> Camp Boss:
                    </p>
                    <p className="text-slate-500 mt-1 font-medium">
                      {c.boss_name} · <strong className="font-mono text-slate-600">📞 {c.boss_phone}</strong>
                    </p>
                  </div>
                  {c.notes && (
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed font-medium bg-slate-100 p-2.5 rounded-lg border border-slate-200/40">
                      📝 <span className="italic">{c.notes}</span>
                    </p>
                  )}
                  <div className="mt-3 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
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
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredData.map((item, idx) => {
                    const c = item as Customer;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-indigo-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{c.name}</td>
                        <td className="py-2.5 px-4 font-mono">{c.phone || '-'}</td>
                        <td className="py-2.5 px-4">{c.location || '-'}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold text-[10px]">
                            {c.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => onDelete(c.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
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
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredData.map((item, idx) => {
                    const v = item as Visit;
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-rose-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{v.place}</td>
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
                          <button
                            onClick={() => onDelete(v.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
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
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredData.map((item, idx) => {
                    const f = item as Feedback;
                    const ratingStars = '⭐'.repeat(f.rating);
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
                        <td className="py-2.5 px-4 text-amber-500 font-mono tracking-widest">
                          {ratingStars}
                        </td>
                        <td className="py-2.5 px-4 max-w-xs truncate" title={f.feedback}>
                          {f.feedback}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => onDelete(f.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
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
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredData.map((item, idx) => {
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
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
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
                          <button
                            onClick={() => onDelete(c.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
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
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredData.map((item, idx) => {
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
                          <button
                            onClick={() => onDelete(c.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
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
              {filteredData.map((item, idx) => {
                const s = item as SocialAd;
                const platformInfo = SOCIAL_PLATFORMS[s.platform as keyof typeof SOCIAL_PLATFORMS];
                return (
                  <div
                    key={s.id}
                    className="p-4 bg-slate-50 border border-slate-100 hover:border-slate-300 rounded-xl transition-all relative"
                  >
                    <button
                      onClick={() => onDelete(s.id)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 text-xs font-semibold p-1 cursor-pointer"
                    >
                      🗑️
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{platformInfo?.icon || '📱'}</span>
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
            filteredData.map((item, idx) => {
              const p = item as MarketingPlan;
              return (
                <div
                  key={p.id}
                  className="bg-slate-50 hover:bg-emerald-50/10 rounded-xl p-4 border border-slate-100 hover:border-emerald-200 transition-all duration-200 relative group"
                >
                  <button
                    onClick={() => onDelete(p.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 text-xs font-semibold p-1 cursor-pointer"
                  >
                    🗑️
                  </button>
                  <div className="flex items-center gap-2">
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
