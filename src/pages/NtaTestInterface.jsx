import React, { useState, useEffect } from 'react';

export default function NtaTestInterface({ test, user, onBackToDashboard, mode = 'test' }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { qIdx: selectedOptionIdx }
  const [statusMap, setStatusMap] = useState({}); // { qIdx: 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked' }
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // Trigger MathJax re-render when question changes
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
  }, [currentIdx, questions, showExplanation]);

  useEffect(() => {
    if (test && test.questions) {
      setQuestions(test.questions);
      
      const savedData = localStorage.getItem(`nta_test_progress_${test.id}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setAnswers(parsed.answers || {});
        setStatusMap(parsed.statusMap || {});
        setTimeLeft(parsed.timeLeft || (test.durationMinutes || 180) * 60);
        setCurrentIdx(parsed.currentIdx || 0);
      } else {
        setTimeLeft((test.durationMinutes || 180) * 60);
        const initialStatus = {};
        test.questions.forEach((_, i) => initialStatus[i] = 'not_visited');
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
        timeLeft,
        currentIdx
      };
      localStorage.setItem(`nta_test_progress_${test.id}`, JSON.stringify(progress));
    }
  }, [answers, statusMap, timeLeft, currentIdx, isSubmitted, test]);

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
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

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
    questions.forEach((q, idx) => {
      // In practice mode correctOption might be 'A', map it to index 0
      let correctIdx = q.correctOption;
      if (typeof correctIdx === 'string') {
        correctIdx = correctIdx.charCodeAt(0) - 65;
      }
      if (answers[idx] === correctIdx) finalScore += 4;
      else if (answers[idx] !== undefined) finalScore -= 1;
    });
    setScore(finalScore);
    setIsSubmitted(true);
    if (test && test.id) {
      localStorage.removeItem(`nta_test_progress_${test.id}`);
    }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Test Submitted Successfully!</h2>
          <p className="text-lg">Your Score: {score} / {questions.length * 4}</p>
          <button onClick={onBackToDashboard} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  if (!currentQ) return <div className="bg-white min-h-screen">Loading...</div>;

  const counts = { answered: 0, not_answered: 0, not_visited: 0, marked: 0, answered_marked: 0 };
  Object.values(statusMap).forEach(val => counts[val] = (counts[val] || 0) + 1);

  return (
    <div className="min-h-screen bg-[#F0F4F7] flex flex-col font-sans select-none overflow-hidden">
      {/* Header */}
      <header className="bg-[#1a5b8c] text-white px-4 py-2.5 flex justify-between items-center text-sm shadow-md z-10 border-b-4 border-yellow-500">
        <div className="font-bold text-lg tracking-wide uppercase flex items-center gap-4">
          <button onClick={onBackToDashboard} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors shadow">
            ← Exit Test
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

      {/* Subject Tabs */}
      <div className="bg-white border-b border-gray-300 flex text-sm">
        <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-t-lg ml-2 mt-1">Mathematics</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col bg-white border-r border-gray-300 relative">
          <div className="bg-[#f2f8fc] text-blue-900 px-5 py-2.5 font-bold border-b border-blue-200 text-sm flex justify-between items-center shadow-sm">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Multiple Choice Question</span>
            <div className="flex gap-4 items-center">
              <span className="text-gray-700 text-xs font-normal mr-2">View In:</span>
              <select className="border border-gray-400 bg-white text-black text-xs px-2 py-1 outline-none">
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
                <div className="text-base text-gray-800 tex2jax_process" dangerouslySetInnerHTML={{ __html: currentQ.questionText }} />
                
                <div className="space-y-4 mt-6">
                  {currentQ.type === 'integer' || currentQ.options.length === 0 ? (
                    <div className="flex items-center gap-4 p-4 border border-blue-200 bg-blue-50/50 rounded-lg shadow-sm">
                      <span className="font-bold text-blue-900 text-sm">Enter Numerical Answer:</span>
                      <input 
                        type="number"
                        className="px-4 py-2 border border-gray-300 rounded font-mono text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-48 shadow-inner"
                        placeholder="e.g. 42"
                        value={answers[currentIdx] || ''}
                        onChange={(e) => {
                           const val = e.target.value;
                           setAnswers(prev => ({ ...prev, [currentIdx]: val }));
                           if (mode === 'practice' && val !== '') setShowExplanation(true);
                        }}
                      />
                    </div>
                  ) : (
                    currentQ.options.map((opt, oIdx) => (
                      <label key={oIdx} className={`flex items-start gap-3 cursor-pointer p-3 border rounded-lg transition-all duration-200 ${answers[currentIdx] === oIdx ? 'bg-blue-50 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input 
                          type="radio" 
                          name="q_option" 
                          className="mt-1 w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                          checked={answers[currentIdx] === oIdx}
                          onChange={() => {
                             setAnswers(prev => ({ ...prev, [currentIdx]: oIdx }));
                             if (mode === 'practice') setShowExplanation(true);
                          }}
                        />
                        <span className="text-sm font-medium tex2jax_process flex-1" dangerouslySetInnerHTML={{ __html: opt }} />
                      </label>
                    ))
                  )}
                </div>

                {/* Practice Mode Features */}
                {mode === 'practice' && (
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-300">
                    {!showExplanation ? (
                      <button 
                        onClick={() => setShowExplanation(true)}
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
                        <div className="text-sm text-gray-700 leading-relaxed tex2jax_process" dangerouslySetInnerHTML={{ __html: currentQ.explanation }} />
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-[#f0f4f7] p-3.5 flex justify-between items-center border-t border-gray-300 text-xs shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
            <div className="flex gap-2.5">
              <button onClick={handleSaveAndNext} className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2 px-4 rounded border-b-4 border-[#15803d] active:border-b-0 active:translate-y-1 transition-all">SAVE & NEXT</button>
              <button onClick={handleClearResponse} className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 transition-all">CLEAR</button>
              <button onClick={handleSaveAndMarkForReview} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2 px-4 rounded border-b-4 border-[#c2410c] active:border-b-0 active:translate-y-1 transition-all">SAVE & MARK FOR REVIEW</button>
              <button onClick={handleMarkForReviewAndNext} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-2 px-4 rounded border-b-4 border-[#1d4ed8] active:border-b-0 active:translate-y-1 transition-all">MARK FOR REVIEW & NEXT</button>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded border border-gray-300 transition-all">&lt;&lt; BACK</button>
              <button onClick={goNext} className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded border border-gray-300 transition-all">NEXT &gt;&gt;</button>
            </div>
          </div>
        </div>

        {/* Right Side: Palette */}
        <div className="w-[340px] bg-[#e6eff6] flex flex-col shadow-inner">
          <div className="p-4 flex gap-4 items-center bg-white border-b border-gray-300 shadow-sm">
            <img src="https://ui-avatars.com/api/?name=Student&background=random" className="w-16 h-16 border border-gray-300 rounded shadow-sm" alt="profile" />
            <div className="font-bold text-[#1a5b8c] text-sm">
              <div className="text-xl mb-0.5">{user?.name || 'Applicant'}</div>
              <div className="text-gray-600 font-semibold">Subject: <span className="text-blue-700">Mathematics</span></div>
            </div>
          </div>
          
          <div className="p-3 bg-[#f2f8fc] text-[11px] font-bold border-b border-gray-300 grid grid-cols-2 gap-y-3 gap-x-2 text-gray-700 shadow-sm z-10">
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-t-full rounded-l-full bg-[#22c55e] text-white flex justify-center items-center shadow-inner">{counts.answered || 0}</div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-t-full rounded-r-full bg-[#ef4444] text-white flex justify-center items-center shadow-inner">{counts.not_answered || 0}</div> Not Answered</div>
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded bg-[#e2e8f0] border border-[#cbd5e1] text-black flex justify-center items-center shadow-inner">{counts.not_visited || 0}</div> Not Visited</div>
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#9333ea] text-white flex justify-center items-center shadow-inner">{counts.marked || 0}</div> Marked for Review</div>
            <div className="flex items-center gap-2 col-span-2"><div className="w-7 h-7 rounded-full bg-[#9333ea] text-white flex justify-center items-center relative shadow-inner"><div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22c55e] rounded-full border border-white"></div>{counts.answered_marked || 0}</div> Answered & Marked for Review</div>
          </div>

          <div className="flex-1 bg-[#dbeaf4] p-4 overflow-y-auto">
            <div className="bg-[#1a5b8c] text-white font-bold px-3 py-1.5 mb-3 rounded shadow-sm">Mathematics</div>
            <div className="flex flex-wrap gap-2.5">
              {questions.map((_, i) => {
                const s = statusMap[i];
                let shapeClass = "w-9 h-9 flex items-center justify-center text-sm font-bold cursor-pointer text-white shadow hover:scale-105 transition-transform ";
                if (s === 'answered') shapeClass += "bg-[#22c55e] rounded-t-full rounded-l-full border border-green-700";
                else if (s === 'not_answered') shapeClass += "bg-[#ef4444] rounded-t-full rounded-r-full border border-red-700";
                else if (s === 'marked') shapeClass += "bg-[#9333ea] rounded-full border border-purple-800";
                else if (s === 'answered_marked') shapeClass += "bg-[#9333ea] rounded-full border border-purple-800 relative";
                else shapeClass += "bg-white border border-[#cbd5e1] text-black rounded";
                
                return (
                  <div key={i} onClick={() => jumpToQuestion(i)} className={shapeClass}>
                    {i + 1}
                    {s === 'answered_marked' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-white"></div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button (NTA puts it under palette) */}
          <div className="bg-[#c2e0f4] p-3 flex justify-center border-t border-gray-300">
             <button onClick={handleSubmit} className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2 px-10 rounded shadow transition-all">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
