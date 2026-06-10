const fs = require('fs');

let code = fs.readFileSync('generateTestSeries.cjs', 'utf8');

const newLogic = `
    // ----- STRICT FORMATTING LOGIC ------
    const subjectGroups = { 'Physics': [], 'Chemistry': [], 'Mathematics': [] };
    tp.questions.forEach(q => {
      if(subjectGroups[q.subject]) subjectGroups[q.subject].push(q);
    });
    
    tp.questions = [];
    const isJeeMain = tp.examType === 'JEE Main' || tp.title.includes('AIEEE');
    const year = parseInt(tp.year);
    
    for (const sub of ['Physics', 'Chemistry', 'Mathematics']) {
      let qs = subjectGroups[sub];
      let mcqs = qs.filter(q => q.questionType === 'MCQ');
      let nums = qs.filter(q => q.questionType === 'NUMERICAL');
      
      let targetMcq = mcqs.length;
      let targetNum = nums.length;
      
      if (isJeeMain && !isNaN(year)) {
        if (year >= 2025) { targetMcq = 20; targetNum = 5; }
        else if (year >= 2021 && year <= 2024) { targetMcq = 20; targetNum = 10; }
        else if (year === 2020) { targetMcq = 20; targetNum = 5; }
        else if (year >= 2009 && year <= 2019) { targetMcq = 30; targetNum = 0; }
        else if (year === 2008) { targetMcq = 35; targetNum = 0; }
        else if (year === 2007) { targetMcq = 40; targetNum = 0; }
        else if (year === 2006) { targetMcq = (sub === 'Mathematics' ? 40 : 55); targetNum = 0; }
        else if (year >= 2002 && year <= 2005) { targetMcq = 75; targetNum = 0; }
      }
      
      // Ensure we have exactly targetMcq and targetNum by padding or slicing
      let finalMcqs = [...mcqs];
      while(finalMcqs.length > targetMcq) finalMcqs.pop();
      if(targetMcq > 0) {
        while(finalMcqs.length > 0 && finalMcqs.length < targetMcq) finalMcqs.push({...finalMcqs[finalMcqs.length % mcqs.length]});
      }
      
      let finalNums = [...nums];
      while(finalNums.length > targetNum) finalNums.pop();
      if(targetNum > 0 && nums.length > 0) {
        while(finalNums.length > 0 && finalNums.length < targetNum) finalNums.push({...finalNums[finalNums.length % nums.length]});
      }
      // if targetNum > 0 but we have NO nums, we can't pad nums. So we just leave it.
      
      // Update section labels to ensure purity
      finalMcqs.forEach(q => { q.section = 'A'; tp.questions.push(q); });
      finalNums.forEach(q => { q.section = 'B'; tp.questions.push(q); });
    }
    
    // Calculate total questions dynamically based on this exact structuring
    tp.totalQuestions = tp.questions.length;
    // ------------------------------------
`;

const saveIndex = code.indexOf('for (const [mainKey, tp] of testPapers.entries()) {');
const saveContentStart = code.indexOf('fs.writeFileSync(testFilePath, JSON.stringify(tp, null, 2));', saveIndex);

if (saveIndex > -1 && saveContentStart > -1) {
  const loopStart = code.substring(0, saveContentStart);
  const loopEnd = code.substring(saveContentStart);
  
  const modifiedCode = loopStart + newLogic + '\n    ' + loopEnd;
  fs.writeFileSync('generateTestSeries_structured.cjs', modifiedCode);
  console.log('Created generateTestSeries_structured.cjs successfully!');
} else {
  console.log('Could not find injection point');
}
