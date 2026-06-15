
const fs = require("fs");

let file = "src/components/ExamGoalPracticeInterface.jsx";
let code = fs.readFileSync(file, "utf8");
code = code.replace(/currentQuestion\.type === 'MULTI_CORRECT' \|\|/g, "currentQuestion.type === 'MULTI_CORRECT' || currentQuestion.type === 'MCQM' ||");
fs.writeFileSync(file, code);

console.log("Fixed syntax 3");

