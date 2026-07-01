import React, { useState, useEffect } from 'react';
import MistakeBooster from '../components/MistakeBooster';
import { fixExamGoalHtml } from '../utils/htmlCleaner';

export default function NtaTestInterface({ test, user, onBackToDashboard, setActivePage, mode = 'test', isLight = true }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { qIdx: selectedOptionIdx }
  const [statusMap, setStatusMap] = useState({}); // { qIdx: 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked' }
  const [timeSpentMap, setTimeSpentMap] = useState({}); // { qIdx: secondsSpent }
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [questionResults, setQuestionResults] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Section Splitting Helpers
  const mcqIndices = questions.map((q, idx) => ({ q, idx })).filter(item => Array.isArray(item.q.options) && item.q.options.length > 0).map(item => item.idx);
  const numericalIndices = questions.map((q, idx) => ({ q, idx })).filter(item => !Array.isArray(item.q.options) || item.q.options.length === 0).map(item => item.idx);
  
  const currentQ = questions[currentIdx];
  const isCurrentMcq = currentQ && Array.isArray(currentQ.options) && currentQ.options.length > 0;
  const currentSection = isCurrentMcq ? 'A' : 'B';
  
  const jumpToSection = (sec) => {
    if (sec === 'A') {
      if (mcqIndices.length > 0) setCurrentIdx(mcqIndices[0]);
    } else {
      if (numericalIndices.length > 0) setCurrentIdx(numericalIndices[0]);
    }
  };

  // Trigger MathJax re-render when question changes
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
  }, [currentIdx, questions, showExplanation, isSubmitted]);

  useEffect(() => {
    if (test && test.questions) {
      // Sort questions: MCQs first, Numericals second
      const sorted = [...test.questions].sort((a, b) => {
        const aIsMcq = Array.isArray(a.options) && a.options.length > 0;
        const bIsMcq = Array.isArray(b.options) && b.options.length > 0;
        if (aIsMcq && !bIsMcq) return -1;
        if (!aIsMcq && bIsMcq) return 1;
        return 0;
      });
      setQuestions(sorted);
      
      const savedData = localStorage.getItem(`nta_test_progress_${test.id}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setAnswers(parsed.answers || {});
        setStatusMap(parsed.statusMap || {});
        setTimeSpentMap(parsed.timeSpentMap || {});
        setTimeLeft(parsed.timeLeft || (test.durationMinutes || 180) * 60);
        setCurrentIdx(parsed.currentIdx || 0);
      } else {
        setTimeLeft((test.durationMinutes || 180) * 60);
        const initialStatus = {};
        sorted.forEach((_, i) => initialStatus[i] = 'not_visited');
        initialStatus[0] = 'not_answered';
        setStatusMap(initialStatus);
      }
    }
  }, [test]);

  // Save progress on state changes
  useEffect(() => {
    if (test && test.id && !isSubmitted) {
      const progress = {
        answers,
        statusMap,
        timeSpentMap,
        timeLeft,
        currentIdx
      };
      localStorage.setItem(`nta_test_progress_${test.id}`, JSON.stringify(progress));
    }
  }, [answers, statusMap, timeSpentMap, timeLeft, currentIdx, isSubmitted, test]);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentMap(prev => ({
        ...prev,
        [currentIdx]: (prev[currentIdx] || 0) + 1
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, currentIdx]);

  const handleSaveAndNext = () => {
    if (answers[currentIdx] !== undefined) {
      setStatusMap(prev => ({ ...prev, [currentIdx]: 'answered' }));
    } else {
      setStatusMap(prev => ({ ...prev, [currentIdx]: 'not_answered' }));
    }
    goNext();
  };

  const handleClearResponse = () => {
    const updatedAns = { ...answers };
    delete updatedAns[currentIdx];
    setAnswers(updatedAns);
  };

  const handleSaveAndMarkForReview = () => {
    if (answers[currentIdx] !== undefined) {
      setStatusMap(prev => ({ ...prev, [currentIdx]: 'answered_marked' }));
    } else {
      setStatusMap(prev => ({ ...prev, [currentIdx]: 'marked' }));
    }
    goNext();
  };

  const handleMarkForReviewAndNext = () => {
    setStatusMap(prev => ({ ...prev, [currentIdx]: 'marked' }));
    goNext();
  };

  const goNext = () => {
    setShowExplanation(false);
    if (currentIdx < questions.length - 1) {
      const nextId = currentIdx + 1;
      setCurrentIdx(nextId);
      if (statusMap[nextId] === 'not_visited') {
        setStatusMap(prev => ({ ...prev, [nextId]: 'not_answered' }));
      }
    }
  };

  const jumpToQuestion = (idx) => {
    setShowExplanation(false);
    setCurrentIdx(idx);
    if (statusMap[idx] === 'not_visited') {
      setStatusMap(prev => ({ ...prev, [idx]: 'not_answered' }));
    }
  };

  const handleSubmit = () => {
    let finalScore = 0;
    const results = questions.map((q, idx) => {
      let correctIdx = q.correctOption;
      if (typeof correctIdx === 'string') {
        correctIdx = correctIdx.charCodeAt(0) - 65;
      }
      
      const isAttempted = answers[idx] !== undefined;
      let isCorrect = false;
      
      if (isAttempted) {
        if (answers[idx] === correctIdx) {
          finalScore += 4;
          isCorrect = true;
        } else {
          finalScore -= 1;
        }
      }

      return {
        questionId: idx,  // Always use index for reliable lookup
        isAttempted,
        isCorrect,
        userAnswer: answers[idx],
        timeSpent: timeSpentMap[idx] || 0
      };
    });

    setScore(finalScore);
    setQuestionResults(results);
    setIsSubmitted(true);
    if (test && test.id) {
      localStorage.removeItem(`nta_test_progress_${test.id}`);

      // Build full per-question data for reattempt feature
      const perQuestionData = questions.map((q, idx) => {
        const r = results[idx];
        return {
          idx,
          questionId: q.id || idx,
          questionText: q.questionText || q.question || '',
          options: q.options || [],
          type: q.type || (Array.isArray(q.options) && q.options.length > 0 ? 'mcq' : 'integer'),
          correctOption: q.correctOption,
          correctAnswer: q.correctAnswer,
          correctOptionsArray: q.correctOptionsArray || [],
          explanation: q.explanation || q.solution || '',
          subject: q.subject || '',
          chapter: q.chapter || '',
          isAttempted: r?.isAttempted || false,
          isCorrect: r?.isCorrect || false,
          userAnswer: r?.userAnswer,
          timeSpent: r?.timeSpent || 0,
        };
      });

      const resultRecord = {
        testId: test.id,
        testTitle: test.title || 'Untitled Test',
        testType: test.examType || test.type || 'JEE Main',
        submittedAt: new Date().toISOString(),
        score: finalScore,
        maxMarks,
        correct: correctCount,
        incorrect: incorrectCount,
        unattempted: unattemptedCount,
        totalQuestions: totalQ,
        questions: perQuestionData,  // Full question data for reattempt
      };
      try {
        // Save individual result (always kept, never auto-deleted)
        localStorage.setItem(`quantrex_test_result_${test.id}`, JSON.stringify(resultRecord));

        // Also maintain a master list (summary only, no questions to keep it small)
        const summaryRecord = { ...resultRecord, questions: undefined };
        const masterRaw = localStorage.getItem('quantrex_all_test_results');
        const masterList = masterRaw ? JSON.parse(masterRaw) : [];
        const filtered = masterList.filter(r => r.testId !== test.id);
        filtered.unshift(summaryRecord);
        localStorage.setItem('quantrex_all_test_results', JSON.stringify(filtered));
      } catch(e) { /* ignore quota errors */ }
    }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    const totalQuestions = questions.length;
    let correct = 0;
    let incorrect = 0;
    
    questionResults.forEach(qr => {
       if (qr.isAttempted) {
          if (qr.isCorrect) correct++;
          else incorrect++;
       }
    });

    let secACorrect = 0, secAIncorrect = 0, secAAttempted = 0;
    let secBCorrect = 0, secBIncorrect = 0, secBAttempted = 0;

    questions.forEach((q, i) => {
      const qr = questionResults.find(r => r.questionId === (q.id || i));
      const isMcq = Array.isArray(q.options) && q.options.length > 0;
      if (qr?.isAttempted) {
        if (isMcq) {
          secAAttempted++;
          if (qr.isCorrect) secACorrect++; else secAIncorrect++;
        } else {
          secBAttempted++;
          if (qr.isCorrect) secBCorrect++; else secBIncorrect++;
        }
      }
    });

    const secATotal = mcqIndices.length;
    const secBTotal = numericalIndices.length;

    return (
      <div className={`min-h-screen ${isLight ? 'bg-[#f8f9fa] text-slate-900' : 'bg-[#0a0a0c] text-white'} font-sans p-6 overflow-y-auto`}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className={`flex justify-between items-center p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#151515] border-white/10'}`}>
            <div>
              <h1 className="text-3xl font-black mb-2">Test Result</h1>
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Detailed Analysis & Solutions</p>
            </div>
            <button onClick={() => onBackToDashboard({
              testId: test?.id || test?._id,
              score,
              totalMarks: questions.length * 4,
              answers,
              questionResults,
              questions: questions
            })} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md">
              Back to Dashboard
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border text-center ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#151515] border-white/10'}`}>
              <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Total Score</div>
              <div className="text-4xl font-black text-blue-500">{score} <span className="text-lg text-gray-500">/ {totalQuestions * 4}</span></div>
            </div>
            <div className={`p-6 rounded-2xl border text-center ${isLight ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-900/20 border-emerald-500/30'}`}>
              <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Correct</div>
              <div className={`text-4xl font-black ${isLight ? 'text-emerald-600' : 'text-emerald-500'}`}>{correct}</div>
            </div>
            <div className={`p-6 rounded-2xl border text-center ${isLight ? 'bg-red-50 border-red-100' : 'bg-red-900/20 border-red-500/30'}`}>
              <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-red-700' : 'text-red-400'}`}>Incorrect</div>
              <div className={`text-4xl font-black ${isLight ? 'text-red-600' : 'text-red-500'}`}>{incorrect}</div>
            </div>
          </div>

          {/* Section-wise Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secATotal > 0 && (
              <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#151515] border-white/10'}`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500 mb-4 border-b border-blue-500/20 pb-2 flex justify-between items-center">
                  <span>Section A (MCQ)</span>
                  <span className="text-xs text-gray-500 font-semibold">{secAAttempted} / {secATotal} Attempted</span>
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Correct</div>
                    <div className="text-lg font-black text-emerald-500">{secACorrect}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Incorrect</div>
                    <div className="text-lg font-black text-red-500">{secAIncorrect}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Score</div>
                    <div className="text-lg font-black text-blue-500">{(secACorrect * 4) - secAIncorrect}</div>
                  </div>
                </div>
              </div>
            )}
            
            {secBTotal > 0 && (
              <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#151515] border-white/10'}`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500 mb-4 border-b border-blue-500/20 pb-2 flex justify-between items-center">
                  <span>Section B (Numerical)</span>
                  <span className="text-xs text-gray-500 font-semibold">{secBAttempted} / {secBTotal} Attempted</span>
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Correct</div>
                    <div className="text-lg font-black text-emerald-500">{secBCorrect}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Incorrect</div>
                    <div className="text-lg font-black text-red-500">{secBIncorrect}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Score</div>
                    <div className="text-lg font-black text-blue-500">{(secBCorrect * 4) - secBIncorrect}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Solutions List */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b border-gray-500/20 pb-2">Solutions & Explanations</h2>
            {questions.map((q, i) => {
              // Use direct index access — arrays are parallel and index-aligned
              const qr = questionResults[i];
              const isAttempted = qr?.isAttempted;
              const isCorrect = qr?.isCorrect;
              const ua = qr?.userAnswer;
              
              let statusBg = isLight ? 'bg-slate-100 text-slate-600' : 'bg-gray-800 text-gray-400';
              let statusText = 'Unattempted';
              if (isAttempted) {
                 if (isCorrect) {
                   statusBg = isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-900/40 text-emerald-400';
                   statusText = 'Correct (+4)';
                 } else {
                   statusBg = isLight ? 'bg-red-100 text-red-700' : 'bg-red-900/40 text-red-400';
                   statusText = `Incorrect (${q.negativeMarks || -1})`;
                 }
              }

              return (
                <div key={i} className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#151515] border-white/10'}`}>
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-500/20">
                    <span className="font-black text-lg">Question {i + 1}</span>
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusBg}`}>{statusText}</span>
                  </div>
                  
                  <div className="prose max-w-none mb-6">
                    <div dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(q.questionText || q.question) }} className="tex2jax_process text-base" />
                  </div>

                  {q.type === 'integer' || q.options?.length === 0 ? (
                    <div className="mb-6 flex flex-wrap gap-4">
                      <div className={`p-4 rounded-xl border flex-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'}`}>
                        <span className="text-xs font-bold text-gray-500 block mb-1">Correct Answer</span>
                        <span className="font-bold text-emerald-500">{typeof q.correctAnswer === 'object' && q.correctAnswer !== null ? (q.correctAnswer.en || JSON.stringify(q.correctAnswer)) : (q.correctAnswer || (typeof q.correctOption === 'object' && q.correctOption !== null ? (q.correctOption.en || JSON.stringify(q.correctOption)) : q.correctOption))}</span>
                      </div>
                      {isAttempted && (
                        <div className={`p-4 rounded-xl border flex-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'}`}>
                          <span className="text-xs font-bold text-gray-500 block mb-1">Your Answer</span>
                          <span className={`font-bold ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>{typeof ua === 'object' && ua !== null ? (ua.en || JSON.stringify(ua)) : ua}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {q.options?.map((opt, oIdx) => {
                        let isCorrectOpt = false;
                        if (q.questionType === 'MULTI_CORRECT' || q.questionType === 'MCQM') {
                           isCorrectOpt = (q.correctOptionsArray || []).includes(oIdx);
                        } else {
                           let cIdx = q.correctOption;
                           if (typeof cIdx === 'string') cIdx = cIdx.toUpperCase().charCodeAt(0) - 65;
                           isCorrectOpt = cIdx === oIdx;
                        }
                        
                        let isUserOpt = false;
                        if (Array.isArray(ua)) isUserOpt = ua.includes(oIdx);
                        else isUserOpt = ua === oIdx;

                        let borderClass = "";
                        let bgClass = "";
                        let textClass = "";
                        let badgeBgClass = "";

                        if (isCorrectOpt) {
                          borderClass = 'border-emerald-500 ring-2 ring-emerald-500/30';
                          bgClass = isLight ? 'bg-emerald-50/75' : 'bg-emerald-950/20';
                          textClass = isLight ? 'text-emerald-900 font-semibold' : 'text-emerald-300 font-semibold';
                          badgeBgClass = 'bg-emerald-500 text-white';
                        } else if (isUserOpt) {
                          borderClass = 'border-red-500 ring-2 ring-red-500/30';
                          bgClass = isLight ? 'bg-red-50/75' : 'bg-red-950/20';
                          textClass = isLight ? 'text-red-900 font-semibold' : 'text-red-300 font-semibold';
                          badgeBgClass = 'bg-red-500 text-white';
                        } else {
                          borderClass = isLight ? 'border-slate-200' : 'border-white/5';
                          bgClass = isLight ? 'bg-slate-50/50' : 'bg-black/10';
                          textClass = isLight ? 'text-slate-700' : 'text-gray-400';
                          badgeBgClass = isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#222] text-gray-400 border border-white/5';
                        }

                        return (
                          <div key={oIdx} className={`p-4 rounded-xl border ${borderClass} ${bgClass} flex gap-4 items-start ${textClass}`}>
                            <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold ${badgeBgClass}`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(opt).replace(/<\/?(li|ul|ol)[^>]*>/gi, '') }} className="tex2jax_process text-sm flex-1" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className={`p-6 rounded-xl border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/10 border-blue-500/20'}`}>
                    
                    {/* Explicit Correct Answer Banner */}
                    <div className={`mb-5 p-3 rounded-xl border flex items-center gap-3 ${isLight ? 'bg-emerald-100/50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                      <span className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Correct Answer:</span>
                      <span className={`text-base font-black ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                        {q.type === 'integer' || q.options?.length === 0 
                          ? (typeof q.correctAnswer === 'object' && q.correctAnswer !== null ? (q.correctAnswer.en || JSON.stringify(q.correctAnswer)) : (q.correctAnswer ?? (typeof q.correctOption === 'object' && q.correctOption !== null ? (q.correctOption.en || JSON.stringify(q.correctOption)) : q.correctOption) ?? 'N/A'))
                          : (
                              q.questionType === 'MULTI_CORRECT' || q.questionType === 'MCQM'
                                ? (q.correctOptionsArray || []).map(idx => String.fromCharCode(65 + idx)).join(', ') || 'N/A'
                                : `Option ${typeof q.correctOption === 'string' ? q.correctOption.toUpperCase() : String.fromCharCode(65 + parseInt(q.correctOption || 0))}`
                            )
                        }
                      </span>
                    </div>

                    <h4 className="text-sm font-bold uppercase tracking-wider text-blue-500 mb-4 border-b border-blue-500/20 pb-2">Solution Explanation</h4>
                    {user ? (
                      <div dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(q.explanation || q.solution || "Solution not available.") }} className="tex2jax_process text-sm leading-relaxed" />
                    ) : (
                      <div className="text-center py-4 space-y-3">
                        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>🔑 Detailed explanation is locked. Log in to access step-by-step solutions.</p>
                        <button 
                          onClick={() => {
                            localStorage.setItem('quantrex_redirect_after_login', 'exam-mode');
                            if (setActivePage) setActivePage('login');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                        >
                          Login to Unlock Detailed Solution
                        </button>
                      </div>
                    )}
                  </div>

                  {(!isAttempted || !isCorrect) && (
                    <div className="mt-6 pt-6 border-t border-gray-500/20">
                      <MistakeBooster originalQuestion={q} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return <div className="bg-white min-h-screen">Loading...</div>;

  const counts = { answered: 0, not_answered: 0, not_visited: 0, marked: 0, answered_marked: 0 };
  Object.values(statusMap).forEach(val => counts[val] = (counts[val] || 0) + 1);

  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#F0F4F7]' : 'bg-[#0a0a0c] text-white'} flex flex-col font-sans select-none overflow-hidden`}>
      {/* Header */}
      <header className={`px-4 py-2.5 flex justify-between items-center text-sm shadow-md z-10 border-b-4 ${isLight ? 'bg-[#1a5b8c] text-white border-yellow-500' : 'bg-[#111] text-gray-200 border-yellow-600'}`}>
        <div className="font-bold text-lg tracking-wide uppercase flex items-center gap-4">
          <button onClick={onBackToDashboard} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors shadow">
            ← Pause & Exit
          </button>
          <button 
            onClick={() => {
               if (window.confirm('Are you sure you want to submit the test? You cannot resume after submitting.')) {
                  handleSubmit();
               }
            }} 
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors shadow"
          >
            Submit Test
          </button>
          <span>JEE MAIN 2026 - COMPUTER BASED TEST {mode === 'practice' && '(PRACTICE MODE)'}</span>
        </div>
        <div className="flex items-center gap-6 font-semibold">
          <div className="bg-white/10 px-3 py-1.5 rounded border border-white/20 shadow-inner flex items-center gap-2">
            <span className="text-yellow-300">Time Left:</span> 
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
          <div className="hidden sm:block border-l border-white/20 pl-6">Candidate: <span className="text-yellow-300">{user?.name || 'Applicant'}</span></div>
        </div>
      </header>

      {/* Subject & Section Tabs */}
      <div className={`flex flex-col border-b ${isLight ? 'bg-white border-gray-300' : 'bg-[#1a1a1a] border-white/10'}`}>
        <div className="flex text-sm">
          <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-t-lg ml-2 mt-1">Mathematics</button>
        </div>
        <div className={`flex text-xs px-3 py-1.5 gap-2 border-t ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#151515] border-white/5'}`}>
          <button 
            onClick={() => jumpToSection('A')} 
            className={`px-4 py-1.5 rounded font-black uppercase transition-all ${currentSection === 'A' ? 'bg-blue-600 text-white shadow-md' : (isLight ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300' : 'bg-[#222] text-gray-300 hover:bg-[#333] border border-white/10')}`}
          >
            Section A (MCQ)
          </button>
          <button 
            onClick={() => jumpToSection('B')} 
            className={`px-4 py-1.5 rounded font-black uppercase transition-all ${currentSection === 'B' ? 'bg-blue-600 text-white shadow-md' : (isLight ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300' : 'bg-[#222] text-gray-300 hover:bg-[#333] border border-white/10')}`}
          >
            Section B (Numerical)
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Question Area */}
        <div className={`flex-1 flex flex-col relative border-r ${isLight ? 'bg-white border-gray-300' : 'bg-[#111] border-white/10'}`}>
          <div className={`px-5 py-2.5 font-bold border-b text-sm flex justify-between items-center shadow-sm ${isLight ? 'bg-[#f2f8fc] text-blue-900 border-blue-200' : 'bg-[#1a1a1a] text-blue-400 border-white/10'}`}>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Multiple Choice Question</span>
            <div className="flex gap-4 items-center">
              <span className="text-gray-700 text-xs font-normal mr-2">View In:</span>
              <select className={`border text-xs px-2 py-1 outline-none ${isLight ? 'border-gray-400 bg-white text-black' : 'border-white/20 bg-black text-white'}`}>
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex gap-4">
              <div className="font-bold text-lg">Q.{currentIdx + 1}</div>
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3 mb-2 border-b border-gray-200 pb-2">
                  {(currentQ.title || currentQ.year) && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded shadow-sm border border-blue-200">
                      {currentQ.shift || currentQ.title || currentQ.year}
                    </span>
                  )}
                </div>
                <div className={`text-base tex2jax_process ${isLight ? 'text-gray-800' : 'text-gray-200'}`}
              dangerouslySetInnerHTML={{ 
                __html: fixExamGoalHtml(
                  currentQ.questionText || 
                  currentQ.question || 
                  currentQ.text || 
                  (currentQ.solution && typeof currentQ.solution === 'string' && currentQ.solution.includes('<img') ? (currentQ.solution.match(/<img[^>]+src="([^">]+)"[^>]*>/) ? `<img src="${currentQ.solution.match(/<img[^>]+src="([^">]+)"[^>]*>/)[1]}" alt="Question Image" style="max-width:100%; height:auto;" />` : '<i>Question text missing in database</i>') : '<i>Question text missing in database</i>')
                ) 
              }}
            />
                
                <div className="space-y-4 mt-6">
                  {currentQ.type === 'integer' || currentQ.options.length === 0 ? (
                    <div className={`flex items-center gap-4 p-4 border rounded-lg shadow-sm ${isLight ? 'border-blue-200 bg-blue-50/50' : 'border-blue-900/30 bg-blue-950/20'}`}>
                      <span className={`font-bold text-sm ${isLight ? 'text-blue-900' : 'text-blue-400'}`}>Enter Numerical Answer:</span>
                      <input 
                        type="number"
                        className={`px-4 py-2 border rounded font-mono text-base outline-none w-48 shadow-inner ${isLight ? 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-200 focus:border-blue-500' : 'bg-[#222] border-white/10 text-white focus:ring-2 focus:ring-blue-900/30 focus:border-blue-500'}`}
                        placeholder="e.g. 42"
                        value={answers[currentIdx] || ''}
                        onChange={(e) => {
                           const val = e.target.value;
                           setAnswers(prev => ({ ...prev, [currentIdx]: val }));
                           if (mode === 'practice' && val !== '') {
                             if (!user) setShowAuthModal(true);
                             else setShowExplanation(true);
                           }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {currentQ.options.map((opt, oIdx) => {
                        const isSelected = answers[currentIdx] === oIdx;
                        let isCorrect = false;
                        let isWrong = false;
                        if (mode === 'practice' && showExplanation) {
                          isCorrect = currentQ.correctOption === oIdx || currentQ.correctOption === String(oIdx) || currentQ.correctOption === String.fromCharCode(65 + oIdx) || currentQ.correctOption === String.fromCharCode(97 + oIdx);
                          isWrong = isSelected && !isCorrect;
                        }

                        return (
                          <div
                            key={oIdx}
                            onClick={() => {
                              if (mode === 'practice' && showExplanation) return; // Prevent changing answer after checking
                              setAnswers(prev => ({ ...prev, [currentIdx]: oIdx }));
                              if (mode === 'practice') {
                                if (!user) setShowAuthModal(true);
                                else setShowExplanation(true);
                              }
                            }}
                            className={`flex gap-4 items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              isCorrect
                                ? (isLight ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/20' : 'border-emerald-500 bg-emerald-900/30 ring-2 ring-emerald-500/20')
                                : isWrong
                                ? (isLight ? 'border-red-400 bg-red-50' : 'border-red-500 bg-red-900/30')
                                : isSelected
                                ? (isLight ? 'border-blue-500 bg-blue-50 shadow-[0_0_12px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/20' : 'border-blue-500 bg-blue-900/30 ring-2 ring-blue-500/20')
                                : (isLight ? 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50' : 'border-white/10 bg-[#151515] hover:border-white/20 hover:bg-[#222]')
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm transition-colors ${
                              isCorrect
                                ? 'bg-emerald-600 text-white shadow-md'
                                : isWrong
                                ? 'bg-red-500 text-white'
                                : isSelected
                                ? 'bg-blue-600 text-white shadow-md'
                                : (isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-black text-gray-400 border border-white/10')
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <div 
                              className={`tex2jax_process pt-1 text-sm ${isCorrect ? (isLight ? 'text-emerald-900 font-bold' : 'text-emerald-400 font-bold') : isWrong ? (isLight ? 'text-red-900 font-bold' : 'text-red-400 font-bold') : isSelected ? (isLight ? 'text-blue-900 font-semibold' : 'text-blue-100 font-semibold') : (isLight ? 'text-slate-700' : 'text-gray-300')}`}
                              dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(opt).replace(/<\/?(li|ul|ol)[^>]*>/gi, '') }} 
                            />
                            {isCorrect && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
                            {isWrong && <span className="ml-auto text-red-500 font-bold">✗</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Practice Mode Features */}
                {mode === 'practice' && (
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-300">
                    {!showExplanation ? (
                      <button 
                        onClick={() => {
                          if (!user) setShowAuthModal(true);
                          else setShowExplanation(true);
                        }}
                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors"
                      >
                        Reveal Answer & Explanation
                      </button>
                    ) : (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 animate-fade-in space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">{currentQ.type === 'integer' || currentQ.options.length === 0 ? 'Solution Available' : 'Correct Answer'}</span>
                          {currentQ.type !== 'integer' && currentQ.options.length > 0 && <span className="font-bold text-sm text-gray-800">Option {String.fromCharCode(65 + (currentQ.correctOption === 'A' ? 0 : currentQ.correctOption === 'B' ? 1 : currentQ.correctOption === 'C' ? 2 : 3))}</span>}
                        </div>
                        <h4 className="text-sm font-bold text-purple-900 border-b border-purple-200/50 pb-2">Detailed Explanation</h4>
                        <div className="text-sm text-gray-700 leading-relaxed tex2jax_process" dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(currentQ.explanation || currentQ.solution || "Solution not available.") }} />
                        {(() => {
                           let correctIdx = currentQ.correctOption;
                           if (typeof correctIdx === 'string') correctIdx = correctIdx.charCodeAt(0) - 65;
                           const isCorrect = answers[currentIdx] !== undefined && answers[currentIdx] === correctIdx;
                           return !isCorrect ? <div className="mt-4"><MistakeBooster originalQuestion={currentQ} /></div> : null;
                        })()}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`p-3.5 flex justify-between items-center border-t text-xs shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10 ${isLight ? 'bg-[#f0f4f7] border-gray-300' : 'bg-[#111] border-white/10'}`}>
            <div className="flex gap-2.5">
              <button onClick={handleSaveAndNext} className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2 px-4 rounded border-b-4 border-[#15803d] active:border-b-0 active:translate-y-1 transition-all">SAVE & NEXT</button>
              <button onClick={handleClearResponse} className={`font-bold py-2 px-4 rounded border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isLight ? 'bg-white hover:bg-gray-100 text-black border-gray-300' : 'bg-[#222] hover:bg-[#333] text-white border-black'}`}>CLEAR</button>
              <button onClick={handleSaveAndMarkForReview} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2 px-4 rounded border-b-4 border-[#c2410c] active:border-b-0 active:translate-y-1 transition-all">SAVE & MARK FOR REVIEW</button>
              <button onClick={handleMarkForReviewAndNext} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-2 px-4 rounded border-b-4 border-[#1d4ed8] active:border-b-0 active:translate-y-1 transition-all">MARK FOR REVIEW & NEXT</button>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} className={`font-bold py-2 px-4 rounded border transition-all ${isLight ? 'bg-white hover:bg-gray-100 text-black border-gray-300' : 'bg-[#222] hover:bg-[#333] text-white border-white/20'}`}>&lt;&lt; BACK</button>
              <button onClick={goNext} className={`font-bold py-2 px-4 rounded border transition-all ${isLight ? 'bg-white hover:bg-gray-100 text-black border-gray-300' : 'bg-[#222] hover:bg-[#333] text-white border-white/20'}`}>NEXT &gt;&gt;</button>
            </div>
          </div>
        </div>

        {/* Right Side: Palette */}
        <div className={`w-[340px] flex flex-col shadow-inner ${isLight ? 'bg-[#e6eff6]' : 'bg-[#151515] border-l border-white/10'}`}>
          <div className={`p-4 flex gap-4 items-center border-b shadow-sm ${isLight ? 'bg-white border-gray-300' : 'bg-[#111] border-white/10'}`}>
            <img src="https://ui-avatars.com/api/?name=Student&background=random" className="w-16 h-16 border border-gray-300 rounded shadow-sm" alt="profile" />
            <div className={`font-bold text-sm ${isLight ? 'text-[#1a5b8c]' : 'text-blue-400'}`}>
              <div className="text-xl mb-0.5">{user?.name || 'Applicant'}</div>
              <div className={`font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Subject: <span className={isLight ? 'text-blue-700' : 'text-blue-300'}>Mathematics</span></div>
            </div>
          </div>
          
          <div className={`p-3 text-[11px] font-bold border-b grid grid-cols-2 gap-y-3 gap-x-2 shadow-sm z-10 ${isLight ? 'bg-[#f2f8fc] border-gray-300 text-gray-700' : 'bg-[#1a1a1a] border-white/10 text-gray-300'}`}>
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-t-full rounded-l-full bg-[#22c55e] text-white flex justify-center items-center shadow-inner">{counts.answered || 0}</div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-t-full rounded-r-full bg-[#ef4444] text-white flex justify-center items-center shadow-inner">{counts.not_answered || 0}</div> Not Answered</div>
            <div className="flex items-center gap-2"><div className={`w-7 h-7 rounded border flex justify-center items-center shadow-inner ${isLight ? 'bg-[#e2e8f0] border-[#cbd5e1] text-black' : 'bg-[#333] border-[#555] text-white'}`}>{counts.not_visited || 0}</div> Not Visited</div>
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#9333ea] text-white flex justify-center items-center shadow-inner">{counts.marked || 0}</div> Marked for Review</div>
            <div className="flex items-center gap-2 col-span-2"><div className="w-7 h-7 rounded-full bg-[#9333ea] text-white flex justify-center items-center relative shadow-inner"><div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22c55e] rounded-full border border-white"></div>{counts.answered_marked || 0}</div> Answered & Marked for Review</div>
          </div>

          <div className={`flex-1 p-4 overflow-y-auto ${isLight ? 'bg-[#dbeaf4]' : 'bg-[#0a0a0c]'}`}>
            {mcqIndices.length > 0 && (
              <>
                <div className={`font-bold px-3 py-1.5 mb-2 rounded shadow-sm text-xs ${isLight ? 'bg-[#1a5b8c] text-white' : 'bg-[#1a1a1a] text-blue-300 border border-white/10'}`}>Section A (MCQ)</div>
                <div className="flex flex-wrap gap-2.5 mb-5">
                  {mcqIndices.map((i) => {
                    const s = statusMap[i];
                    let shapeClass = "w-9 h-9 flex items-center justify-center text-sm font-bold cursor-pointer text-white shadow hover:scale-105 transition-transform ";
                    if (s === 'answered') shapeClass += "bg-[#22c55e] rounded-t-full rounded-l-full border border-green-700";
                    else if (s === 'not_answered') shapeClass += "bg-[#ef4444] rounded-t-full rounded-r-full border border-red-700";
                    else if (s === 'marked') shapeClass += "bg-[#9333ea] rounded-full border border-purple-800";
                    else if (s === 'answered_marked') shapeClass += "bg-[#9333ea] rounded-full border border-purple-800 relative";
                    else shapeClass += isLight ? "bg-white border border-[#cbd5e1] text-black rounded" : "bg-[#222] border border-white/20 text-gray-200 rounded";
                    
                    return (
                      <div key={i} onClick={() => jumpToQuestion(i)} className={shapeClass}>
                        {i + 1}
                        {s === 'answered_marked' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-white"></div>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {numericalIndices.length > 0 && (
              <>
                <div className={`font-bold px-3 py-1.5 mb-2 rounded shadow-sm text-xs ${isLight ? 'bg-[#1a5b8c] text-white' : 'bg-[#1a1a1a] text-blue-300 border border-white/10'}`}>Section B (Numerical)</div>
                <div className="flex flex-wrap gap-2.5">
                  {numericalIndices.map((i) => {
                    const s = statusMap[i];
                    let shapeClass = "w-9 h-9 flex items-center justify-center text-sm font-bold cursor-pointer text-white shadow hover:scale-105 transition-transform ";
                    if (s === 'answered') shapeClass += "bg-[#22c55e] rounded-t-full rounded-l-full border border-green-700";
                    else if (s === 'not_answered') shapeClass += "bg-[#ef4444] rounded-t-full rounded-r-full border border-red-700";
                    else if (s === 'marked') shapeClass += "bg-[#9333ea] rounded-full border border-purple-800";
                    else if (s === 'answered_marked') shapeClass += "bg-[#9333ea] rounded-full border border-purple-800 relative";
                    else shapeClass += isLight ? "bg-white border border-[#cbd5e1] text-black rounded" : "bg-[#222] border border-white/20 text-gray-200 rounded";
                    
                    return (
                      <div key={i} onClick={() => jumpToQuestion(i)} className={shapeClass}>
                        {i + 1}
                        {s === 'answered_marked' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-white"></div>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Submit Button (NTA puts it under palette) */}
          <div className={`p-3 flex justify-center border-t ${isLight ? 'bg-[#c2e0f4] border-gray-300' : 'bg-[#111] border-white/10'}`}>
             <button onClick={handleSubmit} className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2 px-10 rounded shadow transition-all">Submit</button>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-all scale-100 ${isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-zinc-900 border-white/10 text-white'}`}>
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <span className="text-2xl">🔑</span>
              <h3 className="text-lg font-black uppercase tracking-wider">Solution Locked</h3>
            </div>
            <p className={`text-sm mb-6 leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
              Detailed step-by-step explanations and math solutions are reserved for registered users. Please log in or create an account to unlock all features of Quantrex Academy!
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAuthModal(false)}
                className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('quantrex_redirect_after_login', 'exam-mode');
                  if (setActivePage) setActivePage('login');
                }}
                className="px-5 py-2 text-xs font-bold rounded-lg uppercase tracking-wider bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transition-all"
              >
                Login / Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
