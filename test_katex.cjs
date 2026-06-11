const katex = require('katex');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/utils/blackBookDataFull.json', 'utf8'));
let aod_matching = [];

for (const ch of data) {
    if (ch.id === 'black_book_ch_aod') {
        for (const q of ch.questions) {
            if (q.questionType === 'MATCH THE COLUMN') {
                aod_matching.push(q.text);
            }
        }
    }
}

let hasError = false;
for (let i = 0; i < aod_matching.length; i++) {
    const text = aod_matching[i];
    const parts = text.split('$$');
    for (let j = 1; j < parts.length; j += 2) {
        try {
            katex.renderToString(parts[j], { displayMode: true, throwOnError: true });
        } catch (e) {
            console.error(`Error in question ${i+1}:`, e.message);
            hasError = true;
        }
    }
}

if (!hasError) {
    console.log("All KaTeX rendered successfully!");
}
