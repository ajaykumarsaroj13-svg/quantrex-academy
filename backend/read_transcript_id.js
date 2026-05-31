import fs from 'fs';

const logPath = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\bd95a69c-9b7a-4f0e-af2f-20b0d245ed86\\.system_generated\\logs\\transcript.jsonl";

if (!fs.existsSync(logPath)) {
  console.log('Transcript file does not exist.');
  process.exit(0);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    const content = JSON.stringify(obj.content || '') + JSON.stringify(obj.tool_calls || '');
    if (content.includes('65f55b3f-ebcd-51b9-8d4f-ec4f7943e29a')) {
      console.log(`Line ${idx} (${obj.source} - ${obj.type}):`, obj.content ? obj.content.substring(0, 300) : 'Tool call/response');
    }
  } catch (err) {
    // ignore
  }
});
