const fs = require('fs');
const content = fs.readFileSync('frontend/src/utils/dummyPyqs.js', 'utf8');

const regex = /id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+Trigonometr[^'"]+)['"]/gi;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(`ID: ${match[1]}, Name: ${match[2]}`);
}
