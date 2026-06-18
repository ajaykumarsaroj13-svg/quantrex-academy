import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env from parent dir
dotenv.config({ path: path.join('..', '.env') });

const ROOT = path.resolve('..');

// ── Schemas (matching api/index.js) ──
const TestSeriesQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  subject: { type: String, required: true },
  section: { type: String, default: 'A' },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctOption: { type: Number },
  correctAnswer: { type: String },
  questionType: { type: String, enum: ['MCQ', 'NUMERICAL'], default: 'MCQ' },
  marks: { type: Number, default: 4 },
  negativeMarks: { type: Number, default: -1 },
  solution: { type: String, default: '' },
  topic: { type: String, default: 'General' },
  difficulty: { type: String, default: 'Medium' }
});

const FullTestSeriesSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  exam: { type: String, required: true },
  year: { type: Number },
  session: { type: String },
  shift: { type: Number },
  date: { type: String },
  paperType: { type: String, default: 'Paper 1 (PCM)' },
  durationMinutes: { type: Number, default: 180 },
  totalMarks: { type: Number, default: 300 },
  totalQuestions: { type: Number, default: 75 },
  sections: [{ name: String, totalQuestions: Number, sectionACount: Number, sectionBCount: Number }],
  questions: [TestSeriesQuestionSchema],
  isOfficial: { type: Boolean, default: true },
  description: { type: String, default: '' },
  isFree: { type: Boolean, default: true }
}, { timestamps: true });

const PyqChapterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  subject: String,
  questionCount: Number,
  topicCount: Number,
  topics: [String],
  chapterGroup: String,
  exams: [String],
});

const PyqSchema = new mongoose.Schema({
  question_id: { type: String, required: true },
  chapterId: { type: String, required: true, index: true },
  subject: String,
  chapter: String,
  chapterGroup: String,
  topic: String,
  exam: String,
  examGroup: String,
  paperId: String,
  paperTitle: String,
  year: Number,
  difficulty: String,
  type: String,
  marks: Number,
  negMarks: Number,
  isBonus: Boolean,
  isOutOfSyllabus: Boolean,
  permalink: String,
  question: mongoose.Schema.Types.Mixed,
  tags: [String],
  options: [String],
  correctOptionIndex: Number,
  solution: String
});

const FullTestSeries = mongoose.model('FullTestSeries', FullTestSeriesSchema);
const PyqChapter = mongoose.model('PyqChapter', PyqChapterSchema);
const Pyq = mongoose.model('Pyq', PyqSchema);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear
  await FullTestSeries.deleteMany({});
  await PyqChapter.deleteMany({});
  await Pyq.deleteMany({});
  console.log('Cleared existing collections');

  // ═══════ 1. SEED TEST SERIES ═══════
  const testsDir = path.join(ROOT, 'public', 'data', 'tests');
  const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${testFiles.length} test files`);

  let inserted = 0, skipped = 0;
  for (const file of testFiles) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(testsDir, file), 'utf-8'));
      
      // Map examType → exam
      const doc = {
        id: raw.id || file.replace('.json', ''),
        title: raw.title || raw.name || 'Untitled',
        exam: raw.exam || raw.examType || 'JEE Main',
        year: parseInt(raw.year) || 2024,
        session: raw.session || '',
        shift: raw.shift || undefined,
        date: raw.date || raw.examDate || '',
        paperType: raw.paperType || 'Paper 1 (PCM)',
        durationMinutes: raw.durationMinutes || raw.duration || 180,
        totalMarks: raw.totalMarks || raw.marks || 300,
        totalQuestions: raw.totalQuestions || (raw.questions?.length) || 75,
        sections: raw.sections || [],
        isOfficial: raw.isOfficial !== undefined ? raw.isOfficial : true,
        description: raw.description || '',
        isFree: raw.isFree !== undefined ? raw.isFree : true,
        questions: (raw.questions || []).map((q, idx) => ({
          questionNumber: q.questionNumber || (idx + 1),
          subject: q.subject || 'General',
          section: q.section || 'A',
          questionText: q.questionText || q.question || q.text || 'No question text',
          options: q.options || [],
          correctOption: q.correctOption,
          correctAnswer: q.correctAnswer != null ? String(q.correctAnswer) : undefined,
          questionType: q.questionType || (q.type === 'numerical' ? 'NUMERICAL' : 'MCQ'),
          marks: q.marks || 4,
          negativeMarks: q.negativeMarks ?? -1,
          solution: q.solution || '',
          topic: q.topic || 'General',
          difficulty: q.difficulty || 'Medium'
        }))
      };

      await FullTestSeries.create(doc);
      inserted++;
      if (inserted % 50 === 0) console.log(`  ... inserted ${inserted} test series`);
    } catch (err) {
      skipped++;
      if (skipped <= 3) console.error(`  ⚠ Skipping ${file}:`, err.message?.slice(0, 120));
    }
  }
  console.log(`✅ Inserted ${inserted} test series (${skipped} skipped)`);

  // ═══════ 2. SEED PYQ CHAPTERS ═══════
  const chaptersFile = path.join(ROOT, 'public', 'data', 'pyq-chapters.json');
  if (fs.existsSync(chaptersFile)) {
    const chapters = JSON.parse(fs.readFileSync(chaptersFile, 'utf-8'));
    const arr = Array.isArray(chapters) ? chapters : Object.values(chapters).flat();
    if (arr.length > 0) {
      await PyqChapter.insertMany(arr, { ordered: false }).catch(() => {});
      console.log(`✅ Inserted ${arr.length} PyqChapters`);
    }
  } else {
    console.log('⚠ No pyq-chapters.json found');
  }

  // ═══════ 3. SEED PYQ QUESTIONS ═══════
  const questionsDir = path.join(ROOT, 'public', 'data', 'questions');
  if (fs.existsSync(questionsDir)) {
    const qFiles = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${qFiles.length} question files`);
    let totalQs = 0;
    for (const qf of qFiles) {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(questionsDir, qf), 'utf-8'));
        const chapterId = qf.replace('.json', '');
        
        // Handle both formats: {topics, questions} or flat array
        let questions = [];
        if (raw.topics && raw.questions && !Array.isArray(raw.questions)) {
          // {topics: [...], questions: {topicId: [...]}}
          for (const [topicId, qs] of Object.entries(raw.questions)) {
            for (const q of qs) {
              q.topic = q.topic || topicId;
              q.chapterId = chapterId;
              q.question_id = q.question_id || q.id || `${chapterId}_${Math.random().toString(36).slice(2)}`;
              questions.push(q);
            }
          }
        } else {
          const arr = Array.isArray(raw) ? raw : (raw.data || []);
          questions = arr.map(q => ({
            ...q,
            chapterId,
            question_id: q.question_id || q.id || `${chapterId}_${Math.random().toString(36).slice(2)}`
          }));
        }

        if (questions.length > 0) {
          await Pyq.insertMany(questions, { ordered: false }).catch(() => {});
          totalQs += questions.length;
        }
      } catch (err) {
        // skip bad files
      }
    }
    console.log(`✅ Inserted ${totalQs} PYQ questions`);
  } else {
    console.log('⚠ No questions directory found');
  }

  await mongoose.disconnect();
  console.log('\n🎉 Seeding complete!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
