const fs = require('fs');
const file = 'src/pages/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('      )}\n    )}\n    </>', '      )}\n    </>');

fs.writeFileSync(file, content);
