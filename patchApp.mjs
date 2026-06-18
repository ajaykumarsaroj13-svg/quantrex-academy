
import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = 'import { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } from \'./utils/syllabusData\';';
const replacement = 'import { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } from \'./utils/syllabusData\';\n\nif (DEFAULT_SYLLABUS[\'jee-advanced\'] && DEFAULT_SYLLABUS[\'jee-advanced\'].subjects && DEFAULT_SYLLABUS[\'jee-advanced\'].subjects.mathematics && DEFAULT_SYLLABUS[\'jee-advanced\'].subjects.mathematics.chapters) {\n    DEFAULT_SYLLABUS[\'jee-advanced\'].subjects.mathematics.chapters = DEFAULT_SYLLABUS[\'jee-advanced\'].subjects.mathematics.chapters.slice(0, 4);\n}\n';

content = content.replace(targetStr, replacement);
content = content.replace(/quantrex_syllabus_v7/g, 'quantrex_syllabus_v8');

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx patched successfully');

