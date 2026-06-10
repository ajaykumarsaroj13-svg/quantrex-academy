const fs = require('fs');
const data = fs.readFileSync('public/data/tests/real_test_45_2026.json', 'utf8');
const urls = data.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s\"\'\\]+/g);
if (urls) {
    const domains = new Set();
    urls.forEach(u => {
        try { domains.add(new URL(u).hostname); } catch(e){}
    });
    console.log([...domains]);
}
