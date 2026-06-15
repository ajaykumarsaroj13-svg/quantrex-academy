
import re

with open("src/pages/TestSeriesResult.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add isMultiCorrect logic to result
new_eval = """  const evaluatedQuestions = originalQuestions.map((q) => {
    // If backend submitted
    if (result.questionResults) {
      const evalResult = result.questionResults.find((qr) => qr.questionId === q._id);
      const isAttempted = evalResult?.isAttempted || false;
      return {
        ...q,
        userAnswer: evalResult?.userAnswer,
        isCorrect: evalResult?.isCorrect || false,
        marksAwarded: evalResult?.marksAwarded || 0,
        isAttempted,
      };
    }

    // Local evaluation
    const ua = answers[q.questionNumber || q._id];
    let isAttempted = ua !== undefined && ua !== '';
    if (Array.isArray(ua)) isAttempted = ua.length > 0;

    const isMultiCorrect = q.questionType !== 'NUMERICAL' && (
        q.questionType === 'MULTI_CORRECT' || 
        q.questionType === 'multi_correct' || 
        q.questionType === 'multiple_correct' || 
        q.questionType === 'MCQM' || 
        q.questionType === 'mcqm' || 
        q.questionType === 'MCQ (Multiple Correct)' || 
        q.questionType === 'Multiple Correct' || 
        (q.correctOptionsArray && q.correctOptionsArray.length > 0) || 
        q.isMultiCorrect || 
        (q.question?.en?.correct_options && q.question.en.correct_options.length > 1) ||
        (q.correctAnswer && (String(q.correctAnswer).includes(',') || String(q.correctAnswer).toLowerCase().includes('and') || String(q.correctAnswer).includes('&'))) ||
        Array.isArray(q.correctOptionIndex) ||
        (q.question?.en?.content && (
           q.question.en.content.toLowerCase().includes('one or more') ||
           q.question.en.content.toLowerCase().includes('multiple correct')
        )) ||
        (typeof q.question === 'string' && (
           q.question.toLowerCase().includes('one or more') ||
           q.question.toLowerCase().includes('multiple correct')
        ))
    );

    let isCorrect = false;
    let actualCorrectArr = [];

    if (isAttempted) {
      if (q.questionType === 'NUMERICAL') {
        isCorrect = String(ua).trim() === String(q.correctAnswer || '').trim();
      } else if (isMultiCorrect) {
         if (Array.isArray(q.correctOptionIndex)) {
            actualCorrectArr = [...q.correctOptionIndex].sort((a,b)=>a-b);
         } else if (q.correctAnswer && (String(q.correctAnswer).includes(',') || String(q.correctAnswer).toLowerCase().includes('and') || String(q.correctAnswer).includes('&'))) {
            const cleaned = String(q.correctAnswer).replace(/[()]/g, '').replace(/and/ig, ',').replace(/&/g, ',');
            actualCorrectArr = cleaned.split(',').map(s => {
              const t = s.trim();
              const p = parseInt(t, 10);
              if (!isNaN(p)) return p;
              const c = t.toUpperCase().charCodeAt(0);
              if (c >= 65 && c <= 90) return c - 65;
              return NaN;
            }).filter(n => !isNaN(n)).sort((a,b)=>a-b);
         } else if (q.correctOption !== undefined) {
            actualCorrectArr = [parseInt(q.correctOption)];
         }
         
         const userArr = Array.isArray(ua) ? [...ua].sort((a,b)=>a-b) : [parseInt(ua)];
         isCorrect = JSON.stringify(userArr) === JSON.stringify(actualCorrectArr);
      } else {
         isCorrect = parseInt(ua) === q.correctOption;
      }
    }

    const marksAwarded = isCorrect ? q.marks : (isAttempted && q.questionType !== 'NUMERICAL' ? q.negativeMarks : 0);

    return {
      ...q,
      userAnswer: ua,
      isCorrect,
      marksAwarded,
      isAttempted,
      isMultiCorrect,
      actualCorrectArr
    };
  });"""

content = re.sub(
    r"  const evaluatedQuestions = originalQuestions\.map\(\(q\) => \{.*?\};\n  \}\);\n",
    new_eval + "\n",
    content,
    flags=re.DOTALL
)

# Fix rendering block for correct options
new_render = """                      {activeQuestion.questionType === 'NUMERICAL' ? (
                        <div className=\"tsr-answer-card\">
                          <span className=\"tsr-answer-label\">Your Answer:</span>
                          <span className={activeQuestion.isAttempted ? (activeQuestion.isCorrect ? 'correct' : 'wrong') : 'unattempted'}>
                            {activeQuestion.isAttempted ? activeQuestion.userAnswer : 'Not Attempted'}
                          </span>
                        </div>
                      ) : (
                        (activeQuestion.options || []).map((o, oIdx) => {
                          const isMulti = activeQuestion.isMultiCorrect;
                          let isCorrectOption = false;
                          let isUserOption = false;

                          if (isMulti) {
                             isCorrectOption = activeQuestion.actualCorrectArr && activeQuestion.actualCorrectArr.includes(oIdx);
                             isUserOption = Array.isArray(activeQuestion.userAnswer) ? activeQuestion.userAnswer.includes(oIdx) : activeQuestion.userAnswer === oIdx;
                          } else {
                             isCorrectOption = activeQuestion.correctOption === oIdx;
                             isUserOption = activeQuestion.userAnswer === oIdx;
                          }
                          
                          let cardClass = 'neutral';
                          if (isCorrectOption) cardClass = 'correct';
                          else if (isUserOption) cardClass = 'user-selected';

                          return (
                            <div key={oIdx} className={`tsr-option-card ${cardClass}`}>
                              <div className=\"tsr-option-letter\">{String.fromCharCode(65 + oIdx)}</div>
                              <div className=\"tsr-option-text\" dangerouslySetInnerHTML={{ __html: o }} />
                              {isCorrectOption && (
                                <span className=\"tsr-opt-status-badge correct\">Correct Option</span>
                              )}
                              {!isCorrectOption && isUserOption && (
                                <span className=\"tsr-opt-status-badge user-wrong\">Your Marked Option</span>
                              )}
                            </div>
                          );
                        })
                      )}"""

content = re.sub(
    r"                      \{activeQuestion\.questionType === 'NUMERICAL' \? \(.*?\}\)\n                      \)\}",
    new_render,
    content,
    flags=re.DOTALL
)

with open("src/pages/TestSeriesResult.jsx", "w", encoding="utf-8") as f:
    f.write(content)

