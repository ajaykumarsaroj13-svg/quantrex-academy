import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
const chapters = await db.collection('pyqchapters').find({}).toArray();
console.log('=== Chapters in DB ===');
chapters.forEach(c => console.log(`  ${c.id}: "${c.name}" (${c.count} Qs, subject: ${c.subject})`));
const totalQs = await db.collection('pyqs').countDocuments({});
console.log(`\nTotal questions in DB: ${totalQs}`);
process.exit(0);
