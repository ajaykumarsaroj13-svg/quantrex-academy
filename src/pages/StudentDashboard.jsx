import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, BookOpen, Clock, PlayCircle, LogOut, CheckCircle, Lock, ShieldCheck, Trophy, Sparkles, Target, ArrowRight, BrainCircuit, FileText, Download, Flame, Send, Globe, ListOrdered, RotateCcw, X, Play, Bookmark } from 'lucide-react';
import { loadDbFromBlob } from '../blob';
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

import VideoPlayer from '../components/VideoPlayer';
import PdfViewer from '../components/PdfViewer';
import ExamGoalPracticeInterface from '../components/ExamGoalPracticeInterface';
import ExamGoalChapterOverview from '../components/ExamGoalChapterOverview';
import ChapterPYQDashboard from '../components/ChapterPYQDashboard';
import { usePYQProgress } from '../hooks/usePYQProgress';
import BookmarkGroupModal from '../components/BookmarkGroupModal';



import chapterQuestionCounts from '../utils/chapterQuestionCounts.json';

export default function StudentDashboard({ user, courses, setActivePage, setExamTest, syllabus, initialClass = 'jee-mains',
  initialTab = 'courses',
  initialChapterTab = 'videos',
  isLight,
  onToggleTheme,
  testsData
}) {
  const [tests, setTests] = useState([]);
  const [testCategory, setTestCategory] = useState('jee-mains'); // jee-mains, jee-advanced
  const [activeTab, setActiveTab] = useState(initialTab || 'courses'); // courses, live, tests, ai-analytics, doubts
  const [purchasedList, setPurchasedList] = useState([]);
  // Syllabus selection states
  const [selectedSyllabusClass, setSelectedSyllabusClass] = useState(initialClass || 'jee-mains');
  const [selectedSyllabusChapterId, setSelectedSyllabusChapterId] = useState('');
  const [selectedSyllabusSubject, setSelectedSyllabusSubject] = useState('mathematics');
  const [chapterTab, setChapterTab] = useState(initialChapterTab || 'videos'); // videos, pdfs, formulas, pyqs, mockTests
  const [inlinePdf, setInlinePdf] = useState(null);
  const [selectedPyqTopic, setSelectedPyqTopic] = useState(null);
  const [customPracticeQuestions, setCustomPracticeQuestions] = useState(null);
  const [activePracticeMode, setActivePracticeMode] = useState('test'); // 'practice' or 'test'
  
  const [activePyqData, setActivePyqData] = useState(null);

  const [isPyqLoading, setIsPyqLoading] = useState(false);
  const [practiceModalConfig, setPracticeModalConfig] = useState(null);
  const [modalQuestionOrder, setModalQuestionOrder] = useState('newest'); // newest, oldest, random
  const [modalSessionAction, setModalSessionAction] = useState('resume'); // resume, dont_restore, fresh
  const [examGoalOverviewConfig, setExamGoalOverviewConfig] = useState(null);

  // Premium dashboard state declarations
  const [chapterSearchQuery, setChapterSearchQuery] = useState('');
  const [pyqSubView, setPyqSubView] = useState('overview'); // overview, all, bookmarks, mistakes, solved
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedYears, setSelectedYears] = useState([]);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [bookmarkQuestionId, setBookmarkQuestionId] = useState(null);

  // Handle hardware back button for mobile - close overlays step by step
  useEffect(() => {
    const handlePopState = () => {
      // Close overlays in priority order. Each back press closes the topmost.
      setExamGoalOverviewConfig(null);
      setActivePyqData(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const pyqSetsProgress = usePYQProgress(selectedSyllabusChapterId || 'sets_and_relations');
  const { progress, stats: pyqStats, updateProgress, clearProgress, bookmarkGroups, addBookmarkGroup } = pyqSetsProgress;

  const hasCourseAccess = (courseKey) => {
    return true;
  };

  const isResourceUnlocked = (item) => {
    return true;
  };
  
  // Lecture player states
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [playerTab, setPlayerTab] = useState('video'); // video, notes
  
  // AI Doubt Solver states
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtChat, setDoubtChat] = useState([
    { role: 'ai', text: 'Hello! I am your Quantrex AI Math Mentor. Ask me any IIT-JEE Mathematics equation or problem from Calculus, Geometry, or Algebra.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const theme = isLight ? 'light' : 'dark';

  // ── Helpers ──────────────────────────────────────────────────
  const handleDownloadChapterList = () => {
    const actualClassKey = selectedSyllabusClass === 'jee-mains' ? 'mains' : selectedSyllabusClass === 'jee-advanced' ? 'advanced' : selectedSyllabusClass;
    const chapters = syllabus[actualClassKey]?.subjects?.[selectedSyllabusSubject]?.chapters || [];
    const text = chapters.map((ch, idx) => `${idx + 1}. ${ch.title}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSyllabusClass}_${selectedSyllabusSubject}_chapters.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stripLatex = (html) => {
    if (!html) return '';
    let text = html;
    if (typeof text === 'object') {
      text = text.en?.content || text.en?.questionText || text.en?.direction || text.content || text.questionText || '';
    }
    if (typeof text !== 'string') {
      text = String(text);
    }
    text = text.replace(/\$\$[^$]*\$\$/g, '[Math]');
    text = text.replace(/\$[^$]*\$/g, '[Math]');
    text = text.replace(/\\\([^)]*\\\)/g, '[Math]');
    text = text.replace(/\\\[[^\]]*\\\]/g, '[Math]');
    text = text.replace(/<[^>]+>/g, '');
    return text.trim();
  };

  const formatTimeSpent = (seconds) => {
    if (!seconds) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ── Leaderboard Generator ─────────────────────────────────────
  const getLeaderboardForChapter = (chapterId, totalQs) => {
    if (!chapterId) return [];
    let hash = 0;
    for (let i = 0; i < chapterId.length; i++) {
      hash = Math.imul(31, hash) + chapterId.charCodeAt(i) | 0;
    }
    const rng = () => {
      hash = Math.sin(hash) * 10000;
      return hash - Math.floor(hash);
    };
    
    const names = [
      "Aarav Rana", "Mohit Sharma", "Sakshi Kumari", 
      "Rahul Verma", "Priya Singh", "Ankit Yadav", "Neha Gupta",
      "Divyansh Raj", "Ishita Sen", "Kabir Mehta", "Ananya Roy"
    ];
    
    const shuffledNames = [...names];
    for (let i = shuffledNames.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = shuffledNames[i];
      shuffledNames[i] = shuffledNames[j];
      shuffledNames[j] = temp;
    }
    
    const total = totalQs || 121;
    const rankers = [];
    for (let r = 1; r <= 7; r++) {
      const accuracy = (99.5 - (r - 1) * (1.5 + rng() * 1.0)).toFixed(1);
      const scoreVal = Math.round(total * (parseFloat(accuracy) / 100) * 4);
      rankers.push({
        rank: r,
        name: shuffledNames[r - 1],
        accuracy: `${accuracy}%`,
        score: `${scoreVal}/${total}`,
        avatar: shuffledNames[r - 1].split(' ').map(n => n[0]).join('')
      });
    }
    return rankers;
  };

  // ── Centralized Fetching of Chapter PYQs ───────────────────────
  useEffect(() => {
    if (!selectedSyllabusChapterId) return;
    
    const actualClassKey = selectedSyllabusClass === 'jee-mains' ? 'mains' : selectedSyllabusClass === 'jee-advanced' ? 'advanced' : selectedSyllabusClass;
    const ch = syllabus[actualClassKey]?.subjects?.[selectedSyllabusSubject]?.chapters?.find(c => c.id === selectedSyllabusChapterId);
    if (!ch) return;
    
    setIsPyqLoading(true);
    setActivePyqData(null);
    setPyqSubView('overview'); // reset to overview on chapter change
    
    const slug = (ch.url && ch.url !== '#') ? ch.url.split('/').pop() : (ch.id || '');
    let fetchSlug = String(slug || ch.id || 'unknown');
    if (selectedSyllabusClass === 'jee-advanced') {
      if (fetchSlug.startsWith('physics_')) fetchSlug = fetchSlug.replace('physics_', '');
      else if (fetchSlug.startsWith('chemistry_')) fetchSlug = fetchSlug.replace('chemistry_', '');
      else if (fetchSlug.startsWith('mathematics_')) fetchSlug = fetchSlug.replace('mathematics_', '');

      if (!fetchSlug.startsWith('adv-') && !fetchSlug.startsWith('ch_adv_math_')) {
        fetchSlug = 'adv-' + fetchSlug;
      }
    }
    
    fetch(import.meta.env.BASE_URL + `data/questions/${fetchSlug}.json?_t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.topics && data.questions && !Array.isArray(data.questions)) {
          setActivePyqData(data);
          return;
        }
        const topicsMap = {};
        const topicsList = [];
        const questionsArray = Array.isArray(data) ? data : (data.data || []);
        if (questionsArray.length > 0) {
          questionsArray.forEach(q => {
            if (!q.id) q.id = q.question_id || q._id || `q_${Math.random().toString(36).slice(2)}`;
            if (!q.correctAnswer && q.answer) q.correctAnswer = q.answer;
            let tName = String(q.topic || 'General');
            if (tName === slug || tName === ch.id) tName = 'All Questions';
            const tId = tName.toLowerCase().replace(/\s+/g, '_');
            if (!topicsMap[tId]) {
              topicsMap[tId] = [];
              topicsList.push({ id: tId, name: tName });
            }
            topicsMap[tId].push(q);
          });
        }
        setActivePyqData({
          topics: topicsList.length > 0 ? topicsList : [{ id: 'general', name: 'General Questions' }],
          questions: Object.keys(topicsMap).length > 0 ? topicsMap : { 'general': [] }
        });
      })
      .catch(err => {
        console.error('Error fetching PYQs:', err);
        // Fallback realistic practice questions so the portal works perfectly
        const dummyTopics = [{ id: 'general', name: 'Practice Exercises' }];
        const dummyQs = [];
        for (let i = 0; i < 30; i++) {
          dummyQs.push({
            id: `dummy_${ch.id}_${i}`,
            question: `Identify the correct mathematical statement and solve the expression: \\( E = mc^2 \\) or \\( \\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2} \\) for subtopic exercise ${i + 1}.`,
            difficulty: i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard',
            type: i % 2 === 0 ? 'SINGLE_CORRECT' : 'NUMERICAL',
            year: 2021 + (i % 5),
            correctOption: 0,
            correctAnswer: '5'
          });
        }
        setActivePyqData({
          topics: dummyTopics,
          questions: { 'general': dummyQs }
        });
      })
      .finally(() => setIsPyqLoading(false));
  }, [selectedSyllabusChapterId, selectedSyllabusClass, selectedSyllabusSubject, syllabus]);

  // ── Derived Questions ──────────────────────────────────────────
  const allQuestions = useMemo(() => {
    const list = [];
    if (!activePyqData || !activePyqData.questions) return list;
    Object.keys(activePyqData.questions).forEach(topicId => {
      activePyqData.questions[topicId].forEach(q => {
        list.push({ ...q, topicId });
      });
    });
    return list;
  }, [activePyqData]);

  const bookmarkedQuestions = useMemo(() => {
    return allQuestions.filter(q => progress[q.id]?.bookmarked || (progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0));
  }, [allQuestions, progress]);

  const mistakeQuestions = useMemo(() => {
    return allQuestions.filter(q => progress[q.id]?.status === 'wrong');
  }, [allQuestions, progress]);

  const solvedQuestions = useMemo(() => {
    return allQuestions.filter(q => progress[q.id]?.status === 'correct');
  }, [allQuestions, progress]);

  const availableYears = useMemo(() => {
    const ySet = new Set();
    allQuestions.forEach(q => { if(q.year) ySet.add(q.year.toString()) });
    return Array.from(ySet).sort((a,b) => Number(b) - Number(a));
  }, [allQuestions]);

  const availableTypes = useMemo(() => {
    const types = new Set();
    allQuestions.forEach(q => {
      const t = (q.type || q.questionType || '').toUpperCase().trim();
      if (t === 'SINGLE_CORRECT' || t === 'SCQ' || t === 'SINGLE CORRECT' || t === 'MCQ (SINGLE CORRECT)') types.add('Single Correct');
      if (t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'MULTIPLE_CORRECT' || t === 'MULTIPLE CORRECT' || t === 'MCQ (MULTIPLE CORRECT)') types.add('Multi Correct');
      if (t === 'NUMERICAL' || t === 'NUMERICAL VALUE' || t === 'INTEGER' || t === 'INTEGER-VALUE') types.add('Integer Type');
      if (t === 'SUBJECTIVE') types.add('Subjective');
    });
    return Array.from(types).sort();
  }, [allQuestions]);

  const bookmarkQuestionList = useMemo(() => {
    const questionsByGroup = {};
    const ungroupedQuestions = [];
    bookmarkedQuestions.forEach(q => {
      const groups = progress[q.id]?.bookmarkGroups || [];
      if (groups.length === 0) {
        ungroupedQuestions.push(q);
      } else {
        groups.forEach(g => {
          if (!questionsByGroup[g]) questionsByGroup[g] = [];
          questionsByGroup[g].push(q);
        });
      }
    });
    return { questionsByGroup, ungroupedQuestions };
  }, [bookmarkedQuestions, progress]);

  const getFilteredQuestions = (source) => {
    let list = source;
    if (difficultyFilter !== 'All') list = list.filter(q => q.difficulty === difficultyFilter);
    if (selectedYears.length > 0) list = list.filter(q => q.year && selectedYears.includes(q.year.toString()));
    if (typeFilter !== 'All') {
      list = list.filter(q => {
        const t = (q.type || q.questionType || '').toUpperCase().trim();
        if (typeFilter === 'Single Correct') return t === 'SINGLE_CORRECT' || t === 'SCQ' || t === 'SINGLE CORRECT' || t === 'MCQ (SINGLE CORRECT)' || t === 'SINGLE' || t === 'OBJECTIVE';
        if (typeFilter === 'Multi Correct') return t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'MULTIPLE_CORRECT' || t === 'MULTIPLE CORRECT' || t === 'MCQ (MULTIPLE CORRECT)' || t === 'MULTIPLE';
        if (typeFilter === 'Integer Type') return t === 'NUMERICAL' || t === 'NUMERICAL VALUE' || t === 'INTEGER' || t === 'INTEGER-VALUE' || t === 'SUBJECTIVE NUMERICAL' || t === 'NUMERICAL_VALUE' || t === 'NATURAL' || t === 'DECIMAL';
        if (typeFilter === 'Subjective') return t === 'SUBJECTIVE' || t === 'SHORT ANSWER' || t === 'LONG ANSWER';
        return true;
      });
    }
    if (searchQuery) list = list.filter(q => (q.question?.en?.content || q.question || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  };

  const handleBookmarkClick = (qId) => {
    setBookmarkQuestionId(qId);
    setBookmarkModalOpen(true);
  };

  const saveBookmarkGroups = (groups) => {
    updateProgress(bookmarkQuestionId, { bookmarkGroups: groups });
  };

  const renderQuestionItem = (q, idx, isBookmarkTab = false, groupQs = null) => {
    const qStatus = progress[q.id]?.status || 'unattempted';
    const isBookmarked = progress[q.id]?.bookmarked || (progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0);
    
    return (
      <div 
        key={q.id} 
        onClick={() => {
          if (groupQs) {
            onPracticeMode(groupQs, 'practice', true, idx);
          }
        }}
        className={`rounded-2xl p-5 mb-4 border transition-all duration-300 ${
          isLight ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm' : 'bg-[#0f111a] border-white/5 hover:border-white/10'
        } ${groupQs ? 'cursor-pointer hover:shadow-md' : ''}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black border ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/40 border-white/5 text-gray-400'
            }`}>
              {idx + 1}
            </span>
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${
              isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-gray-300'
            }`}>
              {q.shift || q.year || q.title}
            </span>
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize`}>
              {q.difficulty || 'Medium'}
            </span>
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20`}>
              {q.type || q.questionType || 'SCQ'}
            </span>
            {qStatus === 'correct' && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded font-black">CORRECT</span>}
            {qStatus === 'wrong' && <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded font-black">WRONG</span>}
          </div>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleBookmarkClick(q.id); 
            }} 
            className={`${isBookmarked ? 'text-yellow-400' : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-600 hover:text-white')}`}
          >
            <Bookmark className="w-5 h-5 animate-pulse" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className={`text-[13px] leading-relaxed mb-4 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
          {stripLatex(q.question).substring(0, 220)}
          {stripLatex(q.question).length > 220 ? '...' : ''}
        </div>
        {!isBookmarkTab && (
          <div className="flex gap-2">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onPracticeMode([q], 'practice', true); 
              }} 
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-xl hover:shadow-md transition-all"
            >
              Reattempt / View
            </button>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (initialClass) {
      setSelectedSyllabusClass(initialClass);
      setSelectedSyllabusChapterId('');
    }
  }, [initialClass]);

  useEffect(() => {
    if (selectedSyllabusClass === 'jee-advanced') {
      setChapterTab('pyqs');
      const actualClassKey = 'advanced';
      const currentSubject = selectedSyllabusSubject || Object.keys(syllabus[actualClassKey]?.subjects || {})[0];
      if (!selectedSyllabusChapterId && syllabus[actualClassKey]?.subjects?.[currentSubject]?.chapters?.length > 0) {
        setSelectedSyllabusChapterId(syllabus[actualClassKey].subjects[currentSubject].chapters[0].id);
      }
    }
  }, [selectedSyllabusClass, syllabus]);

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

  useEffect(() => {
    const list = courses.filter(c => user?.purchasedCourses?.includes(c.id));
    setPurchasedList(list);

    const loadTests = async () => {
      const activeData = testCategory === 'jee-advanced' ? (testsData?.advanced || []) : testCategory === 'nda' ? (testsData?.nda || []) : (testsData?.mains || []);
      setTests(activeData);
      localStorage.setItem('quantrex_tests', JSON.stringify(activeData));
    };
    loadTests();
  }, [courses, user, testCategory]);

  const handleSecurityBreach = async (type, details) => {
    try {
      await fetch('/api/security/alert', { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}, body: JSON.stringify({ type, details }) });
    } catch (e) {}
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
    setTimeout(() => {
      setDoubtChat(prev => [...prev, { role: 'ai', text: 'Mock answer.' }]);
      setAiLoading(false);
    }, 1000);
  };

  const handleSelectLecture = (course, video) => {
    setSelectedCourse(course);
    setSelectedVideo(video);
    const ch = course.modules?.[0]?.chapters?.[0];
    setSelectedPdf(ch?.pdfs?.[0] || null);
    setPlayerTab('video');
  };

  const isFocusMode = activeTab === 'courses';
  const isTrueFullScreen = selectedVideo || selectedPdf || selectedPyqTopic || customPracticeQuestions;

  return (
    <>
      <style>{`
    .study-portal-wrapper { min-height: 100vh; }
    .theme-dark { --bg-root: #000000; --bg-panel: #111111; --text-main: #ffffff; --accent: #3b82f6; }
    .theme-light { --bg-root: #f8f9fa; --bg-panel: #ffffff; --text-main: #111827; --accent: #2563eb; }
    .themed-root { background: var(--bg-root) !important; color: var(--text-main) !important; }
      `}</style>

      {isTrueFullScreen && (
        <div className={`fixed inset-0 z-[100] w-screen h-screen overflow-y-auto ${isLight ? 'bg-[#f4f6fa]' : 'bg-[#000000]'} transition-colors duration-300`}>
          <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
            
            <div className={`flex justify-between items-center p-4 rounded-2xl border shadow-lg ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10 backdrop-blur-md'}`}>
              <button onClick={() => { setSelectedVideo(null); setSelectedPdf(null); setSelectedPyqTopic(null); setCustomPracticeQuestions(null); }} className="px-5 py-2.5 font-bold rounded-xl flex items-center gap-2 bg-blue-600 text-white">← Back to Chapters</button>
            </div>

            {selectedVideo ? (
                <div className="space-y-4">
                  <VideoPlayer videoUrl={selectedVideo.url} videoTitle={selectedVideo.title} studentInfo={user} />
                </div>
            ) : selectedPdf ? (
                <div className="p-4 rounded-xl shadow-2xl"><iframe src={selectedPdf.url} className="w-full h-[80vh]" title={selectedPdf.title} /></div>
            ) : null}
            
            {(selectedPyqTopic || customPracticeQuestions) && activePyqData && (
              <ExamGoalPracticeInterface 
                pyqData={activePyqData} 
                topic={selectedPyqTopic} 
                customQuestions={customPracticeQuestions}
                practiceMode={activePracticeMode}
                onProgressUpdate={pyqSetsProgress.updateProgress}
                onClose={() => { setActivePracticeMode(null); setActivePyqData(null); }}
                isLight={isLight}
                onToggleTheme={onToggleTheme}
                bookmarkGroups={pyqSetsProgress.bookmarkGroups}
                addBookmarkGroup={pyqSetsProgress.addBookmarkGroup}
                progress={pyqSetsProgress.progress}
              />
            )}
          </div>
        </div>
      )}

      {examGoalOverviewConfig && activePyqData && !isPyqLoading && (
        <div className={`fixed inset-0 z-50 overflow-y-auto ${isLight ? 'bg-slate-100' : 'bg-[#000000]'}`}>
            <ChapterPYQDashboard 
              chapterId={examGoalOverviewConfig.id}
              chapterName={examGoalOverviewConfig.title}
              pyqData={activePyqData} 
              isLight={isLight}
              exam={selectedSyllabusClass}
              initialTab={examGoalOverviewConfig.startTab}
              onBack={() => {
                setExamGoalOverviewConfig(null);
                setActivePyqData(null);
              }} 
              onPracticeMode={(questions, mode = 'practice', skipModal = false, startIndex = 0) => {
                  setActivePracticeMode(mode);
                  const subtopicId = activePyqData.topics.find(t => 
                    activePyqData.questions[t.id] === questions
                  )?.id;

                  if (skipModal || !subtopicId) {
                      // Bypass modal for custom sets like Bookmarks, Buckets, or single questions
                      setCustomPracticeQuestions(questions);
                      setSelectedPyqTopic({ id: 'custom_practice', name: 'Custom Practice Session', startIndex });
                      return;
                  }

                  setPracticeModalConfig({
                    title: examGoalOverviewConfig.title,
                    topicId: subtopicId,
                    mode: mode
                  });
                }} 
            />
        </div>
      )}

      {!isTrueFullScreen && !examGoalOverviewConfig && (<div className={`study-portal-wrapper ${theme === 'light' ? 'theme-light' : 'theme-dark'} px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 ${isFocusMode ? 'max-w-[1600px] lg:grid-cols-1' : 'max-w-7xl lg:grid-cols-4'} themed-root`}>

        {!isFocusMode && (
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex flex-col items-center text-center relative">
            <h3 className="text-white font-bold text-lg">{user?.name}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 flex flex-row lg:flex-col justify-around">
          {[
            { id: 'courses', icon: BookOpen, label: 'My Courses' },
            { id: 'live', icon: PlayCircle, label: 'Live Classes' },
            { id: 'tests', icon: Target, label: 'Official Paper', isPage: true, pageId: 'test-series' },
            { id: 'ultimate-tests', icon: Target, label: 'Ultimate Test Series', isPage: true, pageId: 'ultimate-test-series' },
            { id: 'ai-analytics', icon: BrainCircuit, label: 'AI Analytics' },
            { id: 'doubts', icon: LogOut, label: '24/7 Doubts' }
          ].map((item) => (
              <button
                key={item.id}
                onClick={() => { 
                  if (item.isPage) setActivePage(item.pageId);
                  else { setActiveTab(item.id); setSelectedVideo(null); }
                }}
                className={`w-full py-4 px-5 text-xs font-bold uppercase text-left ${activeTab === item.id ? 'text-electric' : 'text-gray-400'}`}
              >
                {activeTab === 'courses' && (
              <div className="space-y-6 font-sans text-xs">
                {/* Coaching Header Banner */}
                {(() => {
                  let bannerLogo = null;
                  let titleText = "";
                  let subText = "";
                  
                  if (selectedSyllabusClass === 'jee-mains') {
                    bannerLogo = logoMainsImg;
                    titleText = "JEE MAIN";
                    subText = "NATIONAL TESTING AGENCY";
                  } else if (selectedSyllabusClass === 'jee-advanced') {
                    bannerLogo = logoAdvancedImg;
                    titleText = "JEE ADVANCED";
                    subText = "INDIAN INSTITUTES OF TECHNOLOGY";
                  } else if (selectedSyllabusClass === 'nda') {
                    bannerLogo = logoNdaImg;
                    titleText = "NDA";
                    subText = "UNION PUBLIC SERVICE COMMISSION";
                  } else {
                    titleText = "BOARD EXAMS";
                    subText = "QUANTREX ACADEMY";
                  }
                  
                  return (
                    <div className="flex flex-col items-center justify-center text-center py-4 mb-4 border-b border-white/5">
                      {bannerLogo && (
                        <div className={`relative h-16 w-16 rounded-full overflow-hidden border shadow-lg flex items-center justify-center p-1 mb-2 ${
                          isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0a0a0c]'
                        }`}>
                          <img src={bannerLogo} alt={titleText} className="h-full w-full object-contain" />
                        </div>
                      )}
                      <div>
                        <h2 className={`font-black text-2xl tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r ${
                          isLight ? 'from-amber-600 via-amber-500 to-yellow-600' : 'from-gold via-yellow-400 to-amber-500'
                        } leading-none`}>
                          {titleText}
                        </h2>
                        <p className={`text-[9px] tracking-[0.25em] font-bold uppercase mt-1.5 ${
                          isLight ? 'text-slate-500' : 'text-gray-400'
                        }`}>
                          {subText}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-col gap-4 mb-6">
                  {/* Class/Exam Selection */}
                  <div className={`flex flex-wrap p-1 border rounded-2xl w-fit shadow-md ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0f111a] border-white/5'
                  }`}>
                    {[
                      { id: 'jee-mains', label: 'JEE Mains' },
                      { id: 'jee-advanced', label: 'JEE Advanced' },
                      { id: 'nda', label: 'NDA' },
                      { id: 'class-12', label: 'Class 12 Boards' },
                      { id: 'class-11', label: 'Class 11 Foundation' }
                    ].map(cls => (
                      <button
                        key={cls.id}
                        onClick={() => {
                          setSelectedSyllabusClass(cls.id);
                          setSelectedSyllabusChapterId('');
                          setChapterTab('pyqs');
                          setPyqSubView('overview');
                          setActivePyqData(null);
                          
                          const actualClassKey = cls.id === 'jee-mains' ? 'mains' : cls.id === 'jee-advanced' ? 'advanced' : cls.id;
                          const subjects = syllabus[actualClassKey]?.subjects || {};
                          const firstSubjectKey = Object.keys(subjects)[0];
                          if (firstSubjectKey) {
                            setSelectedSyllabusSubject(firstSubjectKey);
                          } else {
                            setSelectedSyllabusSubject('');
                          }
                        }}
                        className={`flex items-center justify-center py-2 px-4 text-[10px] font-extrabold uppercase rounded-xl transition-all duration-300 ${
                          selectedSyllabusClass === cls.id 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md border border-amber-500/30' 
                            : `${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'} border border-transparent`
                        }`}
                      >
                        {getExamLogo(cls.id, "w-4 h-4 mr-1.5 rounded-full object-cover")}
                        {cls.label}
                      </button>
                    ))}
                  </div>

                  {/* Subject Selection */}
                  {(() => {
                    const actualClassKey = selectedSyllabusClass === 'jee-mains' ? 'mains' : selectedSyllabusClass === 'jee-advanced' ? 'advanced' : selectedSyllabusClass;
                    const subjects = syllabus[actualClassKey]?.subjects || {};
                    if (Object.keys(subjects).length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(subjects).map(([subjKey, subjVal]) => (
                          <button
                            key={subjKey}
                            onClick={() => {
                              setSelectedSyllabusSubject(subjKey);
                              setSelectedSyllabusChapterId('');
                              setChapterTab('pyqs');
                              setPyqSubView('overview');
                              setActivePyqData(null);
                            }}
                            className={`py-1.5 px-4 text-[10px] font-extrabold uppercase rounded-full border transition-all duration-300 ${
                              selectedSyllabusSubject === subjKey
                                ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/40 text-amber-500 shadow-sm'
                                : `${isLight ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-800' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`
                            }`}
                          >
                            {subjVal.label || subjKey}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
                  {/* Left Sidebar: Chapters List */}
                  <div className="lg:col-span-1 space-y-4 pr-0 lg:pr-4 border-r-0 lg:border-r border-white/5">
                    <span className={`text-[10px] uppercase font-black tracking-widest block mb-1 border-b pb-2 ${
                      isLight ? 'text-slate-800 border-slate-200' : 'text-amber-500 border-white/10'
                    }`}>
                      Chapters List
                    </span>
                    
                    {/* Chapter Search Bar */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search chapters..."
                        value={chapterSearchQuery}
                        onChange={e => setChapterSearchQuery(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                          isLight 
                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-500/50' 
                            : 'bg-black/40 border-white/5 text-white focus:border-amber-500/50'
                        }`}
                      />
                    </div>

                    <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                      {(() => {
                        const actualClassKey = selectedSyllabusClass === 'jee-mains' ? 'mains' : selectedSyllabusClass === 'jee-advanced' ? 'advanced' : selectedSyllabusClass;
                        const chaptersList = syllabus[actualClassKey]?.subjects?.[selectedSyllabusSubject]?.chapters || [];
                        const filteredChapters = chaptersList.filter(ch => ch.title.toLowerCase().includes(chapterSearchQuery.toLowerCase()));
                        
                        if (filteredChapters.length === 0) {
                          return <p className="text-gray-500 italic text-center py-4">No chapters found.</p>;
                        }

                        return filteredChapters.map((ch, index) => {
                          const isActive = selectedSyllabusChapterId === ch.id;
                          const chNumber = String(index + 1).padStart(2, '0');
                          
                          let icon = "➗";
                          let lowerTitle = String(ch.title || '').toLowerCase();
                          if (lowerTitle.includes("sets") || lowerTitle.includes("relations")) icon = "∪";
                          else if (lowerTitle.includes("function")) icon = "ƒ(x)";
                          else if (lowerTitle.includes("logarithm")) icon = "㏒";
                          else if (lowerTitle.includes("trigonometr") || lowerTitle.includes("heights") || lowerTitle.includes("inverse")) icon = "θ";
                          else if (lowerTitle.includes("quadratic")) icon = "x²";
                          else if (lowerTitle.includes("complex")) icon = "𝑖";
                          else if (lowerTitle.includes("permutation") || lowerTitle.includes("combination")) icon = "ⁿCₖ";
                          else if (lowerTitle.includes("binomial")) icon = "(x+y)ⁿ";
                          else if (lowerTitle.includes("sequence") || lowerTitle.includes("progression") || lowerTitle.includes("series")) icon = "∑";
                          else if (lowerTitle.includes("straight line")) icon = "y=mx";
                          else if (lowerTitle.includes("circle") || lowerTitle.includes("conic") || lowerTitle.includes("parabola") || lowerTitle.includes("ellipse") || lowerTitle.includes("hyperbola")) icon = "⦾";
                          else if (lowerTitle.includes("limit") || lowerTitle.includes("continuity") || lowerTitle.includes("differentiability")) icon = "lim";
                          else if (lowerTitle.includes("derivative") || lowerTitle.includes("differentiation")) icon = "dy/dx";
                          else if (lowerTitle.includes("integral") || lowerTitle.includes("integration") || lowerTitle.includes("area")) icon = "∫";
                          else if (lowerTitle.includes("differential equation")) icon = "∇";
                          else if (lowerTitle.includes("vector") || lowerTitle.includes("3d")) icon = "v⃗";
                          else if (lowerTitle.includes("matri") || lowerTitle.includes("determinant")) icon = "[ ]";
                          else if (lowerTitle.includes("probability")) icon = "P(E)";
                          else if (lowerTitle.includes("statistics")) icon = "σ";
                          else if (lowerTitle.includes("mathematical reasoning")) icon = "p→q";

                          return (
                            <button
                              key={ch.id}
                              onClick={() => {
                                setSelectedSyllabusChapterId(ch.id);
                              }}
                              className={`relative w-full p-3.5 pl-4 rounded-2xl text-[12.5px] text-left font-bold transition-all duration-300 flex items-center gap-3.5 overflow-hidden group border hover:-translate-y-0.5 ${
                                isActive 
                                  ? 'bg-gradient-to-r from-amber-500/10 to-yellow-600/5 text-amber-500 border-amber-500/50 shadow-md shadow-amber-500/5' 
                                  : `${isLight ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' : 'bg-[#0f111a] text-gray-300 border-white/5 hover:bg-[#151826]'}`
                              }`}
                            >
                              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isActive ? 'bg-gradient-to-b from-amber-500 to-yellow-600' : 'bg-transparent'}`} />
                              
                              <span className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black font-mono transition-all duration-300 ${
                                isActive 
                                  ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md' 
                                  : `${isLight ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-white/5 text-gray-400 border border-white/5'}`
                              }`}>
                                {icon}
                              </span>
                              <span className={`truncate flex-1 tracking-wide ${isActive ? 'font-extrabold' : ''}`}>
                                {chNumber} {ch.title}
                              </span>
                              {isActive && <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                            </button>
                          );
                        });
                      })()}
                    </div>

                    {/* Download Chapter List Action */}
                    <button 
                      onClick={handleDownloadChapterList}
                      className={`w-full py-3 text-xs font-black uppercase rounded-2xl flex items-center justify-center gap-2 border transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Download className="w-4 h-4" /> Download Chapter List
                    </button>
                  </div>

                  {/* Right Workspace: Active Chapter Dashboard */}
                  <div className="lg:col-span-3 space-y-6">
                    {selectedSyllabusChapterId ? (
                      (() => {
                        const actualClassKey = selectedSyllabusClass === 'jee-mains' ? 'mains' : selectedSyllabusClass === 'jee-advanced' ? 'advanced' : selectedSyllabusClass;
                        const chapter = syllabus[actualClassKey]?.subjects?.[selectedSyllabusSubject]?.chapters?.find(ch => ch.id === selectedSyllabusChapterId);
                        if (!chapter) return null;

                        // Retrieve lists with fallbacks
                        const videosList = chapter.videos && chapter.videos.length > 0 ? chapter.videos : [
                          { id: `vid_${chapter.id}_1`, title: `Lecture 01: Core Concepts & Introduction to ${chapter.title}`, duration: '45 mins', url: 'https://player.vimeo.com/video/76979871', isFree: true },
                          { id: `vid_${chapter.id}_2`, title: `Lecture 02: Advanced Applications & PYQ Analysis`, duration: '52 mins', url: 'https://player.vimeo.com/video/76979871', isFree: false },
                          { id: `vid_${chapter.id}_3`, title: `Lecture 03: Specially Curated Formula Hacks`, duration: '38 mins', url: 'https://player.vimeo.com/video/76979871', isFree: false },
                        ];
                        const pdfsList = chapter.pdfs && chapter.pdfs.length > 0 ? chapter.pdfs : [
                          { id: `pdf_${chapter.id}_1`, title: `${chapter.title} - Complete Class Notes Handout`, size: '2.4 MB', url: '/books/Allen-Maths-Handbook.pdf', isFree: true },
                          { id: `pdf_${chapter.id}_2`, title: `Daily Practice Problems (DPP 01) - standard Level`, size: '1.8 MB', url: '/books/Allen-Maths-Handbook.pdf', isFree: false },
                          { id: `pdf_${chapter.id}_3`, title: `Advanced Level Assignment (IIT-JEE Level)`, size: '3.1 MB', url: '/books/Allen-Maths-Handbook.pdf', isFree: false },
                        ];
                        const formulasList = chapter.formulas && chapter.formulas.length > 0 ? chapter.formulas : [
                          { id: `form_${chapter.id}_1`, title: `${chapter.title} - Ultimate Formulas Sheet`, url: '/books/Allen-Maths-Handbook.pdf' },
                          { id: `form_${chapter.id}_2`, title: `Tricks and Quick Revision Derivations`, url: '/books/Allen-Maths-Handbook.pdf' }
                        ];
                        const mockTestsList = chapter.mockTests && chapter.mockTests.length > 0 ? chapter.mockTests : [
                          { id: `test_${chapter.id}_1`, title: `${chapter.title} - Chapter mock Test 01`, durationMinutes: 45, type: 'Quantrex JEE Pattern', duration: 45, questionsCount: 15 },
                          { id: `test_${chapter.id}_2`, title: `${chapter.title} - Chapter mock Test 02 (Advanced Level)`, durationMinutes: 60, type: 'Quantrex JEE Pattern', duration: 60, questionsCount: 10 }
                        ];

                        const handleLaunchMockTest = (mockTest) => {
                          const questionsForTest = allQuestions.slice(0, mockTest.questionsCount || 10).map((q, idx) => ({
                            ...q,
                            questionNumber: idx + 1,
                            subject: selectedSyllabusSubject === 'mathematics' ? 'Mathematics' : selectedSyllabusSubject === 'physics' ? 'Physics' : 'Chemistry',
                            section: 'A'
                          }));
                          
                          const fullTestObject = {
                            id: mockTest.id,
                            title: mockTest.title,
                            durationMinutes: mockTest.durationMinutes,
                            duration: mockTest.durationMinutes,
                            questions: questionsForTest,
                            examType: selectedSyllabusClass === 'jee-mains' ? 'JEE Main' : selectedSyllabusClass === 'jee-advanced' ? 'JEE Advanced' : 'NDA'
                          };
                          
                          setExamTest(fullTestObject);
                          setActivePage('exam-mode');
                        };

                        return (
                          <div className="space-y-6 w-full animate-fade-in">
                            {/* Chapter title header */}
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-6 h-6 text-blue-500 flex-shrink-0" />
                              <h3 className={`font-black text-xl sm:text-2xl uppercase tracking-widest ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                {chapter.title}
                              </h3>
                            </div>

                            {/* Resource Tabs Selection */}
                            <div className={`flex p-1.5 border rounded-2xl justify-between gap-1.5 overflow-x-auto ${
                              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0f111a] border-white/5'
                            }`}>
                              {[
                                { id: 'videos', label: 'Lectures', icon: '🎥' },
                                { id: 'pdfs', label: 'Notes / DPPs', icon: '📄' },
                                { id: 'formulas', label: 'Formulas', icon: '⚡' },
                                { id: 'pyqs', label: 'PYQs', icon: '📁' },
                                { id: 'mockTests', label: 'Chapter Test', icon: '🏆' }
                              ].map(subTab => {
                                const isActive = chapterTab === subTab.id;
                                return (
                                  <button
                                    key={subTab.id}
                                    onClick={() => setChapterTab(subTab.id)}
                                    className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all duration-300 uppercase whitespace-nowrap overflow-hidden group ${
                                      isActive 
                                        ? 'bg-gradient-to-r from-amber-500/10 to-yellow-600/5 border border-amber-500/30 text-amber-500 font-extrabold' 
                                        : `${isLight ? 'text-slate-500 hover:text-slate-850' : 'text-gray-400 hover:text-white'} border border-transparent`
                                    }`}
                                  >
                                    <span className="text-sm drop-shadow-md">{subTab.icon}</span>
                                    <span className="text-[10px] sm:text-[11px] font-black tracking-wider">{subTab.label}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Dashboard/Tab Workspaces */}
                            <div className={`relative p-6 border rounded-3xl min-h-[45vh] overflow-hidden ${
                              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0f111a] border-white/5 shadow-xl'
                            }`}>
                              {/* Background lighting */}
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[120px] bg-amber-500/5 blur-[80px] pointer-events-none rounded-full" />
                              
                              {/* A. PYQs Overview & Lists */}
                              {chapterTab === 'pyqs' && (
                                <>
                                  {isPyqLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                                      <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                      <p className="text-xs text-gray-500 font-mono">Loading chapter analytics...</p>
                                    </div>
                                  ) : pyqSubView === 'overview' ? (
                                    <div className="space-y-6">
                                      {/* 4 Metric Cards Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Card 1: PYQs */}
                                        <div 
                                          onClick={() => setPyqSubView('all')}
                                          className={`rounded-2xl p-5 border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151724] border-white/5'
                                          }`}
                                        >
                                          <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                              <FileText className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                          </div>
                                          <div className="mt-3">
                                            <h4 className={`text-[13px] font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Previous Year Questions</h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Chapter-wise past exams</p>
                                          </div>
                                          <span className="text-xl font-black text-blue-500 block mt-2">{allQuestions.length} Questions</span>
                                        </div>

                                        {/* Card 2: Bookmarks */}
                                        <div 
                                          onClick={() => setPyqSubView('bookmarks')}
                                          className={`rounded-2xl p-5 border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151724] border-white/5'
                                          }`}
                                        >
                                          <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                              <Bookmark className="w-5 h-5 text-yellow-500" />
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                          </div>
                                          <div className="mt-3">
                                            <h4 className={`text-[13px] font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Bookmarked Questions</h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Your saved important questions</p>
                                          </div>
                                          <span className="text-xl font-black text-yellow-500 block mt-2">{bookmarkedQuestions.length} Questions</span>
                                        </div>

                                        {/* Card 3: Incorrect / Reattempt */}
                                        <div 
                                          onClick={() => setPyqSubView('mistakes')}
                                          className={`rounded-2xl p-5 border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151724] border-white/5'
                                          }`}
                                        >
                                          <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                              <X className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                          </div>
                                          <div className="mt-3">
                                            <h4 className={`text-[13px] font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Incorrect / To Reattempt</h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Questions to improve accuracy</p>
                                          </div>
                                          <span className="text-xl font-black text-purple-500 block mt-2">{mistakeQuestions.length} Questions</span>
                                        </div>

                                        {/* Card 4: Solved */}
                                        <div 
                                          onClick={() => setPyqSubView('solved')}
                                          className={`rounded-2xl p-5 border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151724] border-white/5'
                                          }`}
                                        >
                                          <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                              <CheckCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                          </div>
                                          <div className="mt-3">
                                            <h4 className={`text-[13px] font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Solved Questions</h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Questions you have solved</p>
                                          </div>
                                          <span className="text-xl font-black text-green-500 block mt-2">{solvedQuestions.length} Questions</span>
                                        </div>
                                      </div>

                                      {/* Progress Dashboard */}
                                      <div className={`p-6 rounded-2xl border ${
                                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151724] border-white/5'
                                      }`}>
                                        <h4 className={`text-[11px] font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${
                                          isLight ? 'text-slate-800' : 'text-amber-500'
                                        }`}>
                                          <Target className="w-4 h-4" /> Your Progress In This Chapter
                                        </h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                          <div className="p-3 bg-black/25 rounded-xl border border-white/5">
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Total Questions</span>
                                            <span className={`text-lg font-black block mt-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{allQuestions.length}</span>
                                          </div>
                                          <div className="p-3 bg-black/25 rounded-xl border border-white/5">
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Attempted</span>
                                            <span className={`text-lg font-black block mt-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{solvedQuestions.length + mistakeQuestions.length}</span>
                                          </div>
                                          <div className="p-3 bg-black/25 rounded-xl border border-white/5">
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Accuracy</span>
                                            <span className="text-lg font-black block mt-1 text-green-500">{pyqStats.accuracy}%</span>
                                          </div>
                                          <div className="p-3 bg-black/25 rounded-xl border border-white/5">
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Time Spent</span>
                                            <span className="text-lg font-black block mt-1 text-purple-400">{formatTimeSpent(pyqStats.timeSpent)}</span>
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className="flex justify-between text-[10px] font-bold text-gray-500">
                                            <span>PROGRESS OVERVIEW</span>
                                            <span>{solvedQuestions.length + mistakeQuestions.length} / {allQuestions.length} Questions ({pyqStats.accuracy}%)</span>
                                          </div>
                                          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${(allQuestions.length > 0 ? (solvedQuestions.length + mistakeQuestions.length) / allQuestions.length : 0) * 100}%` }}></div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Quick Actions */}
                                      <div className="space-y-3">
                                        <h4 className={`text-[11px] font-black uppercase tracking-wider ${
                                          isLight ? 'text-slate-800' : 'text-amber-500'
                                        }`}>
                                          ⚡ Quick Actions
                                        </h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                          <div 
                                            onClick={() => onPracticeMode(allQuestions, 'test', true)}
                                            className={`p-4 border rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center gap-3 ${
                                              isLight ? 'bg-white border-slate-200' : 'bg-[#151724] border-white/5'
                                            }`}
                                          >
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                              <Play className="w-4 h-4 fill-current" />
                                            </div>
                                            <div>
                                              <span className={`font-bold block text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>Start Chapter Test</span>
                                              <span className="text-[9px] text-gray-500 block">Test understanding</span>
                                            </div>
                                          </div>

                                          <div 
                                            onClick={() => setPracticeModalConfig({ title: chapter.title, topicId: 'full_chapter', mode: 'test' })}
                                            className={`p-4 border rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center gap-3 ${
                                              isLight ? 'bg-white border-slate-200' : 'bg-[#151724] border-white/5'
                                            }`}
                                          >
                                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                              <Target className="w-4 h-4" />
                                            </div>
                                            <div>
                                              <span className={`font-bold block text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>Create Custom Test</span>
                                              <span className="text-[9px] text-gray-500 block">Select topics</span>
                                            </div>
                                          </div>

                                          <div 
                                            onClick={() => setChapterTab('pdfs')}
                                            className={`p-4 border rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center gap-3 ${
                                              isLight ? 'bg-white border-slate-200' : 'bg-[#151724] border-white/5'
                                            }`}
                                          >
                                            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                              <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                              <span className={`font-bold block text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>View Notes</span>
                                              <span className="text-[9px] text-gray-500 block">Study handouts</span>
                                            </div>
                                          </div>

                                          <div 
                                            onClick={() => setChapterTab('formulas')}
                                            className={`p-4 border rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center gap-3 ${
                                              isLight ? 'bg-white border-slate-200' : 'bg-[#151724] border-white/5'
                                            }`}
                                          >
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-455 font-bold">
                                              <Flame className="w-4 h-4 fill-current" />
                                            </div>
                                            <div>
                                              <span className={`font-bold block text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>Formula Sheet</span>
                                              <span className="text-[9px] text-gray-500 block">Quick revision</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Chapter Leaderboard */}
                                      <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                          <h4 className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-2 ${
                                            isLight ? 'text-slate-800' : 'text-amber-500'
                                          }`}>
                                            <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" /> Chapter Leaderboard
                                          </h4>
                                          <span className="text-[10px] font-bold text-amber-505 hover:underline cursor-pointer">
                                            View Full Leaderboard →
                                          </span>
                                        </div>

                                        {(() => {
                                          const board = getLeaderboardForChapter(selectedSyllabusChapterId, allQuestions.length);
                                          if (board.length === 0) return null;
                                          return (
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                                              {/* Top 3 podium display */}
                                              <div className="lg:col-span-2 grid grid-cols-3 gap-3 items-end">
                                                {/* Rank 2 */}
                                                <div className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[170px] ${
                                                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#14151e] border-white/5'
                                                }`}>
                                                  <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-slate-850 font-black text-xs shadow-inner">
                                                      {board[1]?.avatar}
                                                    </div>
                                                    <span className="absolute -bottom-1 -right-1 bg-slate-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow border border-white">2</span>
                                                  </div>
                                                  <div className="mt-2 flex-1 flex flex-col justify-center">
                                                    <span className={`font-bold block text-xs ${isLight ? 'text-slate-850' : 'text-white'}`}>{board[1]?.name}</span>
                                                    <span className="text-[10px] text-gray-500 block mt-0.5">{board[1]?.accuracy} Accuracy</span>
                                                  </div>
                                                  <span className="text-[10px] font-bold bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-full border border-slate-500/20 mt-2 block">
                                                    🏆 {board[1]?.score} Score
                                                  </span>
                                                </div>

                                                {/* Rank 1 */}
                                                <div className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[195px] relative overflow-hidden ${
                                                  isLight ? 'bg-amber-50/50 border-amber-300' : 'bg-[#1d1a15] border-amber-500/30'
                                                }`}>
                                                  <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/10 rounded-bl-2xl flex items-center justify-center">
                                                    <Trophy className="w-4 h-4 text-amber-500" />
                                                  </div>
                                                  <div className="relative">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 border-2 border-amber-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-amber-500/20">
                                                      {board[0]?.avatar}
                                                    </div>
                                                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow border border-white animate-pulse">1</span>
                                                  </div>
                                                  <div className="mt-3 flex-1 flex flex-col justify-center">
                                                    <span className={`font-black block text-sm ${isLight ? 'text-slate-850' : 'text-amber-550'}`}>{board[0]?.name}</span>
                                                    <span className="text-[10px] text-amber-400 block mt-0.5 font-bold">{board[0]?.accuracy} Accuracy</span>
                                                  </div>
                                                  <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 mt-2 block">
                                                    🏆 {board[0]?.score} Score
                                                  </span>
                                                </div>

                                                {/* Rank 3 */}
                                                <div className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[170px] ${
                                                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#14151e] border-white/5'
                                                }`}>
                                                  <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-orange-950/20 border-2 border-orange-700/50 flex items-center justify-center text-orange-400 font-black text-xs shadow-inner">
                                                      {board[2]?.avatar}
                                                    </div>
                                                    <span className="absolute -bottom-1 -right-1 bg-orange-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow border border-white">3</span>
                                                  </div>
                                                  <div className="mt-2 flex-1 flex flex-col justify-center">
                                                    <span className={`font-bold block text-xs ${isLight ? 'text-slate-850' : 'text-white'}`}>{board[2]?.name}</span>
                                                    <span className="text-[10px] text-gray-500 block mt-0.5">{board[2]?.accuracy} Accuracy</span>
                                                  </div>
                                                  <span className="text-[10px] font-bold bg-orange-850/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-850/20 mt-2 block">
                                                    🏆 {board[2]?.score} Score
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Rank 4-7 list */}
                                              <div className={`p-4 rounded-2xl border flex flex-col justify-center space-y-2.5 ${
                                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#14151e] border-white/5'
                                              }`}>
                                                {board.slice(3, 7).map((item, idx) => (
                                                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-b-0 pb-1.5 last:pb-0">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-[10px] font-mono text-gray-500">0{item.rank}</span>
                                                      <span className={`font-semibold ${isLight ? 'text-slate-850' : 'text-gray-305'}`}>{item.name}</span>
                                                    </div>
                                                    <span className="font-mono text-amber-500 font-bold">{item.accuracy}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </div>

                                      {/* Banner Success Succeed */}
                                      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative ${
                                        isLight 
                                          ? 'bg-amber-50/50 border-amber-200 shadow-sm' 
                                          : 'bg-gradient-to-r from-[#1d1a15] to-[#12141a] border-amber-500/20 shadow-xl'
                                      }`}>
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                            <Trophy className="w-5 h-5 text-amber-500" />
                                          </div>
                                          <div>
                                            <span className={`font-black block text-sm ${isLight ? 'text-slate-850' : 'text-amber-500'}`}>Practice. Analyze. Improve. Succeed.</span>
                                            <span className="text-[10px] text-gray-500 block mt-0.5 font-semibold">Stay consistent and conquer {selectedSyllabusClass === 'nda' ? 'NDA' : 'JEE'} with Quantrex Academy.</span>
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => setActiveTab('tests')}
                                          className="px-5 py-2.5 bg-gradient-to-r from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200 text-amber-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all self-start md:self-center shrink-0 border border-amber-200/50"
                                        >
                                          Take a Mock Test →
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Question list sub-views */
                                    <div className="space-y-6">
                                      {/* Sub-view header with back button */}
                                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <h4 className={`text-base font-black uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                          {pyqSubView === 'all' && 'All Chapter Questions'}
                                          {pyqSubView === 'bookmarks' && 'Saved / Bookmarked Questions'}
                                          {pyqSubView === 'mistakes' && 'Incorrect / Reattempt Exercises'}
                                          {pyqSubView === 'solved' && 'Solved Questions'}
                                        </h4>
                                        <button 
                                          onClick={() => setPyqSubView('overview')}
                                          className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl border transition-all flex items-center gap-1.5 ${
                                            isLight 
                                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' 
                                              : 'bg-[#151724] border-white/5 text-gray-300 hover:bg-[#1a1c2a]'
                                          }`}
                                        >
                                          ← Back to Overview
                                        </button>
                                      </div>

                                      {/* Search & Filter Options */}
                                      {pyqSubView === 'all' && (
                                        <div className="flex flex-wrap gap-3 items-center">
                                          {/* Search query input */}
                                          <div className="relative flex-1 min-w-[200px]">
                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                            <input 
                                              type="text" 
                                              placeholder="Search questions by keyword..."
                                              value={searchQuery} 
                                              onChange={e => setSearchQuery(e.target.value)}
                                              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                                isLight 
                                                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-500/50' 
                                                  : 'bg-black/40 border-white/5 text-white focus:border-amber-500/50'
                                              }`}
                                            />
                                          </div>

                                          {/* Year select dropdown */}
                                          <div className="relative">
                                            <button 
                                              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                                              className={`px-4 py-2.5 rounded-xl border text-[11px] font-extrabold uppercase transition-all flex items-center gap-2 justify-between min-w-[120px] ${
                                                isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/5 text-gray-300'
                                              }`}
                                            >
                                              <span>{selectedYears.length === 0 ? 'All Years' : `${selectedYears.length} Years`}</span>
                                              <ChevronDown className="w-3.5 h-3.5" />
                                            </button>
                                            {isYearDropdownOpen && (
                                              <div className={`absolute top-full mt-1.5 w-48 border rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-1 max-h-60 overflow-y-auto ${
                                                isLight ? 'bg-white border-slate-200' : 'bg-[#151724] border-white/5'
                                              }`}>
                                                <label className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs font-semibold ${isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-white/5 text-gray-300'}`}>
                                                  <input type="checkbox" checked={selectedYears.length === 0} onChange={() => setSelectedYears([])} className="rounded border-white/10 text-amber-500 focus:ring-amber-500" />
                                                  All Years
                                                </label>
                                                {availableYears.map(y => (
                                                  <label key={y} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs font-semibold ${isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-white/5 text-gray-300'}`}>
                                                    <input type="checkbox" 
                                                      checked={selectedYears.includes(y)} 
                                                      onChange={(e) => {
                                                        if (e.target.checked) {
                                                          setSelectedYears([...selectedYears, y]);
                                                        } else {
                                                          setSelectedYears(selectedYears.filter(year => year !== y));
                                                        }
                                                      }} 
                                                      className="rounded border-white/10 text-amber-500 focus:ring-amber-500" 
                                                    />
                                                    {y}
                                                  </label>
                                                ))}
                                              </div>
                                            )}
                                          </div>

                                          {/* Type filter */}
                                          <select 
                                            value={typeFilter} 
                                            onChange={e => setTypeFilter(e.target.value)}
                                            className={`px-4 py-2.5 rounded-xl border text-[11px] font-extrabold uppercase transition-all ${
                                              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#151724] border-white/5 text-gray-300'
                                            }`}
                                          >
                                            <option value="All">All Types</option>
                                            {availableTypes.map(t => (
                                              <option key={t} value={t}>{t}</option>
                                            ))}
                                          </select>

                                          {/* Difficulty filter */}
                                          <select 
                                            value={difficultyFilter} 
                                            onChange={e => setDifficultyFilter(e.target.value)}
                                            className={`px-4 py-2.5 rounded-xl border text-[11px] font-extrabold uppercase transition-all ${
                                              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#151724] border-white/5 text-gray-300'
                                            }`}
                                          >
                                            <option value="All">All Difficulties</option>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                          </select>
                                        </div>
                                      )}

                                      {/* List display */}
                                      <div className="space-y-3">
                                        {(() => {
                                          let baseList = [];
                                          if (pyqSubView === 'all') baseList = allQuestions;
                                          else if (pyqSubView === 'bookmarks') baseList = bookmarkedQuestions;
                                          else if (pyqSubView === 'mistakes') baseList = mistakeQuestions;
                                          else if (pyqSubView === 'solved') baseList = solvedQuestions;

                                          const filtered = getFilteredQuestions(baseList);
                                          if (filtered.length === 0) {
                                            return <p className="text-gray-500 italic text-center py-8">No questions matching the criteria.</p>;
                                          }
                                          return (
                                            <>
                                              {pyqSubView === 'bookmarks' && bookmarkQuestionList.ungroupedQuestions.length > 0 && (
                                                <div className="space-y-3">
                                                  <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-2">
                                                    <span className="text-[10px] font-black uppercase text-gray-500">Uncategorized Bookmarks ({bookmarkQuestionList.ungroupedQuestions.length})</span>
                                                    <button onClick={() => onPracticeMode(bookmarkQuestionList.ungroupedQuestions, 'practice', true)} className="text-[9px] font-bold bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20">Practice Set</button>
                                                  </div>
                                                  {bookmarkQuestionList.ungroupedQuestions.map((q, idx) => renderQuestionItem(q, idx, true, bookmarkQuestionList.ungroupedQuestions))}
                                                </div>
                                              )}
                                              
                                              {pyqSubView === 'bookmarks' && Object.entries(bookmarkQuestionList.questionsByGroup).map(([group, questions]) => (
                                                <div key={group} className="space-y-3 mt-4">
                                                  <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-2">
                                                    <span className="text-[10px] font-black uppercase text-amber-500">{group} ({questions.length})</span>
                                                    <button onClick={() => onPracticeMode(questions, 'practice', true)} className="text-[9px] font-bold bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20">Practice Set</button>
                                                  </div>
                                                  {questions.map((q, idx) => renderQuestionItem(q, idx, true, questions))}
                                                </div>
                                              ))}

                                              {pyqSubView !== 'bookmarks' && filtered.map((q, idx) => renderQuestionItem(q, idx, false, filtered))}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* B. Lectures Tab Workspace */}
                              {chapterTab === 'videos' && (
                                <div className="space-y-2">
                                  {videosList.map(v => {
                                    const unlocked = isResourceUnlocked(v);
                                    return (
                                      <div key={v.id} className={`flex justify-between items-center p-4 rounded-2xl border ${
                                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
                                      }`}>
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <h5 className={`font-black text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>{v.title}</h5>
                                            {v.isFree && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-black">DEMO</span>}
                                          </div>
                                          <span className="text-[9px] text-gray-500 block mt-1">Duration: {v.duration}</span>
                                        </div>
                                        <button
                                          onClick={() => {
                                            if (!unlocked) {
                                              alert('Premium Video Locked. Please enroll to unlock.');
                                              return;
                                            }
                                            setSelectedVideo(v); 
                                            setPlayerTab('video'); 
                                          }}
                                          className={`px-4 py-2 font-black text-[9px] uppercase rounded-xl flex items-center gap-1.5 transition-colors ${
                                            unlocked 
                                              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md' 
                                              : 'bg-red-950/20 border border-red-950/50 text-red-400 cursor-not-allowed'
                                          }`}
                                        >
                                          {unlocked ? <PlayCircle className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />} 
                                          {unlocked ? 'Play' : 'Locked'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* C. Notes & Handouts Tab Workspace */}
                              {chapterTab === 'pdfs' && (
                                <div className="space-y-2">
                                  {pdfsList.map(p => {
                                    const unlocked = isResourceUnlocked(p);
                                    return (
                                      <div key={p.id} className={`flex justify-between items-center p-4 rounded-2xl border ${
                                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
                                      }`}>
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <h5 className={`font-black text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>{p.title}</h5>
                                            {p.isFree && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-black">FREE</span>}
                                          </div>
                                          <span className="text-[9px] text-gray-500 block mt-1">Handout Size: {p.size}</span>
                                        </div>
                                        <button
                                          onClick={() => {
                                            if (!unlocked) {
                                              alert('Handout Locked. Please enroll to unlock.');
                                              return;
                                            }
                                            setSelectedPdf(p);
                                          }}
                                          className={`px-4 py-2 font-black text-[9px] uppercase rounded-xl flex items-center gap-1.5 transition-colors ${
                                            unlocked 
                                              ? 'bg-blue-600/10 border border-blue-500/35 text-blue-405 font-bold' 
                                              : 'bg-red-950/20 border border-red-950/50 text-red-400 cursor-not-allowed'
                                          }`}
                                        >
                                          {unlocked ? <FileText className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />} 
                                          {unlocked ? 'View Notes' : 'Locked'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* D. Formulas Workspace */}
                              {chapterTab === 'formulas' && (
                                <div className="space-y-3">
                                  {formulasList.map(f => (
                                    <div key={f.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
                                    }`}>
                                      <h5 className={`font-black text-xs flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                        <Flame className="h-4 w-4 text-amber-500 fill-current" /> {f.title}
                                      </h5>
                                      {f.url && (
                                        <button
                                          onClick={() => setSelectedPdf({ id: `formula-${f.id}`, url: f.url, title: f.title })}
                                          className={`px-3.5 py-1.5 text-[9px] font-black uppercase rounded-xl border transition-all ${
                                            isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' : 'bg-[#151724] border-white/5 text-gray-300 hover:bg-[#1a1c2a]'
                                          }`}
                                        >
                                          📄 Open PDF
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* E. Chapter Test Workspace */}
                              {chapterTab === 'mockTests' && (
                                <div className="space-y-2">
                                  {mockTestsList.map(t => (
                                    <div key={t.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
                                    }`}>
                                      <div className="space-y-1">
                                        <h5 className={`font-black text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.title}</h5>
                                        <span className="text-[9px] text-gray-500 block mt-0.5">
                                          Duration: {t.durationMinutes} minutes • Pattern: {t.type}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleLaunchMockTest(t)}
                                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-black text-[9px] uppercase rounded-xl shadow-md transition-colors"
                                      >
                                        Start Mock Exam
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className={`flex flex-col items-center justify-center p-12 rounded-3xl min-h-[40vh] text-center space-y-3 border ${
                        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0f111a] border-white/5'
                      }`}>
                        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-500">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-gray-500">Select a chapter from the left menu to explore the study dashboard.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
              </button>
          ))}
        </div>
      </div>
      )}

      <div className={`${isFocusMode ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-6`}>

        {!selectedVideo && (
          <div className="glass-panel p-8 rounded-2xl border border-white/5 min-h-[60vh] space-y-6">
            {activeTab === 'courses' && (
              <div className="space-y-6 font-mono text-xs">
                {/* Coaching Header Banner */}
                {(() => {
                  let bannerLogo = null;
                  let titleText = "";
                  let subText = "";
                  
                  if (selectedSyllabusClass === 'jee-mains') {
                    bannerLogo = logoMainsImg;
                    titleText = "JEE MAIN";
                    subText = "National Testing Agency";
                  } else if (selectedSyllabusClass === 'jee-advanced') {
                    bannerLogo = logoAdvancedImg;
                    titleText = "JEE ADVANCED";
                    subText = "Indian Institutes of Technology";
                  } else if (selectedSyllabusClass === 'nda') {
                    bannerLogo = logoNdaImg;
                    titleText = "NDA";
                    subText = "Union Public Service Commission";
                  } else {
                    return null;
                  }
                  
                  return (
                    <div className="flex flex-col items-center justify-center text-center py-6 mb-6 border-b border-white/5">
                      <div className={`relative h-20 w-20 rounded-full overflow-hidden border shadow-lg flex items-center justify-center p-1 mb-2 ${
                        isLight ? 'border-slate-200 shadow-slate-100/50' : 'border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-[#0a0a0c]'
                      }`}>
                        <img src={bannerLogo} alt={titleText} className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <h2 className={`font-logo font-black text-2xl tracking-wider uppercase bg-gradient-to-r ${
                          isLight
                            ? 'from-blue-700 via-blue-500 to-amber-500'
                            : 'from-white via-electric to-gold'
                        } bg-clip-text text-transparent leading-none`}>
                          {titleText}
                        </h2>
                        <p className={`text-[10px] tracking-[0.2em] font-bold uppercase mt-1 font-logo ${
                          isLight ? 'text-slate-500' : 'text-gray-400'
                        }`}>
                          {subText}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-col gap-4 mb-6">
                  {/* Class Selection */}
                  <div className="flex flex-wrap bg-cyberdark/50 backdrop-blur-xl p-1.5 border border-white/10 rounded-xl w-fit shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    {[
                      { id: 'jee-mains', label: 'JEE Mains' },
                      { id: 'jee-advanced', label: 'JEE Advanced' },
                      { id: 'nda', label: 'NDA' },
                      { id: 'class-12', label: 'Class 12 Boards' },
                      { id: 'class-11', label: 'Class 11 Foundation' }
                    ].map(cls => (
                      <button
                        key={cls.id}
                        onClick={() => {
                          setSelectedSyllabusClass(cls.id);
                          setSelectedSyllabusChapterId('');
                          setChapterTab('videos');
                          setExamGoalOverviewConfig(null);
                          setActivePyqData(null);
                          
                          // Default to first subject when class changes
                          const actualClassKey = cls.id === 'jee-mains' ? 'mains' : cls.id === 'jee-advanced' ? 'advanced' : cls.id;
                          const subjects = syllabus[actualClassKey]?.subjects || {};
                          const firstSubjectKey = Object.keys(subjects)[0];
                          if (firstSubjectKey) {
                            setSelectedSyllabusSubject(firstSubjectKey);
                          } else {
                            setSelectedSyllabusSubject('');
                          }
                        }}
                        className={`flex items-center justify-center flex-1 min-w-[120px] py-2 px-4 text-xs font-bold uppercase rounded-lg transition-all duration-300 ${
                          selectedSyllabusClass === cls.id 
                            ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {getExamLogo(cls.id)}
                        {cls.label}
                      </button>
                    ))}
                  </div>

                  {/* Subject Selection */}
                  {(() => {
                      const actualClassKey = selectedSyllabusClass === 'jee-mains' ? 'mains' : selectedSyllabusClass === 'jee-advanced' ? 'advanced' : selectedSyllabusClass;
                      return Object.keys(syllabus[actualClassKey]?.subjects || {}).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(syllabus[actualClassKey]?.subjects || {}).map(([subjKey, subjVal]) => (
                          <button
                            key={subjKey}
                            onClick={() => {
                              setSelectedSyllabusSubject(subjKey);
                              setSelectedSyllabusChapterId('');
                              setChapterTab('videos');
                              setExamGoalOverviewConfig(null);
                              setActivePyqData(null);
                            }}
                            className={`py-1.5 px-4 text-xs font-bold uppercase rounded-full border transition-all duration-300 ${
                              selectedSyllabusSubject === subjKey
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10'
                            }`}
                          >
                            {subjVal.label || subjKey}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                  <div className={`md:col-span-1 space-y-3 pr-4 max-h-[70vh] overflow-y-auto custom-scrollbar border-r ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                    <span className={`text-[10px] uppercase font-black tracking-widest block mb-4 border-b pb-2 ${isLight ? 'text-blue-600 border-slate-200' : 'text-cyan-400/80 border-white/10'}`}>Chapters List</span>
                    {(() => {
                        const actualClassKey = selectedSyllabusClass === 'jee-mains' ? 'mains' : selectedSyllabusClass === 'jee-advanced' ? 'advanced' : selectedSyllabusClass;
                        return syllabus[actualClassKey]?.subjects?.[selectedSyllabusSubject]?.chapters?.map((ch, index) => {
                          const isActive = selectedSyllabusChapterId === ch.id;
                          
                          const premiumGradients = [
                            'from-[#FF416C] to-[#FF4B2B]', // Vibrant Red-Orange
                            'from-[#4776E6] to-[#8E54E9]', // Deep Blue-Purple
                            'from-[#00B4DB] to-[#0083B0]', // Ocean Blue
                            'from-[#f12711] to-[#f5af19]', // Fire
                            'from-[#8E2DE2] to-[#4A00E0]', // Mystical Purple
                            'from-[#11998e] to-[#38ef7d]', // Emerald
                            'from-[#FC466B] to-[#3F5EFB]', // Pink Blue
                            'from-[#00c6ff] to-[#0072ff]', // Sky Blue
                            'from-[#F09819] to-[#EDDE5D]', // Golden Yellow
                          ];
                          
                          const colorTheme = premiumGradients[index % premiumGradients.length];
                          
                          let icon = "➗";
                          let lowerTitle = String(ch.title || '').toLowerCase();
                          if (lowerTitle.includes("sets") || lowerTitle.includes("relations")) icon = "∪";
                          else if (lowerTitle.includes("function")) icon = "ƒ(x)";
                          else if (lowerTitle.includes("logarithm")) icon = "㏒";
                          else if (lowerTitle.includes("trigonometr") || lowerTitle.includes("heights") || lowerTitle.includes("inverse")) icon = "θ";
                          else if (lowerTitle.includes("quadratic")) icon = "x²";
                          else if (lowerTitle.includes("complex")) icon = "𝑖";
                          else if (lowerTitle.includes("permutation") || lowerTitle.includes("combination")) icon = "ⁿCₖ";
                          else if (lowerTitle.includes("binomial")) icon = "(x+y)ⁿ";
                          else if (lowerTitle.includes("sequence") || lowerTitle.includes("progression") || lowerTitle.includes("series")) icon = "∑";
                          else if (lowerTitle.includes("straight line")) icon = "y=mx";
                          else if (lowerTitle.includes("circle") || lowerTitle.includes("conic") || lowerTitle.includes("parabola") || lowerTitle.includes("ellipse") || lowerTitle.includes("hyperbola")) icon = "⦾";
                          else if (lowerTitle.includes("limit") || lowerTitle.includes("continuity") || lowerTitle.includes("differentiability")) icon = "lim";
                          else if (lowerTitle.includes("derivative") || lowerTitle.includes("differentiation")) icon = "dy/dx";
                          else if (lowerTitle.includes("integral") || lowerTitle.includes("integration") || lowerTitle.includes("area")) icon = "∫";
                          else if (lowerTitle.includes("differential equation")) icon = "∇";
                          else if (lowerTitle.includes("vector") || lowerTitle.includes("3d")) icon = "v⃗";
                          else if (lowerTitle.includes("matri") || lowerTitle.includes("determinant")) icon = "[ ]";
                          else if (lowerTitle.includes("probability")) icon = "P(E)";
                          else if (lowerTitle.includes("statistics")) icon = "σ";
                          else if (lowerTitle.includes("mathematical reasoning")) icon = "p→q";

                          return (
                            <button
                              key={ch.id}
                              onClick={() => {
                              setSelectedSyllabusChapterId(ch.id);
                              setChapterTab('pyqs');
                              
                              setIsPyqLoading(true);
                              setActivePyqData(null);

                              const slug = (ch.url && ch.url !== '#') ? ch.url.split('/').pop() : (ch.id || '');
                              let fetchSlug = String(slug || ch.id || 'unknown');
                              if (selectedSyllabusClass === 'jee-advanced') {
                                if (fetchSlug.startsWith('physics_')) fetchSlug = fetchSlug.replace('physics_', '');
                                else if (fetchSlug.startsWith('chemistry_')) fetchSlug = fetchSlug.replace('chemistry_', '');
                                else if (fetchSlug.startsWith('mathematics_')) fetchSlug = fetchSlug.replace('mathematics_', '');

                                if (!fetchSlug.startsWith('adv-') && !fetchSlug.startsWith('ch_adv_math_')) {
                                  fetchSlug = 'adv-' + fetchSlug;
                                }
                              }
                              fetch(import.meta.env.BASE_URL + `data/questions/${fetchSlug}.json?_t=${Date.now()}`)
                                .then(res => res.json())
                                .then(data => {
                                  if (data && data.topics && data.questions && !Array.isArray(data.questions)) {
                                    setActivePyqData(data);
                                    return;
                                  }
                                  const topicsMap = {};
                                  const topicsList = [];
                                  const questionsArray = Array.isArray(data) ? data : (data.data || []);
                                  if (questionsArray.length > 0) {
                                    questionsArray.forEach(q => {
                                      if (!q.id) q.id = q.question_id || q._id || `q_${Math.random().toString(36).slice(2)}`;
                                      if (!q.correctAnswer && q.answer) q.correctAnswer = q.answer;
                                      let tName = String(q.topic || 'General');
                                      if (tName === slug || tName === ch.id) tName = 'All Questions';
                                      const tId = tName.toLowerCase().replace(/\s+/g, '_');
                                      if (!topicsMap[tId]) {
                                        topicsMap[tId] = [];
                                        topicsList.push({ id: tId, name: tName });
                                      }
                                      topicsMap[tId].push(q);
                                    });
                                  }
                                  setActivePyqData({
                                    topics: topicsList.length > 0 ? topicsList : [{ id: 'general', name: 'General Questions' }],
                                    questions: Object.keys(topicsMap).length > 0 ? topicsMap : { 'general': [] }
                                  });
                                })
                                .catch(err => {
                                  console.error('Error fetching PYQs:', err);
                                  setActivePyqData({ topics: [], questions: {} });
                                })
                                .finally(() => setIsPyqLoading(false));

                              setExamGoalOverviewConfig({ id: ch.id, title: ch.title, startTab: 'topic' });
                            }} className={`relative w-full p-3.5 pl-4 rounded-2xl text-[13px] text-left font-bold transition-all duration-300 flex items-center gap-3.5 overflow-hidden group border shadow-sm hover:-translate-y-0.5 ${
                                isActive 
                                  ? (isLight ? 'bg-blue-600 text-white border-transparent shadow-[0_4px_15px_rgba(37,99,235,0.25)]' : 'bg-[#13162b] text-white border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.5)]') 
                                  : (isLight ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300' : 'bg-cyberdark/40 text-gray-300 border-white/5 hover:bg-[#1a1f3c] hover:border-white/10 hover:shadow-lg')
                              }`}
                            >
                              {/* Active state animated background glow */}
                              {isActive && (
                                <div className={`absolute inset-0 bg-gradient-to-r ${colorTheme} opacity-10 pointer-events-none`} />
                              )}
                              
                              {/* Colored left strip border indicator */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${isActive ? `bg-gradient-to-b ${colorTheme}` : 'bg-transparent group-hover:bg-white/10'}`} />
                              
                              {/* Sleek icon box */}
                              <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black font-mono transition-all duration-300 shadow-inner ${
                                isActive 
                                  ? `bg-gradient-to-br ${colorTheme} text-white shadow-md` 
                                  : (isLight 
                                      ? 'bg-slate-100 text-slate-500 border border-slate-200 group-hover:text-white group-hover:bg-gradient-to-br group-hover:' + colorTheme + ' group-hover:shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                                      : 'bg-black/50 text-gray-400 border border-white/5 group-hover:text-white group-hover:bg-gradient-to-br group-hover:' + colorTheme + ' group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]')
                              }`}>
                                {icon}
                              </span>
                              <span className={`truncate flex-1 tracking-wide ${isActive ? 'drop-shadow-sm font-extrabold text-[13.5px]' : ''}`}>{ch.title}</span>
                              
                              {/* Tiny arrow indicator for active state */}
                              {isActive && (
                                <span className={`absolute right-3 opacity-80 flex items-center text-white drop-shadow-sm`}>
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              )}
                            </button>
                          );
                        });
                      })()}
                  </div>

                    <div className="md:col-span-3">
                      {selectedSyllabusChapterId ? (
                        (() => {
                          const actualClassKey = selectedSyllabusClass === 'jee-mains' ? 'mains' : selectedSyllabusClass === 'jee-advanced' ? 'advanced' : selectedSyllabusClass;
                          const chapter = syllabus[actualClassKey]?.subjects?.[selectedSyllabusSubject]?.chapters?.find(ch => ch.id === selectedSyllabusChapterId);
                          if (!chapter) return null;
                          return (
                            <div className="space-y-6 w-full animate-fade-in">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                <h4 className={`font-black text-2xl uppercase tracking-widest drop-shadow-sm ${isLight ? 'text-slate-800' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400'}`}>
                                  {chapter.title}
                                </h4>
                              </div>

                              {/* Topics covered */}
                              {chapter.topics && chapter.topics.length > 0 && (
                                <div className={`p-5 rounded-2xl shadow-xl space-y-3 mb-6 border ${isLight ? 'bg-white border-slate-200' : 'bg-gradient-to-br from-[#1F2833]/80 to-[#0B0C10]/80 backdrop-blur-md border-white/10'}`}>
                                  <span className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-2 ${isLight ? 'text-blue-600' : 'text-cyan-400/80'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                    Topics Covered In This Chapter
                                  </span>
                                  <div className="flex flex-wrap gap-2.5">
                                    {chapter.topics.map(t => (
                                      <span key={t.id} className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all shadow-sm cursor-default ${
                                        isLight 
                                          ? 'text-slate-600 bg-slate-50 border-slate-200 hover:border-blue-500/50 hover:bg-blue-50 hover:text-blue-600' 
                                          : 'text-gray-200 bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-300'
                                      }`}>
                                        {t.title}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Premium Sub-tab selection */}
                              <div className={`flex p-1.5 border rounded-xl justify-between gap-2 overflow-x-auto ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-cyberdark/50 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'}`}>
                                {[
                                  { id: 'videos', label: 'Lectures', icon: '🎥' },
                                  { id: 'pdfs', label: 'Notes/DPPs', icon: '📄' },
                                  { id: 'formulas', label: 'Formulas', icon: '⚡' },
                                  { id: 'pyqs', label: 'PYQs', icon: '📝' },
                                  { id: 'mockTests', label: 'Chapter Tests', icon: '🏆' }
                                ].map(subTab => {
                                  const isActive = chapterTab === subTab.id;
                                  return (
                                    <button
                                      key={subTab.id}
                                      onClick={() => setChapterTab(subTab.id)}
                                      className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg transition-all duration-300 uppercase whitespace-nowrap overflow-hidden group border ${
                                        isActive 
                                          ? (isLight 
                                              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.08)] font-bold' 
                                              : 'bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold') 
                                          : (isLight 
                                              ? 'hover:bg-slate-50 border-transparent text-slate-500 hover:text-slate-700' 
                                              : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-gray-200')
                                      }`}
                                    >
                                      {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:animate-sweep" />
                                      )}
                                      <span className="text-base sm:text-sm drop-shadow-md">{subTab.icon}</span>
                                      <span className={`text-[10px] sm:text-xs font-bold tracking-wider ${isActive ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : ''}`}>
                                        {subTab.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Premium Tab Contents Panel */}
                              <div className={`relative p-6 border rounded-2xl min-h-[35vh] overflow-hidden ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-gradient-to-b from-[#1F2833]/40 to-[#0B0C10]/40 backdrop-blur-md border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'}`}>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[120px] bg-cyan-500/5 blur-[80px] pointer-events-none rounded-full" />
                                
                                {/* 1. Lectures */}
                                {chapterTab === 'videos' && (
                                  <div className="space-y-2">
                                    {(!chapter.videos || chapter.videos.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No video lectures uploaded yet for this chapter.</p>
                                    ) : (
                                      chapter.videos.map(v => {
                                        const unlocked = isResourceUnlocked(v);
                                        return (
                                          <div key={v.id} className={`flex justify-between items-center p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-cyberdark/60 border-white/5'}`}>
                                            <div>
                                              <div className="flex items-center gap-1.5">
                                                <h5 className={`font-semibold text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>{v.title}</h5>
                                                {v.isFree && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">DEMO</span>}
                                                {!unlocked && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-bold">LOCKED</span>}
                                              </div>
                                              <span className={`text-[9px] block mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Duration: {v.duration} {v.downloadBlocked && '• 🔒 Secured'}</span>
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
                                        return (
                                          <div key={p.id} className="space-y-2">
                                            <div className={`flex justify-between items-center p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-cyberdark/60 border-white/5'}`}>
                                              <div>
                                                <div className="flex items-center gap-1.5">
                                                  <h5 className={`font-semibold text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>{p.title}</h5>
                                                  {p.isFree && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">FREE</span>}
                                                  {!unlocked && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-bold">LOCKED</span>}
                                                </div>
                                                <span className={`text-[9px] block mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Size: {p.size || 'Unknown'}</span>
                                              </div>
                                              <button
                                                onClick={() => {
                                                  if (!unlocked) return;
                                                  setSelectedPdf(p);
                                                }}
                                                className={`px-3.5 py-1.5 font-bold text-[9px] uppercase rounded-lg flex items-center gap-1.5 transition-colors ${
                                                  unlocked 
                                                    ? 'bg-blue-600/20 border border-blue-500 text-white'
                                                    : 'bg-red-950/20 border border-red-900 text-red-400 cursor-not-allowed'
                                                }`}
                                              >
                                                {unlocked ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>} 
                                                {unlocked ? 'View' : 'Locked'}
                                              </button>
                                            </div>
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
                                         return (
                                           <div key={f.id} className={`p-4 rounded-xl space-y-2 border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-cyberdark/40 border-white/5'}`}>
                                             <h5 className={`font-bold text-xs border-b pb-1 flex items-center justify-between gap-1.5 ${isLight ? 'text-blue-600 border-slate-200' : 'text-gold border-white/5'}`}>
                                               <span className="flex items-center gap-1.5">
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 fill-current ${isLight ? 'text-blue-600' : 'text-gold'}`}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> {f.title}
                                               </span>
                                               {f.url && (
                                                 <button
                                                   onClick={() => setSelectedPdf({ id: `formula-${f.id}`, url: f.url, title: f.title })}
                                                   className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg flex items-center gap-1 ${isLight ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' : 'bg-electric/10 text-electric border border-electric/20 hover:bg-electric/20'}`}
                                                 >
                                                   📄 View File
                                                 </button>
                                               )}
                                             </h5>
                                           </div>
                                         );
                                      })
                                    )}
                                  </div>
                                )}
                                {/* 4. PYQs Tab */}
                                {chapterTab === 'pyqs' && (() => {
                                    const slug = (chapter.url && chapter.url !== '#') ? chapter.url.split('/').pop() : (chapter.id || '');
                                    let fetchSlug = String(slug || chapter.id || 'unknown');
                                    if (selectedSyllabusClass === 'jee-advanced') {
                                      if (fetchSlug.startsWith('physics_')) fetchSlug = fetchSlug.replace('physics_', '');
                                      else if (fetchSlug.startsWith('chemistry_')) fetchSlug = fetchSlug.replace('chemistry_', '');
                                      else if (fetchSlug.startsWith('mathematics_')) fetchSlug = fetchSlug.replace('mathematics_', '');

                                      if (!fetchSlug.startsWith('adv-') && !fetchSlug.startsWith('ch_adv_math_')) {
                                        fetchSlug = 'adv-' + fetchSlug;
                                      }
                                    }
                                  const qCount = chapterQuestionCounts[fetchSlug] || 0;
                                  return (
                                    <div className="space-y-4">
                                       <div 
                                        onClick={() => {
                                          setIsPyqLoading(true);
                                          setActivePyqData(null);
                                          fetch(import.meta.env.BASE_URL + `data/questions/${fetchSlug}.json?_t=${Date.now()}`)
                                            .then(res => res.json())
                                            .then(data => {
                                              if (data && data.topics && data.questions && !Array.isArray(data.questions)) {
                                                setActivePyqData(data);
                                                return;
                                              }
                                              const topicsMap = {};
                                              const topicsList = [];
                                              const questionsArray = Array.isArray(data) ? data : (data.data || []);
                                              if (questionsArray.length > 0) {
                                                questionsArray.forEach(q => {
                                                  if (!q.id) q.id = q.question_id || q._id || `q_${Math.random().toString(36).slice(2)}`;
                                                  if (!q.correctAnswer && q.answer) q.correctAnswer = q.answer;
                                                  let tName = String(q.topic || 'General');
                                                  if (tName === slug || tName === chapter.id) tName = 'All Questions';
                                                  const tId = tName.toLowerCase().replace(/\s+/g, '_');
                                                  if (!topicsMap[tId]) { topicsMap[tId] = []; topicsList.push({ id: tId, name: tName }); }
                                                  topicsMap[tId].push(q);
                                                });
                                              }
                                              setActivePyqData({ topics: topicsList.length > 0 ? topicsList : [{ id: 'general', name: 'General Questions' }], questions: Object.keys(topicsMap).length > 0 ? topicsMap : { 'general': [] } });
                                            })
                                            .catch(err => { console.error('Error fetching PYQs:', err); setActivePyqData({ topics: [], questions: {} }); })
                                            .finally(() => setIsPyqLoading(false));
                                          setExamGoalOverviewConfig({ id: chapter.id, title: chapter.title, startTab: 'topic' });
                                        }}
                                         className={`border-l-4 border-electric rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1e1e24] border-white/5 shadow-md'}`}
                                       >
                                         <div className="flex items-center gap-4">
                                           <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                                           </div>
                                           <div>
                                             <h4 className={`font-bold text-lg ${isLight ? 'text-slate-800' : 'text-white'}`}>{chapter.title || 'Chapter Questions'}</h4>
                                             <p className={`text-sm font-medium ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>Previous Year Questions</p>
                                           </div>
                                         </div>
                                         <div className="flex items-center gap-3">
                                           <span className={`px-3 py-1 rounded-md text-xs font-bold ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-gray-300'}`}>{qCount} Questions</span>
                                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                         </div>
                                       </div>
                                       <div 
                                            onClick={() => {
                                              setIsPyqLoading(true);
                                              setActivePyqData(null);
                                              fetch(import.meta.env.BASE_URL + `data/questions/${fetchSlug}.json?_t=${Date.now()}`)
                                                .then(res => res.json())
                                                .then(data => {
                                                  if (data && data.topics && data.questions && !Array.isArray(data.questions)) {
                                                    setActivePyqData(data);
                                                    return;
                                                  }
                                                  const topicsMap = {};
                                                  const topicsList = [];
                                                  const questionsArray = Array.isArray(data) ? data : (data.data || []);
                                                  questionsArray.forEach(q => {
                                                    if (!q.id) q.id = q.question_id || q._id || `q_${Math.random().toString(36).slice(2)}`;
                                                    let tName = String(q.topic || 'General');
                                                    if (tName === slug || tName === chapter.id) tName = 'All Questions';
                                                    const tId = tName.toLowerCase().replace(/\s+/g, '_');
                                                    if (!topicsMap[tId]) { topicsMap[tId] = []; topicsList.push({ id: tId, name: tName }); }
                                                    topicsMap[tId].push(q);
                                                  });
                                                  setActivePyqData({ topics: topicsList.length > 0 ? topicsList : [{ id: 'general', name: 'General Questions' }], questions: Object.keys(topicsMap).length > 0 ? topicsMap : { 'general': [] } });
                                                })
                                                .catch(() => setActivePyqData({ topics: [], questions: {} }))
                                                .finally(() => setIsPyqLoading(false));
                                              setExamGoalOverviewConfig({ id: chapter.id, title: chapter.title, startTab: 'bookmarks' });
                                            }}
                                           className={`border-l-4 border-yellow-400 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1e1e24] border-white/5 shadow-md'}`}
                                         >
                                           <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-500"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                                             </div>
                                             <div>
                                               <h4 className={`font-bold text-lg ${isLight ? 'text-slate-800' : 'text-white'}`}>Bookmarks</h4>
                                               <p className={`text-sm font-medium ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>Saved Questions</p>
                                             </div>
                                           </div>
                                           <div className="flex items-center gap-3">
                                             <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold">
                                               {(() => {
                                                  try {
                                                    const stored = localStorage.getItem(`quantrex_pyq_progress_${chapter.id}`);
                                                    if (!stored) return 0;
                                                    const parsed = JSON.parse(stored);
                                                    let count = 0;
                                                    Object.values(parsed).forEach(q => {
                                                      if (q.bookmarkGroups && q.bookmarkGroups.length > 0) count++;
                                                    });
                                                    return count;
                                                  } catch (e) {
                                                    return 0;
                                                  }
                                                })()} Questions
                                             </span>
                                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                           </div>
                                          </div>
                                     </div>
                                   );
                                 })()}

                                {/* 5. Mock Tests */}
                                {chapterTab === 'mockTests' && (
                                  <div className="space-y-2">
                                    {(!chapter.mockTests || chapter.mockTests.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No mock exams uploaded yet.</p>
                                    ) : (
                                      chapter.mockTests.map(t => (
                                        <div key={t.id} className={`p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-cyberdark/60 border-white/5'}`}>
                                          <div className="space-y-1">
                                            <h5 className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.title}</h5>
                                            <span className={`text-[9px] block ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
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
                        <div className={`flex flex-col items-center justify-center p-12 rounded-2xl min-h-[40vh] text-center space-y-3 border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-obsidian/30 border-white/5'}`}>
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <p className={`text-xs font-mono ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Select a chapter from the left menu to view contents.</p>
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
                {/* Coaching Header Banner */}
                {(() => {
                  let bannerLogo = null;
                  let titleText = "";
                  let subText = "";
                  
                  if (testCategory === 'jee-mains') {
                    bannerLogo = logoMainsImg;
                    titleText = "JEE MAIN";
                    subText = "National Testing Agency";
                  } else if (testCategory === 'jee-advanced') {
                    bannerLogo = logoAdvancedImg;
                    titleText = "JEE ADVANCED";
                    subText = "Indian Institutes of Technology";
                  } else if (testCategory === 'nda') {
                    bannerLogo = logoNdaImg;
                    titleText = "NDA";
                    subText = "Union Public Service Commission";
                  } else {
                    return null;
                  }
                  
                  return (
                    <div className="flex flex-col items-center justify-center text-center py-6 mb-6 border-b border-white/5">
                      <div className={`relative h-20 w-20 rounded-full overflow-hidden border shadow-lg flex items-center justify-center p-1 mb-2 ${
                        isLight ? 'border-slate-200 shadow-slate-100/50' : 'border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-[#0a0a0c]'
                      }`}>
                        <img src={bannerLogo} alt={titleText} className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <h2 className={`font-logo font-black text-2xl tracking-wider uppercase bg-gradient-to-r ${
                          isLight
                            ? 'from-blue-700 via-blue-500 to-amber-500'
                            : 'from-white via-electric to-gold'
                        } bg-clip-text text-transparent leading-none`}>
                          {titleText}
                        </h2>
                        <p className={`text-[10px] tracking-[0.2em] font-bold uppercase mt-1 font-logo ${
                          isLight ? 'text-slate-500' : 'text-gray-400'
                        }`}>
                          {subText}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">{testCategory === 'nda' ? 'NDA' : 'JEE'} Official Paper Portal</h3>
                  <div className="flex bg-obsidian/60 p-1 border border-white/5 rounded-lg">
                    <button
                      onClick={() => setTestCategory('jee-mains')}
                      className={`flex items-center px-4 py-1.5 text-xs font-bold uppercase rounded transition-all ${testCategory === 'jee-mains' ? 'bg-electric text-obsidian shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                      {getExamLogo('jee-mains')}
                      JEE Main
                    </button>
                    <button
                      onClick={() => setTestCategory('jee-advanced')}
                      className={`flex items-center px-4 py-1.5 text-xs font-bold uppercase rounded transition-all ${testCategory === 'jee-advanced' ? 'bg-gold text-obsidian shadow-[0_0_10px_rgba(255,215,0,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                      {getExamLogo('jee-advanced')}
                      JEE Advanced
                    </button>
                    <button
                      onClick={() => setTestCategory('nda')}
                      className={`flex items-center px-4 py-1.5 text-xs font-bold uppercase rounded transition-all ${testCategory === 'nda' ? 'bg-green-500 text-obsidian shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                      {getExamLogo('nda')}
                      NDA
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
                          <span>Subject: {test.subject || 'All Subjects'}</span>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="p-5 bg-cyberdark border border-white/5 rounded-xl space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-gold" />
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
    )}
{/* PRACTICE CONFIGURATION MODAL */}
      {practiceModalConfig && (
        <div className="fixed inset-0 z-[60] flex justify-center items-center bg-black/40 backdrop-blur-sm p-4 text-gray-800">
            <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] w-full max-w-3xl overflow-hidden flex flex-col font-sans border border-gray-100">
              <div className="bg-white px-6 py-5 flex justify-between items-center shrink-0 border-b border-gray-100 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <h3 className="font-bold text-xl flex items-center gap-3">
                  <button onClick={() => {
                    setPracticeModalConfig(null);
                  }} className="bg-black/50 p-2 rounded-full text-white hover:bg-red-500/80 transition-all">
                    <X className="w-6 h-6" />
                  </button>
                  <span className="text-gray-800">{practiceModalConfig.title}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 ml-2">
                    {practiceModalConfig.mode === 'test' ? 'Test Mode' : 'Practice Mode'}
                  </span>
                </h3>
                <button onClick={() => {
              setPracticeModalConfig(null);
            }} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white">
              <X className="w-5 h-5" />
            </button>
              </div>
              
              <div className="p-8 bg-[#f8fafc] flex flex-col gap-8 max-h-[80vh] overflow-y-auto">
                
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Globe className="w-4 h-4"/> Language Preference</h4>
                  <div className="flex gap-6">
                     <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-gray-700"><input type="radio" name="lang" defaultChecked className="accent-blue-600 w-4 h-4" /> English</label>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ListOrdered className="w-4 h-4"/> Question Order</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div onClick={() => setModalQuestionOrder('newest')} className={`rounded-xl p-4 cursor-pointer transition-all ${modalQuestionOrder === 'newest' ? 'border-2 border-blue-600 bg-blue-50 shadow-[0_0_15px_rgba(37,99,235,0.1)] ring-4 ring-blue-500/10' : 'border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                       <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalQuestionOrder === 'newest' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-transparent'}`}>✓</div> 
                          <span className={`font-bold text-[15px] ${modalQuestionOrder === 'newest' ? 'text-blue-900' : 'text-gray-700'}`}>Newest first</span>
                       </div>
                       <p className="text-xs text-gray-500 ml-7">New → Old</p>
                    </div>
                    <div onClick={() => setModalQuestionOrder('oldest')} className={`rounded-xl p-4 cursor-pointer transition-all ${modalQuestionOrder === 'oldest' ? 'border-2 border-blue-600 bg-blue-50 shadow-[0_0_15px_rgba(37,99,235,0.1)] ring-4 ring-blue-500/10' : 'border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                       <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalQuestionOrder === 'oldest' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-transparent'}`}>✓</div> 
                          <span className={`font-bold text-[15px] ${modalQuestionOrder === 'oldest' ? 'text-blue-900' : 'text-gray-700'}`}>Oldest first</span>
                       </div>
                       <p className="text-xs text-gray-500 ml-7">Old → New</p>
                    </div>
                    <div onClick={() => setModalQuestionOrder('random')} className={`rounded-xl p-4 cursor-pointer transition-all ${modalQuestionOrder === 'random' ? 'border-2 border-blue-600 bg-blue-50 shadow-[0_0_15px_rgba(37,99,235,0.1)] ring-4 ring-blue-500/10' : 'border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                       <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalQuestionOrder === 'random' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-transparent'}`}>✓</div> 
                          <span className={`font-bold text-[15px] ${modalQuestionOrder === 'random' ? 'text-blue-900' : 'text-gray-700'}`}>Random</span>
                       </div>
                       <p className="text-xs text-gray-500 ml-7">Shuffle questions</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4"/> Continue or Restart?</span>
                    <span className="text-blue-600 text-xs font-semibold">Previous session found</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div onClick={() => setModalSessionAction('resume')} className={`rounded-xl p-4 cursor-pointer relative transition-all ${modalSessionAction === 'resume' ? 'border-2 border-blue-600 bg-blue-50 shadow-[0_0_15px_rgba(37,99,235,0.1)] ring-4 ring-blue-500/10' : 'border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                       <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalSessionAction === 'resume' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-transparent'}`}>✓</div> 
                          <span className={`font-bold text-[15px] ${modalSessionAction === 'resume' ? 'text-blue-900' : 'text-gray-700'}`}>Resume</span> 
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 uppercase font-bold absolute top-4 right-4 flex items-center gap-1">★ Recommended</span>
                       </div>
                       <p className="text-xs text-gray-500 ml-7">Keep your progress, answers</p>
                    </div>
                    <div onClick={() => setModalSessionAction('dont_restore')} className={`rounded-xl p-4 cursor-pointer relative transition-all ${modalSessionAction === 'dont_restore' ? 'border-2 border-blue-600 bg-blue-50 shadow-[0_0_15px_rgba(37,99,235,0.1)] ring-4 ring-blue-500/10' : 'border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                       <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalSessionAction === 'dont_restore' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-transparent'}`}>✓</div> 
                          <span className={`font-bold text-[15px] ${modalSessionAction === 'dont_restore' ? 'text-blue-900' : 'text-gray-700'}`}>Don't Restore</span> 
                       </div>
                       <p className="text-xs text-gray-500 ml-7">Keep history, start fresh session</p>
                    </div>
                    <div onClick={() => setModalSessionAction('fresh')} className={`rounded-xl p-4 cursor-pointer relative transition-all ${modalSessionAction === 'fresh' ? 'border-2 border-rose-500 bg-rose-50 shadow-[0_0_15px_rgba(244,63,94,0.1)] ring-4 ring-rose-500/10' : 'border border-gray-200 bg-white hover:border-rose-300 hover:shadow-sm'}`}>
                       <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalSessionAction === 'fresh' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-transparent'}`}>✓</div> 
                          <span className={`font-bold text-[15px] ${modalSessionAction === 'fresh' ? 'text-rose-700' : 'text-gray-700'}`}>Start Fresh</span> 
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 uppercase font-bold absolute top-4 right-4 flex items-center gap-1">⚠ Will clear data</span>
                       </div>
                       <p className="text-xs text-gray-500 ml-7">Clear all data & begin clean</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-5 bg-white border-t border-gray-100 shrink-0">
                <button 
                  onClick={() => {
                     const ch = practiceModalConfig;
                     let baseQs = [];
                     
                     // Full chapter mock/practice
                     if (ch.topicId === 'full_chapter') {
                       Object.values(activePyqData.questions).forEach(arr => {
                         baseQs = [...baseQs, ...arr];
                       });
                     } else {
                       baseQs = [...(activePyqData.questions[ch.topicId] || [])];
                     }

                     // Apply Question Order
                     if (modalQuestionOrder === 'oldest') {
                       baseQs.reverse();
                     } else if (modalQuestionOrder === 'random') {
                       baseQs.sort(() => Math.random() - 0.5);
                     }

                     // Handle Session Action (localStorage)
                     const storageKey = `quantrex_practice_progress_${ch.topicId === 'full_chapter' ? examGoalOverviewConfig.id : ch.topicId}`;
                     if (modalSessionAction === 'fresh') {
                        localStorage.removeItem(storageKey);
                     } else if (modalSessionAction === 'dont_restore') {
                        const saved = localStorage.getItem(storageKey);
                        if (saved) {
                          try {
                            const parsed = JSON.parse(saved);
                            delete parsed.savedAnswers;
                            delete parsed.currentQuestionIndex;
                            localStorage.setItem(storageKey, JSON.stringify(parsed));
                          } catch (e) {}
                        }
                     }

                     setCustomPracticeQuestions(baseQs);
                     setActivePracticeMode(ch.mode);
                     if (ch.topicId === 'full_chapter') {
                       setSelectedPyqTopic({ id: examGoalOverviewConfig.id, name: ch.title });
                     } else {
                       const subtopicName = activePyqData.topics.find(t => t.id === ch.topicId)?.name || ch.title;
                       setSelectedPyqTopic({ id: ch.topicId, name: subtopicName });
                     }
                     
                     setPracticeModalConfig(null);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl text-[15px] transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                >
                  <Play className="fill-current w-4 h-4"/> {modalSessionAction === 'fresh' 
                    ? (practiceModalConfig.mode === 'test' ? 'Start Fresh Test Session' : 'Start Fresh Practice Session') 
                    : (practiceModalConfig.mode === 'test' ? 'Resume Test Session' : 'Resume Practice Session')}
                </button>
              </div>
            </div>
        </div>
      )}
    </>
  );
}
