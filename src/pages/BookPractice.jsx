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
import Award from 'lucide-react/dist/esm/icons/award';
import Target from 'lucide-react/dist/esm/icons/target';
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
  const [showSolution, setShowSolution] = useState(false);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [characterFeedback, setCharacterFeedback] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'offline'
  const scrollRef = useRef(null);
  const questionRefs = useRef({});

  // Persisted progress: { exerciseName: { qIdx: { selectedIdx, isChecked, isCorrect } } }
  // Primary: localStorage (fast). Secondary: MongoDB (persistent across devices).
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Load progress from MongoDB on mount (merge with localStorage)
  useEffect(() => {
    if (!userId) return;
    setSyncStatus('syncing');
    fetchBlackBookProgress(chapterId, userId)
      .then(mongoProgress => {
        if (Object.keys(mongoProgress).length > 0) {
          setProgress(prev => {
            // Deep merge: MongoDB wins for checked items, localStorage wins for in-progress
            const merged = { ...prev };
            Object.entries(mongoProgress).forEach(([ex, qMap]) => {
              if (!merged[ex]) merged[ex] = {};
              Object.entries(qMap).forEach(([qi, state]) => {
                const localState = merged[ex][qi];
                // If MongoDB has a checked answer, prefer it
                if (state.isChecked && (!localState || !localState.isChecked)) {
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
  const [fontSize, setFontSize] = useState(17); // Default 17px

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

  // Init active exercise
  useEffect(() => {
    if (!activeExercise && exercisesList.length > 0) {
      let targetEx = exercisesList[0];
      let targetIdx = 0;

      // Auto-resume: find the first unattempted question
      for (const ex of exercisesList) {
        const qs = exerciseGroups[ex] || [];
        let foundUnanswered = false;
        for (let i = 0; i < qs.length; i++) {
           const state = progress[ex]?.[i];
           if (!state?.isChecked && !state?.selectedIdx) {
              targetEx = ex;
              targetIdx = i;
              foundUnanswered = true;
              break;
           }
        }
        if (foundUnanswered) break;
      }

      setActiveExercise(targetEx);
      setCurrentIdx(targetIdx);
    }
  }, [exercisesList, activeExercise]);

  const questions = activeExercise ? exerciseGroups[activeExercise] || [] : [];
  const question = questions[currentIdx];

  const globalKey = `${activeExercise}-${currentIdx}`;
  const exProgress = progress[activeExercise] || {};
  const qState = exProgress[currentIdx];
  const isAttempted = !!qState?.isChecked;
  const selectedIdx = qState?.selectedIdx;
  const isCorrect = qState?.isCorrect;

  // ─── Exercise type detection ─────────────────────────────────────────────
  const isMatchingType = activeExercise?.includes('Exercise 4') || activeExercise?.includes('Exercise-4');
  const isSubjective = activeExercise?.includes('Exercise 5') || activeExercise?.includes('Exercise-5');
  
  const t = (question?.type || question?.questionType || '').toUpperCase().trim();
  const isMultiCorrect = activeExercise?.includes('Exercise 2') || activeExercise?.includes('Exercise-2') || t === 'MULTI_CORRECT' || t === 'MULTIPLE_CORRECT' || t === 'MCQM';

  // ─── Persist progress ────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey + '_seen', JSON.stringify(seenMap));
  }, [seenMap, storageKey]);

  // Mark as seen
  useEffect(() => {
    if (activeExercise && currentIdx !== undefined) {
      setSeenMap(prev => ({
        ...prev,
        [`${activeExercise}-${currentIdx}`]: true
      }));
    }
  }, [activeExercise, currentIdx]);

  // Timer
  useEffect(() => {
    if (isAttempted) return;
    const timer = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isAttempted, globalKey]);

  useEffect(() => {
    setTimeSpent(0);
  }, [currentIdx, activeExercise]);

  // KaTeX handles math rendering via MathRenderer component — no MathJax needed

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleTabChange = (ex) => {
    setActiveExercise(ex);
    setCurrentIdx(0);
    setShowSolution(false);
    setShowAnswerResult(false);
  };

  const handleSelectOption = (optIdx) => {
    if (isAttempted) return;

    // Immediately evaluate and play voice for Single Correct questions
    if (!isMultiCorrect) {
      const correct = optIdx === question.correctOption;
      
      setProgress(prev => ({
        ...prev,
        [activeExercise]: {
          ...(prev[activeExercise] || {}),
          [currentIdx]: { 
            ...(prev[activeExercise]?.[currentIdx] || {}), 
            selectedIdx: optIdx, 
            isChecked: true,
            isCorrect: correct
          }
        }
      }));
      setShowAnswerResult(true);

      // Save to MongoDB
      saveBlackBookProgress(chapterId, userId, activeExercise, currentIdx, {
        selectedIdx: optIdx, isChecked: true, isCorrect: correct
      });

      // Audio feedback removed as requested

      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    // For Multi Correct questions, just toggle selection (they must click Check Answer button)
    setProgress(prev => {
      const currentSelected = prev[activeExercise]?.[currentIdx]?.selectedIdx;
      let newSelected;
      const arr = Array.isArray(currentSelected) ? currentSelected : (currentSelected !== undefined && currentSelected !== -1 ? [currentSelected] : []);
      if (arr.includes(optIdx)) {
        newSelected = arr.filter(i => i !== optIdx);
      } else {
        newSelected = [...arr, optIdx].sort((a, b) => a - b);
      }
      
      return {
        ...prev,
        [activeExercise]: {
          ...(prev[activeExercise] || {}),
          [currentIdx]: { ...(prev[activeExercise]?.[currentIdx] || {}), selectedIdx: newSelected, isChecked: false }
        }
      };
    });
  };

  const handleCheckAnswer = () => {
    const q = question;
    let correct = false;

    if (isMultiCorrect) {
      const correctArr = q.correctOptionsArray || [];
      const currentSelection = Array.isArray(selectedIdx) ? selectedIdx : (selectedIdx !== undefined && selectedIdx !== -1 ? [selectedIdx] : []);
      correct = correctArr.length > 0 && correctArr.length === currentSelection.length && currentSelection.every(val => correctArr.includes(val));
    } else {
      correct = selectedIdx === q.correctOption;
    }

    setProgress(prev => ({
      ...prev,
      [activeExercise]: {
        ...(prev[activeExercise] || {}),
        [currentIdx]: {
          ...(prev[activeExercise]?.[currentIdx] || {}),
          selectedIdx: selectedIdx ?? -1,
          isChecked: true,
          isCorrect: correct
        }
      }
    }));
    setShowAnswerResult(true);

    // Save to MongoDB
    saveBlackBookProgress(chapterId, userId, activeExercise, currentIdx, {
      selectedIdx: selectedIdx ?? -1, isChecked: true, isCorrect: correct
    });

    // Audio feedback removed as requested

    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleRevealAnswer = () => {
    setProgress(prev => ({
      ...prev,
      [activeExercise]: {
        ...(prev[activeExercise] || {}),
        [currentIdx]: {
          ...(prev[activeExercise]?.[currentIdx] || {}),
          isChecked: true,
          isCorrect: null,
          revealed: true
        }
      }
    }));
    setShowAnswerResult(true);
    // Save to MongoDB
    saveBlackBookProgress(chapterId, userId, activeExercise, currentIdx, {
      selectedIdx: -1, isChecked: true, isCorrect: null, revealed: true
    });
  };

  const handleClearResponse = () => {
    setProgress(prev => {
      const copy = { ...prev };
      const exCopy = { ...(copy[activeExercise] || {}) };
      delete exCopy[currentIdx];
      copy[activeExercise] = exCopy;
      return copy;
    });
    setShowAnswerResult(false);
    setShowSolution(false);
    // Delete from MongoDB
    resetBlackBookProgress(chapterId, userId, activeExercise, currentIdx);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowSolution(false);
      setShowAnswerResult(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowSolution(false);
      setShowAnswerResult(false);
    }
  };

  const handleJumpTo = (idx) => {
    setCurrentIdx(idx);
    setShowSolution(false);
    setShowAnswerResult(false);
  };

  const handleRestartChapter = () => {
    if (!window.confirm("Are you sure you want to clear all progress for this chapter and restart?")) return;
    setProgress({});
    setSeenMap({});
    setActiveExercise(exercisesList[0]);
    setCurrentIdx(0);
    setShowSolution(false);
    setShowAnswerResult(false);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(storageKey + '_seen');
    resetBlackBookProgress(chapterId, userId);
  };

  // ─── Stats for right sidebar ──────────────────────────────────────────────
  const getExStats = () => {
    const exP = progress[activeExercise] || {};
    let correct = 0, wrong = 0, attempted = 0, seen = 0, notSeen = 0;
    questions.forEach((_, idx) => {
      const s = exP[idx];
      const isSeen = seenMap[`${activeExercise}-${idx}`];
      if (s?.isChecked) {
        if (s.isCorrect === true) correct++;
        else if (s.isCorrect === false) wrong++;
        else seen++; // revealed but not right/wrong
      } else if (s?.selectedIdx !== undefined) {
        attempted++;
      } else if (isSeen) {
        seen++;
      } else {
        notSeen++;
      }
    });
    return { correct, wrong, attempted, seen, notSeen };
  };

  const getBubbleClass = (idx) => {
    const s = (progress[activeExercise] || {})[idx];
    const isSeen = seenMap[`${activeExercise}-${idx}`];
    if (s?.isChecked) {
      if (s.isCorrect === true) return 'bg-green-500 text-white';
      if (s.isCorrect === false) return 'bg-red-500 text-white';
      return 'bg-yellow-400 text-white'; // revealed
    }
    if (s?.selectedIdx !== undefined) return 'bg-blue-500 text-white';
    if (isSeen) return 'bg-yellow-400 text-white';
    return 'bg-gray-400 text-white';
  };

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (loadingQuestions) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isLight ? 'bg-gray-50 text-gray-900' : 'bg-gray-950 text-white'}`}>
        <RefreshCw className="w-16 h-16 mb-4 opacity-50 animate-spin text-electric" />
        <p className="text-lg font-medium mb-4">Loading questions from server...</p>
      </div>
    );
  }

  if (!allQuestions.length) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isLight ? 'bg-gray-50 text-gray-900' : 'bg-gray-950 text-white'}`}>
        <BookOpen className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium mb-4">No questions available yet.</p>
        <button onClick={() => setActivePage('book-chapters')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Go Back</button>
      </div>
    );
  }

  if (!question) return null;
  const stats = getExStats();
  const currentExProgress = progress[activeExercise] || {};
  const _selIdx = currentExProgress[currentIdx]?.selectedIdx;
  const hasPendingOption = isMultiCorrect 
    ? (Array.isArray(_selIdx) ? _selIdx.length > 0 : _selIdx !== undefined && _selIdx !== -1)
    : (_selIdx !== undefined && _selIdx !== -1);
  const isPending = hasPendingOption && !isAttempted;

  // format time
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col font-sans bg-[#f5f6fa] overflow-hidden">

      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="h-[52px] bg-[#2962ff] text-white flex items-center px-4 shadow-lg justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setActivePage('book-chapters')} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[15px] font-semibold">{chapter?.title || 'Black Book Practice'}</span>
            <span className="text-[11px] text-white/60 ml-2">Function</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded text-[12px]">
            <Target className="w-3.5 h-3.5" /> {stats.correct} correct
          </span>
          <span className="hidden sm:flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded text-[12px]">
            <Award className="w-3.5 h-3.5" /> {questions.length} total
          </span>
          <button 
            onClick={handleRestartChapter}
            className="flex items-center gap-1.5 bg-red-500/20 text-red-100 hover:bg-red-500/40 px-2 py-1 rounded text-[12px] font-semibold transition-colors"
            title="Restart Chapter"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restart
          </button>
          <div className="flex items-center gap-1 ml-1 border-l border-white/20 pl-2">
            <button onClick={() => setFontSize(prev => Math.max(12, prev - 1))} className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded" title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <button onClick={() => setFontSize(prev => Math.min(30, prev + 1))} className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded" title="Zoom In">
              <ZoomIn size={16} />
            </button>
          </div>
          {/* MongoDB sync status */}
          <span className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold ${
            syncStatus === 'synced' ? 'bg-green-500/20 text-green-200' :
            syncStatus === 'offline' ? 'bg-red-500/20 text-red-200' :
            syncStatus === 'syncing' ? 'bg-yellow-500/20 text-yellow-200' :
            'bg-white/10 text-white/50'
          }`}>
            {syncStatus === 'synced' ? <><Cloud className="w-3 h-3" /> Synced</> :
             syncStatus === 'offline' ? <><CloudOff className="w-3 h-3" /> Offline</> :
             syncStatus === 'syncing' ? <>⏳ Syncing…</> :
             <><Cloud className="w-3 h-3" /> Local</>}
          </span>
        </div>
      </div>

      {/* ── Exercise Tabs ─────────────────────────────────────── */}
      <div className="bg-[#1e4fc2] border-b border-white/10 px-3 flex items-center gap-1 overflow-x-auto shrink-0" style={{minHeight:'40px'}}>
        {exercisesList.map(ex => (
          <button
            key={ex}
            onClick={() => handleTabChange(ex)}
            className={`whitespace-nowrap px-4 py-1.5 text-[12px] font-semibold rounded-t-md transition-all shrink-0 ${
              activeExercise === ex
                ? 'bg-white text-[#2962ff] shadow'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* ── Main Layout: Left + Right ────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ───── LEFT: Question Panel ───────────────────────── */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-sm">

          {/* Question Meta Bar */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50 shrink-0">
            <div className="flex items-center gap-1.5 bg-gray-200 px-2 py-1 rounded text-[12px] font-mono text-black">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              {formatTime(timeSpent)}
            </div>
            <span className="text-[12px] text-gray-700">Q {currentIdx + 1} / {questions.length}</span>
            {isAttempted && (
              <span className={`ml-auto text-[12px] font-bold px-2 py-0.5 rounded ${
                qState?.isCorrect === true ? 'bg-green-100 text-green-700' :
                qState?.isCorrect === false ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {qState?.isCorrect === true ? '✓ Correct' :
                 qState?.isCorrect === false ? '✗ Wrong' : 'Revealed'}
              </span>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7" ref={scrollRef}>
            <div className="max-w-3xl mx-auto">

              {/* Question number badge + type */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-[#2962ff] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {currentIdx + 1}
                </div>
                  {(question.shift || question.title || question.year) && (
                    <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] text-[13px] font-bold rounded border border-green-200">
                      {question.shift || question.title || question.year}
                    </span>
                  )}
                {question.typeLabel && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded border border-blue-200">
                    {question.typeLabel}
                  </span>
                )}
                {isMultiCorrect && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-bold rounded border border-purple-200">[MULTI CORRECT]</span>}
                {!isMultiCorrect && !isMatchingType && !isSubjective && question?.type !== 'NUMERICAL' && question?.type !== 'numerical' && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded border border-blue-200">[SINGLE CORRECT]</span>}
                {(question?.type === 'NUMERICAL' || question?.type === 'numerical') && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[11px] font-bold rounded border border-orange-200">[NUMERICAL]</span>}
                {isMatchingType && (
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[11px] font-bold rounded border border-purple-200">
                    Matching Type
                  </span>
                )}
                {isSubjective && (
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[11px] font-bold rounded border border-orange-200">
                    Subjective
                  </span>
                )}
              </div>

                {/* Question Text */}
                <div className="leading-[1.9] text-black mb-6 font-bold whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
                  <MathRenderer text={question.text} />
                </div>

              {/* Graph/Image if any */}
              {question.has_graph && question.imageUrl && !question.text?.includes(question.imageUrl) && (
                <div className="mb-6 text-center flex flex-col gap-4">
                  <img
                    src={question.imageUrl}
                    alt="Question Graph"
                    className="max-w-sm w-full mx-auto rounded-lg border border-gray-200 shadow-sm"
                  />
                  {question.imageUrl2 && (
                    <img
                      src={question.imageUrl2}
                      alt="Question Graph 2"
                      className="max-w-md w-full mx-auto rounded-lg border border-gray-200 shadow-sm"
                    />
                  )}
                </div>
              )}

              {/* ── MATCHING TYPE (Ex4) ── */}
              {isMatchingType ? (
                <div className="mt-4">
                  {/* Show answer after reveal */}
                  {isAttempted && (
                    <div className="mt-4 p-5 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                      <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Answer Key
                      </h3>
                      <div className="text-green-900 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {question.answerKeyStr || question.correctAnswer || 'Answer not available'}
                      </div>
                    </div>
                  )}

                  {!isAttempted && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleRevealAnswer}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg text-[15px]"
                      >
                        <Eye className="w-5 h-5" /> Check the Answer
                      </button>
                    </div>
                  )}
                </div>
              ) : isSubjective ? (
                /* ── SUBJECTIVE (Ex5) ── */
                <div className="mt-4">
                  {isAttempted ? (
                    <div className="p-5 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                      <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Answer
                      </h3>
                      <div className="text-3xl font-bold text-green-700 mt-1">
                        {question.answerKeyStr || question.correctAnswer || 'N/A'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleRevealAnswer}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg text-[15px]"
                      >
                        <Eye className="w-5 h-5" /> Check the Answer
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── MCQ OPTIONS (Ex1, Ex2, Ex3) ── */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {(question.options || []).map((opt, i) => {
                      const isSelected = isMultiCorrect 
                          ? (Array.isArray(selectedIdx) ? selectedIdx.includes(i) : selectedIdx === i)
                          : selectedIdx === i;
                      const correctArr = question.correctOptionsArray;
                      const isActuallyCorrect = correctArr
                        ? correctArr.includes(i)
                        : i === question.correctOption;

                      let boxClass = 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
                      let circleClass = 'border-gray-300 text-gray-700';

                      if (!isAttempted && isSelected) {
                        boxClass = 'border-blue-500 bg-blue-50 cursor-pointer';
                        circleClass = 'border-blue-500 bg-blue-500 text-white';
                      }

                      if (isAttempted) {
                        if (isActuallyCorrect) {
                          boxClass = 'border-green-400 bg-green-50';
                          circleClass = 'border-green-500 bg-green-500 text-white';
                        } else if (isSelected && !isActuallyCorrect) {
                          boxClass = 'border-red-400 bg-red-50';
                          circleClass = 'border-red-500 bg-red-500 text-white';
                        } else {
                          boxClass = 'border-gray-200 bg-gray-50 opacity-60';
                          circleClass = 'border-gray-300 text-gray-400';
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={isAttempted}
                          onClick={() => handleSelectOption(i)}
                          className={`w-full text-left p-4 flex items-start gap-4 border-2 rounded-xl transition-all shadow-sm relative overflow-hidden ${boxClass}`}
                        >
                          <div className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center font-bold text-[13px] transition-colors ${circleClass}`}>
                            {OPTION_LABELS[i]}
                          </div>
                            <div className="flex-1 mt-0.5 font-semibold text-black leading-relaxed" style={{ fontSize: `${Math.max(13, fontSize - 1)}px` }}>
                              <MathRenderer text={opt} />
                            </div>
                          {isAttempted && isActuallyCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto shrink-0 mt-0.5" />
                          )}
                          {isAttempted && isSelected && !isActuallyCorrect && (
                            <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0 mt-0.5" />
                          )}
                          {/* Correct Answer badge */}
                          {isAttempted && isSelected && isActuallyCorrect && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                              ✓ Correct
                            </div>
                          )}
                          {isAttempted && !isSelected && isActuallyCorrect && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                              Correct Answer
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Check Answer Button moved to Bottom Action Bar */}

                  {/* Feedback banner */}
                  {isAttempted && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${
                      isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {isCorrect
                        ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                        : <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                      }
                      <div>
                        <p className={`font-bold text-[14px] ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {isCorrect ? 'Great! That is correct.' : 'Not quite! See the correct answer highlighted above.'}
                        </p>
                        {!isCorrect && question.correctOption !== undefined && (
                          <p className="text-[12px] text-gray-800 mt-0.5">
                            Correct: Option {OPTION_LABELS[
                              question.correctOptionsArray ? question.correctOptionsArray[0] : question.correctOption
                            ]}
                            {isMultiCorrect && question.correctOptionsArray?.length > 1 &&
                              ` and ${question.correctOptionsArray.slice(1).map(x => OPTION_LABELS[x]).join(', ')}`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Solution Panel */}
              {isAttempted && !isMatchingType && !isSubjective && question.solution && (
                <div className="mt-4">
                  {!showSolution ? (
                    <button
                      onClick={() => setShowSolution(true)}
                      className="flex items-center gap-2 text-[13px] font-semibold text-blue-600 hover:text-blue-800 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View Solution
                    </button>
                  ) : (
                      <TeacherSolution html={question.solution} isLight={isLight} />
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-white border-t border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] h-auto sm:h-16 flex-wrap sm:flex-nowrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className={`px-4 sm:px-6 py-2 rounded-lg text-[13px] font-bold flex items-center gap-1 transition-colors ${
                  currentIdx === 0 ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4 hidden sm:block" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              {isAttempted && (
                <button
                  onClick={handleClearResponse}
                  className="flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-gray-800 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors ml-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>

            <div className="flex-1 flex justify-center">
              {!isAttempted && (
                 <button
                   onClick={() => {
                     if (isPending) handleCheckAnswer();
                     else {
                       handleRevealAnswer();
                       setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, 100);
                     }
                   }}
                   className={`px-6 sm:px-10 py-2.5 rounded-lg font-bold text-[14px] uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                     hasPendingOption
                       ? 'bg-[#28a745] hover:bg-[#218838] text-white shadow-[#28a745]/30 transform hover:-translate-y-0.5 border border-[#218838]'
                       : 'bg-white hover:bg-gray-50 text-[#1976d2] shadow-sm border-2 border-[#1976d2]'
                   }`}
                 >
                   {isPending ? <><CheckCircle className="w-4 h-4" /> Check Answer</> : <><Eye className="w-4 h-4" /> View Solution</>}
                 </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleNext}
                disabled={currentIdx === questions.length - 1}
                className={`px-6 sm:px-8 py-2 rounded-lg text-[13px] font-bold flex items-center gap-1 transition-colors ${
                  currentIdx === questions.length - 1 ? 'bg-gray-100 text-gray-400' : 'bg-[#2962ff] text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                Next <ChevronRight className="w-4 h-4 hidden sm:block" />
              </button>
            </div>
          </div>
        </div>

        {/* ───── RIGHT: Question Navigator ─────────────────────── */}
        <div className="w-[260px] bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-[-2px_0_8px_rgba(0,0,0,0.03)]">

          {/* Legend */}
          <div className="p-3 border-b border-gray-100 grid grid-cols-2 gap-y-2 gap-x-2">
            {[
              { color: 'bg-green-500', label: 'Correct' },
              { color: 'bg-red-500', label: 'Wrong' },
              { color: 'bg-blue-500', label: 'Attempted' },
              { color: 'bg-yellow-400', label: 'Seen' },
              { color: 'bg-gray-400', label: 'Not Seen' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-[10px] text-gray-800">{label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
            <p className="text-[11px] font-semibold text-black mb-2">{activeExercise}</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-800">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/> {stats.correct}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/> {stats.wrong}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> {stats.attempted}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/> {stats.seen}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block"/> {stats.notSeen}</span>
            </div>
          </div>

          {/* Question Bubbles */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleJumpTo(idx)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px] shadow-sm hover:opacity-80 transition-all ${getBubbleClass(idx)} ${
                    idx === currentIdx ? 'ring-2 ring-offset-1 ring-[#2962ff] scale-110' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-3 pb-3">
            <div className="flex justify-between text-[10px] text-gray-700 mb-1">
              <span>Progress</span>
              <span>{Math.round(((stats.correct + stats.wrong) / questions.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all rounded-full"
                style={{ width: `${((stats.correct + stats.wrong) / questions.length) * 100}%` }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
