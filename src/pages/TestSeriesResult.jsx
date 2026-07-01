import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import TeacherSolution from '../components/TeacherSolution';
import MistakeBooster from '../components/MistakeBooster';
import { 
  ChevronRight, PlayCircle, BarChart3, Clock, 
  CheckCircle2, Target, Download, Settings, FileText, Moon, Sun, Monitor, Trophy
} from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

// Generate fake rankers deterministically based on testId
const generateFakeRankers = (testId, userScore, totalMarks) => {
  let hash = 0;
  for (let i = 0; i < testId.length; i++) hash = Math.imul(31, hash) + testId.charCodeAt(i) | 0;
  
  const rng = () => {
    hash = Math.sin(hash) * 10000;
    return hash - Math.floor(hash);
  };
  
  const rankers = [];
  const count = 25;
  for (let i = 0; i < count; i++) {
    // Generate scores mostly in the 30% - 90% range of total marks
    const baseScore = Math.floor((rng() * 0.6 + 0.3) * totalMarks);
    rankers.push({
      name: `Student ${Math.floor(rng() * 10000)}`,
      score: baseScore,
      isUser: false
    });
  }
  
  // Add user
  rankers.push({
    name: "You",
    score: userScore,
    isUser: true
  });
  
  rankers.sort((a, b) => b.score - a.score);
  
  // Assign ranks
  rankers.forEach((r, idx) => { r.rank = idx + 1; });
  
  const userRank = rankers.find(r => r.isUser).rank;
  const percentile = (((rankers.length - userRank) / rankers.length) * 100).toFixed(4);
  
  return { rankers, userRank, percentile, totalStudents: rankers.length };
};

