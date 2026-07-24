const fs = require('fs'); 
['src/pages/TestSeriesExam.jsx', 'src/pages/NtaTestInterface.jsx'].forEach(file => {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/question\.(instruction|topic|shift|title|year|correctAnswer|correctOptionsArray|correctOption|solution|correctOptionIndex|options|questionText|text|question|type|marks|negativeMarks|questionType)/g, 'question?.$1');
  text = text.replace(/currentQ\.(instruction|topic|shift|title|year|correctAnswer|correctOptionsArray|correctOption|solution|correctOptionIndex|options|questionText|text|question|type|explanation|marks|negativeMarks)/g, 'currentQ?.$1');
  fs.writeFileSync(file, text);
});
