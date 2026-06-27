
const fs = require('fs');
let code = fs.readFileSync('src/pages/TestSeriesExam.jsx', 'utf-8');
code = code.replace(
  'import TeacherSolution from \'../components/TeacherSolution\';',
  'import TeacherSolution from \'../components/TeacherSolution\';\nimport { fixExamGoalHtml } from \'../utils/htmlCleaner\';'
);
code = code.replace(
  'dangerouslySetInnerHTML={{ __html: question?.questionText || question?.question || \'\' }}',
  'dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(question?.questionText || question?.question || \'\') }}'
);
code = code.replace(
  /dangerouslySetInnerHTML=\{\{ __html: opt \}\}/g,
  'dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(opt) }}'
);
fs.writeFileSync('src/pages/TestSeriesExam.jsx', code);
