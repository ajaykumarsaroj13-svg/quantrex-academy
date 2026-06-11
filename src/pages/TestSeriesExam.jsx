import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../components/NTAExamInterface.css';
import TeacherSolution from '../components/TeacherSolution';

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
  const [testData, setTestData]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [currentSubjectIdx, setCurrentSubjectIdx] = useState(0);
  const [currentSection, setCurrentSection] = useState('A'); // 'A' or 'B'
  const [currentQIdx, setCurrentQIdx]   = useState(0);
  const [answers, setAnswers]           = useState({});
  const [statusMap, setStatusMap]       = useState({});
  const [timeLeft, setTimeLeft]         = useState(180 * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [numericalInput, setNumericalInput]   = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [answerChecked, setAnswerChecked] = useState(false); // practice mode: show answer after clicking button
  const startTimeRef = useRef(Date.now());
  const timerRef     = useRef(null);

  // ── Fetch test data ──────────────────────────────────────────
  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    fetch(`/data/tests/${testId}.json?v=3`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        // Sort questions: Physics → Chemistry → Mathematics, then Section A before B
        if (data.questions) {
          data.questions = sortQuestions(data.questions, data.examType);
        }
        setTestData(data);
        if (data.questions) {
           const order = data.examType === 'JEE Advanced' ? ADV_SUBJECT_ORDER : DEFAULT_SUBJECT_ORDER;
           const sub = order[0];
           const qs = data.questions.filter(q => q.subject === sub);
           const secs = [...new Set(qs.map(q => q.section || 'A'))].sort();
           if (secs.length > 0) setCurrentSection(secs[0]);
        }
        setTimeLeft((data.durationMinutes || data.duration || 180) * 60);
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
      const ai = order.indexOf(a.subject) === -1 ? 99 : order.indexOf(a.subject);
      const bi = order.indexOf(b.subject) === -1 ? 99 : order.indexOf(b.subject);
      if (ai !== bi) return ai - bi;
      // Section A before B
      const as = a.section === 'B' ? 1 : 0;
      const bs = b.section === 'B' ? 1 : 0;
      return as - bs;
    });
  }

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!testData || loading || mode === 'practice') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [testData, loading, mode]);

  // ── Re-render MathJax ────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => { if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(); }, 120);
    setShowSolution(false);
    setAnswerChecked(false);
  }, [currentSubjectIdx, currentSection, currentQIdx]);

  // ── Derived data ─────────────────────────────────────────────
  // Get subjects present in this paper, in NTA order
  const subjects = (() => {
    const order = testData?.examType === 'JEE Advanced' ? ADV_SUBJECT_ORDER : DEFAULT_SUBJECT_ORDER;
    if (!testData?.questions) return order;
    const present = new Set(testData.questions.map(q => q.subject));
    const ordered = order.filter(s => present.has(s));
    // Add any extra subjects not in order
    [...present].forEach(s => { if (!ordered.includes(s)) ordered.push(s); });
    return ordered;
  })();

  const currentSubject = subjects[currentSubjectIdx] || subjects[0];

  // Get Section A and B for current subject
  const getSectionQs = useCallback((subjectName, section) => {
    if (!testData?.questions) return [];
    return testData.questions.filter(q => q.subject === subjectName && q.section === section);
  }, [testData]);

  const getSubjectQs = useCallback((subjectName) => {
    if (!testData?.questions) return [];
    return testData.questions.filter(q => q.subject === subjectName);
  }, [testData]);

  const currentSectionQs = getSectionQs(currentSubject, currentSection);
  const question = currentSectionQs[currentQIdx];
  const qKey = question?.questionNumber;

  // Check which sections exist for current subject
  const sectionsForSubject = (sub) => {
    const qs = testData.questions.filter(q => q.subject === sub);
    const secs = [...new Set(qs.map(q => q.section || 'A'))];
    return secs.sort();
  };

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

  const selectOption = (idx) => {
    setAnswers(prev => ({ ...prev, [qKey]: idx }));
    setStatusMap(prev => ({
      ...prev,
      [qKey]: (prev[qKey] === STATUS.MARKED || prev[qKey] === STATUS.ANSWERED_MARKED)
        ? STATUS.ANSWERED_MARKED : STATUS.ANSWERED
    }));
    // In practice mode, don't auto-show solution; wait for "Check Answer" button
    // In test mode, do nothing extra
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
  const doSubmit = (auto = false) => {
    clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    let score = 0, correct = 0, wrong = 0, attempted = 0;
    testData?.questions?.forEach(q => {
      const ua = answers[q.questionNumber];
      if (ua === undefined || ua === null || ua === '') return;
      attempted++;
      const isCorrect = q.questionType === 'NUMERICAL'
        ? String(ua).trim() === String(q.correctAnswer || '').trim()
        : Number(ua) === Number(q.correctOption);
      if (isCorrect) { score += (q.marks || 4); correct++; }
      else if (q.questionType === 'MCQ') { score += (q.negativeMarks ?? -1); wrong++; }
    });
    setShowSubmitModal(false);
    if (onSubmit) onSubmit({ score, correct, wrong, attempted, timeTaken, autoSubmitted: auto, answers, questions: testData?.questions });
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
        <div className="nta-header-left">
          <button className="nta-exit-btn" onClick={onExit}>✕ Exit</button>
          <div className="nta-logo">
            <span className="nta-logo-icon">⚡</span>
            <span className="nta-logo-text">Quantrex Academy</span>
          </div>
          <div className="nta-exam-title">{testData?.title || 'Test Paper'}</div>
          {mode === 'practice' && <span className="nta-practice-badge">PRACTICE MODE</span>}
        </div>
        <div className="nta-header-right">
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
              <div dangerouslySetInnerHTML={{ __html: question.instruction }} />
            </div>
          )}

          {/* Question header */}
          <div className="nta-question-header">
            <div className="nta-q-meta">
              <span className="nta-q-number-badge">Q.{currentQIdx + 1}</span>
              <span className={`nta-q-type-badge ${question?.questionType === 'NUMERICAL' ? 'numerical' : 'mcq'}`}>
                {question?.questionType === 'NUMERICAL' ? '🔢 Integer Type' : '🔵 Single Correct'}
              </span>
              {question?.topic && <span className="nta-topic-tag">{question.topic}</span>}
            </div>
            <div className="nta-marks-info">
              <span className="nta-marks-correct">+{question?.marks || 4}</span>
              <span className="nta-marks-wrong">{question?.questionType === 'NUMERICAL' ? '0' : (question?.negativeMarks ?? -1)}</span>
            </div>
          </div>

          {/* Question text */}
          <div className="nta-question-text">
            <div className="nta-q-content tex2jax_process"
              dangerouslySetInnerHTML={{ __html: question?.questionText || '' }}
            />
          </div>

          {/* Options or Numerical */}
          {question?.questionType === 'NUMERICAL' ? (
            <div className="nta-numerical-section">
              <p className="nta-numerical-hint">Enter your integer/numerical answer:</p>
              <div className="nta-numerical-input-wrapper">
                <input
                  type="number"
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
                const isSelected = answers[qKey] === idx;
                const isCorrect  = mode === 'practice' && answerChecked && question?.correctOption === idx;
                const isWrong    = mode === 'practice' && answerChecked && isSelected && !isCorrect;
                return (
                  <div
                    key={idx}
                    className={`nta-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                    onClick={() => { if (!answerChecked || mode !== 'practice') selectOption(idx); }}
                  >
                    <span className="nta-option-label">{String.fromCharCode(65 + idx)}</span>
                    <div className="nta-option-text tex2jax_process">
                      {isCorrect && <style>{`#opt-${idx} * { color: #064e3b !important; fill: #064e3b !important; font-weight: bold !important; }`}</style>}
                      {isWrong && <style>{`#opt-${idx} * { color: #7f1d1d !important; fill: #7f1d1d !important; font-weight: bold !important; }`}</style>}
                      <div id={`opt-${idx}`} dangerouslySetInnerHTML={{ __html: opt }} />
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
                ✔ Check Answer
              </button>
            </div>
          )}

          {/* Practice mode: Solution box */}
          {mode === 'practice' && answerChecked && showSolution && question?.solution && (
            <div className="mt-6">
              <TeacherSolution html={question.solution} />
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
    </div>
  );
}