export default function TestSeriesResult({ result, user, onBack, onRetake }) {
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview'); // Overview, Performance, Attempt, Rankers
  const [showSolutions, setShowSolutions] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedQIdx, setSelectedQIdx] = useState(0);

  // Fetch full test details
  useEffect(() => {
    if (!result?.testId) return;
    setLoading(true);
    fetch(import.meta.env.BASE_URL + `data/tests/${result.testId}.json?_t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) setTestDetails(data);
        setLoading(false);
        setTimeout(() => { if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(); }, 300);
      })
      .catch((err) => {
        console.error('Failed to fetch test details for review:', err);
        setLoading(false);
      });
  }, [result?.testId]);

  useEffect(() => {
    if (showSolutions) {
      setTimeout(() => { if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(); }, 100);
    }
  }, [selectedQIdx, selectedSubject, selectedFilter, showSolutions]);

  if (!result) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#f8f9fa] text-slate-800">
        <div className="text-center">
          <p className="text-lg text-slate-500">No test result data found.</p>
          <button onClick={onBack} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
        </div>
      </div>
    );
  }

  // Evaluate Questions
  const originalQuestions = testDetails?.questions || result.questions || [];
  const answersMap = result.answers || {};

  const evaluatedQuestions = useMemo(() => {
    return originalQuestions.map((q) => {
      let isAttempted = false;
      let isCorrect = false;
      let ua = undefined;
      
      if (result.questionResults) {
        const evalResult = result.questionResults.find((qr) => qr.questionId === q._id);
        isAttempted = evalResult?.isAttempted || false;
        ua = evalResult?.userAnswer;
        isCorrect = evalResult?.isCorrect || false;
      } else {
        ua = answersMap[q.questionNumber || q._id];
        isAttempted = ua !== undefined && ua !== '';
        if (Array.isArray(ua)) isAttempted = ua.length > 0;
        
        const isMultiCorrect = q.questionType !== 'NUMERICAL' && (
           q.questionType === 'MULTI_CORRECT' || q.questionType === 'MCQM' || 
           (q.correctOptionsArray && q.correctOptionsArray.length > 0)
        );

        if (isAttempted) {
          if (q.questionType === 'NUMERICAL') {
            isCorrect = String(ua).trim() === String(q.correctAnswer || '').trim();
          } else if (isMultiCorrect) {
             const actualCorrectArr = (q.correctOptionsArray || [Number(q.correctOption)]).sort((a,b)=>a-b);
             const userArr = Array.isArray(ua) ? [...ua].sort((a,b)=>a-b) : [Number(ua)];
             isCorrect = JSON.stringify(userArr) === JSON.stringify(actualCorrectArr);
          } else {
             isCorrect = Number(ua) === Number(q.correctOption);
          }
        }
      }

      return {
        ...q,
        userAnswer: ua,
        isCorrect,
        isAttempted,
      };
    });
  }, [originalQuestions, answersMap, result.questionResults]);

  // Calculate Metrics
  const totalQuestions = evaluatedQuestions.length;
  const attemptedQuestions = evaluatedQuestions.filter(q => q.isAttempted).length;
  const correctQuestions = evaluatedQuestions.filter(q => q.isAttempted && q.isCorrect).length;
  const wrongQuestions = attemptedQuestions - correctQuestions;
  
  let totalMarksScored = 0;
  let maxPossibleMarks = 0;
  
  // Calculate per subject marks
  const subjectMarksMap = {};

  evaluatedQuestions.forEach(q => {
    maxPossibleMarks += (q.marks || 4);
    
    if (!subjectMarksMap[q.subject]) {
      subjectMarksMap[q.subject] = 0;
    }
    
    if (q.isAttempted) {
      const marksEarned = q.isCorrect ? (q.marks || 4) : (q.questionType !== 'NUMERICAL' ? (q.negativeMarks ?? -1) : 0);
      totalMarksScored += marksEarned;
      subjectMarksMap[q.subject] += marksEarned;
    }
  });

  const subjectPerformanceData = Object.keys(subjectMarksMap).map(subject => ({
    name: subject,
    marks: Math.max(0, subjectMarksMap[subject])
  }));

  // Safe checks
  totalMarksScored = Math.max(0, totalMarksScored);

  // Difficulty Analysis Data
  const difficultyMap = { Easy: {total:0, correct:0, wrong:0, time:0}, Medium: {total:0, correct:0, wrong:0, time:0}, Hard: {total:0, correct:0, wrong:0, time:0} };
  
  // Topic Analysis Data
  const topicMap = {};

  evaluatedQuestions.forEach(q => {
    // Difficulty
    const diff = q.difficulty || 'Medium';
    if (!difficultyMap[diff]) difficultyMap[diff] = {total:0, correct:0, wrong:0, time:0};
    difficultyMap[diff].total++;
    const tSpent = q.timeSpent || Math.floor(Math.random() * 60 + 30);
    difficultyMap[diff].time += tSpent;
    if (q.isAttempted) {
      if (q.isCorrect) difficultyMap[diff].correct++;
      else difficultyMap[diff].wrong++;
    }

    // Topics
    const topic = q.topic || 'General';
    if (!topicMap[topic]) topicMap[topic] = { subject: q.subject || 'Miscellaneous', total: 0, correct: 0, wrong: 0, time: 0, marks: 0 };
    topicMap[topic].total++;
    topicMap[topic].time += tSpent;
    topicMap[topic].marks += (q.marks || 4);
    if (q.isAttempted) {
      if (q.isCorrect) topicMap[topic].correct++;
      else topicMap[topic].wrong++;
    }
  });

  const difficultyData = Object.keys(difficultyMap).map(d => ({
    name: d,
    ...difficultyMap[d],
    avgTime: difficultyMap[d].total > 0 ? Math.floor(difficultyMap[d].time / difficultyMap[d].total) : 0,
    accuracy: (difficultyMap[d].correct + difficultyMap[d].wrong) > 0 ? Math.round((difficultyMap[d].correct / (difficultyMap[d].correct + difficultyMap[d].wrong)) * 100) : 0
  }));

  const topicData = Object.keys(topicMap).map(t => ({
    name: t,
    ...topicMap[t],
    accuracy: (topicMap[t].correct + topicMap[t].wrong) > 0 ? Math.round((topicMap[t].correct / (topicMap[t].correct + topicMap[t].wrong)) * 100) : 0
  })).sort((a, b) => b.total - a.total);

  // Time Analysis Data
  const timeAnalysis = useMemo(() => {
    let totalSec = 0;
    let fastestCorrect = Infinity;
    let slowest = 0;
    let attemptCount = 0;

    evaluatedQuestions.forEach(q => {
      const t = q.timeSpent || 0;
      totalSec += t;
      if (t > 0) attemptCount++;
      if (t > slowest) slowest = t;
      if (q.isAttempted && q.isCorrect && t < fastestCorrect && t > 0) {
        fastestCorrect = t;
      }
    });

    if (fastestCorrect === Infinity) fastestCorrect = 0;
    
    return {
      totalTime: totalSec,
      avgTime: attemptCount > 0 ? Math.floor(totalSec / attemptCount) : 0,
      fastestCorrect,
      slowest
    };
  }, [evaluatedQuestions]);

  const formatSecs = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  // Fake Leaderboard
  const rankData = useMemo(() => {
    return generateFakeRankers(result.testId || 'default', totalMarksScored, maxPossibleMarks || 300);
  }, [result.testId, totalMarksScored, maxPossibleMarks]);

  const TABS = [
    { id: 'Overview', icon: <Monitor className="w-4 h-4"/>, label: 'Overview' },
    { id: 'Performance', icon: <BarChart3 className="w-4 h-4"/>, label: 'Subject Analysis' },
    { id: 'Time', icon: <Clock className="w-4 h-4"/>, label: 'Time Analysis' },
    { id: 'Difficulty', icon: <Target className="w-4 h-4"/>, label: 'Difficulty Level' },
    { id: 'Topics', icon: <FileText className="w-4 h-4"/>, label: 'Topic Weightage' },
    { id: 'Rankers', icon: <Trophy className="w-4 h-4"/>, label: 'Rankers' },
  ];

  // Render Solutions View
  if (showSolutions) {
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
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
         <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
           <div>
             <h1 className="text-xl font-bold text-slate-800">{testDetails?.title || 'Test Solutions'}</h1>
             <p className="text-sm text-slate-500">Review your answers and solutions</p>
           </div>
           <div className="flex gap-4">
             <button onClick={() => setShowSolutions(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Back to Analysis</button>
           </div>
         </div>
         {/* Simple solution rendering (Placeholder for the real one, matching existing functionality) */}
         <div className="max-w-7xl mx-auto py-8 px-4 flex gap-6">
            <div className="flex-1 bg-white p-8 rounded-2xl border shadow-sm">
               {activeQuestion ? (
                 <div>
                   <div className="flex gap-3 mb-6 pb-6 border-b border-slate-100">
                     <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg border border-indigo-100">Question {selectedQIdx + 1}</span>
                     {activeQuestion.isAttempted ? (
                        activeQuestion.isCorrect 
                          ? <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-lg border border-emerald-100 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Correct (+{activeQuestion.marks || 4})</span>
                          : <span className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-100 flex items-center gap-1"><Target className="w-4 h-4"/> Incorrect ({activeQuestion.questionType !== 'NUMERICAL' ? (activeQuestion.negativeMarks ?? -1) : 0})</span>
                     ) : (
                        <span className="px-3 py-1.5 bg-slate-50 text-slate-700 text-sm font-bold rounded-lg border border-slate-200">Unattempted</span>
                     )}
                   </div>
                   
                   <div className="prose max-w-none mb-8">
                     <div dangerouslySetInnerHTML={{__html: activeQuestion.question || activeQuestion.questionText}} className="tex2jax_process text-lg text-slate-800" />
                   </div>
                   
                   {/* Options if MCQ */}
                   {activeQuestion.options && activeQuestion.options.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                       {activeQuestion.options.map((opt, oIdx) => {
                         const isCorrectOpt = activeQuestion.questionType === 'MULTI_CORRECT' || activeQuestion.questionType === 'MCQM'
                            ? (activeQuestion.correctOptionsArray || []).includes(oIdx)
                            : Number(activeQuestion.correctOption) === oIdx;
                         const isUserOpt = Array.isArray(activeQuestion.userAnswer)
                            ? activeQuestion.userAnswer.includes(oIdx)
                            : Number(activeQuestion.userAnswer) === oIdx;
                         
                         let borderClass = 'border-slate-200 hover:border-slate-300';
                         let bgClass = 'bg-white';

                         if (isCorrectOpt) {
                           borderClass = 'border-emerald-500 ring-1 ring-emerald-500';
                           bgClass = 'bg-emerald-50/30';
                         } else if (isUserOpt && !isCorrectOpt) {
                           borderClass = 'border-red-400';
                           bgClass = 'bg-red-50/30';
                         }

                         return (
                           <div key={oIdx} className={`p-4 rounded-xl border-2 transition-colors ${borderClass} ${bgClass} flex gap-4 items-start`}>
                             <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${isCorrectOpt ? 'bg-emerald-500 text-white' : (isUserOpt ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600')}`}>
                               {String.fromCharCode(65 + oIdx)}
                             </div>
                             <div dangerouslySetInnerHTML={{__html: opt}} className="tex2jax_process pt-0.5 text-slate-700" />
                           </div>
                         );
                       })}
                     </div>
                   )}
                   
                   {activeQuestion.questionType === 'NUMERICAL' && (
                     <div className="mb-10 p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
                        <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                           Correct Answer: <span className="text-emerald-600 text-xl font-black bg-emerald-100 px-3 py-1 rounded-lg">{activeQuestion.correctAnswer}</span>
                        </div>
                        {activeQuestion.isAttempted && (
                          <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                             Your Answer: <span className={`text-xl font-black px-3 py-1 rounded-lg ${activeQuestion.isCorrect ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'}`}>{activeQuestion.userAnswer}</span>
                          </div>
                        )}
                     </div>
                   )}
                   
                   {activeQuestion.solution && (
                     <div className="mt-8 bg-[#f8fafc] rounded-2xl p-8 border border-slate-200 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                       <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2">
                         <FileText className="w-6 h-6 text-blue-500"/> Detailed Solution
                       </h3>
                       <TeacherSolution html={activeQuestion.solution} isLight={true} />
                     </div>
                   )}
                   
                   {(!activeQuestion.isAttempted || !activeQuestion.isCorrect) && (
                     <MistakeBooster originalQuestion={activeQuestion} />
                   )}
                 </div>
               ) : (
                 <p className="text-slate-500">No questions match the current filter.</p>
               )}
            </div>
            <div className="w-80 flex-shrink-0">
               <div className="bg-white p-4 rounded-xl border shadow-sm">
                 <h3 className="font-bold text-slate-700 mb-4">Question Palette</h3>
                 <div className="flex flex-wrap gap-2">
                   {filteredQuestions.map((q, idx) => (
                     <button 
                       key={idx}
                       onClick={() => setSelectedQIdx(idx)}
                       className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                         ${selectedQIdx === idx ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                         ${!q.isAttempted ? 'bg-slate-100 text-slate-500' : (q.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}
                       `}
                     >
                       {idx + 1}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // Circular Progress for Percentile
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Number(rankData.percentile) / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#1e293b] font-sans flex flex-col">
      {/* Navbar Placeholder if needed, but normally embedded in layout */}
      <div className="px-8 py-4 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold">QA</div>
          <span className="font-bold text-lg text-slate-800">Quantrex Academy Analysis</span>
        </div>
        <div className="flex gap-4">
          <button onClick={onBack} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="flex flex-1 max-w-[1400px] w-full mx-auto p-6 gap-6">
        
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}
              `}
            >
              {tab.icon} {tab.label}
              {tab.id === 'Attempt' && <span className="ml-auto text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">New</span>}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Blue Header Card */}
          <div className="bg-[#2563eb] rounded-xl p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             <div className="relative z-10">
               <h2 className="text-2xl font-bold mb-1">{testDetails?.title || 'Practice Test'}</h2>
               <p className="text-blue-100 text-sm">{new Date().toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
             </div>
             <div className="relative z-10 flex gap-3">
               {onRetake && (
                 <button onClick={() => onRetake(result.testId)} className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/10 shadow-sm flex items-center gap-2">
                   Retake Test
                 </button>
               )}
               <button onClick={() => setShowSolutions(true)} className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2">
                 <Target className="w-4 h-4"/> View Solutions
               </button>
             </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Score Card */}
              <div className="bg-white rounded-xl p-6 border shadow-sm flex flex-col items-center justify-center text-center h-[280px]">
                 <div className="flex items-center gap-2 text-slate-700 font-bold mb-6">
                   <Trophy className="w-5 h-5 text-blue-600"/> Your Score
                 </div>
                 <div className="flex items-baseline gap-1 mb-2">
                   <span className="text-6xl font-black text-blue-600">{totalMarksScored}</span>
                   <span className="text-2xl font-bold text-slate-400">/ {maxPossibleMarks}</span>
                 </div>
                 <p className="text-slate-500 text-sm mb-6">Total marks obtained</p>
                 
                 <div className="w-full bg-slate-100 rounded-full h-2 mb-2 relative overflow-hidden">
                   <div 
                     className="bg-blue-500 h-full rounded-full" 
                     style={{ width: `${maxPossibleMarks > 0 ? (totalMarksScored / maxPossibleMarks) * 100 : 0}%` }}
                   ></div>
                 </div>
                 <div className="w-full flex justify-between text-xs text-slate-400 font-bold mb-4">
                   <span>Score</span>
                   <span>{maxPossibleMarks > 0 ? (totalMarksScored / maxPossibleMarks * 100).toFixed(0) : 0}%</span>
                 </div>
                 
                 <div className="px-4 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                   {maxPossibleMarks > 0 ? (totalMarksScored < maxPossibleMarks * 0.4 ? 'Room for improvement' : (totalMarksScored < maxPossibleMarks * 0.7 ? 'Good Attempt' : 'Excellent!')) : 'Unattempted'}
                 </div>
              </div>

              {/* Predicted Percentile Card */}
              <div className="bg-[#fff9f0] rounded-xl p-6 border border-orange-100 shadow-sm flex flex-col items-center justify-center text-center h-[280px]">
                 <div className="flex items-center gap-2 text-slate-700 font-bold mb-6">
                   <BarChart3 className="w-5 h-5 text-orange-500"/> Predicted Percentile
                 </div>
                 
                 {(() => {
                   const percentage = maxPossibleMarks > 0 ? (totalMarksScored / maxPossibleMarks) * 100 : 0;
                   let expectedPercentile = 0;
                   if (percentage >= 90) expectedPercentile = 99.9 + (percentage - 90) * 0.01;
                   else if (percentage >= 75) expectedPercentile = 99.0 + (percentage - 75) * 0.06;
                   else if (percentage >= 50) expectedPercentile = 96.0 + (percentage - 50) * 0.12;
                   else if (percentage >= 30) expectedPercentile = 90.0 + (percentage - 30) * 0.3;
                   else if (percentage >= 15) expectedPercentile = 70.0 + (percentage - 15) * 1.33;
                   else expectedPercentile = Math.max(0, percentage * 4.6);
                   
                   const expectedRank = Math.max(1, Math.floor((100 - expectedPercentile) * 1400000 / 100));
                   
                   return (
                     <>
                       <div className="flex justify-between w-full px-8 mb-2">
                         <div className="text-center">
                           <p className="text-xs text-slate-400 font-bold">Min</p>
                           <p className="text-sm font-bold text-slate-600">{Math.max(0, expectedPercentile - 0.5).toFixed(2)}</p>
                         </div>
                         <div className="text-center">
                           <p className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-1">Expected</p>
                           <div className="text-4xl font-black text-slate-800">{expectedPercentile.toFixed(2)}<span className="text-lg font-bold text-orange-500 ml-1">th</span></div>
                         </div>
                         <div className="text-center">
                           <p className="text-xs text-slate-400 font-bold">Max</p>
                           <p className="text-sm font-bold text-slate-600">{Math.min(100, expectedPercentile + 0.5).toFixed(2)}</p>
                         </div>
                       </div>
                       
                       <div className="w-full border-t border-orange-200/50 my-4"></div>
                       
                       <p className="text-xs text-slate-500 mb-2">Estimated performance in the actual exam</p>
                       <p className="text-xs font-bold text-slate-400 mb-1">Predicted rank range</p>
                       <p className="text-sm font-bold text-slate-700 mb-3">{Math.max(1, expectedRank - 2000).toLocaleString('en-IN')} to {(expectedRank + 2000).toLocaleString('en-IN')}</p>
                     </>
                   );
                 })()}
                 
                 <div className="px-3 py-1 bg-white text-orange-600 text-[10px] font-bold rounded border border-orange-200">
                   As per JEE Mains Data
                 </div>
              </div>

              {/* Quantrex Percentile Card */}
              <div className="bg-[#f0fdf4] rounded-xl p-6 border border-green-100 shadow-sm flex flex-col items-center justify-center text-center h-[280px]">
                 <div className="flex items-center gap-2 text-slate-700 font-bold mb-4">
                   <Trophy className="w-5 h-5 text-green-600"/> Quantrex Percentile
                 </div>
                 
                 <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                   <svg className="transform -rotate-90 w-32 h-32">
                     <circle cx="64" cy="64" r={radius} stroke="#dcfce7" strokeWidth="8" fill="transparent" />
                     <circle cx="64" cy="64" r={radius} stroke="#22c55e" strokeWidth="8" fill="transparent" 
                       strokeDasharray={circumference} 
                       strokeDashoffset={strokeDashoffset} 
                       strokeLinecap="round"
                     />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-2xl font-black text-slate-800">{rankData.percentile}</span>
                     <span className="text-xs font-bold text-green-600">th</span>
                   </div>
                 </div>
                 
                 <p className="text-sm text-slate-500 font-medium mb-3">
                   Better than <strong className="text-slate-700">{rankData.percentile}%</strong> of students
                 </p>
                 
                 <button onClick={() => setActiveTab('Rankers')} className="px-4 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-bold rounded-full transition-colors flex items-center gap-1">
                   <Trophy className="w-3 h-3"/> View Rankers
                 </button>
              </div>

              {/* Bottom Cards: Positive / Negative Marks */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white rounded-xl p-6 border shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold text-xl">+</div>
                     <div>
                       <h3 className="font-bold text-slate-700">Positive Marks</h3>
                       <p className="text-sm text-slate-500">Correctly answered</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-2xl font-black text-green-500">+{correctQuestions * 4}</div>
                     <div className="text-xs text-slate-400 font-bold">{correctQuestions} questions</div>
                   </div>
                 </div>
                 
                 <div className="bg-white rounded-xl p-6 border shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold text-xl">-</div>
                     <div>
                       <h3 className="font-bold text-slate-700">Negative Marks</h3>
                       <p className="text-sm text-slate-500">Incorrectly answered</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-2xl font-black text-red-500">-{wrongQuestions}</div>
                     <div className="text-xs text-slate-400 font-bold">{wrongQuestions} questions</div>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'Rankers' && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800">Leaderboard ({rankData.totalStudents} Students)</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                       <th className="px-6 py-3 font-semibold">Rank</th>
                       <th className="px-6 py-3 font-semibold">Name</th>
                       <th className="px-6 py-3 font-semibold text-right">Score</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {rankData.rankers.map((r, i) => (
                       <tr key={i} className={r.isUser ? 'bg-blue-50/50' : 'hover:bg-slate-50'}>
                         <td className="px-6 py-4">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                             r.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                             r.rank === 2 ? 'bg-slate-200 text-slate-700' :
                             r.rank === 3 ? 'bg-orange-100 text-orange-700' :
                             'bg-slate-100 text-slate-600'
                           }`}>
                             {r.rank}
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <span className={`font-semibold ${r.isUser ? 'text-blue-700' : 'text-slate-700'}`}>
                             {r.name} {r.isUser && '(You)'}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <span className={`font-black ${r.isUser ? 'text-blue-700' : 'text-slate-700'}`}>{r.score}</span>
                           <span className="text-xs text-slate-400 font-medium ml-1">/ {maxPossibleMarks}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'Time' && (
            <div className="bg-white rounded-xl border shadow-sm p-8 flex flex-col items-center">
              <h3 className="font-bold text-2xl text-slate-800 mb-8 w-full">Time Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-10">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center shadow-sm">
                   <div className="text-sm text-slate-500 font-bold mb-2">Total Time</div>
                   <div className="text-2xl font-black text-blue-700">{formatSecs(timeAnalysis.totalTime)}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center shadow-sm">
                   <div className="text-sm text-slate-500 font-bold mb-2">Avg Time / Q</div>
                   <div className="text-2xl font-black text-emerald-700">{formatSecs(timeAnalysis.avgTime)}</div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl text-center shadow-sm">
                   <div className="text-sm text-slate-500 font-bold mb-2">Fastest Correct</div>
                   <div className="text-2xl font-black text-orange-700">{formatSecs(timeAnalysis.fastestCorrect)}</div>
                </div>
                <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl text-center shadow-sm">
                   <div className="text-sm text-slate-500 font-bold mb-2">Slowest</div>
                   <div className="text-2xl font-black text-purple-700">{formatSecs(timeAnalysis.slowest)}</div>
                </div>
              </div>

              <div className="w-full">
                <h4 className="font-bold text-slate-700 mb-4 text-lg">Question wise time spent</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {evaluatedQuestions.map((q, i) => {
                    const timeSpent = q.timeSpent || 0;
                    return (
                      <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center">Q{i+1}</span>
                          <span className="text-sm font-bold text-slate-700">{q.subject}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          {q.isAttempted ? (
                            q.isCorrect ? <span className="text-emerald-600 text-xs font-bold bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">Correct</span> : <span className="text-red-600 text-xs font-bold bg-red-100 px-3 py-1.5 rounded-lg border border-red-200">Incorrect</span>
                          ) : (
                            <span className="text-slate-500 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Unattempted</span>
                          )}
                          <span className="text-sm font-bold text-slate-700 w-16 text-right flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatSecs(timeSpent)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'Performance' || activeTab === 'Attempt') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center">
                 <h3 className="font-bold text-slate-700 w-full text-left mb-6">Accuracy Breakdown</h3>
                 <div className="w-full h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={[
                           { name: 'Correct', value: correctQuestions, color: '#22c55e' },
                           { name: 'Incorrect', value: wrongQuestions, color: '#ef4444' },
                           { name: 'Unattempted', value: totalQuestions - attemptedQuestions, color: '#cbd5e1' }
                         ]}
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {
                           [
                             { name: 'Correct', value: correctQuestions, color: '#22c55e' },
                             { name: 'Incorrect', value: wrongQuestions, color: '#ef4444' },
                             { name: 'Unattempted', value: totalQuestions - attemptedQuestions, color: '#cbd5e1' }
                           ].map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))
                         }
                       </Pie>
                       <RechartsTooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="flex justify-center gap-6 w-full mt-4">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs font-medium text-slate-600">Correct ({correctQuestions})</span></div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs font-medium text-slate-600">Incorrect ({wrongQuestions})</span></div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div><span className="text-xs font-medium text-slate-600">Unattempted ({totalQuestions - attemptedQuestions})</span></div>
                 </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h3 className="font-bold text-slate-700 mb-6">Subject Performance</h3>
                 <div className="w-full h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={subjectPerformanceData.length > 0 ? subjectPerformanceData : [{name: 'Subject', marks: 0}]}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10}/>
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10}/>
                       <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                       <Bar dataKey="marks" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'Difficulty' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 overflow-hidden">
               <h3 className="font-bold text-slate-800 mb-6">Difficulty Level Analysis</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 {difficultyData.map((d, i) => (
                   <div key={i} className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center shadow-sm ${
                     d.name === 'Easy' ? 'bg-emerald-50 border-emerald-100' :
                     d.name === 'Medium' ? 'bg-blue-50 border-blue-100' :
                     'bg-red-50 border-red-100'
                   }`}>
                     <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${
                       d.name === 'Easy' ? 'text-emerald-600' :
                       d.name === 'Medium' ? 'text-blue-600' :
                       'text-red-600'
                     }`}>{d.name} Questions</div>
                     <div className="text-3xl font-black text-slate-800 mb-4">{d.correct} / {d.total}</div>
                     <div className="w-full grid grid-cols-2 gap-2 text-xs font-bold">
                       <div className="bg-white py-2 rounded border border-slate-200">
                         <span className="text-slate-400 block mb-1">Accuracy</span>
                         <span className="text-slate-700 text-sm">{d.accuracy}%</span>
                       </div>
                       <div className="bg-white py-2 rounded border border-slate-200">
                         <span className="text-slate-400 block mb-1">Avg Time</span>
                         <span className="text-slate-700 text-sm">{Math.floor(d.avgTime/60)}m {d.avgTime%60}s</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'Topics' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 overflow-hidden">
               <h3 className="font-bold text-slate-800 mb-6">Chapter & Topic Analysis</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                       <th className="px-4 py-3 font-semibold">Topic / Chapter</th>
                       <th className="px-4 py-3 font-semibold">Subject</th>
                       <th className="px-4 py-3 font-semibold text-center">Questions</th>
                       <th className="px-4 py-3 font-semibold text-center">Marks Earned</th>
                       <th className="px-4 py-3 font-semibold text-center">Accuracy</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {topicData.map((t, i) => (
                       <tr key={i} className="hover:bg-slate-50">
                         <td className="px-4 py-4 font-semibold text-slate-700">{t.name}</td>
                         <td className="px-4 py-4">
                           <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                             t.subject.toLowerCase() === 'physics' ? 'bg-blue-100 text-blue-700' :
                             t.subject.toLowerCase() === 'chemistry' ? 'bg-orange-100 text-orange-700' :
                             'bg-emerald-100 text-emerald-700'
                           }`}>{t.subject}</span>
                         </td>
                         <td className="px-4 py-4 text-center">
                           <span className="font-black text-slate-700">{t.total}</span>
                         </td>
                         <td className="px-4 py-4 text-center">
                           <span className="font-bold text-emerald-600">{t.marks}</span>
                         </td>
                         <td className="px-4 py-4 text-center">
                           <div className="flex items-center justify-center gap-2">
                             <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                               <div className="bg-blue-500 h-full rounded-full" style={{width: `${t.accuracy}%`}}></div>
                             </div>
                             <span className="text-xs font-bold text-slate-500 w-8">{t.accuracy}%</span>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
