import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const mathChapters = [
  "Sets, Relations and Functions",
  "Complex Numbers and Quadratic Equations",
  "Matrices and Determinants",
  "Permutations and Combinations",
  "Mathematical Induction",
  "Binomial Theorem and Its Simple Applications",
  "Sequence and Series",
  "Limit, Continuity and Differentiability",
  "Integral Calculus",
  "Differential Equations",
  "Coordinate Geometry",
  "Three Dimensional Geometry",
  "Vector Algebra",
  "Statistics and Probability",
  "Trigonometry",
  "Mathematical Reasoning"
];

async function insertAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  for (let i = 0; i < mathChapters.length; i++) {
      const chName = mathChapters[i];
      const chId = `jm_math_${i+1}`;
      
      // Skip the ones we already did
      if (i === 0) continue; 

      await db.collection('pyqchapters').updateOne(
        { id: chId },
        { $set: { name: chName, subject: 'Mathematics', count: 90 + (i*5), weightage: '5%', exam: 'jee-main' } },
        { upsert: true }
      );
    
      const existing = await db.collection('pyqs').countDocuments({ chapterId: chId });
      if (existing > 10) continue; // Skip if already populated

      await db.collection('pyqs').deleteMany({ chapterId: chId });
      
      const docs = [];
      const count = 90 + (i*5);
      const sub1 = `${chName} - Basics`;
      const sub2 = `${chName} - Advanced Concepts`;
      const sub3 = `${chName} - Applications`;

      for(let j=1; j<=count; j++) {
          let t = j % 3 === 0 ? sub3 : (j % 2 === 0 ? sub2 : sub1);
          docs.push({
              question_id: `${chId}_q${j}`,
              exam: 'jee-main',
              chapterId: chId,
              title: 'JEE Main Math PYQ',
              year: 2024 - (j%5),
              difficulty: j%3 === 0 ? 'Hard' : 'Medium',
              type: 'SCQ',
              question: `<p>[Loading exact ExamGoal equation...] Sample Placeholder for ${chName} Question ${j}</p>`,
              options: ['<p>Option A</p>', '<p>Option B</p>', '<p>Option C</p>', '<p>Option D</p>'],
              correctOptionIndex: j%4,
              solution: `<p>[Loading step-by-step solution...]</p>`,
              marks: 4,
              negativeMarks: -1,
              topic: t
          });
      }
      await db.collection('pyqs').insertMany(docs);
      console.log(`Inserted ${chName}`);
  }

  process.exit(0);
}

insertAll();
