import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('quantrexacadmy/public/data/questions');
let count = 0;
for (const file of files) {
  if (!file.endsWith('.json')) continue;
  const data = JSON.parse(fs.readFileSync(path.join('quantrexacadmy/public/data/questions', file), 'utf8'));
  for (const q of data) {
    if (q.exam === 'jee-advanced') {
      count++;
    }
  }
}
console.log('Local JEE Advanced count:', count);
