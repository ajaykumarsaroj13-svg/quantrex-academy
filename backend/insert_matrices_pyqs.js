import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Pyq } from './models/schemas.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedMatrices() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const dataPath = path.join(__dirname, '../public/data/questions/matrices-and-determinants.json');
    if (!fs.existsSync(dataPath)) {
      console.error('File not found:', dataPath);
      process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const questions = JSON.parse(rawData);

    console.log(`Found ${questions.length} questions in JSON.`);

    console.log('Clearing old matrices-and-determinants questions...');
    await Pyq.deleteMany({ chapterId: 'matrices-and-determinants' });

    console.log('Inserting new matrices-and-determinants questions...');
    await Pyq.insertMany(questions);

    console.log('Success! All matrices-and-determinants questions seeded.');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedMatrices();
