/**
 * remove_all_mocktests_backend.cjs
 * 
 * Sets mockTests: [] for ALL chapters in backend/data/syllabus.json
 */

const fs = require('fs');
const path = require('path');

const SYLLABUS_FILE = path.join(__dirname, 'backend', 'data', 'syllabus.json');

console.log('Reading backend/data/syllabus.json...');
const data = JSON.parse(fs.readFileSync(SYLLABUS_FILE, 'utf8'));

let chaptersProcessed = 0;
let mockTestsRemoved = 0;

for (const [examKey, examData] of Object.entries(data)) {
  if (!examData.subjects) continue;
  for (const [subjectKey, subjectData] of Object.entries(examData.subjects)) {
    if (!subjectData.chapters || !Array.isArray(subjectData.chapters)) continue;
    for (const chapter of subjectData.chapters) {
      chaptersProcessed++;
      if (chapter.mockTests && Array.isArray(chapter.mockTests)) {
        mockTestsRemoved += chapter.mockTests.length;
        chapter.mockTests = [];
      }
    }
  }
}

console.log(`\nSummary:`);
console.log(`  Chapters processed: ${chaptersProcessed}`);
console.log(`  Mock test entries removed: ${mockTestsRemoved}`);

fs.writeFileSync(SYLLABUS_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log('Done! All chapter mock test folders removed from backend/data/syllabus.json');
