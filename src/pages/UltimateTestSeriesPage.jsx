import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Search, ChevronRight, PlayCircle, BarChart3, Clock, ChevronDown, CheckCircle2, FlaskConical, LayoutList, Trophy, BookOpen, Calendar, Eye } from 'lucide-react';

export default function UltimateTestSeriesPage({ user, onStartTest, onViewResult, onBack }) {
  const [data, setData] = useState({
    topic_tests: [],
    chapter_tests: [],
    full_tests: [],
    part_tests: []
  });
  const [loading, setLoading] = useState(true);
  
  // Left menu active tab (default to Mathematics to match screenshot)
  const [activeTab, setActiveTab] = useState('Mathematics');
  
  // For collapsibles in chapters
  const [expandedSections, setExpandedSections] = useState({});

  // For resume/restart modal
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStartTest = (test) => {
    // User requested to remove login requirement and turn tests on for anyone
    if (test.isUpcoming) {
      alert(`This test is coming soon! Available from: ${new Date(test.liveAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`);
      return;
    }
    const tid = test.testId || test.id || test.title;
    
    // Check local storage for saved state
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

  // Flatten all tests to easily filter
  const allTests = [
    ...(data.topic_tests || []), 
    ...(data.chapter_tests || []), 
    ...(data.full_tests || []), 
    ...(data.part_tests || [])
  ];

  // Filter tests by active Tab (which maps to groupName)
  const currentTests = allTests.filter(t => t.groupName === activeTab);

  // Group by sectionName for Subjects, flat array for Full/Part tests
  const isSubjectTab = ['Physics', 'Mathematics', 'Chemistry'].includes(activeTab);
  
  let groupedSections = {};
  if (isSubjectTab) {
    currentTests.forEach(t => {
      const sec = t.sectionName || 'Miscellaneous';
      if (!groupedSections[sec]) groupedSections[sec] = [];
      groupedSections[sec].push(t);
    });
  }

  const renderTestItem = (test) => {
    const isUpcoming = test.isUpcoming;
    const dateStr = test.liveAt ? new Date(test.liveAt).toLocaleString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Coming Soon';

    return (
      <div key={test.testId || test.title} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-5 mb-3 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-blue-500/20 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Premium
            </div>
            {isSubjectTab && <div className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-purple-500/20">Topic Test</div>}
            <div className="bg-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-white/10">English - Hindi (हिन्दी)</div>
            {isUpcoming && <div className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-amber-500/20">Upcoming</div>}
          </div>
          
          <h4 className="font-bold text-white text-base mb-2">{test.title}</h4>
          
          <div className="text-xs text-gray-400 flex flex-wrap items-center gap-4">
            {isUpcoming ? (
              <span className="flex items-center gap-1.5 text-amber-400/80 bg-amber-400/10 px-2 py-1 rounded-md">
                <Calendar className="w-3.5 h-3.5" /> Available from: {dateStr}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400/80 bg-emerald-400/10 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Available Now
              </span>
            )}
            <span className="flex items-center gap-1.5"><LayoutList className="w-3.5 h-3.5"/> {test.totalQuestions || 90} Questions</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {test.durationMinutes || 180} mins</span>
            <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5"/> {test.maxMarks || 300} marks</span>
          </div>

          {(test.syllabus || test.topics) && (
            <div className="mt-3 text-xs text-gray-400">
              <span className="leading-tight">{test.topics || test.syllabus}</span>
            </div>
          )}
        </div>

        {isUpcoming ? (
          <button 
            disabled
            className="flex-shrink-0 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
          >
            Locked
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            {localStorage.getItem(`quantrex_test_result_${test.testId || test.id || test.title}`) && (
              <button 
                onClick={() => onViewResult && onViewResult(test.testId || test.id || test.title)}
                className="flex-shrink-0 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                <BarChart3 className="w-4 h-4" /> View Results
              </button>
            )}
            <button 
              onClick={() => handleStartTest(test)}
              className="flex-shrink-0 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              <PlayCircle className="w-4 h-4" /> {localStorage.getItem(`quantrex_exam_state_${test.testId || test.id || test.title}`) ? 'Resume Test' : 'Start Test'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* Background Particles/Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10 flex-grow flex flex-col">
        
        {/* Header / Back */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium mb-6 transition-colors w-fit"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          Back to Dashboard
        </button>

        {/* Premium Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.15)]">
          {/* Glassmorphism Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617]"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center p-8 lg:p-12 gap-12">
            
            {/* Left Content */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                NEW LAUNCH
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 leading-tight">
                JEE Main Ultimate <br className="hidden lg:block"/> Online Test Series – 2027
              </h1>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-4 py-2">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <LayoutList className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">458</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Tests</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">10140</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Questions</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
                   <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-bold">A/अ</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white pt-1">English + Hindi</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Languages</div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-400 text-xs font-semibold mb-1">TOPIC TESTS</div>
                    <div className="text-blue-300 font-bold text-lg">{data?.topic_tests?.length || 331}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-semibold mb-1">CHAPTER TESTS</div>
                    <div className="text-blue-300 font-bold text-lg">{data?.chapter_tests?.length || 87}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-semibold mb-1">FULL TESTS</div>
                    <div className="text-blue-300 font-bold text-lg">{data?.full_tests?.length || 30}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-semibold mb-1">PART TESTS</div>
                    <div className="text-blue-300 font-bold text-lg">{data?.part_tests?.length || 10}</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300 font-medium">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Most Relevant Questions</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Predictive Percentile & Rank</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Detailed Analytics</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Best Solution to Every Question</div>
              </div>
            </div>
            
            {/* Right Content (Custom Vector Illustration) */}
            <div className="hidden lg:flex flex-1 justify-center relative">
              <div className="relative w-80 h-80">
                {/* Rotating Rings */}
                <div className="absolute inset-0 border-[2px] border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-4 border-[2px] border-purple-500/20 border-dashed rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                <div className="absolute inset-12 border-[2px] border-cyan-500/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
                
                {/* Center Core */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-[20px] opacity-60"></div>
                  <div className="relative z-10 w-24 h-24 bg-slate-900 rounded-full border border-white/20 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                    <Trophy className="w-8 h-8 text-amber-400 mb-1" />
                    <span className="font-bold text-xs text-white">JEE 2027</span>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg">
                  <FlaskConical className="w-6 h-6 text-pink-400" />
                </motion.div>
                
                <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute bottom-10 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-300">
                  ∫e^x dx
                </motion.div>

                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-1/2 -right-6 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></motion.div>
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} className="absolute bottom-1/4 -left-4 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(192,132,252,0.8)]"></motion.div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-grow">
          {/* Left Sidebar Menu */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              
              {/* Category 1 */}
              <div className="mb-6">
                <h3 className="text-[10px] uppercase text-gray-500 font-bold mb-3 px-3 tracking-wider flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                  Chapter and Topic Wise Tests
                </h3>
                <ul className="space-y-1.5">
                  {['Physics', 'Mathematics', 'Chemistry'].map(subject => (
                    <li key={subject}>
                      <button 
                        onClick={() => setActiveTab(subject)} 
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                          activeTab === subject 
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                            : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        {subject}
                        <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === subject ? 'text-blue-400 translate-x-1' : 'opacity-0'}`} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category 2 */}
              <div>
                <h3 className="text-[10px] uppercase text-gray-500 font-bold mb-3 px-3 tracking-wider flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                  Quantrex Academy Mock Tests
                </h3>
                <ul className="space-y-1.5">
                  {['Full Tests', 'Part Tests'].map(tab => (
                    <li key={tab}>
                      <button 
                        onClick={() => setActiveTab(tab)} 
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                          activeTab === tab 
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                            : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        {tab}
                        <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab ? 'text-blue-400 translate-x-1' : 'opacity-0'}`} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  {activeTab} Tests
                </h2>
                
                {isSubjectTab ? (
                  <div className="space-y-3">
                    {Object.keys(groupedSections).length === 0 ? (
                       <div className="text-gray-500 text-center py-10 bg-white/5 rounded-2xl border border-white/5">No chapters found for {activeTab}.</div>
                    ) : (
                      Object.keys(groupedSections).map(section => {
                        const tests = groupedSections[section];
                        const availableCount = tests.filter(t => !t.isUpcoming).length;
                        const upcomingCount = tests.filter(t => t.isUpcoming).length;
                        const isExpanded = expandedSections[section];

                        return (
                          <div key={section} className="bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
                            <button 
                              onClick={() => toggleSection(section)}
                              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-white/5 transition-colors text-left"
                            >
                              <div>
                                <h3 className="font-bold text-white text-base md:text-lg mb-1">{section}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                                  {availableCount > 0 && <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{availableCount} Available</span>}
                                  {upcomingCount > 0 && <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">{upcomingCount} Upcoming</span>}
                                  {availableCount === 0 && upcomingCount === 0 && <span className="text-gray-500">No tests</span>}
                                </div>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-400' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-white/5 bg-black/40"
                                >
                                  <div className="p-4">
                                    {tests.map(renderTestItem)}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  // Flat list for Mock Tests (Full/Part)
                  <div className="space-y-4">
                    {currentTests.length === 0 ? (
                       <div className="text-gray-500 text-center py-10 bg-white/5 rounded-2xl border border-white/5">No {activeTab.toLowerCase()} available.</div>
                    ) : (
                      currentTests.map(renderTestItem)
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume / Restart Modal */}
      {resumePrompt.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <h3 className="text-xl font-bold mb-2 text-white">Unfinished Attempt Found</h3>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              You have an unfinished attempt for <strong className="text-blue-400">{resumePrompt.test?.title}</strong>. 
              Would you like to resume where you left off, or restart the test from the beginning?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setResumePrompt({ show: false, testId: null, test: null })}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleResumeChoice('restart')}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-colors shadow-sm"
              >
                Start Fresh
              </button>
              <button 
                onClick={() => handleResumeChoice('resume')}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors flex items-center gap-2"
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
