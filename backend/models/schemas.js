import mongoose from 'mongoose';

// USER SCHEMA
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  profilePhoto: { type: String, default: '' },
  classLevel: { type: String, default: '12th Pass' },
  targetExam: { type: String, default: 'JEE Advanced 2027' },
  isBanned: { type: Boolean, default: false },
  dailyStreak: { type: Number, default: 1 },
  lastActive: { type: Date, default: Date.now },
  attendance: { type: Number, default: 95 },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  sessions: [{
    sessionId: String,
    deviceFingerprint: String,
    ipAddress: String,
    loginTime: Date,
    userAgent: String
  }]
}, { timestamps: true });

// COURSE SCHEMA
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  coverImage: { type: String, required: true },
  tag: { type: String, default: 'JEE Advanced' },
  rating: { type: Number, default: 4.9 },
  modules: [{
    title: String,
    chapters: [{
      title: String,
      videos: [{
        title: String,
        url: String,
        duration: String,
        isDemo: { type: Boolean, default: false }
      }],
      pdfs: [{
        title: String,
        url: String,
        size: String
      }],
      assignments: [{
        title: String,
        url: String
      }]
    }]
  }]
}, { timestamps: true });

// ORDER SCHEMA
const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentProvider: { type: String, enum: ['Razorpay', 'Stripe', 'UPI'], required: true },
  transactionId: { type: String, unique: true },
  signature: { type: String }
}, { timestamps: true });

// TEST SCHEMA
const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  questions: [{
    questionText: String,
    options: [String],
    correctOption: Number,
    marks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: -1 },
    subject: { type: String, default: 'Mathematics' },
    explanation: String
  }]
}, { timestamps: true });

// TEST RESULT SCHEMA
const ResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  skippedAnswers: { type: Number, default: 0 },
  percentile: { type: Number, default: 99.0 },
  rank: { type: Number },
  answers: [{
    questionId: String,
    selectedOption: Number,
    isCorrect: Boolean
  }]
}, { timestamps: true });

// NOTIFICATION SCHEMA
const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['live-class', 'new-content', 'general', 'test-series', 'motivational'], default: 'general' },
  metadata: { type: mongoose.Schema.Types.Map, of: String }
}, { timestamps: true });

// PIRACY ALERT SCHEMA
const PiracyAlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['screenshot', 'devtools_inspect', 'multiple_devices', 'vpn_detected'], required: true },
  ipAddress: String,
  deviceFingerprint: String,
  details: String
}, { timestamps: true });

// SYLLABUS SCHEMA
const SyllabusSchema = new mongoose.Schema({
  data: { type: mongoose.Schema.Types.Map, of: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const Course = mongoose.model('Course', CourseSchema);
export const Order = mongoose.model('Order', OrderSchema);
export const Test = mongoose.model('Test', TestSchema);
export const Result = mongoose.model('Result', ResultSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const PiracyAlert = mongoose.model('PiracyAlert', PiracyAlertSchema);
export const Syllabus = mongoose.model('Syllabus', SyllabusSchema);

// PYQ CHAPTER SCHEMA
const PyqChapterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  exam: { type: String, default: 'JEE Main' },
  subject: { type: String, required: true },
  count: { type: Number, default: 0 },
  weightage: { type: String, default: '5%' }
}, { timestamps: true });

// PYQ SCHEMA
const PyqSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  exam: { type: String, default: 'JEE Main' },
  chapterId: { type: String, required: true },
  title: { type: String },
  year: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  type: { type: String, enum: ['SCQ', 'NUMERICAL'], default: 'SCQ' },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctOptionIndex: { type: Number },
  solution: { type: String },
  marks: { type: Number, default: 4 },
  negativeMarks: { type: Number, default: -1 },
  topic: { type: String, default: 'General' }
}, { timestamps: true });

export const PyqChapter = mongoose.model('PyqChapter', PyqChapterSchema);
export const Pyq = mongoose.model('Pyq', PyqSchema);

// =====================================================
// FULL TEST SERIES SCHEMAS (NTA Pattern)
// =====================================================

const TestSeriesQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  subject: { type: String, required: true, enum: ['Physics', 'Chemistry', 'Mathematics', 'General'] },
  section: { type: String, default: 'A' }, // A = MCQ, B = Numerical
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctOption: { type: Number },       // 0-indexed, null for numerical
  correctAnswer: { type: String },        // for numerical type
  questionType: { type: String, enum: ['MCQ', 'NUMERICAL'], default: 'MCQ' },
  marks: { type: Number, default: 4 },
  negativeMarks: { type: Number, default: -1 },
  solution: { type: String, default: '' },
  topic: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
});

const FullTestSeriesSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  exam: { type: String, required: true, enum: ['JEE Main', 'JEE Advanced', 'NDA', 'BITSAT', 'NCERT 11', 'NCERT 12'] },
  year: { type: Number },
  session: { type: String },   // January, April
  shift: { type: Number },     // 1, 2
  date: { type: String },
  paperType: { type: String, default: 'Paper 1 (PCM)' },
  durationMinutes: { type: Number, default: 180 },
  totalMarks: { type: Number, default: 300 },
  totalQuestions: { type: Number, default: 75 },
  sections: [{
    name: String,
    totalQuestions: Number,
    sectionACount: Number,
    sectionBCount: Number,
    attemptRequired: Number
  }],
  questions: [TestSeriesQuestionSchema],
  isOfficial: { type: Boolean, default: true },
  description: { type: String, default: '' },
  isFree: { type: Boolean, default: true }
}, { timestamps: true });

// Test Attempt - stores user's responses during exam
const TestAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testSeries: { type: mongoose.Schema.Types.ObjectId, ref: 'FullTestSeries', required: true },
  testId: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  timeSpentSeconds: { type: Number, default: 0 },
  status: { type: String, enum: ['in-progress', 'submitted', 'auto-submitted'], default: 'in-progress' },
  answers: [{
    questionNumber: Number,
    subject: String,
    selectedOption: { type: Number, default: -1 },    // -1 = unattempted
    numericalAnswer: { type: String, default: '' },
    isMarkedForReview: { type: Boolean, default: false },
    isAnswered: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 }           // seconds spent on question
  }],
  result: {
    totalScore: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 300 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    percentile: { type: Number, default: 0 },
    physicsScore: { type: Number, default: 0 },
    chemistryScore: { type: Number, default: 0 },
    mathsScore: { type: Number, default: 0 },
    rank: { type: Number }
  }
}, { timestamps: true });

export const FullTestSeries = mongoose.model('FullTestSeries', FullTestSeriesSchema);
export const TestAttempt = mongoose.model('TestAttempt', TestAttemptSchema);

// =====================================================
// BLACK BOOK SCHEMAS
// =====================================================

const BlackBookQuestionSchema = new mongoose.Schema({
  chapterId: { type: String, required: true },
  exerciseName: { type: String, required: true },
  exerciseNo:   { type: String },
  questionIndex: { type: Number },
  text:         { type: String, required: true },
  options:      [{ type: String }],
  correctOption:  { type: Number, default: -1 },
  correctOptionsArray: [{ type: Number }],
  answerKeyStr: { type: String },
  solution:     { type: String },
  has_graph:    { type: Boolean, default: false },
  imageUrl:     { type: String },
  typeLabel:    { type: String },
}, { timestamps: true });

const BlackBookChapterSchema = new mongoose.Schema({
  id:           { type: String, required: true, unique: true },
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
  isCorrect:    { type: mongoose.Schema.Types.Mixed },
  revealed:     { type: Boolean, default: false },
  seenAt:       { type: Date, default: Date.now },
}, { timestamps: true });
BlackBookProgressSchema.index(
  { userId: 1, chapterId: 1, exerciseName: 1, questionIndex: 1 },
  { unique: true }
);

export const BlackBookQuestion = mongoose.model('BlackBookQuestion', BlackBookQuestionSchema);
export const BlackBookChapter  = mongoose.model('BlackBookChapter',  BlackBookChapterSchema);
export const BlackBookProgress = mongoose.model('BlackBookProgress', BlackBookProgressSchema);
