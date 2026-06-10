const fs = require('fs');
const html = fs.readFileSync('dashboard.html', 'utf-8');
const regex = /href=\"([^\"]+)\"/g;
let match;
const links = new Set();
while ((match = regex.exec(html)) !== null) {
  links.add(match[1]);
}
console.log(Array.from(links).filter(l => l.includes('jee') || l.includes('pyq')));
