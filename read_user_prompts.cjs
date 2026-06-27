const fs = require('fs');
const logFile = 'C:/Users/Admin/.gemini/antigravity/brain/9258c762-64f2-4a36-9c75-51c0271bfbb8/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n');
for (const line of lines) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
      console.log(`[USER] ${data.content}`);
    }
  } catch (e) {}
}
