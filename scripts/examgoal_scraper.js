import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function scrapeQuestions() {
  const filePath = path.join(__dirname, '../public/data/questions/adv-complex-numbers.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updatedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const q = data[i];
    console.log(`[${i+1}/${data.length}] Scraping ${q.question_id}...`);
    
    try {
      const res = await fetch(`https://questions.examside.com/past-years/jee/question/${q.question_id}/__data.json`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!res.ok) {
        console.log(`  -> Failed to fetch data.json: ${res.status}`);
        continue;
      }
      
      const resData = await res.json();
      
      // Find the node containing the questionId
      let arr = null;
      for (const node of resData.nodes) {
        if (node && node.data && Array.isArray(node.data)) {
          if (node.data.includes(q.question_id)) {
            arr = node.data;
            break;
          }
        }
      }
      
      if (!arr) {
        console.log("  -> Question ID not found in data nodes");
        continue;
      }
      
      const qIdStrIdx = arr.indexOf(q.question_id);
      
      // Find the object that has question_id pointing to qIdStrIdx
      let qObj = null;
      for (const item of arr) {
        if (item && typeof item === 'object' && item.question_id === qIdStrIdx) {
          qObj = item;
          break;
        }
      }
      
      if (!qObj) {
        console.log("  -> Question Object not found");
        continue;
      }
      
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
               // examgoal sometimes puts answer in string format
               newAns = String(ansRaw).trim();
            }
         }
      }
      
      let changed = false;
      if (q.type !== type) { q.type = type; changed = true; }
      if (JSON.stringify(q.correctOptionIndex) !== JSON.stringify(newOptionIdx)) { q.correctOptionIndex = newOptionIdx; changed = true; }
      if (q.correctAnswer !== newAns && type === 'NUMERICAL') { q.correctAnswer = newAns; changed = true; }
      
      if (changed) {
        updatedCount++;
        console.log(`  -> Updated: type=${type}, options=${JSON.stringify(newOptionIdx)}, ans=${newAns}`);
      } else {
        console.log(`  -> OK: type=${type}`);
      }
      
      // Save continuously
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      
      await new Promise(r => setTimeout(r, 200)); // small delay
    } catch (e) {
      console.log("  -> Error:", e.message);
    }
  }

  console.log(`Finished. Updated ${updatedCount} questions.`);
}

scrapeQuestions();
