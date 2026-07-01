import React, { useState, useMemo } from 'react';
import {
  Trophy, Target, CheckCircle, XCircle, ArrowLeft, Eye,
  History, Layers, BookOpen, FileText, AlertCircle
} from 'lucide-react';
import { fixExamGoalHtml } from '../utils/htmlCleaner';

function MathHtml({ html, className = '' }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: html || '' }}
      className={`tex2jax_process ${className}`}
    />
  );
}

const optLabel = (i) => String.fromCharCode(65 + i);

function QuestionReviewCard({ q, idx, isLight }) {
  const [showSolution, setShowSolution] = useState(false);
  const isMcq = Array.isArray(q.options) && q.options.length > 0;
  let correctIdx = q.correctOption;
  if (typeof correctIdx === 'string') correctIdx = correctIdx.toUpperCase().charCodeAt(0) - 65;
  const cardBg = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141821] border-white/10';
  const mutedText = isLight ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className={`rounded-2xl border p-5 mb-4 ${cardBg}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            q.isCorrect ? 'bg-emerald-500 text-white' :
            q.isAttempted ? 'bg-red-500 text-white' :
            isLight ? 'bg-slate-200 text-slate-600' : 'bg-gray-700 text-gray-400'
          }`}>{idx + 1}</span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
            q.isCorrect ? (isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-900/30 text-emerald-400') :
            q.isAttempted ? (isLight ? 'bg-red-100 text-red-700' : 'bg-red-900/30 text-red-400') :
            isLight ? 'bg-slate-100 text-slate-500' : 'bg-gray-800 text-gray-500'
          }`}>
            {q.isCorrect ? '✓ Correct' : q.isAttempted ? '✗ Wrong' : '— Skipped'}
          </span>
        </div>
        <span className={`text-[10px] ${mutedText} text-right`}>{q.subject || ''}{q.chapter ? ` · ${q.chapter}` : ''}</span>
      </div>

      <div className={`text-sm leading-relaxed mb-4 ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
        <MathHtml html={q.questionText} />
      </div>

      {isMcq ? (
        <div className="grid grid-cols-1 gap-2 mb-4">
          {q.options.map((opt, oIdx) => {
            const isCorrectOpt = correctIdx === oIdx;
            const isUserOpt = q.userAnswer === oIdx;
            let cls = isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/5 bg-black/10 text-gray-400';
            if (isCorrectOpt) cls = isLight ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold' : 'border-emerald-500 bg-emerald-950/20 text-emerald-300 font-semibold';
            else if (isUserOpt && !isCorrectOpt) cls = isLight ? 'border-red-400 bg-red-50 text-red-900 font-semibold' : 'border-red-500 bg-red-950/20 text-red-300 font-semibold';
            return (
              <div key={oIdx} className={`flex gap-3 items-start p-3 rounded-xl border text-sm ${cls}`}>
                <span className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  isCorrectOpt ? 'bg-emerald-500 text-white' :
                  isUserOpt ? 'bg-red-500 text-white' :
                  isLight ? 'bg-slate-200 text-slate-600' : 'bg-gray-700 text-gray-500'
                }`}>{optLabel(oIdx)}</span>
                <MathHtml html={fixExamGoalHtml(opt).replace(/<\/?(li|ul|ol)[^>]*>/gi, '')} className="flex-1" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className={`px-4 py-2.5 rounded-xl border text-sm flex-1 min-w-[120px] ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
            <span className={`text-[10px] font-bold uppercase block mb-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>Correct Answer</span>
            <span className="font-bold text-emerald-500">{q.correctAnswer ?? q.correctOption ?? '—'}</span>
          </div>
          {q.isAttempted && (
            <div className={`px-4 py-2.5 rounded-xl border text-sm flex-1 min-w-[120px] ${
              q.isCorrect
                ? isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
                : isLight ? 'bg-red-50 border-red-200' : 'bg-red-950/20 border-red-500/30'
            }`}>
              <span className={`text-[10px] font-bold uppercase block mb-0.5 ${q.isCorrect ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-red-600' : 'text-red-400')}`}>Your Answer</span>
              <span className={`font-bold ${q.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>{q.userAnswer ?? '—'}</span>
            </div>
          )}
        </div>
      )}

      {q.explanation && (
        <button
          onClick={() => setShowSolution(v => !v)}
          className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            isLight ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          {showSolution ? 'Hide Solution' : 'View Solution'}
        </button>
      )}
      {showSolution && q.explanation && (
        <div className={`mt-3 p-4 rounded-xl border text-sm leading-relaxed ${isLight ? 'bg-blue-50 border-blue-100 text-slate-700' : 'bg-blue-900/10 border-blue-500/20 text-gray-300'}`}>
          <div className={`mb-4 p-3 rounded-xl border flex items-center gap-3 ${isLight ? 'bg-emerald-100/50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
            <span className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Correct Answer:</span>
            <span className={`text-sm font-black ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
              {q.type === 'integer' || q.options?.length === 0 
                ? (q.correctAnswer ?? q.correctOption ?? 'N/A')
                : (
                    q.questionType === 'MULTI_CORRECT' || q.questionType === 'MCQM'
                      ? (q.correctOptionsArray || []).map(idx => String.fromCharCode(65 + idx)).join(', ') || 'N/A'
                      : `Option ${typeof q.correctOption === 'string' ? q.correctOption.toUpperCase() : String.fromCharCode(65 + parseInt(q.correctOption || 0))}`
                  )
              }
            </span>
          </div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b ${isLight ? 'text-blue-500 border-blue-200' : 'text-blue-400 border-blue-500/20'}`}>Solution Explanation</h4>
          <MathHtml html={q.explanation} />
        </div>
      )}
    </div>
  );
}

function scoreBadgeColor(score, maxMarks) {
  const pct = maxMarks > 0 ? (score / maxMarks) * 100 : 0;
  if (pct >= 60) return 'text-emerald-500';
  if (pct >= 35) return 'text-amber-500';
  return 'text-red-500';
}

function TestDetailView({ test, isLight, onBack }) {
  const [filter, setFilter] = useState('all');

  const fullData = useMemo(() => {
    try {
      const raw = localStorage.getItem(`quantrex_test_result_${test.testId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return test;
  }, [test.testId]);

  const questions = fullData?.questions || [];
  const filtered = useMemo(() => {
    if (filter === 'wrong') return questions.filter(q => q.isAttempted && !q.isCorrect);
    if (filter === 'correct') return questions.filter(q => q.isAttempted && q.isCorrect);
    if (filter === 'skipped') return questions.filter(q => !q.isAttempted);
    return questions;
  }, [questions, filter]);

  const scoreColor = scoreBadgeColor(test.score, test.maxMarks);
  const accuracy = test.totalQuestions > 0 ? Math.round((test.correct / test.totalQuestions) * 100) : 0;
  const themeCard = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141821] border-white/10';
  const themeMuted = isLight ? 'text-slate-500' : 'text-gray-500';

  return (
    <div>
      <button onClick={onBack} className={`flex items-center gap-2 text-xs font-bold mb-6 px-3 py-1.5 rounded-lg ${isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-gray-400 hover:bg-white/5'}`}>
        <ArrowLeft className="h-4 w-4" /> Back to Test List
      </button>

      <div className={`rounded-2xl border p-6 mb-6 ${themeCard}`}>
        <h2 className={`font-black text-lg mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{test.testTitle}</h2>
        <p className={`text-xs mb-5 ${themeMuted}`}>
          {test.testType} · {test.submittedAt ? new Date(test.submittedAt).toLocaleString('en-IN') : ''}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Score', value: `${test.score}/${test.maxMarks}`, color: scoreColor },
            { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 60 ? 'text-emerald-500' : accuracy >= 35 ? 'text-amber-500' : 'text-red-500' },
            { label: 'Correct', value: test.correct, color: 'text-emerald-500' },
            { label: 'Wrong', value: test.incorrect, color: 'text-red-500' },
            { label: 'Skipped', value: test.unattempted ?? (test.totalQuestions - test.correct - test.incorrect), color: themeMuted },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-3 text-center border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-white/5'}`}>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              <p className={`text-[10px] font-bold uppercase mt-0.5 ${themeMuted}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {questions.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              { id: 'all', label: `All (${questions.length})`, activeClass: 'bg-blue-500 text-white' },
              { id: 'wrong', label: `Wrong (${questions.filter(q => q.isAttempted && !q.isCorrect).length})`, activeClass: 'bg-red-500 text-white' },
              { id: 'correct', label: `Correct (${questions.filter(q => q.isAttempted && q.isCorrect).length})`, activeClass: 'bg-emerald-500 text-white' },
              { id: 'skipped', label: `Skipped (${questions.filter(q => !q.isAttempted).length})`, activeClass: isLight ? 'bg-slate-500 text-white' : 'bg-gray-600 text-white' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === f.id ? f.activeClass : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >{f.label}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className={`text-center py-10 rounded-xl border border-dashed ${isLight ? 'border-slate-300 text-slate-400' : 'border-white/10 text-gray-600'}`}>
              No questions in this category.
            </div>
          ) : filtered.map((q, i) => (
            <QuestionReviewCard key={i} q={q} idx={i} isLight={isLight} />
          ))}
        </>
      ) : (
        <div className={`text-center py-10 rounded-xl border border-dashed ${isLight ? 'border-slate-300 text-slate-400' : 'border-white/10 text-gray-600'}`}>
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Question details not available for older tests.</p>
          <p className="text-xs mt-1 opacity-60">Retake the test to enable per-question review.</p>
        </div>
      )}
    </div>
  );
}

function TestRow({ t, isLight, onOpenTest }) {
  const scoreColor = scoreBadgeColor(t.score, t.maxMarks);
  const accuracy = t.totalQuestions > 0 ? Math.round((t.correct / t.totalQuestions) * 100) : 0;
  const dateStr = t.submittedAt
    ? new Date(t.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border mb-3 cursor-pointer transition-all hover:shadow-lg ${
        isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:-translate-y-0.5' : 'bg-[#141821] border-white/10 hover:border-blue-500/30 hover:-translate-y-0.5'
      }`}
      onClick={() => onOpenTest(t)}
    >
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.testTitle}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/10 text-purple-400'}`}>{t.testType}</span>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{dateStr}</span>
          <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{t.totalQuestions} Q</span>
        </div>
      </div>
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="text-center">
          <p className={`font-black text-lg leading-none ${scoreColor}`}>{t.score}</p>
          <p className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>/{t.maxMarks}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-emerald-500">{t.correct}</p>
          <p className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Correct</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-red-500">{t.incorrect}</p>
          <p className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Wrong</p>
        </div>
        <div className="text-center">
          <p className={`font-bold text-sm ${accuracy >= 60 ? 'text-emerald-500' : accuracy >= 35 ? 'text-amber-500' : 'text-red-500'}`}>{accuracy}%</p>
          <p className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Accuracy</p>
        </div>
        <svg className={`h-4 w-4 flex-shrink-0 ${isLight ? 'text-slate-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </div>
    </div>
  );
}

function PYQPracticeFolder({ isLight }) {
  const pyqStats = useMemo(() => {
    const chapters = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('quantrex_pyq_progress_')) {
          const slug = key.replace('quantrex_pyq_progress_', '');
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            let correct = 0, wrong = 0, skipped = 0;
            Object.values(data).forEach(v => {
              if (v.status === 'correct') correct++;
              else if (v.status === 'wrong') wrong++;
              else skipped++;
            });
            const total = correct + wrong + skipped;
            if (total > 0) chapters[slug] = { slug, correct, wrong, skipped, total, accuracy: Math.round((correct / total) * 100) };
          }
        }
      }
    } catch (e) {}
    return Object.values(chapters).sort((a, b) => b.total - a.total);
  }, []);

  const themeCard = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141821] border-white/10';
  const themeMuted = isLight ? 'text-slate-500' : 'text-gray-500';
  const themeText = isLight ? 'text-slate-800' : 'text-white';

  if (pyqStats.length === 0) {
    return (
      <div className={`text-center py-16 rounded-2xl border border-dashed ${isLight ? 'border-slate-300 bg-white' : 'border-white/10'}`}>
        <BookOpen className={`h-12 w-12 mx-auto mb-4 ${isLight ? 'text-slate-300' : 'text-gray-700'}`} />
        <h3 className={`font-bold text-base mb-2 ${themeText}`}>No PYQ Practice Data</h3>
        <p className={`text-xs ${themeMuted}`}>Start practicing PYQs — your progress will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${themeMuted}`}>{pyqStats.length} chapters practiced</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pyqStats.map(ch => (
          <div key={ch.slug} className={`rounded-2xl border p-4 ${themeCard}`}>
            <div className="flex items-start justify-between mb-3">
              <p className={`font-bold text-sm capitalize ${themeText}`}>{ch.slug.replace(/-/g, ' ')}</p>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                ch.accuracy >= 60 ? 'text-emerald-500 bg-emerald-500/10' :
                ch.accuracy >= 35 ? 'text-amber-500 bg-amber-500/10' :
                'text-red-500 bg-red-500/10'
              }`}>{ch.accuracy}%</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span><b className="text-emerald-500">{ch.correct}</b> <span className={themeMuted}>Correct</span></span>
              <span><b className="text-red-500">{ch.wrong}</b> <span className={themeMuted}>Wrong</span></span>
              <span><b className={themeMuted}>{ch.skipped}</b> <span className={themeMuted}>Skipped</span></span>
            </div>
            <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${ch.accuracy}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentProgressDashboard({ user, isLight, onBack, testsData, onStartTest, examTest, setExamTest, setActivePage }) {
  const [activeTab, setActiveTab] = useState('JEE Main');
  const [activeCategory, setActiveCategory] = useState(null); 
  const [ultimateData, setUltimateData] = useState([]);
  const [officialData, setOfficialData] = useState([]);
  const [openTest, setOpenTest] = useState(null);
  const [allTestResults, setAllTestResults] = useState([]);
  
  useEffect(() => {
    fetch('/data/jee_main_ultimate_series_2027.json')
      .then(r => r.json())
      .then(d => setUltimateData(Array.isArray(d) ? d : Object.values(d).flat()))
      .catch(console.error);

    if (testsData && testsData.mains) {
       setOfficialData([...(testsData.mains || []), ...(testsData.advanced || []), ...(testsData.nda || [])]);
    } else {
       fetch('/data/test-series.json')
        .then(r => r.json())
        .then(d => {
           const arr = Array.isArray(d) ? d : (d.tests || d.data || []);
           setOfficialData(arr);
        })
        .catch(console.error);
    }
  }, [testsData]);

  const allAvailableTests = useMemo(() => {
    const arr = [];
    ultimateData.forEach(t => arr.push({...t, category: 'Ultimate Test Series', examType: 'JEE Main'}));
    officialData.forEach(t => arr.push({...t, category: 'Official Papers', examType: t.examType || t.exam || (t.id?.includes('advanced') ? 'JEE Advanced' : 'JEE Main')}));
    return arr;
  }, [ultimateData, officialData]);

  const testStates = useMemo(() => {
    const states = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('quantrex_test_result_')) {
        const id = key.replace('quantrex_test_result_', '');
        states[id] = { status: 'completed' };
      } else if (key?.startsWith('nta_test_progress_')) {
        const id = key.replace('nta_test_progress_', '');
        if (!states[id]) states[id] = { status: 'paused' };
      } else if (key?.startsWith('quantrex_exam_state_')) {
        const id = key.replace('quantrex_exam_state_', '');
        if (!states[id]) states[id] = { status: 'paused' };
      }
    }
    return states;
  }, [openTest]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('quantrex_all_test_results');
      if (saved) setAllTestResults(JSON.parse(saved));
    } catch (e) {}
  }, [openTest]);

  const stats = useMemo(() => {
    const totalCorrect = allTestResults.reduce((s, t) => s + (t.correct || 0), 0);
    const totalWrong = allTestResults.reduce((s, t) => s + (t.incorrect || 0), 0);
    const totalQ = allTestResults.reduce((s, t) => s + (t.totalQuestions || 0), 0);
    const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
    const bestScore = allTestResults.length > 0
      ? Math.max(...allTestResults.map(t => t.maxMarks > 0 ? Math.round((t.score / t.maxMarks) * 100) : 0)) : 0;
    if (!allTestResults.length) return { total: 0, totalCorrect: 0, totalWrong: 0, accuracy: 0, bestScore: 0 };
    let c = 0, w = 0, q = 0, best = 0;
    allTestResults.forEach(t => {
      c += (t.correct || 0);
      w += (t.incorrect || 0);
      q += (t.totalQuestions || 0);
      const acc = t.totalQuestions ? ((t.correct || 0) / t.totalQuestions) * 100 : 0;
      if (acc > best) best = acc;
    });
    return {
      total: allTestResults.length,
      totalCorrect: c,
      totalWrong: w,
      accuracy: q ? Math.round((c / q) * 100) : 0,
      bestScore: Math.round(best)
    };
  }, [allTestResults]);

  const themeCard = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141821] border-white/10';
  const themeMuted = isLight ? 'text-slate-500' : 'text-gray-500';
  const themeText = isLight ? 'text-slate-800' : 'text-white';

  if (openTest) {
    return (
      <div className={`min-h-screen p-4 md:p-8 ${isLight ? 'bg-slate-50' : 'bg-[#0A0F1C]'}`}>
        <div className="max-w-4xl mx-auto">
          <TestDetailView test={openTest} isLight={isLight} onBack={() => setOpenTest(null)} />
        </div>
      </div>
    );
  }

  const currentTests = allAvailableTests.filter(t => t.examType === activeTab && (activeCategory ? t.category === activeCategory : true));

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50' : 'bg-[#0A0F1C]'}`}>
      <div className={`border-b px-6 py-5 sticky top-0 z-30 backdrop-blur-sm ${isLight ? 'bg-white/90 border-slate-200' : 'bg-[#0d1220]/90 border-white/5'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className={`p-2 rounded-xl border transition-all ${isLight ? 'border-slate-200 hover:bg-slate-100 text-slate-600' : 'border-white/10 hover:bg-white/5 text-gray-400'}`}>
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className={`text-xl font-black uppercase tracking-wide ${themeText}`}>My Dashboard</h1>
              <p className={`text-xs ${themeMuted}`}>Central Hub for All Available Tests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: FileText, label: 'Tests Taken', value: stats.total, color: 'text-blue-500', bg: isLight ? 'bg-blue-50' : 'bg-blue-500/10' },
            { icon: CheckCircle, label: 'Total Correct', value: stats.totalCorrect, color: 'text-emerald-500', bg: isLight ? 'bg-emerald-50' : 'bg-emerald-500/10' },
            { icon: XCircle, label: 'Total Wrong', value: stats.totalWrong, color: 'text-red-500', bg: isLight ? 'bg-red-50' : 'bg-red-500/10' },
            { icon: Target, label: 'Avg Accuracy', value: `${stats.accuracy}%`, color: stats.accuracy >= 60 ? 'text-emerald-500' : stats.accuracy >= 35 ? 'text-amber-500' : 'text-red-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-500/10' },
            { icon: Trophy, label: 'Best Score %', value: `${stats.bestScore}%`, color: 'text-amber-500', bg: isLight ? 'bg-yellow-50' : 'bg-yellow-500/10' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 flex flex-col gap-2 ${themeCard}`}>
              <div className={`p-2 rounded-xl w-fit ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className={`text-[10px] font-bold uppercase ${themeMuted}`}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
           {['JEE Main', 'JEE Advanced', 'NDA'].map(exam => (
              <button 
                key={exam}
                onClick={() => { setActiveTab(exam); setActiveCategory(null); }}
                className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === exam ? 'bg-blue-600 text-white shadow-md' : isLight ? 'bg-white border text-slate-700 hover:bg-slate-100' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}
              >{exam}</button>
           ))}
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {['Ultimate Test Series', 'Official Papers', 'PYQ Practice', 'Custom Tests'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                activeCategory === cat
                  ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : isLight ? 'bg-white border-slate-200 text-slate-600 hover:border-blue-300' : 'bg-white/5 border-white/10 text-gray-400 hover:border-blue-500/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div>
          {activeCategory === 'PYQ Practice' && <PYQPracticeFolder isLight={isLight} />}
          {activeCategory === 'Custom Tests' && (
              <div>
                {examTest && testStates[examTest.id]?.status === 'paused' && (
                  <div className="mb-6">
                    <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${themeMuted}`}>Paused Custom Test</p>
                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${themeCard}`}>
                        <div>
                           <div className="flex justify-between items-start mb-2">
                             <h3 className={`font-bold text-sm ${themeText}`}>{examTest.title || examTest.name || 'Custom Test'}</h3>
                             <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Paused</span>
                           </div>
                           <p className={`text-xs ${themeMuted} mb-4`}>Custom Tests</p>
                        </div>
                        <button 
                          onClick={() => {
                            setActivePage('exam-mode');
                          }}
                          className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
                            isLight ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                          }`}
                        >
                          Resume Test
                        </button>
                    </div>
                  </div>
                )}
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${themeMuted}`}>Completed Custom Tests</p>
                {allTestResults.filter(t => t.testType?.includes('Custom') || t.testTitle?.includes('Custom')).map((t, i) => <TestRow key={t.testId || i} t={t} isLight={isLight} onOpenTest={setOpenTest} />)}
              </div>
          )}
          {activeCategory !== 'PYQ Practice' && activeCategory !== 'Custom Tests' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTests.map((t, i) => {
                   const state = testStates[t.id];
                   return (
                     <div key={i} className={`p-4 rounded-xl border flex flex-col justify-between ${themeCard}`}>
                        <div>
                           <div className="flex justify-between items-start mb-2">
                             <h3 className={`font-bold text-sm ${themeText}`}>{t.title}</h3>
                             {state?.status === 'completed' && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Completed</span>}
                             {state?.status === 'paused' && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Paused</span>}
                           </div>
                           <p className={`text-xs ${themeMuted} mb-4`}>{t.category} {t.groupName ? `· ${t.groupName}` : ''}</p>
                        </div>
                        <button 
                          onClick={() => {
                             if (state?.status === 'completed') {
                               const res = localStorage.getItem(`quantrex_test_result_${t.id}`);
                               if (res) setOpenTest(JSON.parse(res));
                             } else {
                               localStorage.setItem('quantrex_test_source', 'my-dashboard');
                               onStartTest(t.id, 'exam', 'my-dashboard');
                             }
                          }}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${state?.status === 'completed' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : state?.status === 'paused' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                           {state?.status === 'completed' ? 'View Analysis' : state?.status === 'paused' ? 'Resume Test' : 'Start Test'}
                        </button>
                     </div>
                   );
                })}
                {currentTests.length === 0 && <div className={`col-span-2 text-center py-10 rounded-xl border border-dashed ${isLight ? 'border-slate-300 text-slate-400' : 'border-white/10 text-gray-500'}`}>No tests available in this category for {activeTab}.</div>}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
