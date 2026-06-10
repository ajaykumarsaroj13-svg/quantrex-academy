const fs = require('fs');
const html = fs.readFileSync('binomial.html', 'utf-8');
const classes = new Set();
for(const match of html.matchAll(/class="([^"]+)"/g)) {
  match[1].split(' ').forEach(c => {
    if(c.includes('question') || c.includes('ans') || c.includes('opt')) {
        classes.add(c);
    }
  });
}
console.log([...classes].filter(c => !c.includes('hover') && !c.includes('focus')));
