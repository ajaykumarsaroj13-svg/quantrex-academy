/**
 * remove_all_mocktests.cjs
 * 
 * Sets mockTests: [] for ALL chapters in syllabusData.js
 * Removes the chapter test folders completely (not just questions).
 */

const fs = require('fs');
const path = require('path');

const SYLLABUS_FILE = path.join(__dirname, 'src', 'utils', 'syllabusData.js');

console.log('Reading syllabusData.js...');
const content = fs.readFileSync(SYLLABUS_FILE, 'utf8');

// Find DEFAULT_SYLLABUS object start
const startMarker = 'export const DEFAULT_SYLLABUS = ';
const startIdx = content.indexOf(startMarker);
const objStart = startIdx + startMarker.length;

// Find the matching closing brace
let braceCount = 0;
let inString = false;
let escapeNext = false;
let stringChar = '';
let endIdx = -1;

for (let i = objStart; i < content.length; i++) {
  const ch = content[i];
  if (escapeNext) { escapeNext = false; continue; }
  if (ch === '\\' && inString) { escapeNext = true; continue; }
  if (!inString && (ch === '"' || ch === "'" || ch === '`')) { inString = true; stringChar = ch; continue; }
  if (inString && ch === stringChar) { inString = false; continue; }
  if (!inString) {
    if (ch === '{') braceCount++;
    else if (ch === '}') {
      braceCount--;
      if (braceCount === 0) {
        let j = i + 1;
        while (j < content.length && (content[j] === ' ' || content[j] === '\r' || content[j] === '\n')) j++;
        endIdx = content[j] === ';' ? j : i;
        break;
      }
    }
  }
}

const beforePart = content.substring(0, objStart);
let jsonStr = content.substring(objStart, endIdx);
if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
const afterPart = content.substring(endIdx + 1);

console.log('Parsing JSON...');
const data = JSON.parse(jsonStr.trim());

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
        chapter.mockTests = []; // Remove ALL mock test entries
      }
    }
  }
}

console.log(`\nSummary:`);
console.log(`  Chapters processed: ${chaptersProcessed}`);
console.log(`  Mock test entries removed: ${mockTestsRemoved}`);

console.log('\nWriting updated syllabusData.js...');
const hasSemi = content[endIdx] === ';';
const newContent = beforePart + JSON.stringify(data, null, 2) + (hasSemi ? ';' : '') + afterPart;
fs.writeFileSync(SYLLABUS_FILE, newContent, 'utf8');
console.log('Done! All chapter mock test folders removed from syllabusData.js');
