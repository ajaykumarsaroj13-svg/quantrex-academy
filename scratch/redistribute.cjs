const fs = require('fs');
const path = require('path');

const WEB_DIR = path.join(__dirname, '../public/data/tests');
const MOB_DIR = path.join(__dirname, '../../../quantrex-mobile/public/data/tests');
const SCRAPED_FILE = path.join(__dirname, '../scraped_ultimate_questions.json');

function cleanHtml(html) { return html ? html.trim() : ''; }

function transformFromAnalysis(rawQ, index, defaultSubject) {
  const en = rawQ.question?.en || {};
  const questionText = cleanHtml(en.content || '');
  const options = (en.options || []).map(o => cleanHtml(o.content || ''));

  let correctOption = 0;
  let correctOptionsArray = [];
  const rawCorrect = en.correct_options || [];
  if (rawCorrect.length > 0) {
    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    correctOptionsArray = rawCorrect.map(l => map[l] ?? 0);
    correctOption = correctOptionsArray[0] ?? 0;
  }
  const correctAnswer = (en.answer !== undefined && en.answer !== null) ? String(en.answer).trim() : '';

  let questionType = 'MCQ';
  const typeStr = (rawQ.type || '').toLowerCase();
  if (typeStr === 'integer' || typeStr === 'numerical' || typeStr === 'nat' || options.length === 0) {
    questionType = 'NUMERICAL';
  } else if (rawCorrect.length > 1) {
    questionType = 'MULTI_CORRECT';
  }

  let subject = defaultSubject || 'Mathematics';
  const subj = (rawQ.subject || '').toLowerCase();
  if (subj.includes('physics')) subject = 'Physics';
  else if (subj.includes('chem')) subject = 'Chemistry';
  else if (subj.includes('math')) subject = 'Mathematics';

  return {
    id: rawQ.questionId || `q_${Math.random().toString(36).substring(2, 10)}`,
    questionNumber: index + 1,
    questionText,
    options,
    correctOption,
    correctAnswer,
    correctOptionsArray,
    questionType,
    marks: rawQ.marks ?? 4,
    negativeMarks: rawQ.negMarks ?? -1,
    subject,
    topic: rawQ.chapter || rawQ.topic || '',
    difficulty: rawQ.difficulty ? rawQ.difficulty.charAt(0).toUpperCase() + rawQ.difficulty.slice(1) : 'Medium',
    solution: cleanHtml(en.explanation || ''),
    section: questionType === 'NUMERICAL' ? 'B' : 'A',
    instruction: questionType === 'NUMERICAL' ? 'Enter the correct numerical value.' : 'Select the correct option.',
    examSource: 'jee-main'
  };
}

const scrapedData = JSON.parse(fs.readFileSync(SCRAPED_FILE, 'utf8'));

let count = 0;
const tests = Array.isArray(scrapedData) ? scrapedData : Object.values(scrapedData); for (const testData of tests) {
    const testId = testData.testId;
    if (!testId || !testData.data || !testData.data.sections) continue;

    const webPath = path.join(WEB_DIR, `${testId}.json`);
    const mobPath = path.join(MOB_DIR, `${testId}.json`);

    if (!fs.existsSync(webPath)) continue;

    const existingTest = JSON.parse(fs.readFileSync(webPath, 'utf8'));
    const defaultSubject = existingTest.questions?.[0]?.subject || 'Mathematics';
    
    const sections = testData.data.sections;
    const flatQ = [];
    let idx = 0;
    
    for (const sec of sections) {
        for (const q of (sec.questions || [])) {
            flatQ.push(transformFromAnalysis(q, idx++, defaultSubject));
        }
    }
    
    if (flatQ.length > 0) {
        existingTest.questions = flatQ;
        existingTest.totalQuestions = flatQ.length;
        
        fs.writeFileSync(webPath, JSON.stringify(existingTest, null, 2));
        if (fs.existsSync(mobPath)) {
            fs.writeFileSync(mobPath, JSON.stringify(existingTest, null, 2));
        }
        count++;
    }
}
console.log(`Successfully updated ${count} tests from scraped_ultimate_questions.json`);
