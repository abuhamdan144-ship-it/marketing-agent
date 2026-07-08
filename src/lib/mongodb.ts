import { AppData } from '../types';

export interface MongoStatusResponse {
  connected: boolean;
  database?: string;
  message?: string;
  error?: string;
}

// 1. Test connection to the MongoDB cluster
export async function testMongoConnection(): Promise<MongoStatusResponse> {
  try {
    const res = await fetch('/api/mongodb/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { connected: false, error: errData.error || 'Server error' };
    }
    return await res.json();
  } catch (err: any) {
    return { connected: false, error: err.message || 'Network error' };
  }
}

// 2. Synchronize a single document insertion or update with MongoDB
export async function syncItemToMongo(
  collectionName: string,
  item: any,
  userId: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/mongodb/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, item, userId })
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to sync item to MongoDB:', err);
    return false;
  }
}

// 3. Delete a document from MongoDB
export async function deleteItemFromMongo(
  collectionName: string,
  id: string | number,
  userId: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/mongodb/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, id, userId })
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete item from MongoDB:', err);
    return false;
  }
}

// 4. Perform a complete bulk backup of client AppData to MongoDB
export async function backupAllToMongo(
  appData: AppData,
  userId: string
): Promise<{ success: boolean; results?: any; error?: string }> {
  try {
    const res = await fetch('/api/mongodb/bulk-backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appData, userId })
    });
    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result.error || 'Backup failed' };
    }
    return { success: true, results: result.results };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

// 5. Restore user-scoped data from MongoDB back to the client
export async function restoreAllFromMongo(
  userId: string
): Promise<{ success: boolean; data?: Partial<AppData>; error?: string }> {
  try {
    const res = await fetch(`/api/mongodb/restore/${userId}`);
    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result.error || 'Restore failed' };
    }
    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}
