import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Overview from './components/Overview';
import LiveRates from './components/LiveRates';
import QuickActions from './components/QuickActions';
import DataForms from './components/DataForms';
import ListsAndTables from './components/ListsAndTables';
import AnalyticsSection from './components/AnalyticsSection';
import GoalTracker from './components/GoalTracker';
import Tabs from './components/Tabs';
import Toast from './components/Toast';
import ExportPreviewModal from './components/ExportPreviewModal';
import AttendanceSheet from './components/AttendanceSheet';
import MoreView from './components/MoreView';
import { AppData, Company, Camp, Customer, Visit, Feedback, Complaint, CompetitorIntel, SocialAd, MarketingPlan, AttendanceRecord, Settings } from './types';
import { generateFullReport, exportPDF, exportExcel, CORRIDORS, SOCIAL_PLATFORMS } from './utils/exportUtils';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  MessageCircle, 
  Mail 
} from 'lucide-react';
import { 
  initFirebase, 
  authenticateAnonymously, 
  loadUserDataFromCloud, 
  saveDocumentToCloud, 
  deleteDocumentFromCloud, 
  saveSettingsToCloud, 
  migrateLocalDataToCloud 
} from './lib/firebase';

const LOCAL_STORAGE_KEY = 'aljadeed_marketing_agent_v3';

const initialData: AppData = {
  companies: [],
  camps: [],
  customers: [],
  visits: [],
  feedback: [],
  complaints: [],
  competitors: [],
  social: [],
  plans: [],
  attendance: [],
  settings: {
    agentName: '',
    managerWhatsApp: '',
    managerEmail: '',
    monthlyVisitGoal: 15,
  },
  rates: {},
};

const loadInitialLocalData = (): AppData => {
  if (typeof window === 'undefined') return initialData;
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        companies: parsed.companies || [],
        camps: parsed.camps || [],
        customers: parsed.customers || [],
        visits: parsed.visits || [],
        feedback: parsed.feedback || [],
        complaints: parsed.complaints || [],
        competitors: parsed.competitors || [],
        social: parsed.social || [],
        plans: parsed.plans || [],
        attendance: parsed.attendance || [],
        settings: parsed.settings || { agentName: '', managerWhatsApp: '', managerEmail: '', monthlyVisitGoal: 15 },
        rates: parsed.rates || {},
      };
    } catch (e) {
      console.error('Error parsing initial local storage data:', e);
    }
  }
  return initialData;
};

