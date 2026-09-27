import React, { useEffect, useState } from 'react';
import { Building2, MessageCircle, Save, Trash2, Users, WalletCards } from 'lucide-react';

export interface BranchReport {
  id: number;
  branchName: string;
  location: string;
  manager: string;
  phone: string;
  status: string;
  staffCount: string;
  staffAttendance: string;
  staffBehavior: string;
  marketingStatus: string;
  leads: string;
  smartBanking: string;
  bankingIssues: string;
  feedbackScore: string;
  customerFeedback: string;
  openComplaints: string;
  complaintNotes: string;
  remittanceVolume: string;
  topCorridor: string;
  notes: string;
  updatedAt: string;
}

const STORAGE_KEY = 'aljadeed_branch_reports_v1';
const emptyReport: Omit<BranchReport, 'id' | 'updatedAt'> = {
  branchName: '', location: '', manager: '', phone: '', status: 'Active', staffCount: '', staffAttendance: '', staffBehavior: 'Good', marketingStatus: 'Not started', leads: '', smartBanking: 'Not checked', bankingIssues: '', feedbackScore: '', customerFeedback: '', openComplaints: '0', complaintNotes: '', remittanceVolume: '', topCorridor: 'BDT', notes: '',
};

interface Props { managerWhatsApp?: string; showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void; }

