import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// 1. Original BackupData schema (Critical for frontend Vercel Blob sync)
const BackupSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  data: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
});

export const BackupData = mongoose.models.BackupData || mongoose.model('BackupData', BackupSchema);

// 2. User / Student schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student', enum: ['student', 'admin'] },
  classLevel: { type: String, default: '12th' },
  targetExam: { type: String, default: 'JEE Main' },
  purchasedCourses: { type: [String], default: [] },
  dailyStreak: { type: Number, default: 1 },
  attendance: { type: Number, default: 100 },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// 3. Student Activity Log Schema
const ActivityLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  actionType: { type: String, required: true, enum: ['video_watch', 'note_download', 'doubt_ask', 'chapter_complete'] },
  description: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Compound index for quick sorting by user activity history
ActivityLogSchema.index({ userId: 1, timestamp: -1 });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

// 4. Test Attempt / Results Schema
const TestAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  testId: { type: String, required: true, index: true },
  testTitle: { type: String, required: true },
  score: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  wrongCount: { type: Number, required: true },
  timeSpent: { type: Number, required: true }, // in seconds
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

TestAttemptSchema.index({ userId: 1, submittedAt: -1 });

export const TestAttempt = mongoose.models.TestAttempt || mongoose.model('TestAttempt', TestAttemptSchema);

// 5. Wrong Questions Schema (for mistake booster auto practice)
const WrongQuestionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  testId: { type: String, required: true, index: true },
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  selectedOption: { type: Number },
  correctOption: { type: Number, required: true },
  options: { type: [String], default: [] },
  flaggedAt: { type: Date, default: Date.now }
});

export const WrongQuestion = mongoose.models.WrongQuestion || mongoose.model('WrongQuestion', WrongQuestionSchema);

// 6. DB Backup Metadata Schema
const DbBackupSchema = new mongoose.Schema({
  backupId: { type: String, required: true, unique: true, index: true },
  key: { type: String, required: true },
  snapshot: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

export const DbBackup = mongoose.models.DbBackup || mongoose.model('DbBackup', DbBackupSchema);

// 7. Global Notifications Schema
const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

