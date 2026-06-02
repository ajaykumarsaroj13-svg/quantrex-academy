import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Pyq, PyqChapter } from './models/schemas.js';

dotenv.config({ path: 'frontend/.env' });
const MONGODB_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:db_XWfpIXXO7RPitii9@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0";

// Helper to sanitize chapter string
const getSlug = (str) => {
  if (!str) return 'misc';
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

const getTitleCase = (str) => {
  if (!str) return 'Miscellaneous';
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

async function importNdaChapterwise() {
  if (!MONGODB_URI) throw new Error("No MONGODB_URI");
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const baseDir = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/data/scraped_questions/nda";
  const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));

  const chaptersMap = new Map(); 
  const allPyqs = [];

  for (const file of files) {
    const filePath = path.join(baseDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const results = data.results || [];
    for (const res of results) {
      const questions = res.questions || [];
      for (const q of questions) {
        if (!q.question || !q.question.en || !q.question.en.content) continue;

        let subject = (q.subject || '').toLowerCase().trim();
        if (subject === 'mathematics') subject = 'mathematics';
        else if (subject === 'english') subject = 'english';
        else if (subject === 'general-science') subject = 'general-science';
        else if (subject === 'general-studies') subject = 'general-studies';
        else subject = 'general-ability';

        const chapterSlug = getSlug(q.chapter);
        const chapterId = `nda_${subject}_${chapterSlug}`;
        
        if (!chaptersMap.has(chapterId)) {
          chaptersMap.set(chapterId, {
            id: chapterId,
            name: getTitleCase(q.chapter),
            subject: subject,
            count: 0,
            weightage: '5%'
          });
        }
        
        const ch = chaptersMap.get(chapterId);
        ch.count += 1;

        const options = (q.question.en.options || []).map(o => o.content);
        const correctOptLetter = q.question.en.correct_options && q.question.en.correct_options.length > 0 ? q.question.en.correct_options[0] : 'A';
        const correctIndex = correctOptLetter.charCodeAt(0) - 65;

        allPyqs.push({
          id: `nda_${q.question_id || Date.now() + Math.random().toString()}`,
          chapterId: chapterId,
          title: `NDA ${q.year || 'PYQ'}`,
          year: String(q.year || '2024'),
          difficulty: q.difficulty || 'Medium',
          type: 'MCQ',
          question: q.question.en.content,
          options: options,
          correctOptionIndex: correctIndex >= 0 && correctIndex < 4 ? correctIndex : 0,
          solution: q.question.en.explanation || 'No solution provided.',
          marks: q.marks || 4,
          negativeMarks: q.negMarks || -1,
          topic: getTitleCase(q.topic) || getTitleCase(q.chapter)
        });
      }
    }
  }

  console.log(`Found ${chaptersMap.size} chapters and ${allPyqs.length} questions.`);

  const newChapters = Array.from(chaptersMap.values());
  
  const existingNdaChapters = await PyqChapter.find({ id: { $regex: '^nda_' } });
  console.log(`Found ${existingNdaChapters.length} existing NDA chapters to clear.`);
  await PyqChapter.deleteMany({ id: { $regex: '^nda_' } });
  await Pyq.deleteMany({ id: { $regex: '^nda_' } });

  await PyqChapter.insertMany(newChapters);
  console.log('Inserted Chapters.');

  const BATCH_SIZE = 1000;
  for (let i = 0; i < allPyqs.length; i += BATCH_SIZE) {
    const batch = allPyqs.slice(i, i + BATCH_SIZE);
    await Pyq.insertMany(batch);
    console.log(`Inserted batch ${i/BATCH_SIZE + 1}`);
  }

  console.log('Done!');
  process.exit(0);
}

importNdaChapterwise().catch(console.error);


