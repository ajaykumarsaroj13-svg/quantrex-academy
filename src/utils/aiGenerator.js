import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

/**
 * AI Generator for "Attempt Similar Question" (Mistake Booster AI)
 * Uses the Gemini API or OpenAI API to generate a similar question based on the original.
 */
export const generateSimilarQuestion = async (originalQuestion, count = 1) => {
  const { subject, type, questionType, marks, negativeMarks, difficulty, topic } = originalQuestion;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

  // Fallback to mock generation if API key is missing
  if (!apiKey) {
    console.warn('AI API key is not set. Falling back to mock generator.');
    return generateMockSimilarQuestion(originalQuestion, count);
  }

  const isOpenAI = apiKey.trim().startsWith('sk-');

  try {
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
      You are an expert ${subject || 'academic'} examiner creating highly challenging test questions for students.
      
      I have a question that the student got wrong or skipped. I want you to create ${count} NEW question(s) that test the exact same concept.
      
      Original Question:
      ${originalQuestion.questionText || originalQuestion.question || ''}
      
      Options:
      ${(originalQuestion.options || []).map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}
      
      Original Solution/Explanation:
      ${originalQuestion.explanation || originalQuestion.solution || ''}
      
      Difficulty: ${difficulty || 'Moderate'}
      Topic: ${topic || 'General'}
      
      REQUIREMENTS:
      1. ${specificInstructions}
      2. Provide 4 options for each question (if the original was multiple choice).
      3. Provide the correct option index (0 for A, 1 for B, 2 for C, 3 for D).
      4. Provide a HIGH-QUALITY, very detailed, step-by-step teacher-level solution/explanation for EACH new question.
      5. Output the result ONLY as a valid JSON ARRAY of objects, no markdown formatting outside the JSON. The array must contain exactly ${count} objects.
      
      Structure for each object in the JSON array:
      {
        "questionText": "The new challenging question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctOption": 2,
        "explanation": "Extremely detailed step-by-step solution"
      }
    `;

    let text = "";
    if (isOpenAI) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert academic examiner. Respond ONLY with a valid JSON array of objects, with no markdown formatting outside the JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      text = response.data.choices[0].message.content;
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    }
    
    // Parse the JSON response
    // Remove markdown code blocks if the model wrapped it
    const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    let generatedData = JSON.parse(jsonStr);

    // Ensure it's an array
    if (!Array.isArray(generatedData)) {
      if (generatedData.questionText) {
        generatedData = [generatedData]; // Wrap single object in array
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
      explanation: data.explanation,
      solution: data.explanation,
      subject,
      type,
      questionType,
      marks,
      negativeMarks,
      difficulty,
      topic
    }));
  } catch (error) {
    console.error('Error generating similar question with Gemini:', error);
    // Fallback to mock on error (e.g. rate limit, network issue)
    return generateMockSimilarQuestion(originalQuestion, count);
  }
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
