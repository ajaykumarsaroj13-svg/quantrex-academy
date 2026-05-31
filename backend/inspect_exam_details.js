import fs from 'fs';

const filePath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/metadata.json";
const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

const jeeMain = data.jeeExams.results.find(e => e.key === 'jee-main');
console.log('=== JEE Main Exam Object ===');
console.log(JSON.stringify(jeeMain, null, 2));
