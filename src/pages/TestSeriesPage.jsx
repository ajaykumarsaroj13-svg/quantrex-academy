import React, { useState, useEffect, useMemo } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Search from 'lucide-react/dist/esm/icons/search';
import PlayCircle from 'lucide-react/dist/esm/icons/play-circle';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Target from 'lucide-react/dist/esm/icons/target';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Folder from 'lucide-react/dist/esm/icons/folder';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import logoImg from '../assets/logo.png';

import logoMainsImg from '../assets/logo_mains.png';
import logoAdvancedImg from '../assets/logo_advanced.png';
import logoNdaImg from '../assets/logo_nda.png';

const getExamLogo = (examId, className = "w-4 h-4 mr-1.5 rounded-full object-cover") => {
  if (examId === 'jee-mains' || examId === 'JEE Main') return <img src={logoMainsImg} alt="JEE Main" className={className} />;
  if (examId === 'jee-advanced' || examId === 'JEE Advanced') return <img src={logoAdvancedImg} alt="JEE Advanced" className={className} />;
  if (examId === 'nda' || examId === 'NDA') return <img src={logoNdaImg} alt="NDA" className={className} />;
  return null;
};

const TestSeriesPage = ({ user, onStartTest, onBack, testsData, mode }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Hub');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNdaFolder, setActiveNdaFolder] = useState(null);

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  // Sync state with popstate for browser back button support inside folders
  useEffect(() => {
    const handlePopStateLocal = (e) => {
      if (e.state && e.state.page === 'test-series') {
        setActiveCategory(e.state.category || null);
        setActiveGroup(e.state.group || null);
        setActiveSection(e.state.section || null);
        setActiveNdaFolder(e.state.ndaFolder || null);
      }
    };
    window.addEventListener('popstate', handlePopStateLocal);
    
    // Replace initial state with page key so popstate works correctly
    if (window.history.state && window.history.state.page === 'test-series') {
      window.history.replaceState({
        page: 'test-series',
        category: activeCategory,
        group: activeGroup,
        section: activeSection,
        ndaFolder: activeNdaFolder
      }, '', window.location.pathname);
    }
    
    return () => window.removeEventListener('popstate', handlePopStateLocal);
  }, [activeCategory, activeGroup, activeSection, activeNdaFolder]);

  const navigateToCategory = (cat) => {
    setActiveCategory(cat);
    window.history.pushState({ page: 'test-series', category: cat, group: null, section: null, ndaFolder: null }, '', window.location.pathname);
  };
  const navigateToGroup = (grp) => {
    setActiveGroup(grp);
    window.history.pushState({ page: 'test-series', category: activeCategory, group: grp, section: null, ndaFolder: null }, '', window.location.pathname);
  };
  const navigateToSection = (sec) => {
    setActiveSection(sec);
    window.history.pushState({ page: 'test-series', category: activeCategory, group: activeGroup, section: sec, ndaFolder: null }, '', window.location.pathname);
  };
  const navigateToNdaFolder = (fld) => {
    setActiveNdaFolder(fld);
    window.history.pushState({ page: 'test-series', category: null, group: null, section: null, ndaFolder: fld }, '', window.location.pathname);
  };
  const [ultimateData, setUltimateData] = useState([]);

  useEffect(() => {
    if (mode === 'ultimate') {
      setLoading(true);
      fetch('/data/jee_main_ultimate_series_2027.json')
        .then(r => r.json())
        .then(d => {
          setUltimateData(Array.isArray(d) ? d : Object.values(d).flat());
          setLoading(false);
        })
        .catch(e => setLoading(false));
    }
  }, [mode]);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  const fetchTests = async () => {
    setLoading(true);
    try {
      if (testsData && (testsData.mains || testsData.advanced || testsData.nda)) {
         const arr = [...(testsData.mains || []), ...(testsData.advanced || []), ...(testsData.nda || [])];
         const mapped = arr.map(t => ({
           ...t,
           examType: t.examType || t.exam || (testsData.mains?.includes(t) ? 'JEE Main' : (testsData.advanced?.includes(t) ? 'JEE Advanced' : 'NDA')),
           duration: t.duration || t.durationMinutes
         }));
         setTests(mapped);
         setLoading(false);
         return;
      }
      
      const res = await fetch('/data/test-series.json');
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.tests || data.data || []);
      const mapped = arr.map(t => ({
        ...t,
        examType: t.examType || t.exam,
        duration: t.duration || t.durationMinutes
      }));
      setTests(mapped);
    } catch (err) {
      console.error('Failed to fetch test series:', err);
      setError(err.message || 'Failed to load test series');
      // Fallback
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, [testsData]);

  const modeFilteredTests = mode === 'ultimate' ? ultimateData : tests;

  const categories = [...new Set(modeFilteredTests.map(t => t.category))].filter(Boolean);
  const groups = activeCategory ? [...new Set(modeFilteredTests.filter(t => t.category === activeCategory).map(t => t.groupName))].filter(Boolean) : [];
  const sections = activeGroup ? [...new Set(modeFilteredTests.filter(t => t.category === activeCategory && t.groupName === activeGroup).map(t => t.sectionName))].filter(Boolean) : [];

  const filtered = useMemo(() => {
    let arr = modeFilteredTests;
    if (mode !== 'ultimate') {
      if (activeTab !== 'All') arr = arr.filter(t => t.examType === activeTab);
      if (activeTab === 'NDA' && activeNdaFolder) {
        if (activeNdaFolder === 'Mathematics') {
          arr = arr.filter(t => t.id && t.id.includes('math'));
        } else if (activeNdaFolder === 'General Ability') {
          arr = arr.filter(t => t.id && t.id.includes('gat'));
        }
      }
    } else {
      if (activeCategory) arr = arr.filter(t => t.category === activeCategory);
      if (activeGroup) arr = arr.filter(t => t.groupName === activeGroup);
      if (activeSection) arr = arr.filter(t => t.sectionName === activeSection);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(t =>
        (t.title || t.name || '').toLowerCase().includes(q) ||
        String(t.year || '').includes(q) ||
        (t.examType || '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [modeFilteredTests, mode, activeTab, activeNdaFolder, activeCategory, activeGroup, activeSection, searchQuery]);

  const totalMainQuestions = 16640;
  const totalAdvQuestions = 2472;

  const renderFolderCard = (title, count, onClick, colorClass, bgClass) => (
    <div key={title} onClick={onClick} className={`bg-cyberdark border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]`}>
      <div className={`${bgClass} p-4 rounded-full mb-4`}>
        <Folder className={`w-12 h-12 ${colorClass}`} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 text-center">{title}</h2>
      {count !== undefined && <p className="text-gray-400">{count} Tests</p>}
    </div>
  );

  const renderTestCard = (test) => {
    const isUpcoming = test.isUpcoming;
    return (
      <div key={test._id || test.id || test.testId} className="bg-cyberdark border border-white/10 rounded-2xl p-6 hover:border-electric/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col group">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-electric/10 text-electric border border-electric/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {test.examType || 'Mock Test'}
          </span>
          {isUpcoming && <span className="text-amber-400 font-mono text-xs font-bold">Upcoming</span>}
          {test.year && <span className="text-gray-400 font-mono text-xs">{test.year}</span>}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-electric transition-colors">{test.title || test.name || 'Untitled Test'}</h3>
        
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{(test.duration || test.durationMinutes) >= 60 ? `${(test.duration || test.durationMinutes) / 60} hrs` : `${(test.duration || test.durationMinutes) || 180} min`}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Target className="w-4 h-4 text-blue-400" />
            <span>{test.totalMarks || test.marks || test.maxMarks || 300} Marks</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
          {isUpcoming ? (
             <button disabled className="flex-1 bg-white/5 text-gray-500 font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-not-allowed">
                Locked
             </button>
          ) : (
             <>
               <button
                 onClick={() => onStartTest && onStartTest(test.id || test._id || test.testId, 'exam', mode === 'ultimate' ? 'ultimate-test-series' : 'test-series')}
                 className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
               >
                 <PlayCircle className="w-4 h-4" /> Start Exam
               </button>
               {mode !== 'ultimate' && (
                 <button
                   onClick={() => onStartTest && onStartTest(test.id || test._id || test.testId, 'practice', 'test-series')}
                   className="flex-1 bg-cyberdark border border-electric/30 hover:bg-electric/10 text-electric font-bold py-2.5 rounded-xl text-sm transition-all"
                 >
                   Practice Mode
                 </button>
               )}
             </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-obsidian text-white p-6 md:p-12">
      {/* Coaching Header Banner */}
      <div className="flex flex-col items-center justify-center text-center py-6 mb-8 border-b border-white/5">
        <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-electric/30 shadow-[0_0_20px_rgba(0,255,136,0.15)] bg-gradient-to-br from-electric/20 to-blue-600/20 flex items-center justify-center p-1 mb-2">
          <img src={logoImg} alt="Quantrex Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <h2 className="font-logo font-black text-2xl tracking-wider uppercase bg-gradient-to-r from-white via-electric to-gold bg-clip-text text-transparent leading-none">
            Quantrex Academy
          </h2>
          <p className="text-[9px] tracking-[0.2em] font-bold uppercase mt-1 font-logo text-gold">
            Where Rankers Are Engineered
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => {
              if (activeSection) {
                setActiveSection(null);
                window.history.back();
              } else if (activeGroup) {
                setActiveGroup(null);
                window.history.back();
              } else if (activeCategory) {
                setActiveCategory(null);
                window.history.back();
              } else if (activeNdaFolder) {
                setActiveNdaFolder(null);
                window.history.back();
              } else {
                if (onBack) onBack();
              }
            }}
            className="p-2 rounded-xl transition-all hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-4xl font-bold font-display uppercase tracking-wider text-electric m-0">{mode === 'ultimate' ? 'Ultimate Test Series' : 'Mock Test Series'}</h1>
        </div>
        
        {mode !== 'ultimate' && (
          <div className="flex gap-4 text-gray-400 max-w-2xl text-sm font-medium">
            <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              <span className="text-electric">JEE Main:</span> {tests.filter(t => t.examType === 'JEE Main').length} Tests
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              <span className="text-electric">JEE Advanced:</span> {tests.filter(t => t.examType === 'JEE Advanced').length} Tests
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              <span className="text-electric">NDA:</span> {tests.filter(t => t.examType === 'NDA').length} Tests
            </div>
          </div>
        )}
        
        {/* Search & Filters */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-cyberdark/50 p-4 rounded-2xl border border-white/10">
          {mode === 'ultimate' ? (
             <div className="flex items-center gap-3 px-4 py-2">
                <span className="text-electric font-bold">{modeFilteredTests.length}</span> <span className="text-gray-400">Premium Tests</span>
             </div>
          ) : (
            <div className="flex gap-2 bg-obsidian p-1 rounded-xl w-full md:w-auto">
              {['Hub', 'JEE Main', 'JEE Advanced', 'NDA'].map(tab => {
                if (tab === 'Hub') {
                  return (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab('Hub'); setActiveNdaFolder(null); }}
                      className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-1.5 ${
                        activeTab === 'Hub' 
                          ? 'bg-electric text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      Exam Hub
                    </button>
                  );
                }
                const count = tests.filter(t => t.examType === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setActiveNdaFolder(null); }}
                    className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-1.5 ${
                      activeTab === tab 
                        ? 'bg-electric text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {getExamLogo(tab)}
                    {tab}
                    <span className={`text-[10px] ml-1.5 px-2 py-0.5 rounded-full ${activeTab === tab ? 'bg-obsidian/20 text-obsidian' : 'bg-white/10 text-gray-400'}`}>
                       {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by exam, year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-obsidian border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-electric transition-colors text-white"
            />
          </div>
        </div>
      </div>


      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        {mode === 'ultimate' ? (
          <>
            {/* Breadcrumbs for ultimate */}
            {(activeCategory || activeGroup || activeSection) && (
               <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                  <button onClick={() => {
                    setActiveCategory(null);
                    setActiveGroup(null);
                    setActiveSection(null);
                    window.history.pushState({ page: 'test-series', category: null, group: null, section: null, ndaFolder: null }, '', window.location.pathname);
                  }} className="hover:text-white">All</button>
                  {activeCategory && <><ChevronRight className="w-4 h-4"/><button onClick={() => {
                    setActiveGroup(null);
                    setActiveSection(null);
                    window.history.pushState({ page: 'test-series', category: activeCategory, group: null, section: null, ndaFolder: null }, '', window.location.pathname);
                  }} className="hover:text-white">{activeCategory}</button></>}
                  {activeGroup && <><ChevronRight className="w-4 h-4"/><button onClick={() => {
                    setActiveSection(null);
                    window.history.pushState({ page: 'test-series', category: activeCategory, group: activeGroup, section: null, ndaFolder: null }, '', window.location.pathname);
                  }} className="hover:text-white">{activeGroup}</button></>}
                  {activeSection && <><ChevronRight className="w-4 h-4"/><span className="text-white">{activeSection}</span></>}
               </div>
            )}
            
            {!activeCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => renderFolderCard(cat, undefined, () => navigateToCategory(cat), "text-emerald-400", "bg-emerald-500/20"))}
              </div>
            )}
            
            {activeCategory && !activeGroup && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(grp => {
                  const count = modeFilteredTests.filter(t => t.category === activeCategory && t.groupName === grp).length;
                  return renderFolderCard(grp, count, () => navigateToGroup(grp), "text-blue-400", "bg-blue-500/20");
                })}
              </div>
            )}
            
            {activeGroup && !activeSection && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map(sec => {
                  const count = modeFilteredTests.filter(t => t.category === activeCategory && t.groupName === activeGroup && t.sectionName === sec).length;
                  return renderFolderCard(sec || 'Tests', count, () => navigateToSection(sec), "text-purple-400", "bg-purple-500/20");
                })}
                {/* if there are tests with NO section in this group */}
                {sections.length === 0 && filtered.map(renderTestCard)}
              </div>
            )}
            
            {activeSection && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(renderTestCard)}
              </div>
            )}
          </>
        ) : (
          <>
            {activeTab === 'Hub' ? (
              <div className="space-y-12">
                <div className="text-center">
                  <h2 className="text-4xl font-extrabold font-display uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-electric to-gold m-0">EXAMINATION HUB</h2>
                  <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold text-gray-400 tracking-wider">
                    <span>📚 PYQs</span>
                    <span className="text-white/20">|</span>
                    <span>📄 Actual Papers</span>
                    <span className="text-white/20">|</span>
                    <span>📝 Mock Tests</span>
                    <span className="text-white/20">|</span>
                    <span>🎯 Practice</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-10">
                  {/* Card 1: JEE MAIN */}
                  <div className="bg-cyberdark/80 border border-[#0d3b66]/30 hover:border-[#0d3b66]/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col group transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-gradient-to-r from-[#0d3b66] to-[#001f3f] py-4 text-center border-b border-[#0d3b66]/30">
                      <h4 className="text-white font-black text-sm uppercase tracking-widest leading-none m-0">JEE MAIN</h4>
                    </div>
                    <div className="p-8 flex flex-col items-center flex-grow">
                      <div className="bg-white rounded-full overflow-hidden w-24 h-24 mb-4 shadow-[0_0_20px_rgba(255,255,255,0.15)] border-2 border-blue-400/40 flex items-center justify-center p-2.5">
                        <img src={logoMainsImg} alt="JEE Main" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-white font-bold text-sm tracking-wide text-center">राष्ट्रीय परीक्षा एजेंसी</span>
                      <span className="bg-white/10 text-white text-[11px] font-extrabold px-4 py-1.5 rounded mt-2 tracking-wide text-center border border-white/10">National Testing Agency</span>
                      <span className="text-blue-400 text-xs font-bold text-center mt-2">Actual Papers & PYQs</span>
                      <div className="w-full border-t border-white/5 my-5"></div>
                      <div className="flex flex-col gap-2 w-full text-center">
                        <span className="text-sm font-bold text-gray-300 flex items-center justify-center gap-1.5">
                          📅 2002 - 2026
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          24+ Years of Papers
                        </span>
                      </div>
                      <button
                        onClick={() => { setActiveTab('JEE Main'); setActiveNdaFolder(null); }}
                        className="w-full mt-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-[0_4px_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 group-hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)]"
                      >
                        Explore Papers <span className="transition-transform group-hover:translate-x-1">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: JEE ADVANCED */}
                  <div className="bg-cyberdark/80 border border-[#b8860b]/30 hover:border-[#b8860b]/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col group transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-gradient-to-r from-[#b8860b] to-[#1e1b4b] py-4 text-center border-b border-[#b8860b]/30">
                      <h4 className="text-white font-black text-sm uppercase tracking-widest leading-none m-0">JEE ADVANCED</h4>
                    </div>
                    <div className="p-8 flex flex-col items-center flex-grow">
                      <div className="bg-white rounded-full overflow-hidden w-24 h-24 mb-4 shadow-[0_0_20px_rgba(234,179,8,0.2)] border-2 border-amber-400/40 flex items-center justify-center p-2.5">
                        <img src={logoAdvancedImg} alt="JEE Advanced" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-gray-400 text-[11px] font-semibold text-center">भारतीय प्रौद्योगिकी संस्थान</span>
                      <span className="text-white font-bold text-sm tracking-wide text-center mt-0.5">Indian Institutes of Technology</span>
                      <span className="text-white font-extrabold text-base tracking-wide text-center mt-1">JEE ADVANCED</span>
                      <span className="text-[#d97706] text-xs font-bold text-center mt-0.5">Actual Papers & PYQs</span>
                      <div className="w-full border-t border-white/5 my-5"></div>
                      <div className="flex flex-col gap-2 w-full text-center">
                        <span className="text-sm font-bold text-gray-300 flex items-center justify-center gap-1.5">
                          📅 2005 - 2026
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          22+ Years of Papers
                        </span>
                      </div>
                      <button
                        onClick={() => { setActiveTab('JEE Advanced'); setActiveNdaFolder(null); }}
                        className="w-full mt-8 py-3 bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white font-bold text-xs uppercase rounded-xl transition-all shadow-[0_4px_15px_rgba(217,119,6,0.3)] flex items-center justify-center gap-2 group-hover:shadow-[0_4px_25px_rgba(217,119,6,0.5)]"
                      >
                        Explore Papers <span className="transition-transform group-hover:translate-x-1">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 3: NDA */}
                  <div className="bg-cyberdark/80 border border-[#1b4332]/30 hover:border-[#1b4332]/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col group transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-gradient-to-r from-[#1b4332] to-[#081c15] py-4 text-center border-b border-[#1b4332]/30">
                      <h4 className="text-white font-black text-sm uppercase tracking-widest leading-none m-0">NDA</h4>
                    </div>
                    <div className="p-8 flex flex-col items-center flex-grow">
                      <div className="bg-white rounded-full overflow-hidden w-24 h-24 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)] border-2 border-emerald-400/40 flex items-center justify-center p-2.5">
                        <img src={logoNdaImg} alt="NDA" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-gray-400 text-[11px] font-semibold text-center">सत्यमेव जयते</span>
                      <span className="text-white font-bold text-sm tracking-wide text-center">UPSC</span>
                      <span className="text-gray-500 text-[10px] font-semibold text-center mt-0.5">Union Public Service Commission</span>
                      <span className="text-white font-extrabold text-base tracking-wide text-center mt-1">NDA</span>
                      <span className="text-emerald-400 text-xs font-bold text-center mt-0.5">Actual Papers & PYQs</span>
                      <div className="w-full border-t border-white/5 my-5"></div>
                      <div className="flex flex-col gap-2 w-full text-center">
                        <span className="text-sm font-bold text-gray-300 flex items-center justify-center gap-1.5">
                          📅 2021 – 2025
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          5+ Years of Papers
                        </span>
                      </div>
                      <button
                        onClick={() => { setActiveTab('NDA'); setActiveNdaFolder(null); }}
                        className="w-full mt-8 py-3 bg-gradient-to-r from-[#22c55e] to-[#15803d] hover:from-[#4ade80] hover:to-[#22c55e] text-white font-bold text-xs uppercase rounded-xl transition-all shadow-[0_4px_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 group-hover:shadow-[0_4px_25px_rgba(34,197,94,0.5)]"
                      >
                        Explore Papers <span className="transition-transform group-hover:translate-x-1">→</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Trust/Features Bar */}
                <div className="w-full border-t border-white/5 pt-10 mt-16 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-gold font-bold text-base">🛡️ 100% Authentic</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1">Original & Verified Papers</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gold font-bold text-base">📊 Exam Wise Sorting</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1">Easy & Quick Navigation</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gold font-bold text-base">⚡ Performance Boost</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1">Practice. Analyze. Improve.</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gold font-bold text-base">🤝 Trusted by Toppers</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1">Reliable & Quality Content</span>
                  </div>
                </div>
              </div>
            ) : activeTab === 'NDA' && !activeNdaFolder ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
                {renderFolderCard("Mathematics", filtered.filter(t => t.id && t.id.includes('math')).length, () => navigateToNdaFolder('Mathematics'), "text-blue-400", "bg-blue-500/20")}
                {renderFolderCard("General Ability", filtered.filter(t => t.id && t.id.includes('gat')).length, () => navigateToNdaFolder('General Ability'), "text-purple-400", "bg-purple-500/20")}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-20 text-gray-400 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric mb-4"></div>
                    Loading test series...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-gray-400">No tests found matching your criteria.</div>
                ) : (
                  filtered.map(renderTestCard)
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TestSeriesPage;
