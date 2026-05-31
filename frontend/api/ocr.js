export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // allow large images/pdfs
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { inlineData } = req.body;
    
    if (!inlineData || !inlineData.data || !inlineData.mimeType) {
      return res.status(400).json({ error: 'Missing inlineData in request body' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const systemPrompt = `You are a highly advanced AI Paper Scanner for JEE Mathematics.
Your task is to analyze the provided image/pdf of an examination paper and extract all the questions, their multiple-choice options, and determine the correct answer if possible.
You MUST output ONLY a valid JSON array of objects, with NO markdown formatting, NO backticks, and NO additional text. 
Strictly use this JSON schema for each question object:
{
  "questionText": "The mathematical question text (use LaTeX formatting like $x^2$ or $$y=mx+c$$ where appropriate)",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctOption": <integer from 0 to 3 indicating the index of the correct option, or 0 if unknown>,
  "marks": 4,
  "negativeMarks": -1,
  "subject": "Mathematics",
  "explanation": "Brief explanation of the correct answer, if you can deduce it."
}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType: inlineData.mimeType,
                data: inlineData.data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return res.status(500).json({ error: 'Failed to process image with Gemini AI.' });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini output as JSON:', generatedText);
      return res.status(500).json({ error: 'AI did not return valid JSON' });
    }

    return res.status(200).json({ questions: parsedQuestions });
  } catch (error) {
    console.error('OCR Endpoint Error:', error);
    return res.status(500).json({ error: 'Internal Server Error during OCR processing' });
  }
}
