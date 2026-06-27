const fs = require('fs');
const glob = require('glob');

const oldRtdbPath = 'C:/Users/Admin/.gemini/antigravity/scratch/rtdb_root_practice_questions.json';
const oldRtdb = JSON.parse(fs.readFileSync(oldRtdbPath, 'utf-8'));

const titleMap = {};

for (const [chapterId, data] of Object.entries(oldRtdb)) {
    let questionsList = [];
    if (Array.isArray(data)) {
        questionsList = data;
    } else if (typeof data === 'object' && data !== null) {
        if (data.questions) {
            if (Array.isArray(data.questions)) {
                questionsList = data.questions;
            } else if (typeof data.questions === 'object') {
                questionsList = Object.values(data.questions);
            }
        }
    }

    for (const q of questionsList) {
        if (!q || typeof q !== 'object') continue;
        const qId = q.question_id || q._id || q.id;
        const title = q.title;
        if (qId && title) {
            titleMap[String(qId)] = title;
        }
    }
}

console.log('Loaded ' + Object.keys(titleMap).length + ' titles from RTDB backup.');

let updatedCount = 0;
const files = glob.sync('public/data/questions/*.json');

for (const filepath of files) {
    let data;
    try {
        data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    } catch (e) {
        console.error('Error parsing file: ' + filepath);
        continue;
    }
    let changed = false;

    let questionsToCheck = [];
    if (Array.isArray(data)) {
        questionsToCheck = data;
    } else if (typeof data === 'object' && data !== null) {
        if (data.questions) {
            if (Array.isArray(data.questions)) {
                questionsToCheck = data.questions;
            } else if (typeof data.questions === 'object') {
                questionsToCheck = Object.values(data.questions);
            }
        }
    }

    for (const q of questionsToCheck) {
        if (!q || typeof q !== 'object') continue;
        const qId = q.question_id || q._id || q.id;
        if (qId && titleMap[String(qId)]) {
            q.title = titleMap[String(qId)];
            changed = true;
            updatedCount++;
        }
    }

    if (changed) {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    }
}

console.log('Updated ' + updatedCount + ' questions with missing titles.');
