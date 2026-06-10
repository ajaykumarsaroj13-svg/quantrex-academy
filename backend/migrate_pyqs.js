import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PyqChapter, Pyq } from './models/schemas.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment variables');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  const dataPath = path.join(__dirname, '..', 'src', 'utils', 'dummyPyqsData.json');
  console.log(`Reading data from ${dataPath}...`);
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 1. Process Chapters
  const chapters = [];
  const chaptersData = data.PYQ_CHAPTERS;
  ['mathematics', 'physics', 'chemistry'].forEach(subject => {
    if (chaptersData[subject]) {
      chaptersData[subject].forEach(ch => {
        chapters.push({
          id: ch.id,
          name: ch.name,
          subject: subject,  // subject comes from parent key, not from ch
          count: ch.count || 0,
          weightage: ch.weightage || '5%'
        });
      });
    }
  });

  console.log(`Migrating ${chapters.length} chapters...`);
  try { await PyqChapter.collection.drop(); } catch(e) {} // drop if exists
  await PyqChapter.insertMany(chapters);
  console.log('Chapters migrated successfully.');

  // 2. Process Questions (PYQ_DATABASE is a flat array)
  const pyqsRaw = data.PYQ_DATABASE;
  const pyqs = pyqsRaw.map(q => ({
    id: q.id,
    chapterId: q.chapterId,
    title: q.title || '',
    year: q.year || '',
    difficulty: q.difficulty || 'Medium',
    type: (q.type === 'numerical' || q.type === 'NUMERICAL') ? 'NUMERICAL' : 'SCQ',
    question: q.question,
    options: q.options || [],
    correctOptionIndex: q.correctOptionIndex,
    solution: q.solution || '',
    marks: 4,
    negativeMarks: -1
  }));

  console.log(`Migrating ${pyqs.length} questions...`);
  try { await Pyq.collection.drop(); } catch(e) {} // drop if exists
  
  // Insert in batches of 1000 to avoid memory issues
  const batchSize = 1000;
  for (let i = 0; i < pyqs.length; i += batchSize) {
    const batch = pyqs.slice(i, i + batchSize);
    try {
      await Pyq.insertMany(batch, { ordered: false });
      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} questions)`);
    } catch(e) {
      // ordered:false continues on duplicates
      console.log(`Batch ${i/batchSize+1}: ${e.result?.nInserted || 'some'} inserted (skipped duplicates)`);
    }
  }
  
  console.log('Questions migrated successfully.');
  
  console.log('Creating text indexes for search...');
  await Pyq.collection.createIndex({ chapterId: "text", title: "text" });

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
