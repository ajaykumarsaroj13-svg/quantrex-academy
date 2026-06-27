
const fs = require('fs');
let text = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/9258c762-64f2-4a36-9c75-51c0271bfbb8/task.md', 'utf-8');
text = text.replace('- [ ] Enable isMultiCorrect properly for ExamGoal questions', '- [x] Enable isMultiCorrect properly for ExamGoal questions');
text = text.replace('- [ ] Show Multi-Correct badges', '- [x] Show Multi-Correct badges');
fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/9258c762-64f2-4a36-9c75-51c0271bfbb8/task.md', text);
