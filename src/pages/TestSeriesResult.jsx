import React, { useState, useEffect } from 'react';
import TeacherSolution from '../components/TeacherSolution';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

export default function TestSeriesResult({ result, user, onBack, onRetake }) {
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('All'); // 'All' | 'Correct' | 'Incorrect' | 'Unattempted'
  const [selectedQIdx, setSelectedQIdx] = useState(0);

  // Fetch full test details (with questions and solutions) for review
  useEffect(() => {
    if (!result?.testId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/test-series/${result.testId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setTestDetails(data);
        }
        setLoading(false);
        setTimeout(() => {
          if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise();
        }, 300);
      })
      .catch((err) => {
        console.error('Failed to fetch test details for review:', err);
        setLoading(false);
      });
  }, [result?.testId]);

  // Re-run MathJax when selecting another question
  useEffect(() => {
    setTimeout(() => {
      if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise();
    }, 100);
  }, [selectedQIdx, selectedSubject, selectedFilter]);

  if (!result) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#0a0a1a' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 20, color: '#94a3b8' }}>No test result data found.</p>
          <button onClick={onBack} style={{ marginTop: 20, padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Helper formatting functions

  const formatTime = (seconds) => {
    if (!seconds) return '0m 0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const getAccuracy = () => {
    const attempted = (result.correctCount || 0) + (result.wrongCount || 0);
    if (attempted === 0) return '0%';
    return `${Math.round(((result.correctCount || 0) / attempted) * 100)}%`;
  };

  // Combine original questions with evaluation results
  const originalQuestions = testDetails?.questions || result.questions || [];
  const answersMap = result.answers || {};

  const evaluatedQuestions = originalQuestions.map((q) => {
    // If backend submitted
    if (result.questionResults) {
      const evalResult = result.questionResults.find((qr) => qr.questionNumber === q.questionNumber);
      const isAttempted = evalResult?.userAnswer !== undefined && evalResult?.userAnswer !== -1 && evalResult?.userAnswer !== '';
      return {
        ...q,
        userAnswer: evalResult?.userAnswer,
        isCorrect: evalResult?.isCorrect || false,
        marksAwarded: evalResult?.marksAwarded || 0,
        isAttempted,
      };
    }
    // If local fallback
    const ua = answersMap[q.questionNumber];
    const isAttempted = ua !== undefined && ua !== -1 && ua !== '';
    const isCorrect = isAttempted && (
      q.questionType === 'MCQ'
        ? parseInt(ua) === q.correctOption
        : String(ua).trim() === String(q.correctAnswer || '').trim()
    );
    const marksAwarded = isCorrect ? q.marks : (isAttempted && q.questionType === 'MCQ' ? q.negativeMarks : 0);

    return {
      ...q,
      userAnswer: ua,
      isCorrect,
      marksAwarded,
      isAttempted,
    };
  });

  // Filter evaluated questions
  const filteredQuestions = evaluatedQuestions.filter((q) => {
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'Correct' && q.isAttempted && q.isCorrect) ||
      (selectedFilter === 'Incorrect' && q.isAttempted && !q.isCorrect) ||
      (selectedFilter === 'Unattempted' && !q.isAttempted);
    return matchesSubject && matchesFilter;
  });

  const activeQuestion = filteredQuestions[selectedQIdx];

  return (
    <div className="tsr-root">
      <style>{`
        .tsr-root {
          background: #06060f;
          min-height: 100vh;
          color: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 40px 24px;
        }
        .tsr-container {
          max-w: 1200px;
          margin: 0 auto;
        }
        .tsr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 24px;
        }
        .tsr-title-group h1 {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 30%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 6px;
        }
        .tsr-subtitle {
          color: #94a3b8;
          font-size: 14px;
        }
        .tsr-action-btns {
          display: flex;
          gap: 16px;
        }
        .tsr-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        .tsr-btn-back {
          background: rgba(255,255,255,0.05);
          color: #f1f5f9;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tsr-btn-back:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        .tsr-btn-retake {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .tsr-btn-retake:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        /* Stats Grid */
        .tsr-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .tsr-stat-card {
          background: rgba(30, 41, 59, 0.35);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }
        .tsr-stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 3px;
          background: transparent;
        }
        .tsr-stat-card.score::after { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .tsr-stat-card.percentile::after { background: linear-gradient(90deg, #a78bfa, #c084fc); }
        .tsr-stat-card.accuracy::after { background: linear-gradient(90deg, #34d399, #6ee7b7); }
        .tsr-stat-card.time::after { background: linear-gradient(90deg, #fbbf24, #fde047); }
        
        .tsr-stat-icon {
          font-size: 32px;
          background: rgba(255,255,255,0.03);
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .tsr-stat-info {
          display: flex;
          flex-direction: column;
        }
        .tsr-stat-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .tsr-stat-value {
          font-size: 24px;
          font-weight: 800;
        }

        /* Subjects Panel */
        .tsr-subjects-wrapper {
          background: rgba(30, 41, 59, 0.2);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 40px;
        }
        .tsr-panel-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .tsr-subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .tsr-subject-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 14px;
          padding: 20px;
        }
        .tsr-subject-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .tsr-subject-name {
          font-weight: 700;
          font-size: 16px;
        }
        .tsr-subject-name.maths { color: #f472b6; }
        .tsr-subject-name.phy { color: #60a5fa; }
        .tsr-subject-name.chem { color: #34d399; }
        
        .tsr-subject-score {
          font-weight: 800;
          font-size: 18px;
        }
        .tsr-subject-stats {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #94a3b8;
        }
        .tsr-subject-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tsr-subject-stat-item span {
          font-weight: 600;
          color: #f1f5f9;
          font-size: 15px;
          margin-top: 4px;
        }

        /* Detailed Question Analysis */
        .tsr-analysis-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }
        
        /* Left Sidebar: Palette & Filters */
        .tsr-sidebar-panel {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 20px;
        }
        .tsr-filter-group {
          margin-bottom: 20px;
        }
        .tsr-filter-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .tsr-tabs-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tsr-tab-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          color: #94a3b8;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tsr-tab-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }
        .tsr-tab-btn.active {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
        }
        
        .tsr-questions-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .tsr-q-btn {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tsr-q-btn.correct { background: #065f46; color: #34d399; border: 1px solid #047857; }
        .tsr-q-btn.incorrect { background: #7f1d1d; color: #f87171; border: 1px solid #991b1b; }
        .tsr-q-btn.unattempted { background: #334155; color: #94a3b8; border: 1px solid #475569; }
        
        .tsr-q-btn:hover {
          transform: scale(1.05);
        }
        .tsr-q-btn.selected {
          outline: 3px solid #ffb300;
          outline-offset: 1px;
        }

        /* Right side: Active Question Card */
        .tsr-question-card {
          background: rgba(30, 41, 59, 0.25);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 32px;
        }
        .tsr-q-meta-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .tsr-q-badge-row {
          display: flex;
          gap: 10px;
        }
        .tsr-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .tsr-badge.subject { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
        .tsr-badge.topic { background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); }
        .tsr-badge.difficulty { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
        
        .tsr-marks-badge {
          font-size: 13px;
          font-weight: 600;
        }
        .tsr-marks-badge.correct { color: #34d399; }
        .tsr-marks-badge.incorrect { color: #f87171; }
        .tsr-marks-badge.unattempted { color: #94a3b8; }
        
        .tsr-q-text {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        .tsr-opts-container {
          display: grid;
          gap: 12px;
          margin-bottom: 32px;
        }
        .tsr-opt-card {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .tsr-opt-card.correct {
          background: rgba(6, 95, 70, 0.15);
          border-color: rgba(52, 211, 153, 0.3);
        }
        .tsr-opt-card.user-selected {
          background: rgba(127, 29, 29, 0.15);
          border-color: rgba(248, 113, 113, 0.3);
        }
        .tsr-opt-card.correct.user-selected {
          background: rgba(6, 95, 70, 0.2);
          border-color: rgba(52, 211, 153, 0.4);
        }
        
        .tsr-opt-letter {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: #94a3b8;
        }
        .tsr-opt-card.correct .tsr-opt-letter { background: #047857; color: #fff; }
        .tsr-opt-card.user-selected .tsr-opt-letter { background: #b91c1c; color: #fff; }
        .tsr-opt-card.correct.user-selected .tsr-opt-letter { background: #047857; color: #fff; }
        
        .tsr-opt-status-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .tsr-opt-status-badge.correct { color: #34d399; }
        .tsr-opt-status-badge.user-wrong { color: #f87171; }

        .tsr-numerical-review-box {
          background: rgba(15, 23, 42, 0.35);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 32px;
        }
        .tsr-num-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        .tsr-num-item span.correct { color: #34d399; font-weight: 700; }
        .tsr-num-item span.wrong { color: #f87171; font-weight: 700; }
        .tsr-num-item span.unattempted { color: #94a3b8; }
        
        .tsr-solution-card {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 24px;
          margin-top: 24px;
        }
        .tsr-sol-title {
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 12px;
          color: #fbbf24;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tsr-sol-text {
          font-size: 15px;
          line-height: 1.6;
          color: #cbd5e1;
        }
        
        @media(max-width: 900px) {
          .tsr-analysis-layout {
            grid-template-columns: 1fr;
          }
          .tsr-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .tsr-action-btns {
            width: 100%;
          }
          .tsr-btn {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>

      <div className="tsr-container">
        {/* HEADER */}
        <div className="tsr-header">
          <div className="tsr-title-group">
            <h1>{result.testTitle || 'Test Attempt Result'}</h1>
            <p className="tsr-subtitle">
              Attempted by <strong>{user?.name || 'Candidate'}</strong> &nbsp;|&nbsp; Official Paper Assessment
            </p>
          </div>
          <div className="tsr-action-btns">
            <button className="tsr-btn tsr-btn-back" onClick={onBack}>
              ← Exit Review
            </button>
            <button className="tsr-btn tsr-btn-retake" onClick={onRetake}>
              🔄 Retake Practice
            </button>
          </div>
        </div>

        {/* STATS TILES */}
        <div className="tsr-stats-grid">
          <div className="tsr-stat-card score">
            <div className="tsr-stat-icon">🎯</div>
            <div className="tsr-stat-info">
              <span className="tsr-stat-label">Total Score</span>
              <span className="tsr-stat-value">{result.totalScore} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>/ {result.totalMarks || 300}</span></span>
            </div>
          </div>
          <div className="tsr-stat-card percentile">
            <div className="tsr-stat-icon">📊</div>
            <div className="tsr-stat-info">
              <span className="tsr-stat-label">Estimated Percentile</span>
              <span className="tsr-stat-value">{result.percentile}%</span>
            </div>
          </div>
          <div className="tsr-stat-card accuracy">
            <div className="tsr-stat-icon">📈</div>
            <div className="tsr-stat-info">
              <span className="tsr-stat-label">Accuracy Rate</span>
              <span className="tsr-stat-value">{getAccuracy()}</span>
            </div>
          </div>
          <div className="tsr-stat-card time">
            <div className="tsr-stat-icon">⏱</div>
            <div className="tsr-stat-info">
              <span className="tsr-stat-label">Time Spent</span>
              <span className="tsr-stat-value">{formatTime(result.timeSpentSeconds)}</span>
            </div>
          </div>
        </div>

        {/* SUBJECT-WISE PERFORMANCE */}
        <div className="tsr-subjects-wrapper">
          <h2 className="tsr-panel-title">Subject-wise Analytics</h2>
          <div className="tsr-subjects-grid">
            {/* Physics */}
            <div className="tsr-subject-card">
              <div className="tsr-subject-header">
                <span className="tsr-subject-name phy">Physics</span>
                <span className="tsr-subject-score">{result.physicsScore ?? 'N/A'}</span>
              </div>
              <div className="tsr-subject-stats">
                <div className="tsr-subject-stat-item">
                  Correct
                  <span>{evaluatedQuestions.filter(q => q.subject === 'Physics' && q.isAttempted && q.isCorrect).length}</span>
                </div>
                <div className="tsr-subject-stat-item">
                  Incorrect
                  <span>{evaluatedQuestions.filter(q => q.subject === 'Physics' && q.isAttempted && !q.isCorrect).length}</span>
                </div>
                <div className="tsr-subject-stat-item">
                  Unattempted
                  <span>{evaluatedQuestions.filter(q => q.subject === 'Physics' && !q.isAttempted).length}</span>
                </div>
              </div>
            </div>

            {/* Chemistry */}
            <div className="tsr-subject-card">
              <div className="tsr-subject-header">
                <span className="tsr-subject-name chem">Chemistry</span>
                <span className="tsr-subject-score">{result.chemistryScore ?? 'N/A'}</span>
              </div>
              <div className="tsr-subject-stats">
                <div className="tsr-subject-stat-item">
                  Correct
                  <span>{evaluatedQuestions.filter(q => q.subject === 'Chemistry' && q.isAttempted && q.isCorrect).length}</span>
                </div>
                <div className="tsr-subject-stat-item">
                  Incorrect
                  <span>{evaluatedQuestions.filter(q => q.subject === 'Chemistry' && q.isAttempted && !q.isCorrect).length}</span>
                </div>
                <div className="tsr-subject-stat-item">
                  Unattempted
                  <span>{evaluatedQuestions.filter(q => q.subject === 'Chemistry' && !q.isAttempted).length}</span>
                </div>
              </div>
            </div>

            {/* Mathematics */}
            <div className="tsr-subject-card">
              <div className="tsr-subject-header">
                <span className="tsr-subject-name maths">Mathematics</span>
                <span className="tsr-subject-score">{result.mathsScore ?? 'N/A'}</span>
              </div>
              <div className="tsr-subject-stats">
                <div className="tsr-subject-stat-item">
                  Correct
                  <span>{evaluatedQuestions.filter(q => q.subject === 'Mathematics' && q.isAttempted && q.isCorrect).length}</span>
                </div>
                <div className="tsr-subject-stat-item">
                  Incorrect
                  <span>{evaluatedQuestions.filter(q => q.subject === 'Mathematics' && q.isAttempted && !q.isCorrect).length}</span>
                </div>
                <div className="tsr-subject-stat-item">
                  Unattempted
                  <span>{evaluatedQuestions.filter(q => q.subject === 'Mathematics' && !q.isAttempted).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED QUESTION REVIEW */}
        <h2 className="tsr-panel-title">Question-by-Question Review</h2>
        
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
            <p>Loading detailed question analyses...</p>
          </div>
        ) : (
          <div className="tsr-analysis-layout">
            
            {/* Sidebar controls */}
            <div className="tsr-sidebar-panel">
              <div className="tsr-filter-group">
                <div className="tsr-filter-label">Subject</div>
                <div className="tsr-tabs-row">
                  {['All', 'Physics', 'Chemistry', 'Mathematics'].map((sub) => (
                    <button
                      key={sub}
                      className={`tsr-tab-btn ${selectedSubject === sub ? 'active' : ''}`}
                      onClick={() => { setSelectedSubject(sub); setSelectedQIdx(0); }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tsr-filter-group">
                <div className="tsr-filter-label">Status</div>
                <div className="tsr-tabs-row">
                  {['All', 'Correct', 'Incorrect', 'Unattempted'].map((f) => (
                    <button
                      key={f}
                      className={`tsr-tab-btn ${selectedFilter === f ? 'active' : ''}`}
                      onClick={() => { setSelectedFilter(f); setSelectedQIdx(0); }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tsr-filter-group">
                <div className="tsr-filter-label">Questions ({filteredQuestions.length})</div>
                {filteredQuestions.length > 0 ? (
                  <div className="tsr-questions-grid">
                    {filteredQuestions.map((q, idx) => {
                      let statusClass = 'unattempted';
                      if (q.isAttempted) {
                        statusClass = q.isCorrect ? 'correct' : 'incorrect';
                      }
                      return (
                        <button
                          key={q.questionNumber}
                          className={`tsr-q-btn ${statusClass} ${selectedQIdx === idx ? 'selected' : ''}`}
                          onClick={() => setSelectedQIdx(idx)}
                        >
                          {q.questionNumber}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', padding: '10px 0' }}>No questions match filters.</p>
                )}
              </div>
            </div>

            {/* Active Question Content */}
            <div className="tsr-question-card">
              {activeQuestion ? (
                <div>
                  <div className="tsr-q-meta-header">
                    <div className="tsr-q-badge-row">
                      <span className="tsr-badge subject">{activeQuestion.subject}</span>
                      {activeQuestion.topic && <span className="tsr-badge topic">{activeQuestion.topic}</span>}
                      {activeQuestion.difficulty && <span className="tsr-badge difficulty">{activeQuestion.difficulty}</span>}
                    </div>
                    <div>
                      {!activeQuestion.isAttempted ? (
                        <span className="tsr-marks-badge unattempted">Unattempted (0 Marks)</span>
                      ) : activeQuestion.isCorrect ? (
                        <span className="tsr-marks-badge correct">Correct (+{activeQuestion.marks} Marks)</span>
                      ) : (
                        <span className="tsr-marks-badge incorrect">Incorrect ({activeQuestion.negativeMarks} Marks)</span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="tsr-q-text tex2jax_process" dangerouslySetInnerHTML={{ __html: activeQuestion.questionText }} />

                  {/* Options or Numerical display */}
                  {activeQuestion.questionType === 'NUMERICAL' ? (
                    <div className="tsr-numerical-review-box">
                      <div className="tsr-num-item">
                        <span>Your entered answer:</span>
                        <span className={activeQuestion.isAttempted ? (activeQuestion.isCorrect ? 'correct' : 'wrong') : 'unattempted'}>
                          {activeQuestion.isAttempted ? activeQuestion.userAnswer : 'Not Attempted'}
                        </span>
                      </div>
                      <div className="tsr-num-item">
                        <span>Correct answer:</span>
                        <span className="correct">{activeQuestion.correctAnswer}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="tsr-opts-container">
                      {(activeQuestion.options || []).map((opt, oIdx) => {
                        const isCorrectOption = activeQuestion.correctOption === oIdx;
                        const isUserOption = activeQuestion.userAnswer === oIdx;
                        
                        let cardClass = '';
                        if (isCorrectOption) cardClass = 'correct';
                        else if (isUserOption) cardClass = 'user-selected';

                        return (
                          <div key={oIdx} className={`tsr-opt-card ${cardClass}`}>
                            <span className="tsr-opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                            <span className="tex2jax_process" dangerouslySetInnerHTML={{ __html: opt }} />
                            
                            {isCorrectOption && (
                              <span className="tsr-opt-status-badge correct">Correct Option</span>
                            )}
                            {!isCorrectOption && isUserOption && (
                              <span className="tsr-opt-status-badge user-wrong">Your Marked Option</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Solution block */}
                  {activeQuestion.solution && (
                    <div className="tsr-solution-card">
                      <TeacherSolution html={activeQuestion.solution} />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <p>Please select a question from the left sidebar to see the details.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
