with open('src/components/ExamGoalPracticeInterface.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update isMultiCorrect and isNumerical
old_vars = "  const isSubjective = currentQuestion.type === 'SUBJECTIVE' || currentQuestion.type === 'subjective';\n  const isNumerical = !isSubjective && (currentQuestion.type === 'Numerical Value' || currentQuestion.type === 'Integer' || currentQuestion.type === 'numerical' || currentQuestion.type === 'NUMERICAL' || currentQuestion.type === 'integer-value' || (currentQuestion.options && currentQuestion.options.length === 0));"
new_vars = "  const optionsToRender = (currentQuestion.question?.en?.options && currentQuestion.question.en.options.length > 0) ? currentQuestion.question.en.options : (currentQuestion.options || []);\n  const isSubjective = currentQuestion.type === 'SUBJECTIVE' || currentQuestion.type === 'subjective';\n  const isMultiCorrect = !isSubjective && (currentQuestion.type === 'MULTI_CORRECT' || currentQuestion.type === 'multi_correct' || currentQuestion.type === 'multiple_correct' || currentQuestion.type === 'MCQM' || currentQuestion.type === 'mcqm' || currentQuestion.type === 'MCQ (Multiple Correct)' || currentQuestion.type === 'Multiple Correct' || (currentQuestion.correctOptionsArray && currentQuestion.correctOptionsArray.length > 0) || currentQuestion.isMultiCorrect || (currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 1));\n  const isNumerical = !isSubjective && !isMultiCorrect && (currentQuestion.type === 'Numerical Value' || currentQuestion.type === 'Integer' || currentQuestion.type === 'numerical' || currentQuestion.type === 'NUMERICAL' || currentQuestion.type === 'integer-value' || optionsToRender.length === 0);"
content = content.replace(old_vars, new_vars)

# 2. Update handleOptionSelect
old_select = "  const handleOptionSelect = (val) => {\n    if (isAnswerChecked || isTestSubmitted) return;\n    setSelectedOption(val);\n    setSavedAnswers(prev => ({\n      ...prev,\n      [currentQuestionIndex]: { \n        selectedOption: val, \n        isAnswerChecked: false \n      }\n    }));\n  };"
new_select = "  const handleOptionSelect = (val) => {\n    if (isAnswerChecked || isTestSubmitted) return;\n    if (isMultiCorrect) {\n      setSelectedOption(prev => {\n        const arr = Array.isArray(prev) ? prev : [];\n        let newArr;\n        if (arr.includes(val)) { newArr = arr.filter(x => x !== val).sort((a, b) => a - b); } else { newArr = [...arr, val].sort((a, b) => a - b); }\n        setSavedAnswers(saved => ({ ...saved, [currentQuestionIndex]: { selectedOption: newArr, isAnswerChecked: false } }));\n        return newArr;\n      });\n    } else {\n      setSelectedOption(val);\n      setSavedAnswers(prev => ({ ...prev, [currentQuestionIndex]: { selectedOption: val, isAnswerChecked: false } }));\n    }\n  };"
content = content.replace(old_select, new_select)

# 3. Update handleCheckAnswer
old_check = "  const handleCheckAnswer = () => {\n    if (selectedOption === undefined || selectedOption === '') return;\n    setIsAnswerChecked(true);\n    setSavedAnswers(prev => ({\n      ...prev,\n      [currentQuestionIndex]: { selectedOption, isAnswerChecked: true }\n    }));\n\n    let isCorrect = false;\n    if (isNumerical) {\n      isCorrect = Number(selectedOption) === Number(currentQuestion.correctAnswer);\n    } else {\n      const selectedIndex = parseInt(selectedOption, 10);\n      isCorrect = selectedIndex === parseInt(currentQuestion.correctOptionIndex, 10);\n    }"
new_check = "  const handleCheckAnswer = () => {\n    if (isMultiCorrect) {\n      if (!selectedOption || (Array.isArray(selectedOption) && selectedOption.length === 0)) return;\n    } else {\n      if (selectedOption === undefined || selectedOption === '') return;\n    }\n    setIsAnswerChecked(true);\n    setSavedAnswers(prev => ({\n      ...prev,\n      [currentQuestionIndex]: { selectedOption, isAnswerChecked: true }\n    }));\n\n    let isCorrect = false;\n    if (isNumerical) {\n      isCorrect = Number(selectedOption) === Number(currentQuestion.correctAnswer);\n    } else if (isMultiCorrect) {\n      let finalCorrectArr = [];\n      if (currentQuestion.correctOptionsArray && currentQuestion.correctOptionsArray.length > 0) { finalCorrectArr = currentQuestion.correctOptionsArray; }\n      else if (currentQuestion.question?.en?.correct_options) { finalCorrectArr = currentQuestion.question.en.correct_options.map(c => c.charCodeAt(0) - 65); }\n      else if (currentQuestion.correctAnswer) { finalCorrectArr = String(currentQuestion.correctAnswer).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)); }\n      const selArr = Array.isArray(selectedOption) ? selectedOption : [];\n      isCorrect = selArr.length === finalCorrectArr.length && selArr.every(val => finalCorrectArr.includes(val));\n    } else {\n      const selectedIndex = parseInt(selectedOption, 10);\n      let correctIdx = parseInt(currentQuestion.correctOptionIndex, 10);\n      if (isNaN(correctIdx) && currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 0) correctIdx = currentQuestion.question.en.correct_options[0].charCodeAt(0) - 65;\n      isCorrect = selectedIndex === correctIdx;\n    }"
content = content.replace(old_check, new_check)

# 4. Update the map rendering
old_map = "              ) : !isNumerical ? (\n                (currentQuestion.options || []).map((opt, idx) => {\n                  const isSelected = selectedOption === idx || selectedOption === String(idx);\n                  const isCorrectOption = idx === parseInt(currentQuestion.correctOptionIndex, 10);\n                  \n                  let boxClass = isLight ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-gray-700 bg-[#1e293b] hover:border-gray-600 text-gray-200';\n                  let circleClass = 'bg-[#1976d2] text-white';\n\n                  if (isAnswerChecked || isTestSubmitted) {\n                    if (isSelected && isCorrectOption) {\n                      boxClass = isLight ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#28a745] bg-[#064e3b] text-white';\n                      circleClass = 'bg-[#28a745] text-white';\n                    } else if (isSelected && !isCorrectOption) {\n                      boxClass = isLight ? 'border-[#dc3545] bg-[#fdecea]' : 'border-[#dc3545] bg-[#7f1d1d] text-white';\n                      circleClass = 'bg-[#dc3545] text-white';\n                    } else if (!isSelected && isCorrectOption) {\n                      boxClass = isLight ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#28a745] bg-[#064e3b] text-white';\n                      circleClass = 'bg-[#28a745] text-white';\n                    } else {\n                      boxClass = isLight ? 'border-gray-200 bg-white opacity-50' : 'border-gray-700 bg-[#1e293b] opacity-50';\n                      circleClass = 'bg-gray-400 text-white';\n                    }\n                  } else if (isSelected) {\n                    boxClass = isLight ? 'border-[#2962ff] bg-[#f0f4ff]' : 'border-[#60a5fa] bg-[#1e3a8a] text-white';\n                  }\n\n                  const labelChar = String.fromCharCode(65 + idx); // A, B, C, D\n\n                  return (\n                    <button\n                      key={idx}\n                      onClick={() => {\n                        handleOptionSelect(idx);\n                      }}\n                      disabled={isAnswerChecked || isTestSubmitted}\n                      className={`w-full text-left p-4 flex items-start gap-4 border rounded-xl transition-all shadow-sm relative overflow-hidden ${boxClass}`}\n                    >\n                      <div className={`w-[30px] h-[30px] shrink-0 rounded-full flex items-center justify-center font-bold text-[13px] ${circleClass}`}>\n                        {labelChar}\n                      </div>\n                      <div className={`flex-1 mt-1 font-medium exam-math-content ${isLight ? 'text-black' : 'text-gray-100'}`} style={{ fontSize: `${Math.max(14, fontSize - 1)}px` }} dangerouslySetInnerHTML={{ __html: fixMathJax(opt) }} />\n                    </button>\n                  );\n                })\n              ) : ("
new_map = """              ) : !isNumerical ? (
                <>
                  {isMultiCorrect && <div className="col-span-1 md:col-span-2 mb-2 text-sm font-bold text-blue-600 px-3 py-2 bg-blue-50 rounded border border-blue-200 inline-block">Multi-Correct Question (Select all that apply)</div>}
                  {optionsToRender.map((opt, idx) => {
                    const isSelected = isMultiCorrect ? (Array.isArray(selectedOption) && selectedOption.includes(idx)) : (selectedOption === idx || selectedOption === String(idx));
                    
                    let correctIdxArr = [];
                    if (isMultiCorrect) {
                      if (currentQuestion.correctOptionsArray && currentQuestion.correctOptionsArray.length > 0) correctIdxArr = currentQuestion.correctOptionsArray;
                      else if (currentQuestion.question?.en?.correct_options) correctIdxArr = currentQuestion.question.en.correct_options.map(c => c.charCodeAt(0) - 65);
                      else if (currentQuestion.correctAnswer) correctIdxArr = String(currentQuestion.correctAnswer).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
                    } else {
                      let cIdx = parseInt(currentQuestion.correctOptionIndex, 10);
                      if (isNaN(cIdx) && currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 0) cIdx = currentQuestion.question.en.correct_options[0].charCodeAt(0) - 65;
                      correctIdxArr = [cIdx];
                    }
                    const isCorrectOption = correctIdxArr.includes(idx);
                    
                    let boxClass = isLight ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-gray-700 bg-[#1e293b] hover:border-gray-600 text-gray-200';
                    let circleClass = 'bg-[#1976d2] text-white';

                    if (isAnswerChecked || isTestSubmitted) {
                      if (isSelected && isCorrectOption) { boxClass = isLight ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#28a745] bg-[#064e3b] text-white'; circleClass = 'bg-[#28a745] text-white'; }
                      else if (isSelected && !isCorrectOption) { boxClass = isLight ? 'border-[#dc3545] bg-[#fdecea]' : 'border-[#dc3545] bg-[#7f1d1d] text-white'; circleClass = 'bg-[#dc3545] text-white'; }
                      else if (!isSelected && isCorrectOption) { boxClass = isLight ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#28a745] bg-[#064e3b] text-white'; circleClass = 'bg-[#28a745] text-white'; }
                      else { boxClass = isLight ? 'border-gray-200 bg-white opacity-50' : 'border-gray-700 bg-[#1e293b] opacity-50'; circleClass = 'bg-gray-400 text-white'; }
                    } else if (isSelected) {
                      boxClass = isLight ? 'border-[#2962ff] bg-[#f0f4ff]' : 'border-[#60a5fa] bg-[#1e3a8a] text-white';
                    }

                    const labelChar = String.fromCharCode(65 + idx);
                    let optContent = opt.content || opt;

                    return (
                      <button key={idx} onClick={() => handleOptionSelect(idx)} disabled={isAnswerChecked || isTestSubmitted} className={`w-full text-left p-4 flex items-start gap-4 border rounded-xl transition-all shadow-sm relative overflow-hidden ${boxClass}`}>
                        <div className={`w-[30px] h-[30px] shrink-0 ${isMultiCorrect ? 'rounded-md' : 'rounded-full'} flex items-center justify-center font-bold text-[13px] ${circleClass}`}>
                          {labelChar}
                        </div>
                        <div className={`flex-1 mt-1 font-medium exam-math-content ${isLight ? 'text-black' : 'text-gray-100'}`} style={{ fontSize: `${Math.max(14, fontSize - 1)}px` }} dangerouslySetInnerHTML={{ __html: fixMathJax(optContent) }} />
                      </button>
                    );
                  })}
                </>
              ) : ("""
content = content.replace(old_map, new_map)


# 5. Add Explicit text for correct options count below options/above TeacherSolution
old_sol = "            {/* Explanation Section */}\n            {(isAnswerChecked || isTestSubmitted) && (\n               <div className=\"mt-8\">\n                 <TeacherSolution html={currentQuestion.solution} isLight={isLight} />"
new_sol = """            {/* Explanation Section */}
            {(isAnswerChecked || isTestSubmitted) && (
               <div className="mt-8">
                 {isMultiCorrect && (
                   <div className={`p-4 rounded-xl mb-4 text-[15px] font-bold shadow-sm border ${isLight ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-blue-900/30 text-blue-200 border-blue-800/50'}`}>
                     Correct Answer has {(() => {
                        let count = 0;
                        let labels = [];
                        if (currentQuestion.correctOptionsArray && currentQuestion.correctOptionsArray.length > 0) {
                           count = currentQuestion.correctOptionsArray.length;
                           labels = currentQuestion.correctOptionsArray.map(idx => String.fromCharCode(65 + parseInt(idx)));
                        } else if (currentQuestion.question?.en?.correct_options) {
                           count = currentQuestion.question.en.correct_options.length;
                           labels = currentQuestion.question.en.correct_options;
                        } else if (currentQuestion.correctAnswer) {
                           labels = String(currentQuestion.correctAnswer).split(',').map(s => s.trim()).filter(s => s);
                           count = labels.length;
                        }
                        return `${count} options correct: ${labels.join(', ')}`;
                     })()}
                   </div>
                 )}
                 <TeacherSolution html={currentQuestion.solution} isLight={isLight} />"""
content = content.replace(old_sol, new_sol)

# 6. Update progress counts
old_counts = """                    if (s && s.isAnswerChecked && s.selectedOption !== '') {
                      const isNum = q.type === 'Numerical Value' || q.type === 'Integer' || q.type === 'numerical' || q.type === 'NUMERICAL' || q.type === 'integer-value' || (q.options && q.options.length === 0);
                      if (isNum ? String(s.selectedOption).trim() === String(q.correctAnswer).trim() : parseInt(s.selectedOption, 10) === q.correctOptionIndex) count++;
                    }"""
new_counts_helper = """const getIsNum = (q) => {
  const oRender = (q.question?.en?.options && q.question.en.options.length > 0) ? q.question.en.options : (q.options || []);
  const isSubj = q.type === 'SUBJECTIVE' || q.type === 'subjective';
  const isMulti = !isSubj && (q.type === 'MULTI_CORRECT' || q.type === 'multi_correct' || q.type === 'multiple_correct' || q.type === 'MCQM' || q.type === 'mcqm' || q.type === 'MCQ (Multiple Correct)' || q.type === 'Multiple Correct' || (q.correctOptionsArray && q.correctOptionsArray.length > 0) || q.isMultiCorrect || (q.question?.en?.correct_options && q.question.en.correct_options.length > 1));
  return !isSubj && !isMulti && (q.type === 'Numerical Value' || q.type === 'Integer' || q.type === 'numerical' || q.type === 'NUMERICAL' || q.type === 'integer-value' || oRender.length === 0);
};
const getIsMulti = (q) => {
  const isSubj = q.type === 'SUBJECTIVE' || q.type === 'subjective';
  return !isSubj && (q.type === 'MULTI_CORRECT' || q.type === 'multi_correct' || q.type === 'multiple_correct' || q.type === 'MCQM' || q.type === 'mcqm' || q.type === 'MCQ (Multiple Correct)' || q.type === 'Multiple Correct' || (q.correctOptionsArray && q.correctOptionsArray.length > 0) || q.isMultiCorrect || (q.question?.en?.correct_options && q.question.en.correct_options.length > 1));
};
const isAnswerCorrect = (q, s) => {
  if (getIsNum(q)) {
    return String(s.selectedOption).trim() === String(q.correctAnswer).trim();
  } else if (getIsMulti(q)) {
    const correctArr = q.correctOptionsArray || (q.question?.en?.correct_options ? q.question.en.correct_options.map(c => c.charCodeAt(0) - 65) : (q.correctAnswer ? String(q.correctAnswer).split(',').map(st => parseInt(st.trim(), 10)).filter(n => !isNaN(n)) : []));
    const selArr = Array.isArray(s.selectedOption) ? s.selectedOption : [];
    return selArr.length === correctArr.length && selArr.every(val => correctArr.includes(val));
  } else {
    let correctIdx = parseInt(q.correctOptionIndex, 10);
    if (isNaN(correctIdx) && q.question?.en?.correct_options && q.question.en.correct_options.length > 0) correctIdx = q.question.en.correct_options[0].charCodeAt(0) - 65;
    return parseInt(s.selectedOption, 10) === correctIdx;
  }
};
"""
content = content.replace("  const completedCount = useMemo(() => {", new_counts_helper + "  const completedCount = useMemo(() => {")

new_counts = """                    if (s && s.isAnswerChecked && (Array.isArray(s.selectedOption) ? s.selectedOption.length > 0 : s.selectedOption !== '')) {
                      if (isAnswerCorrect(q, s)) count++;
                    }"""
content = content.replace(old_counts, new_counts)

old_counts_2 = """                    if (s && s.isAnswerChecked && s.selectedOption !== '') {
                      const isNum = q.type === 'Numerical Value' || q.type === 'Integer' || q.type === 'numerical' || q.type === 'NUMERICAL' || q.type === 'integer-value' || (q.options && q.options.length === 0);
                      if (!(isNum ? String(s.selectedOption).trim() === String(q.correctAnswer).trim() : parseInt(s.selectedOption, 10) === q.correctOptionIndex)) count++;
                    }"""
new_counts_2 = """                    if (s && s.isAnswerChecked && (Array.isArray(s.selectedOption) ? s.selectedOption.length > 0 : s.selectedOption !== '')) {
                      if (!isAnswerCorrect(q, s)) count++;
                    }"""
content = content.replace(old_counts_2, new_counts_2)

old_counts_3 = """                 if (s && s.isAnswerChecked) {
                    const q = questions[idx];
                    const isNum = q.type === 'Numerical Value' || q.type === 'Integer' || q.type === 'numerical' || q.type === 'NUMERICAL' || q.type === 'integer-value' || (q.options && q.options.length === 0);
                    let correct = false;
                    if (isNum) correct = String(s.selectedOption).trim() === String(q.correctAnswer).trim();
                    else correct = parseInt(s.selectedOption, 10) === q.correctOptionIndex;
                    
                    if (s.selectedOption === '') bubbleClass = "bg-[#ffc107] text-white"; // Seen but just revealed answer
                    else bubbleClass = correct ? "bg-[#28a745] text-white" : "bg-[#dc3545] text-white";"""
new_counts_3 = """                 if (s && s.isAnswerChecked) {
                    const q = questions[idx];
                    let correct = isAnswerCorrect(q, s);
                    
                    const isEmpty = Array.isArray(s.selectedOption) ? s.selectedOption.length === 0 : s.selectedOption === '';
                    if (isEmpty) bubbleClass = "bg-[#ffc107] text-white"; // Seen but just revealed answer
                    else bubbleClass = correct ? "bg-[#28a745] text-white" : "bg-[#dc3545] text-white";"""
content = content.replace(old_counts_3, new_counts_3)

with open('src/components/ExamGoalPracticeInterface.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied to ExamGoalPracticeInterface.jsx directly.")