export default function BranchManagement({ managerWhatsApp, showToast }: Props) {
  const [reports, setReports] = useState<BranchReport[]>(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } });
  const [form, setForm] = useState({ ...emptyReport });
  const [editingId, setEditingId] = useState<number | null>(null);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(reports)), [reports]);
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = () => {
    if (!form.branchName.trim() || !form.location.trim()) { showToast('Branch name and location are required', 'error'); return; }
    const record: BranchReport = { ...form, id: editingId || Date.now(), updatedAt: new Date().toISOString() };
    setReports((current) => editingId ? current.map((item) => item.id === editingId ? record : item) : [record, ...current]);
    setForm({ ...emptyReport }); setEditingId(null); showToast('Branch management report saved', 'success');
  };
  const share = (report: BranchReport) => {
    const text = [`🏢 BRANCH MANAGEMENT REPORT`, `Branch: ${report.branchName}`, `Location: ${report.location}`, `Manager: ${report.manager || 'N/A'}`, '', `Status: ${report.status}`, `Staff: ${report.staffCount || 'N/A'} | Attendance: ${report.staffAttendance || 'N/A'} | Behavior: ${report.staffBehavior}`, `Marketing: ${report.marketingStatus} | Leads: ${report.leads || 'N/A'}`, `Smart banking: ${report.smartBanking}${report.bankingIssues ? ` (${report.bankingIssues})` : ''}`, `Customer feedback: ${report.feedbackScore || 'N/A'} / 5 — ${report.customerFeedback || 'N/A'}`, `Open complaints: ${report.openComplaints}`, `Remittance volume: ${report.remittanceVolume || 'N/A'} | Top corridor: ${report.topCorridor}`, `Notes: ${report.notes || 'N/A'}`].join('\n');
    const target = managerWhatsApp ? `https://wa.me/${managerWhatsApp}` : 'https://wa.me/'; window.open(`${target}?text=${encodeURIComponent(text)}`, '_blank'); showToast('Branch report opened in WhatsApp', 'success');
  };
  const Field = ({ label, keyName, placeholder }: { label: string; keyName: keyof typeof form; placeholder?: string }) => <label className="block"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</span><input value={form[keyName]} onChange={(e) => set(keyName, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 text-xs border rounded-lg" /></label>;
  return <div className="space-y-5 animate-fade-in">
    <div className="bg-[#0F1B33] rounded-2xl p-5 text-white shadow-ops-panel"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-[#C9A227]/15 text-[#C9A227]"><Building2 className="w-5 h-5" /></div><div><h2 className="text-sm font-extrabold uppercase tracking-wider">Branch-wise Smart Management</h2><p className="text-[11px] text-[#8891A3] mt-1">One report for branch location, staff, marketing, banking, customers and remittance.</p></div></div></div>
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4"><div className="flex items-center justify-between"><h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">New / Update Branch Report</h3><span className="text-[10px] text-slate-400">Required: branch + location</span></div>
      <div className="grid sm:grid-cols-3 gap-3"><Field label="Branch name *" keyName="branchName" placeholder="Muscat Main Branch" /><Field label="Branch location *" keyName="location" placeholder="Al Khuwair / Sohar" /><Field label="Branch manager" keyName="manager" /><Field label="Manager phone" keyName="phone" /><Field label="Branch status" keyName="status" placeholder="Active / Closed / Renovation" /><Field label="Staff count" keyName="staffCount" /><Field label="Staff attendance" keyName="staffAttendance" placeholder="e.g. 90%" /><Field label="Staff behavior" keyName="staffBehavior" placeholder="Good / Needs coaching" /><Field label="Marketing status before" keyName="marketingStatus" placeholder="Running / Not started" /><Field label="Leads / walk-ins" keyName="leads" /><Field label="Smart banking status" keyName="smartBanking" placeholder="Active / Pending / Issue" /><Field label="Banking issues" keyName="bankingIssues" /><Field label="Feedback score / 5" keyName="feedbackScore" /><Field label="Customer feedback" keyName="customerFeedback" /><Field label="Open complaints" keyName="openComplaints" /><Field label="Complaint notes" keyName="complaintNotes" /><Field label="Remittance volume" keyName="remittanceVolume" placeholder="OMR monthly / daily" /><Field label="Top corridor" keyName="topCorridor" placeholder="BDT / PKR / INR" /><Field label="Management notes" keyName="notes" /></div>
      <div className="flex gap-2"><button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer"><Save className="w-4 h-4" /> {editingId ? 'Update report' : 'Save report'}</button>{editingId && <button onClick={() => { setForm({ ...emptyReport }); setEditingId(null); }} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>}</div>
    </div>
    <div className="grid gap-3">{reports.length === 0 ? <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-100">No branch reports yet. Add your first branch above.</div> : reports.map((report) => <div key={report.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-extrabold text-slate-800">{report.branchName}</h3><p className="text-[11px] text-slate-500">{report.location} · Manager: {report.manager || 'Not assigned'}</p></div><span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700">{report.status}</span></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3"><div className="p-2 rounded bg-slate-50"><Users className="w-3.5 h-3.5 text-indigo-500" /><b className="block text-xs mt-1">{report.staffCount || '--'}</b><span className="text-[9px] text-slate-400">Staff</span></div><div className="p-2 rounded bg-slate-50"><WalletCards className="w-3.5 h-3.5 text-indigo-500" /><b className="block text-xs mt-1">{report.smartBanking}</b><span className="text-[9px] text-slate-400">Smart banking</span></div><div className="p-2 rounded bg-slate-50"><b className="text-xs">{report.feedbackScore || '--'} / 5</b><span className="block text-[9px] text-slate-400">Feedback</span></div><div className="p-2 rounded bg-slate-50"><b className="text-xs">{report.openComplaints}</b><span className="block text-[9px] text-slate-400">Complaints</span></div></div><p className="text-[11px] text-slate-500 mt-3">Marketing: <b>{report.marketingStatus}</b> · Remittance: <b>{report.remittanceVolume || 'N/A'}</b> · Corridor: <b>{report.topCorridor}</b></p><div className="flex gap-2 mt-3"><button onClick={() => share(report)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-[10px] font-bold cursor-pointer"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</button><button onClick={() => { setForm(report); setEditingId(report.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold cursor-pointer">Edit</button><button onClick={() => setReports((current) => current.filter((item) => item.id !== report.id))} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold cursor-pointer"><Trash2 className="w-3 h-3" /> Delete</button></div></div>)}</div>
  </div>;
}
