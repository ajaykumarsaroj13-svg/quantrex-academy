const fs = require('fs');
let content = fs.readFileSync('src/utils/temp_syl.js', 'utf8');
const matches = content.match(/"id":\s*"test_ch_/g);
console.log('Mock tests count:', matches ? matches.length : 0);

let chapterCount = content.match(/"id":\s*"ch_/g);
console.log('Chapters count:', chapterCount ? chapterCount.length : 0);
