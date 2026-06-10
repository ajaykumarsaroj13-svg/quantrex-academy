const fs = require('fs');
const html = fs.readFileSync('chapter_wise.html', 'utf-8');
const idx = html.indexOf('alt="JEE Main"');
console.log(html.substring(Math.max(0, idx - 500), idx + 500));
