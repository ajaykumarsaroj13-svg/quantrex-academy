const fs = require('fs');
const path = require('path');

function fixFiles(prefix) {
  const files = fs.readdirSync('public/data/questions').filter(f => f.startsWith(prefix) && f.endsWith('.json'));
  let count = 0;
  
  files.forEach(f => {
    const p = path.join('public/data/questions', f);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch(e) { return; }
    
    let modified = false;
    data.forEach(q => {
      // 1. Fix Numerical Type
      if ((q.type === 'MCQ' || q.questionType === 'MCQ') && (!q.options || q.options.length === 0)) {
        q.questionType = 'NUMERICAL';
        q.type = 'NUMERICAL';
        modified = true;
        
        // Also extract correctAnswer for NUMERICAL if it's nested
        if (!q.correctAnswer) {
          if (q.question && q.question.en && q.question.en.answer) {
            q.correctAnswer = q.question.en.answer;
          }
        }
      }
      
      // 2. Fix Multi Correct Type
      if (q.type !== 'NUMERICAL' && q.questionType !== 'NUMERICAL' && q.type !== 'MULTIPLE_CORRECT' && q.questionType !== 'MULTIPLE_CORRECT') {
        const text = ((q.question && q.question.en && q.question.en.content) || q.questionText || '').toLowerCase();
        if (text.includes('one or more') || text.includes('one or more than one')) {
          q.questionType = 'MULTIPLE_CORRECT';
          q.type = 'MULTIPLE_CORRECT';
          modified = true;
        }
      }
      
      // 3. Ensure options format is an array of strings if it exists
      // Wait, options format is usually fine from examgoal.
    });
    
    if (modified) {
      fs.writeFileSync(p, JSON.stringify(data, null, 2));
      count++;
    }
  });
  console.log(`Fixed ${count} files with prefix ${prefix}`);
}

fixFiles('physics_');
fixFiles('chemistry_');
fixFiles('ch_adv_math_');
fixFiles('adv-'); // just in case
