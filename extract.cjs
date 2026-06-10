const fs = require('fs');
const html = fs.readFileSync('final_pyq.html', 'utf-8');
const links = [];
const regex = /<a[^>]+href="([^"]+)"[^>]*>/g;
let match;
while ((match = regex.exec(html)) !== null) {
  links.push(match[1]);
}
console.log(links.filter(l => l.includes('subject') || l.includes('pyq') || l.includes('math')));
