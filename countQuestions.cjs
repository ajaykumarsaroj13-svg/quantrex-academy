const fs = require('fs');
const path = require('path');
const dir = 'public/data/questions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let testPapers = [];
files.forEach(f => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (Array.isArray(data)) {
        testPapers.push(...data);
    } else {
        testPapers.push(data);
    }
  } catch(e) {}
});
console.log('Total JSON files:', files.length);
console.log('Total tests/questions found inside:', testPapers.length);
