import React from 'react';
import { AppData } from '../types';
import { 
  Database, 
  FileSpreadsheet, 
  X, 
  Building, 
  Tent, 
  Users, 
  MapPin, 
  MessageSquare, 
  AlertTriangle, 
  Eye, 
  Share2, 
  ClipboardList,
  ChevronRight,
  Info
} from 'lucide-react';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appData: AppData;
}

export default function ExportPreviewModal({ isOpen, onClose, onConfirm, appData }: ExportPreviewModalProps) {
  if (!isOpen) return null;

  // Calculate stats
  const collections = [
    {
      id: 'companies',
      name: 'Registered Companies',
      count: appData.companies?.length || 0,
      icon: <Building className="w-4 h-4 text-indigo-500" />,
      color: 'bg-indigo-50',
      description: 'Corporate client list with contract terms and business domains'
    },
    {
      id: 'camps',
      name: 'Labor Camps Target List',
      count: appData.camps?.length || 0,
      icon: <Tent className="w-4 h-4 text-emerald-500" />,
      color: 'bg-emerald-50',
      description: 'Camp coordinates, population metrics, and access statuses'
    },
    {
      id: 'customers',
      name: 'Leads & Customers Register',
      count: appData.customers?.length || 0,
      icon: <Users className="w-4 h-4 text-sky-500" />,
      color: 'bg-sky-50',
      description: 'Detailed customer contact profiles and remittance behavior'
    },
    {
      id: 'visits',
      name: 'Field Visits & Campaigns',
      count: appData.visits?.length || 0,
      icon: <MapPin className="w-4 h-4 text-violet-500" />,
      color: 'bg-violet-50',
      description: 'Logged field visitation timelines, audience reach, and outcomes'
    },
    {
      id: 'feedbacks',
      name: 'Customer Feedback',
      count: appData.feedback?.length || 0,
      icon: <MessageSquare className="w-4 h-4 text-amber-500" />,
      color: 'bg-amber-50',
      description: 'Logged customer satisfaction surveys and experience comments'
    },
    {
      id: 'complaints',
      name: 'Customer Disputes',
      count: appData.complaints?.length || 0,
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
      color: 'bg-rose-50',
      description: 'Pending and resolved customer issues or operational slip-ups'
    },
    {
      id: 'competitors',
      name: 'Competitor Intel',
      count: appData.competitors?.length || 0,
      icon: <Eye className="w-4 h-4 text-slate-500" />,
      color: 'bg-slate-100',
      description: 'Rival remittance operator rates, charges, and marketing moves'
    },
    {
      id: 'social',
      name: 'Social Campaigns',
      count: appData.social?.length || 0,
      icon: <Share2 className="w-4 h-4 text-blue-500" />,
      color: 'bg-blue-50',
      description: 'Digital promotional campaigns launched on social platforms'
    },
    {
      id: 'plans',
      name: 'Marketing Action Plans',
      count: appData.plans?.length || 0,
      icon: <ClipboardList className="w-4 h-4 text-purple-500" />,
      color: 'bg-purple-50',
      description: 'Structured strategies formulated for market penetration'
    }
  ];

  const totalRecords = collections.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-hidden flex flex-col animate-zoom-in">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-display">
                Excel Export Data Preview
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Audit and inspect database volumes prior to workbook compilation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg text-sm cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Stats Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl p-4 text-white flex items-center justify-between border border-indigo-950">
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-sans">
                Total Aggregated Worksheets
              </span>
              <p className="text-2xl font-black font-display mt-0.5">
                {collections.length} <span className="text-slate-400 text-sm font-normal">Tables Selected</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-sans">
                Active Row Counts
              </span>
              <p className="text-2xl font-black font-display mt-0.5 text-emerald-400">
                {totalRecords.toLocaleString()} <span className="text-slate-400 text-sm font-normal text-slate-300">records</span>
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-800 leading-relaxed font-medium">
              <strong>Workbook Structure Info:</strong> The generated <code>Al_Jadeed_Field_Report.xlsx</code> workbook compiles each collection below into a separate dedicated worksheet tab. Cell values, currencies, dates, and coordinator coordinates will be auto-formatted.
            </div>
          </div>

          {/* Collection breakdown list */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Database Collection Breakdown
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {collections.map((col) => (
                <div 
                  key={col.id}
                  className="p-3.5 bg-white rounded-xl border border-slate-100 hover:border-indigo-100 flex items-start gap-3 transition-all hover:shadow-sm"
                >
                  <div className={`p-2 rounded-lg ${col.color} shrink-0`}>
                    {col.icon}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-xs font-bold text-slate-700 truncate block">
                        {col.name}
                      </span>
                      <span className={`text-[10px] font-extrabold shrink-0 px-2 py-0.5 rounded-full ${
                        col.count > 0 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                          : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        {col.count} {col.count === 1 ? 'row' : 'rows'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold line-clamp-1 leading-relaxed">
                      {col.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center sm:text-left">
            ⚡ Ready to export full package
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 sm:flex-initial px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-indigo-200 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Confirm & Compile Workbook (.xlsx)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
