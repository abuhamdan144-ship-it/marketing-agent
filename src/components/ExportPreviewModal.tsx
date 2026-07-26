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
      icon: <Building className="w-4 h-4 text-[#C9A227]" />,
      description: 'Corporate client list with contract terms and business domains'
    },
    {
      id: 'camps',
      name: 'Labor Camps Target List',
      count: appData.camps?.length || 0,
      icon: <Tent className="w-4 h-4 text-[#2F9E77]" />,
      description: 'Camp coordinates, population metrics, and access statuses'
    },
    {
      id: 'customers',
      name: 'Leads & Customers Register',
      count: appData.customers?.length || 0,
      icon: <Users className="w-4 h-4 text-[#2E4B8F]" />,
      description: 'Detailed customer contact profiles and remittance behavior'
    },
    {
      id: 'visits',
      name: 'Field Visits & Campaigns',
      count: appData.visits?.length || 0,
      icon: <MapPin className="w-4 h-4 text-[#C9A227]" />,
      description: 'Logged field visitation timelines, audience reach, and outcomes'
    },
    {
      id: 'feedbacks',
      name: 'Customer Feedback',
      count: appData.feedback?.length || 0,
      icon: <MessageSquare className="w-4 h-4 text-[#2F9E77]" />,
      description: 'Logged customer satisfaction surveys and experience comments'
    },
    {
      id: 'complaints',
      name: 'Customer Disputes',
      count: appData.complaints?.length || 0,
      icon: <AlertTriangle className="w-4 h-4 text-[#D64545]" />,
      description: 'Pending and resolved customer issues or operational slip-ups'
    },
    {
      id: 'competitors',
      name: 'Competitor Intel',
      count: appData.competitors?.length || 0,
      icon: <Eye className="w-4 h-4 text-[#8891A3]" />,
      description: 'Rival remittance operator rates, charges, and marketing moves'
    },
    {
      id: 'social',
      name: 'Social Campaigns',
      count: appData.social?.length || 0,
      icon: <Share2 className="w-4 h-4 text-[#2E4B8F]" />,
      description: 'Digital promotional campaigns launched on social platforms'
    },
    {
      id: 'plans',
      name: 'Marketing Action Plans',
      count: appData.plans?.length || 0,
      icon: <ClipboardList className="w-4 h-4 text-[#C9A227]" />,
      description: 'Structured strategies formulated for market penetration'
    }
  ];

  const totalRecords = collections.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="fixed inset-0 bg-[#0B1526]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#0F1B33] rounded-lg w-full max-w-2xl shadow-ops-panel border border-white/10 max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1C2A4A]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0F1B33] text-[#C9A227] rounded border border-[#C9A227]/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="ops-eyebrow text-[#C9A227]">
                EXCEL EXPORT DATA PREVIEW
              </h3>
              <p className="text-[10px] text-[#8891A3] font-mono mt-0.5">
                Audit and inspect database volumes prior to workbook compilation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-[#8891A3] hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Stats Banner */}
          <div className="bg-[#1C2A4A] rounded p-4 text-white flex items-center justify-between border border-white/10">
            <div>
              <span className="ops-eyebrow text-[#8891A3]">
                Aggregated Worksheets
              </span>
              <p className="text-xl font-mono font-bold text-white mt-0.5">
                {collections.length} <span className="text-[#8891A3] text-xs font-normal">Tables</span>
              </p>
            </div>
            <div className="text-right">
              <span className="ops-eyebrow text-[#8891A3]">
                Active Row Counts
              </span>
              <p className="text-xl font-mono font-bold text-[#4ADE94] mt-0.5">
                {totalRecords.toLocaleString()} <span className="text-[#8891A3] text-xs font-normal">records</span>
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-[#2E4B8F]/20 border border-[#2E4B8F]/40 rounded p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#8891A3] font-mono leading-relaxed">
              <strong className="text-white">Workbook Structure Info:</strong> The generated <code className="text-[#C9A227]">Marketing_Agent_Database.xlsx</code> workbook compiles each collection below into a separate dedicated worksheet tab. Cell values, currencies, dates, and coordinator coordinates will be auto-formatted.
            </div>
          </div>

          {/* Collection breakdown list */}
          <div className="space-y-2">
            <h4 className="ops-eyebrow text-[#8891A3]">
              Database Collection Breakdown
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {collections.map((col) => (
                <div 
                  key={col.id}
                  className="p-3 bg-[#1C2A4A]/60 rounded border border-white/5 hover:border-[#C9A227]/30 flex items-start gap-2.5 transition-all"
                >
                  <div className="p-1.5 rounded bg-[#0F1B33] border border-white/10 shrink-0">
                    {col.icon}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-xs font-mono font-bold text-white truncate block">
                        {col.name}
                      </span>
                      <span className={`text-[10px] font-mono font-bold shrink-0 px-1.5 py-0.5 rounded ${
                        col.count > 0 
                          ? 'bg-[#2F9E77]/20 text-[#4ADE94] border border-[#2F9E77]/30' 
                          : 'bg-white/5 text-[#8891A3] border border-white/5'
                      }`}>
                        {col.count} {col.count === 1 ? 'row' : 'rows'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8891A3] font-mono line-clamp-1">
                      {col.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#1C2A4A] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[10px] text-[#8891A3] font-mono uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
            <Database className="w-3 h-3 text-[#C9A227]" />
            <span>Ready to export full package</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-white font-mono font-bold text-xs rounded transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#C9A227] hover:bg-[#b59121] text-[#0F1B33] font-mono font-bold text-xs rounded shadow-ops-panel transition-colors flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              COMPILE WORKBOOK (.XLSX)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
