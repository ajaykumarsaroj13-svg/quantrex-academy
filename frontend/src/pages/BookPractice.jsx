import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react';

export default function BookPractice({ chapter, setActivePage, theme }) {
  const isLight = theme === 'light';
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showSolution, setShowSolution] = useState(false);

  const questions = chapter.questions || [];
  const question = questions[currentIdx];

  // Re-render MathJax on question change or solution toggle
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
    }
  }, [currentIdx, showSolution, question]);

  const handleSelectOption = (optIdx) => {
    if (selectedOptions[currentIdx] !== undefined) return; // Prevent changing answer
    setSelectedOptions(prev => ({ ...prev, [currentIdx]: optIdx }));
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

  if (!questions || questions.length === 0) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center ${isLight ? 'text-gray-900' : 'text-white'}`}>
        <p>No questions available for this chapter yet.</p>
        <button onClick={() => setActivePage('book-chapters')} className="mt-4 px-4 py-2 bg-electric text-white rounded">Go Back</button>
      </div>
    );
  }

  const isAttempted = selectedOptions[currentIdx] !== undefined;
  const selectedIdx = selectedOptions[currentIdx];
  const isCorrect = selectedIdx === question.correctOption;

  return (
    <div className={`w-full min-h-screen pb-20 ${isLight ? 'bg-gray-50' : 'bg-obsidian'}`}>
      {/* Top Header */}
      <div className={`sticky top-0 z-40 px-6 py-4 border-b flex items-center justify-between ${
        isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-cyberdark border-white/10'
      }`}>
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
        <div className="hidden md:flex items-center gap-1">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-8 rounded-full transition-colors ${
                i === currentIdx ? 'bg-electric' : 
                selectedOptions[i] !== undefined 
                  ? selectedOptions[i] === questions[i].correctOption ? 'bg-green-500' : 'bg-red-500'
                  : isLight ? 'bg-gray-200' : 'bg-white/10'
              }`}
            />
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

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {question.options.map((opt, i) => {
            const isSelected = selectedIdx === i;
            const isActuallyCorrect = i === question.correctOption;
            
            let stateClass = isLight 
              ? 'bg-white border-gray-200 hover:border-electric' 
              : 'bg-cyberdark/50 border-white/10 hover:border-electric/50 hover:bg-cyberdark';
            
            if (isAttempted) {
              if (isActuallyCorrect) {
                stateClass = isLight ? 'bg-green-50 border-green-500 text-green-900' : 'bg-green-900/20 border-green-500/50 text-green-100';
              } else if (isSelected && !isCorrect) {
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
                      : isSelected && !isCorrect 
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    : isLight ? 'border-gray-300 text-gray-500' : 'border-white/20 text-gray-400'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: opt }} />
                
                {isAttempted && isActuallyCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-auto shrink-0" />}
                {isAttempted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

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

          {isAttempted && !showSolution && (
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
