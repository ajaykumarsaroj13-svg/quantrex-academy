import { connectToDatabase, ActivityLog, User, BackupData } from './utils/db.js';

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

    // 1. GET: Load progress / history
    if (req.method === 'GET') {
      const { userId, type, chapterId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Load PYQ progress for a specific chapter
      if (type === 'pyq' && chapterId) {
        const key = `pyq_progress_${userId}_${chapterId}`;
        const doc = await BackupData.findOne({ key });
        return res.status(200).json(doc ? doc.data : {});
      }

      // Load user activity logs
      const logs = await ActivityLog.find({ userId }).sort({ timestamp: -1 }).limit(50).lean();
      return res.status(200).json(logs);
    }

    // 2. POST: Save progress / activity
    if (req.method === 'POST') {
      const { userId, type, actionType, description, chapterId, progressData } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Save PYQ progress
      if (type === 'pyq' && chapterId && progressData) {
        const key = `pyq_progress_${userId}_${chapterId}`;
        await BackupData.updateOne(
          { key },
          { $set: { key, data: progressData, updatedAt: new Date() } },
          { upsert: true }
        );
        return res.status(200).json({ success: true });
      }

      // Save standard student activity log
      if (!actionType) {
        return res.status(400).json({ error: 'actionType is required' });
      }

      const newLog = new ActivityLog({
        userId,
        actionType,
        description
      });
      await newLog.save();

      // Dynamically update user daily streak / active state
      const user = await User.findById(userId);
      if (user) {
        user.lastActive = new Date();
        // Simple daily streak increment
        const today = new Date().toDateString();
        const lastActiveDate = new Date(user.lastActive).toDateString();
        if (today !== lastActiveDate) {
          user.dailyStreak += 1;
        }
        await user.save();
      }

      return res.status(201).json({ success: true, log: newLog });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (err) {
    console.error('Progress API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
