import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

// Check jm_math_2 questions sample
const q2Sample = await db.collection('pyqs').findOne({ chapterId: 'jm_math_2' });
console.log('jm_math_2 question sample keys:', q2Sample ? Object.keys(q2Sample).join(', ') : 'NONE');
if (q2Sample) console.log('Sample:', JSON.stringify(q2Sample).substring(0, 200));

const q3Count = await db.collection('pyqs').countDocuments({ chapterId: 'jm_math_3' });
console.log('jm_math_3 count:', q3Count);

// Check if there are any chapters with count > 0 and real questions
const chapters = await db.collection('pyqchapters').find({ id: /^jm_/ }).sort({ id: 1 }).toArray();
console.log('\n=== JM chapters ===');
for (const ch of chapters) {
  const actualCount = await db.collection('pyqs').countDocuments({ chapterId: ch.id });
  console.log(`  ${ch.id}: "${ch.name}" - stored count: ${ch.count}, actual: ${actualCount}`);
}

// Also check subject casing
const mathChaps = await db.collection('pyqchapters').find({ subject: 'Mathematics' }).toArray();
console.log('\nMathematics chapters:', mathChaps.length);
const mathChapsLower = await db.collection('pyqchapters').find({ subject: 'mathematics' }).toArray();
console.log('mathematics (lowercase) chapters:', mathChapsLower.length);

process.exit(0);
