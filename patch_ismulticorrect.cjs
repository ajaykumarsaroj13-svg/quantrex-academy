const fs = require('fs');

const filesToPatch = [
    'src/components/ExamGoalPracticeInterface.jsx',
    'src/pages/TestSeriesExam.jsx',
    'src/pages/TestSeriesResult.jsx'
];

for (const file of filesToPatch) {
    if(!fs.existsSync(file)) continue;
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace currentQuestion.type === 'MULTI_CORRECT' with also checking 'MCQM'
    code = code.replace(/question\.type === 'MULTI_CORRECT'/g, "question.type === 'MULTI_CORRECT' || question.type === 'MCQM'");
    code = code.replace(/questionType === 'MULTI_CORRECT'/g, "questionType === 'MULTI_CORRECT' || question.questionType === 'MCQM'");
    
    // Also for currentQuestion
    code = code.replace(/currentQuestion\.type === 'MULTI_CORRECT'/g, "currentQuestion.type === 'MULTI_CORRECT' || currentQuestion.type === 'MCQM'");
    code = code.replace(/questionType === 'MULTI_CORRECT'/g, "questionType === 'MULTI_CORRECT' || currentQuestion.questionType === 'MCQM'");

    fs.writeFileSync(file, code);
}
console.log('Patched isMultiCorrect checks');
