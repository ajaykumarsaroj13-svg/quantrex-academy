/**
 * remove_examside_questions.cjs
 * 
 * Removes ALL questions from mockTests in syllabusData.js
 * since ALL questions there were sourced from Examside.
 * 
 * - Keeps the entire folder/chapter structure intact
 * - Clears the "questions" array in every mockTest to []
 * - Preserves all other exports in the file (DEFAULT_TOPPERS, etc.)
 */

const fs = require('fs');
const path = require('path');

const SYLLABUS_FILE = path.join(__dirname, 'src', 'utils', 'syllabusData.js');

console.log('Reading syllabusData.js...');
const content = fs.readFileSync(SYLLABUS_FILE, 'utf8');

// Find where DEFAULT_SYLLABUS starts and ends
const startMarker = 'export const DEFAULT_SYLLABUS = ';
const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Could not find DEFAULT_SYLLABUS in file!');
  process.exit(1);
}

// Find the end: the ";" that closes this export
// We need to find the matching closing brace for the object
let braceCount = 0;
let inString = false;
let escapeNext = false;
let stringChar = '';
let endIdx = -1;

const objStart = startIdx + startMarker.length;
for (let i = objStart; i < content.length; i++) {
  const ch = content[i];
  
  if (escapeNext) {
    escapeNext = false;
    continue;
  }
  
  if (ch === '\\' && inString) {
    escapeNext = true;
    continue;
  }
  
  if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
    inString = true;
    stringChar = ch;
    continue;
  }
  
  if (inString && ch === stringChar) {
    inString = false;
    continue;
  }
  
  if (!inString) {
    if (ch === '{') braceCount++;
    else if (ch === '}') {
      braceCount--;
      if (braceCount === 0) {
        // Found the end of the object
        // Look for the ; after it
        let j = i + 1;
        while (j < content.length && content[j] === ' ' || content[j] === '\r' || content[j] === '\n') j++;
        if (content[j] === ';') {
          endIdx = j; // include the semicolon
        } else {
          endIdx = i; // no semicolon
        }
        break;
      }
    }
  }
}

if (endIdx === -1) {
  console.error('Could not find end of DEFAULT_SYLLABUS object!');
  process.exit(1);
}

const beforePart = content.substring(0, objStart);
const syllabusJsonStr = content.substring(objStart, endIdx + 1 - (content[endIdx] === ';' ? 0 : 0));
const afterPart = content.substring(endIdx + 1);

console.log(`Found DEFAULT_SYLLABUS from char ${objStart} to ${endIdx}`);

// Parse the JSON
let jsonStr = content.substring(objStart, endIdx);
if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
jsonStr = jsonStr.trim();

console.log('Parsing JSON data...');
let data;
try {
  data = JSON.parse(jsonStr);
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

console.log('\nWriting updated syllabusData.js...');

// Reconstruct the file
const newSyllabusJson = JSON.stringify(data, null, 2);
const endSemicolon = content[endIdx] === ';' ? '' : ''; // The endIdx points to closing }

// Rebuild: everything before the JSON object + new JSON + everything after
const newContent = beforePart + newSyllabusJson + (content[endIdx] === ';' ? ';' : '') + afterPart;

fs.writeFileSync(SYLLABUS_FILE, newContent, 'utf8');

console.log('Done! All Examside questions have been permanently removed.');
console.log('Chapter/mockTest structure is preserved. DEFAULT_TOPPERS preserved.');
