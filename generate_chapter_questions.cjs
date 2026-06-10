const fs = require('fs');
const path = require('path');

console.log('Reading test-series.json...');
const testsRaw = JSON.parse(fs.readFileSync('./public/data/test-series.json', 'utf8'));
let testList = testsRaw.tests || testsRaw;

let allQuestions = [];
for (let t of testList) {
    if (t.id.startsWith('real_test')) {
        try {
            let td = JSON.parse(fs.readFileSync(`./public/data/tests/${t.id}.json`, 'utf8'));
            if (td.questions && Array.isArray(td.questions)) {
                allQuestions = allQuestions.concat(td.questions);
            }
        } catch(e) {}
    }
}

console.log(`Extracted ${allQuestions.length} questions from tests.`);

// Group by topic
const questionsByTopic = {};
for (let q of allQuestions) {
    if (!q.topic) continue;
    let topic = q.topic;
    if (!questionsByTopic[topic]) {
        questionsByTopic[topic] = [];
    }
    // Add an ID if it doesn't have one
    if (!q.id) q.id = `q_${Math.random().toString(36).slice(2)}`;
    // Normalize correct answer
    if (!q.correctAnswer && q.answer) q.correctAnswer = q.answer;
    
    questionsByTopic[topic].push(q);
}

const outDir = './public/data/questions';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

let fileCount = 0;
for (let [topic, qList] of Object.entries(questionsByTopic)) {
    const filePath = path.join(outDir, `${topic}.json`);
    fs.writeFileSync(filePath, JSON.stringify(qList, null, 2), 'utf8');
    fileCount++;
}

console.log(`Successfully wrote ${fileCount} topic JSON files to ${outDir}`);
