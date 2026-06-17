import re

with open('src/components/ExamGoalPracticeInterface.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace block 1: Type detection
# Original:
#   const isSubjective = currentQuestion.type === 'SUBJECTIVE' || currentQuestion.type === 'subjective';
#   const isNumerical = !isSubjective && (currentQuestion.type === 'Numerical Value' || currentQuestion.type === 'Integer' || currentQuestion.type === 'numerical' || currentQuestion.type === 'NUMERICAL' || currentQuestion.type === 'integer-value' || (currentQuestion.options && currentQuestion.options.length === 0));

replacement_1 = """
  const optionsToRender = (currentQuestion.question?.en?.options && currentQuestion.question.en.options.length > 0) 
    ? currentQuestion.question.en.options 
    : (currentQuestion.options || []);

  const isSubjective = currentQuestion.type === 'SUBJECTIVE' || currentQuestion.type === 'subjective';
  const isMultiCorrect = !isSubjective && (currentQuestion.type === 'MULTI_CORRECT' || currentQuestion.type === 'multi_correct' || currentQuestion.type === 'multiple_correct' || currentQuestion.type === 'MCQM' || currentQuestion.type === 'mcqm' || currentQuestion.type === 'MCQ (Multiple Correct)' || currentQuestion.type === 'Multiple Correct' || (currentQuestion.correctOptionsArray && currentQuestion.correctOptionsArray.length > 0) || currentQuestion.isMultiCorrect || (currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 1));
  const isNumerical = !isSubjective && !isMultiCorrect && (currentQuestion.type === 'Numerical Value' || currentQuestion.type === 'Integer' || currentQuestion.type === 'numerical' || currentQuestion.type === 'NUMERICAL' || currentQuestion.type === 'integer-value' || optionsToRender.length === 0);
"""
content = re.sub(
    r"const isSubjective.*?\n.*?currentQuestion\.options\.length === 0\)\);",
    replacement_1.strip(),
    content,
    flags=re.DOTALL
)

# Replace block 2: handleOptionSelect
replacement_2 = """
  const handleOptionSelect = (val) => {
    if (isAnswerChecked || isTestSubmitted) return;
    
    if (isMultiCorrect) {
      setSelectedOption(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        let newArr;
        if (arr.includes(val)) {
          newArr = arr.filter(x => x !== val).sort((a, b) => a - b);
        } else {
          newArr = [...arr, val].sort((a, b) => a - b);
        }
        setSavedAnswers(saved => ({
          ...saved,
          [currentQuestionIndex]: { selectedOption: newArr, isAnswerChecked: false }
        }));
        return newArr;
      });
    } else {
      setSelectedOption(val);
      setSavedAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: { selectedOption: val, isAnswerChecked: false }
      }));
    }
  };
"""

content = re.sub(
    r"const handleOptionSelect = \(val\) => \{.*?\}\);\n  \};",
    replacement_2.strip(),
    content,
    flags=re.DOTALL
)

# Replace block 3: handleCheckAnswer
replacement_3 = """
  const handleCheckAnswer = () => {
    if (isMultiCorrect) {
      if (!selectedOption || (Array.isArray(selectedOption) && selectedOption.length === 0)) return;
    } else {
      if (selectedOption === undefined || selectedOption === '') return;
    }
    
    setIsAnswerChecked(true);
    setSavedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: { selectedOption, isAnswerChecked: true }
    }));

    let isCorrect = false;
    if (isNumerical) {
      isCorrect = Number(selectedOption) === Number(currentQuestion.correctAnswer);
    } else if (isMultiCorrect) {
      const correctArr = currentQuestion.correctOptionsArray || [];
      const selArr = Array.isArray(selectedOption) ? selectedOption : [];
      let finalCorrectArr = [];
      if (correctArr.length > 0) {
         finalCorrectArr = correctArr;
      } else if (currentQuestion.question?.en?.correct_options) {
         // E.g. ['A', 'B'] -> [0, 1]
         finalCorrectArr = currentQuestion.question.en.correct_options.map(c => c.charCodeAt(0) - 65);
      } else if (currentQuestion.correctAnswer) {
         finalCorrectArr = String(currentQuestion.correctAnswer).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      }
      isCorrect = selArr.length === finalCorrectArr.length && selArr.every(val => finalCorrectArr.includes(val));
    } else {
      const selectedIndex = parseInt(selectedOption, 10);
      let correctIdx = parseInt(currentQuestion.correctOptionIndex, 10);
      if (isNaN(correctIdx) && currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 0) {
          correctIdx = currentQuestion.question.en.correct_options[0].charCodeAt(0) - 65;
      }
      isCorrect = selectedIndex === correctIdx;
    }
"""

content = re.sub(
    r"const handleCheckAnswer = \(\) => \{.*?isCorrect = selectedIndex === parseInt\(currentQuestion\.correctOptionIndex, 10\);\n    \}",
    replacement_3.strip(),
    content,
    flags=re.DOTALL
)

# Replace block 4: grid options
replacement_4 = """
              ) : !isNumerical ? (
                <>
                  {isMultiCorrect && <div className="col-span-1 md:col-span-2 mb-2 text-sm font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded border border-blue-200 inline-block">Multi-Correct Question (Select all that apply)</div>}
                  {optionsToRender.map((opt, idx) => {
                    const isSelected = isMultiCorrect ? (Array.isArray(selectedOption) && selectedOption.includes(idx)) : (selectedOption === idx || selectedOption === String(idx));
                    
                    let correctIdxArr = [];
                    if (isMultiCorrect) {
                      if (currentQuestion.correctOptionsArray && currentQuestion.correctOptionsArray.length > 0) correctIdxArr = currentQuestion.correctOptionsArray;
                      else if (currentQuestion.question?.en?.correct_options) correctIdxArr = currentQuestion.question.en.correct_options.map(c => c.charCodeAt(0) - 65);
                      else if (currentQuestion.correctAnswer) correctIdxArr = String(currentQuestion.correctAnswer).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
                    } else {
                      let cIdx = parseInt(currentQuestion.correctOptionIndex, 10);
                      if (isNaN(cIdx) && currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 0) {
                          cIdx = currentQuestion.question.en.correct_options[0].charCodeAt(0) - 65;
                      }
                      correctIdxArr = [cIdx];
                    }
                    const isCorrectOption = correctIdxArr.includes(idx);
                    
                    let boxClass = isLight ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-gray-700 bg-[#1e293b] hover:border-gray-600 text-gray-200';
                    let circleClass = 'bg-[#1976d2] text-white';

                    if (isAnswerChecked || isTestSubmitted) {
                      if (isSelected && isCorrectOption) {
                        boxClass = isLight ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#28a745] bg-[#064e3b] text-white';
                        circleClass = 'bg-[#28a745] text-white';
                      } else if (isSelected && !isCorrectOption) {
                        boxClass = isLight ? 'border-[#dc3545] bg-[#fdecea]' : 'border-[#dc3545] bg-[#7f1d1d] text-white';
                        circleClass = 'bg-[#dc3545] text-white';
                      } else if (!isSelected && isCorrectOption) {
                        boxClass = isLight ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#28a745] bg-[#064e3b] text-white';
                        circleClass = 'bg-[#28a745] text-white';
                      } else {
                        boxClass = isLight ? 'border-gray-200 bg-white opacity-50' : 'border-gray-700 bg-[#1e293b] opacity-50';
                        circleClass = 'bg-gray-400 text-white';
                      }
                    } else if (isSelected) {
                      boxClass = isLight ? 'border-[#2962ff] bg-[#f0f4ff]' : 'border-[#60a5fa] bg-[#1e3a8a] text-white';
                    }

                    const labelChar = String.fromCharCode(65 + idx); // A, B, C, D
                    
                    let optContent = opt.content || opt;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          handleOptionSelect(idx);
                        }}
                        disabled={isAnswerChecked || isTestSubmitted}
                        className={w-full text-left p-4 flex items-start gap-4 border rounded-xl transition-all shadow-sm relative overflow-hidden }
                      >
                        <div className={w-[30px] h-[30px] shrink-0  flex items-center justify-center font-bold text-[13px] }>
                          {labelChar}
                        </div>
                        
                        <div 
                          className="flex-1 pt-1 leading-relaxed exam-math-content min-w-0 break-words"
                          dangerouslySetInnerHTML={{ __html: fixMathJax(optContent) }}
                        />
                      </button>
                    );
                  })}
                </>
"""
content = re.sub(
    r"\) \: \!isNumerical \? \(\n\s+\(currentQuestion\.options \|\| \[\]\)\.map\(\(opt, idx\) => \{.*?\<div \n\s+className=\"flex-1 pt-1 leading-relaxed exam-math-content min-w-0 break-words\"\n\s+dangerouslySetInnerHTML=\{\{ __html\: fixMathJax\(opt\) \}\}\n\s+/\>\n\s+\</button\>\n\s+\}\);\n\s+\}\)\n\s+\) \: \(",
    replacement_4.strip() + "\n              ) : (",
    content,
    flags=re.DOTALL
)

# And now fixing count progress calculation:
replacement_5 = """
const getIsNum = (q) => {
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
    const correctArr = q.correctOptionsArray || (q.question?.en?.correct_options ? q.question.en.correct_options.map(c => c.charCodeAt(0) - 65) : (q.correctAnswer ? String(q.correctAnswer).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : []));
    const selArr = Array.isArray(s.selectedOption) ? s.selectedOption : [];
    return selArr.length === correctArr.length && selArr.every(val => correctArr.includes(val));
  } else {
    let correctIdx = parseInt(q.correctOptionIndex, 10);
    if (isNaN(correctIdx) && q.question?.en?.correct_options && q.question.en.correct_options.length > 0) correctIdx = q.question.en.correct_options[0].charCodeAt(0) - 65;
    return parseInt(s.selectedOption, 10) === correctIdx;
  }
};
"""
content = content.replace("const completedCount = useMemo(() => {", replacement_5 + "\n  const completedCount = useMemo(() => {")

content = re.sub(
    r"const isNum = q\.type === 'Numerical Value'.*?\n.*?if \(isNum \? String\(s\.selectedOption\)\.trim\(\) === String\(q\.correctAnswer\)\.trim\(\) : parseInt\(s\.selectedOption, 10\) === q\.correctOptionIndex\) count\+\+;",
    r"if (isAnswerCorrect(q, s)) count++;",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"const isNum = q\.type === 'Numerical Value'.*?\n.*?if \(!\(isNum \? String\(s\.selectedOption\)\.trim\(\) === String\(q\.correctAnswer\)\.trim\(\) : parseInt\(s\.selectedOption, 10\) === q\.correctOptionIndex\)\) count\+\+;",
    r"if (!isAnswerCorrect(q, s)) count++;",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"const isNum = q\.type === 'Numerical Value'.*?\n.*?let correct = false;\n.*?if \(isNum\) correct = String\(s\.selectedOption\)\.trim\(\) === String\(q\.correctAnswer\)\.trim\(\);\n.*?else correct = parseInt\(s\.selectedOption, 10\) === q\.correctOptionIndex;",
    r"let correct = isAnswerCorrect(q, s);",
    content,
    flags=re.DOTALL
)

with open('src/components/ExamGoalPracticeInterface_modified.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied to ExamGoalPracticeInterface_modified.jsx")
