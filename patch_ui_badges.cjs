const fs = require('fs');
let p1 = 'src/components/ExamGoalPracticeInterface.jsx';
let code1 = fs.readFileSync(p1, 'utf8');

const badgeHtml = `
              {(() => {
                const t = currentQuestion.type || currentQuestion.questionType || 'SCQ';
                const isMCQM = t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'multi_correct' || t === 'multiple_correct' || t === 'mcqm';
                const isSubj = t === 'SUBJECTIVE' || t === 'subjective';
                const isNum = t === 'NUMERICAL' || t === 'numerical' || currentQuestion.answerType === 'numerical';
                let label = isMCQM ? 'MCQM' : (isSubj ? 'SUBJECTIVE' : (isNum ? 'NUMERICAL' : 'SCQ'));
                return (
                  <span className={\`px-2 py-0.5 text-[10px] font-bold rounded \${isMCQM ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : (isNum ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : (isSubj ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-green-500/10 text-green-600 border border-green-500/20'))}\`}>
                    {label}
                  </span>
                );
              })()}`;

const rep1 = `              {currentQuestion.shift || currentQuestion.title || currentQuestion.year}
            </h1>${badgeHtml}
          </div>`;

code1 = code1.replace(/\{\s*currentQuestion\.shift \|\| currentQuestion\.title \|\| currentQuestion\.year\s*\}\n\s*<\/h1>\n\s*<\/div>/g, rep1);
fs.writeFileSync(p1, code1);

let p2 = 'src/components/ExamGoalTestInterface.jsx';
let code2 = fs.readFileSync(p2, 'utf8');

const rep2 = `              {currentQuestion.shift || currentQuestion.title || currentQuestion.year}
            </h1>${badgeHtml}
          </div>`;

code2 = code2.replace(/\{\s*currentQuestion\.shift \|\| currentQuestion\.title \|\| currentQuestion\.year\s*\}\n\s*<\/h1>\n\s*<\/div>/g, rep2);
fs.writeFileSync(p2, code2);
console.log("Patched headers");
