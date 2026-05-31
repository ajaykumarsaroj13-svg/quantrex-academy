import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { User, Course, Order, Test, Result, Notification, PiracyAlert, Syllabus, FullTestSeries, TestAttempt } from './models/schemas.js';
import { paymentRouter } from './routes/paymentRoute.js';
import { getChapters, getPyqs, searchPyqsByChapterTitle, connectDB } from './mongo_pyq_db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize SQLite for PYQs

// PYQ API Routes
app.get('/api/pyqs/chapters', async (req, res) => {
  try {
    const chapters = await getChapters();
    res.json(chapters);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.get('/api/pyqs/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q required' });
    const qs = await searchPyqsByChapterTitle(q);
    res.json(qs);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/pyqs/questions', async (req, res) => {
  try {
    const { chapterId } = req.query;
    if (!chapterId) return res.status(400).json({ error: 'chapterId required' });
    const qs = await getPyqs(chapterId);
    res.json(qs);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// =====================================================
// FULL TEST SERIES API ROUTES
// =====================================================

// Get all test series (list view - no questions loaded)
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
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Get a single test with all questions
app.get('/api/test-series/:id', async (req, res) => {
  try {
    await connectDB();
    const test = await FullTestSeries.findOne({ id: req.params.id }).lean();
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Submit test attempt and get results
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
        // Numerical
        isCorrect = String(userAnswer).trim() === String(q.correctAnswer).trim();
        if (isCorrect) { correct++; marksAwarded = q.marks; }
        else { skipped++; } // No negative for numerical
      }

      const subScore = marksAwarded;
      if (q.subject === 'Physics') physicsScore += subScore;
      else if (q.subject === 'Chemistry') chemScore += subScore;
      else if (q.subject === 'Mathematics') mathScore += subScore;

      return { questionNumber: q.questionNumber, subject: q.subject, userAnswer, isCorrect, marksAwarded, correctOption: q.correctOption, correctAnswer: q.correctAnswer };
    });

    const totalScore = physicsScore + chemScore + mathScore;
    const result = {
      testId: test.id,
      title: test.title,
      totalScore,
      totalMarks: test.totalMarks,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      physicsScore,
      chemistryScore: chemScore,
      mathsScore: mathScore,
      percentile: Math.min(99.9, Math.max(0, (totalScore / test.totalMarks) * 100)).toFixed(1),
      timeSpentSeconds,
      questionResults
    };
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});


app.use(cors());
app.use(express.json());
app.use('/api/payments', paymentRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer Storage for Memory Uploads (Vercel Serverless Compatible)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});


const MONGODB_URI = process.env.MONGODB_URI;
let useRealDb = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('🔗 Connected to MongoDB Atlas successfully.');
      useRealDb = true;
      
      // Seed default courses and tests if database is empty
      seedDefaultData().then(() => {
        syncFromMongoDB();
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error. Running Mock DB fallback.', err);
    });
} else {
  console.log('⚠️ MONGODB_URI not found in env. Running in Standalone Mock DB Mode.');
}

async function seedDefaultData() {
  try {
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      await Course.create([
        {
          title: 'Rank Booster JEE Advanced Mathematics 2027',
          description: 'Master Calculus, Coordinate Geometry, and Algebra with A.K. Sir. Includes video lectures, notes, assignments, and test series.',
          price: 4999,
          originalPrice: 14999,
          coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
          tag: 'JEE Advanced',
          rating: 4.95,
          modules: [
            {
              title: 'Module 1: Differential Calculus',
              chapters: [
                {
                  title: 'Chapter 1: Limits & Continuity',
                  videos: [
                    { title: '1.1 Concept of Limits & Indeterminate Forms', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: '20:15', isDemo: true },
                    { title: '1.2 Sandwich Theorem & L\'Hopital\'s Rule', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: '25:40', isDemo: false }
                  ],
                  pdfs: [
                    { title: 'Limits Standard Formulas Sheet', url: '/pdfs/limits_formulas.pdf', size: '2.4 MB' },
                    { title: 'DPP-01: Limits and Graphing Method', url: '/pdfs/dpp_01.pdf', size: '1.1 MB' }
                  ]
                }
              ]
            }
          ]
        },
        {
          title: 'Complete Algebra & Matrices for JEE Main + Advanced',
          description: 'Comprehensive course covering Matrices, Determinants, Complex Numbers, and Permutations. Designed by Ajay Kumar Saroj (A.K. Sir).',
          price: 3999,
          originalPrice: 9999,
          coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
          tag: 'JEE Main & Advanced',
          rating: 4.88,
          modules: []
        }
      ]);
      console.log('🌱 Seeded default courses in MongoDB.');
    }

    const testCount = await Test.countDocuments();
    if (testCount === 0) {
      await Test.create([
        {
          title: 'Mega Test 01 - Calculus (JEE Advanced Pattern)',
          description: 'Syllabus: Limits, Continuity, Differentiability. Time: 30 minutes, Total Marks: 24. Marking: +4 / -1.',
          durationMinutes: 30,
          questions: [
            {
              questionText: 'Find the limit of lim_{x -> 0} (cos(x))^(1 / x^2).',
              options: ['e', 'e^(-1/2)', 'e^(1/2)', '1'],
              correctOption: 1,
              marks: 4,
              negativeMarks: -1,
              subject: 'Calculus',
              explanation: 'Take logs: ln(y) = (1/x^2) * ln(cos(x)). Expand ln(cos(x)) = ln(1 - x^2/2 + ...) = -x^2/2. So ln(y) -> -1/2. Thus y -> e^(-1/2).'
            },
            {
              questionText: 'If f(x) = |x| + |x-1|, then at x = 0, the function is:',
              options: ['Continuous and differentiable', 'Continuous but not differentiable', 'Discontinuous but differentiable', 'Discontinuous and not differentiable'],
              correctOption: 1,
              marks: 4,
              negativeMarks: -1,
              subject: 'Calculus',
              explanation: 'f(0) = 1. Left limit = 1, Right limit = 1. So continuous. However, left derivative is -2, right derivative is 0, so non-differentiable.'
            }
          ]
        }
      ]);
      console.log('🌱 Seeded default tests in MongoDB.');
    }
  } catch (e) {
    console.error('❌ Failed to seed default data in MongoDB.', e);
  }
}

