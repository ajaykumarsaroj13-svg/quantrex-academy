const fs = require('fs');
const transcriptPath = 'C:/Users/Admin/.gemini/antigravity/brain/e7bc6a83-9938-4faf-83cf-a74a33c2ded5/.system_generated/logs/transcript.jsonl';
const text = fs.readFileSync(transcriptPath, 'utf8');

const regex = /File Path: \`file:\/\/\/C:\/Users\/Admin\/\.gemini\/antigravity\/scratch\/quantrexacadmy\/(.*?)\`[\s\S]*?remove the line number, colon, and leading space\.\\n((?:\\d+: .*?\\n)+)/g;

let testSeriesLines = [];
let studentDashboardLines = [];

let match;
while ((match = regex.exec(text)) !== null) {
  const filePath = match[1];
  const isTS = filePath.includes('TestSeriesPage.jsx');
  const isSD = filePath.includes('StudentDashboard.jsx');
  
  if (isTS || isSD) {
    const targetArray = isTS ? testSeriesLines : studentDashboardLines;
    const lines = match[2].split('\\n');
    for (const l of lines) {
      const lineMatch = l.match(/^(\d+): (.*)$/);
      if (lineMatch) {
        const lineNum = parseInt(lineMatch[1]);
        if (!targetArray[lineNum]) {
           targetArray[lineNum] = lineMatch[2];
        }
      }
    }
  }
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
