import React, { useState, useMemo } from 'react';
import { AttendanceRecord, AppData, Settings } from '../types';
import { Calendar, UserCheck, CheckCircle2, Clock, Plus, Printer, Sparkles, Download, Edit3, Trash2, Check, FileSpreadsheet, Building2, MapPin } from 'lucide-react';

interface AttendanceSheetProps {
  attendanceData: AttendanceRecord[];
  appData: AppData;
  onSaveEntry: (entry: AttendanceRecord) => void;
  onDeleteEntry: (id: number) => void;
  onBulkSaveEntries?: (entries: AttendanceRecord[]) => void;
  onUpdateAgentName?: (newName: string) => void;
  settings: Settings;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AttendanceSheet({
  attendanceData,
  appData,
  onSaveEntry,
  onDeleteEntry,
  onBulkSaveEntries,
  onUpdateAgentName,
  settings,
  showToast,
}: AttendanceSheetProps) {
  // Current month & year default
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  // Name defaults to requested name "Shaukat Khan Yousaf" or settings agentName if custom
  const defaultEmployeeName = settings.agentName || 'Shaukat Khan Yousaf';
  const [employeeName, setEmployeeName] = useState<string>(defaultEmployeeName);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Modal / Form state for adding/editing record
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Form fields
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formSession, setFormSession] = useState<string>('Morning');
  const [formPlaceCamp, setFormPlaceCamp] = useState<string>('');
  const [formManagerSig, setFormManagerSig] = useState<string>('Pending');
  const [formNotes, setFormNotes] = useState<string>('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [sigFilter, setSigFilter] = useState<string>('all');

  // Print mode state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Filter attendance records for selected Month & Year
  const monthlyRecords = useMemo(() => {
    return attendanceData.filter((rec) => {
      if (!rec.date) return false;
      const recDate = new Date(rec.date);
      if (isNaN(recDate.getTime())) {
        // Fallback parse YYYY-MM-DD
        const parts = rec.date.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          return y === selectedYear && m === selectedMonth;
        }
        return false;
      }
      return recDate.getFullYear() === selectedYear && recDate.getMonth() === selectedMonth;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [attendanceData, selectedMonth, selectedYear]);

  // Filtered records by search & session filters
  const filteredRecords = useMemo(() => {
    return monthlyRecords.filter((rec) => {
      const matchSearch =
        rec.placeAndCampVisit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.date.includes(searchTerm) ||
        (rec.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchSession = sessionFilter === 'all' || rec.session === sessionFilter;
      const matchSig =
        sigFilter === 'all' ||
        (sigFilter === 'signed' && rec.managerSig.toLowerCase().includes('signed')) ||
        (sigFilter === 'pending' && !rec.managerSig.toLowerCase().includes('signed'));

      return matchSearch && matchSession && matchSig;
    });
  }, [monthlyRecords, searchTerm, sessionFilter, sigFilter]);

  // Summary stats for month
  const totalDaysLogged = useMemo(() => {
    const uniqueDates = new Set(monthlyRecords.map((r) => r.date));
    return uniqueDates.size;
  }, [monthlyRecords]);

  const signedCount = useMemo(() => {
    return monthlyRecords.filter((r) => r.managerSig.toLowerCase().includes('signed') || r.managerSig.toLowerCase().includes('approved')).length;
  }, [monthlyRecords]);

  // Handle open form
  const handleOpenNewForm = () => {
    setEditingRecord(null);
    // Pre-select date in current month/year
    const day = String(currentDate.getDate()).padStart(2, '0');
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    setFormDate(`${selectedYear}-${monthStr}-${day}`);
    setFormSession('Morning');
    setFormPlaceCamp('');
    setFormManagerSig('Pending');
    setFormNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setFormDate(rec.date);
    setFormSession(rec.session || 'Morning');
    setFormPlaceCamp(rec.placeAndCampVisit || '');
    setFormManagerSig(rec.managerSig || 'Pending');
    setFormNotes(rec.notes || '');
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formPlaceCamp.trim()) {
      showToast('Please enter Date and Place & Camp Visit', 'warning');
      return;
    }

    const newRecord: AttendanceRecord = {
      id: editingRecord ? editingRecord.id : Date.now(),
      date: formDate,
      session: formSession,
      placeAndCampVisit: formPlaceCamp.trim(),
      managerSig: formManagerSig,
      notes: formNotes.trim(),
    };

    onSaveEntry(newRecord);
    setIsFormOpen(false);
    showToast(editingRecord ? 'Attendance entry updated' : 'Attendance record logged successfully!', 'success');
  };

  // Toggle signature status directly from table
  const handleToggleSignature = (rec: AttendanceRecord) => {
    const isSigned = rec.managerSig.toLowerCase().includes('signed');
    const updated: AttendanceRecord = {
      ...rec,
      managerSig: isSigned ? 'Pending' : 'Signed by Mgr',
    };
    onSaveEntry(updated);
    showToast(`Signature status updated for ${rec.date}`, 'info');
  };

  // Auto-populate attendance from field visits
  const handleAutoImportFromVisits = () => {
    // Look at appData.visits for visits matching the selected month and year
    const matchingVisits = appData.visits.filter((v) => {
      if (!v.date) return false;
      const vDate = new Date(v.date);
      if (isNaN(vDate.getTime())) {
        const parts = v.date.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          return y === selectedYear && m === selectedMonth;
        }
        return false;
      }
      return vDate.getFullYear() === selectedYear && vDate.getMonth() === selectedMonth;
    });

    if (matchingVisits.length === 0) {
      showToast(`No logged field visits found for ${MONTHS[selectedMonth]} ${selectedYear}. Try logging visits first!`, 'info');
      return;
    }

    let addedCount = 0;
    matchingVisits.forEach((visit, idx) => {
      // Check if entry already exists for date + place
      const exists = attendanceData.some(
        (rec) => rec.date === visit.date && rec.placeAndCampVisit.toLowerCase().includes(visit.place.toLowerCase())
      );

      if (!exists) {
        const sessionTime = visit.time ? (parseInt(visit.time.split(':')[0], 10) < 12 ? 'Morning' : 'Afternoon') : 'Morning';
        const newRecord: AttendanceRecord = {
          id: Date.now() + idx,
          date: visit.date,
          session: sessionTime,
          placeAndCampVisit: `${visit.place} (${visit.type.toUpperCase()})`,
          managerSig: 'Pending',
          notes: visit.notes || `Imported from Visit Log`,
        };
        onSaveEntry(newRecord);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      showToast(`Successfully imported ${addedCount} visit records into Attendance Register!`, 'success');
    } else {
      showToast('All matching visits are already registered in attendance sheet.', 'info');
    }
  };

  // Print function
  const handleTriggerPrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Session', 'Place and Camp Visit', 'Manager Signature', 'Notes'];
    const rows = monthlyRecords.map((r) => [
      `"${r.date}"`,
      `"${r.session}"`,
      `"${r.placeAndCampVisit.replace(/"/g, '""')}"`,
      `"${r.managerSig}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      `"ATTENDANCE REGISTER"\n` +
      `"Month & Year: ${MONTHS[selectedMonth]} ${selectedYear}"\n` +
      `"Employee Name: ${employeeName}"\n\n` +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Register_${MONTHS[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance Register exported to CSV!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Official Header Card - Requested Format */}
      <div className="bg-[var(--ink,#16213E)] text-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-800 relative overflow-hidden">
        {/* Background Accent Lines */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-dim,#F4E9D2)]/15 text-[var(--gold,#C89B3C)] border border-[var(--gold,#C89B3C)]/30 text-xs font-bold uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5 text-[var(--gold,#C89B3C)]" />
              Monthly Attendance Sheet
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display uppercase">
              ATTENDANCE REGISTER
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Official Field Attendance &amp; Camp Visit Verification Log
            </p>
          </div>

          {/* Month & Year Selector */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700/80">
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Month &amp; Year:</span>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-slate-800 text-slate-100 font-bold text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-[var(--gold,#C89B3C)] cursor-pointer"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-800 text-slate-100 font-bold text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-[var(--gold,#C89B3C)] cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSelectedMonth(currentDate.getMonth());
                setSelectedYear(currentDate.getFullYear());
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer border border-slate-700"
            >
              Current Month
            </button>
          </div>
        </div>

        {/* Employee / Agent Name Banner */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--gold-dim,#F4E9D2)]/20 border border-[var(--gold,#C89B3C)]/30 flex items-center justify-center text-[var(--gold,#C89B3C)] font-extrabold text-base shrink-0">
              <UserCheck className="w-5 h-5 text-[var(--gold,#C89B3C)]" strokeWidth={1.8} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                Employee / Agent Name
              </span>
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="bg-slate-900 text-white font-bold text-sm px-3 py-1 rounded-xl border border-[var(--gold,#C89B3C)] focus:outline-none"
                    placeholder="Enter Employee Name"
                  />
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      if (onUpdateAgentName && employeeName.trim()) {
                        onUpdateAgentName(employeeName.trim());
                      }
                      showToast(`Employee name updated to ${employeeName}`, 'success');
                    }}
                    className="px-3 py-1 bg-[var(--gold,#C89B3C)] text-[var(--ink,#16213E)] font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 mt-0.5">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-100 font-display">
                    {employeeName}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-[var(--gold,#C89B3C)] transition-colors cursor-pointer"
                    title="Edit Employee Name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAutoImportFromVisits}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[var(--gold,#C89B3C)] hover:bg-[#b88c2e] text-[var(--ink,#16213E)] font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--ink,#16213E)]" />
              Auto-Import Visits
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Days Logged
            </span>
            <span className="text-lg font-extrabold text-slate-800">
              {totalDaysLogged} <span className="text-xs font-medium text-slate-400">days</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Sessions
            </span>
            <span className="text-lg font-extrabold text-slate-800">
              {monthlyRecords.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Manager Signed
            </span>
            <span className="text-lg font-extrabold text-emerald-600">
              {signedCount} <span className="text-xs font-semibold text-slate-400">/ {monthlyRecords.length}</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Approval
            </span>
            <span className="text-lg font-extrabold text-amber-600">
              {monthlyRecords.length - signedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Attendance Table Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 font-display">
              Register Entries ({MONTHS[selectedMonth]} {selectedYear})
            </h3>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-extrabold px-2 py-0.5 rounded-md border border-indigo-100">
              {filteredRecords.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <input
              type="text"
              placeholder="Search place, camp, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 w-full sm:w-48"
            />

            {/* Session Filter */}
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-white"
            >
              <option value="all">All Sessions</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Full Day">Full Day</option>
            </select>

            {/* Signature Filter */}
            <select
              value={sigFilter}
              onChange={(e) => setSigFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-white"
            >
              <option value="all">All Signatures</option>
              <option value="signed">Signed Only</option>
              <option value="pending">Pending Only</option>
            </select>

            {/* Add New Entry Button */}
            <button
              onClick={handleOpenNewForm}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Table - Matching exact requested format */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                <th className="p-3.5 border-b border-slate-800 w-32">Date</th>
                <th className="p-3.5 border-b border-slate-800 w-28">Session</th>
                <th className="p-3.5 border-b border-slate-800">Place and Camp Visit</th>
                <th className="p-3.5 border-b border-slate-800 w-40 text-center">Mgr Sig</th>
                <th className="p-3.5 border-b border-slate-800 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec, index) => {
                  const isSigned = rec.managerSig.toLowerCase().includes('signed') || rec.managerSig.toLowerCase().includes('approved');
                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      {/* Date */}
                      <td className="p-3.5 font-bold font-mono text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{rec.date}</span>
                        </div>
                      </td>

                      {/* Session */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            rec.session === 'Morning'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : rec.session === 'Afternoon'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : rec.session === 'Evening'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {rec.session}
                        </span>
                      </td>

                      {/* Place & Camp Visit */}
                      <td className="p-3.5 font-bold text-slate-800">
                        <div>
                          <span>{rec.placeAndCampVisit}</span>
                          {rec.notes && (
                            <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                              {rec.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Manager Signature Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleSignature(rec)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer border ${
                            isSigned
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Click to toggle signature status"
                        >
                          {isSigned ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{rec.managerSig || 'Signed'}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending Sig</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditForm(rec)}
                            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(rec.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="flex justify-center text-slate-300">
                        <FileSpreadsheet className="w-8 h-8" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-bold text-slate-600">
                        No attendance entries registered for {MONTHS[selectedMonth]} {selectedYear}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Click "Add Entry" above or "Auto-Import Visits" to populate field attendance for this month.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal for Add/Edit Record */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
                {editingRecord ? (
                  <>
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                    <span>Edit Attendance Record</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>Register Attendance Entry</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Session <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formSession}
                  onChange={(e) => setFormSession(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Full Day">Full Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Place and Camp Visit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Suwaiq Camp Visit / Barka Commercial Area"
                  value={formPlaceCamp}
                  onChange={(e) => setFormPlaceCamp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Manager Signature Status
                </label>
                <input
                  type="text"
                  placeholder="e.g. Signed by Mgr, Approved, or Pending"
                  value={formManagerSig}
                  onChange={(e) => setFormManagerSig(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Additional Notes
                </label>
                <textarea
                  placeholder="Optional observations or remarks..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Register Modal & Layout */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto print-container">
            {/* Header controls for modal */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Print Preview: Official Attendance Register
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" strokeWidth={1.8} />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Register Print Document */}
            <div className="border-2 border-slate-800 p-6 rounded-lg space-y-6 bg-white text-slate-900 font-sans">
              {/* Document Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-2">
                <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">
                  ATTENDANCE REGISTER
                </h1>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Al Jadeed Marketing &amp; Field Operations
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-extrabold border-t border-slate-300 mt-2">
                  <div>
                    <span className="text-slate-500 uppercase">Month &amp; Year:</span>{' '}
                    <span className="text-slate-900 underline">{MONTHS[selectedMonth]} {selectedYear}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase">Name:</span>{' '}
                    <span className="text-slate-900 underline">{employeeName}</span>
                  </div>
                </div>
              </div>

              {/* Document Table */}
              <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-100 uppercase font-black border-b border-slate-800">
                    <th className="p-2.5 border-r border-slate-800 w-28">Date</th>
                    <th className="p-2.5 border-r border-slate-800 w-28">Session</th>
                    <th className="p-2.5 border-r border-slate-800">Place and Camp Visit</th>
                    <th className="p-2.5 border-slate-800 w-36 text-center">Mgr Sig</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {monthlyRecords.length > 0 ? (
                    monthlyRecords.map((rec) => (
                      <tr key={rec.id} className="border-b border-slate-800">
                        <td className="p-2.5 border-r border-slate-800 font-bold font-mono">{rec.date}</td>
                        <td className="p-2.5 border-r border-slate-800 font-semibold">{rec.session}</td>
                        <td className="p-2.5 border-r border-slate-800 font-bold">
                          {rec.placeAndCampVisit}
                          {rec.notes && <span className="block text-[10px] font-normal text-slate-500 italic">{rec.notes}</span>}
                        </td>
                        <td className="p-2.5 text-center font-bold">
                          {rec.managerSig || '________________'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center italic text-slate-500">
                        No entries recorded for {MONTHS[selectedMonth]} {selectedYear}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Signatures Footer */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs font-bold border-t-2 border-slate-800 mt-6">
                <div>
                  <p className="uppercase text-slate-500 text-[10px]">Employee Signature:</p>
                  <div className="mt-8 border-b border-slate-800 w-48"></div>
                  <p className="mt-1 font-extrabold">{employeeName}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="uppercase text-slate-500 text-[10px]">Manager / Supervisor Signature:</p>
                  <div className="mt-8 border-b border-slate-800 w-48"></div>
                  <p className="mt-1 font-extrabold">{settings.managerEmail || 'Manager Sign-off'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
