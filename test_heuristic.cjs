const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/questions/adv-matrices-and-determinants.json'));

let counts = { SCQ: 0, MCQM: 0, NUMERICAL: 0, FIB: 0, SUBJECTIVE: 0 };

data.forEach(q => {
  let type = 'SCQ';
  if (!q.options || q.options.length === 0) {
    if (q.year <= 1995) {
      if (q.question.toLowerCase().includes('blank') || q.question.includes('.......')) {
        type = 'FIB';
      } else {
        type = 'SUBJECTIVE';
      }
    } else {
      type = 'NUMERICAL';
    }
  } else {
    // Has options
    let isMulti = false;
    if (Array.isArray(q.correctOptionIndex) && q.correctOptionIndex.length > 1) isMulti = true;
    else if (q.correctAnswer && (q.correctAnswer.includes(',') || q.correctAnswer.includes('&'))) isMulti = true;
    else if (q.solution) {
      const sol = q.solution.toUpperCase();
      if (sol.match(/\([A-D]\s*,\s*[A-D]\)/) || sol.match(/[A-D]\s*,\s*[A-D]\s*,\s*[A-D]/) || sol.includes('MORE THAN ONE CORRECT') || sol.includes('MULTIPLE CORRECT')) {
        isMulti = true;
      }
      if (sol.match(/OPTIONS?\s+[A-D]\s+(AND|&)\s+[A-D]/)) isMulti = true;
      if (sol.match(/OPTIONS?\s+\([A-D]\)\s+(AND|&)\s+\([A-D]\)/)) isMulti = true;
      if (sol.includes('A,B') || sol.includes('B,C') || sol.includes('C,D') || sol.includes('A,C') || sol.includes('A, B') || sol.includes('B, C')) isMulti = true;
    }
    if (q.question) {
      const qs = q.question.toLowerCase();
      if (qs.includes('more than one correct') || qs.includes('which of the following are correct') || qs.includes('multiple correct')) isMulti = true;
    }
    
    // Check if the original type was MCQM to preserve previous overrides
    if (q.type === 'MCQM' || q.questionType === 'MCQM') isMulti = true;

    if (isMulti) type = 'MCQM';
    else type = 'SCQ';
  }
  
  q.newType = type;
  counts[type]++;
});

console.log("Counts:", counts);
