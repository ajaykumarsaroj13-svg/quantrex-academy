const fullData = window.DEFAULT_BLACKBOOK || [];

export const blackBookDemoData = {
  id: "black-book-maths",
  title: "Advanced Problems in Mathematics",
  author: "Vikas Gupta & Pankaj Joshi (Black Book)",
  chapters: fullData.slice(0, 4).map(ch => ({
     id: ch.id,
     title: ch.title,
     totalQuestions: ch.questions ? ch.questions.length : 0,
     questions: ch.questions || []
  }))
};

