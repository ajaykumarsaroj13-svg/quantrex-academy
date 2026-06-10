import fs from 'fs';

const advData = JSON.parse(fs.readFileSync('./src/utils/advancedSyllabus.json', 'utf8'));
const advChapters = advData.subjects.mathematics.chapters;

let syllabusStr = fs.readFileSync('./src/utils/syllabusData.js', 'utf8');

// Replace both exports
let codeToEval = syllabusStr.replace('export const DEFAULT_SYLLABUS =', 'const DEFAULT_SYLLABUS =');
codeToEval = codeToEval.replace('export const DEFAULT_TOPPERS =', 'const DEFAULT_TOPPERS =');
codeToEval += '\nreturn { DEFAULT_SYLLABUS, DEFAULT_TOPPERS };';

const { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } = new Function(codeToEval)();

const mainsChapters = DEFAULT_SYLLABUS['jee-mains'].subjects.mathematics.chapters;

let copiedCount = 0;

mainsChapters.forEach(mainsCh => {
    const mainTitleStr = mainsCh.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let bestMatch = null;
    advChapters.forEach(advCh => {
        const advTitleStr = advCh.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (advTitleStr === mainTitleStr || mainTitleStr.includes(advTitleStr) || advTitleStr.includes(mainTitleStr)) {
            bestMatch = advCh;
        }
    });

    if (bestMatch && bestMatch.pdfs && bestMatch.pdfs.length > 0) {
        mainsCh.pdfs = bestMatch.pdfs.map(p => ({
            id: 'mains_' + p.id,
            title: p.title,
            url: p.url,
            size: p.size,
            isFree: p.isFree
        }));
        copiedCount += mainsCh.pdfs.length;
    } else {
        mainsCh.pdfs = [];
    }
});

const newSyllabusStr = `export const DEFAULT_SYLLABUS = ${JSON.stringify(DEFAULT_SYLLABUS, null, 2)};\n\nexport const DEFAULT_TOPPERS = ${JSON.stringify(DEFAULT_TOPPERS, null, 2)};\n`;

fs.writeFileSync('./src/utils/syllabusData.js', newSyllabusStr);
console.log(`✅ Successfully copied ${copiedCount} PDFs from JEE Advanced to JEE Mains Mathematics.`);
