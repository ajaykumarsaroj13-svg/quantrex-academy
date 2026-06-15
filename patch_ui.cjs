
const fs = require("fs");

function patchTestSeriesResult() {
  const file = "src/pages/TestSeriesResult.jsx";
  let code = fs.readFileSync(file, "utf8");

  // Fix CSS
  code = code.replace(/(\.tsr-opt-card\s*\{\s*[\s\S]*?gap:\s*16px;)/, "$1\n            position: relative;\n            border: 2px solid rgba(255,255,255,0.04);");
  code = code.replace(/(\.tsr-opt-card\.correct\s*\{\s*[\s\S]*?)border-color:.*?;/g, "$1border-color: #22c55e;");
  code = code.replace(/(\.tsr-opt-card\.user-selected\s*\{\s*[\s\S]*?)border-color:.*?;/g, "$1border-color: #ef4444;");
  code = code.replace(/(\.tsr-opt-card\.correct\.user-selected\s*\{\s*[\s\S]*?)border-color:.*?;/g, "$1border-color: #22c55e;");

  // Fix logic
  const renderLogicOld = `                        {(activeQuestion.options || []).map((opt, oIdx) => {
                          const isCorrectOption = activeQuestion.correctOption === oIdx;
                          const isUserOption = activeQuestion.userAnswer === oIdx;
                          
                          let cardClass = "";
                          if (isCorrectOption) cardClass = "correct";
                          else if (isUserOption) cardClass = "user-selected";
  
                          return (
                            <div key={oIdx} className={\`tsr-opt-card \${cardClass}\`}>
                              <span className="tsr-opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                              <span className="tex2jax_process" dangerouslySetInnerHTML={{ __html: opt }} />
                              
                              {isCorrectOption && (
                                <span className="tsr-opt-status-badge correct">Correct Option</span>
                              )}
                              {!isCorrectOption && isUserOption && (
                                <span className="tsr-opt-status-badge user-wrong">Your Marked Option</span>
                              )}
                            </div>
                          );
                        })}`;

  const renderLogicNew = `                        {(activeQuestion.options || []).map((opt, oIdx) => {
                          const isMultiCorrect = activeQuestion.isMultiCorrect;
                          const correctArr = activeQuestion.actualCorrectArr || [];
                          const userArr = Array.isArray(activeQuestion.userAnswer) ? activeQuestion.userAnswer : [parseInt(activeQuestion.userAnswer)];
                          
                          const isCorrectOption = isMultiCorrect ? correctArr.includes(oIdx) : activeQuestion.correctOption === oIdx;
                          const isUserOption = isMultiCorrect ? userArr.includes(oIdx) : activeQuestion.userAnswer === oIdx;
                          
                          let cardClass = "";
                          if (isCorrectOption && isUserOption) cardClass = "correct user-selected";
                          else if (isCorrectOption && !isUserOption) cardClass = "correct";
                          else if (!isCorrectOption && isUserOption) cardClass = "user-selected user-wrong";

                          let badgeText = null;
                          let badgeBg = "";
                          if (isCorrectOption && isUserOption) {
                            badgeText = "Your answer | Correct answer";
                            badgeBg = "bg-[#22c55e]";
                          } else if (isCorrectOption && !isUserOption) {
                            badgeText = "Correct answer";
                            badgeBg = "bg-[#22c55e]";
                          } else if (!isCorrectOption && isUserOption) {
                            badgeText = "Your answer";
                            badgeBg = "bg-[#ef4444]";
                          }

                          return (
                            <div key={oIdx} className={\`tsr-opt-card \${cardClass}\`}>
                              <span className="tsr-opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                              <span className="tex2jax_process flex-1" dangerouslySetInnerHTML={{ __html: opt }} />
                              
                              {badgeText && (
                                <div className={\`absolute -top-[10px] right-6 px-2.5 py-[2px] rounded-md text-[10px] font-bold text-white tracking-wide shadow-md \${badgeBg}\`}>
                                  {badgeText}
                                </div>
                              )}
                            </div>
                          );
                        })}`;

  code = code.replace(renderLogicOld.replace(/"/g, "\x22"), renderLogicNew);
  // Just in case whitespace issues
  if (code.includes("Your answer | Correct answer")) {
     console.log("TestSeriesResult patched successfully.");
  } else {
     // manual fallback replace
     code = code.replace(/\{\(activeQuestion\.options \|\| \[\]\)\.map\(\(opt, oIdx\) => \{[\s\S]*?\}\)\}/, renderLogicNew);
     console.log("TestSeriesResult patched with fallback.");
  }

  fs.writeFileSync(file, code);
}

function patchExamGoalPracticeInterface() {
  const file = "src/components/ExamGoalPracticeInterface.jsx";
  let code = fs.readFileSync(file, "utf8");

  const newOptLoop = `                  {optionsToRender.map((opt, idx) => {
                      const isSelected = isMultiCorrect ? (Array.isArray(selectedOption) && selectedOption.includes(idx)) : (selectedOption === idx || selectedOption === String(idx));
                      
                      let correctIdxArr = [];
                      if (isMultiCorrect) {
                        if (currentQuestion.correctOptionsArray && currentQuestion.correctOptionsArray.length > 0) {
                          correctIdxArr = currentQuestion.correctOptionsArray;
                        } else if (currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 0) {
                          correctIdxArr = currentQuestion.question.en.correct_options.map(c => c.charCodeAt(0) - 65);
                        } else if (currentQuestion.correctAnswer && String(currentQuestion.correctAnswer).includes(",")) {
                          const cleaned = String(currentQuestion.correctAnswer).replace(/[()]/g, "");
                          correctIdxArr = cleaned.split(",").map(s => {
                            const trimmed = s.trim();
                            const parsed = parseInt(trimmed, 10);
                            if (!isNaN(parsed)) return parsed;
                            const charCode = trimmed.toUpperCase().charCodeAt(0);
                            if (charCode >= 65 && charCode <= 90) return charCode - 65;
                            return NaN;
                          }).filter(n => !isNaN(n));
                        } else if (Array.isArray(currentQuestion.correctOptionIndex)) {
                          correctIdxArr = currentQuestion.correctOptionIndex;
                        }
                      } else {
                        let cIdx = parseInt(currentQuestion.correctOptionIndex, 10);
                        if (isNaN(cIdx) && currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 0) {
                          cIdx = currentQuestion.question.en.correct_options[0].charCodeAt(0) - 65;
                        } else if (isNaN(cIdx) && currentQuestion.correctAnswer) {
                           const trimmed = String(currentQuestion.correctAnswer).trim();
                           const charCode = trimmed.toUpperCase().charCodeAt(0);
                           if (charCode >= 65 && charCode <= 90) cIdx = charCode - 65;
                        }
                        correctIdxArr = [cIdx];
                      }
                      const isCorrectOption = correctIdxArr.includes(idx);
                      
                      let boxClass = isLight ? "border-gray-200 bg-white hover:border-gray-300" : "border-gray-700 bg-[#1e293b] hover:border-gray-600 text-gray-200";
                      let circleClass = "bg-[#1976d2] text-white";
                      
                      let badgeText = null;
                      let badgeBg = "";

                      if (isAnswerChecked || isTestSubmitted) {
                        if (isSelected && isCorrectOption) { 
                          boxClass = isLight ? "border-[#22c55e] border-2 bg-[#e8f5e9]" : "border-[#22c55e] border-2 bg-[#064e3b] text-white"; 
                          circleClass = "bg-[#22c55e] text-white"; 
                          badgeText = "Your answer | Correct answer";
                          badgeBg = "bg-[#22c55e]";
                        }
                        else if (isSelected && !isCorrectOption) { 
                          boxClass = isLight ? "border-[#ef4444] border-2 bg-[#fdecea]" : "border-[#ef4444] border-2 bg-[#7f1d1d] text-white"; 
                          circleClass = "bg-[#ef4444] text-white"; 
                          badgeText = "Your answer";
                          badgeBg = "bg-[#ef4444]";
                        }
                        else if (!isCorrectOption && isCorrectOption) { /* never */ }
                        else if (!isSelected && isCorrectOption) { 
                          boxClass = isLight ? "border-[#22c55e] border-2 bg-white" : "border-[#22c55e] border-2 bg-[#1e293b] text-white"; 
                          circleClass = "bg-[#22c55e] text-white"; 
                          badgeText = "Correct answer";
                          badgeBg = "bg-[#22c55e]";
                        }
                        else { 
                          boxClass = isLight ? "border-gray-200 border bg-white" : "border-gray-700 border bg-[#1e293b]"; 
                          circleClass = "bg-gray-400 text-white"; 
                        }
                      } else if (isSelected) {
                        boxClass = isLight ? "border-[#2962ff] bg-[#f0f4ff]" : "border-[#60a5fa] bg-[#1e3a8a] text-white";
                      } else {
                        boxClass += " border";
                      }
  
                      const labelChar = String.fromCharCode(65 + idx);
                      let optContent = opt.content || opt;
  
                      return (
                        <button key={idx} onClick={() => handleOptionSelect(idx)} disabled={isAnswerChecked || isTestSubmitted} className={\`w-full text-left p-4 flex items-start gap-4 rounded-xl transition-all shadow-sm relative overflow-visible \${boxClass}\`}>
                          <div className={\`w-[30px] h-[30px] shrink-0 \${isMultiCorrect ? "rounded-md" : "rounded-full"} flex items-center justify-center font-bold text-[13px] \${circleClass}\`}>
                            {labelChar}
                          </div>
                          <div className={\`flex-1 mt-1 font-medium exam-math-content \${isLight ? "text-black" : "text-gray-100"}\`} style={{ fontSize: \`\${Math.max(14, fontSize - 1)}px\` }} dangerouslySetInnerHTML={{ __html: fixMathJax(optContent) }} />
                          {badgeText && (
                            <div className={\`absolute -top-[10px] right-6 px-2.5 py-[2px] rounded-md text-[10px] font-bold text-white tracking-wide shadow-md \${badgeBg}\`}>
                              {badgeText}
                            </div>
                          )}
                        </button>
                      );
                    })}`;

  code = code.replace(/\{optionsToRender\.map\(\(opt, idx\) => \{[\s\S]*?\}\)\}/, newOptLoop);
  if (code.includes("Your answer | Correct answer")) {
     console.log("ExamGoalPracticeInterface patched successfully.");
  } else {
     console.log("ExamGoalPracticeInterface NOT patched. Regex failed.");
  }
  fs.writeFileSync(file, code);
}

patchTestSeriesResult();
patchExamGoalPracticeInterface();

