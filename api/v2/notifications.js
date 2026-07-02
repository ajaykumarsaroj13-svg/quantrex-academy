/**
 * /api/v2/notifications.js
 * Core Notification API for EdTech Ecosystem (Website + Mobile App + Admin Panel)
 */
import { connectToDatabase, Notification, User } from '../utils/db.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function verifyToken(token) {
  try {
    if (!token) return null;
    if (token.startsWith('jwt_session_')) {
      const parts = token.split('_');
      return parts[2] || null;
    }
    if (token.startsWith('qx_')) {
      const parts = token.split('_');
      if (parts.length < 3) return null;
      const payload = Buffer.from(parts[1], 'base64url').toString();
      const [userId] = payload.split('_');
      return userId;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectToDatabase();

    // ── GET NOTIFICATIONS ─────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const list = await Notification.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      return res.status(200).json({ success: true, data: list });
    }

    // ── POST BATCH/BROADCAST NOTIFICATION ─────────────────────────────────────
    if (req.method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
      }
      const userId = verifyToken(authHeader.slice(7));
      if (!userId) return res.status(401).json({ error: 'Invalid token' });

      // Verify Admin permissions
      const user = await User.findById(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      const { title, message, type = 'general' } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: 'Missing title or message' });
      }

      const newNotif = new Notification({ title, message, type });
      await newNotif.save();

      return res.status(200).json({ success: true, message: 'Notice broadcasted successfully', data: newNotif });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Notification API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
