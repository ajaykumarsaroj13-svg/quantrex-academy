import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../components/NTAExamInterface.css';

// ─── Constants ────────────────────────────────────────────────
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

const STATUS = {
  NOT_VISITED:      'not-visited',
  NOT_ANSWERED:     'not-answered',
  ANSWERED:         'answered',
  MARKED:           'marked',
  ANSWERED_MARKED:  'answered-marked',
};

// ─── Main Component ───────────────────────────────────────────
export default function TestSeriesExam({ testId, mode = 'exam', user, onSubmit, onExit }) {
  const [testData, setTestData]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [currentSubjectIdx, setCurrentSubjectIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx]   = useState(0);
  const [answers, setAnswers]           = useState({});    // { questionNumber: optionIdx | string }
  const [statusMap, setStatusMap]       = useState({});    // { questionNumber: STATUS }
  const [timeLeft, setTimeLeft]         = useState(180 * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [numericalInput, setNumericalInput]   = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerRef     = useRef(null);

  // ── Fetch test data ──────────────────────────────────────────
  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    
    // Intercept demo test IDs
    if (String(testId).startsWith('d')) {
      setTimeout(() => {
        const subjects = ['Mathematics', 'Physics', 'Chemistry'];
        if (testId === 'd5') subjects.length = 1; // NDA Math only has Mathematics
        
        const mockQuestions = [];
        let qNum = 1;
        subjects.forEach(sub => {
          for (let i = 0; i < 15; i++) {
            const isNumerical = i >= 10;
            mockQuestions.push({
              questionNumber: qNum++,
              subject: sub,
              section: isNumerical ? 'B' : 'A',
              questionType: isNumerical ? 'NUMERICAL' : 'MCQ',
              marks: 4,
              negativeMarks: -1,
              questionText: `<p>This is a sample practice question for ${sub}. Evaluate the expression or choose the correct option.</p>`,
              options: isNumerical ? [] : ['Option A', 'Option B', 'Option C', 'Option D'],
              correctOption: isNumerical ? null : Math.floor(Math.random() * 4),
              correctAnswer: isNumerical ? '42' : null,
              solution: `<p>Sample solution explanation for ${sub} question.</p>`
            });
          }
        });

        setTestData({
          id: testId,
          title: testId === 'd5' ? 'NDA & NA (I) 2025 — Mathematics' : 'Practice Mock Test',
          durationMinutes: 180,
          sections: subjects.map(s => ({ name: s })),
          questions: mockQuestions
        });
        setTimeLeft(180 * 60);
        setLoading(false);
        setTimeout(() => { if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(); }, 300);
      }, 500);
      return;
    }

    fetch(`${API_BASE}/api/test-series/${testId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setTestData(data);
        setTimeLeft((data.durationMinutes || 180) * 60);
        setLoading(false);
        // MathJax render
        setTimeout(() => { if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(); }, 300);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [testId]);

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!testData || loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [testData, loading]);

  // ── Re-render MathJax on question change ────────────────────
  useEffect(() => {
    setTimeout(() => { if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(); }, 100);
    setShowSolution(false);
  }, [currentSubjectIdx, currentQIdx]);

  // ── Derived data ─────────────────────────────────────────────
  const subjects = testData?.sections?.length > 0
    ? testData.sections.map(s => s.name)
    : ['Physics', 'Chemistry', 'Mathematics'];

  const getSubjectQs = useCallback((subjectName) => {
    if (!testData?.questions) return [];
    return testData.questions.filter(q => q.subject === subjectName);
  }, [testData]);

  const currentSubject   = subjects[currentSubjectIdx] || 'Physics';
  const subjectQuestions = getSubjectQs(currentSubject);
  const question         = subjectQuestions[currentQIdx];
  const qKey             = question?.questionNumber;

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

  const selectOption = (idx) => {
    setAnswers(prev => ({ ...prev, [qKey]: idx }));
    setStatusMap(prev => ({
      ...prev,
      [qKey]: (prev[qKey] === STATUS.MARKED || prev[qKey] === STATUS.ANSWERED_MARKED)
        ? STATUS.ANSWERED_MARKED : STATUS.ANSWERED
    }));
    if (mode === 'practice') setShowSolution(true);
  };

  const clearResponse = () => {
    setAnswers(prev => { const n = { ...prev }; delete n[qKey]; return n; });
    setNumericalInput('');
    setStatusMap(prev => ({ ...prev, [qKey]: STATUS.NOT_ANSWERED }));
    setShowSolution(false);
  };

  const saveAndNext = () => {
    if (question?.questionType === 'NUMERICAL' && numericalInput.trim()) {
      setAnswers(prev => ({ ...prev, [qKey]: numericalInput.trim() }));
      setStatusMap(prev => ({ ...prev, [qKey]: STATUS.ANSWERED }));
    } else if (answers[qKey] !== undefined) {
      setStatusMap(prev => ({ ...prev, [qKey]: STATUS.ANSWERED }));
    }
    navigateNext();
  };

  const markForReview = () => {
    if (question?.questionType === 'NUMERICAL' && numericalInput.trim()) {
      setAnswers(prev => ({ ...prev, [qKey]: numericalInput.trim() }));
      setStatusMap(prev => ({ ...prev, [qKey]: STATUS.ANSWERED_MARKED }));
    } else {
      const cur = statusMap[qKey];
      setStatusMap(prev => ({
        ...prev,
        [qKey]: (cur === STATUS.ANSWERED || cur === STATUS.ANSWERED_MARKED)
          ? STATUS.ANSWERED_MARKED : STATUS.MARKED
      }));
    }
    navigateNext();
  };

  const navigateNext = () => {
    if (currentQIdx < subjectQuestions.length - 1) {
      setCurrentQIdx(p => p + 1);
    } else if (currentSubjectIdx < subjects.length - 1) {
      setCurrentSubjectIdx(p => p + 1);
      setCurrentQIdx(0);
    }
  };

  const navigatePrev = () => {
    if (currentQIdx > 0) {
      setCurrentQIdx(p => p - 1);
    } else if (currentSubjectIdx > 0) {
      const prevIdx = currentSubjectIdx - 1;
      setCurrentSubjectIdx(prevIdx);
      setCurrentQIdx(getSubjectQs(subjects[prevIdx]).length - 1);
    }
  };

  const jumpTo = (sIdx, qIdx) => { setCurrentSubjectIdx(sIdx); setCurrentQIdx(qIdx); };

  const getStatusCounts = () => {
    const total = testData?.questions?.length || 0;
    const visited = Object.keys(statusMap).length;
    const counts = { answered: 0, notAnswered: 0, marked: 0, answeredMarked: 0 };
    Object.values(statusMap).forEach(s => {
      if (s === STATUS.ANSWERED) counts.answered++;
      else if (s === STATUS.NOT_ANSWERED) counts.notAnswered++;
      else if (s === STATUS.MARKED) counts.marked++;
      else if (s === STATUS.ANSWERED_MARKED) counts.answeredMarked++;
    });
    counts.notVisited = total - visited;
    return counts;
  };

  const buildSubmitPayload = () => ({
    answers,
    timeSpentSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
    autoSubmitted: false
  });

  const handleAutoSubmit = () => {
    clearInterval(timerRef.current);
    doSubmit(true);
  };

  const doSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    setShowSubmitModal(false);
    const payload = { answers, timeSpentSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000) };
    try {
      const res = await fetch(`${API_BASE}/api/test-series/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      onSubmit && onSubmit({ ...result, testTitle: testData?.title, autoSubmitted: auto });
    } catch(e) {
      // Fallback: compute locally
      let score = 0, correct = 0, wrong = 0, skipped = 0;
      testData?.questions?.forEach(q => {
        const ua = answers[q.questionNumber];
        if (ua === undefined || ua === -1) { skipped++; return; }
        const isCorrect = q.questionType === 'MCQ'
          ? parseInt(ua) === q.correctOption
          : String(ua).trim() === String(q.correctAnswer || '').trim();
        if (isCorrect) { score += q.marks; correct++; }
        else if (q.questionType === 'MCQ') { score += q.negativeMarks; wrong++; }
        else skipped++;
      });
      onSubmit && onSubmit({
        testId, testTitle: testData?.title, totalScore: score,
        totalMarks: testData?.totalMarks || 300,
        correctCount: correct, wrongCount: wrong, skippedCount: skipped,
        percentile: ((score / (testData?.totalMarks || 300)) * 100).toFixed(1),
        autoSubmitted: auto, answers, questions: testData?.questions
      });
    }
  };

  const counts = getStatusCounts();
  const isLowTime = timeLeft < 300;

  // ── Loading / Error states ────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Loading Test Paper...</div>
        <div style={{ color: '#94a3b8', marginTop: 8 }}>Please wait while we prepare your exam</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 20 }}>Failed to load test (ID: {testId})</div>
        <div style={{ color: '#94a3b8', margin: '8px 0 24px' }}>{error}</div>
        <button onClick={onExit} style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>← Go Back</button>
      </div>
    </div>
  );

  if (!question) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div>No questions found for this paper.</div>
    </div>
  );

  return (
    <div className="nta-exam-wrapper">
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
          <div className={`nta-timer-box ${isLowTime ? 'low-time' : ''}`}>
            <span className="nta-timer-label">⏱ Time Left</span>
            <span className="nta-timer-value">{formatTime(timeLeft)}</span>
          </div>
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
              onClick={() => { setCurrentSubjectIdx(idx); setCurrentQIdx(0); }}
            >
              {sub}
              <span className="nta-tab-badge">{answered}/{sq.length}</span>
            </button>
          );
        })}
        <div className="nta-section-info">
          Section {question?.section === 'B' ? 'B — Numerical' : 'A — MCQ'} &nbsp;|&nbsp; Q{currentQIdx + 1} of {subjectQuestions.length}
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="nta-main-content">

        {/* LEFT: QUESTION PANEL */}
        <div className="nta-question-panel">
          {/* Question header */}
          <div className="nta-question-header">
            <div className="nta-q-meta">
              <span className="nta-q-number-badge">Q.{currentQIdx + 1}</span>
              <span className={`nta-q-type-badge ${question?.questionType === 'NUMERICAL' ? 'numerical' : 'mcq'}`}>
                {question?.questionType === 'NUMERICAL' ? '🔢 Integer Type' : '🔵 Single Choice'}
              </span>
              {question?.topic && <span className="nta-topic-tag">{question.topic}</span>}
            </div>
            <div className="nta-marks-info">
              <span className="nta-marks-correct">+{question?.marks || 4}</span>
              <span className="nta-marks-wrong">{question?.negativeMarks ?? -1}</span>
            </div>
          </div>

          {/* Question text */}
          <div className="nta-question-text tex2jax_process"
            dangerouslySetInnerHTML={{ __html: question?.questionText || '' }}
          />

          {/* Options or Numerical */}
          {question?.questionType === 'NUMERICAL' ? (
            <div className="nta-numerical-section">
              <p className="nta-numerical-hint">Enter your numerical answer below:</p>
              <div className="nta-numerical-input-wrapper">
                <input
                  type="text"
                  className="nta-numerical-input"
                  value={numericalInput}
                  onChange={e => {
                    setNumericalInput(e.target.value);
                    if (mode === 'practice' && e.target.value.trim()) {
                      setAnswers(prev => ({ ...prev, [qKey]: e.target.value.trim() }));
                      setStatusMap(prev => ({ ...prev, [qKey]: STATUS.ANSWERED }));
                    }
                  }}
                  placeholder="e.g. 42 or 3.14"
                />
              </div>
              {mode === 'practice' && question?.correctAnswer && (
                <div className="nta-practice-answer">
                  Correct Answer: <strong>{question.correctAnswer}</strong>
                </div>
              )}
            </div>
          ) : (
            <div className="nta-options">
              {(question?.options || []).map((opt, idx) => {
                const isSelected = answers[qKey] === idx;
                const isCorrect  = mode === 'practice' && question?.correctOption === idx;
                const isWrong    = mode === 'practice' && showSolution && isSelected && !isCorrect;
                return (
                  <div
                    key={idx}
                    className={`nta-option ${isSelected ? 'selected' : ''} ${isCorrect && showSolution ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                    onClick={() => selectOption(idx)}
                  >
                    <span className="nta-option-label">{String.fromCharCode(65 + idx)}</span>
                    <span className="nta-option-text tex2jax_process" dangerouslySetInnerHTML={{ __html: opt }} />
                    {isCorrect && showSolution && <span className="nta-correct-tick">✓</span>}
                    {isWrong && <span className="nta-wrong-cross">✗</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Practice mode: Solution */}
          {mode === 'practice' && showSolution && question?.solution && (
            <div className="nta-solution-box">
              <div className="nta-solution-title">💡 Solution</div>
              <div className="nta-solution-text tex2jax_process" dangerouslySetInnerHTML={{ __html: question.solution }} />
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
              disabled={currentSubjectIdx === 0 && currentQIdx === 0}
            >
              ← Back
            </button>
            <button className="nta-btn nta-btn-submit" onClick={() => setShowSubmitModal(true)}>
              Submit Test
            </button>
            <button className="nta-btn nta-btn-next" onClick={navigateNext}>
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
              <div className="nta-palette-exam">{testData?.exam}</div>
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

          {/* Per-subject palette */}
          {subjects.map((sub, sIdx) => {
            const sqs = getSubjectQs(sub);
            return (
              <div key={sub} className="nta-palette-section">
                <div
                  className={`nta-palette-subject-header ${currentSubjectIdx === sIdx ? 'active' : ''}`}
                  onClick={() => { setCurrentSubjectIdx(sIdx); setCurrentQIdx(0); }}
                >
                  {sub} <span style={{ opacity: 0.7, fontSize: 11 }}>({sqs.length}Q)</span>
                </div>
                <div className="nta-palette-grid">
                  {sqs.map((q, qIdx) => {
                    const status = statusMap[q.questionNumber] || STATUS.NOT_VISITED;
                    const isCur  = currentSubjectIdx === sIdx && currentQIdx === qIdx;
                    return (
                      <button
                        key={qIdx}
                        className={`nta-palette-btn ${status} ${isCur ? 'current' : ''}`}
                        onClick={() => jumpTo(sIdx, qIdx)}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button className="nta-btn nta-btn-submit-full" onClick={() => setShowSubmitModal(true)}>
            🚀 Submit Test Paper
          </button>
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
