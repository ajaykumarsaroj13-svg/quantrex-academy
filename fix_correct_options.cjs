const fs = require('fs');
const path = require('path');

function cleanText(html) {
  if (!html) return "";
  let text = String(html).replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '\n');
  return text.trim().replace(/\s+/g, ' '); // normalize spaces to avoid mismatch
}

function normalizeStr(str) {
  return cleanText(str).toLowerCase().replace(/[^a-z0-9]/g, '');
}

const rawMathDir = path.join(__dirname, 'public', 'data', 'questions', 'raw_math');
const advQuestionsDir = path.join(__dirname, 'public', 'data', 'questions');

// 1. Build dictionary from raw_math
const rawDict = new Map();

if (fs.existsSync(rawMathDir)) {
  const files = fs.readdirSync(rawMathDir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(rawMathDir, f), 'utf8'));
    if (!d.results || !d.results[0] || !d.results[0].questions) continue;
    
    for (const q of d.results[0].questions) {
      if (q.question && q.question.en && q.question.en.content) {
        const normQ = normalizeStr(q.question.en.content);
        rawDict.set(normQ, {
          correct_options: q.question.en.correct_options || q.question.en.correctOption,
          options: q.question.en.options || []
        });
      }
    }
  }
}

console.log(`Built raw dictionary with ${rawDict.size} entries.`);

// 2. Loop through adv-*.json
const advFiles = fs.readdirSync(advQuestionsDir).filter(f => f.startsWith('adv-') && f.endsWith('.json'));

let totalFixed = 0;
let totalChecked = 0;

for (const f of advFiles) {
  const filePath = path.join(advQuestionsDir, f);
  let advData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let modified = false;

  for (let q of advData) {
    if (q.type === 'NUMERICAL' || q.type === 'SUBJECTIVE') continue;
    
    totalChecked++;
    const normQ = normalizeStr(q.question);
    
    let rawQ = rawDict.get(normQ);
    
    // If not found exactly, try partial match (first 100 chars)
    if (!rawQ) {
       const partial = normQ.substring(0, 100);
       for (const [key, val] of rawDict.entries()) {
          if (key.startsWith(partial) || partial.startsWith(key.substring(0,100))) {
             rawQ = val;
             break;
          }
       }
    }

    if (rawQ) {
      let correctArr = rawQ.correct_options;
      if (typeof correctArr === 'string') correctArr = correctArr.split(',').map(s=>s.trim());
      
      if (Array.isArray(correctArr) && correctArr.length > 0) {
        let indices = [];
        for (const cId of correctArr) {
           const optMatch = rawQ.options.findIndex(o => o.identifier === cId);
           if (optMatch !== -1) indices.push(optMatch);
        }
        
        // If indices were found
        if (indices.length > 0) {
          indices.sort((a,b)=>a-b);
          
          if (indices.length > 1) {
            if (q.type !== 'MCQM' || JSON.stringify(q.correctOptionIndex) !== JSON.stringify(indices)) {
              q.type = 'MCQM';
              q.correctOptionIndex = indices;
              modified = true;
              totalFixed++;
            }
          } else {
            if (q.type !== 'SCQ' || q.correctOptionIndex !== indices[0]) {
              q.type = 'SCQ';
              q.correctOptionIndex = indices[0];
              modified = true;
              totalFixed++;
            }
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(advData, null, 2));
  }
}

console.log(`Checked ${totalChecked} questions. Fixed ${totalFixed} types/answers.`);
