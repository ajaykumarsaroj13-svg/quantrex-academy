/**
 * Map DB IDs to match frontend syllabus IDs
 * jm_math_1 -> ch_mathematics_algebra_0 (Sets and Relations)
 * jm_math_2 -> ch_mathematics_algebra_1 (Logarithm)
 * jm_math_3 -> ch_mathematics_algebra_2 (Quadratic Equation and Inequalities)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const mapping = {
  'jm_math_1': 'ch_mathematics_algebra_0',
  'jm_math_2': 'ch_mathematics_algebra_1',
  'jm_math_3': 'ch_mathematics_algebra_2'
};

console.log('Mapping DB IDs to frontend Syllabus IDs...');

for (const [oldId, newId] of Object.entries(mapping)) {
  console.log(`Processing ${oldId} -> ${newId}`);
  
  // Update pyqchapters
  const res1 = await db.collection('pyqchapters').updateOne(
    { id: oldId },
    { $set: { id: newId } }
  );
  console.log(`  Chapters updated: ${res1.modifiedCount}`);
  
  // Update pyqs
  const res2 = await db.collection('pyqs').updateMany(
    { chapterId: oldId },
    { $set: { chapterId: newId } }
  );
  console.log(`  Questions updated: ${res2.modifiedCount}`);
}

console.log('✅ Done updating DB IDs!');
process.exit(0);
