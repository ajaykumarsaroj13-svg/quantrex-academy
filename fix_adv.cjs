
const fs = require('fs');
const path = require('path');
const dir = 'public/data/questions';
const files = fs.readdirSync(dir);
let modifiedCount = 0;

for (const file of files) {
  if (!file.endsWith('.json')) continue;
  const p = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  let qs = data.questions ? Object.values(data.questions)[0] : data;
  if (!Array.isArray(qs)) qs = [qs];
  
  let changedFile = false;
  
  for (const q of qs) {
    if (q.title && q.title.includes('Advanced') && q.solution) {
      // Find all options mentioned as correct
      const regex = /Option\s*\(([A-E])\)\s*is\s*correct/gi;
      let match;
      const correctChars = new Set();
      while ((match = regex.exec(q.solution)) !== null) {
        correctChars.add(match[1].toUpperCase());
      }
      // Or 'Options (A), (B) and (C) are correct'
      const regex2 = /Options?\s*((?:\([A-E]\)(?:,\s*|\s*and\s*)*)+)\s*(?:is|are)\s*correct/gi;
      while ((match = regex2.exec(q.solution)) !== null) {
        const chars = match[1].match(/[A-E]/g) || [];
        chars.forEach(c => correctChars.add(c));
      }
      
      if (correctChars.size > 0) {
        const arr = Array.from(correctChars).map(c => c.charCodeAt(0) - 65).sort();
        if (arr.length > 1 || q.type === 'MCQ' || q.type === 'SCQ') {
          if (arr.length > 1) {
            q.type = 'MULTIPLE_CORRECT';
          } else {
            q.type = 'SINGLE_CORRECT';
          }
          q.correctOptionsArray = arr;
          q.correctOptionIndex = arr[0];
          q.correctOption = arr[0]; // for consistency
          changedFile = true;
        }
      }
    }
  }
  
  if (changedFile) {
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    modifiedCount++;
  }
}
console.log('Modified files:', modifiedCount);
