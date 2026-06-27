import re

with open('src/pages/BookPractice.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. handleSelectOption
old_handle_select = """  const handleSelectOption = (optIdx) => {
    if (isAttempted) return;
    setProgress(prev => ({
      ...prev,
      [activeExercise]: {
        ...(prev[activeExercise] || {}),
        [currentIdx]: { ...(prev[activeExercise]?.[currentIdx] || {}), selectedIdx: optIdx, isChecked: false }
      }
    }));
  };"""

new_handle_select = """  const handleSelectOption = (optIdx) => {
    if (isAttempted) return;
    setProgress(prev => {
      const currentSelected = prev[activeExercise]?.[currentIdx]?.selectedIdx;
      let newSelected;
      if (isMultiCorrect) {
        const arr = Array.isArray(currentSelected) ? currentSelected : (currentSelected !== undefined && currentSelected !== -1 ? [currentSelected] : []);
        if (arr.includes(optIdx)) {
          newSelected = arr.filter(i => i !== optIdx);
        } else {
          newSelected = [...arr, optIdx].sort((a, b) => a - b);
        }
      } else {
        newSelected = optIdx;
      }
      return {
        ...prev,
        [activeExercise]: {
          ...(prev[activeExercise] || {}),
          [currentIdx]: { ...(prev[activeExercise]?.[currentIdx] || {}), selectedIdx: newSelected, isChecked: false }
        }
      };
    });
  };"""

content = content.replace(old_handle_select, new_handle_select)

# 2. handleCheckAnswer
old_check_answer = """    if (isMultiCorrect) {
      // For multi-correct, just mark as checked; isCorrect = selectedIdx is in correctOptionsArray
      const correctArr = q.correctOptionsArray || [];
      correct = correctArr.includes(selectedIdx ?? -1);
    } else {
      correct = selectedIdx === q.correctOption;
    }"""

new_check_answer = """    if (isMultiCorrect) {
      const correctArr = q.correctOptionsArray || [];
      const currentSelection = Array.isArray(selectedIdx) ? selectedIdx : (selectedIdx !== undefined && selectedIdx !== -1 ? [selectedIdx] : []);
      correct = correctArr.length > 0 && correctArr.length === currentSelection.length && currentSelection.every(val => correctArr.includes(val));
    } else {
      correct = selectedIdx === q.correctOption;
    }"""

content = content.replace(old_check_answer, new_check_answer)

# 3. hasPendingOption
old_has_pending = """  const hasPendingOption = currentExProgress[currentIdx]?.selectedIdx !== undefined && !isAttempted;"""

new_has_pending = """  const _selIdx = currentExProgress[currentIdx]?.selectedIdx;
  const hasPendingOption = isMultiCorrect 
    ? (Array.isArray(_selIdx) ? _selIdx.length > 0 : _selIdx !== undefined && _selIdx !== -1)
    : (_selIdx !== undefined && _selIdx !== -1);
  const isPending = hasPendingOption && !isAttempted;"""

content = content.replace(old_has_pending, new_has_pending)
content = content.replace("hasPendingOption ? <><CheckCircle className=\"w-4 h-4\" /> Check Answer</> : <><Eye className=\"w-4 h-4\" /> View Solution</>", "isPending ? <><CheckCircle className=\"w-4 h-4\" /> Check Answer</> : <><Eye className=\"w-4 h-4\" /> View Solution</>")
content = content.replace("hasPendingOption\n                         ?", "isPending\n                         ?")
content = content.replace("if (hasPendingOption) handleCheckAnswer();", "if (isPending) handleCheckAnswer();")


# 4. isSelected in rendering
old_is_selected = """                      {(question.options || []).map((opt, i) => {
                        const isSelected = selectedIdx === i;"""

new_is_selected = """                      {(question.options || []).map((opt, i) => {
                        const isSelected = Array.isArray(selectedIdx) ? selectedIdx.includes(i) : selectedIdx === i;"""

content = content.replace(old_is_selected, new_is_selected)

# 5. correct text array check
old_correct_text = """                              Correct: Option {OPTION_LABELS[
                                question.correctOptionsArray ? question.correctOptionsArray[0] : question.correctOption
                              ]}
                              {isMultiCorrect && question.correctOptionsArray?.length > 1 &&
                                ` and ${question.correctOptionsArray.slice(1).map(x => OPTION_LABELS[x]).join(', ')}`
                              }"""

new_correct_text = """                              Correct: {isMultiCorrect && question.correctOptionsArray 
                                ? question.correctOptionsArray.map(x => OPTION_LABELS[x]).join(', ')
                                : `Option ${OPTION_LABELS[question.correctOption]}`}"""

content = content.replace(old_correct_text, new_correct_text)

with open('src/pages/BookPractice.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("BookPractice.jsx updated")
