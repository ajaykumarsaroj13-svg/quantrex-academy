import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { FullTestSeries } from './models/schemas.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const outBaseDir = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/data/scraped_questions";

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
}

function mapSubject(s) {
  const sl = (s || '').toLowerCase();
  if (sl.includes('physics') || sl.includes('phy')) return 'Physics';
  if (sl.includes('chemistry') || sl.includes('chem')) return 'Chemistry';
  if (sl.includes('math') || sl.includes('mathematics')) return 'Mathematics';
  return 'General';
}

function mapDifficulty(d) {
  const dl = (d || '').toLowerCase();
  if (dl === 'easy') return 'Easy';
  if (dl === 'hard') return 'Hard';
  return 'Medium';
}

function mapExamType(examKey) {
  if (examKey === 'jee-main') return 'JEE Main';
  if (examKey === 'jee-advanced') return 'JEE Advanced';
  if (examKey === 'bitsat') return 'BITSAT';
  if (examKey === 'nda') return 'NDA';
  if (examKey.startsWith('physics-xi') || examKey.startsWith('chemistry-xi') || examKey.startsWith('mathematics-xi') || examKey.startsWith('biology-xi')) {
    return 'NCERT 11';
  }
  return 'NCERT 12';
}

function parseYear(paperKey) {
  const match = paperKey.match(/\d{4}/);
  return match ? parseInt(match[0]) : null;
}

function getCorrectOption(correctOpts) {
  if (!correctOpts || correctOpts.length === 0) return -1;
  const letter = String(correctOpts[0]).trim().toUpperCase();
  const idx = ['A', 'B', 'C', 'D', 'E'].indexOf(letter);
  return idx >= 0 ? idx : -1;
}

