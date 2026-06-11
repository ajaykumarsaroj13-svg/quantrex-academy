import fs from 'fs';
import path from 'path';

// Mapping from examgoal chapter to our slugs
const slugMap = {
    'mathematical-induction-and-binomial-theorem': 'binomial-theorem',
    'application-of-integration': 'area-under-the-curves', 
};

const rawDir = 'public/data/questions/raw_adv_math';
const outDir = 'public/data/questions';

const files = fs.readdirSync(rawDir);

// grouped by slug
const grouped = {};

for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const data = JSON.parse(fs.readFileSync(path.join(rawDir, f), 'utf-8'));
    
    if (!data.results || !data.results[0] || !data.results[0].questions) continue;
    
    for (const q of data.results[0].questions) {
        let chapter = q.chapter; 
        let mappedSlug = slugMap[chapter] || chapter;
        
        if (!grouped[mappedSlug]) {
            grouped[mappedSlug] = [];
        }
        
        let topic = q.topic || 'General';
        
        const english = q.question.en;
        const optHtml = english.options.map(o => o.content);
        let correctIdx = -1;
        if (english.correct_options && english.correct_options.length > 0) {
            const correctOpt = english.correct_options[0]; 
            if (english.options) {
                correctIdx = english.options.findIndex(o => o.id === correctOpt.id);
            }
        }
        
        const qObj = {
            question_id: q.question_id,
            chapterId: mappedSlug,
            title: q.paperTitle,
            year: q.year,
            difficulty: q.difficulty || "medium",
            type: q.type === 'subjective' ? 'Numerical' : 'SCQ',
            question: english.content,
            options: optHtml,
            correctOptionIndex: correctIdx,
            correctAnswer: q.type === 'subjective' ? english.answer : "",
            solution: english.explanation || english.answer || "",
            marks: q.marks || 4,
            negativeMarks: q.negMarks || 0,
            topic: topic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            exam: "jee-advanced"
        };
        
        grouped[mappedSlug].push(qObj);
    }
}

// Write out JSON files
for (const slug in grouped) {
    fs.writeFileSync(path.join(outDir, `adv-${slug}.json`), JSON.stringify(grouped[slug], null, 2));
    console.log(`Written adv-${slug}.json with ${grouped[slug].length} questions.`);
}

console.log("Done building advanced files.");
