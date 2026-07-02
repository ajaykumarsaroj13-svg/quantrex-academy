/**
 * /api/v2/ai.js
 * AI Features API - Doubt Solver, Similar Questions, Recommendations
 * Uses Google Gemini API (already installed in project)
 */
import { connectToDatabase } from '../utils/db.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt, imageBase64 = null) {
  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.unshift({
      inline_data: {
        mime_type: 'image/jpeg',
        data: imageBase64
      }
    });
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response';
}

export default async function handler(req, res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { action, question, imageBase64, topic, wrongQuestions, subject } = req.body || {};

  try {
    // ── AI DOUBT SOLVER ───────────────────────────────────────────────────────
    if (action === 'solve-doubt') {
      if (!question && !imageBase64) {
        return res.status(400).json({ error: 'Question text or image required' });
      }

      const prompt = `You are an expert Mathematics teacher for JEE/NDA preparation at Quantrex Academy.

${question ? `Student's Question: ${question}` : 'Solve the mathematical problem shown in the image.'}

Please provide:
1. **Complete Step-by-Step Solution** with clear working
2. **Key Concept Used** 
3. **Common Mistakes to Avoid**
4. **Similar Problem Hint** (brief)

Use LaTeX notation for math: $formula$ for inline, $$formula$$ for display math.
Keep language simple and educational. Focus on understanding, not just the answer.`;

      const solution = await callGemini(prompt, imageBase64);
      return res.status(200).json({ success: true, solution, action: 'solve-doubt' });
    }

    // ── GENERATE SIMILAR QUESTIONS ────────────────────────────────────────────
    if (action === 'similar-questions') {
      if (!wrongQuestions || wrongQuestions.length === 0) {
        return res.status(400).json({ error: 'wrongQuestions array required' });
      }

      const questionsList = wrongQuestions.slice(0, 3).map((q, i) =>
        `Q${i + 1}: ${q.questionText?.substring(0, 200) || 'Math question'}`
      ).join('\n');

      const prompt = `You are a Mathematics question creator for JEE/NDA preparation.

Based on these questions that a student got WRONG:
${questionsList}

Generate 3 NEW similar practice questions (same concept, different numbers/values).

Format each question as JSON:
{
  "questions": [
    {
      "questionText": "...",
      "options": ["(A) ...", "(B) ...", "(C) ...", "(D) ..."],
      "correctOption": 0,
      "solution": "Step-by-step solution...",
      "topic": "topic name"
    }
  ]
}

Use LaTeX for math formulas. Make questions JEE-level difficulty.`;

      const response = await callGemini(prompt);

      // Try to parse JSON from response
      let questions = [];
      try {
        const jsonMatch = response.match(/\{[\s\S]*"questions"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          questions = parsed.questions || [];
        }
      } catch (e) {
        // Return raw response if JSON parse fails
        return res.status(200).json({ success: true, rawResponse: response, questions: [] });
      }

      return res.status(200).json({ success: true, questions });
    }

    // ── TOPIC RECOMMENDATIONS ─────────────────────────────────────────────────
    if (action === 'recommendations') {
      const { weakTopics = [], strongTopics = [], targetExam = 'JEE Main' } = req.body || {};

      const prompt = `You are a study advisor for ${targetExam} Mathematics preparation.

Student's weak topics: ${weakTopics.join(', ') || 'Not specified'}
Student's strong topics: ${strongTopics.join(', ') || 'Not specified'}

Provide a personalized 7-day study plan in JSON:
{
  "plan": [
    {
      "day": 1,
      "focus": "topic name",
      "reason": "why this topic",
      "tasks": ["task 1", "task 2"],
      "estimatedHours": 2
    }
  ],
  "priority_topics": ["topic1", "topic2"],
  "tip": "overall study tip"
}`;

      const response = await callGemini(prompt);
      let plan = null;
      try {
        const jsonMatch = response.match(/\{[\s\S]*"plan"[\s\S]*\}/);
        if (jsonMatch) plan = JSON.parse(jsonMatch[0]);
      } catch (e) {}

      return res.status(200).json({ success: true, plan, rawResponse: plan ? undefined : response });
    }

    // ── GENERATE SOLUTION ─────────────────────────────────────────────────────
    if (action === 'generate-solution') {
      if (!question) return res.status(400).json({ error: 'question required' });

      const prompt = `Solve this Mathematics problem completely for a JEE/NDA student:

${question}

Provide:
- Complete solution with all steps
- Final answer highlighted  
- Key formula used
- Marks: indicate if this is 4 marks or more

Use LaTeX: $inline$ and $$display$$ for formulas.`;

      const solution = await callGemini(prompt);
      return res.status(200).json({ success: true, solution });
    }

    return res.status(400).json({
      error: 'Invalid action. Use: solve-doubt | similar-questions | recommendations | generate-solution'
    });

  } catch (err) {
    console.error('AI API v2 Error:', err);
    return res.status(500).json({ error: 'AI Service Error', message: err.message });
  }
}
