import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Search, ChevronRight, PlayCircle, BarChart3, Clock, ChevronDown, CheckCircle2, FlaskConical, LayoutList, Trophy, BookOpen, Calendar } from 'lucide-react';

export default function UltimateTestSeriesPage({ user, onStartTest, onBack }) {
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
    onStartTest(test.testId || test.id || test.title, 'exam', 'ultimate-test-series');
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
        </div>

        <button 
          onClick={() => handleStartTest(test)}
          disabled={isUpcoming}
          className={`flex-shrink-0 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            isUpcoming 
              ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
          }`}
        >
          {isUpcoming ? 'Locked' : (
             <>
               <PlayCircle className="w-4 h-4" /> Start Test
             </>
          )}
        </button>
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
                      Object.keys(groupedSections).sort().map(section => {
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
    </div>
  );
}