import { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  CloudLightning,
  Download,
  Upload,
  Activity
} from 'lucide-react';
import { testMongoConnection, backupAllToMongo, restoreAllFromMongo } from '../lib/mongodb';
import { AppData } from '../types';

interface MongoDashboardProps {
  appData: AppData;
  userId: string;
  onRestoreComplete: (restored: AppData) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function MongoDashboard({ appData, userId, onRestoreComplete, showToast }: MongoDashboardProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbInfo, setDbInfo] = useState<{ database?: string; message?: string; error?: string }>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const res = await testMongoConnection();
      if (res.connected) {
        setStatus('connected');
        setDbInfo({ database: res.database, message: res.message });
      } else {
        setStatus('error');
        setDbInfo({ error: res.error || 'Connection failed' });
      }
    } catch (e: any) {
      setStatus('error');
      setDbInfo({ error: e.message || 'Unknown network error' });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleBackup = async () => {
    if (status !== 'connected') {
      showToast('Cannot backup: MongoDB is not connected', 'error');
      return;
    }
    setIsSyncing(true);
    showToast('Starting background backup to MongoDB database...', 'info');
    try {
      const result = await backupAllToMongo(appData, userId);
      if (result.success) {
        showToast('Successfully backed up all datasets to MongoDB cluster!', 'success');
      } else {
        showToast(`MongoDB Backup error: ${result.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Backup request failed: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (status !== 'connected') {
      showToast('Cannot restore: MongoDB is not connected', 'error');
      return;
    }
    
    const confirmRestore = window.confirm(
      '⚠️ CRITICAL ACTION\n\nThis will pull all marketing intelligence and records stored under your account from MongoDB, overwriting your current active workspace data.\n\nAre you sure you want to proceed?'
    );
    if (!confirmRestore) return;

    setIsRestoring(true);
    showToast('Retrieving backup sets from MongoDB database...', 'info');
    try {
      const result = await restoreAllFromMongo(userId);
      if (result.success && result.data) {
        // Build restored data with fallbacks
        const restored: AppData = {
          companies: result.data.companies || [],
          camps: result.data.camps || [],
          customers: result.data.customers || [],
          visits: result.data.visits || [],
          feedback: result.data.feedback || [],
          complaints: result.data.complaints || [],
          competitors: result.data.competitors || [],
          social: result.data.social || [],
          plans: result.data.plans || [],
          settings: result.data.settings || appData.settings || { agentName: '', managerWhatsApp: '', managerEmail: '', monthlyVisitGoal: 15 },
          rates: appData.rates || {},
        };
        onRestoreComplete(restored);
        showToast('Database restore completed successfully! Overwrote active workspace.', 'success');
      } else {
        showToast(`MongoDB Restore error: ${result.error || 'No records returned'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Restore request failed: ${err.message}`, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-display flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            MongoDB Integration Service
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            Cloud backup relay for safe record keeping and system migration
          </p>
        </div>

        <button
          onClick={checkConnection}
          disabled={status === 'checking'}
          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Connection Indicator card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Mongo Connection Status */}
        <div className="col-span-1 md:col-span-2 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className={`p-2 rounded-lg ${
            status === 'checking' ? 'bg-indigo-50 text-indigo-500 animate-pulse' :
            status === 'connected' ? 'bg-emerald-50 text-emerald-500' :
            'bg-rose-50 text-rose-500'
          }`}>
            <CloudLightning className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cluster State
            </div>
            <div className="text-xs font-bold text-slate-700 truncate">
              {status === 'checking' && 'Connecting to cluster...'}
              {status === 'connected' && `Active - Connected (${dbInfo.database || 'buyOman'})`}
              {status === 'error' && 'Disconnected / Offline'}
            </div>
            {status === 'error' && (
              <span className="text-[10px] text-rose-500 font-semibold truncate block">
                {dbInfo.error || 'Invalid credentials or host unreachable.'}
              </span>
            )}
          </div>
        </div>

        {/* Sync Feed / Real-time info */}
        <div className="col-span-1 flex items-center gap-2.5 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50">
          <Activity className="w-4 h-4 text-indigo-600 animate-pulse flex-shrink-0" />
          <div>
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Real-time status</span>
            <span className="text-[11px] font-semibold text-indigo-800">Automatic Sync is Active</span>
          </div>
        </div>
      </div>

      {/* Dataset status summary list */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
        <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
          Syncable Workspace Datasets
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-medium text-slate-600">
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Companies: {appData.companies.length}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Camps: {appData.camps.length}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Customers: {appData.customers.length}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Visits: {appData.visits.length}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Feedback: {appData.feedback.length}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Complaints: {appData.complaints.length}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Ads: {appData.social.length}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Plans: {appData.plans.length}</span>
          </div>
        </div>
      </div>

      {/* Interactive Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          onClick={handleBackup}
          disabled={status !== 'connected' || isSyncing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Upload className="w-4 h-4" />
          {isSyncing ? 'Backing up...' : 'Backup Full Database to MongoDB'}
        </button>

        <button
          onClick={handleRestore}
          disabled={status !== 'connected' || isRestoring}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-4 h-4" />
          {isRestoring ? 'Restoring...' : 'Restore Database from MongoDB'}
        </button>
      </div>
    </div>
  );
}
