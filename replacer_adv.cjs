const fs = require('fs');

let code = fs.readFileSync('generateTestSeries.cjs', 'utf8');

const newLogic = `
sortedPapers.forEach(tp => {
  const isJeeMain = tp.examType === 'JEE Main' || tp.title.includes('AIEEE');
  const isJeeAdvanced = tp.examType === 'JEE Advanced';
  const year = parseInt(tp.year);
  
  if ((isJeeMain || isJeeAdvanced) && !isNaN(year)) {
    const subjectGroups = { 'Physics': [], 'Chemistry': [], 'Mathematics': [] };
    tp.questions.forEach(q => {
      if(subjectGroups[q.subject]) subjectGroups[q.subject].push(q);
    });
    
    tp.questions = [];
    
    const getAdvStructure = (y, isPaper2) => {
      if (y >= 2024) {
        if (!isPaper2) {
          return [
            { name: 'Sec 1', count: 4, type: 'MCQ', marks: 3, neg: -1, instruction: '<ul><li>This section contains <b>FOUR (04)</b> questions.</li><li>Each question has <b>FOUR</b> options (A), (B), (C) and (D). <b>ONLY ONE</b> of these four options is the correct answer.</li><li>For each question, choose the option corresponding to the correct answer.</li><li>Answer to each question will be evaluated according to the following marking scheme:<br><i>Full Marks</i> : +3 If ONLY the correct option is chosen;<br><i>Zero Marks</i> : 0 If none of the options is chosen (i.e. the question is unanswered);<br><i>Negative Marks</i> : −1 In all other cases.</li></ul>' },
            { name: 'Sec 2', count: 4, type: 'MCQ', marks: 4, neg: -1, instruction: '<ul><li>This section contains <b>FOUR (04)</b> questions.</li><li>Each question has <b>FOUR</b> options (A), (B), (C) and (D). <b>ONE OR MORE THAN ONE</b> of these four option(s) is(are) correct answer(s).</li><li>For each question, choose the option(s) corresponding to (all) the correct answer(s).</li><li>Answer to each question will be evaluated according to the following marking scheme:<br><i>Full Marks</i> : +4 ONLY if (all) the correct option(s) is(are) chosen;<br><i>Partial Marks</i> : +3 If all the four options are correct but ONLY three options are chosen;<br><i>Partial Marks</i> : +2 If three or more options are correct but ONLY two options are chosen, both of which are correct;<br><i>Partial Marks</i> : +1 If two or more options are correct but ONLY one option is chosen and it is a correct option;<br><i>Zero Marks</i> : 0 If none of the options is chosen (i.e. the question is unanswered);<br><i>Negative Marks</i> : −1 In all other cases.</li></ul>' },
            { name: 'Sec 3', count: 4, type: 'NUMERICAL', marks: 4, neg: 0, instruction: '<ul><li>This section contains <b>FOUR (04)</b> questions.</li><li>The answer to each question is a <b>NUMERICAL VALUE</b>.</li><li>For each question, enter the correct numerical value corresponding to the answer in the designated place using the mouse and the on-screen virtual numeric keypad.</li><li>If the numerical value has more than two decimal places, <b>truncate/round-off</b> the value to <b>TWO</b> decimal places.</li><li>Answer to each question will be evaluated according to the following marking scheme:<br><i>Full Marks</i> : +4 If ONLY the correct numerical value is entered in the designated place;<br><i>Zero Marks</i> : 0 In all other cases.</li></ul>' },
            { name: 'Sec 4', count: 4, type: 'MCQ', marks: 3, neg: -1, instruction: '<ul><li>This section contains <b>FOUR (04)</b> Matching List Sets.</li><li>Each set has <b>ONE</b> Multiple Choice Question.</li><li>Each set has <b>TWO</b> lists: <b>List-I</b> and <b>List-II</b>.</li><li><b>FOUR</b> options are given in each Multiple Choice Question based on <b>List-I</b> and <b>List-II</b> and <b>ONLY ONE</b> of these four options satisfies the condition asked in the Multiple Choice Question.</li><li>Answer to each question will be evaluated according to the following marking scheme:<br><i>Full Marks</i> : +3 ONLY if the option corresponding to the correct combination is chosen;<br><i>Zero Marks</i> : 0 If none of the options is chosen (i.e. the question is unanswered);<br><i>Negative Marks</i> : −1 In all other cases.</li></ul>' },
          ];
        } else {
          return [
            { name: 'Sec 1', count: 4, type: 'MCQ', marks: 3, neg: -1, instruction: '<ul><li>This section contains <b>FOUR (04)</b> questions.</li><li>Each question has <b>FOUR</b> options (A), (B), (C) and (D). <b>ONLY ONE</b> of these four options is the correct answer.</li><li>For each question, choose the option corresponding to the correct answer.</li><li>Answer to each question will be evaluated according to the following marking scheme:<br><i>Full Marks</i> : +3 If ONLY the correct option is chosen;<br><i>Zero Marks</i> : 0 If none of the options is chosen (i.e. the question is unanswered);<br><i>Negative Marks</i> : −1 In all other cases.</li></ul>' },
            { name: 'Sec 2', count: 5, type: 'MCQ', marks: 4, neg: -1, instruction: '<ul><li>This section contains <b>FIVE (05)</b> questions.</li><li>Each question has <b>FOUR</b> options (A), (B), (C) and (D). <b>ONE OR MORE THAN ONE</b> of these four option(s) is(are) correct answer(s).</li><li>For each question, choose the option(s) corresponding to (all) the correct answer(s).</li><li>Answer to each question will be evaluated according to the following marking scheme:<br><i>Full Marks</i> : +4 ONLY if (all) the correct option(s) is(are) chosen;<br><i>Partial Marks</i> : +3 If all the four options are correct but ONLY three options are chosen;<br><i>Partial Marks</i> : +2 If three or more options are correct but ONLY two options are chosen, both of which are correct;<br><i>Partial Marks</i> : +1 If two or more options are correct but ONLY one option is chosen and it is a correct option;<br><i>Zero Marks</i> : 0 If none of the options is chosen (i.e. the question is unanswered);<br><i>Negative Marks</i> : −1 In all other cases.</li></ul>' },
            { name: 'Sec 3', count: 5, type: 'NUMERICAL', marks: 4, neg: 0, instruction: '<ul><li>This section contains <b>FIVE (05)</b> questions.</li><li>The answer to each question is a <b>NUMERICAL VALUE</b>.</li><li>For each question, enter the correct numerical value corresponding to the answer in the designated place using the mouse and the on-screen virtual numeric keypad.</li><li>If the numerical value has more than two decimal places, <b>truncate/round-off</b> the value to <b>TWO</b> decimal places.</li><li>Answer to each question will be evaluated according to the following marking scheme:<br><i>Full Marks</i> : +4 If ONLY the correct numerical value is entered in the designated place;<br><i>Zero Marks</i> : 0 In all other cases.</li></ul>' },
            { name: 'Sec 4', count: 4, type: 'NUMERICAL', marks: 2, neg: 0, instruction: '<ul><li>This section contains <b>TWO (02)</b> question stems.</li><li>There are <b>TWO (02)</b> questions corresponding to each question stem.</li><li>The answer to each question is a <b>NUMERICAL VALUE</b>.</li><li>For each question, enter the correct numerical value corresponding to the answer in the designated place using the mouse and the on-screen virtual numeric keypad.</li><li>If the numerical value has more than two decimal places, <b>truncate/round-off</b> the value to <b>TWO</b> decimal places.</li><li>Answer to each question will be evaluated according to the following marking scheme:<br><i>Full Marks</i> : +2 If ONLY the correct numerical value is entered at the designated place;<br><i>Zero Marks</i> : 0 In all other cases.</li></ul>' },
          ];
        }
      }
      if (y === 2023) {
        if (!isPaper2) return [{name: 'Sec 1', count: 3, type: 'MCQ'}, {name: 'Sec 2', count: 4, type: 'NUMERICAL'}, {name: 'Sec 3', count: 4, type: 'MCQ'}];
        else return [{name: 'Sec 1', count: 6, type: 'MCQ'}, {name: 'Sec 2', count: 6, type: 'NUMERICAL'}, {name: 'Sec 3', count: 6, type: 'NUMERICAL'}];
      }
      if (y === 2022) {
        return [{name: 'Sec 1', count: 8, type: 'NUMERICAL'}, {name: 'Sec 2', count: 6, type: 'MCQ'}, {name: 'Sec 3', count: 4, type: 'MCQ'}];
      }
      if (y === 2021) {
        if (!isPaper2) return [{name: 'Sec 1', count: 4, type: 'MCQ'}, {name: 'Sec 2', count: 6, type: 'NUMERICAL'}, {name: 'Sec 3', count: 6, type: 'MCQ'}, {name: 'Sec 4', count: 3, type: 'NUMERICAL'}];
        else return [{name: 'Sec 1', count: 6, type: 'MCQ'}, {name: 'Sec 2', count: 6, type: 'NUMERICAL'}, {name: 'Sec 3', count: 4, type: 'MCQ'}, {name: 'Sec 4', count: 3, type: 'NUMERICAL'}];
      }
      if (y === 2020) {
        if (!isPaper2) return [{name: 'Sec 1', count: 6, type: 'MCQ'}, {name: 'Sec 2', count: 6, type: 'MCQ'}, {name: 'Sec 3', count: 6, type: 'NUMERICAL'}];
        else return [{name: 'Sec 1', count: 6, type: 'NUMERICAL'}, {name: 'Sec 2', count: 6, type: 'MCQ'}, {name: 'Sec 3', count: 6, type: 'NUMERICAL'}];
      }
      if (y === 2019) {
        if (!isPaper2) return [{name: 'Sec 1', count: 4, type: 'MCQ'}, {name: 'Sec 2', count: 8, type: 'MCQ'}, {name: 'Sec 3', count: 6, type: 'NUMERICAL'}];
        else return [{name: 'Sec 1', count: 8, type: 'MCQ'}, {name: 'Sec 2', count: 6, type: 'NUMERICAL'}, {name: 'Sec 3', count: 4, type: 'MCQ'}];
      }
      if (y === 2018) {
        return [{name: 'Sec 1', count: 6, type: 'MCQ'}, {name: 'Sec 2', count: 8, type: 'NUMERICAL'}, {name: 'Sec 3', count: 4, type: 'MCQ'}];
      }
      if (y === 2017) {
        if (!isPaper2) return [{name: 'Sec 1', count: 7, type: 'MCQ'}, {name: 'Sec 2', count: 5, type: 'NUMERICAL'}, {name: 'Sec 3', count: 6, type: 'MCQ'}];
        else return [{name: 'Sec 1', count: 7, type: 'MCQ'}, {name: 'Sec 2', count: 7, type: 'MCQ'}, {name: 'Sec 3', count: 4, type: 'MCQ'}];
      }
      if (y === 2016) {
        if (!isPaper2) return [{name: 'Sec 1', count: 5, type: 'MCQ'}, {name: 'Sec 2', count: 8, type: 'MCQ'}, {name: 'Sec 3', count: 5, type: 'NUMERICAL'}];
        else return [{name: 'Sec 1', count: 6, type: 'MCQ'}, {name: 'Sec 2', count: 8, type: 'MCQ'}, {name: 'Sec 3', count: 4, type: 'MCQ'}];
      }
      if (y === 2015) {
        if (!isPaper2) return [{name: 'Sec 1', count: 8, type: 'NUMERICAL'}, {name: 'Sec 2', count: 10, type: 'MCQ'}, {name: 'Sec 3', count: 2, type: 'MCQ'}];
        else return [{name: 'Sec 1', count: 8, type: 'NUMERICAL'}, {name: 'Sec 2', count: 8, type: 'MCQ'}, {name: 'Sec 3', count: 4, type: 'MCQ'}];
      }
      if (y === 2014) {
        if (!isPaper2) return [{name: 'Sec 1', count: 10, type: 'MCQ'}, {name: 'Sec 2', count: 10, type: 'NUMERICAL'}];
        else return [{name: 'Sec 1', count: 10, type: 'MCQ'}, {name: 'Sec 2', count: 6, type: 'MCQ'}, {name: 'Sec 3', count: 4, type: 'MCQ'}];
      }
      if (y === 2013) {
        if (!isPaper2) return [{name: 'Sec 1', count: 10, type: 'MCQ'}, {name: 'Sec 2', count: 5, type: 'MCQ'}, {name: 'Sec 3', count: 5, type: 'NUMERICAL'}];
        else return [{name: 'Sec 1', count: 5, type: 'MCQ'}, {name: 'Sec 2', count: 8, type: 'MCQ'}, {name: 'Sec 3', count: 5, type: 'MCQ'}];
      }
      if (y === 2012) {
        if (!isPaper2) return [{name: 'Sec 1', count: 10, type: 'MCQ'}, {name: 'Sec 2', count: 5, type: 'MCQ'}, {name: 'Sec 3', count: 5, type: 'NUMERICAL'}];
        else return [{name: 'Sec 1', count: 8, type: 'MCQ'}, {name: 'Sec 2', count: 6, type: 'MCQ'}, {name: 'Sec 3', count: 6, type: 'MCQ'}];
      }
      if (y === 2011) {
        if (!isPaper2) return [{name: 'Sec 1', count: 7, type: 'MCQ'}, {name: 'Sec 2', count: 5, type: 'MCQ'}, {name: 'Sec 3', count: 7, type: 'NUMERICAL'}];
        else return [{name: 'Sec 1', count: 8, type: 'MCQ'}, {name: 'Sec 2', count: 4, type: 'MCQ'}, {name: 'Sec 3', count: 6, type: 'NUMERICAL'}, {name: 'Sec 4', count: 2, type: 'MCQ'}];
      }
      if (y === 2010) {
        if (!isPaper2) return [{name: 'Sec 1', count: 6, type: 'MCQ'}, {name: 'Sec 2', count: 6, type: 'MCQ'}, {name: 'Sec 3', count: 16, type: 'NUMERICAL'}];
        else return [{name: 'Sec 1', count: 6, type: 'MCQ'}, {name: 'Sec 2', count: 5, type: 'MCQ'}, {name: 'Sec 3', count: 8, type: 'MCQ'}];
      }
      if (y === 2009) {
        if (!isPaper2) return [{name: 'Sec 1', count: 8, type: 'MCQ'}, {name: 'Sec 2', count: 4, type: 'MCQ'}, {name: 'Sec 3', count: 6, type: 'MCQ'}, {name: 'Sec 4', count: 2, type: 'MCQ'}];
        else return [{name: 'Sec 1', count: 4, type: 'MCQ'}, {name: 'Sec 2', count: 5, type: 'MCQ'}, {name: 'Sec 3', count: 2, type: 'MCQ'}, {name: 'Sec 4', count: 8, type: 'NUMERICAL'}];
      }
      if (y === 2008) {
        if (!isPaper2) return [{name: 'Sec 1', count: 6, type: 'MCQ'}, {name: 'Sec 2', count: 4, type: 'MCQ'}, {name: 'Sec 3', count: 4, type: 'MCQ'}, {name: 'Sec 4', count: 9, type: 'MCQ'}];
        else return [{name: 'Sec 1', count: 9, type: 'MCQ'}, {name: 'Sec 2', count: 4, type: 'MCQ'}, {name: 'Sec 3', count: 9, type: 'MCQ'}, {name: 'Sec 4', count: 3, type: 'MCQ'}];
      }
      if (y === 2007) {
        return [{name: 'Sec 1', count: 9, type: 'MCQ'}, {name: 'Sec 2', count: 4, type: 'MCQ'}, {name: 'Sec 3', count: 6, type: 'MCQ'}, {name: 'Sec 4', count: 3, type: 'MCQ'}];
      }
      if (y === 2006) {
        return [{name: 'Sec 1', count: 12, type: 'MCQ'}, {name: 'Sec 2', count: 8, type: 'MCQ'}, {name: 'Sec 3', count: 12, type: 'MCQ'}, {name: 'Sec 4', count: 8, type: 'MCQ'}];
      }
      if (y === 2005) {
        return [{name: 'Sec 1', count: 8, type: 'NUMERICAL'}, {name: 'Sec 2', count: 8, type: 'NUMERICAL'}, {name: 'Sec 3', count: 2, type: 'NUMERICAL'}];
      }
      return [{name: 'Sec 1', count: 6, type: 'MCQ'}, {name: 'Sec 2', count: 6, type: 'NUMERICAL'}, {name: 'Sec 3', count: 6, type: 'MCQ'}];
    };
    
    for (const sub of ['Physics', 'Chemistry', 'Mathematics']) {
      let qs = subjectGroups[sub];
      let mcqs = qs.filter(q => q.questionType === 'MCQ');
      let nums = qs.filter(q => q.questionType === 'NUMERICAL');
      
      if (isJeeMain) {
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
      } else if (isJeeAdvanced) {
        const isPaper2 = tp.title.includes('Paper 2');
        const advStructure = getAdvStructure(year, isPaper2);
        
        advStructure.forEach(secDef => {
          let pool = secDef.type === 'MCQ' ? mcqs : nums;
          for (let i = 0; i < secDef.count; i++) {
            if (pool.length > 0) {
              let q = pool.shift(); 
              q.section = secDef.name;
              q.marks = secDef.marks || 4;
              q.negativeMarks = secDef.neg !== undefined ? secDef.neg : -1;
              q.instruction = secDef.instruction || '';
              q.questionType = secDef.type;
              tp.questions.push(q);
            } else {
              let fallbackPool = secDef.type === 'MCQ' ? mcqs : nums;
              if (fallbackPool.length === 0) fallbackPool = qs;
              
              if (fallbackPool.length > 0) {
                let q = {...fallbackPool[i % fallbackPool.length]};
                q.section = secDef.name;
                q.marks = secDef.marks || 4;
                q.negativeMarks = secDef.neg !== undefined ? secDef.neg : -1;
                q.instruction = secDef.instruction || '';
                q.questionType = secDef.type;
                tp.questions.push(q);
              }
            }
          }
        });
      }
    }
    tp.totalQuestions = tp.questions.length;
  }
  
  const subjects = [...new Set(tp.questions.map(q => q.subject))];
  tp.sections = subjects.map(s => ({ name: s }));
  tp.questions.forEach((q, i) => { q.questionNumber = i + 1; });
  
  fs.writeFileSync(path.join(testsDir, \`\${tp.id}.json\`), JSON.stringify(tp, null, 2));
});

console.log('Done! All test files generated.');
`

const index = code.indexOf('sortedPapers.forEach(tp => {');
code = code.substring(0, index) + newLogic;

fs.writeFileSync('generateTestSeries.cjs', code);
console.log('Fixed correctly');
