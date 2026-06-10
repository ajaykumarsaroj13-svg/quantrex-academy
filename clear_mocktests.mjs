import fs from 'fs';
import path from 'path';

// Files to process
const files = [
  './src/utils/syllabusData.js',
  './backend/data/syllabus.json'
];

async function clearMockTests() {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`File not found: ${file}`);
      continue;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Instead of parsing JS, we can use a regex to replace mockTests array.
    // However, regex can be tricky with nested structures.
    // Since mockTests typically look like: "mockTests": [ ... ],
    // Let's use a robust regex that matches the mockTests key and an array following it.
    // Assuming the array is correctly matched by counting brackets, but we can just parse it if it's JSON.
    // For JS file:
    if (file.endsWith('.js')) {
      // The file starts with "export const DEFAULT_SYLLABUS = " or "export const syllabus = "
      // Let's replace the export with something we can parse, or just use string manipulation.
      
      let jsonStr = content.replace(/export const (DEFAULT_SYLLABUS|syllabus)\s*=\s*/, '');
      // Strip trailing semicolons or newlines
      jsonStr = jsonStr.trim();
      if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
      
      try {
        const data = JSON.parse(jsonStr);
        processData(data);
        const newContent = `export const syllabus = ${JSON.stringify(data, null, 2)};\n`;
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Cleared mockTests in ${file} (JS)`);
      } catch (e) {
        console.log(`Failed to parse JS file as JSON: ${e.message}`);
        // Fallback: regex replace
        const newContent = content.replace(/"mockTests"\s*:\s*\[[\s\S]*?(?<=\})\]/g, '"mockTests": []');
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Used Regex fallback on ${file}`);
      }
    } else {
      // JSON file
      try {
        const data = JSON.parse(content);
        processData(data);
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Cleared mockTests in ${file} (JSON)`);
      } catch (e) {
         console.log(`Failed to parse JSON file: ${e.message}`);
      }
    }
  }
}

function processData(data) {
  // data is the syllabus object (keys: jee-mains, jee-advanced, etc.)
  for (const classKey in data) {
    const classData = data[classKey];
    if (classData && classData.subjects) {
      for (const subjKey in classData.subjects) {
        const subject = classData.subjects[subjKey];
        if (subject && subject.chapters) {
          subject.chapters.forEach(chapter => {
            if (chapter.mockTests) {
              chapter.mockTests = [];
            }
          });
        }
      }
    }
  }
}

clearMockTests();
