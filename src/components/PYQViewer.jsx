import React, { useState, useEffect, useMemo } from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Bookmark from 'lucide-react/dist/esm/icons/bookmark';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ZoomOut from 'lucide-react/dist/esm/icons/zoom-out';
import TeacherSolution from './TeacherSolution';

export default function PYQViewer({ pyqData, topic, onClose, isLight }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [qStatus, setQStatus] = useState({});
  const [fontSize, setFontSize] = useState(1.3); // Default font size in rem
  const [sortOrder, setSortOrder] = useState('new_to_old');
  const [examLevel, setExamLevel] = useState('All Exams');
  const [questionType, setQuestionType] = useState('All Types');
  const [filterYear, setFilterYear] = useState('All Years');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  
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


  // Load questions and sort them
  const rawQuestions = pyqData.questions[topic.id] || [];
  
  const questions = useMemo(() => {
    let filtered = [...rawQuestions];
    if (examLevel !== 'All Exams') {
      filtered = filtered.filter(q => q.exam === examLevel);
    }
    if (questionType !== 'All Types') {
      filtered = filtered.filter(q => {
        const t = q.type || q.questionType || 'SCQ';
        const isMCQM = t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'multi_correct' || t === 'multiple_correct' || t === 'mcqm' || (Array.isArray(q.correctOptionIndex) && q.correctOptionIndex.length > 1);
        const isNum = t === 'NUMERICAL' || t === 'numerical' || q.answerType === 'numerical';
        const isSubj = t === 'SUBJECTIVE' || t === 'subjective';
        const isFIB = t === 'FIB' || t === 'fill-blanks';
        const isTF = t === 'T/F' || t === 'TRUE_FALSE' || t === 'true_false' || t === 't/f';
        const normalizedType = isMCQM ? 'MCQ Multiple Choice' : (isSubj ? 'Subjective' : (isNum ? 'Numerical' : (isFIB ? 'Fill in the Blanks' : (isTF ? 'True or False' : 'MCQ Single Choice'))));
        return normalizedType === questionType;
      });
    }
    if (filterYear !== 'All Years') {
      filtered = filtered.filter(q => String(q.year) === filterYear);
    }
    
    return filtered.sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      if (sortOrder === 'old_to_new') {
        return yearA - yearB;
      } else {
        return yearB - yearA;
      }
    });
  }, [rawQuestions, sortOrder, examLevel]);
  
  // Available exam levels
  const availableExams = useMemo(() => {
    return ['All Exams', ...new Set(rawQuestions.map(q => q.exam).filter(Boolean))];
  }, [rawQuestions]);

  // Available years
  const availableYears = useMemo(() => {
    return ['All Years', ...new Set(rawQuestions.map(q => String(q.year)).filter(y => y && y !== 'undefined'))].sort((a, b) => {
      if (a === 'All Years') return -1;
      if (b === 'All Years') return 1;
      return parseInt(b) - parseInt(a);
    });
  }, [rawQuestions]);

  const currentQuestion = questions[currentQuestionIndex];
  const storageKey = `quantrex_pyq_status_${topic.id}`;

  // Initialization & Restore Logic
  useEffect(() => {
    const savedStatus = localStorage.getItem(storageKey);
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        if (Object.keys(parsed).length > 0) {
          setShowRestoreModal(true);
          return; // Wait for user decision
        }
      } catch (e) {
        console.error("Failed to parse saved status", e);
      }
    }
    initializeFresh();
  }, [topic.id]);

  const initializeFresh = () => {
    const initialStatus = {};
    if (questions.length > 0) {
      initialStatus[questions[0].id] = { visited: true, status: 'unanswered' };
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
        
        // Find last visited question index to resume
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

  // Save to local storage on change
  useEffect(() => {
    if (isInitialized && Object.keys(qStatus).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(qStatus));
    }
  }, [qStatus, isInitialized, storageKey]);

  // Re-run MathJax when question changes
  useEffect(() => {
    if (isInitialized && window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
  }, [currentQuestionIndex, qStatus, isInitialized]);

  if (showRestoreModal) {
    return (
      <div className={`flex flex-col justify-center items-center h-[60vh] rounded-xl border p-8 ${isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-obsidian border-white/10 text-white'}`}>
        <h2 className="text-2xl font-bold mb-4">Resume Test</h2>
        <p className={`mb-8 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>We found saved progress for <strong>{topic.name}</strong>. Would you like to restore it or start fresh?</p>
        <div className="flex gap-4">
          <button onClick={() => handleRestore(false)} className={`px-6 py-3 rounded-lg font-bold border transition-all ${isLight ? 'border-red-500 text-red-600 hover:bg-red-50' : 'border-red-500 text-red-500 hover:bg-red-500/10'}`}>
            Restart Fresh
          </button>
          <button onClick={() => handleRestore(true)} className="px-6 py-3 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all">
            Resume Test
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) return null;

  if (!currentQuestion) {
    return (
      <div className={`flex flex-col justify-center items-center h-[60vh] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>No questions found for this topic.</p>
      </div>
    );
  }

  const currentStatus = qStatus[currentQuestion.id] || { visited: true, status: 'unanswered' };
  const isNumerical = currentQuestion.type === 'Numerical Value' || currentQuestion.type === 'Integer';
  const selectedAnswer = currentStatus.selectedOption;
  const isShowingSolution = currentStatus.showSolution;

  const handleOptionSelect = (val) => {
    if (isShowingSolution) return;
    setQStatus(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        visited: true,
        selectedOption: val,
      }
    }));
  };

  const checkCorrectness = (answer) => {
    if (isNumerical) {
      return String(answer).trim() === String(currentQuestion.correctAnswer).trim();
    } else {
      return answer === currentQuestion.correctOptionIndex;
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextId = questions[currentQuestionIndex + 1].id;
      setQStatus(prev => ({
        ...prev,
        [nextId]: { ...(prev[nextId] || {}), visited: true, status: prev[nextId]?.status || 'unanswered' }
      }));
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSaveAndNext = () => {
    const isAns = selectedAnswer !== undefined && selectedAnswer !== '';
    const isCorrect = isAns ? checkCorrectness(selectedAnswer) : false;
    
    setQStatus(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: isAns ? 'answered' : 'unanswered',
        showSolution: isAns ? true : prev[currentQuestion.id]?.showSolution,
        isCorrect: isCorrect
      }
    }));
    goToNext();
  };

  const handleMarkForReview = () => {
    const isAns = selectedAnswer !== undefined && selectedAnswer !== '';
    setQStatus(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: isAns ? 'marked_answered' : 'marked',
      }
    }));
    goToNext();
  };

  const handleClearResponse = () => {
    setQStatus(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: undefined,
        status: 'unanswered',
        showSolution: false
      }
    }));
  };

  const getPaletteColor = (statusObj) => {
    if (!statusObj || !statusObj.visited) return isLight ? 'bg-gray-200 text-gray-700' : 'bg-gray-800 text-gray-400';
    switch(statusObj.status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'unanswered': return 'bg-red-500 text-white';
      case 'marked': return 'bg-purple-500 text-white';
      case 'marked_answered': return 'bg-purple-500 text-white border-2 border-green-400 relative';
      default: return 'bg-red-500 text-white';
    }
  };

  return (
    <div className={`rounded-xl shadow-lg border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0f1115] border-white/10'} min-h-[85vh] flex flex-col md:flex-row overflow-hidden`}>
      
      {/* LEFT AREA: Question Area */}
      <div className="flex-1 flex flex-col relative border-r" style={{ borderColor: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
        
        {/* Header */}
        <div className={`p-4 border-b flex flex-wrap justify-between items-center ${isLight ? 'bg-gray-50' : 'bg-[#16181d]'}`} style={{ borderColor: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-4">
            <h3 className={`font-bold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>{topic.name}</h3>
            <span className={`text-sm font-bold px-3 py-1 block rounded ${isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/40 text-blue-300'}`}>Q. {currentQuestionIndex + 1}</span>
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to restart this test? All your progress will be cleared.")) {
                  handleRestore(false);
                }
              }}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded transition-colors text-sm font-bold border border-red-500/20"
              title="Restart Test"
            >
              <RotateCcw className="w-4 h-4" /> Restart
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
             <div className="flex items-center gap-2">
               <span className={`text-sm font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Level of Exam:</span>
               <select 
                 value={examLevel} 
                 onChange={(e) => {
                   setExamLevel(e.target.value);
                   setCurrentQuestionIndex(0); // reset on filter change
                 }}
                 className={`text-sm font-bold px-3 py-1.5 rounded outline-none border ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-obsidian border-white/20 text-gray-200'}`}
               >
                 {availableExams.map(ex => <option key={ex} value={ex}>{ex}</option>)}
               </select>
             </div>

             <div className="flex items-center gap-2">
               <span className={`text-sm font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Type:</span>
               <select 
                 value={questionType} 
                 onChange={(e) => {
                   setQuestionType(e.target.value);
                   setCurrentQuestionIndex(0); // reset on filter change
                 }}
                 className={`text-sm font-bold px-3 py-1.5 rounded outline-none border ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-obsidian border-white/20 text-gray-200'}`}
               >
                 <option value="All Types">All Types</option>
                 <option value="MCQ Single Choice">MCQ Single Choice</option>
                 <option value="MCQ Multiple Choice">MCQ Multiple Choice</option>
                 <option value="Numerical">Numerical</option>
                 <option value="Fill in the Blanks">Fill in the Blanks</option>
                 <option value="True or False">True or False</option>
                 <option value="Subjective">Subjective</option>
               </select>
             </div>

             <div className="flex items-center gap-2">
               <span className={`text-sm font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Year:</span>
               <select 
                 value={filterYear} 
                 onChange={(e) => {
                   setFilterYear(e.target.value);
                   setCurrentQuestionIndex(0);
                 }}
                 className={`text-sm font-bold px-3 py-1.5 rounded outline-none border ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-obsidian border-white/20 text-gray-200'}`}
               >
                 {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
               </select>
             </div>

             <div className="flex items-center gap-2">
               <span className={`text-sm font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Sort by:</span>
               <select 
                 value={sortOrder} 
                 onChange={(e) => {
                   setSortOrder(e.target.value);
                   setCurrentQuestionIndex(0); // reset on sort change
                 }}
                 className={`text-sm font-bold px-3 py-1.5 rounded outline-none border ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-obsidian border-white/20 text-gray-200'}`}
               >
                 <option value="new_to_old">New to Old</option>
                 <option value="old_to_new">Old to New</option>
               </select>
              <span className={`text-sm font-bold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
              <button onClick={() => setFontSize(prev => Math.max(0.8, prev - 0.1))} className={`p-1.5 rounded hover:bg-black/5 ${isLight ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 hover:bg-white/10'}`} title="Zoom Out">
                <ZoomOut size={18} />
              </button>
              <button onClick={() => setFontSize(prev => Math.min(2.5, prev + 0.1))} className={`p-1.5 rounded hover:bg-black/5 ${isLight ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 hover:bg-white/10'}`} title="Zoom In">
                <ZoomIn size={18} />
              </button>
            </div>
          </div>
        </div>
        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Question Meta Info */}
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${isLight ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-blue-900/20 border-blue-500 text-blue-100'} shadow-sm flex flex-col md:flex-row md:justify-between md:items-center`}>
            <div>
              <div className="font-extrabold text-lg mb-1">{currentQuestion.title || currentQuestion.shift || currentQuestion.year || 'Unknown Year'}</div>
              {/* Show shift if it exists and isn't already the title */}
              {currentQuestion.shift && currentQuestion.title !== currentQuestion.shift && (
                <div className={`font-medium ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>{currentQuestion.shift}</div>
              )}
              {/* Show year if it exists and isn't already in the title */}
              {currentQuestion.year && !(currentQuestion.title || '').includes(String(currentQuestion.year)) && (
                <div className={`font-medium ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>Year: {currentQuestion.year}</div>
              )}
            </div>
            <span className={`mt-3 md:mt-0 inline-block px-4 py-1.5 text-sm font-bold rounded-full ${isLight ? 'bg-blue-200 text-blue-800' : 'bg-blue-800/50 text-blue-200 border border-blue-500/30'}`}>
              {(() => {
                const t = currentQuestion.type || currentQuestion.questionType || 'SCQ';
                const isMCQM = t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'multi_correct' || t === 'multiple_correct' || t === 'mcqm' || (Array.isArray(currentQuestion.correctOptionIndex) && currentQuestion.correctOptionIndex.length > 1);
                const isNum = t === 'NUMERICAL' || t === 'numerical' || currentQuestion.answerType === 'numerical';
                const isSubj = t === 'SUBJECTIVE' || t === 'subjective';
                return isMCQM ? 'MCQM' : (isSubj ? 'SUBJECTIVE' : (isNum ? 'NUMERICAL' : 'SCQ'));
              })()}
            </span>
          </div>

          <div className="mb-8">
            <div 
              className={`leading-[1.8] font-medium tracking-wide ${isLight ? 'text-gray-900' : 'text-gray-100'}`}
              style={{ fontSize: `${fontSize}rem` }}
              dangerouslySetInnerHTML={{ __html: fixMathJax(currentQuestion.question) }}
            />
          </div>

          {/* Options Input */}
          {!isNumerical ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {(currentQuestion.options || []).map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isActuallyCorrect = currentQuestion.correctOptionIndex === idx;
                
                let optStyle = isLight 
                  ? 'bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-300 text-gray-800' 
                  : 'bg-[#16181d] border-white/10 hover:border-blue-500/50 hover:bg-white/5 text-gray-200';
                  
                if (isSelected) {
                  optStyle = isLight ? 'bg-blue-100 border-blue-600 text-blue-900 shadow-sm' : 'bg-blue-900/30 border-blue-500 text-white shadow-sm shadow-blue-900/20';
                }
                
                if (isShowingSolution) {
                  if (isActuallyCorrect) {
                    optStyle = isLight ? 'bg-green-100 border-green-600 text-green-900 shadow-sm' : 'bg-green-900/30 border-green-500 text-white shadow-sm';
                  } else if (isSelected && !isActuallyCorrect) {
                    optStyle = isLight ? 'bg-red-100 border-red-600 text-red-900 shadow-sm' : 'bg-red-900/30 border-red-500 text-white shadow-sm';
                  }
                }

                const labelChar = String.fromCharCode(65 + idx); // A, B, C, D

                return (
                  <button
                    key={idx}
                    disabled={isShowingSolution}
                    onClick={() => handleOptionSelect(idx)}
                    className={`p-5 rounded-xl border-2 text-left flex items-start gap-4 transition-all duration-200 ${optStyle}`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                      isSelected ? (isLight ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-600 text-white border-blue-600') : (isLight ? 'bg-white border-gray-300 text-gray-600 shadow-sm' : 'bg-[#0f1115] border-white/20 text-gray-400')
                    } ${isShowingSolution && isActuallyCorrect ? (isLight ? 'bg-green-600 text-white border-green-600' : 'bg-green-600 text-white border-green-600') : ''}`}>
                      {labelChar}
                    </div>
                    <div className="flex-1 mt-0.5 leading-relaxed" style={{ fontSize: `${Math.max(1, fontSize - 0.1)}rem` }} dangerouslySetInnerHTML={{ __html: fixMathJax(opt) }} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mb-8 p-6 rounded-xl border bg-gray-50/50 dark:bg-[#16181d]/50" style={{ borderColor: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
               <label className={`block font-bold mb-4 text-lg ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Enter Your Answer:</label>
               <input 
                  type="text" 
                  value={selectedAnswer || ''}
                  onChange={(e) => handleOptionSelect(e.target.value)}
                  disabled={isShowingSolution}
                  placeholder="Type numerical value..."
                  className={`w-full max-w-sm px-5 py-4 rounded-xl border-2 font-bold text-xl outline-none transition-all ${isLight ? 'bg-white border-gray-300 focus:border-blue-600 text-gray-900 shadow-sm' : 'bg-[#0f1115] border-white/20 focus:border-blue-500 text-white shadow-sm'}`}
               />
            </div>
          )}

          {/* Solution Area */}
          {isShowingSolution && (
            <div className={`p-6 rounded-xl border-2 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300 ${isLight ? (currentStatus.isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300') : (currentStatus.isCorrect ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30')}`}>
              <div className="flex items-center gap-3 mb-4">
                {currentStatus.isCorrect ? (
                  <><CheckCircle className={`w-7 h-7 ${isLight ? 'text-green-600' : 'text-green-500'}`} /><span className={`font-bold text-xl ${isLight ? 'text-green-800' : 'text-green-400'}`}>Correct Answer!</span></>
                ) : (
                  <><div className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-white text-md ${isLight ? 'bg-red-600' : 'bg-red-500'}`}>X</div><span className={`font-bold text-xl ${isLight ? 'text-red-800' : 'text-red-400'}`}>Incorrect Answer</span></>
                )}
              </div>
                <div className={`mt-5 pt-5 border-t ${isLight ? 'border-green-200' : 'border-white/10'}`}>
                  <TeacherSolution html={currentQuestion.solution} />
                </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className={`p-4 md:p-6 border-t flex flex-wrap gap-3 md:gap-4 ${isLight ? 'bg-gray-50' : 'bg-[#16181d]'}`} style={{ borderColor: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
          <button 
            onClick={handleSaveAndNext}
            className={`px-6 py-3 rounded-xl font-bold text-white text-[1.05rem] shadow-sm flex items-center gap-2 transition-transform active:scale-95 ${isLight ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-500'}`}
          >
            Save & Next <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleClearResponse}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 border-2 transition-all active:scale-95 ${isLight ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm' : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/10'}`}
          >
            <Trash2 className="w-5 h-5" /> Clear
          </button>
          
          <button 
            onClick={handleMarkForReview}
            className={`px-6 py-3 rounded-xl font-bold text-white text-[1.05rem] shadow-sm flex items-center gap-2 transition-transform active:scale-95 ${isLight ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-500'}`}
          >
            <Bookmark className="w-5 h-5" /> Mark for Review & Next
          </button>
        </div>
      </div>

      {/* RIGHT AREA: Palette */}
      <div className={`w-full md:w-80 p-5 flex flex-col border-l ${isLight ? 'bg-white border-gray-200' : 'bg-[#0a0c10] border-white/5'}`}>
        <h4 className={`font-bold text-center mb-6 text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>Question Palette</h4>
        
        {/* Palette Grid */}
        <div className="grid grid-cols-5 gap-3 mb-6 overflow-y-auto max-h-[40vh] md:max-h-[60vh] pr-2 custom-scrollbar">
          {questions.map((q, idx) => {
            const stat = qStatus[q.id];
            const colorClass = getPaletteColor(stat);
            return (
              <button
                key={q.id}
                onClick={() => {
                   setQStatus(prev => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), visited: true, status: prev[q.id]?.status || 'unanswered' } }));
                   setCurrentQuestionIndex(idx);
                }}
                className={`h-11 w-full rounded-lg font-bold text-[0.95rem] flex items-center justify-center transition-all shadow-sm ${colorClass} ${currentQuestionIndex === idx ? (isLight ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'ring-2 ring-offset-2 ring-offset-[#0a0c10] ring-blue-500 scale-110') : 'hover:scale-105 hover:opacity-90'}`}
              >
                {stat?.status === 'marked_answered' && <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-400 border border-purple-500"></div>}
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className={`mt-auto space-y-3 text-sm p-4 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#16181d] border-white/5'}`}>
          <div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-md shadow-sm ${isLight ? 'bg-gray-200' : 'bg-gray-800'}`}></div> <span className={`font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Not Visited</span></div>
          <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-md shadow-sm bg-red-500"></div> <span className={`font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Not Answered</span></div>
          <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-md shadow-sm bg-green-500"></div> <span className={`font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Answered</span></div>
          <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-md shadow-sm bg-purple-500"></div> <span className={`font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Marked for Review</span></div>
          <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-md shadow-sm bg-purple-500 border-2 border-green-400"></div> <span className={`font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Answered & Marked</span></div>
        </div>
      </div>
    </div>
  );
}
