import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchQuestion(q) {
  try {
    const res = await fetch(`https://questions.examside.com/past-years/jee/question/${q.question_id}/__data.json`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return null;
    const resData = await res.json();
    let arr = null;
    for (const node of resData.nodes) {
      if (node && node.data && Array.isArray(node.data)) {
        if (node.data.includes(q.question_id)) {
          arr = node.data;
          break;
        }
      }
    }
    if (!arr) return null;
    const qIdStrIdx = arr.indexOf(q.question_id);
    let qObj = null;
    for (const item of arr) {
      if (item && typeof item === 'object' && item.question_id === qIdStrIdx) {
        qObj = item;
        break;
      }
    }
    if (!qObj) return null;
    
    const typeStr = arr[qObj.type];
    let type = q.type;
    if (typeStr === 'mcqm') type = 'MCQM';
    else if (typeStr === 'mcq') type = 'SCQ';
    else if (typeStr === 'numerical' || typeStr === 'integer') type = 'NUMERICAL';
    else if (typeStr === 'fib') type = 'FIB';
    else if (typeStr === 'subjective') type = 'SUBJECTIVE';
    else if (typeStr === 'tf') type = 'TRUE_FALSE';
    
    let newAns = q.correctAnswer;
    let newOptionIdx = q.correctOptionIndex;
    
    const qEnObj = arr[arr[qObj.question]?.en];
    if (qEnObj) {
       if (type === 'MCQM' || type === 'SCQ') {
          const correctOptsIdxs = arr[qEnObj.correct_options];
          if (Array.isArray(correctOptsIdxs)) {
             const ansIdentifiers = correctOptsIdxs.map(idx => arr[idx]);
             const indices = ansIdentifiers.map(a => ['A','B','C','D'].indexOf(a)).filter(i => i !== -1);
             if (indices.length > 0) {
               newOptionIdx = type === 'MCQM' ? indices : indices[0];
             }
          }
       } else if (type === 'NUMERICAL') {
          const ansRaw = arr[qEnObj.answer];
          if (ansRaw !== undefined && ansRaw !== null) {
             newAns = String(ansRaw).trim();
          }
       }
    }
    
    let changed = false;
    if (q.type !== type) { q.type = type; changed = true; }
    if (JSON.stringify(q.correctOptionIndex) !== JSON.stringify(newOptionIdx)) { q.correctOptionIndex = newOptionIdx; changed = true; }
    if (q.correctAnswer !== newAns && type === 'NUMERICAL') { q.correctAnswer = newAns; changed = true; }
    
    return changed;
  } catch(e) {
    return null;
  }
}

async function scrapeAll() {
  const dirPath = path.join(__dirname, '../public/data/questions');
  const files = fs.readdirSync(dirPath).filter(f => f.startsWith('adv-') && f.endsWith('.json') && f !== 'adv-quadratic-equation-and-inequalities.json');
  
  // Skip files that were already updated today (to resume fast)
  const skipList = ['adv-3d-geometry.json', 'adv-application-of-derivatives.json', 'adv-application-of-integration.json'];
  
  let totalUpdated = 0;

  // Process all remaining files in parallel
  await Promise.all(files.map(async (file) => {
    if (skipList.includes(file)) return;
    const filePath = path.join(dirPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const results = await Promise.all(data.map(q => fetchQuestion(q)));
    let updatedInFile = 0;
    results.forEach((changed) => {
       if (changed) updatedInFile++;
    });
    
    if (updatedInFile > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Updated ${updatedInFile} questions in ${file}`);
      totalUpdated += updatedInFile;
    } else {
      console.log(`No changes needed for ${file}`);
    }
  }));
  
  console.log(`Finished. Updated ${totalUpdated} total questions.`);
}

scrapeAll();
