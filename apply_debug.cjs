const fs = require('fs');

function cleanHtml(html) { return html ? html.trim() : ''; }

function transformQuestion(rawQ, index, defaultSubject) {
  const content = rawQ.questionText || rawQ.content || rawQ.text || rawQ.question || '';
  const rawOptions = rawQ.options || [];
  const options = rawOptions.map(o => cleanHtml(typeof o === 'string' ? o : (o.content || o.text || o.value || o.option || '')));

  let correctOptionIndex = rawQ.correctOption ?? rawQ.correctOptionIndex ?? 0;
  if (typeof correctOptionIndex === 'string') {
    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    correctOptionIndex = map[correctOptionIndex] ?? parseInt(correctOptionIndex) ?? 0;
  }

  const qType = rawQ.questionType || rawQ.type || (options.length === 0 ? 'NUMERICAL' : 'MCQ');
  
  let subject = defaultSubject || 'Mathematics';
  const subj = (rawQ.subject || '').toLowerCase();
  if (subj.includes('physics')) subject = 'Physics';
  else if (subj.includes('chem')) subject = 'Chemistry';
  else if (subj.includes('math')) subject = 'Mathematics';

  const section = qType === 'NUMERICAL' ? 'B' : 'A';

  return {
    id: rawQ.id || rawQ._id || rawQ.questionId || `q_${Math.random().toString(36).slice(2, 10)}`,
    questionNumber: index + 1,
    questionText: cleanHtml(content),
    options,
    correctOption: correctOptionIndex,
    correctAnswer: rawQ.correctAnswer || rawQ.numericalAnswer || rawQ.answer || '',
    questionType: qType,
    marks: rawQ.marks ?? 4,
    negativeMarks: rawQ.negativeMarks ?? -1,
    subject,
    topic: rawQ.topic || rawQ.chapter || '',
    difficulty: rawQ.difficulty || 'Medium',
    solution: rawQ.solution || rawQ.explanation || '',
    section,
    instruction: rawQ.instruction || (qType === 'NUMERICAL' ? 'Enter the correct numerical value.' : 'Select the correct option.'),
    examSource: 'ultimate-series-2027'
  };
}

const data = JSON.parse(fs.readFileSync('debug_fetch.json', 'utf8')).data;
const qs = data.questions || (Array.isArray(data) ? data : null) || data.test?.questions || data.sections?.flatMap(s => s.questions || []) || data.testSections?.flatMap(s => s.questions || []);

const existing = JSON.parse(fs.readFileSync('public/data/tests/tst-19g61moahy6ef.json', 'utf8'));
const defaultSubject = existing.questions?.[0]?.subject || 'Mathematics';

const flatQ = qs.map((q, idx) => transformQuestion(q, idx, defaultSubject));
existing.questions = flatQ;
existing.totalQuestions = flatQ.length;

fs.writeFileSync('public/data/tests/tst-19g61moahy6ef.json', JSON.stringify(existing, null, 2));
fs.writeFileSync('../quantrex-mobile/public/data/tests/tst-19g61moahy6ef.json', JSON.stringify(existing, null, 2));
console.log('Successfully updated tst-19g61moahy6ef with', flatQ.length, 'questions');
