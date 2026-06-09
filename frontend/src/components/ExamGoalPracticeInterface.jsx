import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, AlertCircle, Clock, Bookmark, ZoomIn, ZoomOut } from 'lucide-react';
import BookmarkGroupModal from './BookmarkGroupModal';

export default function ExamGoalPracticeInterface({ pyqData, topic, customQuestions, practiceMode, onProgressUpdate, onClose, isLight, bookmarkGroups = [], addBookmarkGroup = () => {}, progress = {} }) {
  const storageKey = `quantrex_practice_progress_${topic ? topic.id : 'custom'}`;
  const scrollContainerRef = useRef(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    if (topic && topic.startIndex !== undefined) {
      return topic.startIndex;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).currentQuestionIndex || 0;
    } catch(e) {}
    return 0;
  });

  useEffect(() => {
    if (topic && topic.startIndex !== undefined) {
      setCurrentQuestionIndex(topic.startIndex);
    }
  }, [topic]);
  const [selectedOption, setSelectedOption] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).savedAnswers || {};
    } catch(e) {}
    return {};
  });
  const [seenQuestions, setSeenQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).seenQuestions || { 0: true };
    } catch(e) {}
    return { 0: true };
  });
  const [timeSpent, setTimeSpent] = useState(0);
  const [fontSize, setFontSize] = useState(16); // Default 16px
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);

  const questions = customQuestions || (topic ? (pyqData.questions[topic.id] || []) : []);
  const currentQuestion = questions[currentQuestionIndex];
  const formatTimeStr = (seconds) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; };

  // Helper to fix scattered MathJax by forcing inline rendering
  const fixMathJax = (html) => {
    if (!html) return '';
    let fixed = html.replace(/\$\$/g, '$');
    fixed = fixed.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    fixed = fixed.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g, '\\sqrt[$1]{$2}');
    return fixed;
  };

  // Multi-color handwritten pen effect
  const formatUniqueSolution = (html) => {
    if (!html) return '<p>No explanation provided.</p>';
    let text = html;
    text = text.replace(/<b([^>]*)>(.*?)<\/b>/gi, '<b$1 style="color: #2e7d32; text-decoration: underline wavy #2e7d32;">$2</b>');
    text = text.replace(/<strong([^>]*)>(.*?)<\/strong>/gi, '<strong$1 style="color: #2e7d32; text-decoration: underline wavy #2e7d32;">$2</strong>');
    text = text.replace(/\\\((.*?)\\\)/g, '<span style="color: #d32f2f; font-weight: 600;">\\($1\\)</span>');
    
    const bgClass = isLight !== false ? 'bg-[#fffde7] border-[#ffb300]' : 'bg-[#332b00] border-[#ffb300]';
    const textClass = isLight !== false ? 'text-black' : 'text-gray-200';
    
    return `<div class="${bgClass} ${textClass} p-5 rounded-xl border-l-4 shadow-sm" style="font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif; font-size: 1.05rem; line-height: 1.8;">
      <div style="color: #f57c00; font-weight: 800; margin-bottom: 12px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-family: ui-sans-serif, system-ui, sans-serif;">💡 Quantrex Expert Breakdown</div>
      ${text}
    </div>`;
  };

  useEffect(() => {
    const data = {
      currentQuestionIndex,
      savedAnswers,
      seenQuestions
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [currentQuestionIndex, savedAnswers, seenQuestions, storageKey]);

  useEffect(() => {
    if (!currentQuestion) return;
    if (savedAnswers[currentQuestionIndex]) {
      setSelectedOption(savedAnswers[currentQuestionIndex].selectedOption);
      setIsAnswerChecked(savedAnswers[currentQuestionIndex].isAnswerChecked);
    } else {
      setSelectedOption('');
      setIsAnswerChecked(false);
    }
    // Reset timer when question changes
    setTimeSpent(0);
  }, [currentQuestionIndex]);

  // Timer effect
  useEffect(() => {
    if (isAnswerChecked) return; // Stop timer if already answered
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isAnswerChecked, currentQuestionIndex]);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
  }, [currentQuestionIndex, isAnswerChecked]);

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col font-sans bg-[#f4f5f8] overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-[#3f51b5] text-white flex items-center px-4 shadow-md justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium">{topic ? topic.name : 'Practice Session'}</span>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#f4f5f8] flex justify-center items-center w-full p-4">
           <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-[#e8eaf6] text-[#3f51b5] rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Questions Coming Soon!</h3>
              <p className="text-gray-500 mb-6">We are currently preparing detailed, visual, and handwritten step-by-step solutions for this chapter. Stay tuned!</p>
              <button onClick={onClose} className="px-6 py-2 bg-[#3f51b5] text-white rounded font-bold hover:bg-[#303f9f] transition-colors">Go Back</button>
           </div>
        </div>
      </div>
    );
  }

  const isSubjective = currentQuestion.type === 'SUBJECTIVE' || currentQuestion.type === 'subjective';
  const isNumerical = !isSubjective && (currentQuestion.type === 'Numerical Value' || currentQuestion.type === 'Integer' || currentQuestion.type === 'numerical' || currentQuestion.type === 'NUMERICAL' || currentQuestion.type === 'integer-value' || (currentQuestion.options && currentQuestion.options.length === 0));

  const handleOptionSelect = (val) => {
    if (isAnswerChecked) return;
    setSelectedOption(val);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === undefined || selectedOption === '') return;
    setIsAnswerChecked(true);
    setSavedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: { selectedOption, isAnswerChecked: true }
    }));

    let isCorrect = false;
    if (isNumerical) {
      isCorrect = Number(selectedOption) === Number(currentQuestion.correctAnswer);
    } else {
      const selectedIndex = parseInt(selectedOption, 10);
      isCorrect = selectedIndex === currentQuestion.correctOptionIndex;
    }

    if (onProgressUpdate) {
      onProgressUpdate(currentQuestion.id, { status: isCorrect ? 'correct' : 'wrong', timeSpentSeconds: timeSpent });
    }
    
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSaveBookmarkGroups = (groups) => {
    if (onProgressUpdate && currentQuestion) {
      onProgressUpdate(currentQuestion.id, { bookmarkGroups: groups, bookmarked: true });
    }
  };

  const handleClearResponse = () => {
    setSelectedOption('');
    setIsAnswerChecked(false);
    setSavedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestionIndex];
      return copy;
    });
  };

  const handleQuestionChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentQuestionIndex(newIndex);
    }
  };

  useEffect(() => {
    setSeenQuestions(prev => ({ ...prev, [currentQuestionIndex]: true }));
  }, [currentQuestionIndex]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Determine correct answer state
  let isCorrect = false;
  if (isNumerical) {
    isCorrect = String(selectedOption).trim() === String(currentQuestion.correctAnswer).trim();
  } else {
    isCorrect = selectedOption === currentQuestion.correctOptionIndex;
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col font-sans bg-[#f5f5f5] overflow-hidden">
      
      {/* Top Header */}
      <div className="h-[52px] bg-[#2962ff] text-white flex items-center px-4 shadow-md justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[16px] font-medium">{topic ? topic.name : 'Practice Session'}</span>
        </div>
        <div className="flex items-center gap-4">
           {/* Mock icons for top right */}
           <svg className="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
           <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
           <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </div>
      </div>

      {/* Horizontal Pagination Bar */}
      <div className="h-12 bg-[#214dc7] flex items-center px-2 shadow-inner shrink-0 overflow-x-auto no-scrollbar border-t border-white/10">
        <button onClick={handlePrev} className="px-3 py-1.5 text-white/70 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="flex items-center gap-1">
          {questions.slice(0, 30).map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`min-w-[30px] h-[30px] text-[13px] font-medium rounded border transition-colors flex items-center justify-center
                ${idx === currentQuestionIndex 
                  ? 'bg-transparent border-[#ff9800] text-[#ff9800]' 
                  : 'bg-transparent border-transparent text-white/90 hover:bg-white/10'}`}
            >
              {idx + 1}
            </button>
          ))}
          {questions.length > 30 && <span className="text-white/70 px-2">...</span>}
        </div>
        <button onClick={handleNext} className="px-3 py-1.5 text-white/70 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      {/* Main Content Area: Split Left and Right */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Question and Options */}
        <div className="flex-1 flex flex-col bg-white relative shadow-sm z-10">
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full pb-10" ref={scrollContainerRef}>
             <div className="max-w-5xl mx-auto w-full">
            
            {/* Header: Date, Shift, Q No, Type */}
            <div className="mb-6">
              <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mb-3">
                 <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-700 font-semibold shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{String(Math.floor(timeSpent / 60)).padStart(2, '0')}:{String(timeSpent % 60).padStart(2, '0')}</span>
                 </div>
                 <span className="text-[#28a745] font-bold">+4</span>
                 <span className="text-[#dc3545] font-bold">-1</span>
                 
                 <button 
                   onClick={() => setBookmarkModalOpen(true)}
                   className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors shadow-sm ${
                     progress[currentQuestion.id]?.bookmarkGroups?.length > 0 
                     ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200' 
                     : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:text-black'
                   }`}
                 >
                   <Bookmark className="w-3.5 h-3.5" fill={progress[currentQuestion.id]?.bookmarkGroups?.length > 0 ? "currentColor" : "none"} />
                   <span>{progress[currentQuestion.id]?.bookmarkGroups?.length > 0 ? 'Saved' : 'Save'}</span>
                 </button>
                 
                 <div className="flex items-center gap-1 ml-2">
                   <button onClick={() => setFontSize(prev => Math.max(12, prev - 2))} className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded" title="Zoom Out">
                     <ZoomOut size={16} />
                   </button>
                   <button onClick={() => setFontSize(prev => Math.min(32, prev + 2))} className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded" title="Zoom In">
                     <ZoomIn size={16} />
                   </button>
                 </div>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-center">
                  <div className="w-[30px] h-[30px] rounded-full bg-[#28a745] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                    {currentQuestionIndex + 1}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#28a745] text-[13px] font-medium">
                      {currentQuestion.title || currentQuestion.year}
                    </span>
                    <span className="px-2 py-0.5 bg-[#e3f2fd] text-[#1976d2] text-[11px] font-bold rounded border border-[#bbdefb]">
                      {currentQuestion.type || 'MCQ Single Answer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Text */}
              <div className="mb-6 select-text" style={{ fontSize: `${fontSize}px` }}>
                <div 
                className="text-black font-medium leading-relaxed exam-math-content"
                dangerouslySetInnerHTML={{ __html: fixMathJax(currentQuestion.question) }}
                />
              </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {isSubjective ? (
                <div className="col-span-1 md:col-span-2">
                  <div className={`p-6 border rounded-xl shadow-sm ${isAnswerChecked ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-gray-700">📝 Subjective Question</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">Write Answer</span>
                    </div>
                    {!isAnswerChecked ? (
                      <button
                        onClick={() => {
                          setIsAnswerChecked(true);
                          setSavedAnswers(prev => ({...prev, [currentQuestionIndex]: { selectedOption: 'viewed', isAnswerChecked: true }}));
                          if (onProgressUpdate) onProgressUpdate(currentQuestion.id, { status: 'correct', timeSpentSeconds: timeSpent });
                          setTimeout(() => { if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' }); }, 100);
                        }}
                        className="px-6 py-3 bg-[#3f51b5] text-white font-bold rounded-lg hover:bg-[#303f9f] transition-colors"
                      >
                        View Answer / Solution
                      </button>
                    ) : (
                      <div className="mt-4">
                        <div className="text-sm font-bold text-[#28a745] mb-2">✓ Model Answer:</div>
                        <div className="text-black font-medium exam-math-content p-3 bg-white rounded border border-[#28a745]/30" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: currentQuestion.correctAnswer || currentQuestion.solution || '<em>Solution shown below</em>' }} />
                      </div>
                    )}
                  </div>
                </div>
              ) : !isNumerical ? (
                (currentQuestion.options || []).map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOption = idx === currentQuestion.correctOptionIndex;
                  
                  let boxClass = 'border-gray-200 bg-white hover:border-gray-300';
                  let circleClass = 'bg-[#1976d2] text-white';

                  if (isAnswerChecked) {
                    if (isSelected && isCorrectOption) {
                      boxClass = 'border-[#28a745] bg-[#e8f5e9]';
                      circleClass = 'bg-[#28a745] text-white';
                    } else if (isSelected && !isCorrectOption) {
                      boxClass = 'border-[#dc3545] bg-[#fdecea]';
                      circleClass = 'bg-[#dc3545] text-white';
                    } else if (!isSelected && isCorrectOption) {
                      boxClass = 'border-[#28a745] bg-[#e8f5e9]';
                      circleClass = 'bg-[#28a745] text-white';
                    } else {
                      boxClass = 'border-gray-200 bg-white opacity-50';
                      circleClass = 'bg-gray-400 text-white';
                    }
                  } else if (isSelected) {
                    boxClass = 'border-[#2962ff] bg-[#f0f4ff]';
                  }

                  const labelChar = String.fromCharCode(65 + idx); // A, B, C, D

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        handleOptionSelect(idx);
                      }}
                      disabled={isAnswerChecked}
                      className={`w-full text-left p-4 flex items-start gap-4 border rounded-xl transition-all shadow-sm relative overflow-hidden ${boxClass}`}
                    >
                      <div className={`w-[30px] h-[30px] shrink-0 rounded-full flex items-center justify-center font-bold text-[13px] ${circleClass}`}>
                        {labelChar}
                      </div>
                      <div className="flex-1 mt-1 text-black font-medium exam-math-content" style={{ fontSize: `${Math.max(14, fontSize - 1)}px` }} dangerouslySetInnerHTML={{ __html: fixMathJax(opt) }} />
                      
                      {/* Correct Answer Badge */}
                      {isAnswerChecked && isCorrectOption && (
                        <div className="absolute top-0 right-0 bg-[#28a745] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                           Your answer | Correct answer
                        </div>
                      )}
                      {/* Users Percentage Mock */}
                      {isAnswerChecked && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-gray-500 text-white text-[9px] font-bold rounded">
                           {Math.floor(Math.random() * 40 + 10)}% users
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2">
                  <div className={`p-6 border rounded-xl shadow-sm ${isAnswerChecked ? (isCorrect ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#dc3545] bg-[#fdecea]') : 'border-gray-200 bg-white'}`}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Your Answer:</label>
                    <input
                      type="text"
                      value={selectedOption || ''}
                      onChange={(e) => handleOptionSelect(e.target.value)}
                      disabled={isAnswerChecked}
                      className={`w-full max-w-xs px-4 py-3 border rounded-lg outline-none text-lg font-mono font-bold ${isAnswerChecked ? 'bg-white' : 'border-gray-300 focus:border-[#2962ff]'}`}
                      placeholder="Type integer value..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Check Answer Button (Practice Mode) */}
            {practiceMode !== 'test' && !isAnswerChecked && !isSubjective && (
              <div className="flex justify-center mb-8">
                 <button 
                   onClick={() => {
                     if (selectedOption === '') {
                        setIsAnswerChecked(true);
                        setSavedAnswers(prev => ({...prev, [currentQuestionIndex]: { selectedOption: '', isAnswerChecked: true }}));
                        setTimeout(() => {
                          if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
                          }
                        }, 100);
                     } else {
                        handleCheckAnswer();
                     }
                   }}
                   className="px-8 py-3 bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded-lg shadow-md transition-colors text-[15px] flex items-center gap-2"
                 >
                   Check the Answer
                 </button>
              </div>
            )}

            {/* Explanation Section */}
            {(isAnswerChecked || savedAnswers[currentQuestionIndex]) && (
              <div className="mt-8">
                 <div 
                    dangerouslySetInnerHTML={{ __html: formatUniqueSolution(currentQuestion.solution) }}
                 />
                 <div className="bg-transparent mt-4 flex justify-end">
                    <button className="text-[#1976d2] text-xs font-bold px-3 py-1 border border-[#1976d2] rounded hover:bg-[#e3f2fd] transition-colors">
                      Add a Note
                    </button>
                 </div>
              </div>
             )}
          </div>
          </div>

          {/* Bottom Action Bar (Fixed to left content area) */}
          <div className="bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-10 shadow-[0_-4px_10px_rgba(0,-4px,10px,0.03)] shrink-0 h-16">
            <div className="flex items-center gap-3">
              {/* Optional: Add a clear response button here if needed */}
              {isAnswerChecked && practiceMode !== 'test' && (
                <button 
                  onClick={handleClearResponse}
                  className="text-gray-500 hover:text-gray-700 text-[13px] font-medium transition-colors"
                >
                  Clear Response
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded transition-colors text-[13px] font-medium ${currentQuestionIndex === 0 ? 'bg-[#f0f0f0] text-gray-400' : 'bg-[#e3f2fd] text-[#1976d2] hover:bg-[#bbdefb]'}`}
              >
                Previous
              </button>
              <button 
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className={`px-8 py-2 rounded transition-colors text-[13px] font-medium ${currentQuestionIndex === questions.length - 1 ? 'bg-[#f0f0f0] text-gray-400' : 'bg-[#28a745] text-white hover:bg-[#218838] shadow-sm'}`}
              >
                Next
              </button>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Bubble Grid */}
        <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-0">
          
          {/* Status Legend */}
          <div className="p-4 border-b border-gray-100 grid grid-cols-2 gap-y-3">
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#28a745]"></div><span className="text-[11px] text-gray-600 font-medium">Correct</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#dc3545]"></div><span className="text-[11px] text-gray-600 font-medium">Wrong</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#1976d2]"></div><span className="text-[11px] text-gray-600 font-medium">Attempted</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#ffc107]"></div><span className="text-[11px] text-gray-600 font-medium">Seen</span></div>
             <div className="flex items-center gap-2 col-span-2"><div className="w-4 h-4 rounded-full bg-[#6c757d]"></div><span className="text-[11px] text-gray-600 font-medium">Not Seen</span></div>
          </div>

          {/* Subject Header with Counts */}
          <div className="px-4 py-3 border-b border-gray-100 bg-[#f8f9fa]">
             <h4 className="font-semibold text-black text-[14px] mb-3">{topic?.name || 'Mathematics'}</h4>
             <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#28a745]"></div> {(() => {
                  let count = 0;
                  questions.forEach((q, idx) => {
                    const s = savedAnswers[idx];
                    if (s && s.isAnswerChecked && s.selectedOption !== '') {
                      const isNum = q.type === 'Numerical Value' || q.type === 'Integer' || q.type === 'numerical' || q.type === 'NUMERICAL' || q.type === 'integer-value' || (q.options && q.options.length === 0);
                      if (isNum ? String(s.selectedOption).trim() === String(q.correctAnswer).trim() : parseInt(s.selectedOption, 10) === q.correctOptionIndex) count++;
                    }
                  }); return count;
                })()}</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#dc3545]"></div> {(() => {
                  let count = 0;
                  questions.forEach((q, idx) => {
                    const s = savedAnswers[idx];
                    if (s && s.isAnswerChecked && s.selectedOption !== '') {
                      const isNum = q.type === 'Numerical Value' || q.type === 'Integer' || q.type === 'numerical' || q.type === 'NUMERICAL' || q.type === 'integer-value' || (q.options && q.options.length === 0);
                      if (!(isNum ? String(s.selectedOption).trim() === String(q.correctAnswer).trim() : parseInt(s.selectedOption, 10) === q.correctOptionIndex)) count++;
                    }
                  }); return count;
                })()}</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#1976d2]"></div> {(() => {
                  let count = 0;
                  questions.forEach((q, idx) => {
                    const s = savedAnswers[idx];
                    if (s && !s.isAnswerChecked && s.selectedOption !== '') count++;
                  }); return count;
                })()}</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#ffc107]"></div> {(() => {
                  let count = 0;
                  questions.forEach((q, idx) => {
                    const s = savedAnswers[idx];
                    if (s && s.isAnswerChecked && s.selectedOption === '') count++;
                    else if ((!s || s.selectedOption === '') && seenQuestions[idx]) count++;
                  }); return count;
                })()}</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#6c757d]"></div> {(() => {
                  let count = 0;
                  questions.forEach((q, idx) => {
                    if (!seenQuestions[idx] && (!savedAnswers[idx] || savedAnswers[idx].selectedOption === '')) count++;
                  }); return count;
                })()}</span>
             </div>
          </div>

          {/* Question Bubbles Grid */}
          <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
             <div className="grid grid-cols-6 gap-2.5">
               {questions.map((_, idx) => {
                 let bubbleClass = "bg-[#6c757d] text-white"; // default not seen
                 const s = savedAnswers[idx];
                 
                 if (s && s.isAnswerChecked) {
                    const q = questions[idx];
                    const isNum = q.type === 'Numerical Value' || q.type === 'Integer' || q.type === 'numerical' || q.type === 'NUMERICAL' || q.type === 'integer-value' || (q.options && q.options.length === 0);
                    let correct = false;
                    if (isNum) correct = String(s.selectedOption).trim() === String(q.correctAnswer).trim();
                    else correct = parseInt(s.selectedOption, 10) === q.correctOptionIndex;
                    
                    if (s.selectedOption === '') bubbleClass = "bg-[#ffc107] text-white"; // Seen but just revealed answer
                    else bubbleClass = correct ? "bg-[#28a745] text-white" : "bg-[#dc3545] text-white";
                 } else if (s && s.selectedOption !== '') {
                    bubbleClass = "bg-[#1976d2] text-white"; // attempted but not checked
                 } else if (seenQuestions[idx]) {
                    bubbleClass = "bg-[#ffc107] text-white"; // seen
                 }

                 return (
                   <button
                     key={idx}
                     onClick={() => setCurrentQuestionIndex(idx)}
                     className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[12px] shadow-sm hover:opacity-80 transition-all ${bubbleClass} ${idx === currentQuestionIndex ? 'ring-[2px] ring-offset-[2px] ring-[#3f51b5] transform scale-105' : ''}`}
                   >
                     {idx + 1}
                   </button>
                 );
               })}
             </div>
          </div>

        </div>
      </div>
      
      <BookmarkGroupModal 
        isOpen={bookmarkModalOpen}
        onClose={() => setBookmarkModalOpen(false)}
        groups={bookmarkGroups}
        currentGroups={progress[currentQuestion?.id]?.bookmarkGroups || []}
        onSave={handleSaveBookmarkGroups}
        onCreateGroup={addBookmarkGroup}
      />
    </div>
  );
}
