const fs = require('fs');
let code = fs.readFileSync('src/pages/TestSeriesExam.jsx', 'utf8');

const replacement = `{/* Practice mode: Check Answer button (only after selecting option) */}
          {mode === 'practice' && question?.questionType !== 'NUMERICAL' && isAnswered && !answerChecked && (
            <div className="nta-check-answer-wrap">
              <button className="nta-check-answer-btn" onClick={checkAnswer}>
                ✓ Check Answer
              </button>
            </div>
          )}

          {/* Practice mode: Solution box */}
          {mode === 'practice' && answerChecked && showSolution && question?.solution && (
            <div className="mt-6">
              <TeacherSolution
                html={question.solution}
                correctOptionLabel={(() => {
                  if (question?.questionType === 'NUMERICAL') return question.correctAnswer;
                  if (isMultiCorrect) {
                    const correctArr = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctOptionIndex];
                    return correctArr.filter(i => i !== undefined && i !== -1).map(i => String.fromCharCode(65 + i)).join(', ');
                  }
                  if (question.correctOptionIndex !== undefined && question.correctOptionIndex >= 0) {
                    return String.fromCharCode(65 + question.correctOptionIndex);
                  }
                  return null;
                })()}
                isLight={isLight}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="nta-action-buttons">
            <button className="nta-btn nta-btn-mark" onClick={markForReview}>
              Mark for Review &amp; Next
            </button>
            <button className="nta-btn nta-btn-clear" onClick={clearResponse}>
              Clear Response`;

code = code.replace(/\{\/\* Practice mode: Check Answer button \(only after selecting option\) \*\/\}[\s\S]*?Clear Response/, replacement);

fs.writeFileSync('src/pages/TestSeriesExam.jsx', code);
