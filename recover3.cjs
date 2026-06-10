const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/e7bc6a83-9938-4faf-83cf-a74a33c2ded5/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.content && typeof obj.content === 'string') {
       if (obj.content.includes('TestSeriesPage.jsx') && obj.content.includes('import React')) {
          fs.writeFileSync('TS_dump_' + i + '.txt', obj.content);
       }
       if (obj.content.includes('StudentDashboard.jsx') && obj.content.includes('import React')) {
          fs.writeFileSync('SD_dump_' + i + '.txt', obj.content);
       }
    }
  } catch(e) {}
}
