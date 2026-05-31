import fs from 'fs';

let syllabusStr = fs.readFileSync('./src/utils/syllabusData.js', 'utf8');
let codeToEval = syllabusStr.replace('export const DEFAULT_SYLLABUS =', 'const DEFAULT_SYLLABUS =').replace('export const DEFAULT_TOPPERS =', 'const DEFAULT_TOPPERS =') + '\nreturn { DEFAULT_SYLLABUS };';
const { DEFAULT_SYLLABUS } = new Function(codeToEval)();

const mathsChapters = DEFAULT_SYLLABUS['jee-mains'].subjects.mathematics.chapters;
console.log(mathsChapters[0].title);
console.log(mathsChapters[0].pdfs);
