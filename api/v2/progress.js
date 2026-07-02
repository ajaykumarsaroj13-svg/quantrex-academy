/**
 * /api/v2/progress.js
 * Student Progress Sync API - Website + App dono ke liye
 * Tracks chapter progress, test attempts, bookmarks, wrong questions
 */
import { connectToDatabase, TestAttempt, WrongQuestion } from '../utils/db.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const JWT_SECRET = process.env.JWT_SECRET || 'quantrex_secret_2025_secure_key';

function verifyToken(token) {
  try {
    if (!token) return null;
    // Support both old format (jwt_session_...) and new qx_ format
    if (token.startsWith('jwt_session_')) {
      const parts = token.split('_');
      return parts[2] || null; // userId is 3rd part
    }
    if (token.startsWith('qx_')) {
      const parts = token.split('_');
      if (parts.length < 3) return null;
      const payload = Buffer.from(parts[1], 'base64url').toString();
      const [userId] = payload.split('_');
      return userId;
    }
    return null;
  } catch {
    return null;
  }
}

// Extended Progress Schema (stored in MongoDB)
const StudentProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  chapterId: { type: String, required: true },
  chapterName: { type: String },
  subject: { type: String },
  course: { type: String },
  completedTopics: { type: [String], default: [] },
  totalTopics: { type: Number, default: 0 },
  practiceCount: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  bookmarkedQuestions: { type: [String], default: [] },
  lastStudied: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
StudentProgressSchema.index({ userId: 1, chapterId: 1 }, { unique: true });
const StudentProgress = mongoose.models.StudentProgress ||
  mongoose.model('StudentProgress', StudentProgressSchema);

export default async function handler(req, res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  const userId = verifyToken(authHeader.slice(7));
  if (!userId) return res.status(401).json({ error: 'Invalid or expired token' });

  try {
    await connectToDatabase();
    const { action } = req.query;

    // ── GET ALL PROGRESS ──────────────────────────────────────────────────────
    if (req.method === 'GET' && !action) {
      const progress = await StudentProgress.find({ userId }).lean();
      const testAttempts = await TestAttempt.find({ userId })
        .sort({ submittedAt: -1 })
        .limit(50)
        .lean();
      const wrongQs = await WrongQuestion.find({ userId }).lean();

      return res.status(200).json({
        success: true,
        data: {
          chapterProgress: progress,
          testAttempts,
          wrongQuestions: wrongQs,
          summary: {
            totalChaptersStudied: progress.length,
            totalTestsAttempted: testAttempts.length,
            totalWrongQuestions: wrongQs.length,
            avgScore: testAttempts.length > 0
              ? Math.round(testAttempts.reduce((a, t) => a + (t.score / t.totalMarks * 100), 0) / testAttempts.length)
              : 0
          }
        }
      });
    }

    // ── UPDATE CHAPTER PROGRESS ───────────────────────────────────────────────
    if (req.method === 'POST' && action === 'chapter') {
      const { chapterId, chapterName, subject, course, completedTopics, totalTopics, practiceCount, correctCount, wrongCount } = req.body || {};
      if (!chapterId) return res.status(400).json({ error: 'chapterId required' });

      const updated = await StudentProgress.findOneAndUpdate(
        { userId, chapterId },
        {
          $set: {
            chapterName: chapterName || '',
            subject: subject || '',
            course: course || '',
            totalTopics: totalTopics || 0,
            lastStudied: new Date(),
            updatedAt: new Date()
          },
          $addToSet: completedTopics?.length ? { completedTopics: { $each: completedTopics } } : {},
          $inc: {
            practiceCount: practiceCount || 0,
            correctCount: correctCount || 0,
            wrongCount: wrongCount || 0
          }
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true, data: updated });
    }

    // ── SAVE TEST ATTEMPT ─────────────────────────────────────────────────────
    if (req.method === 'POST' && action === 'test-attempt') {
      const { testId, testTitle, score, correctCount, wrongCount, timeSpent, totalQuestions, totalMarks, answers } = req.body || {};
      if (!testId) return res.status(400).json({ error: 'testId required' });

      const attempt = new TestAttempt({
        userId,
        testId,
        testTitle: testTitle || 'Test',
        score: score || 0,
        correctCount: correctCount || 0,
        wrongCount: wrongCount || 0,
        timeSpent: timeSpent || 0,
        totalQuestions: totalQuestions || 0,
        totalMarks: totalMarks || 0,
      });
      await attempt.save();

      // Also save wrong questions
      if (answers && Array.isArray(answers)) {
        const wrongAnswers = answers.filter(a => !a.isCorrect && a.questionId);
        if (wrongAnswers.length > 0) {
          const wrongDocs = wrongAnswers.map(a => ({
            userId,
            testId,
            questionId: a.questionId,
            questionText: a.questionText || '',
            selectedOption: a.selectedOption,
            correctOption: a.correctOption,
            options: a.options || []
          }));
          await WrongQuestion.insertMany(wrongDocs, { ordered: false }).catch(() => {});
        }
      }

      return res.status(201).json({ success: true, data: attempt });
    }

    // ── BOOKMARK QUESTION ─────────────────────────────────────────────────────
    if (req.method === 'POST' && action === 'bookmark') {
      const { chapterId, questionId, remove } = req.body || {};
      if (!chapterId || !questionId) return res.status(400).json({ error: 'chapterId and questionId required' });

      const update = remove
        ? { $pull: { bookmarkedQuestions: questionId } }
        : { $addToSet: { bookmarkedQuestions: questionId } };

      const updated = await StudentProgress.findOneAndUpdate(
        { userId, chapterId },
        { ...update, $set: { updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: updated });
    }

    // ── GET TEST HISTORY ──────────────────────────────────────────────────────
    if (req.method === 'GET' && action === 'test-history') {
      const attempts = await TestAttempt.find({ userId })
        .sort({ submittedAt: -1 })
        .limit(20)
        .lean();
      return res.status(200).json({ success: true, data: attempts });
    }

    // ── GET WRONG QUESTIONS ───────────────────────────────────────────────────
    if (req.method === 'GET' && action === 'wrong-questions') {
      const { chapterId, limit: lim = 30 } = req.query;
      const query = { userId };
      if (chapterId) query.testId = { $regex: chapterId };
      const questions = await WrongQuestion.find(query)
        .sort({ flaggedAt: -1 })
        .limit(Number(lim))
        .lean();
      return res.status(200).json({ success: true, data: questions });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (err) {
    console.error('Progress v2 Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
