const fs = require('fs');
const transcriptPath = 'C:/Users/Admin/.gemini/antigravity/brain/e7bc6a83-9938-4faf-83cf-a74a33c2ded5/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let testSeriesLines = [];
let studentDashboardLines = [];

for (const line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'ACTION_RESULT' && obj.content && typeof obj.content === 'string') {
      if (obj.content.includes('File Path:') && obj.content.includes('remove the line number, colon, and leading space.')) {
         
         const isTS = obj.content.includes('TestSeriesPage.jsx');
         const isSD = obj.content.includes('StudentDashboard.jsx');
         
         if (isTS || isSD) {
            const parts = obj.content.split('remove the line number, colon, and leading space.\n');
            const targetArray = isTS ? testSeriesLines : studentDashboardLines;
            
            if (parts.length > 1) {
              const fileContentLines = parts[1].split('\n').filter(l => l.match(/^\d+: /));
              for (const l of fileContentLines) {
                const match = l.match(/^(\d+): (.*)$/);
                if (match) {
                  const lineNum = parseInt(match[1]);
                  const text = match[2];
                  // keep the FIRST view of the line (which is the oldest historically because we are iterating forward through time!)
                  if (!targetArray[lineNum]) {
                    targetArray[lineNum] = text;
                  }
                }
              }
            }
         }
      }
    }
  } catch(e) {}
}

const writeArray = (arr, path) => {
  if (arr.length > 0) {
    let out = [];
    for (let i = 1; i < arr.length; i++) {
       out.push(arr[i] !== undefined ? arr[i] : '');
    }
    fs.writeFileSync(path, out.join('\n'));
    console.log('Restored', path, out.length, 'lines');
  } else {
    console.log('No lines found for', path);
  }
};

writeArray(testSeriesLines, 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/TestSeriesPage_recovered.jsx');
writeArray(studentDashboardLines, 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/StudentDashboard_recovered.jsx');
