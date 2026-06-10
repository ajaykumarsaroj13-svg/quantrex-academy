const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/e7bc6a83-9938-4faf-83cf-a74a33c2ded5/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
const files = new Set();
for (let l of lines) {
  if (l.includes('"TargetFile"')) {
    const match = l.match(/"TargetFile":"([^"]+)"/);
    if (match) files.add(match[1]);
  }
  if (l.includes('"AbsolutePath"')) {
    const match = l.match(/"AbsolutePath":"([^"]+)"/);
    if (match) files.add(match[1]);
  }
}
console.log(Array.from(files).join('\n'));
