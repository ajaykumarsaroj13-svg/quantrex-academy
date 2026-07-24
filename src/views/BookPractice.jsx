import React, { useState, useEffect, useMemo, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, ChevronLeft, LayoutGrid, AlertCircle, Eye, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { useWatermarkRemover } from '../hooks/useWatermarkRemover';
import { useAIAssistant } from '../contexts/AIAssistantContext';

const BookPractice = ({ chapter, setActivePage, theme }) => {
  const isLight = theme === 'light';
  const chapterId = chapter?.id || 'default';
  const exerciseId = chapter?.exerciseId || 'single-choice';
  const exerciseName = chapter?.exerciseName || 'Exercise 1: Single Choice Problems';
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State for ExamGoal style practice
  // For each question, track selected option and if it has been checked
  const [userAnswers, setUserAnswers] = useState({}); // { 0: { selected: 1, checked: true, isCorrect: false } }

  useWatermarkRemover([currentQuestionIndex, questions]);

  const { openAssistant, sendMessage } = useAIAssistant();

  const [showPaletteMobile, setShowPaletteMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.7));

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
    <div className={`min-h-screen flex flex-col font-sans ${isLight ? 'bg-[#f0f2f5]' : 'bg-obsidian'}`}>
      {/* Top Header - ExamGoal Style */}
      <header className={`border-b h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm sticky top-0 z-20 ${isLight ? 'bg-white border-gray-200' : 'bg-cyberdark border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActivePage('book-chapters')}
            className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/10 text-gray-300'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`font-bold text-lg hidden sm:block ${isLight ? 'text-gray-800' : 'text-white'}`}>{chapterDetails.name}</h1>
            <h1 className={`font-bold text-base sm:hidden line-clamp-1 ${isLight ? 'text-gray-800' : 'text-white'}`}>{chapterDetails.name}</h1>
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Practice Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-1 rounded-lg p-1 mr-2 ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
            <button onClick={handleZoomOut} className={`p-1.5 rounded-md transition shadow-sm ${isLight ? 'hover:bg-white text-gray-600' : 'hover:bg-white/20 text-gray-300'}`} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className={`text-xs font-medium w-10 text-center ${isLight ? 'text-gray-500' : 'text-gray-300'}`}>{Math.round(zoomLevel * 100)}%</span>
            <button onClick={handleZoomIn} className={`p-1.5 rounded-md transition shadow-sm ${isLight ? 'hover:bg-white text-gray-600' : 'hover:bg-white/20 text-gray-300'}`} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" /> <span>{correctCount} Correct</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <XCircle className="w-4 h-4" /> <span>{incorrectCount} Incorrect</span>
            </div>
          </div>
          <button 
            className={`lg:hidden p-2 rounded-lg ${isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 hover:bg-white/10'}`}
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
          <div 
            className="max-w-4xl mx-auto w-full transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            
            {/* Question Card */}
            <div className={`rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border overflow-hidden mb-6 ${isLight ? 'bg-white border-gray-100' : 'bg-cyberdark border-white/5'}`}>
              
              {/* Question Header */}
              <div className={`border-b px-6 py-4 flex items-center justify-between ${isLight ? 'bg-gray-50/80 border-gray-100' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-lg ${isLight ? 'text-gray-800' : 'text-white'}`}>Question {currentQuestion.questionNumber || (currentQuestionIndex + 1)}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${isLight ? 'bg-blue-50 text-blue-700' : 'bg-blue-900/30 text-blue-400'}`}>
                    Single Correct
                  </span>
                </div>
                <button 
                  onClick={() => { 
                    openAssistant(); 
                    sendMessage(`Explain Question ${currentQuestion.questionNumber || (currentQuestionIndex + 1)} from ${chapterDetails.name}`); 
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${isLight ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 hover:shadow-md' : 'bg-gradient-to-r from-blue-900/40 to-[#0f172a] text-blue-300 border border-blue-500/30 hover:border-blue-500/60 hover:shadow-[0_0_10px_rgba(37,99,235,0.2)]'}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ask AI
                </button>
              </div>
              
              {/* Question Body */}
              <div className="p-6">
                <div 
                  className={`text-base lg:text-lg leading-relaxed mb-8 select-text math-content ${isLight ? 'text-gray-800' : 'text-gray-200'}`}
                  dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.text) }}
                />

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    // Determine option styling based on state
                    const isSelected = currentState.selected === idx;
                    const isCorrectOption = (idx + 1) === currentQuestion.correctOption;
                    const letter = String.fromCharCode(65 + idx);
                    
                    let optionStyle = isLight ? "border-gray-200 bg-white hover:border-blue-400" : "border-white/10 bg-[#121A2F] hover:border-blue-500";
                    let letterStyle = isLight ? "bg-blue-100 text-blue-700" : "bg-blue-600 text-white";
                    let labelStyle = isLight ? "text-gray-700" : "text-gray-300";

                    if (isSelected && !currentState.checked) {
                      optionStyle = isLight ? "border-blue-500 bg-blue-50" : "border-blue-500 bg-blue-900/10";
                      letterStyle = isLight ? "bg-blue-600 text-white ring-2 ring-blue-200 ring-offset-1 ring-offset-white" : "bg-blue-700 text-white ring-2 ring-blue-300 ring-offset-1 ring-offset-[#121A2F]";
                      labelStyle = isLight ? "text-blue-900 font-medium" : "text-gray-100 font-medium";
                    } else if (currentState.checked) {
                      if (isCorrectOption) {
                        // Correct option always highlights green if checked
                        optionStyle = isLight ? "border-green-500 bg-green-50/50" : "border-green-500 bg-green-900/10";
                        letterStyle = "bg-green-500 text-white";
                        labelStyle = isLight ? "text-green-900 font-medium" : "text-green-100 font-medium";
                      } else if (isSelected && !isCorrectOption) {
                        // Incorrect selected option highlights red
                        optionStyle = isLight ? "border-red-500 bg-red-50/50" : "border-red-500 bg-red-900/10";
                        letterStyle = "bg-red-500 text-white";
                        labelStyle = isLight ? "text-red-900 font-medium" : "text-red-100 font-medium";
                      } else {
                        // Other non-selected, non-correct options dim
                        optionStyle = isLight ? "border-gray-200 bg-white opacity-60" : "border-white/5 bg-[#121A2F] opacity-60";
                        letterStyle = isLight ? "bg-gray-200 text-gray-500" : "bg-gray-400 text-white";
                        labelStyle = isLight ? "text-gray-500" : "text-gray-500";
                      }
                    }

                    return (
                      <div 
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${optionStyle} ${currentState.checked ? 'cursor-default' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all ${letterStyle}`}>
                            {letter}
                          </div>
                          {currentState.checked && isCorrectOption && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {currentState.checked && isSelected && !isCorrectOption && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div 
                          className={`math-content select-none overflow-x-auto ${labelStyle}`}
                          dangerouslySetInnerHTML={{ __html: renderMath(option) }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar (Check Answer / Next) */}
              <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-4 ${isLight ? 'bg-gray-50 border-gray-100' : 'bg-[#121A2F] border-white/5'}`}>
                <div className="flex items-center gap-3">
                  {!currentState.checked ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={currentState.selected === null}
                      className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                        currentState.selected !== null 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow' 
                        : (isLight ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white/5 text-gray-500 cursor-not-allowed')
                      }`}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${currentState.isCorrect ? (isLight ? 'bg-green-100 text-green-800' : 'bg-green-900/30 text-green-400') : (isLight ? 'bg-red-100 text-red-800' : 'bg-red-900/30 text-red-400')}`}>
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
                      className={`px-4 py-2.5 rounded-lg font-medium transition ${isLight ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200' : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'}`}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-1 px-4 py-2.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition ${isLight ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-[#1F2833] border-white/10 text-gray-300 hover:bg-white/10'}`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`flex items-center gap-1 px-5 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition shadow-sm hover:shadow ${isLight ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Solution Box (Only visible after checking answer) */}
            {currentState.checked && (
              <div className={`rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border overflow-hidden mb-12 animate-fade-in-up ${isLight ? 'bg-white border-blue-100' : 'bg-[#1F2833] border-blue-900/30'}`}>
                <div className={`border-b px-6 py-4 flex items-center gap-2 ${isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-blue-900/10 border-blue-900/30'}`}>
                  <Eye className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                  <span className={`font-bold ${isLight ? 'text-blue-900' : 'text-blue-200'}`}>Solution & Explanation</span>
                </div>
                <div className="p-6">
                  {currentQuestion.solution ? (
                    <div 
                      className={`leading-relaxed math-content ${isLight ? 'text-gray-800' : 'text-gray-200'}`}
                      dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.solution) }}
                    />
                  ) : (
                    <div className="text-gray-500 italic flex flex-col items-center justify-center py-6">
                      <p>Detailed solution is not available for this question yet.</p>
                      <p className="text-sm mt-2">The correct option is <strong className={isLight ? 'text-gray-700' : 'text-gray-300'}>Option {currentQuestion.correctOption}</strong>.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Pane - Question Palette (Desktop) */}
        <div className={`fixed lg:relative top-16 lg:top-0 right-0 w-80 h-[calc(100vh-4rem)] lg:h-full border-l shadow-xl lg:shadow-none transition-transform duration-300 z-10 flex flex-col ${showPaletteMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} ${isLight ? 'bg-white border-gray-200' : 'bg-cyberdark border-white/5'}`}>
          
          <div className={`p-4 border-b flex justify-between items-center shrink-0 ${isLight ? 'border-gray-100 bg-gray-50/50' : 'border-white/5 bg-black/20'}`}>
            <h3 className={`font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Question Palette</h3>
            <button className={`lg:hidden p-1 rounded ${isLight ? 'text-gray-500 hover:bg-gray-200' : 'text-gray-400 hover:bg-white/10'}`} onClick={() => setShowPaletteMobile(false)}>
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className={`p-4 grid grid-cols-2 gap-3 text-sm font-medium border-b shrink-0 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-green-500"></div>
               <span className={isLight ? 'text-gray-600' : 'text-gray-300'}>Correct ({correctCount})</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <span className={isLight ? 'text-gray-600' : 'text-gray-300'}>Incorrect ({incorrectCount})</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-gray-200"></div>
               <span className={isLight ? 'text-gray-600' : 'text-gray-300'}>Unattempted ({questions.length - attemptedCount})</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 content-start">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const qState = userAnswers[idx];
                const isActive = currentQuestionIndex === idx;
                
                let btnClass = isLight ? "border-gray-200 text-gray-600 hover:bg-gray-50" : "border-white/10 text-gray-400 hover:bg-white/5"; // Unattempted
                
                if (qState?.checked) {
                  if (qState.isCorrect) {
                    btnClass = isLight ? "bg-green-100 border-green-200 text-green-800 font-bold" : "bg-green-900/30 border-green-800 text-green-400 font-bold";
                  } else {
                    btnClass = isLight ? "bg-red-100 border-red-200 text-red-800 font-bold" : "bg-red-900/30 border-red-800 text-red-400 font-bold";
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

      <style dangerouslySetInnerHTML={{ __html: `
        .math-content .katex { font-size: 1.15em; }
        .math-content .katex-display { margin: 0.5em 0; overflow-x: auto; overflow-y: hidden; padding: 0.2em 0; }
        .math-content, .math-content p, .math-content span, .math-content div, .math-content * { 
          color: ${isLight ? '#1f2937' : '#e5e7eb'} !important; 
          fill: ${isLight ? '#1f2937' : '#e5e7eb'} !important; 
        }
        .math-content img, .exam-math-content img, .nta-q-content img { 
          transition: opacity 0.3s ease; 
          opacity: 1; 
          background-color: ${isLight ? 'transparent' : 'white'}; 
          padding: ${isLight ? '0' : '8px'}; 
          box-shadow: ${isLight ? 'none' : '0 0 10px rgba(255,255,255,0.1)'}; 
          filter: grayscale(100%) brightness(130%) contrast(500%) ${isLight ? '' : 'invert(1)'}; 
          mix-blend-mode: ${isLight ? 'multiply' : 'normal'}; 
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default BookPractice;
