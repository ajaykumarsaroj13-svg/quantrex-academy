import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../components/NTAExamInterface.css';
import TeacherSolution from '../components/TeacherSolution';
import { fixExamGoalHtml } from '../utils/htmlCleaner';
import { useWatermarkRemover } from '../hooks/useWatermarkRemover';

import logoMainsImg from '../assets/logo_mains.png';
import logoAdvancedImg from '../assets/logo_advanced.png';
import logoNdaImg from '../assets/logo_nda.png';
import logoImg from '../assets/logo.png';

const getExamLogo = (testData) => {
  const type = (testData?.examType || testData?.exam || testData?.category || testData?.title || testData?.id || '').toLowerCase();
  if (type.includes('advanced')) {
    return <img src={logoAdvancedImg} alt="JEE Advanced" className="w-7 h-7 rounded-full object-cover border border-white/30 bg-white/10 p-0.5 shadow-sm" />;
  }
  if (type.includes('main')) {
    return <img src={logoMainsImg} alt="JEE Main" className="w-7 h-7 rounded-full object-cover border border-white/30 bg-white/10 p-0.5 shadow-sm" />;
  }
  if (type.includes('nda')) {
    return <img src={logoNdaImg} alt="NDA" className="w-7 h-7 rounded-full object-cover border border-white/30 bg-white/10 p-0.5 shadow-sm" />;
  }
  return <img src={logoImg} alt="Quantrex" className="w-7 h-7 rounded-full object-cover border border-white/30 bg-white/10 p-0.5 shadow-sm" />;
};

// ─── Constants ────────────────────────────────────────────────
const STATUS = {
  NOT_VISITED:     'not-visited',
  NOT_ANSWERED:    'not-answered',
  ANSWERED:        'answered',
  MARKED:          'marked',
  ANSWERED_MARKED: 'answered-marked',
};

const DEFAULT_SUBJECT_ORDER = ['Physics', 'Chemistry', 'Mathematics'];
const ADV_SUBJECT_ORDER = ['Mathematics', 'Physics', 'Chemistry'];

