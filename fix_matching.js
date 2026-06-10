const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/utils/blackBookDataFull.json', 'utf8'));

data.forEach(ch => {
  ch.questions.forEach(q => {
    if (q.questionType === 'MATCH THE COLUMN') {
      q.options = [
        '\ \\\\rightarrow P; B \\\\rightarrow Q; C \\\\rightarrow R; D \\\\rightarrow S\$',
        '\ \\\\rightarrow Q; B \\\\rightarrow P; C \\\\rightarrow S; D \\\\rightarrow R\$',
        '\ \\\\rightarrow R; B \\\\rightarrow S; C \\\\rightarrow P; D \\\\rightarrow Q\$',
        '\ \\\\rightarrow S; B \\\\rightarrow R; C \\\\rightarrow Q; D \\\\rightarrow P\$'
      ];
      // ensure we don't have multiple $ from double escaping
      q.options = q.options.map(opt => opt.replace(/\\\$/g, '$'));
    }
  });
});

fs.writeFileSync('src/utils/blackBookDataFull.json', JSON.stringify(data, null, 2));
