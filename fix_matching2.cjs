const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/utils/blackBookDataFull.json', 'utf8'));

data.forEach(ch => {
  ch.questions.forEach(q => {
    if (q.questionType === 'MATCH THE COLUMN') {
      q.options = [
        '$A \\\\rightarrow P; B \\\\rightarrow Q; C \\\\rightarrow R; D \\\\rightarrow S$',
        '$A \\\\rightarrow Q; B \\\\rightarrow P; C \\\\rightarrow S; D \\\\rightarrow R$',
        '$A \\\\rightarrow R; B \\\\rightarrow S; C \\\\rightarrow P; D \\\\rightarrow Q$',
        '$A \\\\rightarrow S; B \\\\rightarrow R; C \\\\rightarrow Q; D \\\\rightarrow P$'
      ];
      q.correctOption = 0;
    }
  });
});

fs.writeFileSync('src/utils/blackBookDataFull.json', JSON.stringify(data, null, 2));
