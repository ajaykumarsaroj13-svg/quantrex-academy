import React, { useState, useEffect, useMemo } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ZoomOut from 'lucide-react/dist/esm/icons/zoom-out';
import CountdownOverlay from './CountdownOverlay';

import logoMainsImg from '../assets/logo_mains.png';
import logoAdvancedImg from '../assets/logo_advanced.png';
import logoNdaImg from '../assets/logo_nda.png';
import logoImg from '../assets/logo.png';

const getExamLogo = (data) => {
  const type = (data?.examType || data?.exam || data?.category || data?.name || data?.title || data?.id || '').toLowerCase();
  if (type.includes('advanced')) {
    return <img src={logoAdvancedImg} alt="JEE Advanced" className="w-7 h-7 rounded-full object-cover border border-white/30 bg-white/10 p-0.5 shadow-sm" />;
  }
  if (type.includes('main')) {
    return <img src={logoMainsImg} alt="JEE Main" className="w-7 h-7 rounded-full object-cover border border-white/30 bg-white/10 p-0.5 shadow-sm" />;
  }
  if (type.includes('nda')) {
    return <img src={logoNdaImg} alt="NDA" className="w-7 h-7 rounded-full object-cover border border-white/30 bg-white/10 p-0.5 shadow-sm" />;
  }
  return null;
};

