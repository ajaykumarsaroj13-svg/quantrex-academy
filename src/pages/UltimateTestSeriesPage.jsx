import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Search, ArrowLeft, PlayCircle, Clock, Calendar, CheckCircle2, BarChart3, BookOpen } from 'lucide-react';

export default function UltimateTestSeriesPage({ user, onStartTest, onViewResult, onBack }) {
  const [data, setData] = useState({
    topic_tests: [],
    chapter_tests: [],
    full_tests: [],
    part_tests: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Physics');
  const [searchQuery, setSearchQuery] = useState('');
  const [resumePrompt, setResumePrompt] = useState({ show: false, testId: null, test: null });

  useEffect(() => {
    fetch('/data/jee_main_ultimate_series_2027.json')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error("Failed to load ultimate series data", e);
        setLoading(false);
      });
  }, []);

  const handleStartTest = (test) => {
    if (test.isUpcoming) {
      alert(`This test is coming soon! Available from: ${new Date(test.liveAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`);
      return;
    }
    const tid = test.testId || test.id || test.title;
    const savedState = localStorage.getItem(`quantrex_exam_state_${tid}`);
    if (savedState) {
      setResumePrompt({ show: true, testId: tid, test });
    } else {
      onStartTest(tid, 'exam', 'ultimate-test-series');
    }
  };

  const handleResumeChoice = (choice) => {
    const tid = resumePrompt.testId;
    if (choice === 'restart') {
      localStorage.removeItem(`quantrex_exam_state_${tid}`);
    }
    setResumePrompt({ show: false, testId: null, test: null });
    onStartTest(tid, 'exam', 'ultimate-test-series');
  };

  const allTests = useMemo(() => {
    return [
      ...(data.topic_tests || []), 
      ...(data.chapter_tests || []), 
      ...(data.full_tests || []), 
      ...(data.part_tests || [])
    ];
  }, [data]);

  const tabs = ['Physics', 'Mathematics', 'Chemistry', 'Full Tests', 'Part Tests'];

  const filtered = useMemo(() => {
    let arr = allTests;
    
    // Filter by tab
    if (['Physics', 'Mathematics', 'Chemistry'].includes(activeTab)) {
      arr = arr.filter(t => t.groupName === activeTab);
    } else if (activeTab === 'Full Tests') {
      arr = arr.filter(t => t.type === 'full' || (t.title && t.title.toLowerCase().includes('full')));
    } else if (activeTab === 'Part Tests') {
      arr = arr.filter(t => t.type === 'part' || (t.title && t.title.toLowerCase().includes('part')));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(t => 
        (t.title || '').toLowerCase().includes(q) ||
        (t.sectionName || '').toLowerCase().includes(q) ||
        (t.groupName || '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [allTests, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-obsidian text-white p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl transition-all hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-4xl font-bold font-display uppercase tracking-wider text-blue-500 m-0">JEE Main Ultimate Series 2027</h1>
        </div>
        
        <div className="flex flex-wrap gap-4 text-gray-400 text-sm font-medium">
          <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-blue-400">Total Tests:</span> {allTests.length}
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-emerald-400">Available Now:</span> {allTests.filter(t => !t.isUpcoming).length}
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-amber-400">Upcoming:</span> {allTests.filter(t => t.isUpcoming).length}
          </div>
        </div>
        
        {/* Search & Filters */}
        <div className="mt-8 flex flex-col xl:flex-row gap-4 justify-between items-center bg-cyberdark/50 p-4 rounded-2xl border border-white/10">
          <div className="flex flex-wrap gap-2 bg-obsidian p-1 rounded-xl w-full xl:w-auto">
            {tabs.map(tab => {
              let count = 0;
              if (['Physics', 'Mathematics', 'Chemistry'].includes(tab)) {
                count = allTests.filter(t => t.groupName === tab).length;
              } else if (tab === 'Full Tests') {
                count = allTests.filter(t => t.type === 'full' || (t.title && t.title.toLowerCase().includes('full'))).length;
              } else if (tab === 'Part Tests') {
                count = allTests.filter(t => t.type === 'part' || (t.title && t.title.toLowerCase().includes('part'))).length;
              }

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-bold tracking-wider transition-colors flex items-center gap-2 ${
                    activeTab === tab ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'}`}>
                     {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search tests, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-obsidian border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 text-gray-400 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              Loading ultimate series...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400">No tests found matching your criteria.</div>
          ) : (
            filtered.map(test => {
              const isUpcoming = test.isUpcoming;
              const dateStr = test.liveAt ? new Date(test.liveAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              }) : 'Coming Soon';
              const tid = test.testId || test.id || test.title;
              const isAttempted = localStorage.getItem(`quantrex_test_result_${tid}`);
              const isResumable = localStorage.getItem(`quantrex_exam_state_${tid}`);

              // Parse title for Number, e.g., "Units and Measurement Test - 1 (Topic Test )" -> extract "Test - 1"
              let displayName = test.title;
              let testNumberMatch = test.title.match(/Test\s*-\s*\d+/i) || test.title.match(/Test\s*\d+/i);
              let testNumberStr = testNumberMatch ? testNumberMatch[0] : "";
              
              return (
                <div key={tid} className="bg-cyberdark border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col relative overflow-hidden group">
                  {/* Status Badge */}
                  <div className="absolute top-0 right-0">
                    {isUpcoming ? (
                       <div className="bg-amber-500/20 text-amber-400 text-[10px] px-3 py-1 font-bold uppercase tracking-wider rounded-bl-lg border-b border-l border-amber-500/20">
                         Upcoming
                       </div>
                    ) : isAttempted ? (
                      <div className="bg-emerald-500/20 text-emerald-400 text-[10px] px-3 py-1 font-bold uppercase tracking-wider rounded-bl-lg border-b border-l border-emerald-500/20">
                        Attempted
                      </div>
                    ) : (
                      <div className="bg-blue-500/20 text-blue-400 text-[10px] px-3 py-1 font-bold uppercase tracking-wider rounded-bl-lg border-b border-l border-blue-500/20">
                        Available
                      </div>
                    )}
                  </div>

                  <div className="mb-4 pr-16">
                    {/* Display Number Prominently if extracted, else just show it as part of title */}
                    {testNumberStr ? (
                      <div className="text-2xl font-black text-blue-400 tracking-tight mb-1">{testNumberStr.toUpperCase()}</div>
                    ) : (
                       <div className="text-xl font-black text-blue-400 tracking-tight mb-1">TEST</div>
                    )}
                    
                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-300 transition-colors">
                      {displayName.replace(testNumberStr, '').replace(/\(\s*Topic Test\s*\)/i, '').replace(/\(\s*Chapter Test\s*\)/i, '').trim().replace(/^-/, '').trim() || displayName}
                    </h3>
                  </div>

                  {/* Subject and Topics Block */}
                  <div className="bg-white/5 rounded-xl p-3 mb-5 border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Subject</div>
                    <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                       <BookOpen className="w-4 h-4 text-purple-400" />
                       {test.groupName || 'Miscellaneous'}
                    </div>
                    
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Topic</div>
                    <div className="text-sm text-gray-300 line-clamp-2 leading-snug">
                      {test.sectionName || test.topics || test.syllabus || 'Full Syllabus'}
                    </div>
                  </div>
                  
                  {/* Meta stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-black/20 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>{test.durationMinutes >= 60 ? `${test.durationMinutes / 60} hrs` : `${test.durationMinutes || 180} min`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-black/20 p-2 rounded-lg">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span>{test.totalQuestions || 90} Qs</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-5 pb-5 border-b border-white/10">
                    <Calendar className={`w-4 h-4 ${isUpcoming ? 'text-amber-400' : 'text-gray-500'}`} />
                    <span>{isUpcoming ? 'Available from:' : 'Date:'} <strong className="text-gray-300 ml-1">{dateStr}</strong></span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-auto flex gap-3">
                    {isUpcoming ? (
                      <button className="flex-1 bg-white/5 text-gray-500 font-bold py-2.5 rounded-xl text-sm cursor-not-allowed border border-white/5">
                        Locked
                      </button>
                    ) : (
                      <>
                        {isAttempted && (
                          <button
                            onClick={() => onViewResult && onViewResult(tid)}
                            className="flex-1 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4" /> View Result
                          </button>
                        )}
                        <button
                          onClick={() => handleStartTest(test)}
                          className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                            isAttempted 
                              ? 'bg-cyberdark border border-blue-500/30 hover:bg-blue-900/30 text-blue-400'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                          }`}
                        >
                          <PlayCircle className="w-4 h-4" /> {isResumable ? 'Resume Test' : (isAttempted ? 'Retake' : 'Start Test')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Resume Modal */}
      {resumePrompt.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-obsidian border border-blue-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <h3 className="text-xl font-bold mb-2 text-white">Unfinished Attempt Found</h3>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              You have an unfinished attempt for <strong className="text-blue-400">{resumePrompt.test?.title}</strong>. 
              Would you like to resume where you left off, or restart the test from the beginning?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setResumePrompt({ show: false, testId: null, test: null })}
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleResumeChoice('restart')}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                Start Fresh
              </button>
              <button 
                onClick={() => handleResumeChoice('resume')}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" /> Resume Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
