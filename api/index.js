import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

// =============================================
// MONGOOSE SCHEMAS (matching exact DB structure)
// =============================================

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

// Prevent model re-registration in serverless
const PyqChapter = mongoose.models.PyqChapter || mongoose.model('PyqChapter', PyqChapterSchema);
const Pyq = mongoose.models.Pyq || mongoose.model('Pyq', PyqSchema);
const FullTestSeries = mongoose.models.FullTestSeries || mongoose.model('FullTestSeries', FullTestSeriesSchema);

// =============================================
// DB CONNECTION (cached for serverless)
// =============================================
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  isConnected = true;
}

// Helper to convert friendly exam name to slug
function toExamSlug(exam) {
  if (!exam || exam === 'All') return null;
  if (exam === 'JEE Main') return 'jee-main';
  if (exam === 'JEE Advanced') return 'jee-advanced';
  return exam.toLowerCase().replace(/\s+/g, '-');
}

// =============================================
// PYQ (CHAPTERWISE) ROUTES
// =============================================

app.get('/api/pyqs/chapters', async (req, res) => {
  try {
    await connectDB();
    const { exam } = req.query;
    const filter = {};
    const slug = toExamSlug(exam);
    if (slug) filter.exams = slug;

    const chapters = await PyqChapter.find(filter).lean();
    const grouped = { mathematics: [], physics: [], chemistry: [] };
    for (const ch of chapters) {
      const subj = ch.subject || 'mathematics';
      if (!grouped[subj]) grouped[subj] = [];
      grouped[subj].push(ch);
    }
    // Sort by question count descending
    for (const subj of Object.keys(grouped)) {
      grouped[subj].sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
    }
    res.json(grouped);
  } catch (e) {
    console.error('[/api/pyqs/chapters] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/pyqs/questions', async (req, res) => {
  try {
    await connectDB();
    const { chapterId, exam } = req.query;
    if (!chapterId) return res.status(400).json({ error: 'chapterId required' });
    const filter = { chapterId };
    const slug = toExamSlug(exam);
    if (slug) filter.exam = slug;
    const qs = await Pyq.find(filter).lean();
    res.json(qs);
  } catch (e) {
    console.error('[/api/pyqs/questions] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/pyqs/search', async (req, res) => {
  try {
    await connectDB();
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q required' });
    const words = q.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(w => w.length > 3);
    if (words.length === 0) return res.json([]);
    const conditions = words.map(w => ({ chapterId: { $regex: w, $options: 'i' } }));
    const qs = await Pyq.find({ $or: conditions }).lean();
    res.json(qs);
  } catch (e) {
    console.error('[/api/pyqs/search] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// =============================================
// TEST SERIES ROUTES
// =============================================

app.get('/api/test-series', async (req, res) => {
  try {
    await connectDB();
    const { exam, year } = req.query;
    const filter = {};
    if (exam) filter.exam = exam;
    if (year) filter.year = parseInt(year);
    const tests = await FullTestSeries.find(filter, {
      id: 1, title: 1, exam: 1, year: 1, session: 1, shift: 1,
      date: 1, paperType: 1, durationMinutes: 1, totalMarks: 1,
      totalQuestions: 1, sections: 1, isOfficial: 1, description: 1, isFree: 1
    }).sort({ year: -1, session: 1, shift: 1 }).lean();
    res.json(tests);
  } catch (e) {
    console.error('[/api/test-series] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/test-series/:id', async (req, res) => {
  try {
    await connectDB();
    const test = await FullTestSeries.findOne({ id: req.params.id }).lean();
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (e) {
    console.error('[/api/test-series/:id] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/test-series/:id/submit', async (req, res) => {
  try {
    await connectDB();
    const { answers, timeSpentSeconds } = req.body;
    const test = await FullTestSeries.findOne({ id: req.params.id }).lean();
    if (!test) return res.status(404).json({ error: 'Test not found' });

    let physicsScore = 0, chemScore = 0, mathScore = 0;
    let correct = 0, wrong = 0, skipped = 0;

    const questionResults = test.questions.map(q => {
      const userAnswer = answers[q.questionNumber];
      let isCorrect = false;
      let marksAwarded = 0;

      if (userAnswer === undefined || userAnswer === -1 || userAnswer === '') {
        skipped++;
      } else if (q.questionType === 'MCQ') {
        isCorrect = parseInt(userAnswer) === q.correctOption;
        if (isCorrect) { correct++; marksAwarded = q.marks; }
        else { wrong++; marksAwarded = q.negativeMarks; }
      } else {
        isCorrect = String(userAnswer).trim() === String(q.correctAnswer || '').trim();
        if (isCorrect) { correct++; marksAwarded = q.marks; }
        else { skipped++; }
      }

      if (q.subject === 'Physics') physicsScore += marksAwarded;
      else if (q.subject === 'Chemistry') chemScore += marksAwarded;
      else if (q.subject === 'Mathematics') mathScore += marksAwarded;

      return { questionNumber: q.questionNumber, subject: q.subject, userAnswer, isCorrect, marksAwarded, correctOption: q.correctOption, correctAnswer: q.correctAnswer };
    });

    const totalScore = physicsScore + chemScore + mathScore;
    res.json({
      testId: test.id, title: test.title, totalScore,
      totalMarks: test.totalMarks, correctCount: correct, wrongCount: wrong, skippedCount: skipped,
      physicsScore, chemistryScore: chemScore, mathsScore: mathScore,
      percentile: Math.min(99.9, Math.max(0, (totalScore / test.totalMarks) * 100)).toFixed(1),
      timeSpentSeconds, questionResults
    });
  } catch (e) {
    console.error('[submit] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: 'v3-root-api-fix' });
});

export default app;
