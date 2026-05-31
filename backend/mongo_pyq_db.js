import mongoose from 'mongoose';
import { PyqChapter, Pyq } from './models/schemas.js';

// Cached connection for Vercel serverless
let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable not set');
  
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });
  isConnected = true;
}

export async function getChapters() {
  await connectDB();
  const chapters = await PyqChapter.find({}).lean();
  const grouped = { mathematics: [], physics: [], chemistry: [] };
  for (const ch of chapters) {
    if (grouped[ch.subject]) {
      grouped[ch.subject].push(ch);
    }
  }
  return grouped;
}

export async function getPyqs(chapterId) {
  await connectDB();
  const questions = await Pyq.find({ chapterId }).lean();
  return questions;
}

export async function searchPyqsByChapterTitle(title) {
  await connectDB();
  const targetId = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  const words = targetId.split('_').filter(w => w.length > 3);
  if (words.length === 0) return [];

  const conditions = words.map(w => ({ chapterId: { $regex: w, $options: 'i' } }));
  const questions = await Pyq.find({ $or: conditions }).lean();
  return questions;
}
