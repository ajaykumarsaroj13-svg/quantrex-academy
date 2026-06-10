import fs from 'fs';

let syllabusStr = fs.readFileSync('./src/utils/syllabusData.js', 'utf8');
let codeToEval = syllabusStr.replace('export const DEFAULT_SYLLABUS =', 'const DEFAULT_SYLLABUS =').replace('export const DEFAULT_TOPPERS =', 'const DEFAULT_TOPPERS =') + '\nreturn { DEFAULT_SYLLABUS };';
const { DEFAULT_SYLLABUS } = new Function(codeToEval)();

const mathsChapters = DEFAULT_SYLLABUS['jee-mains'].subjects.mathematics.chapters;
let empty = 0;
mathsChapters.forEach(ch => {
    if (!ch.pdfs || ch.pdfs.length === 0) {
        empty++;
        console.log("Empty:", ch.title);
    }
});
console.log(`${empty} out of ${mathsChapters.length} chapters are empty.`);
