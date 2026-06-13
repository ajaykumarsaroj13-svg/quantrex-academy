/**
 * seed_blackbook.js
 * Reads blackBookDataFull.json and upserts all data into MongoDB.
 * Run: node seed_blackbook.js
 */
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Schema ─────────────────────────────────────────────────────────────────
const BlackBookQuestionSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true },  // "Exercise 1" ... "Exercise 5"
  exerciseNo:   { type: String },                   // "1.1" ... "1.5"
  questionIndex: { type: Number },                  // 0-based index within exercise
  text:         { type: String, required: true },   // HTML/LaTeX question text
  options:      [{ type: String }],                 // MCQ options (HTML/LaTeX)
  correctOption:  { type: Number, default: -1 },    // 0-indexed correct option (-1 = N/A)
  correctOptionsArray: [{ type: Number }],          // For multi-correct (Ex2)
  answerKeyStr: { type: String },                   // For matching/subjective (Ex4/Ex5)
  solution:     { type: String },                   // Detailed solution
  has_graph:    { type: Boolean, default: false },
  imageUrl:     { type: String },
  typeLabel:    { type: String },
}, { timestamps: true });

const BlackBookChapterSchema = new mongoose.Schema({
  id:           { type: String, required: true, unique: true },  // e.g. "function"
  title:        { type: String, required: true },
  book:         { type: String, default: 'Black Book' },
  subject:      { type: String, default: 'Mathematics' },
  exercises: [{
    exerciseNo:   String,
    exerciseName: String,
    totalQuestions: Number,
  }],
  totalQuestions: { type: Number, default: 0 },
}, { timestamps: true });

const BlackBookProgressSchema = new mongoose.Schema({
  userId:       { type: String, required: true },
  chapterId:    { type: String, required: true },
  exerciseName: { type: String, required: true },
  questionIndex:{ type: Number, required: true },
  selectedIdx:  { type: Number, default: -1 },
  isChecked:    { type: Boolean, default: false },
  isCorrect:    { type: mongoose.Schema.Types.Mixed }, // true/false/null
  revealed:     { type: Boolean, default: false },
  seenAt:       { type: Date, default: Date.now },
}, { timestamps: true });
BlackBookProgressSchema.index({ userId: 1, chapterId: 1, exerciseName: 1, questionIndex: 1 }, { unique: true });

const BlackBookQuestion = mongoose.model('BlackBookQuestion', BlackBookQuestionSchema);
const BlackBookChapter  = mongoose.model('BlackBookChapter',  BlackBookChapterSchema);
const BlackBookProgress = mongoose.model('BlackBookProgress', BlackBookProgressSchema);

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌ MONGODB_URI not set in .env'); process.exit(1); }

  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected.');

  // Load JSON
  const jsonPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\final_combined_data.json';
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ blackBookDataFull.json not found at:', jsonPath);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Clear existing questions and chapters for safety, since we might reseed
  await BlackBookChapter.deleteMany({});
  await BlackBookQuestion.deleteMany({});
  console.log(`🗑️  Cleared existing BlackBookQuestion and BlackBookChapter documents.`);

  let totalQuestionsSeeded = 0;

  for (const chapter of rawData) {
    console.log(`\n📖 Processing chapter: ${chapter.title}`);
    const questions = chapter.questions || [];

    // Group by exercise
    const exerciseMap = {};
    questions.forEach((q, idx) => {
      const ex = q.exerciseName || 'Exercise 1';
      if (!exerciseMap[ex]) exerciseMap[ex] = [];
      exerciseMap[ex].push({ ...q, questionIndex: idx });
    });

    // Upsert chapter document
    const exerciseSummary = Object.entries(exerciseMap).map(([exName, qs]) => ({
      exerciseNo: exName.replace('Exercise ', '1.'), // we can leave this as 1.x or parse it better, but fine for now
      exerciseName: exName,
      totalQuestions: qs.length,
    }));

    await BlackBookChapter.findOneAndUpdate(
      { id: chapter.id || 'function' },
      {
        id: chapter.id || 'function',
        title: chapter.title || 'Function',
        book: 'Black Book',
        subject: 'Mathematics',
        exercises: exerciseSummary,
        totalQuestions: questions.length,
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Chapter ${chapter.title} saved.`);

    // Insert questions in batches
    const docs = [];
    Object.entries(exerciseMap).forEach(([exName, qs]) => {
      qs.forEach((q, localIdx) => {
        docs.push({
          chapterId:     chapter.id || 'function',
          exerciseName:  exName,
          exerciseNo:    exName.replace('Exercise ', '1.'),
          questionIndex: localIdx,
          text:          q.text || 'Question text missing',
          options:       q.options || [],
          correctOption: q.correctOption !== undefined ? q.correctOption : -1,
          correctOptionsArray: q.correctOptionsArray || [],
          answerKeyStr:  q.answerKeyStr || null,
          solution:      q.solution || null,
          has_graph:     q.has_graph || false,
          imageUrl:      q.imageUrl || null,
          typeLabel:     q.typeLabel || null,
        });
      });
    });

    const BATCH = 100;
    for (let i = 0; i < docs.length; i += BATCH) {
      await BlackBookQuestion.insertMany(docs.slice(i, i + BATCH));
      console.log(`  ✅ Inserted questions ${i + 1} – ${Math.min(i + BATCH, docs.length)} for ${chapter.title}`);
    }

    totalQuestionsSeeded += docs.length;
  }

  console.log(`\n🎉 Done! Total questions seeded: ${totalQuestionsSeeded}`);

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
