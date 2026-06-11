import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, AlertCircle, Clock, Bookmark, ZoomIn, ZoomOut, CheckCircle, Eye } from 'lucide-react';
import BookmarkGroupModal from './BookmarkGroupModal';
import TeacherSolution from './TeacherSolution';

export default function ExamGoalPracticeInterface({ pyqData, topic, customQuestions, practiceMode, onProgressUpdate, onClose, isLight, onToggleTheme, bookmarkGroups = [], addBookmarkGroup = () => {}, progress = {} }) {
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
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
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
    if (isAnswerChecked || isTestSubmitted) return; // Stop timer if already answered
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isAnswerChecked, isTestSubmitted, currentQuestionIndex]);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
  }, [currentQuestionIndex, isAnswerChecked, isTestSubmitted]);

  if (!currentQuestion) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col font-sans overflow-hidden ${isLight ? 'bg-[#f4f5f8]' : 'bg-[#0f172a]'}`}>
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
        <div className={`flex-1 overflow-y-auto flex justify-center items-center w-full p-4 ${isLight ? 'bg-[#f4f5f8]' : 'bg-[#0f172a]'}`}>
           <div className={`max-w-md w-full p-8 rounded-xl shadow-sm border text-center ${isLight ? 'bg-white border-gray-200' : 'bg-[#1e293b] border-gray-700'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-[#e8eaf6] text-[#3f51b5]' : 'bg-[#312e81] text-[#818cf8]'}`}>
                 <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>Questions Coming Soon!</h3>
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
    if (isAnswerChecked || isTestSubmitted) return;
    setSelectedOption(val);
    setSavedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: { 
        selectedOption: val, 
        isAnswerChecked: false 
      }
    }));
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
    <div className={`fixed inset-0 z-[100] flex flex-col font-sans overflow-hidden ${isLight ? 'bg-[#f5f5f5]' : 'bg-[#0f172a]'}`}>
      
      {/* Top Header */}
      <div className="h-[52px] bg-[#2962ff] text-white flex items-center px-4 shadow-md justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[16px] font-medium">{topic ? topic.name : 'Practice Session'}</span>
           {isTestSubmitted && (
             <span className="px-2.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-wider animate-pulse">
               Review Mode
             </span>
           )}
        </div>
        <div className="flex items-center gap-4">
           {/* Theme Toggle Button */}
           <button
            onClick={onToggleTheme}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="theme-toggle-btn relative h-7 w-12 rounded-full border flex items-center transition-all duration-300 mx-3"
            style={{ 
               backgroundColor: isLight ? '#eff6ff' : '#1e293b', 
               borderColor: isLight ? '#bfdbfe' : '#334155',
               justifyContent: isLight ? 'flex-end' : 'flex-start'
            }}
          >
            <span className="absolute inset-y-0.5 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-[10px] shadow-sm"
                  style={{
                    right: isLight ? '2px' : 'auto',
                    left: isLight ? 'auto' : '2px',
                    backgroundColor: isLight ? '#fbbf24' : '#3b82f6',
                    color: isLight ? '#fff' : '#0f172a'
                  }}>
              {isLight ? '☀' : '☾'}
            </span>
          </button>
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
        <div className={`flex-1 flex flex-col relative shadow-sm z-10 ${isLight ? 'bg-white' : 'bg-[#1e293b]'}`}>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full pb-10" ref={scrollContainerRef}>
             <div className="max-w-5xl mx-auto w-full">
            
            {/* Header: Date, Shift, Q No, Type */}
            <div className="mb-6">
              <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mb-3">
                 <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-700 font-semibold shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{String(Math.floor(timeSpent / 60)).padStart(2, '0')}:{String(timeSpent % 60).padStart(2, '0')}</span>
                 </div>
                 
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
                      {currentQuestion.shift || currentQuestion.title || currentQuestion.year}
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
                className={`font-medium leading-relaxed exam-math-content ${isLight ? 'text-black' : 'text-gray-100'}`}
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
                  </div>
                </div>
              ) : !isNumerical ? (
                (currentQuestion.options || []).map((opt, idx) => {
                  const isSelected = selectedOption === idx || selectedOption === String(idx);
                  const isCorrectOption = idx === parseInt(currentQuestion.correctOptionIndex, 10);
                  
                  let boxClass = isLight ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-gray-700 bg-[#1e293b] hover:border-gray-600 text-gray-200';
                  let circleClass = 'bg-[#1976d2] text-white';

                  if (isAnswerChecked || isTestSubmitted) {
                    if (isSelected && isCorrectOption) {
                      boxClass = isLight ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#28a745] bg-[#064e3b] text-white';
                      circleClass = 'bg-[#28a745] text-white';
                    } else if (isSelected && !isCorrectOption) {
                      boxClass = isLight ? 'border-[#dc3545] bg-[#fdecea]' : 'border-[#dc3545] bg-[#7f1d1d] text-white';
                      circleClass = 'bg-[#dc3545] text-white';
                    } else if (!isSelected && isCorrectOption) {
                      boxClass = isLight ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#28a745] bg-[#064e3b] text-white';
                      circleClass = 'bg-[#28a745] text-white';
                    } else {
                      boxClass = isLight ? 'border-gray-200 bg-white opacity-50' : 'border-gray-700 bg-[#1e293b] opacity-50';
                      circleClass = 'bg-gray-400 text-white';
                    }
                  } else if (isSelected) {
                    boxClass = isLight ? 'border-[#2962ff] bg-[#f0f4ff]' : 'border-[#60a5fa] bg-[#1e3a8a] text-white';
                  }

                  const labelChar = String.fromCharCode(65 + idx); // A, B, C, D

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        handleOptionSelect(idx);
                      }}
                      disabled={isAnswerChecked || isTestSubmitted}
                      className={`w-full text-left p-4 flex items-start gap-4 border rounded-xl transition-all shadow-sm relative overflow-hidden ${boxClass}`}
                    >
                      <div className={`w-[30px] h-[30px] shrink-0 rounded-full flex items-center justify-center font-bold text-[13px] ${circleClass}`}>
                        {labelChar}
                      </div>
                      <div className={`flex-1 mt-1 font-medium exam-math-content ${isLight ? 'text-black' : 'text-gray-100'}`} style={{ fontSize: `${Math.max(14, fontSize - 1)}px` }} dangerouslySetInnerHTML={{ __html: fixMathJax(opt) }} />
                    </button>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2">
                  <div className={`p-6 border rounded-xl shadow-sm ${isAnswerChecked || isTestSubmitted ? (isCorrect ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#dc3545] bg-[#fdecea]') : 'border-gray-200 bg-white'}`}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Your Answer:</label>
                    <input
                      type="text"
                      value={selectedOption || ''}
                      onChange={(e) => handleOptionSelect(e.target.value)}
                      disabled={isAnswerChecked || isTestSubmitted}
                      className={`w-full max-w-xs px-4 py-3 border rounded-lg outline-none text-lg font-mono font-bold ${isAnswerChecked || isTestSubmitted ? 'bg-white' : 'border-gray-300 focus:border-[#2962ff]'}`}
                      placeholder="Type integer value..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Explanation Section */}
            {(isAnswerChecked || isTestSubmitted) && (
               <div className="mt-8">
                 <TeacherSolution html={currentQuestion.solution} isLight={isLight} />
                 <div className="bg-transparent mt-4 flex justify-end">
                    <button className="text-[#1976d2] text-xs font-bold px-3 py-1 border border-[#1976d2] rounded hover:bg-[#e3f2fd] transition-colors">Add a Note</button>
                 </div>
              </div>
             )}
          </div>
          </div>

          {/* Bottom Action Bar (Fixed to left content area) */}
          <div className={`border-t px-4 sm:px-6 py-3 flex justify-between items-center z-10 shadow-[0_-4px_10px_rgba(0,-4px,10px,0.03)] shrink-0 h-auto sm:h-16 flex-wrap sm:flex-nowrap gap-2 ${isLight ? 'bg-white border-gray-200' : 'bg-[#1e293b] border-gray-700'}`}>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`px-4 sm:px-6 py-2 rounded transition-colors text-[13px] font-bold ${currentQuestionIndex === 0 ? 'bg-gray-100 text-gray-400' : 'bg-[#e3f2fd] text-[#1976d2] hover:bg-[#bbdefb]'}`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              {isAnswerChecked && practiceMode !== 'test' && (
                <button 
                  onClick={handleClearResponse}
                  className="text-gray-500 hover:text-gray-800 text-[12px] font-bold px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 flex justify-center">
              {!isTestSubmitted && practiceMode !== 'test' && (
                  <button 
                    onClick={() => {
                      if (selectedOption === '' || selectedOption === undefined) {
                         setIsAnswerChecked(true); // Just show solution
                      } else if (!isAnswerChecked) {
                        handleCheckAnswer();
                      }
                    }}
                    className={`px-8 py-2.5 rounded shadow-sm text-[13px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2
                      ${isAnswerChecked || isTestSubmitted 
                        ? 'bg-transparent border-2 border-[#1976d2] text-[#1976d2] opacity-50 cursor-not-allowed' 
                        : (selectedOption !== '' && selectedOption !== undefined)
                          ? 'bg-[#28a745] hover:bg-[#218838] text-white shadow-md transform hover:-translate-y-0.5' 
                          : 'bg-white border-2 border-[#1976d2] text-[#1976d2] hover:bg-gray-50 shadow-sm'}`}
                    disabled={isAnswerChecked || isTestSubmitted}
                  >
                    {selectedOption !== '' && selectedOption !== undefined ? <><CheckCircle className="w-4 h-4" /> Check Answer</> : <><Eye className="w-4 h-4" /> View Solution</>}
                  </button>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className={`px-6 sm:px-8 py-2 rounded transition-colors text-[13px] font-bold ${currentQuestionIndex === questions.length - 1 ? 'bg-gray-100 text-gray-400' : 'bg-[#2962ff] text-white hover:bg-blue-700 shadow-sm'}`}
              >
                Next
              </button>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Bubble Grid */}
        <div className={`w-[320px] border-l flex flex-col shrink-0 overflow-hidden shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-0 ${isLight ? 'bg-white border-gray-200' : 'bg-[#0f172a] border-gray-800'}`}>
          
          {/* Status Legend */}
          <div className="p-4 border-b border-gray-100 grid grid-cols-2 gap-y-3">
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#28a745]"></div><span className="text-[11px] text-gray-600 font-medium">Correct</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#dc3545]"></div><span className="text-[11px] text-gray-600 font-medium">Wrong</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#1976d2]"></div><span className="text-[11px] text-gray-600 font-medium">Attempted</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#ffc107]"></div><span className="text-[11px] text-gray-600 font-medium">Seen</span></div>
             <div className="flex items-center gap-2 col-span-2"><div className="w-4 h-4 rounded-full bg-[#6c757d]"></div><span className="text-[11px] text-gray-600 font-medium">Not Seen</span></div>
          </div>

          {/* Subject Header with Counts */}
          <div className={`px-4 py-3 border-b ${isLight ? 'border-gray-100 bg-[#f8f9fa]' : 'border-gray-800 bg-[#1e293b]'}`}>
             <h4 className={`font-semibold text-[14px] mb-3 ${isLight ? 'text-black' : 'text-gray-100'}`}>{topic?.name || 'Mathematics'}</h4>
             <div className={`flex items-center justify-between text-[11px] font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
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
