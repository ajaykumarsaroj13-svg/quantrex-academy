import re

with open('src/components/ExamGoalPracticeInterface.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
            {/* Explanation Section */}
            {(isAnswerChecked || isTestSubmitted) && (
               <div className="mt-8">
                 {isMultiCorrect && (
                   <div className={p-4 rounded-xl mb-4 text-[15px] font-bold shadow-sm border }>
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
                        return ${count} options correct: ;
                     })()}
                   </div>
                 )}
                 <TeacherSolution html={currentQuestion.solution} isLight={isLight} />
"""

content = content.replace(
    '''            {/* Explanation Section */}
            {(isAnswerChecked || isTestSubmitted) && (
               <div className="mt-8">
                 <TeacherSolution html={currentQuestion.solution} isLight={isLight} />''',
    replacement.strip()
)

with open('src/components/ExamGoalPracticeInterface_modified.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch generated.")
