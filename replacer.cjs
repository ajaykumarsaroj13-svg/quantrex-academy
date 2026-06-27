const fs = require('fs');

let code = fs.readFileSync('generateTestSeries.cjs', 'utf8');

const newLogic = `
sortedPapers.forEach(tp => {
  const isJeeMain = tp.examType === 'JEE Main' || tp.title.includes('AIEEE');
  const year = parseInt(tp.year);
  
  if (isJeeMain && !isNaN(year)) {
    const subjectGroups = { 'Physics': [], 'Chemistry': [], 'Mathematics': [] };
    tp.questions.forEach(q => {
      if(subjectGroups[q.subject]) subjectGroups[q.subject].push(q);
    });
    
    tp.questions = [];
    for (const sub of ['Physics', 'Chemistry', 'Mathematics']) {
      let qs = subjectGroups[sub];
      let mcqs = qs.filter(q => q.questionType === 'MCQ');
      let nums = qs.filter(q => q.questionType === 'NUMERICAL');
      
      let targetMcq = mcqs.length;
      let targetNum = nums.length;
      
      if (year >= 2025) { targetMcq = 20; targetNum = 5; }
      else if (year >= 2021 && year <= 2024) { targetMcq = 20; targetNum = 10; }
      else if (year === 2020) { targetMcq = 20; targetNum = 5; }
      else if (year >= 2009 && year <= 2019) { targetMcq = 30; targetNum = 0; }
      else if (year === 2008) { targetMcq = 35; targetNum = 0; }
      else if (year === 2007) { targetMcq = 40; targetNum = 0; }
      else if (year === 2006) { targetMcq = (sub === 'Mathematics' ? 40 : 55); targetNum = 0; }
      else if (year >= 2002 && year <= 2005) { targetMcq = 75; targetNum = 0; }
      
      let finalMcqs = [...mcqs];
      while(finalMcqs.length > targetMcq) finalMcqs.pop();
      if(targetMcq > 0 && finalMcqs.length > 0) {
        while(finalMcqs.length < targetMcq) finalMcqs.push({...finalMcqs[finalMcqs.length % mcqs.length]});
      }
      
      let finalNums = [...nums];
      while(finalNums.length > targetNum) finalNums.pop();
      if(targetNum > 0 && finalNums.length > 0) {
        while(finalNums.length < targetNum) finalNums.push({...finalNums[finalNums.length % nums.length]});
      }
      
      finalMcqs.forEach(q => { q.section = 'A'; tp.questions.push(q); });
      finalNums.forEach(q => { q.section = 'B'; tp.questions.push(q); });
    }
    tp.totalQuestions = tp.questions.length;
  }
  
  const subjects = [...new Set(tp.questions.map(q => q.subject))];
  tp.sections = subjects.map(s => ({ name: s }));
  tp.questions.forEach((q, i) => { q.questionNumber = i + 1; });
  
  fs.writeFileSync(path.join(testsDir, \`\${tp.id}.json\`), JSON.stringify(tp, null, 2));
});
`;

code = code.replace(/sortedPapers\.forEach\(tp => \{[\s\S]*?\}\);/, newLogic);
fs.writeFileSync('generateTestSeries.cjs', code);
console.log('Replaced successfully');
