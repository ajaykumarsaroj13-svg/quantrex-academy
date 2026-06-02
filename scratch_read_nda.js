const fs = require('fs');
const content = JSON.parse(fs.readFileSync('backend/data/scraped_questions/nda/nda-mathematics-10-april-2022.json', 'utf8'));
const q = content.results[0].questions[0];
console.log(JSON.stringify(q, null, 2));
