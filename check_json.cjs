const fs = require('fs');
const dir = 'public/data/tests';
for (const f of fs.readdirSync(dir)) {
  if (f.endsWith('.json')) {
    const data = fs.readFileSync(dir + '/' + f, 'utf8');
    const m = data.match(/color[^>]+>/g);
    if (m) {
        console.log(f);
        console.log(m.slice(0, 5));
        break;
    }
  }
}
