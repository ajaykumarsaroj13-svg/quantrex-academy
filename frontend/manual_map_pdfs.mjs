import fs from 'fs';

const advData = JSON.parse(fs.readFileSync('./src/utils/advancedSyllabus.json', 'utf8'));
const advChapters = advData.subjects.mathematics.chapters;

let syllabusStr = fs.readFileSync('./src/utils/syllabusData.js', 'utf8');
let codeToEval = syllabusStr.replace('export const DEFAULT_SYLLABUS =', 'const DEFAULT_SYLLABUS =').replace('export const DEFAULT_TOPPERS =', 'const DEFAULT_TOPPERS =') + '\nreturn { DEFAULT_SYLLABUS, DEFAULT_TOPPERS };';
const { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } = new Function(codeToEval)();

const mainsChapters = DEFAULT_SYLLABUS['jee-mains'].subjects.mathematics.chapters;

const manualMap = {
  "Quadratic Equation and Inequalities": "Quadratic Equations",
  "Sequences and Series": "Sequence & Series",
  "Matrices and Determinants": "Matrices & Determinants",
  "Permutations and Combinations": "Permutations & Combinations",
  "3D Geometry": "3-Dimensional Geometry",
  "Trigonometric Ratio and Identites": "Trigonometrical functions", // More general
  "Trigonometric Equations": "Trigonometrical identities and equations",
  "Limits, Continuity and Differentiability": "Limit, Continuity & Differentiability",
  "Area Under The Curves": "Area Under Curve",
  "Sets and Relations": "Functions", // Close enough
  "Height and Distance": "Properties Of Triangle" // Often grouped
};

let copiedCount = 0;

mainsChapters.forEach(mainsCh => {
    if (!mainsCh.pdfs || mainsCh.pdfs.length === 0) {
        const mappedTitle = manualMap[mainsCh.title];
        if (mappedTitle) {
            const advCh = advChapters.find(c => c.title === mappedTitle);
            if (advCh && advCh.pdfs && advCh.pdfs.length > 0) {
                mainsCh.pdfs = advCh.pdfs.map(p => ({
                    id: 'mains_man_' + p.id,
                    title: p.title,
                    url: p.url,
                    size: p.size,
                    isFree: p.isFree
                }));
                copiedCount += mainsCh.pdfs.length;
                console.log(`Mapped ${mainsCh.pdfs.length} PDFs for ${mainsCh.title}`);
            }
        }
    }
});

const newSyllabusStr = `export const DEFAULT_SYLLABUS = ${JSON.stringify(DEFAULT_SYLLABUS, null, 2)};\n\nexport const DEFAULT_TOPPERS = ${JSON.stringify(DEFAULT_TOPPERS, null, 2)};\n`;

fs.writeFileSync('./src/utils/syllabusData.js', newSyllabusStr);
console.log(`✅ Successfully copied ${copiedCount} PDFs from JEE Advanced to JEE Mains Mathematics via manual mapping.`);
