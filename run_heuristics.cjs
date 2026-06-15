const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'data', 'questions');
const files = fs.readdirSync(dir).filter(f => f.startsWith('adv-') && f.endsWith('.json'));

let totalFixed = 0;

for (const f of files) {
  let filepath = path.join(dir, f);
  let data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  let modified = false;

  for (let q of data) {
    if (q.type === 'NUMERICAL' || q.type === 'SUBJECTIVE') continue;
    
    // Explicit manual fix for the 2026 inverse question
    if (q.question_id === 'mp9u9lac') {
       q.type = 'MCQM';
       q.correctOptionIndex = [0, 2, 3]; // A, C, D
       modified = true;
       totalFixed++;
       continue;
    }

    // Heuristics
    const sol = (q.solution || '').toUpperCase();
    
    // Look for phrases indicating multiple options
    // e.g. "OPTIONS A AND B", "OPTIONS (A), (C)", "OPTIONS A, B, C", "A, B AND C ARE CORRECT"
    // Just find all mentions of "OPTION (A) IS CORRECT" etc.
    let correctChars = new Set();
    
    if (sol.includes('A AND B ARE CORRECT') || sol.includes('A, B ARE CORRECT')) { correctChars.add(0); correctChars.add(1); }
    if (sol.includes('A AND C ARE CORRECT') || sol.includes('A, C ARE CORRECT')) { correctChars.add(0); correctChars.add(2); }
    // Let's do a regex for "OPTION (A)" etc.
    
    const statements = sol.split(/(?:\.|\n|<br>|<p>)/);
    for (let s of statements) {
       if (s.includes('IS CORRECT') || s.includes('ARE CORRECT') || s.includes('IS THE CORRECT') || s.includes('ARE THE CORRECT') || s.includes('CORRECT OPTION') || s.includes('CORRECT ANSWER') || s.includes('OPTIONS') || s.includes('OPTION')) {
          if (s.includes('INCORRECT') || s.includes('NOT CORRECT') || s.includes('FALSE') || s.includes('WRONG')) {
             // Avoid lines that talk about incorrect options, unless it says "A is correct but B is incorrect"
             if (!s.includes('IS CORRECT')) continue; 
          }
          
          let m = s.match(/\(([A-D])\)/g);
          if (m) {
             m.forEach(match => {
                correctChars.add(match.charAt(1).charCodeAt(0) - 65);
             });
          } else {
             // try without parens if near "option"
             let m2 = s.match(/OPTION[S]?\s+([A-D](?:\s*(?:,|AND|&)\s*[A-D])*)/);
             if (m2) {
                let chars = m2[1].match(/[A-D]/g);
                if (chars) chars.forEach(c => correctChars.add(c.charCodeAt(0) - 65));
             }
          }
       }
    }
    
    // If the heuristics found multiple correct answers
    if (correctChars.size > 1) {
       let arr = Array.from(correctChars).sort();
       if (q.type !== 'MCQM' || JSON.stringify(q.correctOptionIndex) !== JSON.stringify(arr)) {
          q.type = 'MCQM';
          q.correctOptionIndex = arr;
          modified = true;
          totalFixed++;
       }
    } else if (q.type === 'MCQM' && !Array.isArray(q.correctOptionIndex)) {
       // It's marked as MCQM but has no array! We must fix it to be SCQ if only 1 is correct, or at least make it an array
       if (correctChars.size === 1) {
          q.type = 'SCQ';
          q.correctOptionIndex = Array.from(correctChars)[0];
          modified = true;
          totalFixed++;
       } else {
          // just wrap it in array
          q.correctOptionIndex = [q.correctOptionIndex];
          modified = true;
          totalFixed++;
       }
    } else if (q.type === 'MCQM' && Array.isArray(q.correctOptionIndex) && q.correctOptionIndex.length === 1) {
       q.type = 'SCQ';
       q.correctOptionIndex = q.correctOptionIndex[0];
       modified = true;
       totalFixed++;
    }
  }

  if (modified) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }
}

console.log(`Fixed ${totalFixed} questions using heuristics.`);
