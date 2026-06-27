const fs = require('fs');
const file = 'src/utils/syllabusData.js';
let content = fs.readFileSync(file, 'utf8');

const replacement = `const DEFAULT_TOPPERS = [
  {
    "id": "t1",
    "name": "Dibyanshu Sahoo",
    "rank": "99.83 %ile",
    "score": "JEE Main",
    "year": "2024",
    "photo": "/images/toppers/dibyanshu_new.jpg",
    "isPoster": true
  },
  {
    "id": "t2",
    "name": "Arkadeep Jana",
    "rank": "97.69 %ile",
    "score": "JEE Main",
    "year": "2024",
    "photo": "/images/toppers/arkadeep_new.jpg",
    "isPoster": true
  },
  {
    "id": "t3",
    "name": "Yash Pant",
    "rank": "97.38 %ile",
    "score": "JEE Main",
    "year": "2024",
    "photo": "/images/toppers/yash_new.jpg",
    "isPoster": true
  }
];

export { DEFAULT_SYLLABUS, DEFAULT_TOPPERS };`;

const marker = 'const DEFAULT_TOPPERS = [';
const idx = content.lastIndexOf(marker);
if (idx !== -1) {
    content = content.substring(0, idx) + replacement;
    fs.writeFileSync(file, content);
    console.log('Successfully updated DEFAULT_TOPPERS');
} else {
    console.log('Could not find DEFAULT_TOPPERS');
}
