import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FullTestSeries } from './models/schemas.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = 'https://raw.githubusercontent.com/Samkarya/online-exam-questions/main';

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
}

function detectSubject(q) {
  const s = (q.subject || q.section_name || q.section || '').toLowerCase();
  if (s.includes('physics') || s.includes('phy')) return 'Physics';
  if (s.includes('chem')) return 'Chemistry';
  if (s.includes('math') || s.includes('maths')) return 'Mathematics';
  // Try to guess from question number
  return 'General';
}

function optionsToArray(opts) {
  if (!opts) return [];
  if (Array.isArray(opts)) return opts;
  // Object format: {a: '...', b: '...', c: '...', d: '...'}
  return ['a', 'b', 'c', 'd'].map(k => opts[k] || opts[k.toUpperCase()] || '').filter(Boolean);
}

function getCorrectOption(q, optionsArray) {
  const ca = q.correct_answer !== undefined ? String(q.correct_answer).trim() : '';
  if (!ca) return -1;
  // Letter format: A, B, C, D
  const letterIdx = ['A','B','C','D'].indexOf(ca.toUpperCase());
  if (letterIdx !== -1) return letterIdx;
  // Number format: 0,1,2,3
  if (!isNaN(ca)) return parseInt(ca);
  // Try matching option text
  const textIdx = optionsArray.findIndex(o => o === ca);
  if (textIdx !== -1) return textIdx;
  return -1;
}

function mapQuestion(q, globalIdx) {
  const subject = detectSubject(q);
  const qType = (q.question_type || '').toLowerCase();
  const questionType = (qType === 'numerical' || qType === 'integer' || qType === 'num') ? 'NUMERICAL' : 'MCQ';
  const optionsArray = optionsToArray(q.options);
  const correctOption = questionType === 'MCQ' ? getCorrectOption(q, optionsArray) : undefined;
  const correctAnswer = questionType === 'NUMERICAL' ? String(q.correct_answer || '') : undefined;

  return {
    questionNumber: (q.question_number || globalIdx + 1),
    subject,
    section: q.section || (questionType === 'NUMERICAL' ? 'B' : 'A'),
    questionText: q.question_text || q.question || '',
    options: optionsArray,
    correctOption: questionType === 'MCQ' ? correctOption : undefined,
    correctAnswer,
    questionType,
    marks: 4,
    negativeMarks: questionType === 'MCQ' ? -1 : 0,
    solution: q.solution || q.explanation || '',
    topic: q.topic || q.chapter || 'General',
    difficulty: q.difficulty || 'Medium'
  };
}

async function fetchAndImportTest(paper) {
  try {
    const url = `${BASE_URL}/${paper.path}`;
    console.log(`Fetching: ${paper.title}...`);
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  SKIP ${paper.title} (HTTP ${res.status})`);
      return false;
    }
    const rawQuestions = await res.json();
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      console.log(`  SKIP ${paper.title} (empty)`);
      return false;
    }

    const mappedQuestions = rawQuestions.map((q, idx) => mapQuestion(q, idx));

    // Assign subjects by position if all are 'General' (fallback for mixed papers)
    const allGeneral = mappedQuestions.every(q => q.subject === 'General');
    if (allGeneral && mappedQuestions.length === 75) {
      // NTA pattern: Q1-25 Physics, Q26-50 Chemistry, Q51-75 Maths
      mappedQuestions.forEach((q, i) => {
        if (i < 25) q.subject = 'Physics';
        else if (i < 50) q.subject = 'Chemistry';
        else q.subject = 'Mathematics';
        // Sections: Q1-20 & Q26-45 & Q51-70 = Section A (MCQ), rest = Section B (Numerical)
        const posInSubject = i % 25;
        if (posInSubject >= 20) {
          q.section = 'B';
          q.questionType = 'NUMERICAL';
          q.negativeMarks = 0;
        }
      });
    }

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

    const examType = (() => {
      const cat = (paper.category || '').toLowerCase();
      if (cat.includes('advanced')) return 'JEE Advanced';
      if (cat.includes('nda')) return 'NDA';
      if (cat.includes('bitsat')) return 'BITSAT';
      if (cat.includes('ncert') && cat.includes('11')) return 'NCERT 11';
      if (cat.includes('ncert') && cat.includes('12')) return 'NCERT 12';
      return 'JEE Main';
    })();

    const doc = {
      id: paper.id,
      title: paper.title,
      exam: examType,
      year: paper.year || null,
      session: paper.session || null,
      shift: paper.shift ? parseInt(paper.shift) : null,
      date: paper.date || null,
      paperType: paper.paperType || 'Paper 1 (PCM)',
      durationMinutes: examType === 'JEE Advanced' ? 180 : 180,
      totalMarks: mappedQuestions.reduce((s, q) => s + q.marks, 0) || 300,
      totalQuestions: mappedQuestions.length,
      sections,
      questions: mappedQuestions,
      isOfficial: paper.isOfficial !== false,
      description: paper.short_description || paper.description || '',
      isFree: true
    };

    await FullTestSeries.findOneAndUpdate(
      { id: paper.id },
      doc,
      { upsert: true, new: true }
    );
    console.log(`  ✅ ${paper.title} — ${mappedQuestions.length} questions`);
    return true;
  } catch (err) {
    console.error(`  ❌ Error: ${paper.title}: ${err.message}`);
    return false;
  }
}

async function main() {
  await connectDB();

  let totalSuccess = 0;
  let totalFail = 0;

  // 1. JEE Main
  console.log('\n📚 Fetching JEE Main papers...');
  try {
    const r = await fetch(`${BASE_URL}/configs/jee.json`);
    const cfg = await r.json();
    console.log(`Found ${cfg.length} JEE Main papers`);
    for (const p of cfg) {
      const ok = await fetchAndImportTest(p);
      if (ok) totalSuccess++; else totalFail++;
      await new Promise(r => setTimeout(r, 300));
    }
  } catch(e) { console.log('JEE config error:', e.message); }

  // 2. Try additional exam configs
  const extras = [
    'configs/jee-advanced.json',
    'configs/jee_advanced.json',
    'India/undergraduate/JEEAdvanced/config.json',
    'configs/nda.json',
    'configs/bitsat.json',
  ];
  for (const cfgPath of extras) {
    try {
      const r = await fetch(`${BASE_URL}/${cfgPath}`);
      if (!r.ok) continue;
      const cfg = await r.json();
      const papers = Array.isArray(cfg) ? cfg : Object.values(cfg);
      console.log(`\n📚 Found ${papers.length} papers in ${cfgPath}`);
      for (const p of papers) {
        const ok = await fetchAndImportTest(p);
        if (ok) totalSuccess++; else totalFail++;
        await new Promise(r => setTimeout(r, 300));
      }
    } catch(e) { /* skip */ }
  }

  const total = await FullTestSeries.countDocuments();
  console.log(`\n🎉 DONE! Total: ${totalSuccess} imported, ${totalFail} failed`);
  console.log(`📊 Total test series in MongoDB: ${total}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
