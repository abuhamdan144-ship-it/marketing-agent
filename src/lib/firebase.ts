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
let auth: any;
let isInitialized = false;

export async function initFirebase(): Promise<{ db: any; auth: any }> {
  if (isInitialized) return { db, auth };

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

    auth = getAuth(app);
    isInitialized = true;
    return { db, auth };
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
    'plans'
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

// Save a single document to cloud
export async function saveDocumentToCloud(
  col: string, 
  item: any, 
  userId: string
): Promise<void> {
  const { db } = await initFirebase();
  const docId = String(item.id);
  const docRef = doc(db, col, docId);
  
  await setDoc(docRef, {
    ...item,
    userId
  });
}

// Delete a document from cloud
export async function deleteDocumentFromCloud(
  col: string,
  id: string | number
): Promise<void> {
  const { db } = await initFirebase();
  const docRef = doc(db, col, String(id));
  await deleteDoc(docRef);
}

// Save user settings to cloud
export async function saveSettingsToCloud(
  settings: Settings,
  userId: string
): Promise<void> {
  const { db } = await initFirebase();
  const docRef = doc(db, 'settings', userId);
  await setDoc(docRef, {
    ...settings,
    userId
  });
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
    { key: 'plans', colName: 'plans' }
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
