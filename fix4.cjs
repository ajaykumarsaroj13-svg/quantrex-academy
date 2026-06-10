const fs = require('fs');
const file = 'src/pages/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace using regex that handles both \r\n and \n
content = content.replace(/[ \t]*\)\}\r?\n[ \t]*\)\}\r?\n[ \t]*<\/>/, '      )}\n    </>');

fs.writeFileSync(file, content);
