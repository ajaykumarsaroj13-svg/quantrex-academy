const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'syllabus.json');
let content = fs.readFileSync(filePath, 'utf8');

const match = content.match(/.{0,50}Sets and Relations.{0,50}/g);
console.log(match);
