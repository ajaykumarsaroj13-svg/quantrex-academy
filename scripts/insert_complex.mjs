import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const docs = [
  {
    question_id: 'cx1',
    exam: 'jee-main',
    chapterId: 'jm_math_2',
    title: 'JEE Main Math PYQ',
    year: 2024,
    difficulty: 'Medium',
    type: 'SCQ',
    question: '<p>If $z$ is a complex number such that $|z - i| = |z + i|$, then the locus of $z$ is:</p>',
    options: ['<p>x-axis</p>', '<p>y-axis</p>', '<p>A circle</p>', '<p>A parabola</p>'],
    correctOptionIndex: 0,
    solution: '<p>Given $|z - i| = |z + i|$. This represents the perpendicular bisector of the line segment joining $i$ and $-i$. The points $i$ and $-i$ lie on the y-axis, symmetric about the origin. Hence, the perpendicular bisector is the x-axis.</p>',
    marks: 4,
    negativeMarks: -1,
    topic: 'Algebra of Complex Numbers'
  },
  {
    question_id: 'cx2',
    exam: 'jee-main',
    chapterId: 'jm_math_2',
    title: 'JEE Main Math PYQ',
    year: 2023,
    difficulty: 'Hard',
    type: 'SCQ',
    question: '<p>Let $z_1, z_2$ be the roots of the equation $z^2 + az + b = 0$, where $a, b$ are real. If the origin, $z_1$ and $z_2$ form an equilateral triangle, then:</p>',
    options: ['<p>$a^2 = b$</p>', '<p>$a^2 = 2b$</p>', '<p>$a^2 = 3b$</p>', '<p>$a^2 = 4b$</p>'],
    correctOptionIndex: 2,
    solution: '<p>For an equilateral triangle with vertices $0, z_1, z_2$, we know $z_1^2 + z_2^2 - z_1z_2 = 0$. <br> From equation, $z_1+z_2 = -a$ and $z_1z_2 = b$. <br> $(z_1+z_2)^2 - 3z_1z_2 = 0 \\implies (-a)^2 - 3(b) = 0 \\implies a^2 = 3b$.</p>',
    marks: 4,
    negativeMarks: -1,
    topic: 'Geometry of Complex Numbers'
  }
];

async function insert() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  await db.collection('pyqchapters').updateOne(
    { id: 'jm_math_2' },
    { $set: { name: 'Complex Numbers and Quadratic Equations', subject: 'Mathematics', count: 145, weightage: '7%', exam: 'jee-main' } },
    { upsert: true }
  );

  await db.collection('pyqs').deleteMany({ chapterId: 'jm_math_2' });
  
  for(let i=3; i<=145; i++) {
      docs.push({
          question_id: `cx${i}`,
          exam: 'jee-main',
          chapterId: 'jm_math_2',
          title: 'JEE Main Math PYQ',
          year: 2022 - (i%5),
          difficulty: i%3 === 0 ? 'Hard' : 'Medium',
          type: 'SCQ',
          question: `<p>Sample Question ${i} for Complex Numbers. If $\\omega$ is a cube root of unity, find the value of $(1 - \\omega + \\omega^2)^5 + (1 + \\omega - \\omega^2)^5$.</p>`,
          options: ['<p>32</p>', '<p>-32</p>', '<p>64</p>', '<p>-64</p>'],
          correctOptionIndex: 0,
          solution: '<p>Use properties of cube roots of unity: $1 + \\omega + \\omega^2 = 0$.</p>',
          marks: 4,
          negativeMarks: -1,
          topic: i < 50 ? 'Algebra of Complex Numbers' : (i < 100 ? 'Geometry of Complex Numbers' : 'Quadratic Equations')
      });
  }

  await db.collection('pyqs').insertMany(docs);
  console.log('Inserted Complex Numbers');
  process.exit(0);
}

insert();
