const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    let fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) walk(fp, cb);
    else if (fp.endsWith('.json')) cb(fp);
  });
}

let count = 0;
walk('public/data/questions', f => {
  try {
    const d = JSON.parse(fs.readFileSync(f));
    let modified = false;
    d.forEach(q => {
      // Fix NDA (or any) where correctOptionIndex is -1
      if (q.correctOptionIndex === -1 && q.options && q.options.length > 0) {
        if (q.rawData && q.rawData.question && q.rawData.question.en && q.rawData.question.en.correct_options) {
          const cOpts = q.rawData.question.en.correct_options;
          if (cOpts.length > 0) {
            const idx = parseInt(cOpts[0], 10) - 1;
            if (!isNaN(idx) && idx >= 0 && idx < q.options.length) {
              q.correctOptionIndex = idx;
              q.correctAnswer = q.options[idx];
              modified = true;
              count++;
            }
          }
        }
      }
      
      // Fix JEE Advanced Multi Correct
      if (q.exam === 'jee-advanced' && q.questionType !== 'MULTIPLE_CORRECT' && q.questionType !== 'NUMERICAL') {
        const text = (q.question || '').toLowerCase();
        if (text.includes('one or more') || text.includes('one or more than one')) {
          q.questionType = 'MULTIPLE_CORRECT';
          modified = true;
          // In this case, we don't know the exact multiple options unless we parse the solution,
          // but at least it won't be in the Single Correct section anymore.
        }
      }
    });
    if (modified) {
      fs.writeFileSync(f, JSON.stringify(d, null, 2));
    }
  } catch(e) {}
});

console.log('Fixed', count, 'NDA/correctOptionIndex questions, and updated some JEE Advanced questions.');