async function syncFromMongoDB() {
  if (!useRealDb) return;
  try {
    const dbUsers = await User.find({});
    if (dbUsers.length > 0) {
      mockDb.users = dbUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: u.password,
        role: u.role,
        classLevel: u.classLevel,
        targetExam: u.targetExam,
        isBanned: u.isBanned,
        dailyStreak: u.dailyStreak,
        lastActive: u.lastActive ? u.lastActive.toISOString() : new Date().toISOString(),
        attendance: u.attendance,
        purchasedCourses: u.purchasedCourses.map(id => id.toString()),
        sessions: u.sessions.map(s => ({
          sessionId: s.sessionId,
          deviceFingerprint: s.deviceFingerprint,
          ipAddress: s.ipAddress,
          loginTime: s.loginTime
        }))
      }));
    }

    const dbCourses = await Course.find({});
    if (dbCourses.length > 0) {
      mockDb.courses = dbCourses.map(c => ({
        id: c._id.toString(),
        title: c.title,
        description: c.description,
        price: c.price,
        originalPrice: c.originalPrice,
        coverImage: c.coverImage,
        tag: c.tag,
        rating: c.rating,
        modules: c.modules.map(m => ({
          id: m._id ? m._id.toString() : 'mod_' + Math.random().toString(36).substr(2, 9),
          title: m.title,
          chapters: m.chapters.map(ch => ({
            id: ch._id ? ch._id.toString() : 'ch_' + Math.random().toString(36).substr(2, 9),
            title: ch.title,
            videos: ch.videos.map(v => ({ id: v._id ? v._id.toString() : 'v_' + Math.random().toString(36).substr(2, 9), title: v.title, url: v.url, duration: v.duration, isDemo: v.isDemo })),
            pdfs: ch.pdfs.map(p => ({ id: p._id ? p._id.toString() : 'p_' + Math.random().toString(36).substr(2, 9), title: p.title, url: p.url, size: p.size })),
            assignments: ch.assignments || []
          }))
        }))
      }));
    }

    const dbTests = await Test.find({});
    if (dbTests.length > 0) {
      mockDb.tests = dbTests.map(t => ({
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        durationMinutes: t.durationMinutes,
        questions: t.questions.map(q => ({
          id: q._id ? q._id.toString() : 'q_' + Math.random().toString(36).substr(2, 9),
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          subject: q.subject,
          explanation: q.explanation
        }))
      }));
    }

    const dbNotices = await Notification.find({}).sort({ createdAt: -1 });
    if (dbNotices.length > 0) {
      mockDb.notifications = dbNotices.map(n => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.createdAt.toISOString()
      }));
    }

    const dbAlerts = await PiracyAlert.find({}).sort({ createdAt: -1 });
    if (dbAlerts.length > 0) {
      mockDb.piracyAlerts = dbAlerts.map(a => ({
        id: a._id.toString(),
        userId: a.user.toString(),
        userName: 'Aspirant Log',
        type: a.type,
        details: a.details,
        ipAddress: a.ipAddress,
        createdAt: a.createdAt.toISOString()
      }));
    }

    const dbOrders = await Order.find({});
    if (dbOrders.length > 0) {
      mockDb.orders = dbOrders.map(o => ({
        id: o._id.toString(),
        user: o.user.toString(),
        course: o.course.toString(),
        amount: o.amount,
        status: o.status,
        paymentProvider: o.paymentProvider,
        transactionId: o.transactionId,
        createdAt: o.createdAt.toISOString()
      }));
    }

    const dbResults = await Result.find({});
    if (dbResults.length > 0) {
      mockDb.results = dbResults.map(r => ({
        id: r._id.toString(),
        user: r.user.toString(),
        test: r.test.toString(),
        score: r.score,
        totalMarks: r.totalMarks,
        correctAnswers: r.correctAnswers,
        wrongAnswers: r.wrongAnswers,
        skippedAnswers: r.skippedAnswers,
        percentile: r.percentile,
        rank: r.rank,
        createdAt: r.createdAt.toISOString()
      }));
    }

    console.log('🔄 Synced all MongoDB documents into Express memory cache.');
  } catch (e) {
    console.error('❌ Error syncing data from MongoDB.', e);
  }
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'quantrex_super_secret_key_2026';

