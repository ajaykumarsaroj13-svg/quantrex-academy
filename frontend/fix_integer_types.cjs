const fs = require('fs');

const dataPath = './src/utils/testsData.json';
const dataPath2 = './src/utils/testsData2.json';
let tests = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let integerCount = 0;
let cleanedCount = 0;

tests.forEach(test => {
    test.questions.forEach(q => {
        let isInteger = false;
        
        // Criteria for an integer question:
        // Examside injected recommended questions into options.
        // If an option contains 'Let $A =', or 'Then the number of', or has a huge length, it's garbage.
        
        // Also if the question ends with blanks
        if (q.questionText.includes('\\_\\_\\_\\_') || q.questionText.includes('________')) {
            isInteger = true;
        }

        let badOptionCount = 0;
        q.options.forEach(opt => {
            if (opt.length > 250) badOptionCount++;
            if (opt.includes('<p>Let ')) badOptionCount++;
            if (opt.includes('Then the number of elements')) badOptionCount++;
            if (opt === 'N/A') badOptionCount++;
        });

        if (badOptionCount >= 2) {
            isInteger = true;
        }

        if (isInteger) {
            integerCount++;
            q.type = 'integer';
            q.options = []; // Clear garbage options
            // Also clean explanation if it contains garbage
            if (q.explanation && (q.explanation.includes('<p>Let ') || q.explanation.length > 500)) {
                q.explanation = "Detailed numerical solution is currently being compiled by the AI Mentor.";
                cleanedCount++;
            }
        }
    });
});

fs.writeFileSync(dataPath, JSON.stringify(tests, null, 2));
fs.writeFileSync(dataPath2, JSON.stringify(tests, null, 2));

console.log(`Successfully identified ${integerCount} Integer Type questions!`);
console.log(`Cleaned garbage explanations from ${cleanedCount} questions.`);
