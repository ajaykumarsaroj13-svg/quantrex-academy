const fs = require('fs');

let code = fs.readFileSync('replacer_adv.cjs', 'utf8');

const oldLogic = `      if (y >= 2024) {
        if (!isPaper2) {
          return [
            { name: 'Sec 1', count: 4, type: 'MCQ' },
            { name: 'Sec 2', count: 4, type: 'MCQ' },
            { name: 'Sec 3', count: 4, type: 'NUMERICAL' },
            { name: 'Sec 4', count: 4, type: 'MCQ' },
          ];
        } else {
          return [
            { name: 'Sec 1', count: 4, type: 'MCQ' },
            { name: 'Sec 2', count: 5, type: 'MCQ' },
            { name: 'Sec 3', count: 5, type: 'NUMERICAL' },
            { name: 'Sec 4', count: 4, type: 'NUMERICAL' },
          ];
        }
      }`;

const newLogic = `      if (y >= 2024) {
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
      }`;

code = code.replace(oldLogic, newLogic);
// Also save it onto questions
const pIdx = code.indexOf(`q.section = secDef.name;`);
code = code.substring(0, pIdx) + `q.section = secDef.name;
              q.marks = secDef.marks;
              q.negativeMarks = secDef.neg;
              q.instruction = secDef.instruction;
              ` + code.substring(pIdx + 25);

fs.writeFileSync('replacer_adv.cjs', code);
