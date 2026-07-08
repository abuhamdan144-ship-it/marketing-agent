import express from 'express';
import path from 'path';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = 3000;

// Use user provided MongoDB URI or read from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abuhamdan144_db_user:sicplb7J9n1X3k6d@buyoman.muidenq.mongodb.net/?appName=buyOman';

let mongoClient: MongoClient | null = null;
let isConnected = false;
let dbName = 'buyOman'; // default DB name from appName/connection

// Helper function to get MongoDB Database instance
async function getMongoDb() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
  }
  if (!isConnected) {
    try {
      await mongoClient.connect();
      isConnected = true;
      console.log('Successfully connected to MongoDB!');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
      mongoClient = null;
      isConnected = false;
      throw err;
    }
  }
  return mongoClient.db(dbName);
}

// 1. Connection status endpoint
app.post('/api/mongodb/status', async (req, res) => {
  try {
    const db = await getMongoDb();
    // Quick ping to verify active connection
    await db.command({ ping: 1 });
    res.json({
      connected: true,
      database: dbName,
      message: 'Successfully pinged and connected to MongoDB cluster!'
    });
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      error: error.message || 'Unable to connect to MongoDB.'
    });
  }
});

// 2. Sync a single item (inserts or updates)
app.post('/api/mongodb/sync', async (req, res) => {
  const { collectionName, item, userId } = req.body;
  if (!collectionName || !item || !userId) {
    return res.status(400).json({ error: 'Missing collectionName, item, or userId' });
  }

  try {
    const db = await getMongoDb();
    const col = db.collection(collectionName);
    
    // Ensure ID is matched correctly (as number or string fallback)
    const itemId = item.id;
    
    // We update the document by its unique id and user id or insert if new
    const result = await col.updateOne(
      { id: itemId, userId: userId },
      { $set: { ...item, userId, syncedAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true, matchedCount: result.matchedCount, modifiedCount: result.modifiedCount, upsertedCount: result.upsertedCount });
  } catch (error: any) {
    console.error(`MongoDB Sync error in ${collectionName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Delete an item
app.post('/api/mongodb/delete', async (req, res) => {
  const { collectionName, id, userId } = req.body;
  if (!collectionName || id === undefined || !userId) {
    return res.status(400).json({ error: 'Missing collectionName, id, or userId' });
  }

  try {
    const db = await getMongoDb();
    const col = db.collection(collectionName);
    
    const result = await col.deleteOne({ id: id, userId: userId });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error(`MongoDB Delete error in ${collectionName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Bulk backup of all collections from Client to MongoDB
app.post('/api/mongodb/bulk-backup', async (req, res) => {
  const { appData, userId } = req.body;
  if (!appData || !userId) {
    return res.status(400).json({ error: 'Missing appData or userId' });
  }

  try {
    const db = await getMongoDb();
    const collectionsToBackup = [
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

    const backupResults: any = {};

    for (const key of collectionsToBackup) {
      const list = appData[key] || [];
      if (list.length === 0) continue;

      const col = db.collection(key);
      
      // We can use bulkWrite for atomic and performant upsert operations
      const operations = list.map((item: any) => ({
        updateOne: {
          filter: { id: item.id, userId: userId },
          update: { $set: { ...item, userId, syncedAt: new Date() } },
          upsert: true
        }
      }));

      const resWrite = await col.bulkWrite(operations);
      backupResults[key] = {
        matchedCount: resWrite.matchedCount,
        modifiedCount: resWrite.modifiedCount,
        upsertedCount: resWrite.upsertedCount,
      };
    }

    // Backup settings as well
    if (appData.settings) {
      const settingsCol = db.collection('settings');
      await settingsCol.updateOne(
        { userId: userId },
        { $set: { ...appData.settings, userId, syncedAt: new Date() } },
        { upsert: true }
      );
      backupResults['settings'] = 'synced';
    }

    res.json({ success: true, results: backupResults });
  } catch (error: any) {
    console.error('MongoDB Bulk Backup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Bulk restore from MongoDB back to Client
app.get('/api/mongodb/restore/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const db = await getMongoDb();
    const collectionsToRestore = [
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

    const restoredData: any = {};

    for (const key of collectionsToRestore) {
      const col = db.collection(key);
      const docs = await col.find({ userId: userId }).toArray();
      restoredData[key] = docs.map(({ _id, syncedAt, ...rest }) => rest);
    }

    // Restore settings
    const settingsCol = db.collection('settings');
    const settingsDoc = await settingsCol.findOne({ userId: userId });
    if (settingsDoc) {
      const { _id, syncedAt, ...settingsRest } = settingsDoc;
      restoredData.settings = settingsRest;
    }

    res.json({ success: true, data: restoredData });
  } catch (error: any) {
    console.error('MongoDB Restore error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vite Integration Setup
async function startViteServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startViteServer();
