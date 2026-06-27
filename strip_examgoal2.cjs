// Deep clean ALL ExamGoal references from every string field in question JSON files
const fs = require('fs');
const path = require('path');

const questionsDir = path.join(__dirname, 'public', 'data', 'questions');
const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json'));

let totalFiles = 0;
let totalCleaned = 0;

function deepCleanString(str) {
  if (!str || typeof str !== 'string') return str;
  let s = str;
  // Remove all <img> tags containing examgoal (handles escaped and unescaped)
  s = s.replace(/<img[^>]*examgoal[^>]*>/gi, '');
  // Remove examgoal text
  s = s.replace(/examgoal/gi, '');
  // Remove empty <p> tags
  s = s.replace(/<p>\s*<\/p>/gi, '');
  return s;
}

function deepCleanObject(obj) {
  if (!obj) return 0;
  let count = 0;
  
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      const before = obj[key];
      obj[key] = deepCleanString(obj[key]);
      if (before !== obj[key]) count++;
    } else if (Array.isArray(obj[key])) {
      for (let i = 0; i < obj[key].length; i++) {
        if (typeof obj[key][i] === 'string') {
          const before = obj[key][i];
          obj[key][i] = deepCleanString(obj[key][i]);
          if (before !== obj[key][i]) count++;
        } else if (typeof obj[key][i] === 'object' && obj[key][i]) {
          count += deepCleanObject(obj[key][i]);
        }
      }
    } else if (typeof obj[key] === 'object' && obj[key]) {
      count += deepCleanObject(obj[key]);
    }
  }
  return count;
}

console.log(`Processing ${files.length} files...`);

for (const file of files) {
  const filePath = path.join(questionsDir, file);
  try {
    let raw = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(raw);
    let cleaned = 0;
    
    if (Array.isArray(data)) {
      for (const q of data) cleaned += deepCleanObject(q);
    } else if (typeof data === 'object') {
      cleaned += deepCleanObject(data);
    }
    
    // Write back
    let output = JSON.stringify(data, null, 2);
    
    // Final pass: catch any remaining examgoal refs in the raw JSON string
    const beforeCount = (output.match(/examgoal/gi) || []).length;
    if (beforeCount > 0) {
      // Remove img tags in escaped JSON format
      output = output.replace(/<img[^>]*?examgoal[^>]*?>/gi, '');
      output = output.replace(/examgoal/gi, '');
      cleaned += beforeCount;
    }
    
    fs.writeFileSync(filePath, output, 'utf8');
    totalFiles++;
    totalCleaned += cleaned;
  } catch (err) {
    console.error(`❌ ${file}: ${err.message}`);
  }
}

console.log(`\n===== DONE =====`);
console.log(`Files: ${totalFiles} | Fields cleaned: ${totalCleaned}`);

// Final verify
let remaining = 0;
for (const file of files) {
  const raw = fs.readFileSync(path.join(questionsDir, file), 'utf8');
  const m = raw.match(/examgoal/gi);
  if (m) { remaining += m.length; console.log(`⚠️ ${file}: ${m.length}`); }
}
console.log(`\nRemaining refs: ${remaining}`);
