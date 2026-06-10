const fs = require('fs');
let content = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', 'utf8');

// Fix backtick leak
content = content.replace('</div>`', '</div>');
content = content.replace('<div className="flex flex-wrap gap-2">`', '<div className="flex flex-wrap gap-2">');

fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', content);
console.log('Fixed syntax leak.');
