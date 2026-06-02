import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, ChevronRight, ChevronLeft, Eye } from 'lucide-react';

export default function BookPractice({ chapter, setActivePage, theme }) {
  const isLight = theme === 'light';
  const [activeExercise, setActiveExercise] = useState('Exercise 1');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showSolution, setShowSolution] = useState(false);
  
  // Group questions by exercise
  const allQuestions = chapter.questions || [];
  const exerciseGroups = allQuestions.reduce((acc, q) => {
    const ex = q.exerciseName || 'Exercise 1';
    if (!acc[ex]) acc[ex] = [];
    acc[ex].push(q);
    return acc;
  }, {});
  
  const exercisesList = Object.keys(exerciseGroups).sort();
  
  // Ensure we switch to a valid exercise if activeExercise is missing
  useEffect(() => {
    if (exercisesList.length > 0 && !exercisesList.includes(activeExercise)) {
      setActiveExercise(exercisesList[0]);
    }
  }, [exercisesList, activeExercise]);

  const questions = exerciseGroups[activeExercise] || [];
  const question = questions[currentIdx];

  // Re-render MathJax
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
    }
  }, [currentIdx, showSolution, question, activeExercise]);
  
  // Reset index when changing tabs
  const handleTabChange = (ex) => {
    setActiveExercise(ex);
    setCurrentIdx(0);
    setShowSolution(false);
  };

  const getQuestionGlobalKey = () => {
    return `${activeExercise}-${currentIdx}`;
  };

  const handleSelectOption = (optIdx) => {
    const key = getQuestionGlobalKey();
    if (selectedOptions[key] !== undefined) return; 
    setSelectedOptions(prev => ({ ...prev, [key]: optIdx }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowSolution(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowSolution(false);
    }
  };

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center ${isLight ? 'text-gray-900' : 'text-white'}`}>
        <p>No questions available for this chapter yet.</p>
        <button onClick={() => setActivePage('book-chapters')} className="mt-4 px-4 py-2 bg-electric text-white rounded">Go Back</button>
      </div>
    );
  }

  if (!question) return null;

  const globalKey = getQuestionGlobalKey();
  const isAttempted = selectedOptions[globalKey] !== undefined;
  const selectedIdx = selectedOptions[globalKey];
  
  // Subjective logic
  const isSubjective = question.exerciseName === 'Exercise 4' || question.exerciseName === 'Exercise 5' || (question.typeLabel && question.typeLabel.includes("SUBJECTIVE"));

  return (
    <div className={`w-full min-h-screen pb-20 ${isLight ? 'bg-gray-50' : 'bg-obsidian'}`}>
      {/* Top Header */}
      <div className={`sticky top-0 z-40 px-6 py-4 border-b flex flex-col gap-4 ${
        isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-cyberdark border-white/10'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActivePage('book-chapters')}
              className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-gray-300'}`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className={`font-bold font-display ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {chapter.title}
              </h2>
              <p className={`text-xs font-mono ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                Question {currentIdx + 1} of {questions.length}
              </p>
            </div>
          </div>

          {/* Progress Bar Mini */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-xs">
            {questions.map((q, i) => {
              const qKey = `${activeExercise}-${i}`;
              let isCorrectlyAnswered = false;
              if (selectedOptions[qKey] !== undefined) {
                 if (q.correctOptionsArray) {
                    isCorrectlyAnswered = q.correctOptionsArray.includes(selectedOptions[qKey]);
                 } else {
                    isCorrectlyAnswered = selectedOptions[qKey] === q.correctOption;
                 }
              }
              return (
              <div 
                key={i} 
                className={`h-2 w-6 shrink-0 rounded-full transition-colors ${
                  i === currentIdx ? 'bg-electric' : 
                  selectedOptions[qKey] !== undefined 
                    ? isCorrectlyAnswered ? 'bg-green-500' : 'bg-red-500'
                    : isLight ? 'bg-gray-200' : 'bg-white/10'
                }`}
              />
            )})}
          </div>
        </div>
        
        {/* Exercise Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {exercisesList.map((ex) => (
            <button
              key={ex}
              onClick={() => handleTabChange(ex)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeExercise === ex 
                  ? 'bg-electric text-white shadow-lg'
                  : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-8">
        {/* Question Panel */}
        <div className={`rounded-2xl p-6 md:p-8 mb-6 border ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-cyberdark border-white/5 shadow-2xl'
        }`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-8 px-3 rounded-full bg-electric/20 text-electric font-bold text-sm">
                Q{currentIdx + 1}
              </span>
              {question.typeLabel && (
                <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300">
                  {question.typeLabel}
                </span>
              )}
            </div>
            <div className={`text-lg md:text-xl font-medium leading-relaxed overflow-x-auto ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <div dangerouslySetInnerHTML={{ __html: question.text }} />
              {question.has_graph && question.imageUrl && (
                <img src={question.imageUrl} alt="Question Graph" className="mt-4 max-w-full rounded border border-gray-200" />
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Section */}
        {isSubjective ? (
           <div className={`rounded-2xl p-6 md:p-8 mb-8 border flex flex-col items-center justify-center min-h-[200px] ${
             isLight ? 'bg-gray-50 border-gray-200' : 'bg-cyberdark/50 border-white/5'
           }`}>
             {!showSolution ? (
               <button 
                 onClick={() => setShowSolution(true)}
                 className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-electric text-white hover:bg-blue-600 transition-all shadow-lg hover:shadow-electric/30 text-lg"
               >
                 <Eye className="h-6 w-6" /> Reveal Answer
               </button>
             ) : (
               <div className="w-full animate-fade-in text-center">
                  <h3 className={`font-bold mb-4 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>Correct Answer:</h3>
                  <div className={`text-2xl font-bold ${isLight ? 'text-electric' : 'text-blue-400'}`}>
                    {question.answerKeyStr || "Answer not available"}
                  </div>
               </div>
             )}
           </div>
        ) : (
          /* Options Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {question.options && question.options.map((opt, i) => {
              const isSelected = selectedIdx === i;
              
              let isActuallyCorrect = false;
              if (question.correctOptionsArray) {
                 isActuallyCorrect = question.correctOptionsArray.includes(i);
              } else {
                 isActuallyCorrect = i === question.correctOption;
              }
              
              let stateClass = isLight 
                ? 'bg-white border-gray-200 hover:border-electric' 
                : 'bg-cyberdark/50 border-white/10 hover:border-electric/50 hover:bg-cyberdark';
              
              if (isAttempted) {
                if (isActuallyCorrect) {
                  stateClass = isLight ? 'bg-green-50 border-green-500 text-green-900' : 'bg-green-900/20 border-green-500/50 text-green-100';
                } else if (isSelected && !isActuallyCorrect) {
                  stateClass = isLight ? 'bg-red-50 border-red-500 text-red-900' : 'bg-red-900/20 border-red-500/50 text-red-100';
                } else {
                  stateClass = isLight ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-cyberdark/30 border-white/5 opacity-50';
                }
              }

              return (
                <button
                  key={i}
                  disabled={isAttempted}
                  onClick={() => handleSelectOption(i)}
                  className={`text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${stateClass}`}
                >
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    isAttempted 
                      ? isActuallyCorrect 
                        ? 'border-green-500 bg-green-500 text-white'
                        : isSelected && !isActuallyCorrect 
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-300 text-gray-400'
                      : isLight ? 'border-gray-300 text-gray-500' : 'border-white/20 text-gray-400'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: opt }} />
                  
                  {isAttempted && isActuallyCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-auto shrink-0" />}
                  {isAttempted && isSelected && !isActuallyCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
          <button 
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all ${
              currentIdx === 0 
                ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500' 
                : isLight ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          {isAttempted && !showSolution && !isSubjective && question.solution && (
            <button 
              onClick={() => setShowSolution(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold bg-gold/20 text-gold hover:bg-gold/30 transition-all border border-gold/30"
            >
              <Lightbulb className="h-5 w-5" /> View Solution
            </button>
          )}

          <button 
            onClick={handleNext}
            disabled={currentIdx === questions.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
              currentIdx === questions.length - 1
                ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500'
                : 'bg-electric text-white hover:bg-blue-600 shadow-lg hover:shadow-electric/30'
            }`}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Solution Panel */}
        {showSolution && question.solution && (
          <div className={`mt-8 p-6 rounded-2xl border animate-fade-in ${
            isLight ? 'bg-blue-50/50 border-blue-200' : 'bg-electric/5 border-electric/20'
          }`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isLight ? 'text-blue-900' : 'text-electric'}`}>
              <Lightbulb className="h-5 w-5" /> Step-by-Step Solution
            </h3>
            <div className={`prose max-w-none ${isLight ? 'prose-gray' : 'prose-invert'} overflow-x-auto`} dangerouslySetInnerHTML={{ __html: question.solution.replace(/\n/g, '<br/>') }} />
          </div>
        )}

      </div>
    </div>
  );
}
