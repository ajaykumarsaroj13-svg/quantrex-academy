const fs = require('fs');

const advChapters = JSON.parse(fs.readFileSync('adv_math_chapters.json', 'utf8'));

const quantrexChapters = advChapters.map((ch, idx) => {
    return {
        id: `ch_adv_mathematics_${idx}`,
        title: ch.title,
        url: `https://questions.examside.com/past-years/jee/jee-advanced/mathematics/${ch.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        videos: [],
        pdfs: [],
        formulas: [],
        mockTests: [],
        module: "Advanced Math"
    };
});

const advSyllabusObj = {
    label: "JEE Advanced",
    subjects: {
        mathematics: {
            label: "Mathematics",
            chapters: quantrexChapters
        }
    }
};

const advStr = `"jee-advanced": ${JSON.stringify(advSyllabusObj, null, 4)},`;

let content = fs.readFileSync('src/utils/syllabusData.js', 'utf8');

if (!content.includes('"jee-advanced"')) {
    content = content.replace('export const DEFAULT_SYLLABUS = {', 'export const DEFAULT_SYLLABUS = {\n  ' + advStr + '\n');
    fs.writeFileSync('src/utils/syllabusData.js', content);
    console.log('Successfully added jee-advanced to syllabusData.js');
} else {
    console.log('jee-advanced already exists in syllabusData.js. Need manual patching if updating chapters.');
}

// Generate the mapping script for extraction
const mappingCode = `
const MAP = {
${advChapters.map((ch, idx) => `  "${ch.title}": "ch_adv_mathematics_${idx}"`).join(',\n')}
};
module.exports = MAP;
`;
fs.writeFileSync('adv_math_map.js', mappingCode.trim());
console.log('Generated mapping adv_math_map.js');
