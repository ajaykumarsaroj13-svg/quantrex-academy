/**
 * seed_all_data.js
 * =================
 * Yeh script SAARA system data MongoDB mein save karta hai.
 * Ek baar run karo, saara data backup ho jaata hai.
 * 
 * Run: node seed_all_data.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Connect ─────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI missing in .env'); process.exit(1); }

// ─── Import Models ────────────────────────────────────────────────────────────
import {
  User, Course, Test, Result, Notification, FullTestSeries,
  BlackBookQuestion, BlackBookChapter, BlackBookProgress
} from './models/schemas.js';

// ─── AppConfig Schema (for system-wide settings) ─────────────────────────────
const AppConfigSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  description: String,
}, { timestamps: true });
const AppConfig = mongoose.model('AppConfig', AppConfigSchema);

// ─── SyllabusChapter Schema ───────────────────────────────────────────────────
const SyllabusChapterSchema = new mongoose.Schema({
  courseId:   { type: String, required: true },
  subjectKey: { type: String, required: true },
  chapterId:  { type: String, required: true, unique: true },
  title:      { type: String, required: true },
  topics:     [{ id: String, title: String }],
  videos:     [mongoose.Schema.Types.Mixed],
  pdfs:       [mongoose.Schema.Types.Mixed],
  formulas:   [mongoose.Schema.Types.Mixed],
  pyqs:       [mongoose.Schema.Types.Mixed],
  mockTests:  [mongoose.Schema.Types.Mixed],
}, { timestamps: true });
const SyllabusChapter = mongoose.model('SyllabusChapter', SyllabusChapterSchema);

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function seedAll() {
  console.log('\n🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB!\n');

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DEFAULT USERS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('👥 Seeding Users...');
  const usersToSeed = [
    {
      name: 'Ajay Kumar Saroj (A.K. Sir)',
      email: 'admin@quantrex.com',
      phone: '9999999999',
      password: bcrypt.hashSync('admin123', 8),
      role: 'admin',
      classLevel: 'Educator',
      targetExam: 'JEE Advanced',
      isBanned: false,
      dailyStreak: 1,
      attendance: 100,
    },
    {
      name: 'Demo Student',
      email: 'student@quantrex.com',
      phone: '9876543210',
      password: bcrypt.hashSync('student123', 8),
      role: 'student',
      classLevel: '12th Pass',
      targetExam: 'JEE Advanced 2027',
      isBanned: false,
      dailyStreak: 12,
      attendance: 98,
    }
  ];
  for (const u of usersToSeed) {
    await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
  }
  console.log(`  ✅ ${usersToSeed.length} users seeded.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. COURSES
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📚 Seeding Courses...');
  const courses = [
    {
      title: 'JEE Main Mathematics Suite',
      description: 'Complete JEE Main Mathematics — 20 units, notes, DPPs, and mock tests.',
      price: 0, originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      tag: 'JEE Main', rating: 4.96, modules: []
    },
    {
      title: 'Ultimate JEE Advanced Mathematics',
      description: 'Rigorous JEE Advanced mathematics — calculus, vectors, complex numbers, rank booster.',
      price: 0, originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      tag: 'JEE Advanced', rating: 4.98, modules: []
    },
    {
      title: 'MHT-CET Mathematics Preparation',
      description: 'Speed, tricks, and formula-focused math for MHT-CET aspirants.',
      price: 0, originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      tag: 'MHT-CET', rating: 4.85, modules: []
    },
    {
      title: 'BITSAT Mathematics & Strategy',
      description: 'Time-bound practice and speed mathematics for BITSAT.',
      price: 0, originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=800&q=80',
      tag: 'BITSAT', rating: 4.90, modules: []
    },
    {
      title: 'NDA Mathematics Crack Course',
      description: 'Complete UPSC NDA mathematics — shortcuts, trig, year-wise PYQs.',
      price: 0, originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      tag: 'NDA', rating: 4.92, modules: []
    },
    {
      title: 'Class 12th Board Mathematics',
      description: 'Relations, functions, matrices, calculus for Class 12 boards.',
      price: 0, originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=800&q=80',
      tag: 'Class 12th Math', rating: 4.94, modules: []
    },
    {
      title: 'Class 11th Mathematics & Foundation',
      description: 'Algebra, trigonometry, coordinate geometry for Class 11.',
      price: 0, originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
      tag: 'Class 11th Math', rating: 4.88, modules: []
    },
    {
      title: 'Class 9th Mathematics Foundation',
      description: 'Number systems, polynomials — groundwork for JEE prep.',
      price: 0, originalPrice: 0,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      tag: 'Class 9th Math', rating: 4.82, modules: []
    }
  ];
  for (const c of courses) {
    await Course.findOneAndUpdate({ title: c.title }, c, { upsert: true, new: true });
  }
  console.log(`  ✅ ${courses.length} courses seeded.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. NOTIFICATIONS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🔔 Seeding Notifications...');
  const notifs = [
    { title: 'Welcome to QuantRex!', message: 'Start your JEE preparation journey today. Explore Black Book practice, PYQs, and test series.', type: 'general' },
    { title: 'New: Black Book Practice Added', message: 'Complete "Functions" chapter practice from Vikas Gupta Black Book is now live — 183 questions!', type: 'new-content' },
    { title: 'Daily Goal Reminder', message: 'Complete at least 10 questions today to maintain your streak.', type: 'motivational' }
  ];
  const notifCount = await Notification.countDocuments();
  if (notifCount === 0) {
    await Notification.insertMany(notifs);
    console.log(`  ✅ ${notifs.length} notifications seeded.\n`);
  } else {
    console.log(`  ⏭️  Notifications already exist (${notifCount}), skipping.\n`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. BLACK BOOK QUESTIONS (from local JSON)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📖 Seeding Black Book Questions...');
  const bbPath = path.join(__dirname, '..', 'src', 'utils', 'blackBookDataFull.json');
  if (fs.existsSync(bbPath)) {
    const bbData = JSON.parse(fs.readFileSync(bbPath, 'utf-8'));
    const chapter = bbData[0];
    const questions = chapter?.questions || [];

    // Group by exercise
    const exerciseMap = {};
    questions.forEach((q, idx) => {
      const ex = q.exerciseName || 'Exercise 1';
      if (!exerciseMap[ex]) exerciseMap[ex] = [];
      exerciseMap[ex].push({ ...q, questionIndex: idx });
    });

    // Upsert chapter
    await BlackBookChapter.findOneAndUpdate(
      { id: chapter.id || 'function' },
      {
        id: chapter.id || 'function',
        title: chapter.title || 'Functions',
        exercises: Object.entries(exerciseMap).map(([ex, qs]) => ({
          exerciseNo: ex.replace('Exercise ', '1.'),
          exerciseName: ex, totalQuestions: qs.length
        })),
        totalQuestions: questions.length,
      },
      { upsert: true, new: true }
    );

    // Clear + reinsert questions
    await BlackBookQuestion.deleteMany({});
    const docs = [];
    Object.entries(exerciseMap).forEach(([exName, qs]) => {
      qs.forEach((q, li) => docs.push({
        exerciseName: exName, exerciseNo: exName.replace('Exercise ', '1.'),
        questionIndex: li, text: q.text || '',
        options: q.options || [],
        correctOption: q.correctOption !== undefined ? q.correctOption : -1,
        correctOptionsArray: q.correctOptionsArray || [],
        answerKeyStr: q.answerKeyStr || null,
        solution: q.solution || null,
        has_graph: q.has_graph || false,
        imageUrl: q.imageUrl || null,
        typeLabel: q.typeLabel || null,
      }));
    });
    const B = 100;
    for (let i = 0; i < docs.length; i += B) await BlackBookQuestion.insertMany(docs.slice(i, i + B));
    console.log(`  ✅ ${docs.length} Black Book questions seeded.\n`);
  } else {
    console.log('  ⚠️  blackBookDataFull.json not found, skipping.\n');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. SYSTEM CONFIG (app settings as key-value in MongoDB)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('⚙️  Seeding System Config...');
  const configs = [
    { key: 'app_name', value: 'QuantRex Academy', description: 'Application name' },
    { key: 'app_version', value: '2.0.0', description: 'Current app version' },
    { key: 'admin_email', value: 'admin@quantrex.com', description: 'Admin email' },
    { key: 'jwt_expiry', value: '12h', description: 'JWT token expiry' },
    { key: 'max_devices', value: 3, description: 'Max login devices per user' },
    { key: 'maintenance_mode', value: false, description: 'Is site in maintenance mode' },
    { key: 'razorpay_enabled', value: false, description: 'Razorpay payment gateway enabled' },
    { key: 'seeded_at', value: new Date().toISOString(), description: 'Last seed timestamp' },
    { key: 'blackbook_chapters', value: ['function'], description: 'Available Black Book chapters' },
    { key: 'supported_exams', value: ['JEE Main', 'JEE Advanced', 'NDA', 'BITSAT', 'MHT-CET'], description: 'Supported exam types' },
  ];
  for (const c of configs) {
    await AppConfig.findOneAndUpdate({ key: c.key }, c, { upsert: true, new: true });
  }
  console.log(`  ✅ ${configs.length} config entries saved.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // 6. SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  const counts = {
    users: await User.countDocuments(),
    courses: await Course.countDocuments(),
    tests: await Test.countDocuments(),
    fullTestSeries: await FullTestSeries.countDocuments(),
    notifications: await Notification.countDocuments(),
    blackBookChapters: await BlackBookChapter.countDocuments(),
    blackBookQuestions: await BlackBookQuestion.countDocuments(),
    blackBookProgress: await BlackBookProgress.countDocuments(),
    appConfig: await AppConfig.countDocuments(),
    results: await Result.countDocuments(),
  };

  console.log('═══════════════════════════════════════════════');
  console.log('✅  MONGODB — COMPLETE DATA SUMMARY');
  console.log('═══════════════════════════════════════════════');
  Object.entries(counts).forEach(([col, n]) => {
    console.log(`  📦 ${col.padEnd(22)}: ${n} documents`);
  });
  console.log('═══════════════════════════════════════════════');
  console.log(`\n🎉 All data seeded! MongoDB is your single source of truth.\n`);

  await mongoose.disconnect();
}

seedAll().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
