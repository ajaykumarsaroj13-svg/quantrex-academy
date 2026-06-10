const fs = require('fs');
const path = require('path');
const dir = 'public/data/questions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let testPapers = new Set();
let mainsQuestions = 0;
let advQuestions = 0;

files.forEach(f => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const items = Array.isArray(data) ? data : [data];
    items.forEach(q => {
       if (q.exam && q.year) {
          const key = `${q.exam} - ${q.year} - ${q.session || ''} - ${q.shift || ''}`;
          testPapers.add(key.trim());
          if (q.exam.includes('Main')) mainsQuestions++;
          if (q.exam.includes('Advanced')) advQuestions++;
       }
    });
  } catch(e) {}
});

console.log('Total unique test papers:', testPapers.size);
console.log('JEE Main Questions:', mainsQuestions);
console.log('JEE Advanced Questions:', advQuestions);
// Print some test papers
console.log(Array.from(testPapers).slice(0, 10));
