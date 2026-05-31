import fs from 'fs';

const filePath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/metadata.json";
const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

console.log('=== JEE GROUP EXAMS ===');
data.jeeExams.results.forEach(e => {
  console.log(`- ${e.title || e.name} | Key: "${e.key}" | ID: "${e.metaId}"`);
});

console.log('\n=== DEFENCE GROUP EXAMS ===');
data.defenceExams.results.forEach(e => {
  console.log(`- ${e.title || e.name} | Key: "${e.key}" | ID: "${e.metaId}"`);
});

console.log('\n=== CBSE GROUP EXAMS ===');
data.cbseExams.results.forEach(e => {
  console.log(`- ${e.title || e.name} | Key: "${e.key}" | ID: "${e.metaId}"`);
});
