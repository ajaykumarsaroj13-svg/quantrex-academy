import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

/**
 * AI Generator for "Attempt Similar Question" (Mistake Booster AI)
 * Uses the Gemini API or OpenAI API to generate a similar question based on the original.
 */
export const generateSimilarQuestion = async (originalQuestion, count = 1) => {
  const { subject, type, questionType, marks, negativeMarks, difficulty, topic } = originalQuestion;
  
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    console.warn('Neither VITE_GEMINI_API_KEY nor VITE_OPENAI_API_KEY is set. Falling back to mock.');
    return generateMockSimilarQuestion(originalQuestion, count);
  }

  const isNDA = subject?.toLowerCase().includes('english') || subject?.toLowerCase().includes('general ability') || subject?.toLowerCase().includes('nda');
  const isMathScience = subject?.toLowerCase().includes('math') || subject?.toLowerCase().includes('physics') || subject?.toLowerCase().includes('chemistry');

  let specificInstructions = "";
  if (isMathScience) {
    specificInstructions = `
    - TARGET EXAM LEVEL: JEE Main and JEE Advanced.
    - The new questions MUST be MORE DIFFICULT and TRICKIER than the original.
    - DO NOT just change the numbers. Twist the concepts, introduce edge cases, or add multi-step logical deductions similar to real JEE Advanced questions (like the Black Book for Mathematics).
    - Ensure the core topic is identical, but the application requires deep thinking.
    `;
  } else if (isNDA) {
    specificInstructions = `
    - TARGET EXAM LEVEL: NDA / General Ability.
    - The new questions MUST be highly realistic and based on CURRENT DATA (current affairs, recent historical context, or modern english usage).
    - Do not give identical questions. Test the same underlying concept/vocabulary/grammar rule but in a completely different, realistic context.
    - The questions should be tricky, mimicking the examiner's mindset.
    `;
  } else {
    specificInstructions = `
    - The new questions MUST be TRICKIER and SLIGHTLY MORE DIFFICULT than the original.
    - Twist the context to make the student think deeply about the underlying concept.
    `;
  }

  const prompt = `
    You are an expert ${subject || 'academic'} examiner. Generate ${count} NEW question(s) testing the SAME concept as the original.
    
    Original Question: ${originalQuestion.questionText || originalQuestion.question || ''}
    Options: ${(originalQuestion.options || []).map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join(', ')}
    Difficulty: ${difficulty || 'Moderate'} | Topic: ${topic || 'General'}
    
    RULES:
    1. ${specificInstructions}
    2. Provide exactly 4 options per question.
    3. correctOption = index of correct answer (0=A, 1=B, 2=C, 3=D). MUST be accurate.
    4. Do NOT include any explanation or solution. Only question, options, and correctOption.
    5. Output ONLY a valid JSON array. No markdown, no extra text.
    
    JSON format: [{"questionText":"...","options":["A","B","C","D"],"correctOption":0}]
  `;

  let text = "";

  const parseResponse = (rawText) => {
    const jsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    let generatedData = JSON.parse(jsonStr);

    if (!Array.isArray(generatedData)) {
      if (generatedData.questionText) {
        generatedData = [generatedData];
      } else {
        throw new Error("Invalid AI response format");
      }
    }

    return generatedData.map((data, index) => ({
      ...originalQuestion,
      id: `similar_${Date.now()}_${index}`,
      isSimilarGenerated: true,
      questionText: data.questionText,
      question: data.questionText,
      options: data.options || [],
      correctOption: data.correctOption,
      correctAnswer: data.correctAnswer,
      explanation: '',
      solution: '',
      subject,
      type,
      questionType,
      marks,
      negativeMarks,
      difficulty,
      topic
    }));
  };

  // Collect all available OpenAI keys (from both slots)
  const allOpenAIKeys = [];
  if (openaiKey && openaiKey.trim().startsWith('sk-')) allOpenAIKeys.push(openaiKey.trim());
  if (geminiKey && geminiKey.trim().startsWith('sk-')) allOpenAIKeys.push(geminiKey.trim());

  // 1. Try ChatGPT (OpenAI) FIRST — user preference
  for (const key of allOpenAIKeys) {
    try {
      console.log('Attempting generation with ChatGPT (OpenAI)...');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert examiner. Respond ONLY with a valid JSON array. No markdown.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          }
        }
      );
      text = response.data.choices[0].message.content;
      return parseResponse(text);
    } catch (err) {
      console.error('ChatGPT generation failed:', err?.response?.data || err.message);
    }
  }

  // 2. Fallback to Gemini if ChatGPT failed
  const pureGeminiKey = geminiKey && !geminiKey.trim().startsWith('sk-') ? geminiKey.trim() : null;
  if (pureGeminiKey) {
    try {
      console.log('Attempting generation with Gemini...');
      const genAI = new GoogleGenerativeAI(pureGeminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
      return parseResponse(text);
    } catch (err) {
      console.error('Gemini generation failed:', err);
    }
  }

  // 3. Fallback to mock
  console.warn('All AI generation engines failed. Falling back to mock generator.');
  return generateMockSimilarQuestion(originalQuestion, count);
};

const generateMockSimilarQuestion = async (originalQuestion, count = 1) => {
  // Simulate AI generation delay (1.5 - 2.5 seconds)
  const delay = Math.floor(Math.random() * 1000) + 1500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const { subject, type, questionType, marks, negativeMarks, difficulty, topic } = originalQuestion;
  const mockQuestions = [];

  for (let i = 0; i < count; i++) {
    let newQuestionText = originalQuestion.questionText || originalQuestion.question || '';
    let newOptions = [...(originalQuestion.options || [])];
    
    // Convert correctOption safely
    let newCorrectOption = originalQuestion.correctOption;
    if (typeof newCorrectOption === 'string') {
      const parsedOpt = newCorrectOption.toUpperCase().charCodeAt(0) - 65;
      if (!isNaN(parsedOpt) && parsedOpt >= 0 && parsedOpt < 4) {
        newCorrectOption = parsedOpt;
      }
    }
    
    let newCorrectAnswer = originalQuestion.correctAnswer || originalQuestion.correctOption;
    let newExplanation = `⚠️ [DEMO MODE FALLBACK] Your Gemini API key is currently invalid or expired. To generate real, unique variations with detailed step-by-step solutions, please update your VITE_GEMINI_API_KEY environment variable.`;

    // Prepend a warning tag to the question text
    newQuestionText = `<div class="text-red-500 font-bold mb-2">⚠️ [DEMO MODE FALLBACK - Invalid Gemini API Key]</div>` + newQuestionText;

    mockQuestions.push({
      ...originalQuestion,
      id: `similar_${Date.now()}_${i}`,
      isSimilarGenerated: true,
      questionText: newQuestionText,
      question: newQuestionText,
      options: newOptions,
      correctOption: newCorrectOption,
      correctAnswer: newCorrectAnswer,
      explanation: newExplanation,
      solution: newExplanation,
      subject,
      type,
      questionType,
      marks,
      negativeMarks,
      difficulty,
      topic
    });
  }

  return mockQuestions;
};
