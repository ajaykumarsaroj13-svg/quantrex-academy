
import re

with open("src/components/ExamGoalTestInterface.jsx", "r") as f:
    content = f.read()

# 1. Add isMultiCorrect and optionsToRender
new_vars = """  const currentStatus = qStatus[currentQuestion.id] || { visited: true, status: 'not_answered' };
  const selectedAnswer = currentStatus.selectedOption;
  
  const optionsToRender = (currentQuestion.question?.en?.options && currentQuestion.question.en.options.length > 0) ? currentQuestion.question.en.options : (currentQuestion.options || []);
  const isSubjective = currentQuestion.type === 'SUBJECTIVE' || currentQuestion.type === 'subjective';
  const isMultiCorrect = !isSubjective && (
    currentQuestion.type === 'MULTI_CORRECT' || 
    currentQuestion.type === 'multi_correct' || 
    currentQuestion.type === 'multiple_correct' || 
    currentQuestion.type === 'MCQM' || 
    currentQuestion.type === 'mcqm' || 
    currentQuestion.type === 'MCQ (Multiple Correct)' || 
    currentQuestion.type === 'Multiple Correct' || 
    (currentQuestion.correctOptionsArray && currentQuestion.correctOptionsArray.length > 0) || 
    currentQuestion.isMultiCorrect || 
    (currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 1) ||
    (currentQuestion.correctAnswer && (String(currentQuestion.correctAnswer).includes(',') || String(currentQuestion.correctAnswer).toLowerCase().includes('and') || String(currentQuestion.correctAnswer).includes('&'))) ||
    Array.isArray(currentQuestion.correctOptionIndex) ||
    (currentQuestion.question?.en?.content && (
       currentQuestion.question.en.content.toLowerCase().includes('one or more') ||
       currentQuestion.question.en.content.toLowerCase().includes('multiple correct')
    )) ||
    (typeof currentQuestion.question === 'string' && (
       currentQuestion.question.toLowerCase().includes('one or more') ||
       currentQuestion.question.toLowerCase().includes('multiple correct')
    ))
  );
  const isNumerical = !isSubjective && !isMultiCorrect && (currentQuestion.type === 'Numerical Value' || currentQuestion.type === 'Integer' || currentQuestion.type === 'numerical' || currentQuestion.type === 'NUMERICAL' || currentQuestion.type === 'integer-value' || optionsToRender.length === 0);
"""
content = re.sub(
    r"  const currentStatus = qStatus\[currentQuestion\.id\].*?const isNumerical = currentQuestion\.type === 'Numerical Value' \|\| currentQuestion\.type === 'Integer';",
    new_vars,
    content,
    flags=re.DOTALL
)

# 2. Update handleOptionSelect
new_handle = """  const handleOptionSelect = (val) => {
    setQStatus(prev => {
      const currentStat = prev[currentQuestion.id] || { visited: true, status: 'not_answered' };
      if (isMultiCorrect) {
        const selected = Array.isArray(currentStat.selectedOption) ? currentStat.selectedOption : [];
        let newSelected;
        if (selected.includes(val)) {
           newSelected = selected.filter(x => x !== val).sort((a,b) => a-b);
        } else {
           newSelected = [...selected, val].sort((a,b) => a-b);
        }
        return {
          ...prev,
          [currentQuestion.id]: {
            ...currentStat,
            visited: true,
            selectedOption: newSelected,
          }
        };
      } else {
        return {
          ...prev,
          [currentQuestion.id]: {
            ...currentStat,
            visited: true,
            selectedOption: val,
          }
        };
      }
    });
  };

  const isAnsSelected = (selected) => {
    if (selected === undefined || selected === '') return false;
    if (Array.isArray(selected)) return selected.length > 0;
    return true;
  };

  const handleSaveAndNext = () => {
    const isAns = isAnsSelected(selectedAnswer);"""
content = re.sub(
    r"  const handleOptionSelect = \(val\) => \{.*?const handleSaveAndNext = \(\) => \{\n    const isAns = selectedAnswer !== undefined && selectedAnswer !== '';",
    new_handle,
    content,
    flags=re.DOTALL
)

# 3. Update handleSaveAndMarkForReview
new_mark = """  const handleSaveAndMarkForReview = () => {
    const isAns = isAnsSelected(selectedAnswer);"""
content = re.sub(
    r"  const handleSaveAndMarkForReview = \(\) => \{\n    const isAns = selectedAnswer !== undefined && selectedAnswer !== '';",
    new_mark,
    content
)

# 4. Update the Options rendering block
old_options = """            {/* Options */}
            <div className=\"px-6 pb-6 space-y-3\">
              {!isNumerical ? (
                (currentQuestion.options || []).map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const labelChar = String.fromCharCode(65 + idx); // A, B, C, D
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left p-3 flex items-start gap-3 border ${isSelected ? 'border-[#3f51b5] bg-[#f0f4f8]' : 'border-gray-200 bg-[#f9f9f9]'} hover:border-[#3f51b5] transition-colors rounded-sm`}
                    >
                      <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-[#3f51b5] text-white' : 'bg-[#3f51b5] text-white'}`}>
                        {labelChar}
                      </div>
                      <div className=\"flex-1 mt-0.5\" style={{ fontSize: `${Math.max(1, fontSize - 0.05)}rem` }} dangerouslySetInnerHTML={{ __html: fixMathJax(opt) }} />
                    </button>
                  );
                })
              ) : ("""

new_options = """            {/* Options */}
            <div className=\"px-6 pb-6 space-y-3\">
              {isMultiCorrect && <div className=\"mb-2 text-[14px] font-bold text-[#1976d2] px-4 py-2 bg-blue-50/50 rounded border border-blue-100 inline-block\">One or More Than One Correct Option</div>}
              {!isMultiCorrect && !isNumerical && !isSubjective && <div className=\"mb-2 text-[14px] font-bold text-[#28a745] px-4 py-2 bg-green-50/50 rounded border border-green-100 inline-block\">Single Correct Option</div>}
              {!isNumerical ? (
                optionsToRender.map((opt, idx) => {
                  const isSelected = isMultiCorrect 
                      ? (Array.isArray(selectedAnswer) && selectedAnswer.includes(idx))
                      : selectedAnswer === idx;
                  const labelChar = String.fromCharCode(65 + idx); // A, B, C, D
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left p-3 flex items-start gap-3 border ${isSelected ? 'border-[#3f51b5] bg-[#f0f4f8]' : 'border-gray-200 bg-[#f9f9f9]'} hover:border-[#3f51b5] transition-colors rounded-sm`}
                    >
                      <div className={`w-7 h-7 shrink-0 flex items-center justify-center font-bold text-sm ${isMultiCorrect ? 'rounded-md' : 'rounded-full'} ${isSelected ? 'bg-[#3f51b5] text-white' : 'bg-[#3f51b5] text-white'}`}>
                        {labelChar}
                      </div>
                      <div className=\"flex-1 mt-0.5\" style={{ fontSize: `${Math.max(1, fontSize - 0.05)}rem` }} dangerouslySetInnerHTML={{ __html: fixMathJax(opt.content || opt) }} />
                    </button>
                  );
                })
              ) : ("""

content = content.replace(old_options, new_options)

with open("src/components/ExamGoalTestInterface.jsx", "w") as f:
    f.write(content)

