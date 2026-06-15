const fs = require('fs');
const path = require('path');

const dir = 'public/data/questions';
const files = fs.readdirSync(dir).filter(f => f.startsWith('adv-') && f.endsWith('.json'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath));
  let modified = false;

  data.forEach(q => {
    let type = 'SCQ';
    if (!q.options || q.options.length === 0) {
      if (q.year <= 1995) {
        if (q.question && typeof q.question === 'string' && (q.question.toLowerCase().includes('blank') || q.question.includes('.......'))) {
          type = 'FIB';
        } else {
          type = 'SUBJECTIVE';
        }
      } else {
        type = 'NUMERICAL';
      }
    } else {
      let isMulti = false;
      if (Array.isArray(q.correctOptionIndex) && q.correctOptionIndex.length > 1) isMulti = true;
      else if (q.correctAnswer && typeof q.correctAnswer === 'string' && (q.correctAnswer.includes(',') || q.correctAnswer.includes('&'))) isMulti = true;
      else if (q.solution && typeof q.solution === 'string') {
        const sol = q.solution.toUpperCase();
        if (sol.match(/\([A-D]\s*,\s*[A-D]\)/) || sol.match(/[A-D]\s*,\s*[A-D]\s*,\s*[A-D]/) || sol.includes('MORE THAN ONE CORRECT') || sol.includes('MULTIPLE CORRECT')) isMulti = true;
        if (sol.match(/OPTIONS?\s+[A-D]\s+(AND|&)\s+[A-D]/)) isMulti = true;
        if (sol.match(/OPTIONS?\s+\([A-D]\)\s+(AND|&)\s+\([A-D]\)/)) isMulti = true;
        if (sol.includes('A,B') || sol.includes('B,C') || sol.includes('C,D') || sol.includes('A,C') || sol.includes('A, B') || sol.includes('B, C')) isMulti = true;
      }
      if (q.question && typeof q.question === 'string') {
        const qs = q.question.toLowerCase();
        if (qs.includes('more than one correct') || qs.includes('which of the following are correct') || qs.includes('multiple correct') || qs.includes('one or more than one options is/are correct')) isMulti = true;
        
        // Sometimes questions have "Paragraph for"
        if (qs.includes('paragraph for') || qs.includes('comprehension')) type = 'COMPREHENSION';
        else if (qs.includes('match the following') || qs.includes('match list')) type = 'MATCH';
      }
      
      // We will override type if we detected MCQM
      if (isMulti) type = 'MCQM';
      // keep existing MCQM if it was already set
      if (q.type === 'MCQM' || q.questionType === 'MCQM' || q.questionType === 'MULTI_CORRECT') type = 'MCQM';
    }
    
    // Hardcode fix for matrices 2026 based on user feedback
    if (file.includes('matrices') && q.year === 2026 && q.options && q.options.length > 0) {
       type = 'MCQM';
    }
    
    if (q.type !== type) {
      q.type = type;
      modified = true;
      totalFixed++;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
});

console.log(`Finished. Fixed ${totalFixed} questions.`);
