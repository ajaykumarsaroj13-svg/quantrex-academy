import React, { useState, useEffect } from 'react';
import Clock from 'lucide-react/dist/esm/icons/clock';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import HelpCircle from 'lucide-react/dist/esm/icons/help-circle';
import MistakeBooster from '../components/MistakeBooster';

export default function TestSystem({ test, user, onBackToDashboard }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIdx: optionIdx }
  const [statusMap, setStatusMap] = useState({}); // { questionIdx: 'visited' | 'answered' | 'review' }
  const [timeLeft, setTimeLeft] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [activeSubject, setActiveSubject] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
        setIsFullscreen(true); // Fallback
      });
    } else {
      setIsFullscreen(true); // Fallback for unsupported browsers
    }
  };

  useEffect(() => {
    if (!test) return;
    
    // Setup test parameters
    const mockQuestions = test.questions || [
      {
        id: 'q1',
        questionText: 'Find the limit of lim_{x -> 0} (cos(x))^(1 / x^2).',
        options: ['e', 'e^(-1/2)', 'e^(1/2)', '1'],
        correctOption: 1,
        marks: 4,
        negativeMarks: -1,
        subject: 'Mathematics',
        explanation: 'Take log: ln(y) = 1/x^2 * ln(cos x). Applying expansions, we get ln(y) -> -1/2. Thus y = e^(-1/2).'
      },
      {
        id: 'q2',
        questionText: 'A particle of mass m moves under the action of a central force. If the potential energy is U(r) = kr^2, find the frequency of small radial oscillations.',
        options: ['sqrt(k/m)', 'sqrt(2k/m)', '2*sqrt(k/m)', 'sqrt(4k/m)'],
        correctOption: 3,
        marks: 4,
        negativeMarks: -1,
        subject: 'Physics',
        explanation: 'The effective potential energy is U_eff = L^2 / (2mr^2) + kr^2. Setting dU_eff/dr = 0 gives equilibrium. Setting d^2U_eff/dr^2 gives the oscillation frequency omega = sqrt(4k/m).'
      },
      {
        id: 'q3',
        questionText: 'Identify the correct order of acidic strength for the following oxyacids of chlorine:',
        options: ['HClO < HClO2 < HClO3 < HClO4', 'HClO4 < HClO3 < HClO2 < HClO', 'HClO3 < HClO4 < HClO2 < HClO', 'HClO2 < HClO < HClO3 < HClO4'],
        correctOption: 0,
        marks: 4,
        negativeMarks: -1,
        subject: 'Chemistry',
        explanation: 'Acidic strength increases with the oxidation state of the central atom (Cl): HClO (+1), HClO2 (+3), HClO3 (+5), HClO4 (+7). Higher oxidation states stabilize the conjugate base through resonance.'
      }
    ];

    let initialTimeLeft = (test.durationMinutes || test.duration || 30) * 60;
    let initialCurrentIdx = 0;
    let initialSelectedAnswers = {};
    let initialStatusMap = { 0: 'visited' };
    let initialActiveSubject = '';

    const savedProgress = localStorage.getItem(`quantrex_test_progress_${test.id}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        if (parsed.timeLeft !== undefined) initialTimeLeft = parsed.timeLeft;
        if (parsed.currentIdx !== undefined) initialCurrentIdx = parsed.currentIdx;
        if (parsed.selectedAnswers) initialSelectedAnswers = parsed.selectedAnswers;
        if (parsed.statusMap) initialStatusMap = parsed.statusMap;
        if (parsed.activeSubject) initialActiveSubject = parsed.activeSubject;
      } catch(e) {}
    }

    setQuestions(mockQuestions);
    setTimeLeft(initialTimeLeft);
    setCurrentIdx(initialCurrentIdx);
    setSelectedAnswers(initialSelectedAnswers);
    setStatusMap(initialStatusMap);
    
    if (mockQuestions.length > 0) {
      setActiveSubject(initialActiveSubject || mockQuestions[0].subject || 'Mathematics');
    }
  }, [test]);

  // Persist state
  useEffect(() => {
    if (!test || examSubmitted) return;
    const saveState = {
      selectedAnswers,
      statusMap,
      timeLeft,
      currentIdx,
      activeSubject
    };
    localStorage.setItem(`quantrex_test_progress_${test.id}`, JSON.stringify(saveState));
  }, [selectedAnswers, statusMap, timeLeft, currentIdx, activeSubject, test, examSubmitted]);

  // Sync activeSubject when user navigates using Prev/Next or question palette
  useEffect(() => {
    if (questions[currentIdx]) {
      setActiveSubject(questions[currentIdx].subject || 'Mathematics');
    }
  }, [currentIdx, questions]);

  // Exam Timer Countdown
  useEffect(() => {
    if (examSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, examSubmitted]);

  const handleSelectOption = (optionIdx) => {
    const currentQ = questions[currentIdx];
    const t = (currentQ?.type || currentQ?.questionType || '').toUpperCase().trim();
    const isMultiCorrect = t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'MULTIPLE_CORRECT' || t === 'MULTIPLE CORRECT' || t === 'MCQ (MULTIPLE CORRECT)';

    setSelectedAnswers(prev => {
      if (isMultiCorrect) {
        const currentAns = Array.isArray(prev[currentIdx]) ? prev[currentIdx] : [];
        const newAns = currentAns.includes(optionIdx) ? currentAns.filter(i => i !== optionIdx) : [...currentAns, optionIdx].sort((a,b)=>a-b);
        return { ...prev, [currentIdx]: newAns.length > 0 ? newAns : undefined };
      } else {
        return { ...prev, [currentIdx]: optionIdx };
      }
    });
    setStatusMap(prev => ({ ...prev, [currentIdx]: 'answered' }));
  };

  const handleClearResponse = () => {
    setSelectedAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentIdx];
      return updated;
    });
    setStatusMap(prev => ({ ...prev, [currentIdx]: 'visited' }));
  };

  const handleMarkForReview = () => {
    setStatusMap(prev => ({ ...prev, [currentIdx]: 'review' }));
    handleNext();
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (!statusMap[nextIdx]) {
        setStatusMap(prev => ({ ...prev, [nextIdx]: 'visited' }));
      }
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmitExam = async () => {
    setExamSubmitted(true);
    if (test?.id) {
      localStorage.removeItem(`quantrex_test_progress_${test.id}`);
      localStorage.removeItem('quantrex_active_custom_test');
    }
    
    // Evaluate answers locally to make the sandbox fully responsive
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const evaluatedAnswers = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1;
      if (selected === -1) {
        skipped++;
        return { isCorrect: false, selected: -1 };
      } else if (selected === q.correctOption) {
        score += q.marks || 4;
        correct++;
        return { isCorrect: true, selected };
      } else {
        score += q.negativeMarks || -1;
        wrong++;
        return { isCorrect: false, selected };
      }
    });

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 4), 0);
    const mockResult = {
      score,
      totalMarks,
      correctAnswers: correct,
      wrongAnswers: wrong,
      skippedAnswers: skipped,
      percentile: Math.min(100, Math.max(0, 95 + (score / totalMarks) * 5)),
      rank: Math.floor(Math.random() * 20) + 1,
      evaluatedAnswers
    };

    setExamResult(mockResult);

    // Call backend API (optional fallback handling)
    try {
      const answersArray = Object.keys(selectedAnswers).map(idx => ({
        questionId: questions[idx].id,
        selectedOption: selectedAnswers[idx]
      }));

      await fetch(`/api/tests/${test.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers: answersArray })
      });
    } catch (e) {
      console.log('Online test submit skipped, result cached in sandbox.');
    }
  };

  const formatTimer = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (examSubmitted && examResult) {
    return (
      <div className="min-h-screen bg-obsidian py-12 px-4 md:px-12 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-cyberdark border border-white/5 p-8 rounded-2xl shadow-2xl space-y-8 glass-panel select-none">
          <div className="text-center space-y-2">
            <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider font-display">Test Submitted Successfully</h2>
            <p className="text-xs text-gray-500 font-mono">IIT-JEE Evaluation Portal — Auto Ranking Engine</p>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-center">
            <div className="bg-obsidian/60 border border-white/5 p-4 rounded-xl">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Total Score</span>
              <span className="text-lg font-bold text-white">{examResult.score} / {examResult.totalMarks}</span>
            </div>
            <div className="bg-obsidian/60 border border-white/5 p-4 rounded-xl">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Percentile</span>
              <span className="text-lg font-bold text-electric">{examResult.percentile.toFixed(2)} %ile</span>
            </div>
            <div className="bg-obsidian/60 border border-white/5 p-4 rounded-xl">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Predicted Rank</span>
              <span className="text-lg font-bold text-gold">AIR {examResult.rank}</span>
            </div>
            <div className="bg-obsidian/60 border border-white/5 p-4 rounded-xl">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Correct / Wrong</span>
              <span className="text-lg font-bold text-emerald-400">{examResult.correctAnswers} <span className="text-gray-500">/</span> <span className="text-red-400">{examResult.wrongAnswers}</span></span>
            </div>
          </div>

          {/* Subject-Wise Analysis Grid */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Subject-Wise Performance Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {['Mathematics', 'Physics', 'Chemistry'].map(subj => {
                const subjQuestions = questions.filter(q => q.subject?.toLowerCase() === subj.toLowerCase());
                if (subjQuestions.length === 0) return null;
                
                let subjScore = 0;
                let subjCorrect = 0;
                let subjWrong = 0;
                let subjSkipped = 0;
                
                subjQuestions.forEach(q => {
                  const qIdx = questions.indexOf(q);
                  const ans = selectedAnswers[qIdx] !== undefined ? selectedAnswers[qIdx] : -1;
                  if (ans === -1) {
                    subjSkipped++;
                  } else if (ans === q.correctOption) {
                    subjScore += q.marks || 4;
                    subjCorrect++;
                  } else {
                    subjScore += q.negativeMarks || -1;
                    subjWrong++;
                  }
                });
                
                const subjTotal = subjQuestions.reduce((sum, q) => sum + (q.marks || 4), 0);
                const accuracy = (subjCorrect + subjWrong) > 0 ? ((subjCorrect / (subjCorrect + subjWrong)) * 100).toFixed(0) : 0;
                
                return (
                  <div key={subj} className="bg-obsidian/60 border border-white/5 p-4 rounded-xl space-y-2">
                    <span className="text-glow-blue text-xs font-bold text-electric uppercase block mb-1">{subj}</span>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Score:</span>
                      <span className="text-white font-bold">{subjScore} / {subjTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Correct/Wrong:</span>
                      <span className="text-emerald-400 font-bold">{subjCorrect} <span className="text-gray-500">/</span> <span className="text-red-400">{subjWrong}</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Accuracy:</span>
                      <span className="text-electric font-bold">{accuracy}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Solutions list grouped by subject */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Question Analysis & Solutions</h3>
            {['Mathematics', 'Physics', 'Chemistry'].map(subj => {
              const subjQuestions = questions.filter(q => q.subject?.toLowerCase() === subj.toLowerCase());
              if (subjQuestions.length === 0) return null;
              
              return (
                <div key={subj} className="space-y-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <h4 className="text-glow-gold text-xs font-bold text-gold uppercase tracking-wider border-l-2 border-gold pl-2 font-mono">
                    {subj} Section
                  </h4>
                  <div className="space-y-4">
                    {subjQuestions.map(q => {
                      const idx = questions.indexOf(q);
                      const studentAns = selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1;
                      const isCorrect = studentAns === q.correctOption;
                      return (
                        <div key={idx} className={`p-5 rounded-xl border font-mono text-xs ${isCorrect ? 'bg-emerald-950/10 border-emerald-900/40' : studentAns === -1 ? 'bg-white/[0.02] border-white/5' : 'bg-red-950/10 border-red-900/40'}`}>
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-white">Question {idx + 1}</span>
                            <span className={`text-[10px] font-bold uppercase ${isCorrect ? 'text-emerald-400' : studentAns === -1 ? 'text-gray-500' : 'text-red-400'}`}>
                              {isCorrect ? 'Correct (+4)' : studentAns === -1 ? 'Skipped' : 'Incorrect (-1)'}
                            </span>
                          </div>

                          <p className="text-platinum leading-relaxed mb-4">{q.questionText}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            {q.options.map((opt, oIdx) => (
                              <div 
                                key={oIdx}
                                className={`p-2.5 rounded border text-[11px] ${
                                  oIdx === q.correctOption
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                                    : oIdx === studentAns
                                      ? 'bg-red-500/10 border-red-500 text-red-400'
                                      : 'bg-obsidian/40 border-white/5 text-gray-500'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 p-3.5 bg-obsidian/60 border border-white/5 rounded-lg text-gray-400 leading-relaxed text-[11px]">
                            <span className="text-gold font-bold uppercase block mb-1">A.K. Sir Solution Strategy:</span>
                            {q.explanation}
                          </div>
                          {!isCorrect && (
                            <div className="mt-4">
                              <MistakeBooster originalQuestion={q} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onBackToDashboard}
            className="w-full py-4 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-sm tracking-wider uppercase rounded-xl transition-all"
          >
            Return to Student Portal
          </button>
        </div>
      </div>
    );
  }

  // Active exam-taking mode layout
  const availableSubjects = [...new Set(questions.map(q => q.subject || 'Mathematics'))];
  const currentQ = questions[currentIdx];

  if (!isFullscreen && !examSubmitted) {
    return (
      <div className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-6 animate-pulse" />
        <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Test Paused</h2>
        <p className="text-gray-400 mb-8 max-w-md">For the best experience and to prevent cheating, the test must be taken in full screen mode.</p>
        <button 
          onClick={enterFullscreen}
          className="bg-electric text-black font-black uppercase tracking-wider px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-400 transition-colors"
        >
          Resume Test in Full Screen
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-white font-sans overflow-hidden select-none">
      {/* Top Header Panel */}
      <header className="bg-obsidian border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{test?.title || 'JEE Test'}</h3>
          <span className="text-[10px] text-gray-500">Student session: {user?.name}</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-950/20 border border-red-900 text-red-400 rounded-lg text-xs font-bold animate-pulse">
          <Clock className="h-4.5 w-4.5" />
          <span>TIME LEFT: {formatTimer(timeLeft)}</span>
        </div>
      </header>

      {/* Subject Navigation Tabs */}
      {(() => {
        const availableSubjects = Array.from(new Set(questions.map(q => q.subject || 'Mathematics')));
        if (availableSubjects.length <= 1) return null;
        return (
          <div className="bg-[#0e1015] border-b border-white/5 px-6 md:px-12 py-2.5 flex items-center gap-2 overflow-x-auto">
            {availableSubjects.map(subj => {
              const isActive = activeSubject?.toLowerCase() === subj.toLowerCase();
              return (
                <button
                  key={subj}
                  onClick={() => {
                    setActiveSubject(subj);
                    const firstIdx = questions.findIndex(q => (q.subject || 'Mathematics').toLowerCase() === subj.toLowerCase());
                    if (firstIdx !== -1) {
                      setCurrentIdx(firstIdx);
                    }
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border ${
                    isActive
                      ? 'bg-electric/10 border-electric text-electric shadow-[0_0_12px_rgba(6,182,212,0.15)] font-bold'
                      : 'bg-cyberdark border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {subj}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Main split work-screen */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        {/* Left side: Question display panel */}
        <div className="lg:col-span-3 p-6 md:p-8 overflow-y-auto space-y-6 flex flex-col justify-between">
          {currentQ ? (
            <div className="space-y-6">
              {/* Question status tags */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-xs font-bold text-electric uppercase">Question {currentIdx + 1} of {questions.length}</span>
                <div className="flex gap-4 text-[10px] text-gray-500">
                  <span>Marks: <span className="text-emerald-400">+{currentQ.marks || 4}</span></span>
                  <span>Negative: <span className="text-red-400">{currentQ.negativeMarks || -1}</span></span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm md:text-base text-platinum leading-relaxed py-4 font-semibold">
                {currentQ.questionText}
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3 max-w-2xl">
                {currentQ.options.map((opt, oIdx) => {
                  const t = (currentQ?.type || currentQ?.questionType || '').toUpperCase().trim();
                  const isMultiCorrect = t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'MULTIPLE_CORRECT' || t === 'MULTIPLE CORRECT' || t === 'MCQ (MULTIPLE CORRECT)';
                  
                  const isSelected = Array.isArray(selectedAnswers[currentIdx]) ? selectedAnswers[currentIdx].includes(oIdx) : selectedAnswers[currentIdx] === oIdx;
                  
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-4 rounded-xl border text-xs transition-all flex items-center gap-3 ${isSelected ? 'border-electric bg-electric/10 text-electric font-bold' : 'border-white/5 bg-cyberdark hover:bg-white/[0.02] text-platinum'}`}
                    >
                      <span className={`h-4 w-4 ${isMultiCorrect ? 'rounded-md' : 'rounded-full'} border flex items-center justify-center text-[10px] ${isSelected ? 'border-electric text-electric' : 'border-gray-600'}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">Loading exam questions...</div>
          )}

          {/* Action buttons footer */}
          <div className="border-t border-white/5 pt-6 flex flex-wrap justify-between gap-4">
            <div className="flex gap-2">
              <button 
                onClick={handleClearResponse}
                className="px-5 py-2.5 bg-cyberdark border border-white/5 text-gray-400 hover:text-white rounded-lg text-xs tracking-wider uppercase transition-colors"
              >
                Clear Response
              </button>
              <button 
                onClick={handleMarkForReview}
                className="px-5 py-2.5 bg-indigo-950/20 border border-indigo-900 text-indigo-400 hover:bg-indigo-950/40 rounded-lg text-xs tracking-wider uppercase transition-colors"
              >
                Mark For Review
              </button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2.5 bg-cyberdark border border-white/5 text-gray-400 disabled:opacity-50 hover:text-white rounded-lg text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleNext}
                disabled={currentIdx === questions.length - 1}
                className="px-4 py-2.5 bg-cyberdark border border-white/5 text-gray-400 disabled:opacity-50 hover:text-white rounded-lg text-xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button 
                onClick={handleSubmitExam}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-obsidian font-bold text-xs tracking-wider uppercase rounded-lg transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Question status palette map sidebar */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-white/5 bg-obsidian/50 p-6 space-y-6 overflow-y-auto">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            Question Palette {activeSubject ? `(${activeSubject})` : ''}
          </h4>
          
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const qSubj = q.subject || 'Mathematics';
              if (activeSubject && qSubj.toLowerCase() !== activeSubject.toLowerCase()) return null;
              
              const status = statusMap[idx];
              let btnClass = 'bg-cyberdark border-white/5 text-gray-400';
              if (idx === currentIdx) {
                btnClass = 'bg-obsidian border-electric text-electric border-2';
              } else if (status === 'answered') {
                btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 border';
              } else if (status === 'review') {
                btnClass = 'bg-indigo-500/20 border-indigo-500 text-indigo-400 border';
              } else if (status === 'visited') {
                btnClass = 'bg-red-500/20 border-red-500 text-red-400 border';
              }
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette legends */}
          <div className="space-y-2 border-t border-white/5 pt-4 text-[10px] text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-emerald-500/20 border border-emerald-500 rounded" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-indigo-500/20 border border-indigo-500 rounded" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-red-500/20 border border-red-500 rounded" />
              <span>Visited (Not Answered)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-cyberdark border border-white/5 rounded" />
              <span>Not Visited</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
