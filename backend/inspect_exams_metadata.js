import fs from 'fs';

const filePath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/all_exams_metadata.json";

if (!fs.existsSync(filePath)) {
  console.log('all_exams_metadata.json does not exist.');
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

console.log('Keys (exams):', Object.keys(data));

for (const examKey of Object.keys(data)) {
  const exam = data[examKey];
  console.log(`\n=================== ${examKey.toUpperCase()} ===================`);
  
  // Subjects
  console.log('Subjects:');
  const subjects = exam.subjects?.results || [];
  subjects.forEach(s => {
    console.log(`  - ${s.title || s.name} | ID: "${s.metaId}" | Key: "${s.key}"`);
  });
  
  // Sample Papers
  const papers = exam.papers?.results || [];
  console.log(`Total Papers: ${papers.length}`);
  console.log('First 3 Papers:');
  papers.slice(0, 3).forEach((p, idx) => {
    console.log(`  ${idx+1}. Name: "${p.name}" | Key: "${p.key}" | ID: "${p.metaId || p.id}"`);
    console.log(`     Details:`, JSON.stringify(p).substring(0, 300));
  });
  
  // Test Series info
  const ts = exam.testSeries?.results || exam.testSeries?.data || [];
  console.log(`Total test series entries: ${ts.length}`);
  if (ts.length > 0) {
    console.log('  Sample test series entry:', JSON.stringify(ts[0]).substring(0, 300));
  }
}
