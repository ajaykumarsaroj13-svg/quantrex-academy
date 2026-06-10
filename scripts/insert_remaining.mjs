import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const chapters = [
  { id: 'jm_math_3', name: 'Matrices and Determinants', count: 180, topics: ['Algebra of Matrices', 'Determinants', 'System of Linear Equations'] },
  { id: 'jm_math_4', name: 'Permutations and Combinations', count: 110, topics: ['Fundamental Principle of Counting', 'Combinations', 'Circular Permutations'] },
  { id: 'jm_math_5', name: 'Binomial Theorem and Its Simple Applications', count: 95, topics: ['General Term', 'Properties of Binomial Coefficients', 'Applications'] }
];

async function insert() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  for (const ch of chapters) {
      await db.collection('pyqchapters').updateOne(
        { id: ch.id },
        { $set: { name: ch.name, subject: 'Mathematics', count: ch.count, weightage: '6%', exam: 'jee-main' } },
        { upsert: true }
      );
    
      await db.collection('pyqs').deleteMany({ chapterId: ch.id });
      
      const docs = [];
      for(let i=1; i<=ch.count; i++) {
          docs.push({
              question_id: `${ch.id}_q${i}`,
              exam: 'jee-main',
              chapterId: ch.id,
              title: 'JEE Main Math PYQ',
              year: 2024 - (i%5),
              difficulty: i%3 === 0 ? 'Hard' : 'Medium',
              type: 'SCQ',
              question: `<p>Sample Question ${i} for ${ch.name}. Calculate the correct mathematical property based on the given parameters.</p>`,
              options: ['<p>Option A</p>', '<p>Option B</p>', '<p>Option C</p>', '<p>Option D</p>'],
              correctOptionIndex: i%4,
              solution: `<p>Step-by-step solution for ${ch.name} question ${i}. Apply the standard formulas for ${ch.topics[i%ch.topics.length]}.</p>`,
              marks: 4,
              negativeMarks: -1,
              topic: ch.topics[i%ch.topics.length]
          });
      }
      await db.collection('pyqs').insertMany(docs);
      console.log(`Inserted ${ch.name}`);
  }

  process.exit(0);
}

insert();
