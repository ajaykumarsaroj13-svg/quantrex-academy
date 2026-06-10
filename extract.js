const fs = require('fs');
const transcriptPath = 'C:/Users/Admin/.gemini/antigravity/brain/e7bc6a83-9938-4faf-83cf-a74a33c2ded5/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
const firstViews = {};

for (const line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'ACTION_RESULT' && obj.content && typeof obj.content === 'string') {
      if (obj.content.includes('File Path: ')) {
        const matchPath = obj.content.split('scratch/quantrexacadmy/')[1];
        if (matchPath) {
          const filePath = matchPath.split('`')[0];
          if (!firstViews[filePath] && obj.content.includes('Showing lines 1 to')) {
            const splitToken = 'remove the line number, colon, and leading space.\n';
            const parts = obj.content.split(splitToken);
            if (parts.length > 1) {
              const fileContentLines = parts[1].split('\n').filter(l => l.match(/^\d+: /)).map(l => l.replace(/^\d+: /, ''));
              firstViews[filePath] = fileContentLines.join('\n');
            }
          }
        }
      }
    }
  } catch (e) {}
}

for (const p in firstViews) {
  if (p.endsWith('.jsx')) {
    console.log('Extracted:', p, firstViews[p].length, 'bytes');
    const outPath = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/' + p.replace('.jsx', '.original.jsx');
    fs.writeFileSync(outPath, firstViews[p]);
  }
}
