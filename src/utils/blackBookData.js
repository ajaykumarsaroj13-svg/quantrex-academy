import fullData from './blackBookDataFull.json';

export const blackBookDemoData = {
  id: "black-book-maths",
  title: "Advanced Problems in Mathematics",
  author: "Vikas Gupta & Pankaj Joshi (Black Book)",
  chapters: fullData.slice(0, 4).map(ch => ({
     id: ch.id,
     title: ch.title,
     totalQuestions: ch.questions.length,
     questions: ch.questions
  }))
};
