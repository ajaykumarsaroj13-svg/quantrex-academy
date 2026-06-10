import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function restore() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  const dataPath = path.join(__dirname, '../backend/data/test_series/examgoal_pyqs_sets_relation.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(raw);

  const chapterId = 'jm_math_1';
  
  // Make sure chapter exists
  await db.collection('pyqchapters').updateOne(
    { id: chapterId },
    { $set: { name: 'Sets, Relations and Functions', subject: 'Mathematics', count: 121, weightage: '6%', exam: 'jee-main' } },
    { upsert: true }
  );

  // Delete previously scraped bad questions for this chapter
  await db.collection('pyqs').deleteMany({ chapterId });

  const topicsMap = {};
  for (const t of data.topics) {
    topicsMap[t.id] = t.name;
  }

  let count = 0;
  const docs = [];
  for (const [topicId, questions] of Object.entries(data.questions)) {
    const topicName = topicsMap[topicId] || topicId;
    
    for (const q of questions) {
        docs.push({
          question_id: q.id,
          exam: 'jee-main',
          chapterId: chapterId,
          title: `JEE Main Math PYQ`,
          year: parseInt(q.year || '2024'),
          difficulty: 'Medium',
          type: q.type === 'Single Choice' ? 'SCQ' : (q.type || 'SCQ'),
          question: q.question,
          options: q.options || [],
          correctOptionIndex: q.correctOptionIndex,
          solution: q.solution || '',
          marks: 4,
          negativeMarks: -1,
          topic: topicName
        });
        count++;
    }
  }

  if (docs.length > 0) {
      await db.collection('pyqs').insertMany(docs);
  }

  console.log(`Successfully restored ${count} questions for Sets and Relations.`);
  process.exit(0);
}

restore();
