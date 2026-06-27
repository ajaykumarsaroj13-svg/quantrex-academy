
const fs = require('fs');
let text = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/9258c762-64f2-4a36-9c75-51c0271bfbb8/task.md', 'utf-8');
text = text.replace('- [ ] Update src/index.css', '- [x] Update src/index.css');
text = text.replace('- [ ] Add HTML clean-up utility', '- [x] Add HTML clean-up utility');
fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/9258c762-64f2-4a36-9c75-51c0271bfbb8/task.md', text);
