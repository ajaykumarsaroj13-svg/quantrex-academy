import { connectToDatabase, BackupData, DbBackup } from './utils/db.js';
import axios from 'axios';

const BLOB_TOKEN = "vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief";

async function saveToVercelBlob(key, data) {
  try {
    const jsonStr = JSON.stringify(data);
    const filename = `db/${key}.json`;
    await axios.put(`https://blob.vercel-storage.com/${filename}`, jsonStr, {
      headers: {
        'authorization': `Bearer ${BLOB_TOKEN}`,
        'x-api-version': '7',
        'x-add-random-suffix': '0',
        'Content-Type': 'application/json'
      }
    });
    console.log(`Successfully backed up ${key} to Vercel Blob.`);
  } catch (err) {
    console.error(`Failed to upload ${key} to Vercel Blob:`, err.message);
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();

    // 1. GET: List all backups
    if (req.method === 'GET') {
      const backups = await DbBackup.find({}, { snapshot: 0 }).sort({ createdAt: -1 }).lean();
      return res.status(200).json(backups);
    }

    // 2. POST: Create or Restore backup
    if (req.method === 'POST') {
      const { action, backupId, description } = req.body;

      // A. CREATE BACKUP
      if (action === 'create') {
        const id = `backup_${Date.now()}`;
        
        // Fetch all documents from backupdatas collection
        const allData = await BackupData.find({}).lean();
        
        // Save as a snapshot in DbBackup
        const newBackup = new DbBackup({
          backupId: id,
          key: description || 'Manual backup',
          snapshot: allData
        });
        await newBackup.save();

        return res.status(201).json({
          success: true,
          message: 'Database backup created successfully!',
          backupId: id
        });
      }

      // B. RESTORE BACKUP
      if (action === 'restore') {
        if (!backupId) {
          return res.status(400).json({ error: 'backupId is required for restore' });
        }

        const backup = await DbBackup.findOne({ backupId });
        if (!backup) {
          return res.status(404).json({ error: 'Backup snapshot not found' });
        }

        const snapshot = backup.snapshot;
        if (!Array.isArray(snapshot)) {
          return res.status(400).json({ error: 'Invalid backup snapshot format' });
        }

        // Restore each document into BackupData collection & Vercel Blob
        for (const doc of snapshot) {
          if (doc.key && doc.data) {
            // Update MongoDB backupdatas collection
            await BackupData.updateOne(
              { key: doc.key },
              { $set: { key: doc.key, data: doc.data, updatedAt: new Date() } },
              { upsert: true }
            );

            // Sync back to Vercel Blob (to keep live website updated)
            await saveToVercelBlob(doc.key, doc.data);
          }
        }

        return res.status(200).json({
          success: true,
          message: `Database successfully restored to backup snapshot [${backupId}]!`
        });
      }

      return res.status(400).json({ error: 'Invalid action parameter' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (err) {
    console.error('Backup API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
