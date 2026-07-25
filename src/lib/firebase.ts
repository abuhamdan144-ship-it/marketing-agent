import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { AppData, Company, Camp, Customer, Visit, Feedback, Complaint, CompetitorIntel, SocialAd, MarketingPlan, Settings } from '../types';

let db: any;
let defaultDb: any;
let auth: any;
let isInitialized = false;

export async function initFirebase(): Promise<{ db: any; defaultDb: any; auth: any }> {
  if (isInitialized) return { db, defaultDb, auth };

  try {
    const response = await fetch('/firebase-applet-config.json');
    if (!response.ok) {
      throw new Error('Failed to load firebase-applet-config.json');
    }
    const firebaseConfig = await response.json();

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    db = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);

    defaultDb = getFirestore(app);

    auth = getAuth(app);
    isInitialized = true;
    return { db, defaultDb, auth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

// Subscribe or handle Auth state
export function subscribeAuth(onUser: (user: User | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, onUser);
}

// Perform anonymous sign in if not logged in, falling back to a persistent local device ID if disabled/blocked
export async function authenticateAnonymously(): Promise<{ uid: string }> {
  try {
    const { auth } = await initFirebase();
    if (auth && auth.currentUser) return auth.currentUser;
    
    if (auth) {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    }
  } catch (error) {
    console.warn('Firebase Anonymous Auth is restricted or disabled. Falling back to device-scoped ID:', error);
  }
  
  // Return local device ID fallback
  let localUid = localStorage.getItem('aljadeed_firebase_device_uid');
  if (!localUid) {
    localUid = 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('aljadeed_firebase_device_uid', localUid);
  }
  return { uid: localUid };
}

// Load all user-specific data from Firestore
export async function loadUserDataFromCloud(userId: string): Promise<Partial<AppData>> {
  const { db } = await initFirebase();
  
  const collectionsToLoad = [
    'companies',
    'camps',
    'customers',
    'visits',
    'feedback',
    'complaints',
    'competitors',
    'social',
    'plans',
    'attendance'
  ];

  const results: any = {};

  for (const col of collectionsToLoad) {
    try {
      const q = query(collection(db, col), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Keep ID as number if it was stored as number
        items.push({
          ...data,
          id: typeof data.id === 'string' ? Number(data.id) : data.id
        });
      });
      results[col] = items;
    } catch (error) {
      console.error(`Error loading collection ${col}:`, error);
      results[col] = [];
    }
  }

  // Load settings separately as it can be a single document per user
  try {
    const settingsRef = doc(db, 'settings', userId);
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      const docData = settingsSnap.data();
      results.settings = {
        agentName: docData.agentName || '',
        managerWhatsApp: docData.managerWhatsApp || '',
        managerEmail: docData.managerEmail || ''
      };
    } else {
      results.settings = {
        agentName: '',
        managerWhatsApp: '',
        managerEmail: ''
      };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    results.settings = {
      agentName: '',
      managerWhatsApp: '',
      managerEmail: ''
    };
  }

  return results;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Operation Error:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = sanitizeForFirestore(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// Save a single document to cloud
export async function saveDocumentToCloud(
  col: string, 
  item: any, 
  userId: string
): Promise<void> {
  const { db, defaultDb } = await initFirebase();
  const docId = String(item.id);
  
  const rawPayload = {
    ...item,
    userId
  };

  const payload = sanitizeForFirestore(rawPayload);

  console.log(`[Firestore Write Attempt] Target Collection: '${col}', Doc ID: '${docId}', User ID: '${userId}'`, payload);

  let primaryError: any = null;

  // 1. Primary write to configured database
  try {
    const docRef = doc(db, col, docId);
    await setDoc(docRef, payload);
    console.log(`[Firestore Write Success] Saved document '${docId}' to collection '${col}' in database '${db._databaseId?.database || 'default'}'`);
  } catch (error) {
    console.error(`[Firestore Primary Write Error] Failed writing document '${docId}' to collection '${col}':`, error);
    primaryError = error;
  }

  // 2. Secondary write to default database if distinct
  if (defaultDb && defaultDb !== db) {
    try {
      const defaultDocRef = doc(defaultDb, col, docId);
      await setDoc(defaultDocRef, payload);
      console.log(`[Firestore Write Success] Saved document '${docId}' to collection '${col}' in (default) database`);
    } catch (e) {
      console.warn('[Firestore Default Write Note]:', e);
    }
  }

  if (primaryError) {
    handleFirestoreError(primaryError, OperationType.WRITE, `${col}/${docId}`);
  }
}

// Delete a document from cloud
export async function deleteDocumentFromCloud(
  col: string,
  id: string | number
): Promise<void> {
  const { db, defaultDb } = await initFirebase();
  const docRef = doc(db, col, String(id));
  try {
    await deleteDoc(docRef);
    console.log(`[Firestore Delete Success] Deleted document ${id} from collection '${col}'`);
  } catch (error) {
    console.warn(`Error deleting from primary db:`, error);
  }

  if (defaultDb && defaultDb !== db) {
    try {
      const defaultDocRef = doc(defaultDb, col, String(id));
      await deleteDoc(defaultDocRef);
    } catch (e) {
      // ignore
    }
  }
}

// Save user settings to cloud
export async function saveSettingsToCloud(
  settings: Settings,
  userId: string
): Promise<void> {
  const { db, defaultDb } = await initFirebase();
  const payload = sanitizeForFirestore({
    ...settings,
    userId
  });
  
  let primaryErr: any = null;
  try {
    const docRef = doc(db, 'settings', userId);
    await setDoc(docRef, payload);
    console.log(`[Firestore Write Success] Saved settings for user '${userId}'`);
  } catch (error) {
    primaryErr = error;
  }

  if (defaultDb && defaultDb !== db) {
    try {
      const defaultDocRef = doc(defaultDb, 'settings', userId);
      await setDoc(defaultDocRef, payload);
    } catch (e) {
      // ignore
    }
  }

  if (primaryErr) {
    handleFirestoreError(primaryErr, OperationType.WRITE, `settings/${userId}`);
  }
}

// Perform initial migration of existing local storage data to the cloud
export async function migrateLocalDataToCloud(
  localData: AppData,
  userId: string
): Promise<void> {
  const { db } = await initFirebase();
  
  const collections = [
    { key: 'companies', colName: 'companies' },
    { key: 'camps', colName: 'camps' },
    { key: 'customers', colName: 'customers' },
    { key: 'visits', colName: 'visits' },
    { key: 'feedback', colName: 'feedback' },
    { key: 'complaints', colName: 'complaints' },
    { key: 'competitors', colName: 'competitors' },
    { key: 'social', colName: 'social' },
    { key: 'plans', colName: 'plans' },
    { key: 'attendance', colName: 'attendance' }
  ];

  // Batch writes are efficient
  const batch = writeBatch(db);
  let batchCount = 0;

  for (const { key, colName } of collections) {
    const list = (localData as any)[key] || [];
    for (const item of list) {
      const docRef = doc(db, colName, String(item.id));
      batch.set(docRef, {
        ...item,
        userId
      });
      batchCount++;
      
      // Firestore batch limit is 500 writes
      if (batchCount >= 400) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }

  // Also migrate settings
  if (localData.settings && (localData.settings.agentName || localData.settings.managerWhatsApp || localData.settings.managerEmail)) {
    const docRef = doc(db, 'settings', userId);
    batch.set(docRef, {
      ...localData.settings,
      userId
    });
    batchCount++;
  }

  if (batchCount > 0) {
    await batch.commit();
  }
}
