/**
 * remove_examside_backend.cjs
 * 
 * Removes ALL questions from mockTests in backend/data/syllabus.json
 * This is a pure JSON file (no JS exports), so simpler to process.
 */

const fs = require('fs');
const path = require('path');

const SYLLABUS_FILE = path.join(__dirname, 'backend', 'data', 'syllabus.json');

console.log('Reading backend/data/syllabus.json...');
const content = fs.readFileSync(SYLLABUS_FILE, 'utf8');

console.log('Parsing JSON data...');
let data;
try {
  data = JSON.parse(content);
} catch (e) {
  console.error('Failed to parse JSON:', e.message);
  process.exit(1);
}

let totalQuestionsRemoved = 0;
let chaptersProcessed = 0;
let mockTestsCleared = 0;

// Process each exam type (jee-mains, jee-advanced, etc.)
for (const [examKey, examData] of Object.entries(data)) {
  if (!examData.subjects) continue;
  
  for (const [subjectKey, subjectData] of Object.entries(examData.subjects)) {
    if (!subjectData.chapters || !Array.isArray(subjectData.chapters)) continue;
    
    for (const chapter of subjectData.chapters) {
      chaptersProcessed++;
      
      if (!chapter.mockTests || !Array.isArray(chapter.mockTests)) continue;
      
      for (const mockTest of chapter.mockTests) {
        if (mockTest.questions && Array.isArray(mockTest.questions)) {
          totalQuestionsRemoved += mockTest.questions.length;
          mockTestsCleared++;
          mockTest.questions = []; // Clear all questions
        }
      }
    }
  }
}

console.log(`\nSummary:`);
console.log(`  Chapters processed: ${chaptersProcessed}`);
console.log(`  Mock tests cleared: ${mockTestsCleared}`);
console.log(`  Total questions removed: ${totalQuestionsRemoved}`);

console.log('\nWriting updated syllabus.json...');
fs.writeFileSync(SYLLABUS_FILE, JSON.stringify(data, null, 2), 'utf8');

console.log('Done! All Examside questions removed from backend syllabus.json.');
