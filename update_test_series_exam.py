
import re

with open("src/pages/TestSeriesExam.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to add isMultiCorrect logic to TestSeriesExam.jsx

new_vars = """  const isAnsSelected = (selected) => {
    if (selected === undefined || selected === '') return false;
    if (Array.isArray(selected)) return selected.length > 0;
    return true;
  };

  const isMultiCorrect = question && question.questionType !== 'NUMERICAL' && (
    question.questionType === 'MULTI_CORRECT' || 
    question.questionType === 'multi_correct' || 
    question.questionType === 'multiple_correct' || 
    question.questionType === 'MCQM' || 
    question.questionType === 'mcqm' || 
    question.questionType === 'MCQ (Multiple Correct)' || 
    question.questionType === 'Multiple Correct' || 
    (question.correctOptionsArray && question.correctOptionsArray.length > 0) || 
    question.isMultiCorrect || 
    (question.question?.en?.correct_options && question.question.en.correct_options.length > 1) ||
    (question.correctAnswer && (String(question.correctAnswer).includes(',') || String(question.correctAnswer).toLowerCase().includes('and') || String(currentQuestion.correctAnswer).includes('&'))) ||
    Array.isArray(question.correctOptionIndex) ||
    (question.question?.en?.content && (
       question.question.en.content.toLowerCase().includes('one or more') ||
       question.question.en.content.toLowerCase().includes('multiple correct')
    )) ||
    (typeof question.question === 'string' && (
       question.question.toLowerCase().includes('one or more') ||
       question.question.toLowerCase().includes('multiple correct')
    ))
  );

  const checkAnswer = () => {"""

content = re.sub(r"  const checkAnswer = \(\) => \{", new_vars, content)

# update checkAnswer logic for marking
check_ans = """  const checkAnswer = () => {
    if (!isAnsSelected(answers[qKey]) && question?.questionType !== 'NUMERICAL') return;
    setAnswerChecked(true);
  };"""
content = re.sub(r"  const checkAnswer = \(\) => \{\n    if \(!answers\[qKey\] && question\?\.questionType !== 'NUMERICAL'\) return;\n    setAnswerChecked\(true\);\n  \};", check_ans, content)

# update handleOptionSelect inside options map
old_opt = """              {(question?.options || []).map((opt, idx) => {
                  const isSelected = answers[qKey] === idx;
                  const isCorrect  = mode === 'practice' && answerChecked && question?.correctOption === idx;
                  const isWrong    = mode === 'practice' && answerChecked && isSelected && !isCorrect;

                  return (
                    <div
                      key={idx}
                      className={`nta-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                      onClick={() => {
                        if (mode === 'practice' && answerChecked) return;
                        setAnswers(prev => ({ ...prev, [qKey]: idx }));
                        if (mode === 'exam') {
                          setStatusMap(prev => ({ ...prev, [qKey]: STATUS.ANSWERED }));
                        }
                      }}
                    >"""

new_opt = """              {isMultiCorrect && <div className=\"mb-2 text-[14px] font-bold text-[#1976d2] px-4 py-2 bg-blue-50/50 rounded border border-blue-100 inline-block\" style={{marginLeft: '24px'}}>One or More Than One Correct Option</div>}
              {!isMultiCorrect && question?.questionType !== 'NUMERICAL' && <div className=\"mb-2 text-[14px] font-bold text-[#28a745] px-4 py-2 bg-green-50/50 rounded border border-green-100 inline-block\" style={{marginLeft: '24px'}}>Single Correct Option</div>}
              {(question?.options || []).map((opt, idx) => {
                  const isSelected = isMultiCorrect 
                        ? (Array.isArray(answers[qKey]) && answers[qKey].includes(idx))
                        : answers[qKey] === idx;
                  const isCorrect  = mode === 'practice' && answerChecked && (isMultiCorrect ? (Array.isArray(question?.correctOptionIndex) ? question.correctOptionIndex.includes(idx) : String(question?.correctOption).includes(String(idx))) : question?.correctOption === idx);
                  const isWrong    = mode === 'practice' && answerChecked && isSelected && !isCorrect;

                  return (
                    <div
                      key={idx}
                      className={`nta-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                      onClick={() => {
                        if (mode === 'practice' && answerChecked) return;
                        
                        if (isMultiCorrect) {
                          setAnswers(prev => {
                            const selected = Array.isArray(prev[qKey]) ? prev[qKey] : [];
                            let newSelected;
                            if (selected.includes(idx)) {
                               newSelected = selected.filter(x => x !== idx).sort((a,b) => a-b);
                            } else {
                               newSelected = [...selected, idx].sort((a,b) => a-b);
                            }
                            return { ...prev, [qKey]: newSelected };
                          });
                        } else {
                          setAnswers(prev => ({ ...prev, [qKey]: idx }));
                        }
                        
                        if (mode === 'exam') {
                          setStatusMap(prev => ({ ...prev, [qKey]: STATUS.ANSWERED }));
                        }
                      }}
                    >"""

content = content.replace(old_opt, new_opt)


with open("src/pages/TestSeriesExam.jsx", "w", encoding="utf-8") as f:
    f.write(content)

