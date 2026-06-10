const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('examgoal_api_data.json', 'utf-8'));
const metaKey = 'https://room.examgoal.com/api/v1/past-question/question/meta/32d7734b-70dc-5cad-bcd0-e03d57818046';
const questions = rawData[metaKey].results[0].questions;

const formattedQuestions = questions.map(q => {
  const en = q.question.en;
  
  let type = "SCQ";
  if (q.type === 'mcq') type = "SCQ";
  if (q.type === 'integer') type = "NUMERICAL";
  
  let options = [];
  let correctOptionIndex = -1;
  
  if (en.options && en.options.length > 0) {
    options = en.options.map(opt => opt.content.trim());
    if (en.correct_options && en.correct_options.length > 0) {
      const correctId = en.correct_options[0];
      const correctOpt = en.options.find(o => o.identifier === correctId);
      if (correctOpt) {
        correctOptionIndex = en.options.indexOf(correctOpt);
      }
    }
  } else if (type === "NUMERICAL" && en.answer) {
    // some numericals just have the answer
    options = [en.answer];
    correctOptionIndex = 0;
  }
  
  let year = q.year ? q.year.toString() : "Unknown";
  let title = q.paperTitle || `JEE Main ${year}`;
  
  return {
    id: q.question_id,
    chapterId: "matrices-and-determinants",
    exam: "JEE Main",
    title: title,
    year: year,
    difficulty: q.difficulty ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1) : "Medium",
    type: type,
    question: en.content.trim(),
    options: options,
    correctOptionIndex: correctOptionIndex,
    solution: en.explanation ? en.explanation.trim() : "",
    marks: q.marks || 4,
    negativeMarks: q.negMarks ? -q.negMarks : -1,
    topic: q.topic || "General"
  };
});

fs.writeFileSync('public/data/questions/matrices-and-determinants.json', JSON.stringify(formattedQuestions, null, 2));
console.log(`Successfully converted ${formattedQuestions.length} questions and saved to matrices-and-determinants.json`);
