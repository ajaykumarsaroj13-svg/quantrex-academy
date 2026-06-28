const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, '../public/data/tests');
const QUESTIONS_DIR = path.join(__dirname, '../public/data/questions');

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function loadTopicQuestions(topic) {
  if (!topic) return [];
  const p = path.join(QUESTIONS_DIR, topic + '.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return [];
}

const testFiles = fs.readdirSync(TESTS_DIR).filter(f => f.endsWith('.json'));
let updatedCount = 0;

for (const file of testFiles) {
  const filePath = path.join(TESTS_DIR, file);
  try {
    const testData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const totalQuestions = testData.questions ? testData.questions.length : 0;
    
    if (totalQuestions === 0) continue;
    
    let targetMCQ = 0;
    let targetNUM = 0;
    
    if (totalQuestions === 15) {
      targetMCQ = 10;
      targetNUM = 5;
    } else if (totalQuestions === 30) {
      targetMCQ = 20;
      targetNUM = 10;
    } else if (totalQuestions === 90) {
      targetMCQ = 20;
      targetNUM = 10;
    } else {
      continue;
    }
    
    const subjectTopics = {};
    testData.questions.forEach(q => {
      if (!subjectTopics[q.subject]) subjectTopics[q.subject] = new Set();
      if (q.topic && q.topic !== 'General') subjectTopics[q.subject].add(q.topic);
    });
    
    let newQuestions = [];
    const subjects = Object.keys(subjectTopics);
    
    for (const subject of subjects) {
      let allQuestions = [];
      for (const topic of subjectTopics[subject]) {
        allQuestions = allQuestions.concat(loadTopicQuestions(topic));
      }
      
      if (allQuestions.length === 0) {
        allQuestions = testData.questions.filter(q => q.subject === subject);
      }
      
      let mcqs = allQuestions.filter(q => q.type === 'SCQ' || q.type === 'MCQM' || q.questionType === 'MCQ' || q.questionType === 'SCQ');
      let nums = allQuestions.filter(q => q.type === 'NUMERICAL' || q.questionType === 'NUMERICAL');
      
      mcqs = shuffle(mcqs);
      nums = shuffle(nums);
      
      let selectedMcqs = mcqs.slice(0, targetMCQ);
      let selectedNums = nums.slice(0, targetNUM);
      
      // Fallback
      if (selectedMcqs.length < targetMCQ) {
         const existing = testData.questions.filter(q => q.subject === subject && q.questionType !== 'NUMERICAL');
         selectedMcqs = existing.slice(0, targetMCQ);
         // If still not enough, pad with empty questions or reuse
         while(selectedMcqs.length < targetMCQ && existing.length > 0) {
            selectedMcqs.push(existing[0]);
         }
      }
      if (selectedNums.length < targetNUM) {
         const existing = testData.questions.filter(q => q.subject === subject && q.questionType === 'NUMERICAL');
         selectedNums = existing.slice(0, targetNUM);
         while(selectedNums.length < targetNUM && existing.length > 0) {
            selectedNums.push(existing[0]);
         }
      }
      
      let qNum = newQuestions.length + 1;
      const formattedMcqs = selectedMcqs.map(q => ({
        id: q.question_id || q.id || '',
        questionNumber: qNum++,
        questionText: q.question || q.questionText || '',
        options: q.options || [],
        correctOption: q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correctOption,
        correctAnswer: null,
        questionType: 'MCQ',
        marks: 4,
        negativeMarks: -1,
        subject: subject,
        topic: q.topic || 'General',
        difficulty: 'Easy',
        solution: q.solution || '',
        section: 'A',
        instruction: q.instruction || '',
        examSource: 'jee-main'
      }));
      
      const formattedNums = selectedNums.map(q => ({
        id: q.question_id || q.id || '',
        questionNumber: qNum++,
        questionText: q.question || q.questionText || '',
        options: [],
        correctOption: null,
        correctAnswer: q.correctAnswer || '',
        questionType: 'NUMERICAL',
        marks: 4,
        negativeMarks: -1,
        subject: subject,
        topic: q.topic || 'General',
        difficulty: 'Easy',
        solution: q.solution || '',
        section: 'B',
        instruction: q.instruction || '',
        examSource: 'jee-main'
      }));
      
      newQuestions = newQuestions.concat(formattedMcqs, formattedNums);
    }
    
    testData.questions = newQuestions;
    fs.writeFileSync(filePath, JSON.stringify(testData, null, 2), 'utf8');
    updatedCount++;
  } catch (e) {
    console.error(`Failed ${file}: ${e.message}`);
  }
}
console.log(`Rebalanced ${updatedCount} test files!`);
