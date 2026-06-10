/**
 * Cleanup: Remove fake/mock jm_math_4..jm_math_16 chapters (no actual questions)
 * Also fix subject casing in real chapters
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

// 1. Delete fake chapters jm_math_4 through jm_math_16 (0 actual questions)
const fakeIds = ['jm_math_4','jm_math_5','jm_math_6','jm_math_7','jm_math_8',
  'jm_math_9','jm_math_10','jm_math_11','jm_math_12','jm_math_13',
  'jm_math_14','jm_math_15','jm_math_16'];

const deleted = await db.collection('pyqchapters').deleteMany({ id: { $in: fakeIds } });
console.log(`✅ Deleted ${deleted.deletedCount} fake chapter records`);

// 2. Fix subject casing on real chapters (jm_math_1, jm_math_2, jm_math_3)
// The getChapters() function groups by ch.subject lowercase
// Current: "Mathematics" (capital) -> needs to match grouped['mathematics']
// Fix: set subject to lowercase 'mathematics'
const fixResult = await db.collection('pyqchapters').updateMany(
  { id: /^jm_math_/ },
  { $set: { subject: 'mathematics', exam: 'jee-main' } }
);
console.log(`✅ Fixed subject casing on ${fixResult.modifiedCount} chapters`);

// 3. Verify final state
const finalChaps = await db.collection('pyqchapters').find({ id: /^jm_math_/ }).sort({ id: 1 }).toArray();
console.log('\n=== Final Math Chapters ===');
for (const ch of finalChaps) {
  const count = await db.collection('pyqs').countDocuments({ chapterId: ch.id });
  console.log(`  ${ch.id}: "${ch.name}" (${count} Qs) [subject: ${ch.subject}]`);
}

process.exit(0);
