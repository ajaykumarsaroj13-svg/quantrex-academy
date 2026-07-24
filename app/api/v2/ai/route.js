import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, subject = 'Mathematics' } = body;

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      // Fallback AI tutor response if API key is not yet configured in environment variables
      return Response.json({
        success: true,
        answer: `**Quantrex AI Step-by-Step Solution:**\n\nTo solve your ${subject} query:\n\n1. **Formula**: Use standard JEE formula $$\\int f(x) dx$$.\n2. **Steps**: Break down components and apply substitution.\n3. **Result**: Validated solution by A.K. Sir's methodology.\n\n*(Note: Add your GEMINI_API_KEY in Vercel settings for full live AI streaming)*`
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are Quantrex AI 2.0, an expert AI tutor for JEE Main, JEE Advanced, NEET, and CBSE Mathematics & Science. 
Provide clear, step-by-step solutions with LaTeX mathematical equations enclosed in $$...$$ or \\(...\\). Explain clearly like A.K. Sir.`;

    const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${prompt}`);
    const response = await result.response;
    const answer = response.text();

    return Response.json({ success: true, answer });
  } catch (error) {
    console.error('AI Tutor API Error:', error);
    return Response.json({ error: error.message || 'Internal AI Server Error' }, { status: 500 });
  }
}
