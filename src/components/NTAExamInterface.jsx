import React, { useState, useEffect, useCallback, useRef } from 'react';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ZoomOut from 'lucide-react/dist/esm/icons/zoom-out';
import './NTAExamInterface.css';

const QUESTION_STATUS = {
  NOT_VISITED: 'not-visited',
  NOT_ANSWERED: 'not-answered',
  ANSWERED: 'answered',
  MARKED: 'marked',
  ANSWERED_MARKED: 'answered-marked',
};

export default function NTAExamInterface({ testData, onSubmit, onExit }) {
  const [currentSubject, setCurrentSubject] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [timeLeft, setTimeLeft] = useState((testData?.durationMinutes || 180) * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [numericalInput, setNumericalInput] = useState('');
  const [fontSize, setFontSize] = useState(1);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const subjects = testData?.sections?.length > 0
    ? testData.sections.map(s => s.name)
    : ['Physics', 'Chemistry', 'Mathematics'];

  const getSubjectQuestions = useCallback((subjectName) => {
    if (!testData?.questions) return [];
    return testData.questions.filter(q => q.subject === subjectName);
  }, [testData]);

  const currentSubjectName = subjects[currentSubject];
  const subjectQuestions = getSubjectQuestions(currentSubjectName);
  const question = subjectQuestions[currentQuestion];

  // Global question index
  const getGlobalIndex = (subjectIdx, qIdx) => {
    let total = 0;
    for (let i = 0; i < subjectIdx; i++) {
      total += getSubjectQuestions(subjects[i]).length;
    }
    return total + qIdx;
  };
  const globalIdx = getGlobalIndex(currentSubject, currentQuestion);
  const questionKey = question?.questionNumber || globalIdx;

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Mark as visited when navigating
  useEffect(() => {
    if (!questionKey) return;
    setQuestionStatus(prev => {
      if (!prev[questionKey]) {
        return { ...prev, [questionKey]: QUESTION_STATUS.NOT_ANSWERED };
      }
      return prev;
    });
    if (question?.questionType === 'NUMERICAL') {
      setNumericalInput(answers[questionKey] || '');
    }
  }, [questionKey]);

  const fixMathJax = (html) => {
    if (!html) return '';
    let fixed = html.replace(/\$\$/g, '$');
    fixed = fixed.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    fixed = fixed.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g, '\\sqrt[$1]{$2}');
    return fixed;
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const selectOption = (optionIdx) => {
    const newAnswers = { ...answers, [questionKey]: optionIdx };
    setAnswers(newAnswers);
    setQuestionStatus(prev => {
      const cur = prev[questionKey];
      return {
        ...prev,
        [questionKey]: cur === QUESTION_STATUS.MARKED || cur === QUESTION_STATUS.ANSWERED_MARKED
          ? QUESTION_STATUS.ANSWERED_MARKED
          : QUESTION_STATUS.ANSWERED
      };
    });
  };

  const clearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[questionKey];
    setAnswers(newAnswers);
    setNumericalInput('');
    setQuestionStatus(prev => ({
      ...prev,
      [questionKey]: QUESTION_STATUS.NOT_ANSWERED
    }));
  };

  const saveAndNext = () => {
    // Save numerical if applicable
    if (question?.questionType === 'NUMERICAL' && numericalInput.trim()) {
      setAnswers(prev => ({ ...prev, [questionKey]: numericalInput.trim() }));
      setQuestionStatus(prev => ({
        ...prev,
        [questionKey]: QUESTION_STATUS.ANSWERED
      }));
    }
    navigateNext();
  };

  const markForReview = () => {
    const cur = questionStatus[questionKey];
    setQuestionStatus(prev => ({
      ...prev,
      [questionKey]: cur === QUESTION_STATUS.ANSWERED || cur === QUESTION_STATUS.ANSWERED_MARKED
        ? QUESTION_STATUS.ANSWERED_MARKED
        : QUESTION_STATUS.MARKED
    }));
    navigateNext();
  };

  const navigateNext = () => {
    if (currentQuestion < subjectQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (currentSubject < subjects.length - 1) {
      setCurrentSubject(prev => prev + 1);
      setCurrentQuestion(0);
    }
  };

  const navigatePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (currentSubject > 0) {
      const prevSubjectIdx = currentSubject - 1;
      setCurrentSubject(prevSubjectIdx);
      setCurrentQuestion(getSubjectQuestions(subjects[prevSubjectIdx]).length - 1);
    }
  };

  const navigateToQuestion = (subjectIdx, qIdx) => {
    setCurrentSubject(subjectIdx);
    setCurrentQuestion(qIdx);
  };

  const getStatusCounts = () => {
    const counts = { answered: 0, notAnswered: 0, marked: 0, answeredMarked: 0, notVisited: 0 };
    const total = testData?.questions?.length || 0;
    const visited = Object.keys(questionStatus).length;
    counts.notVisited = total - visited;
    Object.values(questionStatus).forEach(s => {
      if (s === QUESTION_STATUS.ANSWERED) counts.answered++;
      else if (s === QUESTION_STATUS.NOT_ANSWERED) counts.notAnswered++;
      else if (s === QUESTION_STATUS.MARKED) counts.marked++;
      else if (s === QUESTION_STATUS.ANSWERED_MARKED) counts.answeredMarked++;
    });
    return counts;
  };

  const handleAutoSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    onSubmit && onSubmit({ answers, questionStatus, timeSpent, autoSubmitted: true });
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    clearInterval(timerRef.current);
    onSubmit && onSubmit({ answers, questionStatus, timeSpent, autoSubmitted: false });
  };

  const counts = getStatusCounts();
  const isLowTime = timeLeft < 300;

  return (
    <div className="nta-exam-wrapper">
      {/* TOP HEADER */}
      <div className="nta-header">
        <div className="nta-header-left">
          <div className="nta-logo">
            <span className="nta-logo-text">Quantrex Academy</span>
          </div>
          <div className="nta-exam-title">{testData?.title || 'JEE Main Mock Test'}</div>
        </div>
        <div className="nta-header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button onClick={() => setFontSize(prev => Math.max(0.7, prev - 0.1))} style={{ padding: '4px', cursor: 'pointer', background: 'transparent', border: 'none' }} title="Zoom Out"><ZoomOut size={18} color="white" /></button>
            <button onClick={() => setFontSize(prev => Math.min(2.5, prev + 0.1))} style={{ padding: '4px', cursor: 'pointer', background: 'transparent', border: 'none' }} title="Zoom In"><ZoomIn size={18} color="white" /></button>
          </div>
          <div className="nta-candidate-info">
            <div className="nta-candidate-name">Candidate</div>
          </div>
        </div>
      </div>

      {/* SUBJECT TABS */}
      <div className="nta-subject-tabs">
        {subjects.map((sub, idx) => (
          <button
            key={sub}
            className={`nta-subject-tab ${currentSubject === idx ? 'active' : ''}`}
            onClick={() => { setCurrentSubject(idx); setCurrentQuestion(0); }}
          >
            {sub}
          </button>
        ))}
        <div className="nta-timer-box">
          <span className="nta-timer-label">Time Left</span>
          <span className={`nta-timer-value ${isLowTime ? 'low-time' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="nta-main-content">
        {/* LEFT: QUESTION PANEL */}
        <div className="nta-question-panel">
          {/* Section Label */}
          <div className="nta-section-label">
            Section: {currentSubjectName} &nbsp;|&nbsp; Question No. {currentQuestion + 1} of {subjectQuestions.length}
          </div>

          {/* Question Type Badge */}
          <div className="nta-question-type-badge">
            {question?.questionType === 'NUMERICAL' ? '🔢 Numerical Answer Type' : '🔵 Multiple Choice Question'}
            &nbsp;|&nbsp; +{question?.marks || 4} / {question?.negativeMarks ?? -1}
          </div>

          {/* Question Text */}
          <div className="nta-question-text" style={{ fontSize: `${fontSize}rem` }}>
            <span className="nta-q-number">Q{currentQuestion + 1}.</span>
            <span className="nta-q-content" dangerouslySetInnerHTML={{ __html: fixMathJax(question?.questionText || 'Loading...') }} />
          </div>

          {/* Options or Numerical Input */}
          {question?.questionType === 'NUMERICAL' ? (
            <div className="nta-numerical-section">
              <p className="nta-numerical-hint">Enter your answer (numerical value):</p>
              <div className="nta-numerical-input-wrapper">
                <input
                  type="text"
                  className="nta-numerical-input"
                  value={numericalInput}
                  onChange={e => setNumericalInput(e.target.value)}
                  placeholder="Enter numerical answer..."
                />
              </div>
            </div>
          ) : (
            <div className="nta-options">
              {(question?.options || []).map((opt, idx) => (
                <div
                  key={idx}
                  className={`nta-option ${answers[questionKey] === idx ? 'selected' : ''}`}
                  onClick={() => selectOption(idx)}
                >
                  <span className="nta-option-label">{String.fromCharCode(65 + idx)}.</span>
                  <span className="nta-option-text" style={{ fontSize: `${Math.max(0.8, fontSize - 0.1)}rem` }} dangerouslySetInnerHTML={{ __html: fixMathJax(opt) }} />
                </div>
              ))}
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

          {/* Navigation */}
          <div className="nta-nav-buttons">
            <button className="nta-btn nta-btn-prev" onClick={navigatePrev} disabled={currentSubject === 0 && currentQuestion === 0}>
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
          {/* Status Legend */}
          <div className="nta-legend">
            <div className="nta-legend-item">
              <span className="nta-dot answered"></span> {counts.answered} Answered
            </div>
            <div className="nta-legend-item">
              <span className="nta-dot not-answered"></span> {counts.notAnswered} Not Answered
            </div>
            <div className="nta-legend-item">
              <span className="nta-dot marked"></span> {counts.marked} Marked
            </div>
            <div className="nta-legend-item">
              <span className="nta-dot answered-marked"></span> {counts.answeredMarked} Answered &amp; Marked
            </div>
            <div className="nta-legend-item">
              <span className="nta-dot not-visited"></span> {counts.notVisited} Not Visited
            </div>
          </div>

          {/* Per Subject Palette */}
          {subjects.map((sub, sIdx) => {
            const sqs = getSubjectQuestions(sub);
            return (
              <div key={sub} className="nta-palette-section">
                <div
                  className={`nta-palette-subject-header ${currentSubject === sIdx ? 'active' : ''}`}
                  onClick={() => { setCurrentSubject(sIdx); setCurrentQuestion(0); }}
                >
                  {sub}
                </div>
                <div className="nta-palette-grid">
                  {sqs.map((q, qIdx) => {
                    const gkey = q.questionNumber || getGlobalIndex(sIdx, qIdx);
                    const status = questionStatus[gkey] || QUESTION_STATUS.NOT_VISITED;
                    const isCurrent = currentSubject === sIdx && currentQuestion === qIdx;
                    return (
                      <button
                        key={qIdx}
                        className={`nta-palette-btn ${status} ${isCurrent ? 'current' : ''}`}
                        onClick={() => navigateToQuestion(sIdx, qIdx)}
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
            Submit Test Paper
          </button>
        </div>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="nta-modal-overlay">
          <div className="nta-modal">
            <h2 className="nta-modal-title">⚠️ Submit Test?</h2>
            <p className="nta-modal-subtitle">Are you sure you want to submit the test?</p>
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
                <span>{counts.marked + counts.answeredMarked}</span>
                <small>Marked</small>
              </div>
            </div>
            <div className="nta-modal-actions">
              <button className="nta-btn nta-btn-cancel" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
              <button className="nta-btn nta-btn-confirm-submit" onClick={handleSubmit}>
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
