// Strip ExamGoal images and branding from all question JSON files
const fs = require('fs');
const path = require('path');

const questionsDir = path.join(__dirname, 'public', 'data', 'questions');
const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json'));

let totalFiles = 0;
let totalQuestions = 0;
let totalImgsRemoved = 0;

function cleanSolution(sol) {
  if (!sol || typeof sol !== 'string') return { cleaned: sol, removedCount: 0 };
  
  let cleaned = sol;
  
  const imgMatches = cleaned.match(/<img[^>]*examgoal[^>]*>/gi);
  const removedCount = imgMatches ? imgMatches.length : 0;
  
  // Remove <img> tags that reference examgoal
  cleaned = cleaned.replace(/<img[^>]*examgoal\.net[^>]*>/gi, '');
  cleaned = cleaned.replace(/<img[^>]*examgoal[^>]*>/gi, '');
  
  // Remove "ExamGoal" text references
  cleaned = cleaned.replace(/ExamGoal/gi, '');
  cleaned = cleaned.replace(/exam[\s-]?goal/gi, '');
  
  // Remove empty <p> tags
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.trim();
  
  return { cleaned, removedCount };
}

function cleanQuestion(q) {
  if (!q) return 0;
  let imgsRemoved = 0;
  
  if (q.solution) {
    const result = cleanSolution(q.solution);
    q.solution = result.cleaned;
    imgsRemoved += result.removedCount;
  }
  
  if (q.question && typeof q.question === 'string') {
    q.question = q.question.replace(/ExamGoal/gi, '');
    q.question = q.question.replace(/exam[\s-]?goal/gi, '');
  }
  
  if (q.title && typeof q.title === 'string') {
    q.title = q.title.replace(/ExamGoal/gi, '');
  }
  
  if (q.options && Array.isArray(q.options)) {
    q.options = q.options.map(opt => typeof opt === 'string' ? opt.replace(/ExamGoal/gi, '') : opt);
  }
  
  return imgsRemoved;
}

console.log(`Processing ${files.length} JSON files...\n`);

for (const file of files) {
  const filePath = path.join(questionsDir, file);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(raw);
    let fileImgs = 0;
    let fileQs = 0;
    
    if (Array.isArray(data)) {
      for (const q of data) { fileImgs += cleanQuestion(q); fileQs++; }
    } else if (data.questions && typeof data.questions === 'object') {
      for (const key of Object.keys(data.questions)) {
        if (Array.isArray(data.questions[key])) {
          for (const q of data.questions[key]) { fileImgs += cleanQuestion(q); fileQs++; }
        }
      }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    totalFiles++;
    totalQuestions += fileQs;
    totalImgsRemoved += fileImgs;
    
    if (fileImgs > 0) console.log(`✅ ${file}: ${fileQs} Qs, ${fileImgs} imgs removed`);
  } catch (err) {
    console.error(`❌ Error ${file}: ${err.message}`);
  }
}

console.log(`\n========== SUMMARY ==========`);
console.log(`Files: ${totalFiles} | Questions: ${totalQuestions} | Images removed: ${totalImgsRemoved}`);

// Verify
let remaining = 0;
for (const file of files) {
  const raw = fs.readFileSync(path.join(questionsDir, file), 'utf8');
  const m = raw.match(/examgoal/gi);
  if (m) { remaining += m.length; console.log(`⚠️ ${file}: ${m.length} refs`); }
}
console.log(`Remaining ExamGoal refs: ${remaining}`);