// ─── Main Component ───────────────────────────────────────────
export default function TestSeriesExam({ testId, mode = 'exam', user, onSubmit, onExit, isLight, onToggleTheme }) {
  useWatermarkRemover();

  const [testData, setTestData]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  const [currentSubjectIdx, setCurrentSubjectIdx] = useState(0);
  const [currentSection, setCurrentSection] = useState('A'); // 'A' or 'B'
  const [currentQIdx, setCurrentQIdx]   = useState(0);
  const [answers, setAnswers]           = useState({});
  const [statusMap, setStatusMap]       = useState({});
  const [timeSpentMap, setTimeSpentMap] = useState({});
  const [timeLeft, setTimeLeft]         = useState(180 * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [hasAcceptedInstructions, setHasAcceptedInstructions] = useState(() => {
    if (mode === 'practice') return true;
    const savedStateJson = localStorage.getItem(`quantrex_exam_state_${testId}`);
    return !!savedStateJson;
  });
  const [numericalInput, setNumericalInput]   = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [answerChecked, setAnswerChecked] = useState(false); // practice mode: show answer after clicking button
  const startTimeRef = useRef(Date.now());
  const timerRef     = useRef(null);
  const currentTestIdRef = useRef(null);

  // ── Fetch test data ──────────────────────────────────────────
  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    fetch(import.meta.env.BASE_URL + `data/tests/${testId}.json?_t=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        // Map API field names for backward compatibility
        data.examType = data.examType || data.exam;
        data.duration = data.duration || data.durationMinutes;
        // Sort questions: Physics → Chemistry → Mathematics, then Section A before B
        if (data.questions) {
          data.questions = sortQuestions(data.questions, data.examType);
        }
        setTestData(data);

        const savedStateJson = localStorage.getItem(`quantrex_exam_state_${testId}`);
        if (savedStateJson && mode === 'exam') {
          try {
             const savedState = JSON.parse(savedStateJson);
             if (savedState.answers) setAnswers(savedState.answers);
             if (savedState.statusMap) setStatusMap(savedState.statusMap);
             if (savedState.timeSpentMap) setTimeSpentMap(savedState.timeSpentMap);
             if (savedState.timeLeft) setTimeLeft(savedState.timeLeft);
             if (savedState.currentSubjectIdx !== undefined) setCurrentSubjectIdx(savedState.currentSubjectIdx);
             if (savedState.currentSection !== undefined) setCurrentSection(savedState.currentSection);
             if (savedState.currentQIdx !== undefined) setCurrentQIdx(savedState.currentQIdx);
          } catch(e) { console.error("Error loading saved state", e); }
        } else {
            if (data.questions) {
               const order = data.examType === 'JEE Advanced' ? ADV_SUBJECT_ORDER : DEFAULT_SUBJECT_ORDER;
               const present = new Set(data.questions.map(q => q.subject || 'Miscellaneous'));
               const ordered = order.filter(s => present.has(s));
               [...present].forEach(s => { if (!ordered.includes(s)) ordered.push(s); });
               const sub = ordered[0] || order[0];
               const qs = data.questions.filter(q => (q.subject || 'Miscellaneous') === sub);
               const secs = [...new Set(qs.map(q => q.section || 'A'))].sort();
               if (secs.length > 0) setCurrentSection(secs[0]);
            }
            setTimeLeft((data.durationMinutes || data.duration || 180) * 60);
        }

        currentTestIdRef.current = testId;
        setLoading(false);
        setTimeout(() => { if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(); }, 300);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [testId]);

  // Ensure MathJax renders when solution becomes visible or question changes
  useEffect(() => {
    setTimeout(() => {
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise();
      }
    }, 100);
  }, [showSolution, answerChecked, currentQIdx]);

  // Sort: Physics, Chemistry, Mathematics; within each: Section A then B
  function sortQuestions(qs, examType) {
    const order = examType === 'JEE Advanced' ? ADV_SUBJECT_ORDER : DEFAULT_SUBJECT_ORDER;
    return [...qs].sort((a, b) => {
      const aSub = a.subject || 'Miscellaneous';
      const bSub = b.subject || 'Miscellaneous';
      const ai = order.indexOf(aSub) === -1 ? 99 : order.indexOf(aSub);
      const bi = order.indexOf(bSub) === -1 ? 99 : order.indexOf(bSub);
      if (ai !== bi) return ai - bi;
      // Section A before B
      const as = (a.section || 'A') === 'B' ? 1 : 0;
      const bs = (b.section || 'A') === 'B' ? 1 : 0;
      return as - bs;
    });
  }

  // ── Derived data ─────────────────────────────────────────────
  // Get subjects present in this paper, in NTA order
  const subjects = (() => {
    const order = testData?.examType === 'JEE Advanced' ? ADV_SUBJECT_ORDER : DEFAULT_SUBJECT_ORDER;
    if (!testData?.questions) return order;
    const present = new Set(testData.questions.map(q => q.subject || 'Miscellaneous'));
    const ordered = order.filter(s => present.has(s));
    // Add any extra subjects not in order
    [...present].forEach(s => { if (!ordered.includes(s)) ordered.push(s); });
    return ordered;
  })();

  const currentSubject = subjects[currentSubjectIdx] || subjects[0];

  // Get Section A and B for current subject
  const getSectionQs = useCallback((subjectName, section) => {
    if (!testData?.questions) return [];
    return testData.questions.filter(q => (q.subject || 'Miscellaneous') === subjectName && (q.section || 'A') === section);
  }, [testData]);

  const getSectionTypeLabel = useCallback((subjectName, section) => {
    const qs = getSectionQs(subjectName, section);
    if (qs.length === 0) return '';
    const t = qs[0].questionType;
    if (t === 'MCQM') return ' (Multiple Correct)';
    if (t === 'NUMERICAL') return ' (Numerical)';
    if (t === 'SUBJECTIVE') return ' (Subjective)';
    return ' (Single Correct)';
  }, [getSectionQs]);

  const getSubjectQs = useCallback((subjectName) => {
    if (!testData?.questions) return [];
    return testData.questions.filter(q => (q.subject || 'Miscellaneous') === subjectName);
  }, [testData]);

  const currentSectionQs = getSectionQs(currentSubject, currentSection);
  const question = currentSectionQs[currentQIdx];
  const qKey = question?.questionNumber;

  // Check which sections exist for current subject
  const sectionsForSubject = (sub) => {
    const qs = testData.questions.filter(q => (q.subject || 'Miscellaneous') === sub);
    const secs = [...new Set(qs.map(q => q.section || 'A'))];
    return secs.sort();
  };


  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!testData || loading || mode === 'practice' || !hasAcceptedInstructions) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; }
        return prev - 1;
      });
      if (qKey) {
        setTimeSpentMap(prev => ({
          ...prev,
          [qKey]: (prev[qKey] || 0) + 1
        }));
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [testData, loading, mode, qKey]);

  // ── Auto-save State ──────────────────────────────────────────
  useEffect(() => {
    if (loading || mode === 'practice' || !testId || !testData || currentTestIdRef.current !== testId) return;
    const stateToSave = {
      answers,
      statusMap,
      timeSpentMap,
      timeLeft,
      currentSubjectIdx,
      currentSection,
      currentQIdx
    };
    localStorage.setItem(`quantrex_exam_state_${testId}`, JSON.stringify(stateToSave));
  }, [answers, statusMap, timeSpentMap, timeLeft, currentSubjectIdx, currentSection, currentQIdx, loading, mode, testId, testData]);

  // ── Re-render MathJax ────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => { if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(); }, 120);
    setShowSolution(false);
    setAnswerChecked(false);
  }, [currentSubjectIdx, currentSection, currentQIdx]);



  // ── Mark question as visited ─────────────────────────────────
  useEffect(() => {
    if (!qKey) return;
    setStatusMap(prev => {
      if (!prev[qKey]) return { ...prev, [qKey]: STATUS.NOT_ANSWERED };
      return prev;
    });
    setNumericalInput(answers[qKey] !== undefined ? String(answers[qKey]) : '');
  }, [qKey]);

  // ── Helpers ──────────────────────────────────────────────────
  const formatTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const isLowTime = timeLeft < 300 && mode !== 'practice';

  const t = (question?.type || question?.questionType || '').toUpperCase().trim();
  const isMultiCorrect = t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'MULTIPLE_CORRECT' || t === 'MULTIPLE CORRECT' || t === 'MCQ (MULTIPLE CORRECT)';

  const selectOption = (idx) => {
    if (isMultiCorrect) {
      setAnswers(prev => {
        const currentAns = Array.isArray(prev[qKey]) ? prev[qKey] : [];
        const newAns = currentAns.includes(idx) ? currentAns.filter(i => i !== idx) : [...currentAns, idx].sort((a, b) => a - b);
        return { ...prev, [qKey]: newAns.length > 0 ? newAns : undefined };
      });
      setStatusMap(prev => ({
        ...prev,
        [qKey]: (prev[qKey] === STATUS.MARKED || prev[qKey] === STATUS.ANSWERED_MARKED) ? STATUS.ANSWERED_MARKED : STATUS.ANSWERED
      }));
    } else {
      setAnswers(prev => ({ ...prev, [qKey]: idx }));
      setStatusMap(prev => ({
        ...prev,
        [qKey]: (prev[qKey] === STATUS.MARKED || prev[qKey] === STATUS.ANSWERED_MARKED) ? STATUS.ANSWERED_MARKED : STATUS.ANSWERED
      }));
    }
  };

  const isAnsSelected = (selected) => {
    if (selected === undefined || selected === null || selected === '') return false;
    if (Array.isArray(selected)) return selected.length > 0;
    return true;
  };

  const checkAnswer = () => {
    setAnswerChecked(true);
    setShowSolution(true);
  };

  const clearResponse = () => {
    setAnswers(prev => { const n = { ...prev }; delete n[qKey]; return n; });
    setNumericalInput('');
    setStatusMap(prev => ({ ...prev, [qKey]: STATUS.NOT_ANSWERED }));
    setShowSolution(false);
    setAnswerChecked(false);
  };

  const goToNext = () => {
    // Save numerical if in practice
    if (question?.questionType === 'NUMERICAL' && numericalInput.trim()) {
      setAnswers(prev => ({ ...prev, [qKey]: numericalInput.trim() }));
      setStatusMap(prev => ({ ...prev, [qKey]: STATUS.ANSWERED }));
    }
    setShowSolution(false);
    setAnswerChecked(false);

    if (currentQIdx < currentSectionQs.length - 1) {
      setCurrentQIdx(prev => prev + 1);
    } else {
      // Try next section
      const sections = sectionsForSubject(currentSubject);
      const secIdx = sections.indexOf(currentSection);
      if (secIdx < sections.length - 1) {
        setCurrentSection(sections[secIdx + 1]);
        setCurrentQIdx(0);
      } else if (currentSubjectIdx < subjects.length - 1) {
        const nextSub = subjects[currentSubjectIdx + 1];
        const nextSections = sectionsForSubject(nextSub);
        setCurrentSubjectIdx(prev => prev + 1);
        setCurrentSection(nextSections[0] || 'A');
        setCurrentQIdx(0);
      }
    }
  };

  const saveAndNext = () => goToNext();

  const markForReview = () => {
    setStatusMap(prev => ({
      ...prev,
      [qKey]: (prev[qKey] === STATUS.ANSWERED || prev[qKey] === STATUS.ANSWERED_MARKED)
        ? STATUS.ANSWERED_MARKED : STATUS.MARKED
    }));
    goToNext();
  };

  const navigatePrev = () => {
    setShowSolution(false);
    setAnswerChecked(false);
    if (currentQIdx > 0) {
      setCurrentQIdx(prev => prev - 1);
    } else {
      const sections = sectionsForSubject(currentSubject);
      const secIdx = sections.indexOf(currentSection);
      if (secIdx > 0) {
        const prevSec = sections[secIdx - 1];
        setCurrentSection(prevSec);
        setCurrentQIdx(getSectionQs(currentSubject, prevSec).length - 1);
      } else if (currentSubjectIdx > 0) {
        const prevSub = subjects[currentSubjectIdx - 1];
        const prevSections = sectionsForSubject(prevSub);
        const lastSec = prevSections[prevSections.length - 1] || 'A';
        setCurrentSubjectIdx(prev => prev - 1);
        setCurrentSection(lastSec);
        setCurrentQIdx(getSectionQs(prevSub, lastSec).length - 1);
      }
    }
  };

  const jumpTo = (sIdx, sec, qIdx) => {
    setCurrentSubjectIdx(sIdx);
    setCurrentSection(sec);
    setCurrentQIdx(qIdx);
    setShowSolution(false);
    setAnswerChecked(false);
  };

  // ── Counts ───────────────────────────────────────────────────
  const counts = (() => {
    let answered = 0, notAnswered = 0, marked = 0, answeredMarked = 0, notVisited = 0;
    Object.values(statusMap).forEach(s => {
      if (s === STATUS.ANSWERED) answered++;
      else if (s === STATUS.NOT_ANSWERED) notAnswered++;
      else if (s === STATUS.MARKED) marked++;
      else if (s === STATUS.ANSWERED_MARKED) answeredMarked++;
      else notVisited++;
    });
    const total = testData?.questions?.length || 0;
    notVisited = total - answered - notAnswered - marked - answeredMarked;
    return { answered, notAnswered, marked, answeredMarked, notVisited };
  })();

  // ── Submit ───────────────────────────────────────────────────
  // Register online sync retry for offline submitted tests
  useEffect(() => {
    const handleOnlineSync = async () => {
      console.log("Device is online. Syncing queued test submissions...");
      const queueKey = 'quantrex_test_submissions_queue';
      try {
        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
        if (queue.length === 0) return;

        const remainingQueue = [];
        for (const payload of queue) {
          try {
            const res = await fetch('/api/tests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error();
          } catch (e) {
            remainingQueue.push(payload);
          }
        }

        if (remainingQueue.length > 0) {
          localStorage.setItem(queueKey, JSON.stringify(remainingQueue));
        } else {
          localStorage.removeItem(queueKey);
        }
      } catch (err) {
        console.error("Test submission sync error:", err);
      }
    };

    window.addEventListener('online', handleOnlineSync);
    return () => window.removeEventListener('online', handleOnlineSync);
  }, []);

  // ── Submit ───────────────────────────────────────────────────
  const doSubmit = (auto = false) => {
    clearInterval(timerRef.current);
    localStorage.removeItem(`quantrex_exam_state_${testId}`);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    let score = 0, correct = 0, wrong = 0, attempted = 0;
    
    // Filter wrong questions for Mistake Booster
    const wrongQuestions = [];
    
    testData?.questions?.forEach(q => {
      const ua = answers[q.questionNumber];
      if (ua === undefined || ua === null || ua === '' || (Array.isArray(ua) && ua.length === 0)) return;
      attempted++;
      
      let isCorrect = false;
      if (q.questionType === 'NUMERICAL') {
        if (String(ua).trim() === String(q.correctAnswer || '').trim()) {
          score += (q.marks || 4); correct++; isCorrect = true;
        } else {
          score += (q.negativeMarks ?? 0); wrong++;
        }
      } else if (q.questionType === 'MCQM') {
        const correctArr = Array.isArray(q.correctOptionsArray) ? q.correctOptionsArray : [Number(q.correctOption)];
        const userArr = Array.isArray(ua) ? ua : [Number(ua)];
        
        const isFullCorrect = correctArr.length === userArr.length && correctArr.every(val => userArr.includes(val));
        const hasIncorrectSelection = userArr.some(val => !correctArr.includes(val));
        
        if (isFullCorrect) {
          score += (q.marks || 4); correct++; isCorrect = true;
        } else if (hasIncorrectSelection) {
          score += (q.negativeMarks ?? -1); wrong++;
        } else {
          // Partial Marking logic
          if (correctArr.length === 4 && userArr.length === 3) score += 3;
          else if (correctArr.length >= 3 && userArr.length === 2) score += 2;
          else if (correctArr.length >= 2 && userArr.length === 1) score += 1;
          else score += userArr.length;
          correct++; isCorrect = true;
        }
      } else {
        if (Number(ua) === Number(q.correctOption)) {
          score += (q.marks || 4); correct++; isCorrect = true;
        } else {
          score += (q.negativeMarks ?? -1); wrong++;
        }
      }

      if (!isCorrect) {
        wrongQuestions.push({
          questionId: q.id || q.questionNumber,
          questionText: q.questionText || q.question || '',
          selectedOption: Array.isArray(ua) ? ua[0] : (isNaN(ua) ? 0 : Number(ua)),
          correctOption: q.correctOption !== undefined ? Number(q.correctOption) : (q.correctOptionIndex !== undefined ? Number(q.correctOptionIndex) : 0),
          options: q.options || []
        });
      }
    });

    const questionResults = testData?.questions?.map(q => {
      const ua = answers[q.questionNumber];
      const timeSpent = timeSpentMap[q.questionNumber] || 0;
      let isAttempted = false;
      let isCorrect = false;

      if (ua !== undefined && ua !== null && ua !== '' && (!Array.isArray(ua) || ua.length > 0)) {
        isAttempted = true;
        if (q.questionType === 'NUMERICAL') {
          if (String(ua).trim() === String(q.correctAnswer || '').trim()) isCorrect = true;
        } else if (q.questionType === 'MCQM') {
          const correctArr = Array.isArray(q.correctOptionsArray) ? q.correctOptionsArray : [Number(q.correctOption)];
          const userArr = Array.isArray(ua) ? ua : [Number(ua)];
          isCorrect = correctArr.length === userArr.length && correctArr.every(val => userArr.includes(val));
        } else {
          if (Number(ua) === Number(q.correctOption)) isCorrect = true;
        }
      }

      return {
        questionId: q.id || q.questionNumber,
        isAttempted,
        isCorrect,
        userAnswer: ua,
        timeSpent,
        difficulty: q.difficulty || 'Medium',
        topic: q.topic || 'General',
        subject: q.subject || 'Miscellaneous'
      };
    }) || [];

    // POST test results to MongoDB if user is logged in
    const userId = user?.id || user?._id;
    if (userId) {
      const payload = {
        userId,
        testId,
        testTitle: testData?.title || 'Mock Test',
        score,
        correctCount: correct,
        wrongCount: wrong,
        timeSpent: timeTaken,
        totalQuestions: testData?.questions?.length || 0,
        totalMarks: (testData?.questions?.length || 0) * 4,
        wrongQuestions
      };

      fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {
        // Queue submission locally if network fails
        try {
          const queueKey = 'quantrex_test_submissions_queue';
          const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
          queue.push(payload);
          localStorage.setItem(queueKey, JSON.stringify(queue));
        } catch (e) {
          console.error("Failed to queue offline test submission:", e);
        }
      });
      
      // Save logs in activity logs
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          actionType: 'chapter_complete',
          description: `Attempted test series: ${testData?.title || 'Mock Test'}. Score: ${score}/${(testData?.questions?.length || 0) * 4}`
        })
      }).catch(() => {});
    }

    setShowSubmitModal(false);
    if (onSubmit) onSubmit({ 
      testId, 
      score, 
      correct, 
      wrong, 
      attempted, 
      timeTaken, 
      autoSubmitted: auto, 
      answers, 
      questions: testData?.questions,
      questionResults 
    });
  };

  const handleAutoSubmit = () => doSubmit(true);

  // ── Loading / Error states ───────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 16 }}>
      <div className="nta-spinner" />
      <div>Loading test paper...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 20 }}>Failed to load test (ID: {testId})</div>
      <div style={{ color: '#94a3b8', margin: '8px 0 24px' }}>{error}</div>
      <button onClick={onExit} style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>← Go Back</button>
    </div>
  );

  if (!question && !loading) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 18 }}>No questions found for this section.</div>
      <button onClick={onExit} style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>← Go Back</button>
    </div>
  );

  const isAnswered = answers[qKey] !== undefined && answers[qKey] !== null && answers[qKey] !== '';
  const canCheckAnswer = mode === 'practice' && isAnswered && !answerChecked;

  return (
    <div className={`nta-exam-wrapper ${!isLight ? 'dark-theme' : ''}`}>
      {/* FORCE STYLES FOR PRACTICE MODE CORRECT/WRONG OPTIONS AND SOLUTION TEXT */}
      <style>{`
        .nta-option.correct, .nta-option.correct .nta-option-text, .nta-option.correct .tex2jax_process, .nta-option.correct *, .nta-option.correct .MathJax, .nta-option.correct mjx-container {
          color: #064e3b !important;
          fill: #064e3b !important;
          font-weight: bold !important;
        }
        .nta-option.wrong, .nta-option.wrong .nta-option-text, .nta-option.wrong .tex2jax_process, .nta-option.wrong *, .nta-option.wrong .MathJax, .nta-option.wrong mjx-container {
          color: #7f1d1d !important;
          fill: #7f1d1d !important;
          font-weight: bold !important;
        }
        .nta-solution-text, .nta-solution-text p, .nta-solution-text span, .nta-solution-text div, .nta-solution-text *, .nta-solution-text .MathJax, .nta-solution-text mjx-container {
          color: ${isLight ? '#0f172a' : '#cbd5e1'} !important;
          fill: ${isLight ? '#0f172a' : '#cbd5e1'} !important;
          font-weight: 600 !important;
        }
        .nta-solution-box {
          flex-shrink: 0 !important;
          min-height: min-content !important;
          padding-bottom: 50px !important;
        }
        .nta-question-panel {
          padding-bottom: 80px !important;
        }
        /* WATERMARK OVERLAY */
        .nta-solution-box {
          position: relative;
        }
        .nta-solution-box::before {
          content: 'Quantrex Academy';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: rgba(200, 200, 200, 0.15);
          font-weight: 800;
          transform: rotate(-30deg);
          pointer-events: none;
          z-index: 10;
        }
      `}</style>

      {/* ─── HEADER ─── */}
      <div className="nta-header">
        <div className="nta-header-left flex items-center gap-3">
          <button className="nta-exit-btn" onClick={onExit}>✕ Exit</button>
          <div className="nta-logo flex items-center gap-2">
            {getExamLogo(testData)}
            <span className="nta-logo-text">Quantrex Academy</span>
          </div>
          <div className="nta-exam-title flex items-center gap-2">
            <span>{testData?.title || 'Test Paper'}</span>
          </div>
          {mode === 'practice' && <span className="nta-practice-badge">PRACTICE MODE</span>}
        </div>
        <div className="nta-header-right flex items-center">
          <button
            onClick={() => setShowInstructionsModal(true)}
            title="View Exam Instructions"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm mr-3 cursor-pointer"
            style={{
              color: isLight ? '#1e293b' : '#f8fafc',
              backgroundColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <span className="text-blue-500 font-extrabold">ℹ</span> Instructions
          </button>
          <div className="nta-candidate-info">
            <div className="nta-candidate-avatar">{(user?.name || 'A')[0].toUpperCase()}</div>
            <div className="nta-candidate-name">{user?.name || 'Candidate'}</div>
          </div>
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
          {mode !== 'practice' && (
            <div className={`nta-timer-box ${isLowTime ? 'low-time' : ''}`}>
              <span className="nta-timer-label">⏱ Time Left</span>
              <span className="nta-timer-value">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── SUBJECT TABS ─── */}
      <div className="nta-subject-tabs">
        {subjects.map((sub, idx) => {
          const sq = getSubjectQs(sub);
          const answered = sq.filter(q => statusMap[q.questionNumber] === STATUS.ANSWERED || statusMap[q.questionNumber] === STATUS.ANSWERED_MARKED).length;
          return (
            <button
              key={sub}
              className={`nta-subject-tab ${currentSubjectIdx === idx ? 'active' : ''}`}
              onClick={() => {
                const secs = sectionsForSubject(sub);
                setCurrentSubjectIdx(idx);
                setCurrentSection(secs[0] || 'A');
                setCurrentQIdx(0);
              }}
            >
              {sub}
              <span className="nta-tab-badge">{answered}/{sq.length}</span>
            </button>
          );
        })}
        {/* Section A/B tabs */}
        <div className="nta-section-tabs">
          {sectionsForSubject(currentSubject).map(sec => (
            <button
              key={sec}
              className={`nta-section-tab ${currentSection === sec ? 'active' : ''}`}
              onClick={() => { setCurrentSection(sec); setCurrentQIdx(0); }}
            >
              {sec.startsWith('Sec') ? sec : `Section ${sec}`}
              <span style={{fontSize:'0.8em', opacity: 0.9, marginLeft: '4px'}}>{getSectionTypeLabel(currentSubject, sec)}</span>
            </button>
          ))}
          <span className="nta-section-info">
            Q{currentQIdx + 1} of {currentSectionQs.length}
          </span>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="nta-main-content">

        {/* LEFT: QUESTION PANEL */}
        <div className="nta-question-panel">
          {/* Section Instructions (if any) */}
          {question?.instruction && (
            <div className="nta-section-instruction" style={{ 
              padding: '15px', 
              marginBottom: '20px', 
              backgroundColor: '#eff6ff', 
              border: '1px solid #bfdbfe',
              borderLeft: '5px solid #3b82f6', 
              color: '#1e3a8a',
              fontSize: '15px', 
              borderRadius: '6px',
              fontFamily: '"Inter", "Segoe UI", sans-serif',
              lineHeight: '1.6'
            }}>
              <div dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(question.instruction) }} />
            </div>
          )}

          {/* Question header */}
          <div className="nta-question-header">
            <div className="nta-q-meta">
              <span className="nta-q-number-badge">Q.{currentQIdx + 1}</span>
              {(() => {
                const t = question?.questionType || question?.type || 'SCQ';
                const isMCQM = t === 'MCQM';
                const isNum = t === 'NUMERICAL';
                const isSubj = t === 'SUBJECTIVE';
                let label = isMCQM ? 'Multiple Correct' : (isSubj ? 'Subjective' : (isNum ? 'Numerical Answer Type' : 'Single Correct'));
                return (
                  <span className={`nta-q-type-badge ${isNum ? 'numerical' : 'mcq'}`}>
                    {label}
                  </span>
                );
              })()}
              {question?.topic && <span className="nta-topic-tag">{question.topic}</span>}
            </div>
            <div className="nta-marks-info">
              <span className="nta-marks-correct">+{question?.marks || 4}</span>
              <span className="nta-marks-wrong">{question?.questionType === 'NUMERICAL' ? '0' : (question?.negativeMarks ?? -1)}</span>
            </div>
          </div>

          {/* Question text */}
          <div className="nta-question-text">
            <div className="flex flex-wrap gap-2 mb-4">
              {(question.shift || question.title || question.year) && (
                <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold rounded border border-green-200">
                  {question.shift || question.title || question.year}
                </span>
              )}
              {isMultiCorrect && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded border border-purple-200">[MULTI CORRECT]</span>}
              {!isMultiCorrect && question?.questionType !== 'NUMERICAL' && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded border border-blue-200">[SINGLE CORRECT]</span>}
              {question?.questionType === 'NUMERICAL' && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded border border-orange-200">[NUMERICAL]</span>}
            </div>
            <div className="nta-q-content tex2jax_process"
              dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(question?.questionText || question?.question || '') }}
            />
          </div>

          {/* Options or Numerical */}
          {question?.questionType === 'NUMERICAL' ? (
            <div className="nta-numerical-section">
              <p className="nta-numerical-hint">Enter your integer/numerical answer:</p>
              <div className="nta-numerical-input-wrapper">
                <input
                  type="text"
                  className="nta-numerical-input"
                  value={numericalInput}
                  onChange={e => {
                    setNumericalInput(e.target.value);
                    if (e.target.value.trim()) {
                      setAnswers(prev => ({ ...prev, [qKey]: e.target.value.trim() }));
                      setStatusMap(prev => ({ ...prev, [qKey]: STATUS.ANSWERED }));
                    }
                  }}
                  placeholder="Enter your answer"
                />
              </div>
              {/* Practice mode: Check Answer button for numerical */}
              {mode === 'practice' && numericalInput.trim() && !answerChecked && (
                <button className="nta-check-answer-btn" onClick={checkAnswer}>
                  ✔ Check Answer
                </button>
              )}
              {mode === 'practice' && answerChecked && question?.correctAnswer !== undefined && (
                <div className={`nta-answer-reveal ${String(numericalInput.trim()) === String(question.correctAnswer) ? 'correct' : 'wrong'}`}>
                  <div className="nta-answer-reveal-label">
                    {String(numericalInput.trim()) === String(question.correctAnswer) ? '✓ Correct!' : '✗ Incorrect'}
                  </div>
                  <div>Correct Answer: <strong>{question.correctAnswer}</strong></div>
                </div>
              )}
            </div>
          ) : (
            <div className="nta-options">
              {(question?.options || []).map((opt, idx) => {
                const isSelected = isMultiCorrect 
                  ? (Array.isArray(answers[qKey]) && answers[qKey].includes(idx))
                  : answers[qKey] === idx;
                  
                let isCorrect = false;
                let isWrong = false;
                if (mode === 'practice' && answerChecked) {
                  if (isMultiCorrect) {
                    const correctArr = Array.isArray(question.correctOptionsArray) ? question.correctOptionsArray : [Number(question.correctOption)];
                    isCorrect = correctArr.includes(idx);
                    isWrong = isSelected && !isCorrect;
                  } else {
                    isCorrect = question?.correctOption === idx;
                    isWrong = isSelected && !isCorrect;
                  }
                }

                return (
                  <div
                    key={idx}
                    className={`nta-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                    onClick={() => { if (!answerChecked || mode !== 'practice') selectOption(idx); }}
                  >
                    <span className="nta-option-label" style={{ borderRadius: isMultiCorrect ? '4px' : '50%' }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="nta-option-text tex2jax_process">
                      {isCorrect && <style>{`#opt-${idx} * { color: #064e3b !important; fill: #064e3b !important; font-weight: bold !important; }`}</style>}
                      {isWrong && <style>{`#opt-${idx} * { color: #7f1d1d !important; fill: #7f1d1d !important; font-weight: bold !important; }`}</style>}
                      <div id={`opt-${idx}`} dangerouslySetInnerHTML={{ __html: fixExamGoalHtml(opt).replace(/<\/?(li|ul|ol)[^>]*>/gi, '') }} />
                    </div>
                    {isCorrect && <span className="nta-correct-tick">✓</span>}
                    {isWrong && <span className="nta-wrong-cross">✗</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Practice mode: Check Answer button (only after selecting option) */}
          {mode === 'practice' && question?.questionType !== 'NUMERICAL' && isAnswered && !answerChecked && (
            <div className="nta-check-answer-wrap">
              <button className="nta-check-answer-btn" onClick={checkAnswer}>
                ✓ Check Answer
              </button>
            </div>
          )}

          {/* Practice mode: Solution box */}
          {mode === 'practice' && answerChecked && showSolution && question?.solution && (
            <div className="mt-6">
              <TeacherSolution
                html={question.solution}
                correctOptionLabel={(() => {
                  if (question?.questionType === 'NUMERICAL') return question.correctAnswer;
                  if (isMultiCorrect) {
                    const correctArr = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctOptionIndex];
                    return correctArr.filter(i => i !== undefined && i !== -1).map(i => String.fromCharCode(65 + i)).join(', ');
                  }
                  if (question.correctOptionIndex !== undefined && question.correctOptionIndex >= 0) {
                    return String.fromCharCode(65 + question.correctOptionIndex);
                  }
                  return null;
                })()}
                isLight={isLight}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="nta-action-buttons">
            <button className="nta-btn nta-btn-mark" onClick={markForReview}>
              Mark for Review &amp; Next
            </button>
            <button className="nta-btn nta-btn-clear" onClick={clearResponse}>
              Clear Response
            </button>
            <button className="nta-btn nta-btn-save" onClick={saveAndNext}>
              Save &amp; Next
            </button>
          </div>

          {/* Nav Buttons */}
          <div className="nta-nav-buttons">
            <button
              className="nta-btn nta-btn-prev"
              onClick={navigatePrev}
              disabled={currentSubjectIdx === 0 && currentSection === sectionsForSubject(subjects[0])[0] && currentQIdx === 0}
            >
              ← Back
            </button>
            {mode !== 'practice' && (
              <button className="nta-btn nta-btn-submit" onClick={() => setShowSubmitModal(true)}>
                Submit Test
              </button>
            )}
            <button className="nta-btn nta-btn-next" onClick={goToNext}>
              Next →
            </button>
          </div>
        </div>

        {/* RIGHT: QUESTION PALETTE */}
        <div className="nta-palette-panel">
          {/* Candidate */}
          <div className="nta-palette-header">
            <div className="nta-palette-avatar">{(user?.name || 'A')[0].toUpperCase()}</div>
            <div>
              <div className="nta-palette-name">{user?.name || 'Candidate'}</div>
              <div className="nta-palette-exam">{mode === 'practice' ? 'Practice Mode' : 'Exam Mode'}</div>
            </div>
          </div>

          {/* Legend */}
          <div className="nta-legend">
            <div className="nta-legend-item"><span className="nta-dot answered"></span>{counts.answered} Answered</div>
            <div className="nta-legend-item"><span className="nta-dot not-answered"></span>{counts.notAnswered} Not Answered</div>
            <div className="nta-legend-item"><span className="nta-dot marked"></span>{counts.marked} Marked</div>
            <div className="nta-legend-item"><span className="nta-dot answered-marked"></span>{counts.answeredMarked} Ans+Marked</div>
            <div className="nta-legend-item"><span className="nta-dot not-visited"></span>{counts.notVisited} Not Visited</div>
          </div>

          {/* Per-subject, per-section palette */}
          {subjects.map((sub, sIdx) => {
            const secs = sectionsForSubject(sub);
            return (
              <div key={sub} className="nta-palette-section">
                <div
                  className={`nta-palette-subject-header ${currentSubjectIdx === sIdx ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentSubjectIdx(sIdx);
                    setCurrentSection(secs[0] || 'A');
                    setCurrentQIdx(0);
                  }}
                >
                  {sub} <span style={{ opacity: 0.7, fontSize: 11 }}>({getSubjectQs(sub).length}Q)</span>
                </div>
                {secs.map(sec => {
                  const sqs = getSectionQs(sub, sec);
                  if (sqs.length === 0) return null;
                  return (
                    <div key={sec}>
                      <div className={`nta-palette-section-label ${currentSubjectIdx === sIdx && currentSection === sec ? 'active' : ''}`}>
                        {sec.startsWith('Sec') ? sec : `Section ${sec}`} ({sqs.length}Q)
                      </div>
                      <div className="nta-palette-grid">
                        {sqs.map((q, qIdx) => {
                          const status = statusMap[q.questionNumber] || STATUS.NOT_VISITED;
                          const isCur  = currentSubjectIdx === sIdx && currentSection === sec && currentQIdx === qIdx;
                          return (
                            <button
                              key={qIdx}
                              className={`nta-palette-btn ${status} ${isCur ? 'current' : ''}`}
                              onClick={() => jumpTo(sIdx, sec, qIdx)}
                            >
                              {qIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Submit button always visible in palette for exam mode */}
          {mode !== 'practice' && (
            <button className="nta-btn nta-btn-submit-full" onClick={() => setShowSubmitModal(true)}>
              🚀 Submit Test Paper
            </button>
          )}
        </div>
      </div>

      {/* ─── SUBMIT MODAL ─── */}
      {showSubmitModal && (
        <div className="nta-modal-overlay">
          <div className="nta-modal">
            <h2 className="nta-modal-title">⚠️ Submit Test Paper?</h2>
            <p className="nta-modal-subtitle">Once submitted, you cannot change your answers.</p>
            <div className="nta-modal-stats">
              <div className="nta-stat-item answered">
                <span>{counts.answered}</span>
                <small>Answered</small>
              </div>
              <div className="nta-stat-item not-answered">
                <span>{counts.notAnswered + counts.notVisited}</span>
                <small>Not Answered</small>
              </div>
              <div className="nta-stat-item marked">
                <span>{counts.marked}</span>
                <small>Marked</small>
              </div>
              <div className="nta-stat-item answered-marked">
                <span>{counts.answeredMarked}</span>
                <small>Ans+Marked</small>
              </div>
            </div>
            <div className="nta-modal-actions">
              <button className="nta-btn nta-btn-cancel" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
              <button className="nta-btn nta-btn-confirm-submit" onClick={() => doSubmit(false)}>
                Yes, Submit ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── INSTRUCTIONS MODAL / OVERLAY ─── */}
      {(!hasAcceptedInstructions || showInstructionsModal) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
             style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all duration-300"
               style={{
                 backgroundColor: isLight ? '#ffffff' : '#0f172a',
                 borderColor: isLight ? '#cbd5e1' : '#334155',
                 color: isLight ? '#0f172a' : '#f8fafc'
               }}>
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between"
                 style={{
                   backgroundColor: isLight ? '#f8fafc' : '#1e293b',
                   borderColor: isLight ? '#e2e8f0' : '#334155'
                 }}>
              <div className="flex items-center gap-3">
                {getExamLogo(testData)}
                <div>
                  <h3 className="font-extrabold text-base uppercase tracking-wide" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                    {testData?.title || 'Examination Instructions'}
                  </h3>
                  <span className="text-xs font-semibold" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
                    Duration: {testData?.durationMinutes || testData?.duration || (timeLeft ? Math.round(timeLeft / 60) : 180)} Mins | Total Questions: {testData?.questions?.length || 75}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleTheme}
                  title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  className="px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: isLight ? '#eff6ff' : '#1e293b',
                    borderColor: isLight ? '#bfdbfe' : '#334155',
                    color: isLight ? '#1e3a8a' : '#93c5fd'
                  }}
                >
                  {isLight ? '☀ Light' : '☾ Dark'}
                </button>
                {hasAcceptedInstructions && (
                  <button 
                    onClick={() => setShowInstructionsModal(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    style={{ backgroundColor: isLight ? '#f1f5f9' : '#334155' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              
              <div className="p-4 rounded-xl border font-medium text-xs flex items-center gap-3"
                   style={{
                     backgroundColor: isLight ? '#eff6ff' : 'rgba(30, 58, 138, 0.25)',
                     borderColor: isLight ? '#bfdbfe' : 'rgba(59, 130, 246, 0.3)',
                     color: isLight ? '#1e40af' : '#93c5fd'
                   }}>
                <span className="text-base">ℹ</span>
                <span>Please read the instructions carefully before starting the test. The clock is set at the top right of your screen.</span>
              </div>

              {/* General Instructions */}
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider mb-2 border-b pb-1"
                    style={{ borderColor: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#2563eb' : '#60a5fa' }}>
                  1. General Instructions:
                </h4>
                <ol className="list-decimal list-inside space-y-2 pl-1" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
                  <li>Total duration of examination is <strong>{testData?.durationMinutes || testData?.duration || (timeLeft ? Math.round(timeLeft / 60) : 180)} minutes</strong>.</li>
                  <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</li>
                  <li>When the timer reaches zero, the examination will end automatically. You will not be required to end or submit your examination.</li>
                </ol>
              </div>

              {/* Question Palette Symbols */}
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider mb-3 border-b pb-1"
                    style={{ borderColor: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#2563eb' : '#60a5fa' }}>
                  2. Question Status Symbols:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border"
                       style={{ backgroundColor: isLight ? '#f8fafc' : '#1e293b', borderColor: isLight ? '#e2e8f0' : '#334155' }}>
                    <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs shadow-sm bg-gray-200 text-gray-700 border border-gray-300">1</div>
                    <span style={{ color: isLight ? '#334155' : '#cbd5e1' }}>You have not visited the question yet.</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border"
                       style={{ backgroundColor: isLight ? '#f8fafc' : '#1e293b', borderColor: isLight ? '#e2e8f0' : '#334155' }}>
                    <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs shadow-sm bg-red-500 text-white">2</div>
                    <span style={{ color: isLight ? '#334155' : '#cbd5e1' }}>You have not answered the question.</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border"
                       style={{ backgroundColor: isLight ? '#f8fafc' : '#1e293b', borderColor: isLight ? '#e2e8f0' : '#334155' }}>
                    <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs shadow-sm bg-emerald-500 text-white">3</div>
                    <span style={{ color: isLight ? '#334155' : '#cbd5e1' }}>You have answered the question.</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border"
                       style={{ backgroundColor: isLight ? '#f8fafc' : '#1e293b', borderColor: isLight ? '#e2e8f0' : '#334155' }}>
                    <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs shadow-sm bg-purple-600 text-white">4</div>
                    <span style={{ color: isLight ? '#334155' : '#cbd5e1' }}>You have marked the question for review.</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border md:col-span-2"
                       style={{ backgroundColor: isLight ? '#f8fafc' : '#1e293b', borderColor: isLight ? '#e2e8f0' : '#334155' }}>
                    <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs shadow-sm bg-purple-600 text-white relative">
                      5 <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
                    </div>
                    <span style={{ color: isLight ? '#334155' : '#cbd5e1' }}>Answered & Marked for Review (will be considered for evaluation).</span>
                  </div>
                </div>
              </div>

              {/* Marking Scheme */}
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider mb-2 border-b pb-1"
                    style={{ borderColor: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#2563eb' : '#60a5fa' }}>
                  3. Marking Scheme:
                </h4>
                <ul className="list-disc list-inside space-y-1.5 pl-1" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
                  <li><strong>Correct Answer:</strong> +4 Marks</li>
                  <li><strong>Incorrect Answer:</strong> -1 Mark (for MCQs)</li>
                  <li><strong>Unattempted / Left:</strong> 0 Marks</li>
                  <li>For Numerical value questions, enter digits or decimal numbers correctly.</li>
                </ul>
              </div>

              {/* Navigating & Answering */}
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider mb-2 border-b pb-1"
                    style={{ borderColor: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#2563eb' : '#60a5fa' }}>
                  4. Navigating to a Question & Answering:
                </h4>
                <ul className="list-disc list-inside space-y-1.5 pl-1" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
                  <li>Click on option / radio button or type in numerical box to choose your answer.</li>
                  <li>Click <strong>Save & Next</strong> to save your answer and move to the next question.</li>
                  <li>Click <strong>Mark for Review & Next</strong> to save and flag for later review.</li>
                  <li>Click <strong>Clear Response</strong> to deselect your answer.</li>
                </ul>
              </div>

            </div>

            {/* Modal Footer / Acceptance */}
            <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
                 style={{
                   backgroundColor: isLight ? '#f8fafc' : '#1e293b',
                   borderColor: isLight ? '#e2e8f0' : '#334155'
                 }}>
              {!hasAcceptedInstructions ? (
                <>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>
                    <input 
                      type="checkbox"
                      id="accept-instr-check"
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={(e) => {
                        const btn = document.getElementById('start-test-btn');
                        if (btn) btn.disabled = !e.target.checked;
                      }}
                    />
                    I have read and understood all the instructions.
                  </label>
                  <button
                    id="start-test-btn"
                    disabled
                    onClick={() => {
                      setHasAcceptedInstructions(true);
                      setShowInstructionsModal(false);
                    }}
                    className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    PROCEED TO TEST →
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="w-full sm:w-auto px-8 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xs uppercase rounded-xl transition-all ml-auto cursor-pointer"
                >
                  Close Instructions ✕
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
