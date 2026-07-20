import React, { useState, useEffect, useRef } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import Eye from 'lucide-react/dist/esm/icons/eye';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import Clock from 'lucide-react/dist/esm/icons/clock';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import CloudOff from 'lucide-react/dist/esm/icons/cloud-off';
import Cloud from 'lucide-react/dist/esm/icons/cloud';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ZoomOut from 'lucide-react/dist/esm/icons/zoom-out';
import { fetchBlackBookQuestions, fetchBlackBookProgress, saveBlackBookProgress, resetBlackBookProgress } from '../utils/blackBookApi';
import MathRenderer from '../utils/MathRenderer';
import TeacherSolution from '../components/TeacherSolution';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

export default function BookPractice({ chapter, setActivePage, theme, user }) {
  const isLight = theme === 'light';
  const chapterId = chapter?.id || 'function';
  const userId = user?._id || user?.id || null;
  const storageKey = `blackbook_progress_${chapterId}`;

  // ─── State ────────────────────────────────────────────────────────────────
  const [activeExercise, setActiveExercise] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const scrollRef = useRef(null);

  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    if (!userId) return;
    setSyncStatus('syncing');
    fetchBlackBookProgress(chapterId, userId)
      .then(mongoProgress => {
        if (Object.keys(mongoProgress).length > 0) {
          setProgress(prev => {
            const merged = { ...prev };
            Object.entries(mongoProgress).forEach(([ex, qMap]) => {
              if (!merged[ex]) merged[ex] = {};
              Object.entries(qMap).forEach(([qi, state]) => {
                const localState = merged[ex][qi];
                if (state.status && (!localState || !localState.status)) {
                  merged[ex][qi] = state;
                }
              });
            });
            return merged;
          });
        }
        setSyncStatus('synced');
      })
      .catch(() => setSyncStatus('offline'));
  }, [userId, chapterId]);

  const [seenMap, setSeenMap] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey + '_seen');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [timeSpent, setTimeSpent] = useState(0);
  const [fontSize, setFontSize] = useState(17);

  // Temporary selection before saving
  const [tempSelection, setTempSelection] = useState(null);

  // ─── Data ────────────────────────────────────────────────────────────────
  const [allQuestions, setAllQuestions] = useState(chapter?.questions || []);
  const [loadingQuestions, setLoadingQuestions] = useState(!chapter?.questions?.length);
  const exerciseGroups = allQuestions.reduce((acc, q) => {
    const ex = q.exerciseName || 'Exercise 1';
    if (!acc[ex]) acc[ex] = [];
    acc[ex].push(q);
    return acc;
  }, {});
  const exercisesList = Object.keys(exerciseGroups).sort();

  useEffect(() => {
    if (!allQuestions.length) {
      setLoadingQuestions(true);
      fetchBlackBookQuestions(chapterId)
        .then(data => {
          setAllQuestions(data || []);
          setLoadingQuestions(false);
        })
        .catch(err => {
          console.error("Failed to fetch questions:", err);
          setLoadingQuestions(false);
        });
    }
  }, [chapterId]);

  useEffect(() => {
    if (!activeExercise && exercisesList.length > 0) {
      setActiveExercise(exercisesList[0]);
      setCurrentIdx(0);
    }
  }, [exercisesList, activeExercise]);

  const questions = activeExercise ? exerciseGroups[activeExercise] || [] : [];
  const question = questions[currentIdx];
  const globalKey = `${activeExercise}-${currentIdx}`;

  // Sync tempSelection with progress when switching questions
  useEffect(() => {
    const qState = (progress[activeExercise] || {})[currentIdx];
    setTempSelection(qState?.selectedIdx !== undefined ? qState.selectedIdx : null);
  }, [activeExercise, currentIdx, progress]);

  // Mark as visited/seen
  useEffect(() => {
    if (activeExercise && currentIdx !== undefined) {
      setSeenMap(prev => {
        if (!prev[globalKey]) {
           return { ...prev, [globalKey]: true };
        }
        return prev;
      });
    }
  }, [activeExercise, currentIdx]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey + '_seen', JSON.stringify(seenMap));
  }, [seenMap, storageKey]);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const isMatchingType = activeExercise?.includes('Exercise 4') || activeExercise?.includes('Exercise-4');
  const isSubjective = activeExercise?.includes('Exercise 5') || activeExercise?.includes('Exercise-5');
  const t = (question?.type || question?.questionType || '').toUpperCase().trim();
  const isMultiCorrect = activeExercise?.includes('Exercise 2') || activeExercise?.includes('Exercise-2') || t === 'MULTI_CORRECT' || t === 'MULTIPLE_CORRECT' || t === 'MCQM';

  const handleTabChange = (ex) => {
    setActiveExercise(ex);
    setCurrentIdx(0);
  };

  const handleSelectOption = (optIdx) => {
    if (isMultiCorrect) {
      setTempSelection(prev => {
        const arr = Array.isArray(prev) ? prev : (prev !== undefined && prev !== null && prev !== -1 ? [prev] : []);
        if (arr.includes(optIdx)) return arr.filter(i => i !== optIdx);
        return [...arr, optIdx].sort((a, b) => a - b);
      });
    } else {
      setTempSelection(optIdx);
    }
  };

  const updateProgressState = (statusType) => {
    const isAnswered = tempSelection !== null && (Array.isArray(tempSelection) ? tempSelection.length > 0 : tempSelection !== -1);
    
    let finalStatus = 'not_visited';
    if (statusType === 'save_next') finalStatus = isAnswered ? 'answered' : 'not_answered';
    else if (statusType === 'mark_review') finalStatus = isAnswered ? 'answered_marked' : 'marked';
    else if (statusType === 'clear') finalStatus = 'not_answered';
    
    if (statusType === 'clear') setTempSelection(null);

    const selectionToSave = statusType === 'clear' ? -1 : tempSelection;
    let correct = null;
    
    if (isAnswered && statusType !== 'clear') {
       if (isMultiCorrect) {
          const correctArr = question.correctOptionsArray || [];
          const selArr = Array.isArray(tempSelection) ? tempSelection : [tempSelection];
          correct = correctArr.length > 0 && correctArr.length === selArr.length && selArr.every(v => correctArr.includes(v));
       } else {
          correct = tempSelection === question.correctOption;
       }
    }

    setProgress(prev => {
      const copy = { ...prev };
      if (!copy[activeExercise]) copy[activeExercise] = {};
      copy[activeExercise][currentIdx] = {
        selectedIdx: selectionToSave,
        status: finalStatus,
        isCorrect: correct
      };
      
      saveBlackBookProgress(chapterId, userId, activeExercise, currentIdx, {
        selectedIdx: selectionToSave,
        status: finalStatus,
        isCorrect: correct
      });
      return copy;
    });

    if (statusType !== 'clear') {
      if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
    }
  };

  const handleJumpTo = (idx) => {
    // Save current as not_answered if not already saved and seen
    const currState = (progress[activeExercise] || {})[currentIdx];
    if (!currState?.status) {
       setProgress(prev => {
          const copy = { ...prev };
          if (!copy[activeExercise]) copy[activeExercise] = {};
          copy[activeExercise][currentIdx] = {
             selectedIdx: tempSelection !== null ? tempSelection : -1,
             status: tempSelection !== null && tempSelection !== -1 && (!Array.isArray(tempSelection) || tempSelection.length > 0) ? 'answered' : 'not_answered'
          };
          return copy;
       });
    }
    setCurrentIdx(idx);
  };

  const getStats = () => {
    const exP = progress[activeExercise] || {};
    let answered = 0, notAnswered = 0, notVisited = 0, marked = 0, answeredMarked = 0;
    
    questions.forEach((_, idx) => {
      const s = exP[idx];
      const isSeen = seenMap[`${activeExercise}-${idx}`];
      
      if (!s?.status) {
         if (isSeen) notAnswered++;
         else notVisited++;
      } else {
         if (s.status === 'answered') answered++;
         else if (s.status === 'not_answered') notAnswered++;
         else if (s.status === 'marked') marked++;
         else if (s.status === 'answered_marked') answeredMarked++;
      }
    });
    return { answered, notAnswered, notVisited, marked, answeredMarked };
  };

  const getBubbleClass = (idx) => {
    const s = (progress[activeExercise] || {})[idx];
    const isSeen = seenMap[`${activeExercise}-${idx}`];
    
    let base = "w-10 h-10 flex items-center justify-center font-bold text-[14px] cursor-pointer shrink-0 transition-all shadow-sm mx-auto ";
    let status = s?.status;
    if (!status) status = isSeen ? 'not_answered' : 'not_visited';
    
    // NTA Shapes
    if (status === 'answered') return base + "bg-[#27ae60] text-white rounded-t-lg rounded-bl-none rounded-br-lg";
    if (status === 'not_answered') return base + "bg-[#eb3b5a] text-white rounded-t-lg rounded-bl-lg rounded-br-none";
    if (status === 'not_visited') return base + "bg-[#f1f2f6] text-[#2f3640] border border-[#dcdde1] rounded";
    if (status === 'marked') return base + "bg-[#8e44ad] text-white rounded-full";
    if (status === 'answered_marked') return base + "bg-[#8e44ad] text-white rounded-full relative"; // Will add green dot in render
    
    return base + "bg-[#f1f2f6] text-[#2f3640] rounded";
  };

  if (loadingQuestions) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isLight ? 'bg-gray-50 text-gray-900' : 'bg-gray-950 text-white'}`}>
        <RefreshCw className="w-16 h-16 mb-4 opacity-50 animate-spin text-[#2962ff]" />
        <p className="text-lg font-medium mb-4">Loading questions...</p>
      </div>
    );
  }

  if (!allQuestions.length || !question) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isLight ? 'bg-gray-50 text-gray-900' : 'bg-gray-950 text-white'}`}>
        <BookOpen className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium mb-4">No questions available.</p>
        <button onClick={() => setActivePage('book-chapters')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Go Back</button>
      </div>
    );
  }

  const stats = getStats();
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col font-sans bg-[#eef2f5] overflow-hidden">
      
      {/* ── ALLEN/NTA Header ─────────────────────────────────────────── */}
      <div className="h-[60px] bg-[#2962ff] text-white flex items-center px-4 sm:px-6 shadow-md justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setActivePage('book-chapters')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[18px] font-bold tracking-wide">{chapter?.title || 'Practice Paper'}</span>
            <span className="text-[12px] text-white/80 uppercase font-semibold tracking-wider">CBT Format Practice</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-4 border-r border-white/20 pr-4">
             <span className="text-[12px] text-white/80 uppercase tracking-widest font-bold">Time Spent</span>
             <span className="text-[18px] font-bold font-mono">{formatTime(timeSpent)}</span>
          </div>
          <button 
             onClick={() => {
                if(window.confirm("Are you sure you want to view solutions?")) {
                   setShowSolutionModal(true);
                }
             }}
             className="hidden sm:flex px-4 py-1.5 bg-white text-[#2962ff] hover:bg-blue-50 rounded font-bold text-[13px] uppercase tracking-wide shadow-sm items-center gap-2"
          >
             <Eye size={16}/> View Solution
          </button>
        </div>
      </div>

      {/* ── Sub Header Bar ─────────────────────────────────────── */}
      <div className="bg-[#1e4fc2] border-b border-white/10 px-3 flex items-center overflow-x-auto shrink-0 shadow-inner" style={{minHeight:'44px'}}>
        {exercisesList.map(ex => (
          <button
            key={ex}
            onClick={() => handleTabChange(ex)}
            className={`whitespace-nowrap px-6 py-2.5 text-[13px] font-bold transition-all shrink-0 border-r border-white/10 ${
              activeExercise === ex
                ? 'bg-[#eef2f5] text-[#2962ff] shadow-inner rounded-t-md border-r-0'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            {ex.toUpperCase()}
          </button>
        ))}
        
        <div className="ml-auto flex items-center gap-1 text-white/80 pr-2">
           <button onClick={() => setFontSize(prev => Math.max(12, prev - 1))} className="p-1 hover:bg-white/10 rounded"><ZoomOut size={16}/></button>
           <button onClick={() => setFontSize(prev => Math.min(30, prev + 1))} className="p-1 hover:bg-white/10 rounded"><ZoomIn size={16}/></button>
        </div>
      </div>

      {/* ── Main Layout: Left + Right ────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ───── LEFT: Question Panel ───────────────────────── */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-sm m-2 sm:m-3 rounded-lg border border-gray-200">
          
          {/* Question Info Bar */}
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
             <div className="font-bold text-[18px] text-[#2f3640]">Question No. {currentIdx + 1}</div>
             <div className="flex gap-4 font-bold text-[13px]">
                <div className="text-gray-500">Marks</div>
                <div className="text-green-600 bg-green-100 px-2 rounded">+4</div>
                <div className="text-red-600 bg-red-100 px-2 rounded">-1</div>
             </div>
          </div>

          {/* Question Area */}
          <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
             {/* Question Text */}
             <div className="leading-[1.8] text-[#2f3640] mb-8 font-semibold whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
                <MathRenderer text={question.text} />
             </div>

             {/* Graph/Image if any */}
             {question.has_graph && question.imageUrl && !question.text?.includes(question.imageUrl) && (
                <div className="mb-8 flex flex-col gap-4">
                  <img src={question.imageUrl} alt="Graph" className="max-w-md w-full rounded border border-gray-200" />
                  {question.imageUrl2 && <img src={question.imageUrl2} alt="Graph 2" className="max-w-md w-full rounded border border-gray-200" />}
                </div>
             )}

             {/* Options */}
             {!isMatchingType && !isSubjective && (!question.type || question.type !== 'NUMERICAL') && (
                <div className="flex flex-col gap-4 max-w-3xl">
                   {(question.options || []).map((opt, i) => {
                      const isSelected = isMultiCorrect 
                           ? (Array.isArray(tempSelection) ? tempSelection.includes(i) : tempSelection === i)
                           : tempSelection === i;
                      
                      return (
                         <label key={i} className="flex items-start gap-3 cursor-pointer group">
                            <div className="pt-1">
                               <input 
                                  type={isMultiCorrect ? "checkbox" : "radio"}
                                  name="options"
                                  checked={isSelected}
                                  onChange={() => handleSelectOption(i)}
                                  className="w-4 h-4 cursor-pointer accent-[#2962ff]"
                               />
                            </div>
                            <div className="font-semibold text-[#2f3640] group-hover:text-black leading-relaxed" style={{ fontSize: `${Math.max(14, fontSize - 1)}px` }}>
                               <span className="font-bold mr-2 text-gray-500">{OPTION_LABELS[i]}.</span> 
                               <MathRenderer text={opt} />
                            </div>
                         </label>
                      );
                   })}
                </div>
             )}

             {/* Matching / Subjective Placeholder */}
             {(isMatchingType || isSubjective || question.type === 'NUMERICAL') && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 font-semibold text-sm">
                   This is a {isMatchingType ? 'Matching Type' : isSubjective ? 'Subjective' : 'Numerical'} question. 
                   <br/><br/>
                   <button 
                      onClick={() => setShowSolutionModal(true)}
                      className="px-4 py-2 bg-[#2962ff] text-white rounded shadow"
                   >
                      View Solution
                   </button>
                </div>
             )}
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-[#f5f6fa] border-t border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-inner flex-wrap gap-3">
             <div className="flex gap-3">
                <button 
                   onClick={() => updateProgressState('save_next')}
                   className="px-5 py-2.5 bg-[#27ae60] hover:bg-[#219653] text-white text-[13px] font-bold uppercase rounded shadow-sm border border-[#1e8449] transition-colors"
                >
                   Save & Next
                </button>
                <button 
                   onClick={() => updateProgressState('clear')}
                   className="px-5 py-2.5 bg-white hover:bg-gray-50 text-[#2f3640] text-[13px] font-bold uppercase rounded shadow-sm border border-gray-300 transition-colors"
                >
                   Clear Response
                </button>
                <button 
                   onClick={() => updateProgressState('mark_review')}
                   className="hidden sm:block px-5 py-2.5 bg-[#e67e22] hover:bg-[#d35400] text-white text-[13px] font-bold uppercase rounded shadow-sm border border-[#ca6f1e] transition-colors"
                >
                   Save & Mark For Review
                </button>
             </div>
             <div className="flex gap-3 ml-auto">
                <button 
                   onClick={() => updateProgressState('mark_review')}
                   className="px-5 py-2.5 bg-[#8e44ad] hover:bg-[#732d91] text-white text-[13px] font-bold uppercase rounded shadow-sm border border-[#71368a] transition-colors"
                >
                   Mark For Review & Next
                </button>
             </div>
          </div>
        </div>

        {/* ───── RIGHT: Question Palette ─────────────────────── */}
        <div className="hidden md:flex w-[300px] bg-[#f8f9fa] flex-col shrink-0 border-l border-gray-300">
          
          {/* User Profile Block */}
          <div className="p-4 bg-white border-b border-gray-300 flex items-center gap-3">
             <div className="w-14 h-14 bg-gray-200 rounded overflow-hidden border border-gray-300 flex items-center justify-center shrink-0">
                <img src="https://ui-avatars.com/api/?name=Student&background=random" alt="Profile" className="w-full h-full object-cover" />
             </div>
             <div className="flex flex-col">
                <span className="font-bold text-[14px] text-gray-800">CBT Practice User</span>
                <span className="text-[12px] text-gray-500 font-semibold mt-0.5">Black Book Series</span>
             </div>
          </div>

          {/* Legend Grid */}
          <div className="p-3 bg-white border-b border-gray-300 grid grid-cols-2 gap-y-3 gap-x-2 shrink-0">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center font-bold text-[10px] bg-[#27ae60] text-white rounded-t-lg rounded-bl-none rounded-br-lg">{stats.answered}</div>
                <span className="text-[11px] font-semibold text-gray-700 leading-tight">Answered</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center font-bold text-[10px] bg-[#eb3b5a] text-white rounded-t-lg rounded-bl-lg rounded-br-none">{stats.notAnswered}</div>
                <span className="text-[11px] font-semibold text-gray-700 leading-tight">Not Answered</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center font-bold text-[10px] bg-[#f1f2f6] text-[#2f3640] border border-gray-300 rounded">{stats.notVisited}</div>
                <span className="text-[11px] font-semibold text-gray-700 leading-tight">Not Visited</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center font-bold text-[10px] bg-[#8e44ad] text-white rounded-full">{stats.marked}</div>
                <span className="text-[11px] font-semibold text-gray-700 leading-tight">Marked for Review</span>
             </div>
             <div className="flex items-center gap-2 col-span-2 mt-1">
                <div className="w-6 h-6 flex items-center justify-center font-bold text-[10px] bg-[#8e44ad] text-white rounded-full relative">
                   {stats.answeredMarked}
                   <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#27ae60] rounded-full border border-white"></div>
                </div>
                <span className="text-[11px] font-semibold text-gray-700 leading-tight">Answered & Marked for Review (will be considered for evaluation)</span>
             </div>
          </div>

          {/* Section Header */}
          <div className="px-4 py-2 bg-[#eef2f5] border-b border-gray-300">
             <span className="text-[13px] font-bold text-[#2962ff] uppercase">{activeExercise}</span>
          </div>

          {/* Palette Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#eef2f5]">
             <div className="grid grid-cols-5 gap-3">
               {questions.map((_, idx) => {
                  const s = (progress[activeExercise] || {})[idx];
                  const isSeen = seenMap[`${activeExercise}-${idx}`];
                  let status = s?.status;
                  if (!status) status = isSeen ? 'not_answered' : 'not_visited';
                  const isAnsMarked = status === 'answered_marked';

                  return (
                    <div key={idx} className="relative" onClick={() => handleJumpTo(idx)}>
                       <div className={getBubbleClass(idx)}>
                          {idx + 1}
                       </div>
                       {isAnsMarked && <div className="absolute bottom-0 right-1 w-2.5 h-2.5 bg-[#27ae60] rounded-full border border-white pointer-events-none"></div>}
                    </div>
                  );
               })}
             </div>
          </div>
          
          <div className="p-4 bg-white border-t border-gray-300">
             <button 
                className="w-full py-3 bg-[#3498db] hover:bg-[#2980b9] text-white rounded font-bold uppercase tracking-wider text-[14px] shadow-sm transition-colors"
                onClick={() => {
                   if(window.confirm("Submit test? You can still review solutions afterwards.")) {
                      setShowSolutionModal(true);
                   }
                }}
             >
                Submit
             </button>
          </div>
        </div>
      </div>

      {/* Solution Modal Overlay */}
      {showSolutionModal && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl max-h-full rounded-xl shadow-2xl flex flex-col overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-800">Solution: Q{currentIdx + 1}</h2>
                  <button onClick={() => setShowSolutionModal(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors">
                     <XCircle className="w-5 h-5"/>
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 bg-white">
                  {question.solution ? (
                     <TeacherSolution html={question.solution} isLight={true} />
                  ) : (
                     <div className="text-center p-8 text-gray-500 font-medium text-lg">Solution not available for this question.</div>
                  )}
                  {question.correctAnswer && (
                     <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <span className="font-bold text-green-800">Correct Answer Key: </span>
                        <span className="font-mono font-bold text-green-700">{question.correctAnswer}</span>
                     </div>
                  )}
               </div>
               <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                  <button onClick={() => setShowSolutionModal(false)} className="px-6 py-2.5 bg-gray-800 hover:bg-black text-white font-bold rounded shadow transition-colors">
                     Close
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