async function migrateExams() {
  await connectDB();
  
  if (!fs.existsSync(outBaseDir)) {
    console.log('Scraped directory does not exist yet.');
    process.exit(0);
  }
  
  const folders = fs.readdirSync(outBaseDir);
  console.log('Scraping directories:', folders);
  
  let totalImported = 0;
  
  // 1. Migrate Exam Papers (jee-main, jee-advanced, bitsat, nda, class-12)
  for (const folder of folders) {
    if (folder === 'ncert') continue;
    
    const folderPath = path.join(outBaseDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
    console.log(`\nImporting ${files.length} papers from ${folder}...`);
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const paperKey = file.replace('.json', '');
      
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!raw.results || raw.results.length === 0) continue;
        
        let globalIdx = 0;
        const mappedQuestions = [];
        
        // Loop over subjects and questions
        for (const subjGroup of raw.results) {
          const subject = mapSubject(subjGroup.title);
          const qsList = subjGroup.questions || [];
          
          for (const q of qsList) {
            const en = q.question?.en || {};
            const qType = (q.type || '').toLowerCase();
            const questionType = (qType === 'integer' || qType === 'numerical' || qType === 'num') ? 'NUMERICAL' : 'MCQ';
            
            const options = (en.options || []).map(o => {
              if (typeof o === 'object') return o.content || '';
              return String(o || '');
            });
            
            const correctOption = questionType === 'MCQ' ? getCorrectOption(en.correct_options) : undefined;
            const correctAnswer = questionType === 'NUMERICAL' ? String(en.answer || '') : undefined;
            
            mappedQuestions.push({
              questionNumber: ++globalIdx,
              subject,
              section: questionType === 'NUMERICAL' ? 'B' : 'A',
              questionText: [en.direction, en.comprehension, en.content].filter(Boolean).join('<br/><br/>'),
              options,
              correctOption,
              correctAnswer,
              questionType,
              marks: q.marks || 4,
              negativeMarks: questionType === 'MCQ' ? -(Math.abs(q.negMarks || 1)) : 0,
              solution: en.explanation || '',
              topic: q.topic || q.chapter || 'General',
              difficulty: mapDifficulty(q.difficulty)
            });
          }
        }
        
        if (mappedQuestions.length === 0) continue;
        
        // Determine sections configuration
        const subjects = ['Physics', 'Chemistry', 'Mathematics'];
        const sections = subjects.map(subj => {
          const sq = mappedQuestions.filter(q => q.subject === subj);
          const mcqs = sq.filter(q => q.questionType === 'MCQ').length;
          const nums = sq.filter(q => q.questionType === 'NUMERICAL').length;
          return {
            name: subj,
            totalQuestions: sq.length,
            sectionACount: mcqs,
            sectionBCount: nums,
            attemptRequired: nums > 0 ? Math.min(5, nums) : 0
          };
        }).filter(s => s.totalQuestions > 0);
        
        const examType = mapExamType(folder);
        
        const doc = {
          id: paperKey,
          title: paperKey.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          exam: examType,
          year: parseYear(paperKey),
          session: paperKey.includes('jan') ? 'January' : (paperKey.includes('apr') ? 'April' : null),
          shift: paperKey.includes('morning') || paperKey.includes('shift-1') || paperKey.includes('shift1') ? 1 : (paperKey.includes('evening') || paperKey.includes('shift-2') || paperKey.includes('shift2') ? 2 : null),
          date: null,
          paperType: examType === 'JEE Advanced' ? (paperKey.includes('paper-2') ? 'Paper 2 (PCM)' : 'Paper 1 (PCM)') : 'Paper 1 (PCM)',
          durationMinutes: examType === 'JEE Advanced' ? 180 : 180,
          totalMarks: mappedQuestions.reduce((s, q) => s + q.marks, 0) || 300,
          totalQuestions: mappedQuestions.length,
          sections,
          questions: mappedQuestions,
          isOfficial: true,
          description: `Previous Year Official Question Paper of ${examType} (${paperKey})`,
          isFree: true
        };
        
        await FullTestSeries.findOneAndUpdate(
          { id: paperKey },
          doc,
          { upsert: true, new: true }
        );
        totalImported++;
        
      } catch (err) {
        console.error(`  ❌ Failed to migrate paper ${paperKey}: ${err.message}`);
      }
    }
  }
  
  // 2. Migrate NCERT Section Tests
  const ncertDir = path.join(outBaseDir, 'ncert');
  if (fs.existsSync(ncertDir)) {
    const files = fs.readdirSync(ncertDir).filter(f => f.endsWith('.json'));
    console.log(`\nImporting ${files.length} NCERT book sections...`);
    
    for (const file of files) {
      const filePath = path.join(ncertDir, file);
      const testId = file.replace('.json', '');
      
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!raw.results || raw.results.length === 0) continue;
        
        const mappedQuestions = [];
        let globalIdx = 0;
        
        for (const q of raw.results) {
          const en = q.question?.en || {};
          const qType = (q.type || '').toLowerCase();
          const questionType = (qType === 'integer' || qType === 'numerical' || qType === 'num') ? 'NUMERICAL' : 'MCQ';
          
          const options = (en.options || []).map(o => {
            if (typeof o === 'object') return o.content || '';
            return String(o || '');
          });
          
          const correctOption = questionType === 'MCQ' ? getCorrectOption(en.correct_options) : undefined;
          const correctAnswer = questionType === 'NUMERICAL' ? String(en.answer || '') : undefined;
          
          mappedQuestions.push({
            questionNumber: ++globalIdx,
            subject: mapSubject(q.book || q.subject || 'General'),
            section: questionType === 'NUMERICAL' ? 'B' : 'A',
            questionText: [en.direction, en.comprehension, en.content].filter(Boolean).join('<br/><br/>'),
            options,
            correctOption,
            correctAnswer,
            questionType,
            marks: q.marks || 4,
            negativeMarks: questionType === 'MCQ' ? -(Math.abs(q.negMarks || 0)) : 0,
            solution: en.explanation || '',
            topic: q.chapter || 'General',
            difficulty: mapDifficulty(q.difficulty)
          });
        }
        
        if (mappedQuestions.length === 0) continue;
        
        const examType = mapExamType(testId);
        const title = testId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        
        const doc = {
          id: testId,
          title,
          exam: examType,
          year: null,
          session: null,
          shift: null,
          date: null,
          paperType: 'Chapter Test',
          durationMinutes: Math.ceil(mappedQuestions.length * 2.5) || 60,
          totalMarks: mappedQuestions.reduce((s, q) => s + q.marks, 0) || 100,
          totalQuestions: mappedQuestions.length,
          sections: [{
            name: 'General',
            totalQuestions: mappedQuestions.length,
            sectionACount: mappedQuestions.filter(q => q.questionType === 'MCQ').length,
            sectionBCount: mappedQuestions.filter(q => q.questionType === 'NUMERICAL').length,
            attemptRequired: 0
          }],
          questions: mappedQuestions,
          isOfficial: false,
          description: `NCERT Textbook Exemplar Questions for Chapter: ${title}`,
          isFree: true
        };
        
        await FullTestSeries.findOneAndUpdate(
          { id: testId },
          doc,
          { upsert: true, new: true }
        );
        totalImported++;
        
      } catch (err) {
        console.error(`  ❌ Failed to migrate NCERT test ${testId}: ${err.message}`);
      }
    }
  }
  
  const finalCount = await FullTestSeries.countDocuments();
  console.log(`\n🎉 MIGRATION DONE! Imported/Updated: ${totalImported} test series entries.`);
  console.log(`📊 Total test series now in MongoDB FullTestSeries: ${finalCount}`);
  process.exit(0);
}

migrateExams().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
