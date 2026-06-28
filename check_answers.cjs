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
  if (!fs.existsSync(path)) {
    console.log(ch, 'does not exist');
    return;
  }
  const data = JSON.parse(fs.readFileSync(path));
  const exNames = [...new Set(data.map(q => q.exerciseName))];
  console.log('*** Chapter:', ch);
  exNames.forEach(ex => {
    const qs = data.filter(q => q.exerciseName === ex);
    const hasCorrectAnswer = qs.filter(q => q.correctAnswer !== undefined && q.correctAnswer !== null && q.correctAnswer !== '').length;
    const hasAnswerKeyStr = qs.filter(q => q.answerKeyStr !== undefined && q.answerKeyStr !== null && q.answerKeyStr !== '').length;
    const missingBoth = qs.filter(q => (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer === '') && (q.answerKeyStr === undefined || q.answerKeyStr === null || q.answerKeyStr === '')).length;
    console.log(`  ${ex}: total=${qs.length}, hasCorrectAnswer=${hasCorrectAnswer}, hasAnswerKeyStr=${hasAnswerKeyStr}, missingBoth=${missingBoth}`);
  });
});
