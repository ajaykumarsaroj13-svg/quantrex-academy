const fs = require('fs');
const babel = require('@babel/parser');
const code = fs.readFileSync('src/components/ExamGoalTestInterface.jsx', 'utf8');

try {
  babel.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('Valid!');
} catch (e) {
  console.log('Error:', e.message);
  console.log('At pos:', e.pos, 'line:', e.loc.line, 'col:', e.loc.column);
}
