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

export async function getChapters(exam) {
  await connectDB();
  
  // If exam filter provided, find chapters that have questions for that exam
  let filter = {};
  if (exam && exam !== 'All') {
    // Map user-facing exam names to DB values
    const examSlug = exam === 'JEE Main' ? 'jee-main' 
                   : exam === 'JEE Advanced' ? 'jee-advanced' 
                   : exam.toLowerCase().replace(/\s+/g, '-');
    filter.exams = examSlug;
  }
  
  const chapters = await PyqChapter.find(filter).lean();
  const grouped = { mathematics: [], physics: [], chemistry: [] };
  
  for (const ch of chapters) {
    if (grouped[ch.subject]) {
      // If exam filter, get accurate count for that specific exam
      if (exam && exam !== 'All') {
        const examSlug = exam === 'JEE Main' ? 'jee-main' 
                       : exam === 'JEE Advanced' ? 'jee-advanced' 
                       : exam.toLowerCase().replace(/\s+/g, '-');
        const count = await Pyq.countDocuments({ chapterId: ch.id, exam: examSlug });
        ch.questionCount = count;
      }
      grouped[ch.subject].push(ch);
    }
  }
  
  // Sort each subject's chapters by questionCount descending
  for (const subj of Object.keys(grouped)) {
    grouped[subj].sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
  }
  
  return grouped;
}

export async function getPyqs(chapterId, exam) {
  await connectDB();
  const filter = { chapterId };
  if (exam && exam !== 'All') {
    const examSlug = exam === 'JEE Main' ? 'jee-main' 
                   : exam === 'JEE Advanced' ? 'jee-advanced' 
                   : exam.toLowerCase().replace(/\s+/g, '-');
    filter.exam = examSlug;
  }
  const questions = await Pyq.find(filter).sort({ year: -1 }).lean();
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
