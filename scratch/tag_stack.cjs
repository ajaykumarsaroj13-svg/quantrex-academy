const fs = require('fs');
const code = fs.readFileSync('src/components/ExamGoalTestInterface.jsx', 'utf8');

const regex = /<\/?([a-zA-Z0-9.\-_]+)[^>]*\/?>/g;
let match;
const stack = [];

while ((match = regex.exec(code)) !== null) {
  const full = match[0];
  const tag = match[1];
  const line = code.substring(0, match.index).split('\n').length;
  
  if (full.endsWith('/>') || full.startsWith('<?') || full.startsWith('<!')) {
    continue;
  }
  
  if (full.startsWith('</')) {
    if (stack.length > 0 && stack[stack.length - 1].tag === tag) {
      stack.pop();
    } else {
      console.log(`Mismatch at line ${line}: closing </${tag}> but top of stack is <${stack.length ? stack[stack.length - 1].tag : 'EMPTY'} (line ${stack.length ? stack[stack.length - 1].line : 'N/A'})>`);
    }
  } else {
    stack.push({ tag, line });
  }
}

console.log('Unclosed tags remaining on stack:');
stack.forEach(s => console.log(`  <${s.tag}> at line ${s.line}`));
