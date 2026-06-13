import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
  console.error("Please set MONGODB_URI in your .env file");
  process.exit(1);
}

// Schemas
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

const PyqChapter = mongoose.models.PyqChapter || mongoose.model('PyqChapter', PyqChapterSchema);
const Pyq = mongoose.models.Pyq || mongoose.model('Pyq', PyqSchema);
const FullTestSeries = mongoose.models.FullTestSeries || mongoose.model('FullTestSeries', FullTestSeriesSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing to avoid duplicates during migration
  await FullTestSeries.deleteMany({});
  await PyqChapter.deleteMany({});
  await Pyq.deleteMany({});
  console.log('Cleared existing collections');

  const publicDataPath = path.join(__dirname, '../public/data');

  // 1. Seed Chapters
  const chaptersFile = path.join(publicDataPath, 'chapters.json');
  if (fs.existsSync(chaptersFile)) {
    const chaptersData = JSON.parse(fs.readFileSync(chaptersFile, 'utf-8'));
    let chapterDocs = [];
    for (const [subject, chapters] of Object.entries(chaptersData)) {
      for (const ch of chapters) {
        chapterDocs.push({
          id: ch.id || ch.url.split('/').pop(),
          name: ch.name,
          subject: subject,
          questionCount: ch.count || 0,
          exams: (ch.exams || []).map(e => e === 'JEE Main' ? 'jee-main' : e === 'JEE Advanced' ? 'jee-advanced' : e.toLowerCase().replace(/\s+/g, '-'))
        });
      }
    }
    await PyqChapter.insertMany(chapterDocs);
    console.log(`Inserted ${chapterDocs.length} PyqChapters`);
  }

  // 2. Seed FullTestSeries
  const testsDir = path.join(publicDataPath, 'tests');
  if (fs.existsSync(testsDir)) {
    const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.json'));
    let testDocs = [];
    for (const file of testFiles) {
      try {
        const testData = JSON.parse(fs.readFileSync(path.join(testsDir, file), 'utf-8'));
        testDocs.push({
          id: testData.id,
          title: testData.title,
          exam: testData.examType || testData.exam,
          year: parseInt(testData.year) || null,
          durationMinutes: testData.duration || 180,
          totalMarks: testData.totalMarks || 300,
          totalQuestions: testData.totalQuestions || 75,
          isOfficial: testData.isOfficial ?? true,
          questions: testData.questions || [],
          sections: testData.sections || []
        });
      } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
      }
    }
    // Chunk insert just in case it's too large
    for (let i = 0; i < testDocs.length; i += 50) {
      await FullTestSeries.insertMany(testDocs.slice(i, i + 50));
    }
    console.log(`Inserted ${testDocs.length} FullTestSeries`);
  }

  // 3. Seed PYQs
  const qsDir = path.join(publicDataPath, 'questions');
  if (fs.existsSync(qsDir)) {
    const qFiles = fs.readdirSync(qsDir).filter(f => f.endsWith('.json'));
    let qCount = 0;
    for (const file of qFiles) {
      try {
        const qsData = JSON.parse(fs.readFileSync(path.join(qsDir, file), 'utf-8'));
        let qDocs = qsData.map(q => ({
          question_id: q.question_id || Math.random().toString(36).substr(2, 9),
          chapterId: q.chapterId || file.replace('.json', ''),
          exam: q.exam,
          year: q.year,
          difficulty: q.difficulty,
          type: q.type,
          marks: q.marks,
          negMarks: q.negativeMarks,
          question: q.question,
          options: q.options || [],
          correctOptionIndex: q.correctOptionIndex,
          correctAnswer: q.correctAnswer,
          solution: q.solution,
          paperTitle: q.title,
          topic: q.topic
        }));
        await Pyq.insertMany(qDocs);
        qCount += qDocs.length;
      } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
      }
    }
    console.log(`Inserted ${qCount} Pyqs`);
  }

  console.log('Migration complete!');
  process.exit(0);
}

run().catch(console.error);