// IN-MEMORY / LOCAL DATABASE FALLBACK FOR EASY RUNNING
const mockDb = {
  users: [
    {
      id: 'student1',
      name: 'Rohan Sharma',
      email: 'student@quantrex.com',
      phone: '9876543210',
      passwordHash: bcrypt.hashSync('student123', 8),
      role: 'student',
      classLevel: '12th Pass',
      targetExam: 'JEE Advanced 2027',
      purchasedCourses: ['course1'],
      dailyStreak: 12,
      lastActive: new Date().toISOString(),
      attendance: 98,
      isBanned: false,
      sessions: [
        { sessionId: 'sess_1', deviceFingerprint: 'chrome-windows-fingerprint', ipAddress: '192.168.1.1', loginTime: new Date() }
      ]
    },
    {
      id: 'admin1',
      name: 'Ajay Kumar Saroj (A.K. Sir)',
      email: 'admin@quantrex.com',
      phone: '9999999999',
      passwordHash: bcrypt.hashSync('admin123', 8),
      role: 'admin',
      isBanned: false,
      sessions: []
    }
  ],
  courses: [
    {
      id: 'jee-mains',
      title: 'JEE Main Mathematics Suite',
      description: 'Complete syllabus course covering all 20 units of NTA JEE Main Mathematics. Includes notes, DPPs, cheat sheets, and time-based mock tests.',
      price: 0,
      originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      tag: 'JEE Main',
      rating: 4.96,
      modules: []
    },
    {
      id: 'jee-advanced',
      title: 'Ultimate JEE Advanced Mathematics',
      description: 'In-depth rigorous mathematics library for JEE Advanced aspirants. Complex problem solving, calculus modules, vectors, and rank boosting practice tests.',
      price: 0,
      originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      tag: 'JEE Advanced',
      rating: 4.98,
      modules: []
    },
    {
      id: 'mht-cet',
      title: 'MHT-CET Mathematics Preparation',
      description: 'Speed, tricks, and formula-focused mathematics syllabus for MHT-CET aspirants. Quick shortcut lectures and exam mock sheets.',
      price: 0,
      originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      tag: 'MHT-CET',
      rating: 4.85,
      modules: []
    },
    {
      id: 'bitsat',
      title: 'BITSAT Mathematics & Strategy',
      description: 'Time-bound practice and speed mathematics for BITSAT. Solve mock tests, review quick tips and formulas with zero delay.',
      price: 0,
      originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=800&q=80',
      tag: 'BITSAT',
      rating: 4.90,
      modules: []
    },
    {
      id: 'nda',
      title: 'NDA Mathematics Crack Course',
      description: 'Complete guide for UPSC NDA mathematics paper. Features algebraic shortcuts, trig heights/distances, and year-wise PYQs.',
      price: 0,
      originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      tag: 'NDA',
      rating: 4.92,
      modules: []
    },
    {
      id: 'class-12',
      title: 'Class 12th Board Mathematics',
      description: 'Structured course covering relations, functions, inverse trigonometry, matrices, and complete calculus for Class 12th board exams.',
      price: 0,
      originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=800&q=80',
      tag: 'Class 12th Math',
      rating: 4.94,
      modules: []
    },
    {
      id: 'class-11',
      title: 'Class 11th Mathematics & Foundation',
      description: 'Build strong fundamentals in algebra, trigonometry, and coordinate geometry. Designed to ease transition to competitive exams.',
      price: 0,
      originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
      tag: 'Class 11th Math',
      rating: 4.88,
      modules: []
    },
    {
      id: 'class-9',
      title: 'Class 9th Mathematics Foundation',
      description: 'Introduction to advanced concepts, number systems, and polynomials. Lay the groundwork for JEE/NEET prep early.',
      price: 0,
      originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      tag: 'Class 9th Math',
      rating: 4.82,
      modules: []
    },
    {
      id: 'foundation-6-12',
      title: 'Foundation Mathematics (Classes 6-12)',
      description: 'Master standard arithmetic, integers, mensuration, and basic geometry. Perfect revision for classes 6th to 12th.',
      price: 0,
      originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      tag: 'Foundation Math (6-12)',
      rating: 4.90,
      modules: []
    }
  ],
  orders: [],
  tests: [
    {
      id: 'test1',
      title: 'JEE Main Full Syllabus Grand Mock Test 01',
      description: 'JEE Main Pattern Test. 3 Sections: Math, Physics, Chemistry. Marking: +4 / -1.',
      durationMinutes: 180,
      questions: [
        {
          id: 'q1',
          questionText: 'Find the limit of lim_{x -> 0} (cos(x))^(1 / x^2).',
          options: ['e', 'e^(-1/2)', 'e^(1/2)', '1'],
          correctOption: 1, // e^(-1/2)
          marks: 4,
          negativeMarks: -1,
          subject: 'Mathematics',
          explanation: 'Take logs: ln(y) = (1/x^2) * ln(cos(x)). Expand ln(cos(x)) = ln(1 - x^2/2 + ...) = -x^2/2. So ln(y) -> -1/2. Thus y -> e^(-1/2).'
        },
        {
          id: 'q2',
          questionText: 'A particle of mass m moves under the action of a central force. If the potential energy is U(r) = kr^2, find the frequency of small radial oscillations.',
          options: ['sqrt(k/m)', 'sqrt(2k/m)', '2*sqrt(k/m)', 'sqrt(4k/m)'],
          correctOption: 3, // sqrt(4k/m)
          marks: 4,
          negativeMarks: -1,
          subject: 'Physics',
          explanation: 'The effective potential energy is U_eff = L^2 / (2mr^2) + kr^2. Setting dU_eff/dr = 0 gives equilibrium. Setting d^2U_eff/dr^2 gives the oscillation frequency omega = sqrt(4k/m).'
        },
        {
          id: 'q3',
          questionText: 'Identify the correct order of acidic strength for the following oxyacids of chlorine:',
          options: ['HClO < HClO2 < HClO3 < HClO4', 'HClO4 < HClO3 < HClO2 < HClO', 'HClO3 < HClO4 < HClO2 < HClO', 'HClO2 < HClO < HClO3 < HClO4'],
          correctOption: 0,
          marks: 4,
          negativeMarks: -1,
          subject: 'Chemistry',
          explanation: 'Acidic strength increases with the oxidation state of the central atom (Cl): HClO (+1), HClO2 (+3), HClO3 (+5), HClO4 (+7). Higher oxidation states stabilize the conjugate base through resonance.'
        }
      ]
    }
  ],
  results: [],
  notifications: [
    { id: 'n1', title: 'Live Session Today', message: 'Calculus Doubt Clearing Session by A.K. Sir at 6:00 PM today. Do not miss it!', type: 'live-class', createdAt: new Date().toISOString() },
    { id: 'n2', title: 'New DPP Uploaded', message: 'DPP-02 for Limits has been uploaded under differential calculus module.', type: 'new-content', createdAt: new Date().toISOString() }
  ],
  piracyAlerts: [],
  syllabus: {
    "jee-mains": {
      label: "JEE Main",
      subjects: {
        "mathematics": {
          label: "Mathematics",
          chapters: [
            {
              id: "jm_ch1",
              title: "Sets, Relations and Functions",
              topics: [
                { id: "jm_ch1_t1", title: "Representation of Sets & Venn Diagrams" },
                { id: "jm_ch1_t2", title: "Types of Relations & Equivalence Relations" },
                { id: "jm_ch1_t3", title: "Domain, Range & Types of Functions" }
              ],
              videos: [
                { id: "jm_ch1_v1", title: "1.1 Introduction to Set Theory & Venn Diagrams", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4", duration: "18:45", downloadBlocked: true, isLocked: false, isFree: true, isVisible: true },
                { id: "jm_ch1_v2", title: "1.2 Cartesian Product & Types of Relations", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4", duration: "24:10", downloadBlocked: true, isLocked: true, isFree: false, isVisible: true }
              ],
              pdfs: [
                { id: "jm_ch1_p1", title: "Sets & Relations Lecture Handout", url: "/pdfs/sets_handout.pdf", size: "1.8 MB", downloadBlocked: true, isLocked: false, isFree: true, isVisible: true },
                { id: "jm_ch1_p2", title: "DPP-01: Equivalance Relations & Mappings", url: "/pdfs/sets_dpp.pdf", size: "2.1 MB", downloadBlocked: true, isLocked: true, isFree: false, isVisible: true }
              ],
              formulas: [
                { id: "jm_ch1_f1", title: "Sets Laws & Relation Properties Cheat Sheet", content: "De Morgan's Laws:\n1. (A U B)' = A' n B'\n2. (A n B)' = A' U B'\n\nNumber of elements:\nn(A U B) = n(A) + n(B) - n(A n B)\n\nRelation R on Set A is Equivalence if:\n- Reflexive: (a, a) in R\n- Symmetric: (a, b) in R => (b, a) in R\n- Transitive: (a, b), (b, c) in R => (a, c) in R" }
              ],
              pyqs: [
                { id: "jm_ch1_q1", title: "JEE Main 2025: Set Theory PYQ Paper", year: "2025", url: "/pdfs/pyq_sets_2025.pdf" }
              ],
              mockTests: [
                { id: "jm_ch1_t1", title: "Chapter Test: Sets & Relations", durationMinutes: 15, type: "structured", questions: [
                  {
                    id: "jm_ch1_q_mcq1",
                    questionText: "If Set A has 3 elements and Set B has 4 elements, find the number of injection (one-one) functions from A to B.",
                    options: ["12", "24", "64", "81"],
                    correctOption: 1,
                    marks: 4,
                    negativeMarks: -1,
                    subject: "Mathematics",
                    explanation: "The number of one-one functions from Set A (size m) to Set B (size n) is nPm. Here m=3, n=4. 4P3 = 4 * 3 * 2 = 24."
                  }
                ]}
              ]
            },
            {
              id: "jm_ch2",
              title: "Complex Numbers & Quadratic Equations",
              topics: [
                { id: "jm_ch2_t1", title: "Algebra of Complex Numbers & Modulus/Argument" },
                { id: "jm_ch2_t2", title: "Roots of Quadratic Equations & Nature of Roots" },
                { id: "jm_ch2_t3", title: "Formation of Quadratic Equations" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch3",
              title: "Matrices & Determinants",
              topics: [
                { id: "jm_ch3_t1", title: "Types of Matrices & Operations" },
                { id: "jm_ch3_t2", title: "Properties of Determinants & Cramer's Rule" },
                { id: "jm_ch3_t3", title: "Adjoint and Inverse of a Matrix" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch4",
              title: "Permutations & Combinations",
              topics: [
                { id: "jm_ch4_t1", title: "Fundamental Principle of Counting" },
                { id: "jm_ch4_t2", title: "Permutations of n Objects" },
                { id: "jm_ch4_t3", title: "Combinations & Selection Problems" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch5",
              title: "Binomial Theorem",
              topics: [
                { id: "jm_ch5_t1", title: "Binomial Expansion for Positive Integral Index" },
                { id: "jm_ch5_t2", title: "General and Middle Terms" },
                { id: "jm_ch5_t3", title: "Properties of Binomial Coefficients" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch6",
              title: "Sequence & Series",
              topics: [
                { id: "jm_ch6_t1", title: "Arithmetic Progression (AP) & Properties" },
                { id: "jm_ch6_t2", title: "Geometric Progression (GP) & Infinite GP Sum" },
                { id: "jm_ch6_t3", title: "Arithmetic-Geometric Progression (AGP)" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch7",
              title: "Mathematical Induction",
              topics: [
                { id: "jm_ch7_t1", title: "Principle of Mathematical Induction & Application" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch8",
              title: "Trigonometric Ratios, Identities & Equations",
              topics: [
                { id: "jm_ch8_t1", title: "Trigonometric Ratios and Identities" },
                { id: "jm_ch8_t2", title: "Trigonometric Equations" },
                { id: "jm_ch8_t3", title: "Properties of Triangles" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch9",
              title: "Inverse Trigonometric Functions",
              topics: [
                { id: "jm_ch9_t1", title: "Domain, Range & Principal Value Branches" },
                { id: "jm_ch9_t2", title: "Graphs of Inverse Trigonometric Functions" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch10",
              title: "Straight Lines & Pair of Straight Lines",
              topics: [
                { id: "jm_ch10_t1", title: "Slope of a Line & Different Forms of Equations" },
                { id: "jm_ch10_t2", title: "Distance of a Point from a Line" },
                { id: "jm_ch10_t3", title: "Pair of Straight Lines & Angle Between Them" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch11",
              title: "Circle",
              topics: [
                { id: "jm_ch11_t1", title: "Standard and General Equation of a Circle" },
                { id: "jm_ch11_t2", title: "Tangents, Normals & Chord of Contact" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch12",
              title: "Conic Sections",
              topics: [
                { id: "jm_ch12_t1", title: "Parabola (Standard Equations & Properties)" },
                { id: "jm_ch12_t2", title: "Ellipse (Standard Equations & Properties)" },
                { id: "jm_ch12_t3", title: "Hyperbola (Standard Equations & Properties)" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch13",
              title: "Limits, Continuity & Differentiability",
              topics: [
                { id: "jm_ch13_t1", title: "Limits (Indeterminate Forms & Expansion Method)" },
                { id: "jm_ch13_t2", title: "Continuity of Functions" },
                { id: "jm_ch13_t3", title: "Differentiability & Derivatives" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch14",
              title: "Application of Derivatives",
              topics: [
                { id: "jm_ch14_t1", title: "Rate of Change, Tangents & Normals" },
                { id: "jm_ch14_t2", title: "Monotonicity & Maxima/Minima" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch15",
              title: "Integral Calculus",
              topics: [
                { id: "jm_ch15_t1", title: "Indefinite Integration & Substitution" },
                { id: "jm_ch15_t2", title: "Definite Integration & Properties" },
                { id: "jm_ch15_t3", title: "Area Under Curve" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch16",
              title: "Differential Equations",
              topics: [
                { id: "jm_ch16_t1", title: "Order, Degree & Formulation of Differential Equations" },
                { id: "jm_ch16_t2", title: "Homogeneous & Linear Differential Equations" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch17",
              title: "Vector Algebra",
              topics: [
                { id: "jm_ch17_t1", title: "Dot Product & Cross Product" },
                { id: "jm_ch17_t2", title: "Scalar Triple Product & Vector Triple Product" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch18",
              title: "Three Dimensional Geometry",
              topics: [
                { id: "jm_ch18_t1", title: "Direction Cosines and Direction Ratios" },
                { id: "jm_ch18_t2", title: "Equation of Line & Plane in 3D Space" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch19",
              title: "Statistics",
              topics: [
                { id: "jm_ch19_t1", title: "Measures of Dispersion (Variance & Standard Deviation)" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "jm_ch20",
              title: "Probability",
              topics: [
                { id: "jm_ch20_t1", title: "Conditional Probability & Bayes Theorem" },
                { id: "jm_ch20_t2", title: "Bernoulli Trials & Binomial Distribution" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            }
          ]
        },
        "physics": {
          label: "Physics",
          chapters: []
        },
        "chemistry": {
          label: "Chemistry",
          chapters: []
        }
      }
    },
    "jee-advanced": {
      label: "JEE Advanced",
      subjects: {
        "mathematics": {
          label: "Mathematics",
          chapters: [
            {
              id: "ja_ch1",
              title: "Sets, Relations and Functions",
              topics: [
                { id: "ja_ch1_t1", title: "Representation of Sets & Venn Diagrams" },
                { id: "ja_ch1_t2", title: "Types of Relations & Equivalence Relations" },
                { id: "ja_ch1_t3", title: "Domain, Range & Types of Functions" }
              ],
              videos: [
                { id: "ja_ch1_v1", title: "1.1 Introduction to Set Theory & Venn Diagrams", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4", duration: "18:45", downloadBlocked: true, isLocked: false, isFree: true, isVisible: true },
                { id: "ja_ch1_v2", title: "1.2 Cartesian Product & Types of Relations", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4", duration: "24:10", downloadBlocked: true, isLocked: true, isFree: false, isVisible: true }
              ],
              pdfs: [
                { id: "ja_ch1_p1", title: "Sets & Relations Lecture Handout", url: "/pdfs/sets_handout.pdf", size: "1.8 MB", downloadBlocked: true, isLocked: false, isFree: true, isVisible: true },
                { id: "ja_ch1_p2", title: "DPP-01: Equivalance Relations & Mappings", url: "/pdfs/sets_dpp.pdf", size: "2.1 MB", downloadBlocked: true, isLocked: true, isFree: false, isVisible: true }
              ],
              formulas: [
                { id: "ja_ch1_f1", title: "Sets Laws & Relation Properties Cheat Sheet", content: "De Morgan's Laws:\n1. (A U B)' = A' n B'\n2. (A n B)' = A' U B'\n\nNumber of elements:\nn(A U B) = n(A) + n(B) - n(A n B)\n\nRelation R on Set A is Equivalence if:\n- Reflexive: (a, a) in R\n- Symmetric: (a, b) in R => (b, a) in R\n- Transitive: (a, b), (b, c) in R => (a, c) in R" }
              ],
              pyqs: [
                { id: "ja_ch1_q1", title: "JEE Main 2025: Set Theory PYQ Paper", year: "2025", url: "/pdfs/pyq_sets_2025.pdf" }
              ],
              mockTests: [
                { id: "ja_ch1_t1", title: "Chapter Test: Sets & Relations", durationMinutes: 15, type: "structured", questions: [
                  {
                    id: "ja_ch1_q_mcq1",
                    questionText: "If Set A has 3 elements and Set B has 4 elements, find the number of injection (one-one) functions from A to B.",
                    options: ["12", "24", "64", "81"],
                    correctOption: 1,
                    marks: 4,
                    negativeMarks: -1,
                    subject: "Mathematics",
                    explanation: "The number of one-one functions from Set A (size m) to Set B (size n) is nPm. Here m=3, n=4. 4P3 = 4 * 3 * 2 = 24."
                  }
                ]}
              ]
            },
            {
              id: "ja_ch2",
              title: "Complex Numbers & Quadratic Equations",
              topics: [
                { id: "ja_ch2_t1", title: "Algebra of Complex Numbers & Modulus/Argument" },
                { id: "ja_ch2_t2", title: "Roots of Quadratic Equations & Nature of Roots" },
                { id: "ja_ch2_t3", title: "Formation of Quadratic Equations" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch3",
              title: "Matrices & Determinants",
              topics: [
                { id: "ja_ch3_t1", title: "Types of Matrices & Operations" },
                { id: "ja_ch3_t2", title: "Properties of Determinants & Cramer's Rule" },
                { id: "ja_ch3_t3", title: "Adjoint and Inverse of a Matrix" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch4",
              title: "Permutations & Combinations",
              topics: [
                { id: "ja_ch4_t1", title: "Fundamental Principle of Counting" },
                { id: "ja_ch4_t2", title: "Permutations of n Objects" },
                { id: "ja_ch4_t3", title: "Combinations & Selection Problems" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch5",
              title: "Binomial Theorem",
              topics: [
                { id: "ja_ch5_t1", title: "Binomial Expansion for Positive Integral Index" },
                { id: "ja_ch5_t2", title: "General and Middle Terms" },
                { id: "ja_ch5_t3", title: "Properties of Binomial Coefficients" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch6",
              title: "Sequence & Series",
              topics: [
                { id: "ja_ch6_t1", title: "Arithmetic Progression (AP) & Properties" },
                { id: "ja_ch6_t2", title: "Geometric Progression (GP) & Infinite GP Sum" },
                { id: "ja_ch6_t3", title: "Arithmetic-Geometric Progression (AGP)" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch7",
              title: "Mathematical Induction",
              topics: [
                { id: "ja_ch7_t1", title: "Principle of Mathematical Induction & Application" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch8",
              title: "Trigonometric Ratios, Identities & Equations",
              topics: [
                { id: "ja_ch8_t1", title: "Trigonometric Ratios and Identities" },
                { id: "ja_ch8_t2", title: "Trigonometric Equations" },
                { id: "ja_ch8_t3", title: "Properties of Triangles" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch9",
              title: "Inverse Trigonometric Functions",
              topics: [
                { id: "ja_ch9_t1", title: "Domain, Range & Principal Value Branches" },
                { id: "ja_ch9_t2", title: "Graphs of Inverse Trigonometric Functions" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch10",
              title: "Straight Lines & Pair of Straight Lines",
              topics: [
                { id: "ja_ch10_t1", title: "Slope of a Line & Different Forms of Equations" },
                { id: "ja_ch10_t2", title: "Distance of a Point from a Line" },
                { id: "ja_ch10_t3", title: "Pair of Straight Lines & Angle Between Them" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch11",
              title: "Circle",
              topics: [
                { id: "ja_ch11_t1", title: "Standard and General Equation of a Circle" },
                { id: "ja_ch11_t2", title: "Tangents, Normals & Chord of Contact" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch12",
              title: "Conic Sections",
              topics: [
                { id: "ja_ch12_t1", title: "Parabola (Standard Equations & Properties)" },
                { id: "ja_ch12_t2", title: "Ellipse (Standard Equations & Properties)" },
                { id: "ja_ch12_t3", title: "Hyperbola (Standard Equations & Properties)" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch13",
              title: "Limits, Continuity & Differentiability",
              topics: [
                { id: "ja_ch13_t1", title: "Limits (Indeterminate Forms & Expansion Method)" },
                { id: "ja_ch13_t2", title: "Continuity of Functions" },
                { id: "ja_ch13_t3", title: "Differentiability & Derivatives" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch14",
              title: "Application of Derivatives",
              topics: [
                { id: "ja_ch14_t1", title: "Rate of Change, Tangents & Normals" },
                { id: "ja_ch14_t2", title: "Monotonicity & Maxima/Minima" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch15",
              title: "Integral Calculus",
              topics: [
                { id: "ja_ch15_t1", title: "Indefinite Integration & Substitution" },
                { id: "ja_ch15_t2", title: "Definite Integration & Properties" },
                { id: "ja_ch15_t3", title: "Area Under Curve" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch16",
              title: "Differential Equations",
              topics: [
                { id: "ja_ch16_t1", title: "Order, Degree & Formulation of Differential Equations" },
                { id: "ja_ch16_t2", title: "Homogeneous & Linear Differential Equations" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch17",
              title: "Vector Algebra",
              topics: [
                { id: "ja_ch17_t1", title: "Dot Product & Cross Product" },
                { id: "ja_ch17_t2", title: "Scalar Triple Product & Vector Triple Product" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch18",
              title: "Three Dimensional Geometry",
              topics: [
                { id: "ja_ch18_t1", title: "Direction Cosines and Direction Ratios" },
                { id: "ja_ch18_t2", title: "Equation of Line & Plane in 3D Space" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch19",
              title: "Statistics",
              topics: [
                { id: "ja_ch19_t1", title: "Measures of Dispersion (Variance & Standard Deviation)" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            },
            {
              id: "ja_ch20",
              title: "Probability",
              topics: [
                { id: "ja_ch20_t1", title: "Conditional Probability & Bayes Theorem" },
                { id: "ja_ch20_t2", title: "Bernoulli Trials & Binomial Distribution" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            }
          ]
        },
        "physics": {
          label: "Physics",
          chapters: []
        },
        "chemistry": {
          label: "Chemistry",
          chapters: []
        }
      }
    },
    "mht-cet": {
      label: "MHT-CET",
      subjects: {
        "mathematics": {
          label: "Mathematics",
          chapters: [
            {
              id: "mc_ch1",
              title: "Trigonometric Functions",
              topics: [
                { id: "mc_ch1_t1", title: "Principal & General Solutions" },
                { id: "mc_ch1_t2", title: "Inverse Trigonometric Functions" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            }
          ]
        },
        "physics": {
          label: "Physics",
          chapters: []
        },
        "chemistry": {
          label: "Chemistry",
          chapters: []
        }
      }
    },
    "bitsat": {
      label: "BITSAT",
      subjects: {
        "mathematics": {
          label: "Mathematics",
          chapters: [
            {
              id: "bs_ch1",
              title: "Complex Numbers & Quadratics",
              topics: [
                { id: "bs_ch1_t1", title: "Algebra of Complex Numbers" },
                { id: "bs_ch1_t2", title: "Roots of Quadratic Equations" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            }
          ]
        },
        "physics": {
          label: "Physics",
          chapters: []
        },
        "chemistry": {
          label: "Chemistry",
          chapters: []
        }
      }
    },
    "nda": {
      label: "NDA",
      subjects: {
        "mathematics": {
          label: "Mathematics",
          chapters: [
            {
              id: "nd_ch1",
              title: "Algebra & Trigonometry (NDA Spec)",
              topics: [
                { id: "nd_ch1_t1", title: "Sequences and Series" },
                { id: "nd_ch1_t2", title: "Height and Distance Problems" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            }
          ]
        },
        "physics": {
          label: "Physics",
          chapters: []
        },
        "chemistry": {
          label: "Chemistry",
          chapters: []
        }
      }
    },
    "class-9": {
      label: "Class 9 Mathematics",
      subjects: {
        "mathematics": {
          label: "Mathematics",
          chapters: [
            {
              id: "c9_ch1",
              title: "Number Systems",
              topics: [
                { id: "c9_ch1_t1", title: "Rational & Irrational Numbers" },
                { id: "c9_ch1_t2", title: "Laws of Exponents for Real Numbers" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            }
          ]
        }
      }
    },
    "class-11": {
      label: "Class 11 Mathematics",
      subjects: {
        "mathematics": {
          label: "Mathematics",
          chapters: [
            {
              id: "c11_ch1",
              title: "Relations & Functions",
              topics: [
                { id: "c11_ch1_t1", title: "Ordered Pairs & Cartesian Products" },
                { id: "c11_ch1_t2", title: "Domain, Codomain & Range" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            }
          ]
        }
      }
    },
    "class-12": {
      label: "Class 12 Mathematics",
      subjects: {
        "mathematics": {
          label: "Mathematics",
          chapters: [
            {
              id: "c12_ch1",
              title: "Relations and Functions",
              topics: [
                { id: "c12_ch1_t1", title: "Types of Relations (Reflexive, Symmetric, Transitive)" },
                { id: "c12_ch1_t2", title: "One-one and Onto Functions (Bijective)" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            }
          ]
        }
      }
    },
    "foundation-6-12": {
      label: "Foundation Mathematics (Classes 6-12)",
      subjects: {
        "mathematics": {
          label: "Mathematics",
          chapters: [
            {
              id: "fd_ch1",
              title: "Class 6 Foundation: Numbers & Integers",
              topics: [
                { id: "fd_ch1_t1", title: "Knowing Our Numbers & Whole Numbers" },
                { id: "fd_ch1_t2", title: "Integers & Basic Arithmetic Rules" }
              ],
              videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
            }
          ]
        }
      }
    }
  }
};

const dbPath = path.join(__dirname, 'data', 'db.json');

function loadLocalDb() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed.users) mockDb.users = parsed.users;
      if (parsed.courses) mockDb.courses = parsed.courses;
      if (parsed.orders) mockDb.orders = parsed.orders;
      if (parsed.tests) mockDb.tests = parsed.tests;
      if (parsed.results) mockDb.results = parsed.results;
      if (parsed.notifications) mockDb.notifications = parsed.notifications;
      if (parsed.piracyAlerts) mockDb.piracyAlerts = parsed.piracyAlerts;
      if (parsed.syllabus) mockDb.syllabus = parsed.syllabus;
      console.log('📦 Loaded database from local data/db.json');
    } else {
      saveLocalDb();
    }
  } catch (e) {
    console.error('Failed to load local DB:', e);
  }
}

function saveLocalDb() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(mockDb, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save database to local db.json:', e);
  }
}

// Load JSON db immediately
loadLocalDb();

// MIDDLEWARES
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Token Required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token Invalid or Expired' });
    req.user = user;
    next();
  });
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// API ROUTES

// AUTHENTICATION
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Please provide all details' });
  }
  const userExists = mockDb.users.find(u => u.email === email || u.phone === phone);
  if (userExists) {
    return res.status(400).json({ message: 'User with this email/phone already exists' });
  }
  const passwordHash = bcrypt.hashSync(password, 8);
  const newUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name,
    email,
    phone,
    passwordHash,
    role: role || 'student',
    classLevel: '12th Pass',
    targetExam: 'JEE Advanced 2027',
    purchasedCourses: [],
    dailyStreak: 1,
    lastActive: new Date().toISOString(),
    attendance: 100,
    isBanned: false,
    sessions: []
  };
  mockDb.users.push(newUser);

  if (useRealDb) {
    User.create({
      _id: new mongoose.Types.ObjectId(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      password: newUser.passwordHash,
      role: newUser.role,
      classLevel: newUser.classLevel,
      targetExam: newUser.targetExam,
      dailyStreak: newUser.dailyStreak,
      attendance: newUser.attendance,
      isBanned: newUser.isBanned
    }).catch(e => console.error('MongoDB Register sync error:', e));
  }

  const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '12h' });
  saveLocalDb();
  res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, otp, phone, fingerprint } = req.body;
  let user;

  if (otp) {
    // Simulated OTP authentication
    user = mockDb.users.find(u => u.phone === phone || u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'User not registered with this number/email' });
    }
  } else {
    // Password authentication
    user = mockDb.users.find(u => u.email === email || u.phone === email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  }

  if (user.isBanned) {
    return res.status(403).json({ message: 'Your account has been banned due to security violations.' });
  }

  // Device Session Limiting: Max 1 active session for students
  if (user.role === 'student') {
    // If fingerprint is provided, check session count
    const activeSessions = user.sessions || [];
    if (activeSessions.length >= 1 && fingerprint && activeSessions[0].deviceFingerprint !== fingerprint) {
      // Clear sessions and force logout previous
      user.sessions = [];
      io.emit('force-logout', { userId: user.id, message: 'LoggedIn on another device.' });
    }
    // Add new session
    const newSession = {
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
      deviceFingerprint: fingerprint || 'unknown-web-agent',
      ipAddress: req.ip || '127.0.0.1',
      loginTime: new Date()
    };
    user.sessions = [newSession];
  }

  user.lastActive = new Date().toISOString();
  // Increment streak if logged in on a different day
  user.dailyStreak = (user.dailyStreak || 0) + 1;

  if (useRealDb) {
    // Attempt Mongoose lookup to get DB ObjectId or sync session
    try {
      const dbUser = await User.findOne({ $or: [{ email: user.email }, { phone: user.phone }] });
      if (dbUser) {
        dbUser.sessions = user.sessions.map(s => ({
          sessionId: s.sessionId,
          deviceFingerprint: s.deviceFingerprint,
          ipAddress: s.ipAddress,
          loginTime: s.loginTime
        }));
        dbUser.lastActive = new Date();
        dbUser.dailyStreak = user.dailyStreak;
        await dbUser.save();
      }
    } catch (e) {
      console.error('MongoDB Login Session sync error:', e);
    }
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
  saveLocalDb();
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      classLevel: user.classLevel,
      targetExam: user.targetExam,
      dailyStreak: user.dailyStreak,
      attendance: user.attendance,
      purchasedCourses: user.purchasedCourses,
      sessions: user.sessions
    }
  });
});

// GET PROFILE
app.get('/api/users/profile', authenticateToken, (req, res) => {
  const user = mockDb.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    classLevel: user.classLevel,
    targetExam: user.targetExam,
    dailyStreak: user.dailyStreak,
    attendance: user.attendance,
    purchasedCourses: user.purchasedCourses,
    sessions: user.sessions
  });
});

// COURSE ENDPOINTS
app.get('/api/courses', (req, res) => {
  res.json(mockDb.courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = mockDb.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

// PURCHASE COURSE
app.post('/api/payments/checkout', async (req, res) => {
  const { courseId, paymentProvider } = req.body;
  const course = mockDb.courses.find(c => c.id === courseId);
  const user = mockDb.users.find(u => u.id === req.user.id);
  if (!course || !user) return res.status(404).json({ message: 'Course or User not found' });

  // Simulate payment processing
  const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
  const newOrder = {
    id: orderId,
    user: user.id,
    course: course.id,
    amount: course.price,
    status: 'completed', // auto-complete for mock checkout
    paymentProvider: paymentProvider || 'Razorpay',
    transactionId: 'tx_' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  mockDb.orders.push(newOrder);

  // Grant course access to student
  if (!user.purchasedCourses.includes(courseId)) {
    user.purchasedCourses.push(courseId);
  }

  if (useRealDb) {
    try {
      // Find Mongoose course and user references
      const dbCourse = await Course.findOne({ title: course.title });
      const dbUser = await User.findOne({ email: user.email });
      if (dbCourse && dbUser) {
        // Create order
        await Order.create({
          user: dbUser._id,
          course: dbCourse._id,
          amount: newOrder.amount,
          status: newOrder.status,
          paymentProvider: newOrder.paymentProvider,
          transactionId: newOrder.transactionId
        });

        // Push course reference
        await User.findByIdAndUpdate(dbUser._id, {
          $addToSet: { purchasedCourses: dbCourse._id }
        });
      }
    } catch (e) {
      console.error('MongoDB Checkout sync error:', e);
    }
  }

  // Push notification and socket broadcast
  const notification = {
    id: 'n_' + Math.random().toString(36).substr(2, 9),
    title: 'Payment Successful!',
    message: `Thank you for enrolling in ${course.title}. Start learning now!`,
    type: 'general',
    createdAt: new Date().toISOString()
  };
  mockDb.notifications.unshift(notification);
  io.emit('new-notification', notification);

  saveLocalDb();
  res.json({ success: true, order: newOrder });
});

// ADMIN COURSE MANAGEMENT
app.post('/api/admin/courses', authenticateToken, adminOnly, async (req, res) => {
  const { title, description, price, originalPrice, coverImage, tag } = req.body;
  const newCourse = {
    id: 'course_' + Math.random().toString(36).substr(2, 9),
    title,
    description,
    price: Number(price),
    originalPrice: Number(originalPrice || price),
    coverImage: coverImage || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    tag: tag || 'JEE Main',
    rating: 5.0,
    modules: []
  };
  mockDb.courses.push(newCourse);

  if (useRealDb) {
    Course.create({
      title: newCourse.title,
      description: newCourse.description,
      price: newCourse.price,
      originalPrice: newCourse.originalPrice,
      coverImage: newCourse.coverImage,
      tag: newCourse.tag,
      rating: newCourse.rating,
      modules: []
    }).catch(e => console.error('MongoDB Course create error:', e));
  }
  
  // Real-time broadcast
  io.emit('live-update', { type: 'course-created', course: newCourse });
  
  saveLocalDb();
  res.status(201).json(newCourse);
});

app.post('/api/admin/courses/:id/modules', authenticateToken, adminOnly, async (req, res) => {
  const course = mockDb.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  
  const { title } = req.body;
  const newModule = {
    id: 'mod_' + Math.random().toString(36).substr(2, 9),
    title,
    chapters: []
  };
  course.modules.push(newModule);

  if (useRealDb) {
    Course.findOneAndUpdate(
      { title: course.title },
      { $push: { modules: { title: newModule.title, chapters: [] } } }
    ).catch(e => console.error('MongoDB Module push error:', e));
  }

  io.emit('live-update', { type: 'module-added', courseId: course.id, module: newModule });
  saveLocalDb();
  res.status(201).json(course);
});

app.post('/api/admin/courses/:courseId/modules/:moduleId/chapters', authenticateToken, adminOnly, async (req, res) => {
  const course = mockDb.courses.find(c => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const mod = course.modules.find(m => m.id === req.params.moduleId);
  if (!mod) return res.status(404).json({ message: 'Module not found' });

  const { title, videoTitle, videoUrl, pdfTitle, pdfUrl } = req.body;

  const newChapter = {
    id: 'ch_' + Math.random().toString(36).substr(2, 9),
    title,
    videos: videoUrl ? [{ id: 'v_' + Math.random().toString(36).substr(2, 9), title: videoTitle || 'Lecture', url: videoUrl, duration: '45:00', isDemo: false }] : [],
    pdfs: pdfUrl ? [{ id: 'p_' + Math.random().toString(36).substr(2, 9), title: pdfTitle || 'Class Notes', url: pdfUrl, size: '3.5 MB' }] : [],
    assignments: []
  };
  mod.chapters.push(newChapter);

  if (useRealDb) {
    try {
      const dbCourse = await Course.findOne({ title: course.title });
      if (dbCourse) {
        // Map modules to match mongoose schema and save
        dbCourse.modules = course.modules.map(m => ({
          title: m.title,
          chapters: m.chapters.map(ch => ({
            title: ch.title,
            videos: ch.videos.map(v => ({ title: v.title, url: v.url, duration: v.duration })),
            pdfs: ch.pdfs.map(p => ({ title: p.title, url: p.url, size: p.size }))
          }))
        }));
        await dbCourse.save();
      }
    } catch (e) {
      console.error('MongoDB Chapter add sync error:', e);
    }
  }

  io.emit('live-update', { type: 'chapter-added', courseId: course.id, moduleId: mod.id, chapter: newChapter });
  saveLocalDb();
  res.status(201).json(course);
});

// NOTIFICATION CREATE
app.post('/api/admin/notifications', authenticateToken, adminOnly, async (req, res) => {
  const { title, message, type } = req.body;
  const newNotification = {
    id: 'n_' + Math.random().toString(36).substr(2, 9),
    title,
    message,
    type: type || 'general',
    createdAt: new Date().toISOString()
  };
  mockDb.notifications.unshift(newNotification);

  if (useRealDb) {
    Notification.create({
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type
    }).catch(e => console.error('MongoDB Notice save error:', e));
  }
  
  // Real-time notification
  io.emit('new-notification', newNotification);
  saveLocalDb();
  res.status(201).json(newNotification);
});

app.get('/api/notifications', (req, res) => {
  res.json(mockDb.notifications);
});

// PIRACY TELEMETRY
app.post('/api/security/alert', authenticateToken, async (req, res) => {
  const { type, details } = req.body;
  const alert = {
    id: 'alert_' + Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    userName: req.user.name,
    type,
    details: details || '',
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString()
  };
  mockDb.piracyAlerts.unshift(alert);

  if (useRealDb) {
    try {
      const dbUser = await User.findOne({ email: req.user.email });
      if (dbUser) {
        await PiracyAlert.create({
          user: dbUser._id,
          type: alert.type,
          details: alert.details,
          ipAddress: alert.ipAddress
        });
      }
    } catch (e) {
      console.error('MongoDB telemetry alert save error:', e);
    }
  }

  // Send real-time alerts to logged-in admin panels
  io.emit('security-breach', alert);
  saveLocalDb();
  res.json({ success: true, message: 'Security incident logged.' });
});

// ADMIN TELEMETRY GET
app.get('/api/admin/security/alerts', authenticateToken, adminOnly, (req, res) => {
  res.json(mockDb.piracyAlerts);
});

app.get('/api/admin/revenue', authenticateToken, adminOnly, (req, res) => {
  const totalSales = mockDb.orders.reduce((sum, o) => sum + o.amount, 0) + 4999; // Mock initial
  const activeStudents = mockDb.users.filter(u => u.role === 'student').length;
  const metrics = {
    totalRevenue: totalSales,
    activeStudents: activeStudents,
    coursesPurchasedCount: mockDb.orders.length + 1,
    activeStreamsCount: mockDb.users.reduce((sum, u) => sum + (u.sessions || []).length, 0),
    recentOrders: mockDb.orders.map(o => {
      const u = mockDb.users.find(usr => usr.id === o.user);
      const c = mockDb.courses.find(crs => crs.id === o.course);
      return {
        id: o.id,
        studentName: u ? u.name : 'Unknown User',
        courseTitle: c ? c.title : 'Deleted Course',
        amount: o.amount,
        status: o.status,
        createdAt: o.createdAt
      };
    })
  };
  res.json(metrics);
});

// BAN/UNBAN STUDENT
app.post('/api/admin/users/:id/ban', authenticateToken, adminOnly, async (req, res) => {
  const user = mockDb.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { ban } = req.body;
  user.isBanned = ban;
  if (ban) {
    user.sessions = [];
    io.emit('force-logout', { userId: user.id, message: 'You have been banned.' });
  }

  if (useRealDb) {
    User.findOneAndUpdate(
      { email: user.email },
      { isBanned: ban, sessions: user.sessions }
    ).catch(e => console.error('MongoDB User ban sync error:', e));
  }

  saveLocalDb();
  res.json({ success: true, message: `Student status set to banned: ${ban}` });
});

// UPDATE STUDENT COURSE PERMISSIONS
app.post('/api/admin/users/:id/courses', authenticateToken, adminOnly, async (req, res) => {
  const user = mockDb.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { courses } = req.body;
  user.purchasedCourses = courses || [];

  if (useRealDb) {
    try {
      const dbUser = await User.findOne({ email: user.email });
      if (dbUser) {
        const courseIds = [];
        for (const cId of user.purchasedCourses) {
          if (mongoose.Types.ObjectId.isValid(cId)) {
            courseIds.push(new mongoose.Types.ObjectId(cId));
          } else {
            const courseObj = mockDb.courses.find(c => c.id === cId);
            if (courseObj) {
              const dbCourse = await Course.findOne({ title: courseObj.title });
              if (dbCourse) courseIds.push(dbCourse._id);
            }
          }
        }
        dbUser.purchasedCourses = courseIds;
        await dbUser.save();
      }
    } catch (e) {
      console.error('MongoDB User courses sync error:', e);
    }
  }

  saveLocalDb();
  res.json({ success: true, purchasedCourses: user.purchasedCourses });
});

// GET STUDENTS LIST FOR ADMIN
app.get('/api/admin/students', authenticateToken, adminOnly, (req, res) => {
  const students = mockDb.users.filter(u => u.role === 'student').map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    isBanned: u.isBanned,
    dailyStreak: u.dailyStreak,
    attendance: u.attendance,
    purchasedCourses: u.purchasedCourses,
    sessionsCount: (u.sessions || []).length
  }));
  res.json(students);
});

// AI MATH CHATBOT AND STUDY PLANNER
app.post('/api/ai/doubt-solver', authenticateToken, (req, res) => {
  const { question } = req.body;
  let response = '';

  // IIT-JEE Mathematics specific responses to simulate premium AI engine
  const questionLower = question.toLowerCase();
  if (questionLower.includes('limit') || questionLower.includes('sin(x)/x') || questionLower.includes('sinx/x')) {
    response = `**Quantrex AI Math Mentor:** Let's solve $\\lim_{x \\to 0} \\frac{\\sin x}{x}$ step-by-step:
    
1. **Identify the form:** As $x \\to 0$, both $\\sin x \\to 0$ and $x \\to 0$. This is the Indeterminate Form $\\frac{0}{0}$.
2. **Method 1: Expansion Series**
   We know the Taylor series expansion of $\\sin x$ is:
   $$\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots$$
   Dividing by $x$:
   $$\\frac{\\sin x}{x} = 1 - \\frac{x^2}{6} + \\frac{x^4}{120} - \\dots$$
   Taking limit $x \\to 0$, all terms containing $x$ vanish:
   $$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$
3. **Method 2: L'Hôpital's Rule**
   Differentiate numerator and denominator with respect to $x$:
   $$\\frac{d}{dx}(\\sin x) = \\cos x, \\quad \\frac{d}{dx}(x) = 1$$
   Applying the limit:
   $$\\lim_{x \\to 0} \\frac{\\cos x}{1} = \\cos(0) = 1$$

Therefore, the limit is **1**.`;
  } else if (questionLower.includes('integrate') || questionLower.includes('integration') || questionLower.includes('integral')) {
    response = `**Quantrex AI Math Mentor:** Let's calculate the integral $\\int x e^{x} \\, dx$ using Integration by Parts:

1. **Formula:** 
   $$\\int u \\, dv = uv - \\int v \\, du$$
2. **Choice of $u$ and $dv$ (using ILATE rule):**
   - Let $u = x \\implies du = dx$
   - Let $dv = e^x \\, dx \\implies v = e^x$
3. **Apply the Formula:**
   $$\\int x e^x \\, dx = x e^x - \\int e^x \\, dx$$
   $$\\int x e^x \\, dx = x e^x - e^x + C$$
   $$\\int x e^x \\, dx = e^x(x - 1) + C$$

Where $C$ is the constant of integration.`;
  } else if (questionLower.includes('rank') || questionLower.includes('predict')) {
    response = `**Quantrex AI Rank Predictor:** Based on your current performance analytics:
- Syllabus Completion: **68%**
- Test Accuracy Rate: **76%**
- Strongest Zone: **Calculus & Linear Algebra**
- Recommended Revision: **Coordinate Geometry**

**Predicted JEE Advanced 2027 Rank Bracket:** **AIR 1,200 - 1,800**
*Action Plan: To break into Top 500, improve your accuracy in Multiple Correct Questions of Integral Calculus from 60% to 85%.*`;
  } else {
    response = `**Quantrex AI Math Mentor:** Greetings! I am your IIT-JEE Mathematics mentor powered by Quantrex AI.
    
Based on your query: "${question}", I recommend:
1. Revise the core concept in **A.K. Sir's** notes on this chapter.
2. For JEE Advanced, check the standard PYQ patterns from 2018-2025.
3. If you have a specific equation, feel free to write it using terms like "limit", "integral", "matrix", or "probability" so I can output LaTeX-formatted steps!`;
  }

  res.json({ response });
});

// TESTS ENDPOINTS
app.get('/api/tests', authenticateToken, (req, res) => {
  res.json(mockDb.tests);
});

app.post('/api/admin/tests', authenticateToken, adminOnly, async (req, res) => {
  const { title, description, durationMinutes, questions } = req.body;
  const newTest = {
    id: 'test_' + Math.random().toString(36).substr(2, 9),
    title,
    description: description || 'JEE Pattern Full Syllabus Mock Test Series',
    durationMinutes: Number(durationMinutes || 60),
    questions: questions || []
  };
  mockDb.tests.push(newTest);
  
  if (useRealDb) {
    try {
      await Test.create({
        title: newTest.title,
        description: newTest.description,
        durationMinutes: newTest.durationMinutes,
        questions: newTest.questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          subject: q.subject || 'Mathematics',
          explanation: q.explanation
        }))
      });
    } catch (e) {
      console.error('MongoDB Test save error:', e);
    }
  }
  
  saveLocalDb();
  io.emit('live-update', { type: 'test-created', test: newTest });
  res.status(201).json(newTest);
});

app.delete('/api/admin/tests/:id', authenticateToken, adminOnly, async (req, res) => {
  const testId = req.params.id;
  const index = mockDb.tests.findIndex(t => t.id === testId);
  if (index === -1) return res.status(404).json({ message: 'Test not found' });
  
  const deletedTest = mockDb.tests.splice(index, 1)[0];
  
  if (useRealDb) {
    try {
      await Test.deleteOne({ title: deletedTest.title });
    } catch (e) {
      console.error('MongoDB Test delete error:', e);
    }
  }
  
  saveLocalDb();
  io.emit('live-update', { type: 'test-deleted', testId });
  res.json({ success: true, message: 'Test deleted successfully' });
});


app.get('/api/tests/:id', authenticateToken, (req, res) => {
  const test = mockDb.tests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });
  res.json(test);
});

app.post('/api/tests/:id/submit', authenticateToken, async (req, res) => {
  const test = mockDb.tests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });

  const { answers } = req.body; // array of { questionId, selectedOption }
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  const answersEvaluated = test.questions.map((q) => {
    const studentAns = answers.find(a => a.questionId === q.id || a.questionIndex === test.questions.indexOf(q));
    const selected = studentAns ? studentAns.selectedOption : -1;
    
    if (selected === -1) {
      skipped++;
      return { questionId: q.id, selectedOption: -1, isCorrect: false };
    } else if (selected === q.correctOption) {
      score += q.marks || 4;
      correct++;
      return { questionId: q.id, selectedOption: selected, isCorrect: true };
    } else {
      score += q.negativeMarks || -1;
      wrong++;
      return { questionId: q.id, selectedOption: selected, isCorrect: false };
    }
  });

  const totalMarks = test.questions.reduce((sum, q) => sum + (q.marks || 4), 0);
  const result = {
    id: 'res_' + Math.random().toString(36).substr(2, 9),
    user: req.user.id,
    test: test.id,
    score,
    totalMarks,
    correctAnswers: correct,
    wrongAnswers: wrong,
    skippedAnswers: skipped,
    percentile: 98.4 + (score / totalMarks) * 1.5, // Mock percentile calculation
    rank: Math.floor(Math.random() * 50) + 1,
    answers: answersEvaluated,
    createdAt: new Date().toISOString()
  };

  mockDb.results.push(result);

  if (useRealDb) {
    try {
      const dbUser = await User.findOne({ email: req.user.name === 'Rohan Sharma' ? 'student@quantrex.com' : req.user.name }); // Fetch correct user
      const dbTest = await Test.findOne({ title: test.title });
      if (dbUser && dbTest) {
        await Result.create({
          user: dbUser._id,
          test: dbTest._id,
          score: result.score,
          totalMarks: result.totalMarks,
          correctAnswers: result.correctAnswers,
          wrongAnswers: result.wrongAnswers,
          skippedAnswers: result.skippedAnswers,
          percentile: result.percentile,
          rank: result.rank,
          answers: result.answers.map(ans => ({
            questionId: ans.questionId,
            selectedOption: ans.selectedOption,
            isCorrect: ans.isCorrect
          }))
        });
      }
    } catch (e) {
      console.error('MongoDB Result submit sync error:', e);
    }
  }

  saveLocalDb();
  res.json(result);
});

// SYLLABUS ENDPOINTS
app.get('/api/syllabus', (req, res) => {
  res.json(mockDb.syllabus || {});
});

app.post('/api/admin/syllabus', authenticateToken, adminOnly, async (req, res) => {
  mockDb.syllabus = req.body;
  
  if (useRealDb) {
    try {
      await Syllabus.deleteMany({});
      await Syllabus.create({ data: mockDb.syllabus });
    } catch (e) {
      console.error('MongoDB Syllabus sync error:', e);
    }
  }
  
  saveLocalDb();
  io.emit('live-update', { type: 'syllabus-updated', syllabus: mockDb.syllabus });
  res.json({ success: true, syllabus: mockDb.syllabus });
});

// LOCAL/MEMORY FILE UPLOAD ENDPOINT
app.post('/api/admin/upload', authenticateToken, adminOnly, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    const base64Data = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.originalname,
      size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });
  } catch (e) {
    console.error('Upload handler error:', e);
    res.status(500).json({ message: 'Failed to process file upload' });
  }
});

// WEBSOCKET LOGIC
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Quantrex Premium Server is running on port ${PORT}`);
  });
}

export default app;
