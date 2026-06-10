const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/e7bc6a83-9938-4faf-83cf-a74a33c2ded5/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (let l of lines) {
  if (l.includes('"step_index":108')) {
    const obj = JSON.parse(l);
    fs.writeFileSync('original_dashboard.jsx', obj.content);
    console.log('done');
    break;
  }
}
