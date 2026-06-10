const fs = require('fs');

const syllabusFile = './src/utils/syllabusData.js';
const testsFile = './src/utils/testsData.json';
const tests2File = './src/utils/testsData2.json';
const questionsFile = './math_sample.json';

const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

// Initialize tests output
let testsData = [];

// Create 2 test objects for the 2 chapters
const chapterMap = {
    "Sets, Relations and Functions": "math_chap_1",
    "Complex Numbers and Quadratic Equations": "math_chap_2"
};

for (const [chapTitle, chapId] of Object.entries(chapterMap)) {
    const chapQuestions = questions.filter(q => q.chapter === chapTitle);
    
    // Map them into standard test format
    const testQuestions = chapQuestions.map((q, idx) => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        correctOption: "A",
        explanation: q.explanation,
        year: q.year,
        shift: q.shift
    }));

    testsData.push({
        id: `test_${chapId}_practice`,
        title: `${chapTitle} - Practice Mode`,
        durationMinutes: 60,
        type: "nta",
        questions: testQuestions
    });

    testsData.push({
        id: `test_${chapId}_exam`,
        title: `${chapTitle} - Exam Mode`,
        durationMinutes: 60,
        type: "nta",
        questions: testQuestions
    });
}

// Write to testsData.json and testsData2.json
fs.writeFileSync(testsFile, JSON.stringify(testsData, null, 2));
fs.writeFileSync(tests2File, JSON.stringify(testsData, null, 2));

console.log("Successfully generated tests for Math Sample.");
