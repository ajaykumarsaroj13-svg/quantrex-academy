import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, PlayCircle, CheckCircle, HelpCircle, BrainCircuit, AlertTriangle, RefreshCw, BarChart2, Check, ArrowRight } from 'lucide-react';

export default function ExamGoalPracticeInterface({ test, user, onBackToDashboard }) {
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [statusMap, setStatusMap] = useState({}); // 'unseen', 'attempted', 'correct', 'wrong', 'skipped'
  const [showSolution, setShowSolution] = useState(false);
  
  // Pre-test modal states
  const [showModal, setShowModal] = useState(true);
  const [language, setLanguage] = useState('English');
  const [order, setOrder] = useState('Newest first');
  const [continueMode, setContinueMode] = useState('Resume');

  // Analytics view state
  const [showAnalytics, setShowAnalytics] = useState(false);

  const timerRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const STORAGE_KEY = `quantrex_practice_state_${test?.id || 'default'}`;

  useEffect(() => {
    if (test && test.questions) {
      setOriginalQuestions([...test.questions]);
      setQuestions([...test.questions]);
      
      if (test.durationMinutes) {
        setTimeRemaining(test.durationMinutes * 60);
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setContinueMode('Resume');
      } else {
        setContinueMode('Start Fresh');
      }
    }
  }, [test]);

  useEffect(() => {
    if (!showModal && !showAnalytics && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
        setTotalTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeRemaining, showModal, showAnalytics]);

  useEffect(() => {
    if (window.MathJax && !showModal && !showAnalytics) {
      setTimeout(() => {
        window.MathJax.typesetPromise && window.MathJax.typesetPromise();
      }, 100);
    }
  }, [currentIdx, showSolution, showModal, showAnalytics]);

  // Save progress automatically
  useEffect(() => {
    if (!showModal && !showAnalytics) {
      const stateToSave = {
        currentIdx,
        selectedAnswers,
        statusMap,
        order,
        timeRemaining,
        totalTimeSpent
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [currentIdx, selectedAnswers, statusMap, showModal, showAnalytics]);

  const handleStart = () => {
    let activeQuestions = [...originalQuestions];

    if (continueMode === 'Resume') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setOrder(parsed.order || 'Newest first');
          
          if (parsed.order === 'Oldest first') {
            activeQuestions.reverse();
          } else if (parsed.order === 'Random') {
            activeQuestions.sort(() => Math.random() - 0.5);
          }

          setQuestions(activeQuestions);
          setCurrentIdx(parsed.currentIdx || 0);
          setSelectedAnswers(parsed.selectedAnswers || {});
          setStatusMap(parsed.statusMap || {});
          if (parsed.timeRemaining) setTimeRemaining(parsed.timeRemaining);
          if (parsed.totalTimeSpent) setTotalTimeSpent(parsed.totalTimeSpent);
          setShowModal(false);
          return;
        } catch (e) {
          console.error("Error parsing saved state", e);
        }
      }
    }

    // Start Fresh Logic
    if (order === 'Oldest first') {
      activeQuestions.reverse();
    } else if (order === 'Random') {
      activeQuestions.sort(() => Math.random() - 0.5);
    }

    setQuestions(activeQuestions);
    const initialStatus = {};
    activeQuestions.forEach((q, i) => {
      initialStatus[i] = 'unseen';
    });
    initialStatus[0] = 'seen';
    
    setCurrentIdx(0);
    setSelectedAnswers({});
    setStatusMap(initialStatus);
    setShowSolution(false);
    setTotalTimeSpent(0);
    setShowModal(false);
  };

  const handleSelectOption = (optIdx) => {
    if (showSolution) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleCheckAnswer = () => {
    if (selectedAnswers[currentIdx] === undefined) return;
    
    const isCorrect = selectedAnswers[currentIdx] === questions[currentIdx].correctOptionIndex;
    setStatusMap(prev => ({ 
      ...prev, 
      [currentIdx]: isCorrect ? 'correct' : 'wrong' 
    }));
    setShowSolution(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      if (statusMap[currentIdx] === 'seen') {
        setStatusMap(prev => ({ ...prev, [currentIdx]: 'skipped' }));
      }
      setCurrentIdx(prev => prev + 1);
      if (statusMap[currentIdx + 1] === 'unseen') {
        setStatusMap(prev => ({ ...prev, [currentIdx + 1]: 'seen' }));
      }
      setShowSolution(statusMap[currentIdx + 1] === 'correct' || statusMap[currentIdx + 1] === 'wrong');
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowSolution(statusMap[currentIdx - 1] === 'correct' || statusMap[currentIdx - 1] === 'wrong');
    }
  };

  const handleSubmitSession = () => {
    // Save remaining unseen questions as skipped
    setStatusMap(prev => {
      const copy = { ...prev };
      questions.forEach((_, idx) => {
        if (copy[idx] === 'unseen' || copy[idx] === 'seen') {
          copy[idx] = 'skipped';
        }
      });
      return copy;
    });
    // Remove state from storage so next time starts fresh
    localStorage.removeItem(STORAGE_KEY);
    setShowAnalytics(true);
  };

  const handleResetSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowAnalytics(false);
    setShowModal(true);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!questions || questions.length === 0) return <div className="h-screen bg-obsidian text-white flex items-center justify-center font-mono">Loading...</div>;

  const currentQ = questions[currentIdx];

  // Detailed Shift Tag Generator
  const getDetailedTag = (q, idx) => {
    const examTag = q.exam || 'JEE Main';
    const yearStr = q.year || '2024';
    let shiftText = idx % 2 === 0 ? '24th January Morning Shift' : '15th April Evening Shift';
    if (q.title && q.title.includes('Shift')) {
      return q.title;
    }
    return `${examTag} ${yearStr} (Online) ${shiftText}`;
  };

  // Pre-test Modal
  if (showModal) {
    const hasPreviousSession = !!localStorage.getItem(STORAGE_KEY);

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-mono">
        <div className="bg-obsidian border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
          <div className="bg-cyberdark border-b border-white/5 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg uppercase tracking-wider">{test.title || "Practice Mode"}</h2>
              <p className="text-gray-500 text-xs mt-1">Configure Session Parameters</p>
            </div>
            <button onClick={onBackToDashboard} className="text-gray-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 md:p-8 space-y-8 bg-obsidian flex-1 overflow-y-auto">
            {/* Language Preference */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-electric"><HelpCircle className="w-4 h-4"/></span>
                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">Language Preference</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setLanguage('English')} className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border text-sm transition-all ${language === 'English' ? 'bg-electric/10 border-electric text-electric font-bold shadow-[0_0_15px_rgba(0,180,216,0.2)]' : 'bg-cyberdark border-white/5 text-gray-400 hover:bg-white/5'}`}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${language === 'English' ? 'border-electric bg-electric text-obsidian' : 'border-gray-500'}`}>{language === 'English' && <CheckCircle className="w-3 h-3"/>}</div>
                  English
                </button>
                <button onClick={() => setLanguage('Hindi')} className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border text-sm transition-all ${language === 'Hindi' ? 'bg-electric/10 border-electric text-electric font-bold shadow-[0_0_15px_rgba(0,180,216,0.2)]' : 'bg-cyberdark border-white/5 text-gray-400 hover:bg-white/5'}`}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${language === 'Hindi' ? 'border-electric bg-electric text-obsidian' : 'border-gray-500'}`}>{language === 'Hindi' && <CheckCircle className="w-3 h-3"/>}</div>
                  Hindi (हिन्दी)
                </button>
              </div>
            </div>

            {/* Question Order */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-electric"><BrainCircuit className="w-4 h-4"/></span>
                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">Question Order</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div onClick={() => setOrder('Newest first')} className={`border rounded-xl p-4 cursor-pointer flex gap-3 transition-all ${order === 'Newest first' ? 'bg-electric/10 border-electric shadow-[0_0_15px_rgba(0,180,216,0.15)]' : 'bg-cyberdark border-white/5 hover:border-white/20'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${order === 'Newest first' ? 'bg-electric text-obsidian' : 'bg-white/10 text-gray-500'}`}><CheckCircle className="w-3.5 h-3.5"/></div>
                  <div>
                    <div className={`font-bold text-sm ${order === 'Newest first' ? 'text-electric' : 'text-gray-300'}`}>Newest first</div>
                    <div className="text-[10px] text-gray-500 mt-1">Sort: Latest exams first</div>
                  </div>
                </div>
                <div onClick={() => setOrder('Oldest first')} className={`border rounded-xl p-4 cursor-pointer flex gap-3 transition-all ${order === 'Oldest first' ? 'bg-electric/10 border-electric shadow-[0_0_15px_rgba(0,180,216,0.15)]' : 'bg-cyberdark border-white/5 hover:border-white/20'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${order === 'Oldest first' ? 'bg-electric text-obsidian' : 'bg-white/10 text-gray-500'}`}><CheckCircle className="w-3.5 h-3.5"/></div>
                  <div>
                    <div className={`font-bold text-sm ${order === 'Oldest first' ? 'text-electric' : 'text-gray-300'}`}>Oldest first</div>
                    <div className="text-[10px] text-gray-500 mt-1">Sort: Older exams first</div>
                  </div>
                </div>
                <div onClick={() => setOrder('Random')} className={`border rounded-xl p-4 cursor-pointer flex gap-3 transition-all ${order === 'Random' ? 'bg-electric/10 border-electric shadow-[0_0_15px_rgba(0,180,216,0.15)]' : 'bg-cyberdark border-white/5 hover:border-white/20'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${order === 'Random' ? 'bg-electric text-obsidian' : 'bg-white/10 text-gray-500'}`}><CheckCircle className="w-3.5 h-3.5"/></div>
                  <div>
                    <div className={`font-bold text-sm ${order === 'Random' ? 'text-electric' : 'text-gray-300'}`}>Random Shuffle</div>
                    <div className="text-[10px] text-gray-500 mt-1">Randomized order</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue or Restart */}
            <div>
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <span className="text-electric"><Clock className="w-4 h-4"/></span>
                   <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">Session Restore</h3>
                 </div>
                 {hasPreviousSession && <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded border border-emerald-500/20">Previous Data Found</span>}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div onClick={() => { if (hasPreviousSession) setContinueMode('Resume'); }} className={`border rounded-xl p-4 cursor-pointer flex gap-3 transition-all ${!hasPreviousSession ? 'opacity-40 cursor-not-allowed bg-cyberdark border-white/5' : continueMode === 'Resume' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-cyberdark border-white/5 hover:border-white/20'}`}>
                   <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${continueMode === 'Resume' && hasPreviousSession ? 'bg-emerald-500 text-obsidian' : 'bg-white/10 text-gray-500'}`}><CheckCircle className="w-3.5 h-3.5"/></div>
                   <div>
                     <div className={`font-bold text-sm flex items-center gap-2 ${continueMode === 'Resume' && hasPreviousSession ? 'text-emerald-400' : 'text-gray-300'}`}>
                       Resume Session
                     </div>
                     <div className="text-[10px] text-gray-500 mt-1">Restore your progress and answers</div>
                   </div>
                 </div>
                 <div onClick={() => setContinueMode('Start Fresh')} className={`border rounded-xl p-4 cursor-pointer flex gap-3 transition-all ${continueMode === 'Start Fresh' ? 'bg-electric/10 border-electric shadow-[0_0_15px_rgba(0,180,216,0.15)]' : 'bg-cyberdark border-white/5 hover:border-white/20'}`}>
                   <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${continueMode === 'Start Fresh' ? 'bg-electric text-obsidian' : 'bg-white/10 text-gray-500'}`}><CheckCircle className="w-3.5 h-3.5"/></div>
                   <div>
                     <div className={`font-bold text-sm flex items-center gap-2 ${continueMode === 'Start Fresh' ? 'text-electric' : 'text-gray-300'}`}>
                       Start Fresh
                     </div>
                     <div className="text-[10px] text-gray-500 mt-1">Clear all previous answers and history</div>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="p-4 bg-cyberdark border-t border-white/5">
            <button 
              onClick={handleStart}
              className="w-full bg-electric hover:bg-cyan-400 text-obsidian font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,180,216,0.3)]"
            >
              <PlayCircle className="w-5 h-5" /> Initialize Engine
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Session Submit Analytics Dashboard View (Replica of ExamGOAL)
  if (showAnalytics) {
    const correctCount = Object.values(statusMap).filter(s => s === 'correct').length;
    const wrongCount = Object.values(statusMap).filter(s => s === 'wrong').length;
    const skippedCount = Object.values(statusMap).filter(s => s === 'skipped').length;
    const totalAttempted = correctCount + wrongCount;
    const accuracy = totalAttempted > 0 ? ((correctCount / totalAttempted) * 100).toFixed(1) : '0';

    return (
      <div className="min-h-screen bg-[#08090C] text-white flex flex-col font-mono">
        <header className="bg-obsidian border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
             <BarChart2 className="w-6 h-6 text-electric" />
             <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">Practice Session Analytics</h2>
                <p className="text-xs text-gray-500">Summary & Answer Keys</p>
             </div>
          </div>
          <button 
             onClick={onBackToDashboard} 
             className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all uppercase tracking-wider bg-white/5"
          >
             Exit Dashboard
          </button>
        </header>

        <main className="flex-grow max-w-5xl w-full mx-auto p-6 md:p-10 space-y-8 overflow-y-auto">
           {/* Performance Stats Cards */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-obsidian border border-white/5 rounded-xl p-5 flex flex-col justify-center">
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Time Elapsed</span>
                 <span className="text-xl font-bold text-electric">{formatTime(totalTimeSpent)}</span>
              </div>
              <div className="bg-obsidian border border-emerald-500/20 rounded-xl p-5 flex flex-col justify-center bg-emerald-500/[0.02]">
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Correct Answers</span>
                 <span className="text-xl font-bold text-emerald-400">{correctCount} <span className="text-xs text-gray-600 font-medium">/ {questions.length}</span></span>
              </div>
              <div className="bg-obsidian border border-red-500/20 rounded-xl p-5 flex flex-col justify-center bg-red-500/[0.02]">
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Incorrect Answers</span>
                 <span className="text-xl font-bold text-red-400">{wrongCount}</span>
              </div>
              <div className="bg-obsidian border border-purple-500/20 rounded-xl p-5 flex flex-col justify-center bg-purple-500/[0.02]">
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Session Accuracy</span>
                 <span className="text-xl font-bold text-purple-400">{accuracy}%</span>
              </div>
           </div>

           {/* Solution key summary list */}
           <div className="bg-obsidian border border-white/5 rounded-xl p-6 space-y-6">
              <div className="border-b border-white/5 pb-4">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider">Question status & solutions</h3>
                 <p className="text-[10px] text-gray-500 mt-0.5">Click any number below to inspect the question and its solution details.</p>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                 {questions.map((_, idx) => {
                    const status = statusMap[idx];
                    let btnClass = 'bg-cyberdark border-white/5 text-gray-500 hover:border-white/20';
                    
                    if (status === 'correct') {
                      btnClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 border';
                    } else if (status === 'wrong') {
                      btnClass = 'bg-red-500/10 border-red-500/40 text-red-400 border';
                    } else if (status === 'skipped') {
                      btnClass = 'bg-orange-500/10 border-orange-500/40 text-orange-400 border';
                    } else if (status === 'seen') {
                      btnClass = 'bg-blue-500/10 border-blue-500/40 text-blue-400 border';
                    }

                    return (
                       <button
                          key={idx}
                          onClick={() => {
                             setCurrentIdx(idx);
                             setShowSolution(true);
                             setShowAnalytics(false);
                          }}
                          className={`h-11 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${btnClass}`}
                       >
                          <span>Q{idx + 1}</span>
                          <span className="text-[8px] uppercase opacity-75">
                             {status === 'correct' ? 'OK' : status === 'wrong' ? 'ERR' : 'SKIP'}
                          </span>
                       </button>
                    );
                 })}
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                 onClick={handleResetSession}
                 className="flex-1 bg-cyberdark border border-white/10 hover:border-white/20 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all"
              >
                 <RefreshCw className="w-4 h-4" /> Restart Fresh
              </button>
              <button 
                 onClick={onBackToDashboard}
                 className="flex-grow bg-electric hover:bg-cyan-400 text-obsidian font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,180,216,0.2)]"
              >
                 Close Dashboard <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </main>
      </div>
    );
  }

  // Styles injected inline to handle styling equations and options cleanly
  const inlineStyles = `
    .tex2jax_process {
      line-height: 1.8;
      letter-spacing: 0.02em;
    }
    .tex2jax_process math, .tex2jax_process .MathJax {
      margin: 8px 0;
      display: inline-block;
      vertical-align: middle;
    }
  `;

  return (
    <div className="min-h-screen bg-[#08090C] text-white flex flex-col justify-between font-mono select-none">
      <style>{inlineStyles}</style>

      {/* Header bar */}
      <header className="bg-obsidian border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBackToDashboard} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors border border-white/5">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{test?.title || 'Practice Session'}</h3>
            <span className="text-[10px] text-gray-500">Student: {user?.name} | Order: {order}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-electric/10 border border-electric/30 text-electric rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(0,180,216,0.2)]">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </header>

      {/* Main split work-screen */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        {/* Left side: Question display panel */}
        <div className="lg:col-span-3 p-6 md:p-8 overflow-y-auto space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Question status tags */}
            <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                 <span className="text-xs font-bold text-electric uppercase">Question {currentIdx + 1} of {questions.length}</span>
                 <span className={`text-[10px] font-bold px-2 py-1 rounded border ${currentQ.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                   {currentQ.difficulty || "Medium"}
                 </span>
              </div>
              
              {/* Detailed shift/year name displayed prominently at the top */}
              <div className="mt-1">
                 <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-1 rounded font-mono uppercase tracking-wider block md:inline-block">
                    {getDetailedTag(currentQ, currentIdx)}
                 </span>
              </div>
            </div>

            {/* Question Text */}
            <div 
              className="text-sm md:text-base text-platinum leading-relaxed py-4 font-semibold tex2jax_process whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: currentQ.questionText || currentQ.question }}
            />

            {/* Multiple Choice Options */}
            <div className="space-y-3 max-w-2xl">
              {currentQ.options?.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIdx] === oIdx;
                const isCorrect = currentQ.correctOptionIndex === oIdx;
                const showStatus = showSolution;
                
                let boxClass = "border-white/5 bg-cyberdark hover:bg-white/[0.02] text-platinum cursor-pointer";
                let circleClass = "border-gray-600";
                
                if (isSelected) {
                  boxClass = "border-electric bg-electric/10 text-electric font-bold";
                  circleClass = "border-electric text-electric";
                }
                
                if (showStatus) {
                  if (isCorrect) {
                    boxClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold";
                    circleClass = "border-emerald-500 bg-emerald-500 text-obsidian";
                  } else if (isSelected) {
                    boxClass = "border-red-500 bg-red-500/10 text-red-400";
                    circleClass = "border-red-500 bg-red-500 text-obsidian";
                  } else {
                    boxClass = "border-white/5 bg-cyberdark opacity-50 cursor-not-allowed text-gray-500";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs transition-all flex items-start gap-4 ${boxClass}`}
                  >
                    <span className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center text-[10px] mt-0.5 ${circleClass}`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="tex2jax_process leading-relaxed" dangerouslySetInnerHTML={{ __html: opt }} />
                  </button>
                );
              })}
            </div>

            {/* Solution Display */}
            {showSolution && (
              <div className="mt-8 p-6 bg-emerald-950/20 border border-emerald-900/50 rounded-xl animate-fade-in">
                <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4" /> Solution & Explanation
                </h4>
                <div 
                  className="text-xs md:text-sm text-gray-300 leading-relaxed tex2jax_process whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: currentQ.solution || currentQ.explanation || "No detailed explanation available." }}
                />
              </div>
            )}
          </div>

          {/* Action buttons footer */}
          <div className="border-t border-white/5 pt-6 flex flex-wrap justify-between gap-4 mt-8">
            <div className="flex gap-2">
               <button 
                 onClick={handlePrev} 
                 disabled={currentIdx === 0} 
                 className="px-4 py-2 border border-white/10 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 flex items-center gap-1 transition-all"
               >
                 <ChevronLeft className="w-4 h-4"/> Prev
               </button>
               <button 
                 onClick={handleNext} 
                 disabled={currentIdx === questions.length - 1} 
                 className="px-4 py-2 border border-white/10 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 flex items-center gap-1 transition-all"
               >
                 Next <ChevronRight className="w-4 h-4"/>
               </button>
            </div>
            
            {!showSolution ? (
               <button 
                 onClick={handleCheckAnswer}
                 disabled={selectedAnswers[currentIdx] === undefined}
                 className="bg-electric hover:bg-cyan-400 text-obsidian px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,180,216,0.3)] disabled:opacity-50 transition-all"
               >
                 Check Answer
               </button>
            ) : (
               <button 
                 onClick={handleNext}
                 className="bg-emerald-500 hover:bg-emerald-400 text-obsidian px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
               >
                 Continue <ChevronRight className="w-4 h-4" />
               </button>
            )}
          </div>
        </div>

        {/* Right side: Question status palette map sidebar */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-white/5 bg-obsidian/50 p-6 flex flex-col overflow-hidden justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-4 mb-4">
              Session Progress
            </h4>
            
            <div className="overflow-y-auto max-h-[45vh] custom-scrollbar pr-2 mb-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => {
                  const status = statusMap[idx];
                  let btnClass = 'bg-cyberdark border-white/5 text-gray-400';
                  
                  if (idx === currentIdx) {
                    btnClass = 'bg-obsidian border-electric text-electric border-2 shadow-[0_0_10px_rgba(0,180,216,0.2)] scale-110 z-10';
                  } else if (status === 'correct') {
                    btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 border';
                  } else if (status === 'wrong') {
                    btnClass = 'bg-red-500/20 border-red-500 text-red-400 border';
                  } else if (status === 'skipped') {
                    btnClass = 'bg-orange-500/20 border-orange-500 text-orange-400 border';
                  } else if (status === 'seen') {
                    btnClass = 'bg-blue-500/20 border-blue-500 text-blue-400 border';
                  }
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                         setCurrentIdx(idx);
                         setShowSolution(status === 'correct' || status === 'wrong');
                      }}
                      className={`h-9 w-full rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${btnClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Palette legends */}
            <div className="space-y-3 border-t border-white/5 pt-4 text-[10px] text-gray-400 font-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-emerald-500/20 border border-emerald-500 rounded-sm" /> Correct
                </div>
                <span className="text-white font-bold">{Object.values(statusMap).filter(s => s === 'correct').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-red-500/20 border border-red-500 rounded-sm" /> Incorrect
                </div>
                <span className="text-white font-bold">{Object.values(statusMap).filter(s => s === 'wrong').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-orange-500/20 border border-orange-500 rounded-sm" /> Skipped
                </div>
                <span className="text-white font-bold">{Object.values(statusMap).filter(s => s === 'skipped').length}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-4 mt-auto">
             <button
                onClick={handleSubmitSession}
                className="w-full py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 flex items-center justify-center gap-2"
             >
                <AlertTriangle className="w-4 h-4" /> End Session & Submit
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}
