import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bookmark, Flag, ChevronLeft, ChevronRight, X, Clock, CheckCircle, BrainCircuit, Plus, Folder } from 'lucide-react';

export default function ExamGoalPracticeInterface({ test, user, onBackToDashboard }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [integerAnswers, setIntegerAnswers] = useState({});
  const [statusMap, setStatusMap] = useState({});
  
  // Bookmarks
  const [bookmarked, setBookmarked] = useState({});
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkGroups, setBookmarkGroups] = useState(['General', 'Hard Questions', 'Needs Revision']);
  const [newGroupName, setNewGroupName] = useState('');

  const [showSolution, setShowSolution] = useState(false);
  
  // Cinematic states
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [animateDirection, setAnimateDirection] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const timerRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (test && test.questions) {
      setQuestions(test.questions);
      const initialStatus = {};
      test.questions.forEach((q, i) => {
        initialStatus[i] = i === 0 ? 'seen' : 'unseen';
      });
      setStatusMap(initialStatus);
      if (test.durationMinutes) {
        setTimeRemaining(test.durationMinutes * 60);
      }
      
      // Load bookmarks from local storage
      try {
        const savedBookmarks = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
        const b = {};
        test.questions.forEach((q, i) => {
          if (savedBookmarks[q.id]) b[i] = savedBookmarks[q.id]; // holds group name
        });
        setBookmarked(b);
        
        const groups = JSON.parse(localStorage.getItem('quantrex_bookmark_groups') || '["General", "Hard Questions", "Needs Revision"]');
        setBookmarkGroups(groups);
      } catch(e){}
    }
  }, [test]);

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeRemaining, currentIdx]);

  useEffect(() => {
    if (window.MathJax) {
      setTimeout(() => {
        window.MathJax.typesetPromise && window.MathJax.typesetPromise();
      }, 100);
    }
    
    let timeout = setTimeout(() => setIsFocusMode(true), 4000);
    const handleMouseMove = () => {
      setIsFocusMode(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsFocusMode(true), 4000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [currentIdx, showSolution]);

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
    setStatusMap(prev => ({ ...prev, [currentIdx]: 'attempted' }));
  };

  const handleIntegerChange = (val) => {
    setIntegerAnswers(prev => ({ ...prev, [currentIdx]: val }));
    setStatusMap(prev => ({ ...prev, [currentIdx]: val.trim() !== '' ? 'attempted' : 'seen' }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setAnimateDirection('left');
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
        setStatusMap(prev => ({ 
          ...prev, 
          [currentIdx + 1]: prev[currentIdx + 1] === 'unseen' ? 'seen' : prev[currentIdx + 1] 
        }));
        setShowSolution(false);
        setAnimateDirection('');
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setAnimateDirection('right');
      setTimeout(() => {
        setCurrentIdx(prev => prev - 1);
        setShowSolution(false);
        setAnimateDirection('');
      }, 300);
    }
  };

  const saveBookmark = (groupName) => {
    const q = questions[currentIdx];
    setBookmarked(prev => ({...prev, [currentIdx]: groupName}));
    
    try {
      const saved = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
      saved[q.id] = groupName;
      localStorage.setItem('quantrex_bookmarks_v2', JSON.stringify(saved));
    } catch(e){}
    
    setShowBookmarkModal(false);
  };

  const removeBookmark = () => {
    const q = questions[currentIdx];
    setBookmarked(prev => {
      const nb = {...prev};
      delete nb[currentIdx];
      return nb;
    });
    
    try {
      const saved = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
      delete saved[q.id];
      localStorage.setItem('quantrex_bookmarks_v2', JSON.stringify(saved));
    } catch(e){}
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() && !bookmarkGroups.includes(newGroupName.trim())) {
      const newGroups = [...bookmarkGroups, newGroupName.trim()];
      setBookmarkGroups(newGroups);
      localStorage.setItem('quantrex_bookmark_groups', JSON.stringify(newGroups));
      saveBookmark(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const getStatusColor = (idx) => {
    const status = statusMap[idx];
    if (status === 'attempted') return 'bg-electric text-obsidian shadow-[0_0_15px_rgba(0,180,216,0.5)]';
    if (status === 'seen') return 'bg-amber-500 text-obsidian shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    return 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30';
  };

  if (!questions || questions.length === 0) return <div className="h-screen bg-obsidian flex items-center justify-center"><div className="shimmer w-64 h-2 rounded"></div></div>;

  const currentQ = questions[currentIdx];
  const isInteger = currentQ.type === 'integer' || currentQ.type === 'numerical';
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative h-screen bg-obsidian font-sans text-white overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-obsidian to-obsidian">
      
      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-electric/10 blur-[120px] rounded-full pointer-events-none transition-all duration-1000"></div>
      
      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${isFocusMode ? 'opacity-30' : 'opacity-100'}`}>
        <div className="glass-panel mx-4 mt-4 rounded-2xl h-16 flex items-center justify-between px-6 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-4">
            <button onClick={onBackToDashboard} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group border border-white/10 hover:border-red-500/50">
              <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors" />
            </button>
            <div>
              <h1 className="font-bold tracking-wider text-sm uppercase text-gray-200">{test.title || test.chapterName || "Cinematic Practice Mode"}</h1>
              <div className="text-[10px] text-electric font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric animate-pulse"></span>
                QUANTREX NEURAL ENGINE
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-obsidian/80 px-5 py-2 rounded-xl border border-electric/20 shadow-[0_0_15px_rgba(0,180,216,0.1)]">
              <Clock className="w-4 h-4 text-electric" />
              <span className="font-mono text-xl font-bold tracking-wider">{formatTime(timeRemaining)}</span>
            </div>
            <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 px-6 py-2 rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all transform active:scale-95">
              SUBMIT
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full pt-20">
        
        {/* Left Side: Question */}
        <div className="flex-1 flex flex-col relative px-8 pb-8 pt-4 z-10 transition-all duration-500 ease-out">
          
          <div className={`flex-1 glass-panel rounded-3xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transition-all duration-500 ease-out transform ${animateDirection === 'left' ? '-translate-x-10 opacity-0 scale-95' : animateDirection === 'right' ? 'translate-x-10 opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}`}>
            
            <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-electric/10 border border-electric/30 flex items-center justify-center text-xl font-bold text-electric shadow-[0_0_15px_rgba(0,180,216,0.2)]">
                  Q{currentIdx + 1}
                </div>
                <div>
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">{currentQ.chapterId.replace(/_/g, ' ')}</div>
                  <div className="text-sm font-bold text-gray-200">{currentQ.year || "PYQ"}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 relative">
                <div className="px-3 py-1 rounded border border-green-500/30 text-green-400 font-mono text-xs">+4</div>
                <div className="px-3 py-1 rounded border border-red-500/30 text-red-400 font-mono text-xs">-1</div>
                <button 
                  onClick={() => bookmarked[currentIdx] ? removeBookmark() : setShowBookmarkModal(true)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${bookmarked[currentIdx] ? 'bg-gold/20 text-gold shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                
                {/* Bookmark Modal (ExamGoal style folder selection) */}
                {showBookmarkModal && (
                  <div className="absolute top-12 right-0 w-64 glass-panel border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-fade-in bg-obsidian/95 backdrop-blur-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-gray-200">Save to Group</h4>
                      <button onClick={() => setShowBookmarkModal(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4"/></button>
                    </div>
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                      {bookmarkGroups.map((group, i) => (
                        <button key={i} onClick={() => saveBookmark(group)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-gray-300 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-gold"/> {group}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                      <input 
                        type="text" 
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="New Group Name"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-electric"
                      />
                      <button onClick={handleCreateGroup} className="bg-electric text-obsidian p-1.5 rounded-lg hover:bg-electric-dark"><Plus className="w-4 h-4"/></button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
              {/* Added whitespace-pre-wrap to fix missing paragraph breaks */}
              <div 
                className="text-[17px] md:text-lg text-gray-100 leading-[2.2] tex2jax_process mb-10 font-medium whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: currentQ.question }}
              />

              {isInteger ? (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 max-w-sm">
                   <label className="block text-sm text-gray-400 mb-3 font-mono">Enter Numerical Answer:</label>
                   <input 
                     type="text" 
                     value={integerAnswers[currentIdx] || ''}
                     onChange={(e) => !showSolution && handleIntegerChange(e.target.value)}
                     disabled={showSolution}
                     className="w-full bg-obsidian border-2 border-white/10 focus:border-electric rounded-xl px-4 py-3 text-white text-xl font-bold shadow-inner outline-none transition-all disabled:opacity-50"
                     placeholder="e.g. 5"
                   />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = selectedAnswers[currentIdx] === i;
                    const isChecked = showSolution;
                    const isCorrect = currentQ.correctOptionIndex === i;
                    
                    let optionClass = "glass-panel border-white/10 hover:border-electric/50 hover:bg-white/10";
                    if (isSelected) optionClass = "bg-electric/15 border-electric shadow-[0_0_20px_rgba(0,180,216,0.3)]";
                    
                    if (isChecked) {
                      if (isCorrect) optionClass = "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]";
                      else if (isSelected) optionClass = "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]";
                      else optionClass = "glass-panel border-white/5 opacity-50";
                    }

                    return (
                      <div 
                        key={i}
                        onClick={() => !isChecked && handleSelectOption(i)}
                        className={`relative group px-5 py-3 rounded-2xl border cursor-pointer transition-all duration-300 transform active:scale-[0.98] flex items-center gap-4 ${optionClass}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shrink-0 ${isSelected || (isChecked && isCorrect) ? 'bg-white text-obsidian' : 'bg-white/10 text-gray-300'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div className="flex-1 text-[15px] md:text-base text-gray-200 tex2jax_process whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: opt }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-10 py-5 bg-white/[0.02] border-t border-white/5 flex justify-between items-center z-20">
              <div className="flex gap-4">
                <button 
                  onClick={() => { setSelectedAnswers(prev => { const n = {...prev}; delete n[currentIdx]; return n; }); setIntegerAnswers(prev => { const n = {...prev}; delete n[currentIdx]; return n; }); setStatusMap(prev => ({...prev, [currentIdx]: 'seen'})); setShowSolution(false); }}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:text-white hover:bg-white/5 transition-all active:scale-95"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setShowSolution(!showSolution)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 ${showSolution ? 'bg-obsidian border border-electric text-electric shadow-[0_0_15px_rgba(0,180,216,0.2)]' : 'bg-electric text-obsidian shadow-[0_0_15px_rgba(0,180,216,0.4)] hover:bg-electric-dark'}`}
                >
                  <BrainCircuit className="w-4 h-4" /> {showSolution ? 'Hide Solution' : 'Check Answer'}
                </button>
              </div>

              <div className="flex gap-4">
                <button onClick={handlePrev} disabled={currentIdx === 0} className="w-12 h-12 rounded-xl glass-panel border border-white/10 flex items-center justify-center hover:border-electric hover:text-electric transition-all disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white active:scale-95">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={handleNext} disabled={currentIdx === questions.length - 1} className="px-8 py-2.5 rounded-xl bg-white text-obsidian font-bold hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2">
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Drawer */}
        <div className={`w-[340px] shrink-0 p-4 transition-all duration-700 ease-in-out z-40 flex flex-col gap-4 ${isFocusMode ? 'translate-x-[110%]' : 'translate-x-0'}`}>
          {showSolution ? (
            <div className="flex-1 glass-panel rounded-3xl border border-electric/30 shadow-[0_0_40px_rgba(0,180,216,0.2)] p-6 flex flex-col overflow-hidden animate-fade-in">
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="font-bold text-lg text-electric flex items-center gap-2"><BrainCircuit className="w-5 h-5"/> Solution</h3>
                <button onClick={() => setShowSolution(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div 
                  className="text-sm text-gray-200 leading-[1.8] tex2jax_process space-y-4 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: currentQ.solution }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 glass-panel rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6 flex flex-col">
              <h3 className="font-bold text-sm tracking-widest uppercase text-gray-400 mb-6 text-center">Neural Grid</h3>
              
              <div className="grid grid-cols-5 gap-3 mb-8">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setShowSolution(false); setCurrentIdx(idx); }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 transform hover:scale-110 active:scale-95 relative
                      ${getStatusColor(idx)}
                      ${currentIdx === idx ? 'ring-2 ring-white ring-offset-2 ring-offset-obsidian scale-110 z-10' : ''}
                    `}
                  >
                    {idx + 1}
                    {bookmarked[idx] && <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border-2 border-obsidian" title={bookmarked[idx]}></div>}
                  </button>
                ))}
              </div>

              <div className="mt-auto bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-electric shadow-[0_0_10px_rgba(0,180,216,0.5)]"></div><span className="text-xs font-medium text-gray-300">Attempted</span></div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div><span className="text-xs font-medium text-gray-300">Viewed</span></div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-white/5 border border-white/20"></div><span className="text-xs font-medium text-gray-300">Unseen</span></div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
