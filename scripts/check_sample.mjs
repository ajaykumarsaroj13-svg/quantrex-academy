import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const q = await db.collection('pyqs').findOne({ chapterId: 'ch_mathematics_algebra_1' });
console.log(JSON.stringify(q, null, 2));
process.exit(0);