export default function ExamGoalTestInterface({ pyqData, topic, onClose, isLight }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [qStatus, setQStatus] = useState({});
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasAcceptedInstructions, setHasAcceptedInstructions] = useState(false);
  const [hasReadInstructions, setHasReadInstructions] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fontSize, setFontSize] = useState(1.0); // Default font size in rem

  const rawQuestions = pyqData?.questions?.[topic?.id] || [];
  const questions = rawQuestions; // NTA doesn't sort by old-new during test, keeps native order
  const durationMinutes = topic?.durationMinutes || topic?.duration || pyqData?.durationMinutes || pyqData?.duration || (questions.length > 0 ? Math.max(30, Math.min(180, Math.round(questions.length * 2.4))) : 180);
  const [timeLeft, setTimeLeft] = useState(() => durationMinutes * 60);

  const currentQuestion = questions[currentQuestionIndex];
  const storageKey = `quantrex_nta_status_${topic.id}`;

  // Timer
  useEffect(() => {
    if (!isInitialized || !hasAcceptedInstructions) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitialized, hasAcceptedInstructions]);

  const fixMathJax = (html) => {
    if (!html) return '';
    let fixed = html;
    if (typeof fixed === 'object') {
      fixed = fixed.en?.content || fixed.en?.questionText || fixed.en || fixed.content || fixed.questionText || '';
    }
    if (typeof fixed !== 'string') {
      fixed = String(fixed);
    }
    fixed = fixed.replace(/\$\$/g, '$');
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
  
  const optionsToRender = (currentQuestion.question?.en?.options && currentQuestion.question.en.options.length > 0) ? currentQuestion.question.en.options : (currentQuestion.options || []);
  const isSubjective = currentQuestion.type === 'SUBJECTIVE' || currentQuestion.type === 'subjective';
  const isMultiCorrect = !isSubjective && (
    currentQuestion.type === 'MULTI_CORRECT' || 
    currentQuestion.type === 'multi_correct' || 
    currentQuestion.type === 'multiple_correct' || 
    currentQuestion.type === 'MCQM' || 
    currentQuestion.type === 'mcqm' || 
    currentQuestion.type === 'MCQ (Multiple Correct)' || 
    currentQuestion.type === 'Multiple Correct' || 
    (currentQuestion.correctOptionsArray && currentQuestion.correctOptionsArray.length > 0) || 
    currentQuestion.isMultiCorrect || 
    (currentQuestion.question?.en?.correct_options && currentQuestion.question.en.correct_options.length > 1) ||
    (currentQuestion.correctAnswer && (String(currentQuestion.correctAnswer).includes(',') || String(currentQuestion.correctAnswer).toLowerCase().includes('and') || String(currentQuestion.correctAnswer).includes('&'))) ||
    Array.isArray(currentQuestion.correctOptionIndex) ||
    (currentQuestion.question?.en?.content && (
       currentQuestion.question.en.content.toLowerCase().includes('one or more') ||
       currentQuestion.question.en.content.toLowerCase().includes('multiple correct')
    )) ||
    (typeof currentQuestion.question === 'string' && (
       currentQuestion.question.toLowerCase().includes('one or more') ||
       currentQuestion.question.toLowerCase().includes('multiple correct')
    ))
  );
  const isNumerical = !isSubjective && !isMultiCorrect && (currentQuestion.type === 'Numerical Value' || currentQuestion.type === 'Integer' || currentQuestion.type === 'numerical' || currentQuestion.type === 'NUMERICAL' || currentQuestion.type === 'integer-value' || optionsToRender.length === 0);


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
    setQStatus(prev => {
      const currentStat = prev[currentQuestion.id] || { visited: true, status: 'not_answered' };
      if (isMultiCorrect) {
        const selected = Array.isArray(currentStat.selectedOption) ? currentStat.selectedOption : [];
        let newSelected;
        if (selected.includes(val)) {
           newSelected = selected.filter(x => x !== val).sort((a,b) => a-b);
        } else {
           newSelected = [...selected, val].sort((a,b) => a-b);
        }
        return {
          ...prev,
          [currentQuestion.id]: {
            ...currentStat,
            visited: true,
            selectedOption: newSelected,
          }
        };
      } else {
        return {
          ...prev,
          [currentQuestion.id]: {
            ...currentStat,
            visited: true,
            selectedOption: val,
          }
        };
      }
    });
  };

  const isAnsSelected = (selected) => {
    if (selected === undefined || selected === '') return false;
    if (Array.isArray(selected)) return selected.length > 0;
    return true;
  };

  const handleSaveAndNext = () => {
    const isAns = isAnsSelected(selectedAnswer);
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
    const isAns = isAnsSelected(selectedAnswer);
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
           <button
             onClick={() => setShowInstructionsModal(true)}
             className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition-all flex items-center gap-1 border border-white/20 cursor-pointer"
           >
             ℹ Instructions
           </button>
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
          
          

          <div className="flex-1 overflow-y-auto pb-24">
            
            {/* Question Info Header (Examgoal Mobile Style) */}
            <div className="px-5 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#3f51b5] text-white flex items-center justify-center font-bold">
                   {currentQuestionIndex + 1}
                 </div>
                 <div>
                    <div className="text-xs text-gray-500 font-medium mb-0.5">Time Spent: 00:00 | <span className="text-green-600 font-bold">+4</span> <span className="text-red-500 font-bold">-1</span></div>
                    {(() => {
                      let label = isMultiCorrect ? 'MCQM' : (isSubjective ? 'SUBJECTIVE' : (isNumerical ? 'NUMERICAL' : 'SCQ'));
                      return (
                        <div className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${isMultiCorrect ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : (isNumerical ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : (isSubjective ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 'bg-green-500/10 text-green-700 border-green-500/20'))}`}>
                          {label}
                        </div>
                      );
                    })()}
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
                optionsToRender.map((opt, idx) => {
                  const isSelected = isMultiCorrect 
                      ? (Array.isArray(selectedAnswer) && selectedAnswer.includes(idx))
                      : selectedAnswer === idx;
                  const labelChar = String.fromCharCode(65 + idx); // A, B, C, D
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left p-3 flex items-start gap-3 border ${isSelected ? 'border-[#3f51b5] bg-[#f0f4f8]' : 'border-gray-200 bg-[#f9f9f9]'} hover:border-[#3f51b5] transition-colors rounded-sm`}
                    >
                      <div className={`w-7 h-7 shrink-0 flex items-center justify-center font-bold text-sm ${isMultiCorrect ? 'rounded-md' : 'rounded-full'} ${isSelected ? 'bg-[#3f51b5] text-white' : 'bg-[#3f51b5] text-white'}`}>
                        {labelChar}
                      </div>
                      <div className="flex-1 mt-0.5" style={{ fontSize: `${Math.max(1, fontSize - 0.05)}rem` }} dangerouslySetInnerHTML={{ __html: fixMathJax(opt.content || opt) }} />
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
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#28a745] rounded-full border border-white"></span>
                 </span>
                 Answered & Marked for Review
              </div>
           </div>

           {/* Question Palette */}
           <div className="flex-1 overflow-y-auto p-4">
             <div className="grid grid-cols-5 gap-2">
               {questions.map((q, idx) => {
                 const stat = qStatus[q.id];
                 const colorClass = getPaletteClass(stat);
                 let shapeStyle = { borderRadius: '50%' };
                 let extraElement = null;
                 if (stat?.status === 'not_answered') {
                   shapeStyle = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)' };
                 } else if (stat?.status === 'answered') {
                   shapeStyle = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 80%)' };
                 } else if (stat?.status === 'marked_answered') {
                   extraElement = <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2e7d32] rounded-full border border-white"></span>;
                 } else {
                   shapeStyle = { borderRadius: '2px' };
                 }
                 return (
                   <button
                     key={q.id || idx}
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

      {/* ─── INSTRUCTIONS MODAL / OVERLAY ─── */}
      {(!hasAcceptedInstructions || showInstructionsModal) && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white overflow-hidden text-gray-900">
          
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-[#3f51b5] text-white">
              <div className="flex items-center gap-3">
                {getExamLogo(topic || pyqData)}
                <div>
                  <h3 className="font-extrabold text-lg uppercase tracking-wide">
                    {topic?.name || pyqData?.title || 'Official Examination Instructions'}
                  </h3>
                  <span className="text-xs font-semibold text-white/80">
                    Duration: {durationMinutes} Mins | Total Questions: {questions?.length || 75}
                  </span>
                </div>
              </div>
              {hasAcceptedInstructions && (
                <button 
                  onClick={() => setShowInstructionsModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm hover:bg-white/20 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:px-32 space-y-8 text-base leading-relaxed bg-[#f8f9fa]">
              <div className="p-4 rounded border font-medium flex items-start gap-3 bg-blue-50 border-blue-200 text-blue-900">
                <span className="text-xl">ℹ</span>
                <span>Please read the instructions carefully before starting the test. The clock is set at the top right of your screen.</span>
              </div>

              {/* General Instructions */}
              <div>
                <h4 className="font-extrabold text-lg uppercase tracking-wider mb-4 border-b border-gray-300 pb-2 text-blue-800">
                  1. General Instructions:
                </h4>
                <ol className="list-decimal list-inside space-y-2 pl-1 text-gray-800">
                  <li>Total duration of examination is <strong>{durationMinutes} minutes</strong>.</li>
                  <li>The clock countdown is displayed on top right corner.</li>
                  <li>When timer reaches zero, test will submit automatically.</li>
                </ol>
              </div>

              {/* Question Status Symbols */}
              <div>
                <h4 className="font-extrabold text-lg uppercase tracking-wider mb-4 border-b border-gray-300 pb-2 text-blue-800">
                  2. Question Status Symbols:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded border bg-white border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded flex items-center justify-center font-bold shadow-sm bg-gray-200 text-gray-700 border border-gray-300">1</div>
                    <span className="text-gray-800 font-medium">Not Visited</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded border bg-white border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded flex items-center justify-center font-bold shadow-sm bg-[#dc3545] text-white">2</div>
                    <span className="text-gray-800 font-medium">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded border bg-white border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded flex items-center justify-center font-bold shadow-sm bg-[#28a745] text-white">3</div>
                    <span className="text-gray-800 font-medium">Answered</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded border bg-white border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded flex items-center justify-center font-bold shadow-sm bg-[#5a3286] text-white">4</div>
                    <span className="text-gray-800 font-medium">Marked for Review</span>
                  </div>
                </div>
              </div>

              {/* Marking Scheme */}
              <div>
                <h4 className="font-extrabold text-lg uppercase tracking-wider mb-4 border-b border-gray-300 pb-2 text-blue-800">
                  3. Marking Scheme:
                </h4>
                <ul className="list-disc list-inside space-y-2 pl-1 text-gray-800">
                  <li><strong>Correct Answer:</strong> +4 Marks</li>
                  <li><strong>Incorrect Answer:</strong> -1 Mark</li>
                  <li><strong>Unattempted:</strong> 0 Marks</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            {!hasAcceptedInstructions ? (
              <div className="px-6 md:px-10 lg:px-32 py-5 bg-white border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-800 select-none">
                  <input 
                    type="checkbox" 
                    checked={hasReadInstructions}
                    onChange={(e) => setHasReadInstructions(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>
                    I have read and understood all instructions and am ready to start.
                  </span>
                </label>

                <button
                  disabled={!hasReadInstructions}
                  onClick={() => {
                    setShowCountdown(true);
                  }}
                  className={`px-10 py-3.5 rounded-sm font-extrabold text-sm uppercase tracking-wider transition-all duration-200 shadow-md ${
                    hasReadInstructions
                      ? 'bg-[#28a745] hover:bg-[#218838] text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  PROCEED TO TEST →
                </button>
              </div>
            ) : (
              <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="px-8 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm uppercase rounded transition-all cursor-pointer"
                >
                  Close Instructions ✕
                </button>
              </div>
            )}
        </div>
      )}

      {/* ── 3... 2... 1... GO! Countdown Overlay ── */}
      {showCountdown && (
        <CountdownOverlay
          examTitle={topic?.name || pyqData?.title || 'Official Exam Starting'}
          onComplete={() => {
            setShowCountdown(false);
            setHasAcceptedInstructions(true);
            setIsInitialized(true);
          }}
        />
      )}
    </div>
  );
}
