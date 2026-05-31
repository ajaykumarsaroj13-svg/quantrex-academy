import fs from 'fs';

const logPath = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\bd95a69c-9b7a-4f0e-af2f-20b0d245ed86\\.system_generated\\logs\\transcript.jsonl";

if (!fs.existsSync(logPath)) {
  console.log('Transcript file does not exist.');
  process.exit(0);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (let i = 5280; i < 5350; i++) {
  if (i < lines.length && lines[i]) {
    try {
      const obj = JSON.parse(lines[i]);
      console.log(`[Line ${i}] Source: ${obj.source} | Type: ${obj.type}`);
      if (obj.content) {
        console.log(`  Content:`, obj.content.substring(0, 500));
      }
    } catch (e) {
      console.log(`[Line ${i}] JSON error:`, e.message);
    }
  }
}
