const fs = require('fs');
const syl = fs.readFileSync('public/syllabus.json', 'utf-8');
const top = fs.readFileSync('public/toppers.json', 'utf-8');
fs.writeFileSync('public/data-script.js', 'window.DEFAULT_SYLLABUS = ' + syl + ';\nwindow.DEFAULT_TOPPERS = ' + top + ';');
console.log('done');