export default function App() {
  const [appData, setAppData] = useState<AppData>(loadInitialLocalData);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [modalType, setModalType] = useState<string | null>(null);
  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);
  const [rateSource, setRateSource] = useState<string>('Offline / Loading...');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [isExportPreviewOpen, setIsExportPreviewOpen] = useState<boolean>(false);
  const [isGoalTrackerHidden, setIsGoalTrackerHidden] = useState<boolean>(true);

  // Forced Offline Mode State
  const [isForcedOffline, setIsForcedOffline] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aljadeed_forced_offline') === 'true';
  });

  // Network connection state & dynamic detection
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsNetworkOnline(true);
      showToast('Network connection detected. Syncing with databases...', 'success');
    };
    const handleOffline = () => {
      setIsNetworkOnline(false);
      showToast('Network connection lost. Running in offline fallback mode.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleForcedOffline = () => {
    const nextVal = !isForcedOffline;
    setIsForcedOffline(nextVal);
    localStorage.setItem('aljadeed_forced_offline', String(nextVal));
    showToast(
      nextVal 
        ? 'Forced Offline Mode enabled. Syncing paused.' 
        : 'Online Mode restored. Reconnecting to cloud databases...',
      nextVal ? 'warning' : 'success'
    );
  };

  // Firebase Auth and Sync state
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'synced' | 'error'>('idle');

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Settings inputs
  const [settingsForm, setSettingsForm] = useState(() => {
    const local = loadInitialLocalData();
    return {
      agentName: local.settings?.agentName || '',
      managerWhatsApp: local.settings?.managerWhatsApp || '',
      managerEmail: local.settings?.managerEmail || '',
      monthlyVisitGoal: local.settings?.monthlyVisitGoal || 15,
    };
  });

  // Load Initial Data & Sync with Firebase Cloud
  useEffect(() => {
    async function startFirebaseSync() {
      if (isForcedOffline || !isNetworkOnline) {
        setSyncStatus('error');
        setRateSource(isForcedOffline ? 'Offline cache (Forced Mode)' : 'Offline cache (No Network Connection)');
        setIsSyncing(false);
        // Immediately load from localStorage
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const validated: AppData = {
              companies: parsed.companies || [],
              camps: parsed.camps || [],
              customers: parsed.customers || [],
              visits: parsed.visits || [],
              feedback: parsed.feedback || [],
              complaints: parsed.complaints || [],
              competitors: parsed.competitors || [],
              social: parsed.social || [],
              plans: parsed.plans || [],
              attendance: parsed.attendance || [],
              settings: parsed.settings || { agentName: '', managerWhatsApp: '', managerEmail: '', monthlyVisitGoal: 15 },
              rates: parsed.rates || {},
            };
            setAppData(validated);
            setSettingsForm({
              agentName: validated.settings.agentName || '',
              managerWhatsApp: validated.settings.managerWhatsApp || '',
              managerEmail: validated.settings.managerEmail || '',
              monthlyVisitGoal: validated.settings.monthlyVisitGoal || 15,
            });
          } catch (e) {
            console.error('Error parsing local storage data:', e);
          }
        }
        return;
      }

      try {
        setIsSyncing(true);
        setSyncStatus('loading');
        
        // 1. Initialize Firebase
        await initFirebase();
        
        // 2. Sign in Anonymously
        const currentUser = await authenticateAnonymously();
        setUser(currentUser);

        // 3. Load from LocalStorage (migration source / cache)
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let localDataParsed: AppData | null = null;
        if (saved) {
          try {
            localDataParsed = JSON.parse(saved);
          } catch (e) {
            console.error('Error parsing local storage data:', e);
          }
        }

        // 4. Load Cloud Data
        const cloudData = await loadUserDataFromCloud(currentUser.uid);
        
        // 5. Detect offline deletions queue
        const deletedIdsSaved = localStorage.getItem('aljadeed_deleted_ids');
        let deletedIds: number[] = [];
        if (deletedIdsSaved) {
          try {
            deletedIds = JSON.parse(deletedIdsSaved);
          } catch (e) {
            console.error('Error parsing deleted ids:', e);
          }
        }

        // 6. Support offline reconciliation and merging
        let hasNewOfflineAdditions = false;
        let hasOfflineDeletions = false;

        const collectionKeys = [
          { key: 'companies', name: 'companies' },
          { key: 'camps', name: 'camps' },
          { key: 'customers', name: 'customers' },
          { key: 'visits', name: 'visits' },
          { key: 'feedback', name: 'feedback' },
          { key: 'complaints', name: 'complaints' },
          { key: 'competitors', name: 'competitors' },
          { key: 'social', name: 'social' },
          { key: 'plans', name: 'plans' },
          { key: 'attendance', name: 'attendance' }
        ];

        if (localDataParsed) {
          // Process deletes that occurred while offline
          for (const col of collectionKeys) {
            const cloudItems = (cloudData as any)[col.key] || [];
            const itemsToDelete = cloudItems.filter((cloudItem: any) => deletedIds.includes(cloudItem.id));
            if (itemsToDelete.length > 0) {
              hasOfflineDeletions = true;
              for (const itemToDelete of itemsToDelete) {
                try {
                  await deleteDocumentFromCloud(col.name, itemToDelete.id);
                } catch (err) {
                  console.error(`Error deleting item ${itemToDelete.id} from cloud:`, err);
                }
              }
            }
          }

          // Process additions that occurred while offline
          for (const col of collectionKeys) {
            const localItems = (localDataParsed as any)[col.key] || [];
            const cloudItems = (cloudData as any)[col.key] || [];
            
            const unsyncedItems = localItems.filter((localItem: any) => 
              !cloudItems.some((cloudItem: any) => cloudItem.id === localItem.id) &&
              !deletedIds.includes(localItem.id)
            );

            if (unsyncedItems.length > 0) {
              hasNewOfflineAdditions = true;
              for (const unsyncedItem of unsyncedItems) {
                try {
                  await saveDocumentToCloud(col.name, unsyncedItem, currentUser.uid);
                } catch (err) {
                  console.error(`Error syncing unsynced item ${unsyncedItem.id} to cloud:`, err);
                }
              }
            }
          }

          // Merge and sync settings if updated offline
          const hasLocalSettings = localDataParsed.settings && (
            (localDataParsed.settings.agentName || '').trim() !== '' ||
            (localDataParsed.settings.managerWhatsApp || '').trim() !== '' ||
            (localDataParsed.settings.managerEmail || '').trim() !== ''
          );
          
          const cloudSettingsEmpty = !cloudData.settings || (
            (cloudData.settings.agentName || '').trim() === '' &&
            (cloudData.settings.managerWhatsApp || '').trim() === '' &&
            (cloudData.settings.managerEmail || '').trim() === ''
          );

          if (hasLocalSettings && cloudSettingsEmpty) {
            try {
              await saveSettingsToCloud(localDataParsed.settings, currentUser.uid);
            } catch (err) {
              console.error('Error syncing offline settings to cloud:', err);
            }
          }
        }

        // Clean up pending deleted IDs from storage if we reached this point (connected)
        localStorage.removeItem('aljadeed_deleted_ids');

        // Fetch final fully synced data from cloud
        const syncedCloudData = (hasNewOfflineAdditions || hasOfflineDeletions) 
          ? await loadUserDataFromCloud(currentUser.uid)
          : cloudData;

        // Re-read latest localStorage state right before merging to avoid overwriting items saved while sync was in flight
        const latestStorageStr = localStorage.getItem(LOCAL_STORAGE_KEY);
        let latestLocalData: AppData | null = localDataParsed;
        if (latestStorageStr) {
          try {
            latestLocalData = JSON.parse(latestStorageStr);
          } catch (e) {
            console.error('Error parsing latest local storage:', e);
          }
        }

        // Robust merge function to prevent data loss on page load/refresh
        const mergeCollection = <T extends { id: number }>(
          cloudItems: T[] | undefined,
          localItems: T[] | undefined
        ): T[] => {
          const itemsMap = new Map<number, T>();
          
          // 1. First, insert all cloud-synced items
          if (cloudItems) {
            cloudItems.forEach((item) => {
              if (item && item.id) {
                itemsMap.set(Number(item.id), item);
              }
            });
          }
          
          // 2. Then, preserve local items that are NOT in the cloud and were NOT explicitly deleted
          if (localItems) {
            localItems.forEach((item) => {
              if (item && item.id) {
                const idNum = Number(item.id);
                if (!itemsMap.has(idNum) && !deletedIds.includes(idNum)) {
                  itemsMap.set(idNum, item);
                }
              }
            });
          }
          
          return Array.from(itemsMap.values());
        };

        // Normal flow: pull from fully reconciled cloud data
        const merged: AppData = {
          companies: mergeCollection(syncedCloudData.companies as Company[], latestLocalData?.companies),
          camps: mergeCollection(syncedCloudData.camps as Camp[], latestLocalData?.camps),
          customers: mergeCollection(syncedCloudData.customers as Customer[], latestLocalData?.customers),
          visits: mergeCollection(syncedCloudData.visits as Visit[], latestLocalData?.visits),
          feedback: mergeCollection(syncedCloudData.feedback as Feedback[], latestLocalData?.feedback),
          complaints: mergeCollection(syncedCloudData.complaints as Complaint[], latestLocalData?.complaints),
          competitors: mergeCollection(syncedCloudData.competitors as CompetitorIntel[], latestLocalData?.competitors),
          social: mergeCollection(syncedCloudData.social as SocialAd[], latestLocalData?.social),
          plans: mergeCollection(syncedCloudData.plans as MarketingPlan[], latestLocalData?.plans),
          attendance: mergeCollection(syncedCloudData.attendance as AttendanceRecord[], latestLocalData?.attendance),
          settings: (syncedCloudData.settings && (syncedCloudData.settings.agentName || syncedCloudData.settings.managerWhatsApp || syncedCloudData.settings.managerEmail))
            ? (syncedCloudData.settings as Settings)
            : (latestLocalData?.settings) || { agentName: '', managerWhatsApp: '', managerEmail: '', monthlyVisitGoal: 15 },
          rates: (latestLocalData && latestLocalData.rates) || {},
        };
        setAppData(merged);
        setSettingsForm({
          agentName: merged.settings.agentName || '',
          managerWhatsApp: merged.settings.managerWhatsApp || '',
          managerEmail: merged.settings.managerEmail || '',
          monthlyVisitGoal: merged.settings.monthlyVisitGoal || 15,
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));

        if (hasNewOfflineAdditions || hasOfflineDeletions) {
          showToast('Successfully synchronized offline changes with Firebase & MongoDB cloud databases', 'success');
        } else if (
          merged.companies.length > 0 ||
          merged.camps.length > 0 ||
          merged.customers.length > 0 ||
          merged.visits.length > 0
        ) {
          showToast('Securely synchronized with Firebase & MongoDB cloud databases', 'success');
        }

        setSyncStatus('synced');
      } catch (error) {
        console.error('Firebase sync failed, falling back to local database:', error);
        setSyncStatus('error');
        showToast('Running in offline-fallback mode', 'warning');
        
        // Fallback
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const validated: AppData = {
              companies: parsed.companies || [],
              camps: parsed.camps || [],
              customers: parsed.customers || [],
              visits: parsed.visits || [],
              feedback: parsed.feedback || [],
              complaints: parsed.complaints || [],
              competitors: parsed.competitors || [],
              social: parsed.social || [],
              plans: parsed.plans || [],
              attendance: parsed.attendance || [],
              settings: parsed.settings || { agentName: '', managerWhatsApp: '', managerEmail: '', monthlyVisitGoal: 15 },
              rates: parsed.rates || {},
            };
            setAppData(validated);
            setSettingsForm({
              agentName: validated.settings.agentName || '',
              managerWhatsApp: validated.settings.managerWhatsApp || '',
              managerEmail: validated.settings.managerEmail || '',
              monthlyVisitGoal: validated.settings.monthlyVisitGoal || 15,
            });
          } catch (e) {
            console.error('Failed to load local storage cache fallback', e);
          }
        }
      } finally {
        setIsSyncing(false);
      }
    }

    startFirebaseSync();
    updateTime();
  }, [isForcedOffline, isNetworkOnline]);

  // Sync with Local Storage on Data Change
  const saveToLocalStorage = (newData: AppData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
      setAppData(newData);
      updateTime();
    } catch (e) {
      console.error('Error saving data', e);
    }
  };

  const updateTime = () => {
    const now = new Date();
    setLastUpdate(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Fetch Live Rates
  const fetchRates = async () => {
    if (isForcedOffline || !isNetworkOnline) {
      setRateSource(isForcedOffline ? 'Offline cache (Forced Mode)' : 'Offline cache (No Network Connection)');
      setIsFetchingRates(false);
      return;
    }
    setIsFetchingRates(true);
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/OMR');
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      if (data.result === 'success') {
        const newRates: Record<string, number> = {};
        const ratesObj = data.rates || data.conversion_rates || {};
        CORRIDORS.forEach((c) => {
          if (ratesObj[c.code]) {
            newRates[c.id] = ratesObj[c.code];
          }
        });
        const updatedData = {
          ...appData,
          rates: {
            ...newRates,
            lastFetch: new Date().toISOString(),
          },
        };
        saveToLocalStorage(updatedData);
        setRateSource(`Live API: Refreshed ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
        showToast('Rates feed updated live from OMR exchange indices', 'success');
      }
    } catch (error) {
      console.error('Rates fetch error:', error);
      setRateSource('Offline cache used. Reconnecting...');
      showToast('Offline mode: rate feed loaded from secure local cache', 'warning');
    } finally {
      setIsFetchingRates(false);
    }
  };

  // Fetch rates on mount once data is verified
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 10 * 60 * 1000); // 10 mins
    return () => clearInterval(interval);
  }, [isForcedOffline, isNetworkOnline]);

  // Save Modal Record Callback
  const handleSaveModalData = async (formData: any) => {
    if (!modalType) return;

    const id = Date.now();
    const date = new Date().toLocaleDateString();
    const updated = { ...appData };
    let collectionName = '';
    let itemToSave: any = null;

    switch (modalType) {
      case 'company':
        const newCompany: Company = { id, date, ...formData };
        updated.companies = [...updated.companies, newCompany];
        collectionName = 'companies';
        itemToSave = newCompany;
        showToast(`Corporate partner "${newCompany.name}" successfully recorded`, 'success');
        break;
      case 'camp':
        const newCamp: Camp = { id, date, ...formData };
        updated.camps = [...updated.camps, newCamp];
        collectionName = 'camps';
        itemToSave = newCamp;
        showToast(`Labor Camp target "${newCamp.name}" listed successfully`, 'success');
        break;
      case 'customer':
        const newCustomer: Customer = { id, date, ...formData };
        updated.customers = [...updated.customers, newCustomer];
        collectionName = 'customers';
        itemToSave = newCustomer;
        showToast(`Customer lead "${newCustomer.name}" added to register`, 'success');
        break;
      case 'visit':
        const newVisit: Visit = { id, date, time: new Date().toLocaleTimeString('en-GB'), ...formData };
        updated.visits = [newVisit, ...updated.visits];
        collectionName = 'visits';
        itemToSave = newVisit;
        showToast(`Field visit at "${newVisit.place}" logged in operations feed`, 'success');
        break;
      case 'feedback':
        const newFeedback: Feedback = { id, date, ...formData };
        updated.feedback = [newFeedback, ...updated.feedback];
        collectionName = 'feedback';
        itemToSave = newFeedback;
        showToast('Client feedback recorded securely', 'success');
        break;
      case 'complaint':
        const newComplaint: Complaint = { id, date, ...formData };
        updated.complaints = [newComplaint, ...updated.complaints];
        collectionName = 'complaints';
        itemToSave = newComplaint;
        showToast(`Complaint filed for customer "${newComplaint.customer}"`, 'error');
        break;
      case 'competitor':
        const newCompetitor: CompetitorIntel = { id, date, ...formData };
        updated.competitors = [newCompetitor, ...updated.competitors];
        collectionName = 'competitors';
        itemToSave = newCompetitor;
        showToast('Competitor market intelligence recorded', 'warning');
        break;
      case 'social':
        const newAd: SocialAd = { id, date, ...formData };
        updated.social = [newAd, ...updated.social];
        collectionName = 'social';
        itemToSave = newAd;
        showToast(`Social ad campaign "${newAd.title}" formulated`, 'success');
        break;
      case 'plan':
        const newPlan: MarketingPlan = { id, date, ...formData };
        updated.plans = [newPlan, ...updated.plans];
        collectionName = 'plans';
        itemToSave = newPlan;
        showToast(`Strategic plan "${newPlan.title}" added to active roadmap`, 'success');
        break;
      default:
        break;
    }

    saveToLocalStorage(updated);
    setModalType(null);

    // Save to Firebase Cloud in background
    if (!isForcedOffline && collectionName && itemToSave) {
      try {
        setSyncStatus('loading');
        const activeUser = await getOrAuthenticateUser();
        if (activeUser && activeUser.uid) {
          await saveDocumentToCloud(collectionName, itemToSave, activeUser.uid);
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error('Error saving document to Cloud:', error);
        setSyncStatus('error');
        showToast('Saved locally. Cloud upload pending reconnection.', 'warning');
      }
    } else if (isForcedOffline) {
      showToast('Saved to local storage cache (Offline Mode Active)', 'info');
    }
  };

  // Helper to ensure authenticated user for background operations
  const getOrAuthenticateUser = async () => {
    if (user && user.uid) return user;
    try {
      const authUser = await authenticateAnonymously();
      setUser(authUser);
      return authUser;
    } catch (e) {
      console.error('Failed to authenticate user for action:', e);
      return null;
    }
  };

  // Update Agent Name from Header or Attendance Sheet
  const handleUpdateAgentName = async (newName: string) => {
    const updated = {
      ...appData,
      settings: {
        ...appData.settings,
        agentName: newName,
      },
    };
    saveToLocalStorage(updated);
    setSettingsForm((prev) => ({
      ...prev,
      agentName: newName,
    }));

    if (!isForcedOffline) {
      try {
        setSyncStatus('loading');
        const activeUser = await getOrAuthenticateUser();
        if (activeUser && activeUser.uid) {
          await saveSettingsToCloud(updated.settings, activeUser.uid);
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error('Error saving settings to Cloud:', error);
        setSyncStatus('error');
      }
    }
  };

  // Save Attendance Entry
  const handleSaveAttendanceEntry = async (entry: AttendanceRecord) => {
    const updated = { ...appData };
    const index = updated.attendance.findIndex((x) => x.id === entry.id);
    if (index >= 0) {
      updated.attendance[index] = entry;
    } else {
      updated.attendance = [entry, ...updated.attendance];
    }
    saveToLocalStorage(updated);

    if (!isForcedOffline) {
      try {
        setSyncStatus('loading');
        const activeUser = await getOrAuthenticateUser();
        if (activeUser && activeUser.uid) {
          await saveDocumentToCloud('attendance', entry, activeUser.uid);
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error('Error saving attendance entry to Cloud:', error);
        setSyncStatus('error');
        showToast('Saved locally. Cloud upload pending reconnection.', 'warning');
      }
    }
  };

  // Delete Callback
  const handleDeleteEntry = async (id: number) => {
    const updated = { ...appData };
    
    // Scan lists and determine collection
    let collectionName = '';
    if (updated.companies.some((x) => x.id === id)) collectionName = 'companies';
    else if (updated.camps.some((x) => x.id === id)) collectionName = 'camps';
    else if (updated.customers.some((x) => x.id === id)) collectionName = 'customers';
    else if (updated.visits.some((x) => x.id === id)) collectionName = 'visits';
    else if (updated.feedback.some((x) => x.id === id)) collectionName = 'feedback';
    else if (updated.complaints.some((x) => x.id === id)) collectionName = 'complaints';
    else if (updated.competitors.some((x) => x.id === id)) collectionName = 'competitors';
    else if (updated.social.some((x) => x.id === id)) collectionName = 'social';
    else if (updated.plans.some((x) => x.id === id)) collectionName = 'plans';
    else if (updated.attendance.some((x) => x.id === id)) collectionName = 'attendance';

    updated.companies = updated.companies.filter((x) => x.id !== id);
    updated.camps = updated.camps.filter((x) => x.id !== id);
    updated.customers = updated.customers.filter((x) => x.id !== id);
    updated.visits = updated.visits.filter((x) => x.id !== id);
    updated.feedback = updated.feedback.filter((x) => x.id !== id);
    updated.complaints = updated.complaints.filter((x) => x.id !== id);
    updated.competitors = updated.competitors.filter((x) => x.id !== id);
    updated.social = updated.social.filter((x) => x.id !== id);
    updated.plans = updated.plans.filter((x) => x.id !== id);
    updated.attendance = updated.attendance.filter((x) => x.id !== id);

    // Record deletion ID offline queue to ensure it doesn't reappear on sync / page refresh
    try {
      const deletedIdsSaved = localStorage.getItem('aljadeed_deleted_ids');
      let deletedIds: number[] = [];
      if (deletedIdsSaved) {
        deletedIds = JSON.parse(deletedIdsSaved);
      }
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('aljadeed_deleted_ids', JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.error('Error recording deleted id offline:', e);
    }

    saveToLocalStorage(updated);
    showToast('Entry permanently deleted from database', 'warning');

    if (!isForcedOffline && user && collectionName) {
      try {
        setSyncStatus('loading');
        await deleteDocumentFromCloud(collectionName, id);
        
        // Remove from offline deletion queue upon successful cloud deletion
        try {
          const deletedIdsSaved = localStorage.getItem('aljadeed_deleted_ids');
          if (deletedIdsSaved) {
            let deletedIds: number[] = JSON.parse(deletedIdsSaved);
            deletedIds = deletedIds.filter((x) => x !== id);
            localStorage.setItem('aljadeed_deleted_ids', JSON.stringify(deletedIds));
          }
        } catch (e) {}
        
        setSyncStatus('synced');
      } catch (error) {
        console.error('Error deleting document from Cloud:', error);
        setSyncStatus('error');
      }
    } else if (isForcedOffline) {
      showToast('Deleted from local storage cache (Offline Mode Active)', 'info');
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    if (!settingsForm.agentName.trim() || !settingsForm.managerWhatsApp.trim() || !settingsForm.managerEmail.trim()) {
      showToast('Please fulfill all required configurations in settings', 'error');
      return;
    }
    const cleanWhatsApp = settingsForm.managerWhatsApp.replace(/[^0-9]/g, '');
    const updated = {
      ...appData,
      settings: {
        agentName: settingsForm.agentName.trim(),
        managerWhatsApp: cleanWhatsApp,
        managerEmail: settingsForm.managerEmail.trim(),
        monthlyVisitGoal: Number(settingsForm.monthlyVisitGoal) || 15,
      },
    };
    saveToLocalStorage(updated);
    showToast('Agent dashboard configuration saved successfully', 'success');

    if (!isForcedOffline && user) {
      try {
        setSyncStatus('loading');
        await saveSettingsToCloud(updated.settings, user.uid);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Error saving settings to Cloud:', error);
        setSyncStatus('error');
      }
    } else if (isForcedOffline) {
      showToast('Configuration stored in local cache (Offline Mode Active)', 'info');
    }
  };

  // Update Monthly Goal target from GoalTracker
  const handleUpdateMonthlyGoal = async (newGoal: number) => {
    const updated = {
      ...appData,
      settings: {
        ...appData.settings,
        monthlyVisitGoal: newGoal,
      },
    };
    saveToLocalStorage(updated);
    setSettingsForm((prev) => ({
      ...prev,
      monthlyVisitGoal: newGoal,
    }));
    showToast(`Monthly campaign target goal updated to ${newGoal}`, 'success');

    if (!isForcedOffline && user) {
      try {
        setSyncStatus('loading');
        await saveSettingsToCloud(updated.settings, user.uid);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Error saving settings to Cloud:', error);
        setSyncStatus('error');
      }
    } else if (isForcedOffline) {
      showToast('Goal updated in local cache (Offline Mode Active)', 'info');
    }
  };

  // Clear Database
  const handleClearDatabase = async () => {
    if (window.confirm('🚨 Are you absolutely sure you want to purge the entire database? This is irreversible.')) {
      const confirmText = window.prompt('Type "DELETE" to confirm data destruction:');
      if (confirmText === 'DELETE') {
        const oldData = { ...appData };
        saveToLocalStorage(initialData);
        setSettingsForm({ agentName: '', managerWhatsApp: '', managerEmail: '', monthlyVisitGoal: 15 });
        showToast('All local logs and configurations have been securely wiped', 'error');

        if (user) {
          try {
            setSyncStatus('loading');
            const collections = [
              { key: 'companies', name: 'companies' },
              { key: 'camps', name: 'camps' },
              { key: 'customers', name: 'customers' },
              { key: 'visits', name: 'visits' },
              { key: 'feedback', name: 'feedback' },
              { key: 'complaints', name: 'complaints' },
              { key: 'competitors', name: 'competitors' },
              { key: 'social', name: 'social' },
              { key: 'plans', name: 'plans' }
            ];
            for (const col of collections) {
              const list = (oldData as any)[col.key] || [];
              for (const item of list) {
                await deleteDocumentFromCloud(col.name, item.id);
              }
            }
            await deleteDocumentFromCloud('settings', user.uid);
            setSyncStatus('synced');
            showToast('All Firebase Cloud records purged successfully', 'success');
          } catch (error) {
            console.error('Error clearing Firebase Cloud database:', error);
            setSyncStatus('error');
          }
        }
      } else {
        showToast('Database purge aborted', 'info');
      }
    }
  };

  // WhatsApp Report Send
  const handleSendWhatsApp = () => {
    const phone = appData.settings.managerWhatsApp;
    if (!phone) {
      showToast('Configuration error: Specify manager phone in settings first', 'error');
      setActiveTab('settings');
      return;
    }
    const reportText = generateFullReport(appData);
    const encoded = encodeURIComponent(reportText);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    showToast('Redirecting to WhatsApp with full operations report...', 'success');
  };

  // Email Report Send
  const handleSendEmail = () => {
    const email = appData.settings.managerEmail;
    if (!email) {
      showToast('Configuration error: Specify manager email in settings first', 'error');
      setActiveTab('settings');
      return;
    }
    const reportText = generateFullReport(appData);
    const subject = encodeURIComponent(`Al Jadeed Marketing Intel Report - ${new Date().toLocaleDateString()}`);
    const body = encodeURIComponent(reportText);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    showToast('Redirecting to default mail client...', 'success');
  };

  // Handle newsletter subscription
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  const getActiveTabLabel = () => {
    const labelMap: Record<string, string> = {
      dashboard: 'Dashboard Home',
      analytics: 'Operations Analytics & Intel',
      attendance: 'Monthly Attendance Register',
      companies: 'Registered Companies',
      camps: 'Labor Camps Target List',
      customers: 'Leads & Customers Register',
      visits: 'Logged Field Visits',
      feedback: 'Client Reviews & Feedback',
      complaints: 'Customer Disputes & Complaints',
      competitors: 'Competitor Strategies Tracker',
      social: 'Social Ad Campaigns',
      plans: 'Active Marketing Plans',
      settings: 'Dashboard Configurations',
      more: 'More Operations & Workspace',
    };
    return labelMap[activeTab] || 'Marketing Agent Notebook';
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-800 pb-16 lg:pb-0">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Tabs / Sidebar navigation */}
      <Tabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        badges={{
          companies: appData.companies.length,
          camps: appData.camps.length,
          customers: appData.customers.length,
          visits: appData.visits.length,
          attendance: appData.attendance.length,
        }}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header Block */}
        <Header
          lastUpdate={lastUpdate}
          isOnline={isNetworkOnline && !isForcedOffline}
          rateSource={rateSource}
          syncStatus={syncStatus}
          isForcedOffline={isForcedOffline}
          onToggleForcedOffline={handleToggleForcedOffline}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
          {/* Welcome Alert banner if settings not set */}
          {!appData.settings.agentName && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-xl shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0 text-xl">ℹ️</div>
                <div className="ml-3">
                  <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Agent Profile Incomplete
                  </h3>
                  <div className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Set your Agent Credentials, Manager WhatsApp, and Email under the{' '}
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="font-bold text-indigo-700 underline hover:text-indigo-800 cursor-pointer"
                    >
                      Settings tab
                    </button>{' '}
                    to activate WhatsApp report relays and customized PDF report generation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render Active View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Overview Counts */}
              <Overview
                appData={appData}
                onNavigate={(tab) => setActiveTab(tab)}
              />

              {/* Monthly Campaign/Visit Target Progress Tracker */}
              {!isGoalTrackerHidden ? (
                <GoalTracker
                  appData={appData}
                  onUpdateGoal={handleUpdateMonthlyGoal}
                  onHide={() => {
                    setIsGoalTrackerHidden(true);
                    showToast('Goal Tracker hidden. You can restore it anytime!', 'info');
                  }}
                />
              ) : (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <span className="text-xs text-slate-500 font-medium leading-normal">
                      Remittance Drive Target Tracker is hidden. You can keep operations focused or bring it back at any time.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsGoalTrackerHidden(false);
                      showToast('Goal Tracker restored!', 'success');
                    }}
                    className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors cursor-pointer shrink-0"
                  >
                    Restore Tracker
                  </button>
                </div>
              )}

              {/* Exchange Feed */}
              <LiveRates
                rates={appData.rates}
                rateSource={rateSource}
                isFetching={isFetchingRates}
                onRefresh={fetchRates}
                isOnline={rateSource.includes('Live')}
              />

              {/* Quick Log Triggers */}
              <QuickActions
                onOpenModal={(type) => setModalType(type)}
                onExportAll={() => exportExcel(appData)}
              />

              {/* Report Relays & Exports Block */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-[var(--gold,#C89B3C)]" strokeWidth={2} />
                    <span>Report Compilation &amp; Export Center</span>
                  </h3>
                </div>

                {/* Primary Export Action */}
                <button
                  onClick={() => setIsExportPreviewOpen(true)}
                  style={{
                    background: 'linear-gradient(155deg, #D4AC5C, #C89B3C)',
                    boxShadow: '0 4px 14px rgba(200, 155, 60, 0.35)',
                  }}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl text-[var(--ink,#16213E)] font-extrabold transition-all duration-200 transform active:scale-[0.99] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/30 backdrop-blur-xs flex items-center justify-center text-[var(--ink,#16213E)] shrink-0">
                      <FileSpreadsheet className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-extrabold tracking-tight font-display block">
                        Export Full Operations Report
                      </span>
                      <p className="text-[11px] text-[var(--ink,#16213E)]/80 font-semibold leading-tight mt-0.5">
                        Compile all registers (camps, visits, intel) into a master Excel workbook
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 bg-white/40 backdrop-blur-xs px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ml-2">
                    <span>Export (.xlsx)</span>
                  </div>
                </button>

                {/* Secondary Relay & Export Format Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={handleSendWhatsApp}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[var(--line,#E2E5E1)] text-[var(--ink,#16213E)] hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 text-[var(--ink,#16213E)]" strokeWidth={1.8} />
                    <span>Send via WhatsApp</span>
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[var(--line,#E2E5E1)] text-[var(--ink,#16213E)] hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors active:scale-95"
                  >
                    <Mail className="w-4 h-4 text-[var(--ink,#16213E)]" strokeWidth={1.8} />
                    <span>Send via Email</span>
                  </button>
                  <button
                    onClick={() => exportPDF(appData)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[var(--line,#E2E5E1)] text-[var(--ink,#16213E)] hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors active:scale-95"
                  >
                    <FileText className="w-4 h-4 text-[var(--ink,#16213E)]" strokeWidth={1.8} />
                    <span>Export as PDF</span>
                  </button>
                  <button
                    onClick={() => exportExcel(appData)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[var(--line,#E2E5E1)] text-[var(--ink,#16213E)] hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[var(--ink,#16213E)]" strokeWidth={1.8} />
                    <span>Export as Excel</span>
                  </button>
                </div>
              </div>

              {/* Recent Field Activities Feed */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  🕒 Recent Operations Feed
                </h3>
                <div className="space-y-2.5">
                  {[
                    ...appData.companies.map((c) => ({ icon: '🏢', title: `Company added: ${c.name}`, date: c.date })),
                    ...appData.camps.map((c) => ({ icon: '🏕️', title: `Camp added: ${c.name}`, date: c.date })),
                    ...appData.visits.slice(0, 3).map((v) => ({ icon: '📍', title: `Visit: ${v.place} (${v.type.toUpperCase()})`, date: `${v.date} ${v.time}` })),
                    ...appData.feedback.slice(0, 3).map((f) => ({ icon: '💬', title: `Feedback from ${f.customer || 'Anonymous'}`, date: f.date })),
                    ...appData.complaints.slice(0, 3).map((c) => ({ icon: '⚠️', title: `Complaint logged for ${c.customer}`, date: c.date })),
                    ...appData.competitors.slice(0, 3).map((c) => ({ icon: '🏪', title: `Competitor Intel: ${c.name}`, date: c.date })),
                  ]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 6)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-xs font-bold text-slate-700">{item.title}</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono text-slate-400">
                          {item.date}
                        </span>
                      </div>
                    ))}

                  {appData.companies.length === 0 && appData.camps.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400 font-medium">
                      No logs registered in database yet. Use "Quick Actions" to register entries!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <div className="animate-fade-in">
              <AnalyticsSection appData={appData} />
            </div>
          )}

          {/* Monthly Attendance Sheet View */}
          {activeTab === 'attendance' && (
            <AttendanceSheet
              attendanceData={appData.attendance}
              appData={appData}
              onSaveEntry={handleSaveAttendanceEntry}
              onDeleteEntry={handleDeleteEntry}
              onUpdateAgentName={handleUpdateAgentName}
              settings={appData.settings}
              showToast={showToast}
            />
          )}

          {/* More Operations View */}
          {activeTab === 'more' && (
            <MoreView
              appData={appData}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* List views */}
          {activeTab !== 'dashboard' && activeTab !== 'analytics' && activeTab !== 'attendance' && activeTab !== 'settings' && activeTab !== 'more' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-display">
                    {getActiveTabLabel()}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    Records and intelligence relating to Al Jadeed field ops
                  </p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-indigo-100">
                  Total: {appData[activeTab as keyof AppData] ? (appData[activeTab as keyof AppData] as any[]).length : 0}
                </span>
              </div>

              <ListsAndTables
                type={activeTab as any}
                data={appData[activeTab as keyof AppData] as any[]}
                onDelete={handleDeleteEntry}
                onOpenModal={(type) => setModalType(type)}
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-display">
                    ⚙️ Dashboard Configuration
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    Personalize your operations relay numbers and reporting signatures
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Your Full Agent Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Farhan Al Balushi"
                      value={settingsForm.agentName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, agentName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Manager WhatsApp (Including Country Code) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 96898765432"
                      value={settingsForm.managerWhatsApp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, managerWhatsApp: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <small className="text-[10px] text-slate-400 font-semibold mt-1 block">
                      Include country code (e.g. 968 for Oman) without + or preceding zeros.
                    </small>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Manager Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. ops.manager@aljadeed.com"
                      value={settingsForm.managerEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, managerEmail: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Monthly Campaign / Visit Goal <span className="text-indigo-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 15"
                      value={settingsForm.monthlyVisitGoal}
                      onChange={(e) => setSettingsForm({ ...settingsForm, monthlyVisitGoal: Number(e.target.value) || 15 })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <small className="text-[10px] text-slate-400 font-semibold mt-1 block">
                      Define the target count of field visits and deployments to achieve per month.
                    </small>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    💾 Save configurations
                  </button>
                </div>
              </div>

              {/* Data wipe */}
              <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">
                    ⚠️ Sensitive System Commands
                  </h4>
                  <p className="text-[11px] text-rose-600/80 font-semibold mt-0.5">
                    Actions taken here will purge data permanently. Export backup sheets first.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsExportPreviewOpen(true)}
                    className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    📦 Export Full Database Backup (Excel)
                  </button>
                  <button
                    onClick={handleClearDatabase}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    🗑️ Wipe Local Database
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Export Preview Modal */}
        <ExportPreviewModal
          isOpen={isExportPreviewOpen}
          onClose={() => setIsExportPreviewOpen(false)}
          onConfirm={() => {
            exportExcel(appData);
            setIsExportPreviewOpen(false);
            showToast('Full Excel database compiled and downloaded successfully!', 'success');
          }}
          appData={appData}
        />

        {/* Modal Overlay Render */}
        {modalType && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-zoom-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-display">
                  {modalType === 'company' && '🏢 Add Company Account'}
                  {modalType === 'camp' && '🏕️ Add Labor Camp'}
                  {modalType === 'customer' && '👤 Enroll Customer Lead'}
                  {modalType === 'visit' && '📍 Log Field Visit'}
                  {modalType === 'feedback' && '💬 Record Customer Feedback'}
                  {modalType === 'complaint' && '⚠️ File Customer Dispute'}
                  {modalType === 'competitor' && '🏪 Record Competitor Intel'}
                  {modalType === 'social' && '📱 Launch Social Campaign'}
                  {modalType === 'plan' && '📋 Formulate Marketing Plan'}
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <DataForms
                type={modalType}
                onSave={handleSaveModalData}
                onClose={() => setModalType(null)}
              />
            </div>
          </div>
        )}

        {/* Cinematic Footer Section */}
        <footer className="relative w-full overflow-hidden bg-slate-950 text-slate-300 mt-12 border-t border-slate-800">
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-blue-500 filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-indigo-500 filter blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="hidden relative z-10 max-w-5xl mx-auto px-4 py-10 sm:py-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand descriptor */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 text-xl bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl shadow-lg text-white">
                    🏦
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-wide font-display">
                      Marketing Agent Notebook
                    </h2>
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
                      Trust · Remittance · Integrity
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Established in 1985, Al Jadeed Exchange stands as Muscat's premier exchange corridor.
                  Empowering labor camps, SMEs, and retail customers with transparent, ultra-fast transfers.
                </p>
              </div>

              {/* Contacts / Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Contact Headquarters
                </h3>
                <div className="space-y-2 text-xs text-slate-400 font-medium">
                  <p className="flex items-center gap-2">
                    <span>📍</span> Ruwi Main Commercial District, Muscat, Oman
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📞</span> +968 2478 5432
                  </p>
                  <p className="flex items-center gap-2">
                    <span>✉️</span> compliance@aljadeedexchange.om
                  </p>
                </div>
              </div>

              {/* Newsletter subscribe */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Exchange Bulletins
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Stay updated with live remittance incentives and major corridor rate updates.
                </p>
                {newsletterSubscribed ? (
                  <div className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl animate-fade-in flex items-center gap-1.5">
                    <span>✅</span> Bulletin subscription confirmed successfully!
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      required
                      type="email"
                      placeholder="Agent or partner email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-semibold">
              <div>
                © {new Date().getFullYear()} Al Jadeed Exchange. All Rights Reserved. Made with{' '}
                <span className="text-rose-500 animate-pulse">❤️</span> in Muscat, Oman.
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Scroll To Top ↑
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
