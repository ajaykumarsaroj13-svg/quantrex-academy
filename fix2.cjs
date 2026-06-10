const fs = require('fs');
const file = 'src/pages/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('{/* PRACTICE CONFIGURATION MODAL */}', ')}\n\n      {/* PRACTICE CONFIGURATION MODAL */}');

fs.writeFileSync(file, content);
