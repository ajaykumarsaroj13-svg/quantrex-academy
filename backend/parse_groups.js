import fs from 'fs';

const filePath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/metadata.json";
const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

console.log('=== ALL EXAM GROUPS ===');
data.examGroups.results.forEach(g => {
  console.log(`- Title: "${g.title}" | Key: "${g.key}" | ID: "${g.metaId}"`);
});
