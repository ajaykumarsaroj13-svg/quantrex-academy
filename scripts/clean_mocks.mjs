import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function cleanDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Keep only jm_math_1
  await db.collection('pyqs').deleteMany({ chapterId: { $ne: 'jm_math_1' } });
  
  // Re-restore jm_math_1 properly just in case
  console.log('Cleaned DB, keeping only ExamGoal real data for Sets and Relations');
  process.exit(0);
}

cleanDB();
