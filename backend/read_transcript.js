import fs from 'fs';
import path from 'path';

const logPath = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\bd95a69c-9b7a-4f0e-af2f-20b0d245ed86\\.system_generated\\logs\\transcript.jsonl";

if (!fs.existsSync(logPath)) {
  console.log('Transcript file does not exist at:', logPath);
  process.exit(0);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
console.log(`Read ${lines.length} lines from transcript.`);

// Search for keywords
const keywords = ['login', 'password', 'examgoal', 'exam goal', 'credentials', 'email', 'pass'];

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    const content = JSON.stringify(obj.content || '');
    const hasKeyword = keywords.some(kw => content.toLowerCase().includes(kw));
    if (hasKeyword && obj.source === 'USER_EXPLICIT') {
      console.log(`Line ${idx} (User):`, obj.content);
    }
  } catch (err) {
    // ignore
  }
});
