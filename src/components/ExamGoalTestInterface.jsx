import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';

export default function ExamGoalTestInterface({ pyqData, topic, onClose, isLight }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [qStatus, setQStatus] = useState({});
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fontSize, setFontSize] = useState(1.1); // Default font size in rem
  const [timeLeft, setTimeLeft] = useState(10800); // 3 hours

  const rawQuestions = pyqData.questions[topic.id] || [];
  const questions = rawQuestions; // NTA doesn't sort by old-new during test, keeps native order

  const currentQuestion = questions[currentQuestionIndex];
  const storageKey = `quantrex_nta_status_${topic.id}`;

  // Timer
  useEffect(() => {
    if (!isInitialized) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitialized]);

  const fixMathJax = (html) => {
    if (!html) return '';
    let fixed = html.replace(/\$\$/g, '$');
    fixed = fixed.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    fixed = fixed.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g, '\\sqrt[$1]{$2}');
    return fixed;
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Init logic
  useEffect(() => {
    const savedStatus = localStorage.getItem(storageKey);
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        if (Object.keys(parsed).length > 0) {
          setShowRestoreModal(true);
          return;
        }
      } catch (e) {
        console.error("Failed to parse", e);
      }
    }
    initializeFresh();
  }, [topic.id]);

  const initializeFresh = () => {
    const initialStatus = {};
    if (questions.length > 0) {
      initialStatus[questions[0].id] = { visited: true, status: 'not_answered' };
    }
    setQStatus(initialStatus);
    setCurrentQuestionIndex(0);
    setIsInitialized(true);
    setShowRestoreModal(false);
  };

  const handleRestore = (restore) => {
    if (restore) {
      try {
        const savedStatus = JSON.parse(localStorage.getItem(storageKey));
        setQStatus(savedStatus);
        let lastVisitedIdx = 0;
        questions.forEach((q, idx) => {
          if (savedStatus[q.id]?.visited) lastVisitedIdx = idx;
        });
        setCurrentQuestionIndex(lastVisitedIdx);
      } catch (e) {
        initializeFresh();
      }
    } else {
      localStorage.removeItem(storageKey);
      initializeFresh();
    }
    setIsInitialized(true);
    setShowRestoreModal(false);
  };

  useEffect(() => {
    if (isInitialized && Object.keys(qStatus).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(qStatus));
    }
  }, [qStatus, isInitialized, storageKey]);

  useEffect(() => {
    if (isInitialized && window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
  }, [currentQuestionIndex, isInitialized]);

  if (showRestoreModal) {
    return (
      <div className={`flex flex-col justify-center items-center h-[60vh] rounded-xl border p-8 ${isLight ? 'bg-white border-gray-200' : 'bg-obsidian border-white/10'}`}>
        <h2 className="text-2xl font-bold mb-4">Resume Assessment</h2>
        <p className="mb-8 text-gray-500">Would you like to resume your previous attempt for {topic.name}?</p>
        <div className="flex gap-4">
          <button onClick={() => handleRestore(false)} className="px-6 py-3 rounded-lg border border-red-500 text-red-500 hover:bg-red-50">Restart Fresh</button>
          <button onClick={() => handleRestore(true)} className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Resume Previous</button>
        </div>
      </div>
    );
  }

  if (!isInitialized || !currentQuestion) return null;

  const currentStatus = qStatus[currentQuestion.id] || { visited: true, status: 'not_answered' };
  const selectedAnswer = currentStatus.selectedOption;
  const isNumerical = currentQuestion.type === 'Numerical Value' || currentQuestion.type === 'Integer';

  const goToNextUnvisited = (nextIdx) => {
    const targetQ = questions[nextIdx];
    if (targetQ) {
      setQStatus(prev => ({
        ...prev,
        [targetQ.id]: {
          ...prev[targetQ.id],
          visited: true,
          status: prev[targetQ.id]?.status || 'not_answered'
        }
      }));
      setCurrentQuestionIndex(nextIdx);
    }
  };

  const handleOptionSelect = (val) => {
    setQStatus(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        visited: true,
        selectedOption: val,
      }
    }));
  };

  const handleSaveAndNext = () => {
    const isAns = selectedAnswer !== undefined && selectedAnswer !== '';
    setQStatus(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: isAns ? 'answered' : 'not_answered'
      }
    }));
    if (currentQuestionIndex < questions.length - 1) {
      goToNextUnvisited(currentQuestionIndex + 1);
    }
  };

  const handleSaveAndMarkForReview = () => {
    const isAns = selectedAnswer !== undefined && selectedAnswer !== '';
    setQStatus(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: isAns ? 'marked_answered' : 'marked' // NTA considers saving + marking as marked_answered
      }
    }));
    if (currentQuestionIndex < questions.length - 1) {
      goToNextUnvisited(currentQuestionIndex + 1);
    }
  };

  const handleMarkForReviewAndNext = () => {
    // If user didn't save, technically just marking
    setQStatus(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: 'marked'
      }
    }));
    if (currentQuestionIndex < questions.length - 1) {
      goToNextUnvisited(currentQuestionIndex + 1);
    }
  };

  const handleClearResponse = () => {
    setQStatus(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: undefined,
        status: 'not_answered'
      }
    }));
  };

  const getPaletteClass = (stat) => {
    if (!stat || !stat.visited) return 'bg-gray-200 text-black border border-gray-300';
    switch(stat.status) {
      case 'answered': return 'bg-[#218838] text-white border border-[#1e7e34]'; // green
      case 'not_answered': return 'bg-[#dc3545] text-white border border-[#bd2130]'; // red
      case 'marked': return 'bg-[#5a3286] text-white border border-[#4a296e]'; // purple
      case 'marked_answered': return 'bg-[#5a3286] text-white border border-[#4a296e] relative'; // purple with green dot
      default: return 'bg-[#dc3545] text-white border border-[#bd2130]'; // red
    }
  };

  const summary = {
    notVisited: questions.filter(q => !qStatus[q.id]?.visited).length,
    notAnswered: questions.filter(q => qStatus[q.id]?.status === 'not_answered').length,
    answered: questions.filter(q => qStatus[q.id]?.status === 'answered').length,
    marked: questions.filter(q => qStatus[q.id]?.status === 'marked').length,
    markedAnswered: questions.filter(q => qStatus[q.id]?.status === 'marked_answered').length,
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col font-sans ${isLight ? 'bg-white' : 'bg-[#f4f5f8]'}`}>
      
      {/* Topmost Header (ExamGoal Style Blue) */}
      <div className="h-14 bg-[#3f51b5] text-white flex items-center px-4 shadow-md justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-medium">{topic.name}</span>
        </div>
        <div className="flex items-center gap-4">
           {/* Timer from NTA */}
           <div className="font-bold font-mono tracking-wider text-lg">
              Time Left: {formatTime(timeLeft)}
           </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden bg-white text-gray-900">
        
        {/* Left Pane (Question Area) */}
        <div className="flex-1 flex flex-col relative border-r border-gray-300">
          
          {/* Shift Details (Green background from ExamGoal) */}
          <div className="px-4 py-2 bg-[#e8f5e9] border-b border-gray-200">
             <span className="text-[#2e7d32] font-medium text-[15px]">{currentQuestion.shift || currentQuestion.title || currentQuestion.year}</span>
          </div>

          <div className="flex-1 overflow-y-auto pb-24">
            
            {/* Question Info Header (Examgoal Mobile Style) */}
            <div className="px-5 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#3f51b5] text-white flex items-center justify-center font-bold">
                   {currentQuestionIndex + 1}
                 </div>
                 <div>
                    <div className="text-xs text-gray-500 font-medium">Time Spent: 00:00 | <span className="text-green-600 font-bold">+4</span> <span className="text-red-500 font-bold">-1</span></div>
                    <div className="mt-0.5 inline-block px-2 py-0.5 bg-[#e3f2fd] text-[#1976d2] text-[11px] font-bold rounded-sm uppercase tracking-wider">
                      {currentQuestion.type || 'MCQ Single Answer'}
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setFontSize(prev => Math.max(0.8, prev - 0.1))} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded" title="Zoom Out">
                  <ZoomOut size={18} />
                </button>
                <button onClick={() => setFontSize(prev => Math.min(2.5, prev + 0.1))} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded" title="Zoom In">
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-6">
              <div 
                className="leading-relaxed text-gray-800"
                style={{ fontSize: `${fontSize}rem` }}
                dangerouslySetInnerHTML={{ __html: fixMathJax(currentQuestion.question) }}
              />
            </div>

            {/* Options */}
            <div className="px-6 pb-6 space-y-3">
              {!isNumerical ? (
                (currentQuestion.options || []).map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const labelChar = String.fromCharCode(65 + idx); // A, B, C, D
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left p-3 flex items-start gap-3 border ${isSelected ? 'border-[#3f51b5] bg-[#f0f4f8]' : 'border-gray-200 bg-[#f9f9f9]'} hover:border-[#3f51b5] transition-colors rounded-sm`}
                    >
                      <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-[#3f51b5] text-white' : 'bg-[#3f51b5] text-white'}`}>
                        {labelChar}
                      </div>
                      <div className="flex-1 mt-0.5" style={{ fontSize: `${Math.max(1, fontSize - 0.05)}rem` }} dangerouslySetInnerHTML={{ __html: fixMathJax(opt) }} />
                    </button>
                  );
                })
              ) : (
                <div className="p-4 border border-gray-200 bg-[#f9f9f9] rounded-sm max-w-sm">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Numerical Answer:</label>
                  <input
                    type="text"
                    value={selectedAnswer || ''}
                    onChange={(e) => handleOptionSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-[#3f51b5] text-lg font-mono"
                    placeholder="Enter value"
                  />
                </div>
              )}
            </div>
          </div>

          {/* NTA Bottom Action Bar */}
          <div className="absolute bottom-0 w-full bg-white border-t border-gray-300 p-3 flex flex-wrap gap-2 justify-between text-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex gap-2">
              <button onClick={handleSaveAndNext} className="px-4 py-2 font-semibold text-white bg-[#28a745] hover:bg-[#218838] border border-[#218838] rounded-sm transition-colors shadow-sm">
                SAVE & NEXT
              </button>
              <button onClick={handleClearResponse} className="px-4 py-2 font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-sm transition-colors shadow-sm">
                CLEAR RESPONSE
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveAndMarkForReview} className="px-4 py-2 font-semibold text-white bg-[#e06b00] hover:bg-[#cc6100] border border-[#cc6100] rounded-sm transition-colors shadow-sm hidden md:block">
                SAVE & MARK FOR REVIEW
              </button>
              <button onClick={handleMarkForReviewAndNext} className="px-4 py-2 font-semibold text-white bg-[#007bff] hover:bg-[#0069d9] border border-[#0062cc] rounded-sm transition-colors shadow-sm">
                MARK FOR REVIEW & NEXT
              </button>
            </div>
          </div>

        </div>

        {/* Right Pane (NTA Palette) */}
        <div className="w-[320px] bg-[#e6edf4] flex flex-col h-full border-l border-gray-300 overflow-hidden shrink-0 hidden lg:flex">
           
           {/* Profile Section */}
           <div className="p-4 bg-white flex items-center gap-3 border-b border-gray-300 shadow-sm">
              <div className="w-14 h-14 bg-gray-200 border border-gray-400 p-1">
                 <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                 </div>
              </div>
              <div>
                <div className="font-bold text-[#3f51b5]">Student Name</div>
                <div className="text-xs font-semibold text-gray-600">John Doe</div>
              </div>
           </div>

           {/* Legend grid */}
           <div className="p-4 border-b border-gray-300 bg-white text-xs font-semibold text-gray-700 shadow-sm z-10">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                 <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center bg-gray-200 border border-gray-300 text-black shadow-sm font-bold">{summary.notVisited}</span> Not Visited
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center bg-[#dc3545] border border-[#bd2130] text-white shadow-sm shape-not-answered font-bold" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)'}}>{summary.notAnswered}</span> Not Answered
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center bg-[#28a745] border border-[#1e7e34] text-white shadow-sm shape-answered font-bold" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 80%)'}}>{summary.answered}</span> Answered
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center bg-[#5a3286] border border-[#4a296e] text-white rounded-full shadow-sm font-bold">{summary.marked}</span> Marked for Review
                 </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pl-1">
                 <span className="w-7 h-7 flex items-center justify-center bg-[#5a3286] border border-[#4a296e] text-white rounded-full relative shadow-sm font-bold">
                    {summary.markedAnswered}
                    <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-[#28a745] rounded-full border border-white"></span>
                 </span>
                 <span className="leading-tight text-[11px]">Answered & Marked for Review (will be considered for evaluation)</span>
              </div>
           </div>

           {/* Palette Grid */}
           <div className="flex-1 overflow-y-auto p-4 bg-[#e6edf4]">
              <div className="font-bold text-[#3f51b5] mb-3 border-b border-gray-300 pb-1">Mathematics</div>
              <div className="grid grid-cols-4 gap-2 pb-20">
                {questions.map((q, idx) => {
                  const stat = qStatus[q.id];
                  const colorClass = getPaletteClass(stat);
                  
                  // Shape logic to exactly match NTA
                  let shapeStyle = {};
                  let extraElement = null;
                  
                  if (stat?.status === 'not_answered') {
                    shapeStyle = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)', borderRadius: '2px' };
                  } else if (stat?.status === 'answered') {
                    shapeStyle = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 80%)', borderRadius: '2px' };
                  } else if (stat?.status === 'marked' || stat?.status === 'marked_answered') {
                    shapeStyle = { borderRadius: '50%' };
                    if (stat?.status === 'marked_answered') {
                      extraElement = <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#28a745] rounded-full border border-white"></span>;
                    }
                  } else {
                    shapeStyle = { borderRadius: '2px' };
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setQStatus(prev => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), visited: true, status: prev[q.id]?.status || 'not_answered' } }));
                        setCurrentQuestionIndex(idx);
                      }}
                      className={`w-11 h-11 flex items-center justify-center font-bold text-sm shadow-sm transition-transform relative
                        ${colorClass} ${currentQuestionIndex === idx ? 'ring-2 ring-offset-1 ring-[#3f51b5] transform scale-110 z-10' : 'hover:scale-105'}
                      `}
                      style={shapeStyle}
                    >
                      {idx + 1}
                      {extraElement}
                    </button>
                  );
                })}
              </div>
           </div>

           {/* Submit Button */}
           <div className="mt-auto bg-[#e6edf4] p-3 border-t border-gray-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => {
                   if (window.confirm("Are you sure you want to submit the test?")) {
                      onClose();
                   }
                }}
                className="w-full py-2.5 bg-white text-gray-800 border border-gray-400 font-bold rounded-sm shadow-sm hover:bg-gray-50 transition-colors"
              >
                SUBMIT
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
