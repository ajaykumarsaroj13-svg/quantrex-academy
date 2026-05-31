import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Pyq, PyqChapter } from './models/schemas.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const dataPath = path.join(__dirname, '../frontend/src/utils/dummyPyqsData.json');
    if (!fs.existsSync(dataPath)) {
      console.error('dummyPyqsData.json not found!');
      process.exit(1);
    }

    console.log('Reading 15MB JSON file...');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const pyqData = JSON.parse(rawData);

    const questions = pyqData.PYQ_DATABASE || [];
    const chaptersObj = pyqData.PYQ_CHAPTERS || {};

    console.log(`Found ${questions.length} questions.`);

    console.log('Clearing existing Pyq and PyqChapter collections...');
    await Pyq.deleteMany({});
    await PyqChapter.deleteMany({});

    console.log('Inserting Chapters...');
    const chaptersToInsert = [];
    for (const [subject, chArray] of Object.entries(chaptersObj)) {
      if (Array.isArray(chArray)) {
        for (const ch of chArray) {
          chaptersToInsert.push({
            id: ch.id,
            name: ch.name,
            subject: subject,
            count: ch.count || 0,
            weightage: ch.weightage || '5%'
          });
        }
      }
    }
    
    await PyqChapter.insertMany(chaptersToInsert);
    console.log(`Inserted ${chaptersToInsert.length} chapters.`);

    console.log('Inserting Questions in batches...');
    const BATCH_SIZE = 1000;
    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE).map(q => ({
        id: q.id,
        chapterId: q.chapterId,
        title: q.title || `PYQ ${q.year}`,
        year: q.year || '2024',
        difficulty: q.difficulty || 'Medium',
        type: q.type || 'SCQ',
        question: q.question,
        options: q.options || [],
        correctOptionIndex: q.correctOptionIndex,
        solution: q.solution,
        marks: q.marks || 4,
        negativeMarks: q.negativeMarks || -1,
        topic: q.topic || 'General'
      }));
      await Pyq.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(questions.length / BATCH_SIZE)}`);
    }

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
