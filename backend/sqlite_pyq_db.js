import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'pyqs.sqlite');

let dbPromise = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: dbPath,
      driver: sqlite3.Database, mode: process.env.VERCEL ? sqlite3.OPEN_READONLY : undefined
    });
  }
  return dbPromise;
}

export async function initializePyqDb() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pyq_chapters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      weightage TEXT DEFAULT '5%'
    );

    CREATE TABLE IF NOT EXISTS pyqs (
      id TEXT PRIMARY KEY,
      chapterId TEXT NOT NULL,
      title TEXT,
      year TEXT,
      difficulty TEXT,
      type TEXT,
      question TEXT NOT NULL,
      options TEXT, -- JSON string
      correctOptionIndex INTEGER,
      solution TEXT,
      marks INTEGER DEFAULT 4,
      negativeMarks INTEGER DEFAULT -1,
      topic TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_pyqs_chapterId ON pyqs(chapterId);
  `);
  console.log('SQLite PYQ Database initialized at', dbPath);
}

export async function seedPyqDb() {
  const db = await getDb();
  
  const countRes = await db.get('SELECT COUNT(*) as count FROM pyqs');
  if (countRes.count > 0) {
    console.log('Database already seeded. Skip seeding.');
    return;
  }

  const dataPath = path.join(__dirname, '../frontend/src/utils/dummyPyqsData.json');
  if (!fs.existsSync(dataPath)) {
    console.log('No dummyPyqsData.json found to seed.');
    return;
  }

  console.log('Seeding SQLite database...');
  const pyqData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const questions = pyqData.PYQ_DATABASE || [];
  const chaptersObj = pyqData.PYQ_CHAPTERS || {};

  await db.exec('BEGIN TRANSACTION');

  const insertChapter = await db.prepare('INSERT OR IGNORE INTO pyq_chapters (id, name, subject, count, weightage) VALUES (?, ?, ?, ?, ?)');
  for (const [subject, chArray] of Object.entries(chaptersObj)) {
    if (Array.isArray(chArray)) {
      for (const ch of chArray) {
        await insertChapter.run(ch.id, ch.name, subject, ch.count || 0, ch.weightage || '5%');
      }
    }
  }
  await insertChapter.finalize();

  const insertPyq = await db.prepare('INSERT OR IGNORE INTO pyqs (id, chapterId, title, year, difficulty, type, question, options, correctOptionIndex, solution, marks, negativeMarks, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  for (const q of questions) {
    await insertPyq.run(
      q.id,
      q.chapterId,
      q.title || `PYQ ${q.year || '2024'}`,
      q.year || '2024',
      q.difficulty || 'Medium',
      q.type || 'SCQ',
      q.question,
      JSON.stringify(q.options || []),
      q.correctOptionIndex,
      q.solution || '',
      q.marks || 4,
      q.negativeMarks || -1,
      q.topic || 'General'
    );
  }
  await insertPyq.finalize();

  await db.exec('COMMIT');
  console.log('SQLite Seeding completed! Total questions:', questions.length);
}

export async function getChapters() {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM pyq_chapters');
  const grouped = { mathematics: [], physics: [], chemistry: [] };
  for (const r of rows) {
    if (grouped[r.subject]) {
      grouped[r.subject].push(r);
    }
  }
  return grouped;
}

export async function getPyqs(chapterId) {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM pyqs WHERE chapterId = ?', [chapterId]);
  return rows.map(r => ({
    ...r,
    options: JSON.parse(r.options)
  }));
}

export async function searchPyqsByChapterTitle(title) {
  const db = await getDb();
  const targetId = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  const words = targetId.split('_').filter(w => w.length > 3);
  if (words.length === 0) return [];
  
  let query = 'SELECT * FROM pyqs WHERE ';
  const conditions = [];
  const params = [];
  for (const w of words) {
    conditions.push('chapterId LIKE ?');
    params.push(`%${w}%`);
  }
  query += conditions.join(' OR ');
  
  const rows = await db.all(query, params);
  return rows.map(r => ({ ...r, options: JSON.parse(r.options) }));
}
