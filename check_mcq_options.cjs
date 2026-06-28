const fs = require('fs');

const chapters = [
  'black-book-ch1-functions',
  'black-book-ch2-limits',
  'black-book-ch3-continuity',
  'black-book-ch4-aod',
  'black-book-ch5-integration',
  'quadratic-equations',
  'sequence-and-series',
  'determinants',
  'adv-area-under-curves',
  'adv-differential-equations'
];

chapters.forEach(ch => {
  const path = 'public/data/blackbook/' + ch + '.json';
  if (!fs.existsSync(path)) return;
  const data = JSON.parse(fs.readFileSync(path));
  const exNames = [...new Set(data.map(q => q.exerciseName))];
  console.log('*** Chapter:', ch);
  exNames.forEach(ex => {
    const qs = data.filter(q => q.exerciseName === ex);
    const hasCorrectOption = qs.filter(q => q.correctOption !== undefined && q.correctOption !== null).length;
    const hasCorrectOptionsArray = qs.filter(q => q.correctOptionsArray !== undefined && q.correctOptionsArray !== null && q.correctOptionsArray.length > 0).length;
    console.log(`  ${ex}: total=${qs.length}, hasCorrectOption=${hasCorrectOption}, hasCorrectOptionsArray=${hasCorrectOptionsArray}`);
  });
});
