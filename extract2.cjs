const fs = require('fs');
const html = fs.readFileSync('final_pyq.html', 'utf-8');
const regex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  if (m[1].includes('subject')) {
     console.log(m[1], m[2].replace(/<[^>]+>/g, '').trim());
  }
}
