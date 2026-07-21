import React, { useState, useEffect, useMemo, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, ChevronLeft, LayoutGrid, AlertCircle, Eye } from 'lucide-react';

const BookPractice = ({ chapter, setActivePage }) => {
  const chapterId = chapter?.id || 'default';
  const exerciseId = chapter?.exerciseId || 'single-choice';
  const exerciseName = chapter?.exerciseName || 'Exercise 1: Single Choice Problems';
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State for ExamGoal style practice
  // For each question, track selected option and if it has been checked
  const [userAnswers, setUserAnswers] = useState({}); // { 0: { selected: 1, checked: true, isCorrect: false } }

  const [showPaletteMobile, setShowPaletteMobile] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/data/blackbook/${chapterId}_${exerciseId}.json`);
        if (!response.ok) throw new Error("Failed to load questions");
        const data = await response.json();
        setQuestions(data);
        
        // Initialize state
        const initialAnswers = {};
        data.forEach((q, idx) => {
          initialAnswers[idx] = { selected: null, checked: false, isCorrect: null };
        });
        setUserAnswers(initialAnswers);
      } catch (error) {
        console.error("Error loading chapter data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [chapterId]);

  // Extract chapter details (simplified since bookData is not globally imported here)
  const chapterDetails = useMemo(() => {
    return { name: chapter?.title ? `${chapter.title} - ${exerciseName}` : 'Practice Session', id: chapterId };
  }, [chapterId, chapter, exerciseName]);

  // Render KaTeX with cleanup
  const renderMath = (text) => {
    if (!text) return '';
    let renderedText = text;
    // Basic cleanup for $ ... $ inline math
    renderedText = renderedText.replace(/\$([^\$]+)\$/g, (match, p1) => {
      try {
        return katex.renderToString(p1, { throwOnError: false, displayMode: false });
      } catch (e) {
        console.warn("KaTeX Error:", e);
        return match; // Return unrendered if error
      }
    });
    // Cleanup for $$ ... $$ display math
    renderedText = renderedText.replace(/\$\$([^\$]+)\$\$/g, (match, p1) => {
      try {
        return katex.renderToString(p1, { throwOnError: false, displayMode: true });
      } catch (e) {
        console.warn("KaTeX Error:", e);
        return match;
      }
    });
    return renderedText;
  };

  const handleOptionSelect = (optionIndex) => {
    // If already checked, don't allow changing answer in this practice mode
    if (userAnswers[currentQuestionIndex]?.checked) return;

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        ...prev[currentQuestionIndex],
        selected: optionIndex
      }
    }));
  };

  const handleCheckAnswer = () => {
    const currentQ = questions[currentQuestionIndex];
    const currentA = userAnswers[currentQuestionIndex];
    
    if (currentA.selected === null) return; // Must select an option first

    // Usually correctOption is 1-indexed in our JSON (1, 2, 3, 4)
    const isCorrect = (currentA.selected + 1) === currentQ.correctOption;

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        ...prev[currentQuestionIndex],
        checked: true,
        isCorrect: isCorrect
      }
    }));
  };

  const handleClearResponse = () => {
    if (userAnswers[currentQuestionIndex]?.checked) return; // Cannot clear if already checked
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        ...prev[currentQuestionIndex],
        selected: null
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Questions Not Found</h2>
          <p className="text-gray-500 mt-2">Could not load questions for this chapter.</p>
          <button 
            onClick={() => setActivePage('books')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentState = userAnswers[currentQuestionIndex] || { selected: null, checked: false };

  // Calculate stats for the palette
  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  
  Object.values(userAnswers).forEach(ans => {
    if (ans.checked) {
      attemptedCount++;
      if (ans.isCorrect) correctCount++;
      else incorrectCount++;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5] font-sans">
      {/* Top Header - ExamGoal Style */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActivePage('book-chapters')}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-gray-800 text-lg hidden sm:block">{chapterDetails.name}</h1>
            <h1 className="font-bold text-gray-800 text-base sm:hidden line-clamp-1">{chapterDetails.name}</h1>
            <p className="text-xs text-gray-500">Practice Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" /> <span>{correctCount} Correct</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <XCircle className="w-4 h-4" /> <span>{incorrectCount} Incorrect</span>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setShowPaletteMobile(!showPaletteMobile)}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Pane - Question Area */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto w-full lg:w-auto relative scroll-smooth p-4 lg:p-6 pb-24 lg:pb-6">
          <div className="max-w-4xl mx-auto w-full">
            
            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden mb-6">
              
              {/* Question Header */}
              <div className="bg-gray-50/80 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <span className="font-bold text-gray-800 text-lg">Question {currentQuestion.questionNumber || (currentQuestionIndex + 1)}</span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md uppercase tracking-wider">
                  Single Correct
                </span>
              </div>
              
              {/* Question Body */}
              <div className="p-6">
                <div 
                  className="text-gray-800 text-base lg:text-lg leading-relaxed mb-8 select-text math-content"
                  dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.text) }}
                />

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    // Determine option styling based on state
                    const isSelected = currentState.selected === idx;
                    const isCorrectOption = (idx + 1) === currentQuestion.correctOption;
                    
                    let optionStyle = "border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300";
                    let radioStyle = "border-gray-300";
                    let labelStyle = "text-gray-700";

                    if (isSelected && !currentState.checked) {
                      optionStyle = "border-blue-500 bg-blue-50/50 shadow-[0_0_0_1px_#3b82f6]";
                      radioStyle = "border-blue-500 bg-blue-500 ring-2 ring-blue-200";
                      labelStyle = "text-blue-900 font-medium";
                    } else if (currentState.checked) {
                      if (isCorrectOption) {
                        // Correct option always highlights green if checked
                        optionStyle = "border-green-500 bg-green-50 shadow-[0_0_0_1px_#22c55e]";
                        radioStyle = "border-green-500 bg-green-500";
                        labelStyle = "text-green-900 font-medium";
                      } else if (isSelected && !isCorrectOption) {
                        // Incorrect selected option highlights red
                        optionStyle = "border-red-500 bg-red-50 shadow-[0_0_0_1px_#ef4444]";
                        radioStyle = "border-red-500 bg-red-500";
                        labelStyle = "text-red-900 font-medium";
                      } else {
                        // Other non-selected, non-correct options dim
                        optionStyle = "border-gray-100 bg-gray-50/50 opacity-60";
                        radioStyle = "border-gray-200";
                        labelStyle = "text-gray-400";
                      }
                    }

                    return (
                      <div 
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${optionStyle} ${currentState.checked ? 'cursor-default' : ''}`}
                      >
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${radioStyle}`}>
                          {(isSelected || (currentState.checked && isCorrectOption)) && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div 
                          className={`flex-1 math-content select-none ${labelStyle}`}
                          dangerouslySetInnerHTML={{ __html: renderMath(option) }}
                        />
                        {currentState.checked && isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        )}
                        {currentState.checked && isSelected && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar (Check Answer / Next) */}
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {!currentState.checked ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={currentState.selected === null}
                      className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                        currentState.selected !== null 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${currentState.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {currentState.isCorrect ? (
                         <><CheckCircle className="w-5 h-5" /> Correct Answer!</>
                      ) : (
                         <><XCircle className="w-5 h-5" /> Incorrect Answer</>
                      )}
                    </div>
                  )}

                  {!currentState.checked && currentState.selected !== null && (
                    <button
                      onClick={handleClearResponse}
                      className="px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center gap-1 px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition shadow-sm hover:shadow"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Solution Box (Only visible after checking answer) */}
            {currentState.checked && (
              <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-blue-100 overflow-hidden mb-12 animate-fade-in-up">
                <div className="bg-blue-50/50 border-b border-blue-100 px-6 py-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-900">Solution & Explanation</span>
                </div>
                <div className="p-6">
                  {currentQuestion.solution ? (
                    <div 
                      className="text-gray-800 leading-relaxed math-content"
                      dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.solution) }}
                    />
                  ) : (
                    <div className="text-gray-500 italic flex flex-col items-center justify-center py-6">
                      <p>Detailed solution is not available for this question yet.</p>
                      <p className="text-sm mt-2">The correct option is <strong className="text-gray-700">Option {currentQuestion.correctOption}</strong>.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Pane - Question Palette (Desktop) */}
        <div className={`fixed lg:relative top-16 lg:top-0 right-0 w-80 h-[calc(100vh-4rem)] lg:h-full bg-white border-l border-gray-200 shadow-xl lg:shadow-none transition-transform duration-300 z-10 flex flex-col ${showPaletteMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800">Question Palette</h3>
            <button className="lg:hidden p-1 text-gray-500 hover:bg-gray-200 rounded" onClick={() => setShowPaletteMobile(false)}>
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 text-sm font-medium border-b border-gray-100 shrink-0">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-green-500"></div>
               <span className="text-gray-600">Correct ({correctCount})</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <span className="text-gray-600">Incorrect ({incorrectCount})</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-gray-200"></div>
               <span className="text-gray-600">Unattempted ({questions.length - attemptedCount})</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 content-start">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const qState = userAnswers[idx];
                const isActive = currentQuestionIndex === idx;
                
                let btnClass = "border-gray-200 text-gray-600 hover:bg-gray-50"; // Unattempted
                
                if (qState?.checked) {
                  if (qState.isCorrect) {
                    btnClass = "bg-green-100 border-green-200 text-green-800 font-bold";
                  } else {
                    btnClass = "bg-red-100 border-red-200 text-red-800 font-bold";
                  }
                }

                if (isActive) {
                  btnClass += " ring-2 ring-blue-500 ring-offset-1";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      if (window.innerWidth < 1024) setShowPaletteMobile(false);
                    }}
                    className={`h-10 w-full rounded-md border flex items-center justify-center text-sm transition-all shadow-sm ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {showPaletteMobile && (
          <div 
            className="fixed inset-0 bg-black/20 z-0 lg:hidden"
            onClick={() => setShowPaletteMobile(false)}
          ></div>
        )}

      </div>

      <style jsx global>{`
        .math-content .katex { font-size: 1.1em; }
        .math-content .katex-display { margin: 0.5em 0; overflow-x: auto; overflow-y: hidden; padding: 0.2em 0; }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BookPractice;
