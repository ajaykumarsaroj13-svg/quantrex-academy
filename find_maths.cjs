const fs = require('fs');
const html = fs.readFileSync('final_pyq.html', 'utf-8');
const regex = /<h3[^>]*>(.*?)<\/h3>[\s\S]*?href="(\/pyq\/subject\/[^"]+)"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[1].trim(), '->', m[2]);
}
