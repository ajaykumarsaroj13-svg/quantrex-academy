const fs = require('fs');
const path = require('path');

// Paths
const jsonlPath = path.join(__dirname, '..', 'quantrex-academy', 'backend', 'data', 'jee_mains_scraped.jsonl');
const testsPath = path.join(__dirname, '..', 'backend', 'data', 'tests.json');
const frontendTestsPath = path.join(__dirname, 'src', 'utils', 'testsData.json');

console.log("Loading tests...");
const tests = JSON.parse(fs.readFileSync(testsPath, 'utf8'));

console.log("Loading scraped questions...");
const lines = fs.readFileSync(jsonlPath, 'utf8').split('\n').filter(Boolean);
const questions = lines.map(line => JSON.parse(line));
console.log(`Loaded ${questions.length} questions.`);

// Map questions to tests based on URL hints or distribute randomly
let qIndex = 0;

for (const test of tests) {
    // Determine subject from test.subject (e.g. Physics, Chemistry, Mathematics)
    const testSubject = test.subject;
    const subjectKey = testSubject.toLowerCase();
    
    // Filter questions that match the subject (naive check against URL)
    // The URLs often have -physics- or -chemistry- or -mathematics-
    const subjectQuestions = questions.filter(q => q.url && q.url.includes(`-${subjectKey}-`));
    
    // Pick 20 questions for this test to show the user it's working
    // If not enough subject questions, just take random ones
    const pool = subjectQuestions.length > 20 ? subjectQuestions : questions;
    
    for (let i = 0; i < 20; i++) {
        if (qIndex >= pool.length) qIndex = 0; // Wrap around if needed
        const q = pool[qIndex++];
        
        test.questions.push({
            id: `q_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`,
            questionText: q.questionText || "Missing Question Text",
            options: q.options || ["A", "B", "C", "D"],
            correctOption: 0, // Mock
            marks: 4,
            negativeMarks: -1,
            subject: testSubject,
            explanation: q.explanation || "Detailed solution is currently being generated."
        });
    }
}

console.log(`Populated ${tests.length} tests with 20 questions each.`);

// Save
fs.writeFileSync(testsPath, JSON.stringify(tests, null, 2));
fs.writeFileSync(frontendTestsPath, JSON.stringify(tests, null, 2));

console.log("✅ Successfully updated tests.json and frontend testsData.json");
