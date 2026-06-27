const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/data/questions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let totalFixed = 0;

function categorizeQuestion(q) {
  const t = q.type || q.questionType || '';
  const tc = t.toUpperCase();
  const sol = q.solution ? q.solution.toUpperCase() : '';
  const ans = typeof q.correctAnswer === 'string' ? q.correctAnswer.toUpperCase() : '';
  
  // 1. MATCH
  if (tc === 'MATCH' || tc === 'MATCH THE FOLLOWING' || (q.options && q.options.some(o => o.includes('->')))) {
    return 'MATCH';
  }
  
  // 2. COMPREHENSION
  if (tc === 'COMPREHENSION' || q.passageId) {
    return 'COMPREHENSION';
  }
  
  // 3. TRUE_FALSE
  if (q.options && q.options.length === 2) {
    const o1 = q.options[0].toUpperCase();
    const o2 = q.options[1].toUpperCase();
    if ((o1.includes('TRUE') && o2.includes('FALSE')) || (o1 === 'T' && o2 === 'F') || tc === 'TRUE_FALSE' || tc === 'TRUE OR FALSE') {
      return 'TRUE_FALSE';
    }
  }

  // 4. FIB (Fill in the blanks)
  const qStr = typeof q.question === 'string' ? q.question : (q.question?.en?.content || q.question?.en || '');
  if (tc === 'FIB' || tc === 'FILL IN THE BLANKS' || qStr.includes('____')) {
    return 'FIB';
  }

  // 5. MCQM (Multi Correct)
  let isMulti = false;
  if (Array.isArray(q.correctOptionIndex) && q.correctOptionIndex.length > 1) isMulti = true;
  else if (ans && (ans.includes(',') || ans.includes('&') || ans.includes('AND'))) isMulti = true;
  else if (sol.match(/\([A-D]\s*,\s*[A-D]\)/) || sol.match(/[A-D]\s*,\s*[A-D]\s*,\s*[A-D]/)) isMulti = true;
  else if (sol.includes('MORE THAN ONE CORRECT') || sol.includes('MULTIPLE CORRECT')) isMulti = true;
  else if (sol.match(/OPTIONS?\s+[A-D]\s+(AND|&)\s+[A-D]/)) isMulti = true;
  else if (qStr.toUpperCase().includes('ONE OR MORE THAN ONE')) isMulti = true;
  else if (tc === 'MCQM' || tc === 'MULTI_CORRECT') isMulti = true;
  
  if (isMulti && q.options && q.options.length >= 2) return 'MCQM';

  // 6. SCQ (Single Correct)
  if (q.options && q.options.length >= 2) {
    return 'SCQ';
  }

  // No options (length 0) -> Numerical or Subjective
  // 7. NUMERICAL
  if (tc === 'NUMERICAL') {
    return 'NUMERICAL';
  }
  
  if (ans && !ans.includes('\\') && !ans.includes('SOLVE IT') && !ans.includes('X') && !ans.includes('Y')) {
    if (/^-?\d+(\.\d+)?(\/\d+)?$/.test(ans)) return 'NUMERICAL';
  }

  // 8. SUBJECTIVE
  if (tc === 'SUBJECTIVE') return 'SUBJECTIVE';
  
  return tc === 'SCQ' ? 'SCQ' : (q.options && q.options.length > 0 ? 'SCQ' : 'SUBJECTIVE');
}

for (const file of files) {
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let changed = false;
  
  for (const q of data) {
    const newType = categorizeQuestion(q);
    if (q.type !== newType) {
      q.type = newType;
      changed = true;
      totalFixed++;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}

console.log('Total questions fixed:', totalFixed);
