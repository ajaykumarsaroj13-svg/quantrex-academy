
const fs = require("fs");

let file = "src/pages/TestSeriesResult.jsx";
let code = fs.readFileSync(file, "utf8");
code = code.replace(/question\.questionType === 'MCQM' \|\| /g, "q.questionType === 'MCQM' || ");
fs.writeFileSync(file, code);

file = "src/components/ExamGoalPracticeInterface.jsx";
code = fs.readFileSync(file, "utf8");
code = code.replace(/question\.questionType === 'MCQM' \|\| /g, "question.type === 'MCQM' || ");
fs.writeFileSync(file, code);

console.log("Fixed syntax 2");

