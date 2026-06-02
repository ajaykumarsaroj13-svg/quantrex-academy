import React, { useState, useEffect } from 'react';
import { BarChart, BookOpen, Clock, PlayCircle, LogOut, CheckCircle, Lock, ShieldCheck, Trophy, Sparkles, Target, ArrowRight, BrainCircuit, FileText } from 'lucide-react';
import { loadDbFromBlob } from '../blob';
import VideoPlayer from '../components/VideoPlayer';
import PdfViewer from '../components/PdfViewer';
import testsData from '../utils/testsData2.json';
import advancedTestsData from '../utils/advancedTestsData.json';
import PyqViewer from '../components/PyqViewer';
import { getPyqsByChapter, fetchPyqsBySearch } from '../utils/dummyPyqs';

export default function StudentDashboard({ user, courses, setActivePage, setExamTest, syllabus, initialClass, initialTab, initialChapterTab }) {
  const [tests, setTests] = useState([]);
  const [testCategory, setTestCategory] = useState('jee-mains'); // jee-mains, jee-advanced
  const [activeTab, setActiveTab] = useState(initialTab || 'courses'); // courses, live, tests, ai-analytics, doubts
  const [purchasedList, setPurchasedList] = useState([]);
  
  // Syllabus selection states
  const [selectedSyllabusClass, setSelectedSyllabusClass] = useState(initialClass || 'jee-mains');
  const [selectedSyllabusChapterId, setSelectedSyllabusChapterId] = useState('');
  const [selectedSyllabusSubject, setSelectedSyllabusSubject] = useState('mathematics');
  const [chapterTab, setChapterTab] = useState(initialChapterTab || 'videos'); // videos, pdfs, formulas, pyqs, mockTests
  const [inlinePdf, setInlinePdf] = useState(null); // { url, title } for inline PDF/image viewer
  const [pyqsData, setPyqsData] = useState([]);
  const [isLoadingPyqs, setIsLoadingPyqs] = useState(false);
  
  const hasCourseAccess = (courseKey) => {
    // Make all syllabus courses unlocked and visible to students by default
    return true;
  };

  const isResourceUnlocked = (item) => {
    // Everything is free — no locks for any student
    return true;
  };
  
  // Lecture player states
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [playerTab, setPlayerTab] = useState('video'); // video, notes
  
  // AI Doubt Solver states
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtChat, setDoubtChat] = useState([
    { role: 'ai', text: 'Hello! I am your Quantrex AI Math Mentor. Ask me any IIT-JEE Mathematics equation or problem from Calculus, Geometry, or Algebra.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (initialClass) {
      setSelectedSyllabusClass(initialClass);
      setSelectedSyllabusChapterId('');
    }
  }, [initialClass]);

  // Auto-select PDF tab and first chapter for JEE Advanced since there are no videos yet
  useEffect(() => {
    if (selectedSyllabusClass === 'jee-advanced') {
      setChapterTab('pdfs');
      if (!selectedSyllabusChapterId && syllabus['jee-advanced']?.subjects?.mathematics?.chapters?.length > 0) {
        setSelectedSyllabusChapterId(syllabus['jee-advanced'].subjects.mathematics.chapters[0].id);
      }
    }
  }, [selectedSyllabusClass, syllabus]);

  useEffect(() => {
    if (chapterTab === 'pyqs' && selectedSyllabusChapterId) {
      setIsLoadingPyqs(true);
      const chapter = syllabus[selectedSyllabusClass]?.subjects?.[selectedSyllabusSubject]?.chapters?.find(ch => ch.id === selectedSyllabusChapterId);
      if (chapter) {
        fetchPyqsBySearch(chapter.title).then(data => {
          setPyqsData(data);
          setIsLoadingPyqs(false);
        });
      } else {
        setPyqsData([]);
        setIsLoadingPyqs(false);
      }
    }
  }, [chapterTab, selectedSyllabusChapterId, syllabus, selectedSyllabusClass, selectedSyllabusSubject]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialChapterTab) {
      setChapterTab(initialChapterTab);
    }
  }, [initialChapterTab]);

  // Fetch student courses and tests
  useEffect(() => {
    // Filter courses purchased by student
    const list = courses.filter(c => user?.purchasedCourses?.includes(c.id));
    setPurchasedList(list);

    // Fetch tests from Cloud DB
    const loadTests = async () => {
      const activeData = testCategory === 'jee-advanced' ? advancedTestsData : testsData;
      setTests(activeData);
      localStorage.setItem('quantrex_tests', JSON.stringify(activeData));
    };
    loadTests();
  }, [courses, user, testCategory]);

  const handleSecurityBreach = async (type, details) => {
    try {
      await fetch('/api/security/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, details })
      });
    } catch (e) {
      console.log('Failed to report telemetry, security incident logged locally.');
    }
  };

  const handleLaunchTest = (test) => {
    setExamTest(test);
    setActivePage('exam-mode');
  };

  const handleAskDoubt = async (e) => {
    e.preventDefault();
    if (!doubtInput.trim()) return;

    const userMsg = doubtInput;
    setDoubtChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setDoubtInput('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/ai/doubt-solver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ question: userMsg })
      });

      if (response.ok) {
        const data = await response.json();
        setDoubtChat(prev => [...prev, { role: 'ai', text: data.response }]);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Mock AI doubt answers offline
      setTimeout(() => {
        let reply = '';
        if (userMsg.toLowerCase().includes('limit')) {
          reply = `**Quantrex AI Math Mentor:** Let's calculate the limit of $\\lim_{x \\to 0} \\frac{\\sin x}{x}$. This is in $\\frac{0}{0}$ form. By L'Hopital's rule, we take derivatives: Numerator $\\to \\cos x$, Denominator $\\to 1$. Thus limit is $\\cos(0) = 1$.`;
        } else {
          reply = `**Quantrex AI Math Mentor:** I have received your mathematics question: "${userMsg}". Ajay Kumar Saroj recommends verifying this theorem using the Coordinate plotting system. Let me check the standard formulas.`;
        }
        setDoubtChat(prev => [...prev, { role: 'ai', text: reply }]);
      }, 1000);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectLecture = (course, video) => {
    setSelectedCourse(course);
    setSelectedVideo(video);
    // Auto-select first PDF for notes tab if any
    const ch = course.modules?.[0]?.chapters?.[0];
    setSelectedPdf(ch?.pdfs?.[0] || null);
    setPlayerTab('video');
  };

  return (
    <div className="min-h-screen px-4 md:px-12 py-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* 1. SIDEBAR PROFILE PANEL */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex flex-col items-center text-center relative">
            <div className="relative h-24 w-24 mb-4 group cursor-pointer">
              {/* Premium Progress Ring Animation */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="4" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-electric" strokeWidth="4" strokeDasharray="283" strokeDashoffset="56" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
              </svg>
              <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-electric/80 to-blue-600/80 border-2 border-obsidian flex items-center justify-center text-3xl font-bold font-display text-white overflow-hidden shadow-[0_0_15px_rgba(0,180,216,0.3)] group-hover:shadow-[0_0_25px_rgba(0,180,216,0.6)] transition-shadow">
                {user?.name?.charAt(0)}
              </div>
            </div>
            <h3 className="text-white font-bold text-lg tracking-wide leading-tight">{user?.name}</h3>
            <span className="text-[10px] text-gold font-mono uppercase tracking-widest mt-1 bg-gold/10 px-2 py-0.5 rounded border border-gold/20">JEE Mathematics Aspirant</span>
          </div>

          <div className="border-t border-white/10 pt-5 space-y-3.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Target Exam:</span>
              <span className="text-white text-right max-w-[130px] truncate">{user?.targetExam || 'JEE Advanced'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Batch Code:</span>
              <span className="text-electric">QTX-2027-Rankers</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Attendance:</span>
              <span className="text-emerald-400">{user?.attendance || 95}%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Nav Menu */}
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-row lg:flex-col justify-around shadow-lg">
          {[
            { id: 'marks-portal', label: 'Marks Portal', icon: Target, isPage: true, pageId: 'marks-portal' },
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'live', label: 'Live Classes', icon: Clock },
            { id: 'tests', label: 'Mock Tests', icon: Trophy },
            { id: 'test-series', label: 'Full Test Series', icon: FileText, isPage: true, pageId: 'test-series' },
            { id: 'pyq', label: 'JEE Main PYQs', icon: Target, isPlatform: true },
            { id: 'ai-analytics', label: 'AI Strengths', icon: BarChart },
            { id: 'doubts', label: 'AI Doubt Solver', icon: BrainCircuit }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { 
                  if (item.isPlatform) {
                    setActivePage('examgoal-platform');
                  } else if (item.isPage) {
                    setActivePage(item.pageId);
                  } else {
                    setActiveTab(item.id); 
                    setSelectedVideo(null); 
                  }
                }}
                className={`w-full py-4 px-5 text-xs font-bold tracking-wider uppercase text-left transition-all duration-300 flex items-center gap-3 relative overflow-hidden group ${isActive ? 'text-electric bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric shadow-[0_0_10px_rgba(0,180,216,1)]"></div>}
                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMIC WORKSPACE PANEL */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* If a video lecture is active, render Course Player Overlay instead of list */}
        {selectedVideo ? (
          <div className="space-y-6 animate-fade-in">
            {/* Back button */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSelectedVideo(null)}
                className="text-xs font-bold tracking-wider text-gray-400 hover:text-electric uppercase flex items-center gap-1"
              >
                ← Return to Courses
              </button>
              <span className="text-[10px] text-gray-500 font-mono">Playing: {selectedVideo.title}</span>
            </div>

            {/* Sub-tab selection */}
            <div className="flex gap-2">
              <button 
                onClick={() => setPlayerTab('video')}
                className={`px-4 py-2 text-xs font-bold rounded-lg ${playerTab === 'video' ? 'bg-electric text-obsidian' : 'bg-cyberdark border border-white/5 text-platinum'}`}
              >
                Watch Lecture
              </button>
              {selectedPdf && (
                <button 
                  onClick={() => setPlayerTab('notes')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg ${playerTab === 'notes' ? 'bg-electric text-obsidian' : 'bg-cyberdark border border-white/5 text-platinum'}`}
                >
                  Class Notes (PDF)
                </button>
              )}
            </div>

            {/* Display Player */}
            {playerTab === 'video' ? (
              <div className="space-y-4">
                <VideoPlayer 
                  videoUrl={selectedVideo.url} 
                  videoTitle={selectedVideo.title} 
                  studentInfo={user}
                  onReportBreach={handleSecurityBreach}
                />
                <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="text-white font-bold text-base">{selectedVideo.title}</h4>
                    <p className="text-[10px] text-gray-400 font-mono leading-relaxed max-w-xl">
                      {selectedVideo.downloadBlocked 
                        ? '🔒 Forensic Watermarking and Active Piracy block is active. Downloads are disabled.' 
                        : '🔓 Downloads allowed for offline personal study.'}
                    </p>
                  </div>
                  {!selectedVideo.downloadBlocked && (
                    <a 
                      href={selectedVideo.url} 
                      download 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-center"
                    >
                      <Download className="h-4 w-4" /> Download Lecture
                    </a>
                  )}
                </div>
              </div>
            ) : (
              selectedPdf && (
                <div className="space-y-4">
                  <PdfViewer 
                    pdfUrl={selectedPdf.url} 
                    pdfTitle={selectedPdf.title} 
                    studentInfo={user} 
                    onReportBreach={handleSecurityBreach}
                  />
                  <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-white font-bold text-base">{selectedPdf.title}</h4>
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed max-w-xl">
                        {selectedPdf.downloadBlocked 
                          ? '🔒 Protected Document. Screen-reading, selections, downloads and prints are disabled.' 
                          : '🔓 Document downloads permitted.'}
                      </p>
                    </div>
                    {!selectedPdf.downloadBlocked && (
                      <a 
                        href={selectedPdf.url} 
                        download 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-center"
                      >
                        <Download className="h-4 w-4" /> Download PDF
                      </a>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl border border-white/5 min-h-[60vh] space-y-6">
            {/* MATH SYLLABUS BROWSER TAB */}
            {activeTab === 'courses' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                
                {/* 1. Grade Selectors Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Mathematics Curriculum Portal</span>
                  <div className="flex flex-wrap gap-1.5 p-1 bg-obsidian/60 border border-white/5 rounded-xl">
                    {[
                      { id: 'jee-mains', label: 'JEE Main' },
                      { id: 'jee-advanced', label: 'JEE Advanced' },
                      { id: 'mht-cet', label: 'MHT-CET' },
                      { id: 'bitsat', label: 'BITSAT' },
                      { id: 'nda', label: 'NDA' },
                      { id: 'class-9', label: 'Class 9th Math' },
                      { id: 'class-11', label: 'Class 11th Math' },
                      { id: 'class-12', label: 'Class 12th Math' },
                      { id: 'foundation-6-12', label: 'Foundation Math (6-12)' }
                    ].map(grade => {
                      const hasAccess = hasCourseAccess(grade.id);
                      return (
                        <button
                          key={grade.id}
                          onClick={() => {
                            setSelectedSyllabusClass(grade.id);
                            setSelectedSyllabusChapterId('');
                            setSelectedSyllabusSubject('mathematics');
                          }}
                          className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                            selectedSyllabusClass === grade.id 
                              ? 'bg-electric text-obsidian shadow-[0_0_12px_rgba(0,240,255,0.2)]' 
                              : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                          }`}
                        >
                          {!hasAccess && <Lock className="h-3 w-3 text-red-400 animate-pulse" />}
                          {grade.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Subject Selector Row */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-bold">Select Subject</span>
                  <div className="flex gap-2 font-mono text-[10px]">
                    {[
                      { id: 'mathematics', label: '∑ Mathematics' },
                      { id: 'physics', label: '⚛️ Physics' },
                      { id: 'chemistry', label: '⚗️ Chemistry' },
                      { id: 'english', label: '📚 English' },
                      { id: 'general-science', label: '🔬 General Science' },
                      { id: 'general-studies', label: '🌍 General Studies' }
                    ].map(subj => {
                      const hasPCM = ['jee-mains', 'jee-advanced', 'mht-cet', 'bitsat', 'nda'].includes(selectedSyllabusClass);
                      const isNDA = selectedSyllabusClass === 'nda';
                      
                      // NDA has all subjects
                      if (isNDA) return (
                        <button
                          key={subj.id}
                          onClick={() => setSelectedSyllabusSubject(subj.id)}
                          className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
                            selectedSyllabusSubject === subj.id 
                              ? 'bg-electric/10 text-electric border border-electric/25' 
                              : 'bg-obsidian border border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {subj.label}
                        </button>
                      );
                      
                      // Others only have PCM
                      if (['english', 'general-science', 'general-studies'].includes(subj.id)) return null;
                      if (subj.id !== 'mathematics' && !hasPCM) return null;
                      
                      return (
                        <button
                          key={subj.id}
                          onClick={() => setSelectedSyllabusSubject(subj.id)}
                          className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
                            selectedSyllabusSubject === subj.id 
                              ? 'bg-electric/10 text-electric border border-electric/25' 
                              : 'bg-obsidian border border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {subj.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Render Subject Workspaces */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                    {/* Left Column: Chapters Sidebar */}
                    <div className="md:col-span-1 space-y-2 border-r border-white/5 pr-4 max-h-[50vh] overflow-y-auto pr-1">
                      <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Chapters Folder</span>
                      {!syllabus[selectedSyllabusClass]?.subjects?.[selectedSyllabusSubject]?.chapters || syllabus[selectedSyllabusClass]?.subjects?.[selectedSyllabusSubject]?.chapters?.length === 0 ? (
                        <p className="text-[10px] text-gray-600 italic">No chapters configured.</p>
                      ) : (
                        syllabus[selectedSyllabusClass]?.subjects?.[selectedSyllabusSubject]?.chapters?.map(ch => (
                          <button
                            key={ch.id}
                            onClick={() => setSelectedSyllabusChapterId(ch.id)}
                            className={`w-full p-2.5 rounded-lg text-[10px] text-left font-semibold uppercase transition-all truncate block ${selectedSyllabusChapterId === ch.id ? 'bg-electric/10 text-electric border border-electric/25' : 'text-gray-400 hover:text-platinum hover:bg-white/[0.02] border border-transparent'}`}
                            title={ch.title}
                          >
                            {ch.title}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Right Column: Chapter Contents Panel */}
                    <div className="md:col-span-3">
                      {selectedSyllabusChapterId ? (
                        (() => {
                          const chapter = syllabus[selectedSyllabusClass]?.subjects?.[selectedSyllabusSubject]?.chapters?.find(ch => ch.id === selectedSyllabusChapterId);
                          if (!chapter) return null;
                          
                          return (
                            <div className="space-y-4">
                              <h4 className="text-white font-bold text-sm uppercase tracking-wider text-glow-blue border-b border-white/5 pb-2">
                                {chapter.title}
                              </h4>

                              {/* Topics covered */}
                              {chapter.topics && chapter.topics.length > 0 && (
                                <div className="p-4 bg-cyberdark/60 border border-white/5 rounded-xl space-y-1.5">
                                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">Topics covered in this chapter:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {chapter.topics.map(t => (
                                      <span key={t.id} className="text-[10px] text-platinum bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                        • {t.title}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Sub-tab selection */}
                              <div className="flex bg-obsidian/60 p-1 border border-white/5 rounded-lg justify-between gap-1 overflow-x-auto">
                                {[
                                  { id: 'videos', label: '🎥 Lectures' },
                                  { id: 'pdfs', label: '📄 Notes/DPPs' },
                                  { id: 'formulas', label: '⚡ Formulas' },
                                  { id: 'pyqs', label: '📝 PYQs' },
                                  { id: 'mockTests', label: '🏆 Chapter Tests' }
                                ].map(subTab => {
                                  if (subTab.id === 'pyqs' && !selectedSyllabusClass.startsWith('jee')) return null;
                                  return (
                                    <button
                                      key={subTab.id}
                                      onClick={() => setChapterTab(subTab.id)}
                                      className={`flex-1 py-1.5 px-2 text-[9px] font-bold rounded transition-all uppercase whitespace-nowrap ${chapterTab === subTab.id ? 'bg-cyberdark border border-white/5 text-electric' : 'text-gray-400'}`}
                                    >
                                      {subTab.label}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Tab Contents Panel */}
                              <div className="p-4 bg-obsidian/30 border border-white/5 rounded-xl min-h-[25vh]">
                                
                                {/* 1. Lectures */}
                                {chapterTab === 'videos' && (
                                  <div className="space-y-2">
                                    {(!chapter.videos || chapter.videos.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No video lectures uploaded yet for this chapter.</p>
                                    ) : (
                                      chapter.videos.map(v => {
                                        const unlocked = isResourceUnlocked(v);
                                        return (
                                          <div key={v.id} className="flex justify-between items-center p-3 bg-cyberdark/60 border border-white/5 rounded-lg">
                                            <div>
                                              <div className="flex items-center gap-1.5">
                                                <h5 className="text-white font-semibold text-xs">{v.title}</h5>
                                                {v.isFree && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">DEMO</span>}
                                                {!unlocked && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-bold">LOCKED</span>}
                                              </div>
                                              <span className="text-[9px] text-gray-500 block mt-0.5">Duration: {v.duration} {v.downloadBlocked && '• 🔒 Secured'}</span>
                                            </div>
                                            <button
                                              onClick={() => {
                                                if (!unlocked) {
                                                  alert('Premium Course Video Locked. Please enroll in this course or contact A.K. Sir for permission clearance.');
                                                  return;
                                                }
                                                setSelectedVideo(v); 
                                                setPlayerTab('video'); 
                                              }}
                                              className={`px-3.5 py-1.5 font-bold text-[9px] uppercase rounded-lg flex items-center gap-1.5 transition-colors ${
                                                unlocked 
                                                  ? 'bg-electric hover:bg-cyan-400 text-obsidian shadow-md hover:shadow-cyan-500/10' 
                                                  : 'bg-red-950/20 border border-red-900 text-red-400 cursor-not-allowed'
                                              }`}
                                            >
                                              {unlocked ? <PlayCircle className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />} 
                                              {unlocked ? 'Play' : 'Locked'}
                                            </button>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}

                                {/* 2. Notes & DPPs */}
                                {chapterTab === 'pdfs' && (
                                  <div className="space-y-3">
                                    {(!chapter.pdfs || chapter.pdfs.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No PDF notes or handouts available.</p>
                                    ) : (
                                      chapter.pdfs.map(p => {
                                        const unlocked = isResourceUnlocked(p);
                                        const isActive = inlinePdf?.id === p.id;
                                        return (
                                          <div key={p.id} className="space-y-2">
                                            <div className="flex justify-between items-center p-3 bg-cyberdark/60 border border-white/5 rounded-lg">
                                              <div>
                                                <div className="flex items-center gap-1.5">
                                                  <h5 className="text-white font-semibold text-xs">{p.title}</h5>
                                                  {p.isFree && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">FREE</span>}
                                                  {!unlocked && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-bold">LOCKED</span>}
                                                </div>
                                                <span className="text-[9px] text-gray-500 block mt-0.5">Size: {p.size || 'Unknown'}</span>
                                              </div>
                                              <button
                                                onClick={() => {
                                                  if (!unlocked) return;
                                                  setInlinePdf(isActive ? null : { id: p.id, url: p.url, title: p.title });
                                                }}
                                                className={`px-3.5 py-1.5 font-bold text-[9px] uppercase rounded-lg flex items-center gap-1.5 transition-colors ${
                                                  unlocked 
                                                    ? isActive
                                                      ? 'bg-gold text-obsidian'
                                                      : 'bg-electric hover:bg-cyan-400 text-obsidian shadow-md' 
                                                    : 'bg-red-950/20 border border-red-900 text-red-400 cursor-not-allowed'
                                                }`}
                                              >
                                                {unlocked ? <FileText className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />} 
                                                {unlocked ? (isActive ? 'Close' : 'Read / View') : 'Locked'}
                                              </button>
                                            </div>
                                            {isActive && (
                                               <div className="animate-fade-in mt-3">
                                                 <PdfViewer
                                                   pdfUrl={p.url}
                                                   pdfTitle={p.title}
                                                   studentInfo={user}
                                                 />
                                               </div>
                                             )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}

                                {/* 3. Formulas & Tricks */}
                                {chapterTab === 'formulas' && (
                                  <div className="grid grid-cols-1 gap-3">
                                    {(!chapter.formulas || chapter.formulas.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No formulas sheet or shortcut tricks uploaded yet.</p>
                                    ) : (
                                      chapter.formulas.map(f => {
                                         const isActive = inlinePdf?.id === `formula-${f.id}`;
                                         return (
                                           <div key={f.id} className="p-4 bg-cyberdark/40 border border-white/5 rounded-xl space-y-2">
                                             <h5 className="text-gold font-bold text-xs border-b border-white/5 pb-1 flex items-center justify-between gap-1.5">
                                               <span className="flex items-center gap-1.5">
                                                 <Flame className="h-4 w-4 fill-current text-gold" /> {f.title}
                                               </span>
                                               {f.url && (
                                                 <button
                                                   onClick={() => setInlinePdf(isActive ? null : { id: `formula-${f.id}`, url: f.url, title: f.title })}
                                                   className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg flex items-center gap-1 ${
                                                     isActive ? 'bg-gold text-obsidian' : 'bg-electric/10 text-electric border border-electric/20 hover:bg-electric/20'
                                                   }`}
                                                 >
                                                   {isActive ? 'Close' : '📄 View File'}
                                                 </button>
                                               )}
                                             </h5>
                                             {f.content && (
                                               <p className="text-gray-300 leading-relaxed whitespace-pre-line text-[11px] font-mono leading-relaxed bg-obsidian/30 p-2.5 rounded border border-white/5">{f.content}</p>
                                             )}
                                             {f.url && (f.url.startsWith('data:image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(f.url)) && !isActive && (
                                               <img src={f.url} alt={f.title} className="max-w-full rounded-lg border border-white/5 mt-2" style={{maxHeight:'320px',objectFit:'contain'}} />
                                             )}
                                             {isActive && (
                                               <div className="animate-fade-in mt-2">
                                                 <PdfViewer
                                                   pdfUrl={f.url}
                                                   pdfTitle={f.title}
                                                   studentInfo={user}
                                                   onReportBreach={handleSecurityBreach}
                                                 />
                                               </div>
                                             )}
                                           </div>
                                         );
                                       })
                                    )}
                                  </div>
                                )}

                                {/* 4. PYQs (JEE only) */}
                                {chapterTab === 'pyqs' && (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2 p-3 bg-electric/10 border border-electric/20 rounded-lg">
                                      <Sparkles className="h-5 w-5 text-electric" />
                                      <p className="text-xs text-cyan-100 font-medium leading-relaxed">
                                        Welcome to the Premium Custom PYQ Module. These questions are integrated beautifully with MathJax and feature step-by-step solutions!
                                      </p>
                                    </div>
                                    {isLoadingPyqs ? (
                                      <div className="flex justify-center items-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric"></div>
                                      </div>
                                    ) : (
                                      <PyqViewer questions={pyqsData} />
                                    )}
                                  </div>
                                )}

                                {/* 5. Mock Tests */}
                                {chapterTab === 'mockTests' && (
                                  <div className="space-y-2">
                                    {(!chapter.mockTests || chapter.mockTests.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No mock exams uploaded yet.</p>
                                    ) : (
                                      chapter.mockTests.map(t => (
                                        <div key={t.id} className="p-4 bg-cyberdark/60 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                          <div className="space-y-1">
                                            <h5 className="text-white font-bold text-xs">{t.title}</h5>
                                            <span className="text-[9px] text-gray-500 block">
                                              Duration: {t.durationMinutes} minutes • Type: {t.type === 'link' ? 'AI Quiz Embed Link' : 'Quantrex JEE Pattern'}
                                            </span>
                                          </div>
                                          {t.type === 'link' ? (
                                            <a
                                              href={t.linkUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-4 py-2 bg-gradient-to-r from-gold to-yellow-600 text-obsidian font-bold text-[9px] uppercase rounded-lg hover:shadow-lg transition-all"
                                            >
                                              Take External AI Quiz
                                            </a>
                                          ) : (
                                            <button
                                              onClick={() => handleLaunchTest(t)}
                                              className="px-4 py-2 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-[9px] uppercase rounded-lg shadow-md hover:shadow-cyan-500/10 transition-colors"
                                            >
                                              Start JEE Mock Exam
                                            </button>
                                          )}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}

                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 bg-obsidian/30 border border-white/5 rounded-2xl min-h-[40vh] text-center space-y-3">
                          <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <p className="text-xs text-gray-500 font-mono">Select a chapter from the left menu to view contents.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* LIVE CLASSES TAB */}
            {activeTab === 'live' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Upcoming Schedules</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Calculus Advanced Problem Solving', time: 'Today at 6:00 PM', status: 'Live In 2 Hrs', instructor: 'Ajay Kumar Saroj' },
                    { title: 'Vector Geometry Coordinate Shifts', time: 'Tomorrow at 4:30 PM', status: 'Scheduled', instructor: 'Ajay Kumar Saroj' }
                  ].map((c, idx) => (
                    <div key={idx} className="p-5 bg-cyberdark border border-white/5 rounded-xl flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-white font-bold text-sm">{c.title}</h4>
                        <p className="text-xs text-gray-500 font-mono">Instructor: {c.instructor} • {c.time}</p>
                      </div>
                      <span className={`text-[10px] font-bold font-mono px-3 py-1 rounded ${idx === 0 ? 'bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MOCK TESTS TAB */}
            {activeTab === 'tests' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">JEE Test Series Portal</h3>
                  <div className="flex bg-obsidian/60 p-1 border border-white/5 rounded-lg">
                    <button
                      onClick={() => setTestCategory('jee-mains')}
                      className={`px-4 py-1.5 text-xs font-bold uppercase rounded transition-all ${testCategory === 'jee-mains' ? 'bg-electric text-obsidian shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                      JEE Main
                    </button>
                    <button
                      onClick={() => setTestCategory('jee-advanced')}
                      className={`px-4 py-1.5 text-xs font-bold uppercase rounded transition-all ${testCategory === 'jee-advanced' ? 'bg-gold text-obsidian shadow-[0_0_10px_rgba(255,215,0,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                      JEE Advanced
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {tests.map((test) => (
                    <div key={test.id} className="p-5 bg-cyberdark border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-white font-bold text-base">{test.title}</h4>
                        <p className="text-xs text-gray-400 font-mono leading-relaxed max-w-md">{test.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono pt-1">
                          <span>Duration: {test.durationMinutes} mins</span>
                          <span>Subject: Mathematics</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLaunchTest(test)}
                        className="px-5 py-2.5 bg-gradient-to-r from-electric to-blue-600 text-obsidian font-bold text-xs tracking-wider uppercase rounded-lg hover:shadow-lg hover:shadow-cyan-500/10 transition-all shrink-0 self-start md:self-center"
                      >
                        Start Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI PERFORMANCE ANALYTICS */}
            {activeTab === 'ai-analytics' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">AI performance Analytics</h3>
                
                {/* Visual grid metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance meters */}
                  <div className="p-5 bg-cyberdark border border-white/5 rounded-xl space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Chapter-wise Strengths</h4>
                    <div className="space-y-3 font-mono text-xs">
                      {[
                        { topic: 'Calculus (Limits, Integrals)', rate: 82, color: 'bg-electric' },
                        { topic: 'Algebra (Matrices, Complex)', rate: 75, color: 'bg-gold' },
                        { topic: 'Coordinate Geometry', rate: 58, color: 'bg-red-500' },
                        { topic: 'Probability & Stats', rate: 64, color: 'bg-platinum' }
                      ].map((t, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">{t.topic}</span>
                            <span className="text-white font-bold">{t.rate}% Accuracy</span>
                          </div>
                          <div className="h-1.5 w-full bg-obsidian rounded-full overflow-hidden">
                            <div className={`h-full ${t.color}`} style={{ width: `${t.rate}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Rank Predictor card */}
                  <div className="p-5 bg-cyberdark border border-white/5 rounded-xl space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-1">
                      <ShieldCheck className="h-4.5 w-4.5 text-gold" />
                      AI Rank Predictor v2.0
                    </h4>
                    <div className="text-center p-4 bg-obsidian/60 border border-white/5 rounded-lg space-y-2">
                      <span className="text-[10px] text-gray-500 font-mono uppercase block">Estimated JEE Adv Rank</span>
                      <h2 className="text-2xl font-bold font-display text-glow-gold">AIR 1,200 - 1,800</h2>
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed">Based on weekly performance metrics and daily mock streak patterns.</p>
                    </div>
                    <div className="bg-emerald-950/20 border border-emerald-900 text-emerald-400 p-3 rounded-lg text-[10px] font-mono leading-relaxed">
                      💡 **AI Recommendation:** Spend 3 hours reviewing conic section transformations. Your accuracy in Ellipse intersection lines is below JEE average.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI DOUBT SOLVER CHAT PANEL */}
            {activeTab === 'doubts' && (
              <div className="flex flex-col h-[55vh] justify-between">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">AI Mathematics Doubt Solver</h3>
                  <span className="text-[10px] text-gray-500 font-mono">Answers formatted in mathematical LaTeX layout</span>
                </div>

                {/* Chat window */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 font-mono text-xs pr-2 scrollbar no-print">
                  {doubtChat.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3.5 rounded-xl leading-relaxed whitespace-pre-line border ${
                        msg.role === 'user' 
                          ? 'bg-electric/10 border-electric/30 text-electric' 
                          : 'bg-obsidian/80 border-white/5 text-platinum'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-obsidian/80 border border-white/5 p-3.5 rounded-xl text-gray-500 flex items-center gap-2">
                        <div className="h-2 w-2 bg-electric rounded-full animate-ping" />
                        AI is compiling math equations...
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Input */}
                <form onSubmit={handleAskDoubt} className="border-t border-white/5 pt-4 flex gap-2">
                  <input
                    type="text"
                    required
                    value={doubtInput}
                    onChange={(e) => setDoubtInput(e.target.value)}
                    placeholder="Ask about limits, coordinates, matrices, integrations..."
                    className="flex-1 px-4 py-3 bg-obsidian border border-white/5 focus:border-electric/30 text-xs rounded-lg focus:outline-none text-white font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-electric hover:bg-cyan-400 text-obsidian font-bold rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
