const fs = require('fs');
const path = require('path');
const tests = JSON.parse(fs.readFileSync('./public/data/test-series.json'));
let testList = tests.tests || tests;
let allQuestions = [];
for (let t of testList) {
    if (t.id.startsWith('real_test')) {
        try {
            let td = JSON.parse(fs.readFileSync(`./public/data/tests/${t.id}.json`));
            allQuestions = allQuestions.concat(td.questions || []);
        } catch(e) {}
    }
}
console.log('Extracted questions:', allQuestions.length);
let topics = new Set();
let chapters = new Set();
for (let q of allQuestions) {
    if (q.topic) topics.add(q.topic);
    if (q.chapter) chapters.add(q.chapter);
}
console.log('Topics:', Array.from(topics).slice(0, 10));
console.log('Chapters:', Array.from(chapters).slice(0, 10));
