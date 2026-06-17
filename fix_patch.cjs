
const fs = require("fs");

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, "utf8");
    code = code.replace(/currentQuestion\.type === 'MCQM' \|\| /g, "");
    code = code.replace(/currentQuestion\.questionType === 'MCQM' \|\| /g, "");
    code = code.replace(/question\.questionType === 'MCQM' \|\| /g, "question.questionType === 'MCQM' || ");
    fs.writeFileSync(file, code);
}

fixFile("src/pages/TestSeriesExam.jsx");
fixFile("src/pages/TestSeriesResult.jsx");
fixFile("src/components/ExamGoalPracticeInterface.jsx");
console.log("Fixed syntax");

