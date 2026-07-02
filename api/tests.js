import { connectToDatabase, TestAttempt, WrongQuestion } from './utils/db.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();

    // 1. GET: Load test attempts / results
    if (req.method === 'GET') {
      const { userId, testId, type } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Load wrong questions list for Mistake Booster
      if (type === 'wrong') {
        const wrongQs = await WrongQuestion.find({ userId }).lean();
        return res.status(200).json(wrongQs);
      }

      // Load specific test attempt or all attempts
      const query = { userId };
      if (testId) query.testId = testId;

      const attempts = await TestAttempt.find(query).sort({ submittedAt: -1 }).lean();
      return res.status(200).json(attempts);
    }

    // 2. POST: Submit test attempt
    if (req.method === 'POST') {
      const {
        userId,
        testId,
        testTitle,
        score,
        correctCount,
        wrongCount,
        timeSpent,
        totalQuestions,
        totalMarks,
        wrongQuestions
      } = req.body;

      if (!userId || !testId || !testTitle) {
        return res.status(400).json({ error: 'userId, testId, and testTitle are required' });
      }

      // Save test attempt metadata
      const newAttempt = new TestAttempt({
        userId,
        testId,
        testTitle,
        score,
        correctCount,
        wrongCount,
        timeSpent,
        totalQuestions,
        totalMarks
      });
      await newAttempt.save();

      // Clear previous wrong questions of this test for the user to avoid duplicate entries
      await WrongQuestion.deleteMany({ userId, testId });

      // Save new wrong questions (for Mistake Booster)
      if (Array.isArray(wrongQuestions) && wrongQuestions.length > 0) {
        const wrongQDocuments = wrongQuestions.map(q => ({
          userId,
          testId,
          questionId: q.questionId,
          questionText: q.questionText,
          selectedOption: q.selectedOption,
          correctOption: q.correctOption,
          options: q.options || []
        }));

        await WrongQuestion.insertMany(wrongQDocuments);
      }

      return res.status(201).json({
        success: true,
        attempt: newAttempt,
        wrongCountSaved: wrongQuestions ? wrongQuestions.length : 0
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (err) {
    console.error('Tests API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
