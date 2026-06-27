const fs = require('fs');

const testsData = JSON.parse(fs.readFileSync('./src/utils/testsData.json', 'utf8'));

// Extract unique chapters
const chapterNames = [];
testsData.forEach(t => {
    const name = t.title.split(' - ')[0];
    if (!chapterNames.includes(name)) chapterNames.push(name);
});

console.log("Chapters found:", chapterNames);

const syllabusPath = './src/utils/syllabusData.js';
let content = fs.readFileSync(syllabusPath, 'utf8');

// We need to inject the generated chapters into the Mathematics subject inside Grade 12 (JEE Main).
// In syllabusData.js, it looks like:
// { id: 'math', name: 'Mathematics', color: 'bg-blue-600', textColor: 'text-blue-600', chapters: [ ... ] }
// Let's create the replacement array.

const chaptersArrayString = chapterNames.map((name, i) => {
    return `{
        id: 'math_chap_${i+1}',
        title: "${name}",
        duration: "10 Hours",
        lectures: 12,
        notes: 3,
        tests: 2,
        progress: 0,
        testsList: [
            { id: "test_math_chap_${i+1}_practice", title: "${name} - Practice Mode", duration: "60 mins", questions: 0 },
            { id: "test_math_chap_${i+1}_exam", title: "${name} - Exam Mode", duration: "60 mins", questions: 0 }
        ]
    }`;
}).join(',\n        ');

// We use regex to replace the math chapters array.
// This is tricky if the structure is complex. We'll use a crude regex that assumes Mathematics is the only subject we touch, or we'll just rewrite syllabusData.js completely if needed.
// Actually, I can just replace the entire syllabusData.js with a dynamically built one.

