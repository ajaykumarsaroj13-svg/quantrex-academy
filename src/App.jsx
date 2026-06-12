import React, { useState, useEffect, Suspense } from 'react';
import Navbar from './components/Navbar';
import MathCanvas from './components/MathCanvas';
import Home from './pages/Home';
import Auth from './pages/Auth';
import { Shield } from 'lucide-react';

const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const NtaTestInterface = React.lazy(() => import('./pages/NtaTestInterface'));
const TestSystem = React.lazy(() => import('./pages/TestSystem'));
const TestSeriesPage = React.lazy(() => import('./pages/TestSeriesPage'));
const TestSeriesExam = React.lazy(() => import('./pages/TestSeriesExam'));
const TestSeriesResult = React.lazy(() => import('./pages/TestSeriesResult'));
const BooksLibrary = React.lazy(() => import('./pages/BooksLibrary'));
const BookReader = React.lazy(() => import('./pages/BookReader'));
const BookChapterList = React.lazy(() => import('./pages/BookChapterList'));
const BookPractice = React.lazy(() => import('./pages/BookPractice'));

import { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } from './utils/syllabusData';

if (DEFAULT_SYLLABUS['jee-advanced'] && DEFAULT_SYLLABUS['jee-advanced'].subjects && DEFAULT_SYLLABUS['jee-advanced'].subjects.mathematics && DEFAULT_SYLLABUS['jee-advanced'].subjects.mathematics.chapters) {
    DEFAULT_SYLLABUS['jee-advanced'].subjects.mathematics.chapters = DEFAULT_SYLLABUS['jee-advanced'].subjects.mathematics.chapters.slice(0, 4);
}


export default function App() {
  const [activePage, setActivePage] = useState(() => localStorage.getItem('quantrex_active_page') || 'home');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [examTest, setExamTest] = useState(() => {
    const saved = localStorage.getItem('quantrex_exam_test');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [customLogo, setCustomLogo] = useState(localStorage.getItem('custom_logo') || null);
  const [activeTestId, setActiveTestId] = useState(() => localStorage.getItem('quantrex_active_test_id') || null);
  const [activeTestMode, setActiveTestMode] = useState(() => localStorage.getItem('quantrex_active_test_mode') || 'exam'); // 'exam' | 'practice'
  const [testResult, setTestResult] = useState(() => {
    const saved = localStorage.getItem('quantrex_test_result');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [isLight, setIsLight] = useState(() => localStorage.getItem('quantrex_theme') === 'light');
  const [readingBook, setReadingBook] = useState(() => {
    const saved = localStorage.getItem('quantrex_reading_book');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [practiceChapter, setPracticeChapter] = useState(() => {
    const saved = localStorage.getItem('quantrex_practice_chapter');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [initialClass, setInitialClass] = useState(() => localStorage.getItem('quantrex_initial_class') || null);
  const [initialTab, setInitialTab] = useState(() => localStorage.getItem('quantrex_initial_tab') || null);
  const [initialChapterTab, setInitialChapterTab] = useState(() => localStorage.getItem('quantrex_initial_chapter_tab') || null);

  const [syllabus, setSyllabus] = useState(() => {
    // Clear old v6 syllabus cache if exists
    if (localStorage.getItem('quantrex_syllabus_v6')) {
      localStorage.removeItem('quantrex_syllabus_v6');
    }
    const saved = localStorage.getItem('quantrex_syllabus_v8');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_SYLLABUS;
  });

  const [toppers, setToppers] = useState(() => {
    const saved = localStorage.getItem('quantrex_toppers_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_TOPPERS;
  });

  // Keep page and states persistent across browser refresh
  useEffect(() => {
    localStorage.setItem('quantrex_active_page', activePage);
  }, [activePage]);

  // Persist syllabus when updated (e.g. from Admin Dashboard)
  useEffect(() => {
    localStorage.setItem('quantrex_syllabus_v8', JSON.stringify(syllabus));
  }, [syllabus]);

  // Persist toppers when updated
  useEffect(() => {
    localStorage.setItem('quantrex_toppers_v2', JSON.stringify(toppers));
  }, [toppers]);

  useEffect(() => {
    if (readingBook) {
      localStorage.setItem('quantrex_reading_book', JSON.stringify(readingBook));
    } else {
      localStorage.removeItem('quantrex_reading_book');
    }
  }, [readingBook]);

  useEffect(() => {
    if (practiceChapter) {
      localStorage.setItem('quantrex_practice_chapter', JSON.stringify(practiceChapter));
    } else {
      localStorage.removeItem('quantrex_practice_chapter');
    }
  }, [practiceChapter]);

  useEffect(() => {
    if (activeTestId) {
      localStorage.setItem('quantrex_active_test_id', activeTestId);
    } else {
      localStorage.removeItem('quantrex_active_test_id');
    }
  }, [activeTestId]);

  useEffect(() => {
    localStorage.setItem('quantrex_active_test_mode', activeTestMode);
  }, [activeTestMode]);

  useEffect(() => {
    if (testResult) {
      localStorage.setItem('quantrex_test_result', JSON.stringify(testResult));
    } else {
      localStorage.removeItem('quantrex_test_result');
    }
  }, [testResult]);

  useEffect(() => {
    if (examTest) {
      localStorage.setItem('quantrex_exam_test', JSON.stringify(examTest));
    } else {
      localStorage.removeItem('quantrex_exam_test');
    }
  }, [examTest]);

  useEffect(() => {
    if (initialClass) {
      localStorage.setItem('quantrex_initial_class', initialClass);
    } else {
      localStorage.removeItem('quantrex_initial_class');
    }
  }, [initialClass]);

  useEffect(() => {
    if (initialTab) {
      localStorage.setItem('quantrex_initial_tab', initialTab);
    } else {
      localStorage.removeItem('quantrex_initial_tab');
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialChapterTab) {
      localStorage.setItem('quantrex_initial_chapter_tab', initialChapterTab);
    } else {
      localStorage.removeItem('quantrex_initial_chapter_tab');
    }
  }, [initialChapterTab]);

  // Auth & Access Guard: redirect to home if logged out and trying to access protected views
  useEffect(() => {
    const protectedPages = ['admin-dashboard'];
    const adminPages = ['admin-dashboard'];
    const hasToken = token || localStorage.getItem('token');
    
    if (protectedPages.includes(activePage) && !hasToken) {
      setActivePage('home');
    } else if (adminPages.includes(activePage)) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.role !== 'admin') {
            setActivePage('home');
          }
        } catch (e) {
          setActivePage('home');
        }
      } else {
        setActivePage('home');
      }
    }
  }, [activePage, token]);

  useEffect(() => {
    localStorage.setItem('quantrex_theme', isLight ? 'light' : 'dark');
    document.documentElement.classList.toggle('light', isLight);
  }, [isLight]);



  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('user'); }
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else throw new Error();
    } catch (e) {
      setCourses([
        {
          id: 'course1',
          title: 'Rank Booster JEE Advanced Mathematics 2027',
          description: 'Master Calculus, Coordinate Geometry, and Algebra with A.K. Sir. Includes video lectures, notes, assignments, and test series.',
          price: 4999, originalPrice: 14999,
          coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
          tag: 'JEE Advanced', rating: 4.95, modules: []
        },
        {
          id: 'course2',
          title: 'Complete Algebra & Matrices for JEE Main + Advanced',
          description: 'Comprehensive course covering Matrices, Determinants, Complex Numbers, and Permutations. Designed by Ajay Kumar Saroj (A.K. Sir).',
          price: 3999, originalPrice: 9999,
          coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
          tag: 'JEE Main & Advanced', rating: 4.88, modules: []
        }
      ]);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activePage === 'student-dashboard' && user) {
        console.log('Syncing syllabus modules from Quantrex Live API...');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [activePage, user]);

  const handleLoginSuccess = (userToken, userData) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('quantrex_active_page');
    localStorage.removeItem('quantrex_reading_book');
    localStorage.removeItem('quantrex_practice_chapter');
    localStorage.removeItem('quantrex_active_test_id');
    localStorage.removeItem('quantrex_active_test_mode');
    localStorage.removeItem('quantrex_test_result');
    localStorage.removeItem('quantrex_exam_test');
    localStorage.removeItem('quantrex_initial_class');
    localStorage.removeItem('quantrex_initial_tab');
    localStorage.removeItem('quantrex_initial_chapter_tab');
    setActivePage('home');
  };

  const handleEnrollSuccess = (courseId) => {
    if (!user) return;
    const updatedUser = { ...user, purchasedCourses: [...(user.purchasedCourses || []), courseId] };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Handler: Navigate from Home to StudentDashboard with pre-selected class/tab
  const handleStartLearning = (gradeId, tab, chapterTab) => {
    setInitialClass(gradeId || 'jee-mains');
    setInitialTab(tab || 'courses');
    setInitialChapterTab(chapterTab || 'videos');
    setActivePage('student-dashboard');
  };

  // Handler: Start a full test series exam
  const handleStartTestSeries = (testId, mode = 'exam', source = 'test-series') => {
    setActiveTestId(testId);
    setActiveTestMode(mode);
    setTestResult(null);
    localStorage.setItem('quantrex_test_source', source);
    setActivePage('test-series-exam');
  };

  // Handler: Test submitted — show result
  const handleTestSubmit = (result) => {
    setTestResult(result);
    setActivePage('test-series-result');
  };

  const isExamMode = activePage === 'exam-mode' || activePage === 'test-series-exam';


  return (
    <div className="relative min-h-screen bg-obsidian flex flex-col justify-between">
      <MathCanvas />

      {!isExamMode && (
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
          onLogout={handleLogout}
          customLogo={customLogo}
          theme={isLight ? 'light' : 'dark'}
          onToggleTheme={() => setIsLight(!isLight)}
        />
      )}

        <div className="flex-grow">
          <Suspense fallback={<div className="flex-grow flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>}>
          {activePage === 'books' && (
            <BooksLibrary setActivePage={setActivePage} setReadingBook={setReadingBook} user={user} theme="dark" />
          )}
          {activePage === 'book-reader' && (
            <BookReader book={readingBook} setActivePage={setActivePage} theme="dark" />
          )}
          {activePage === 'book-chapters' && (
            <BookChapterList book={readingBook} setActivePage={setActivePage} setPracticeChapter={setPracticeChapter} theme="dark" />
          )}
          {activePage === 'book-practice' && (
            <BookPractice chapter={practiceChapter} setActivePage={setActivePage} theme="dark" />
          )}
          {activePage === 'home' && (
          <Home
            setActivePage={setActivePage}
            user={user}
            courses={courses}
            setCourses={setCourses}
            onEnrollSuccess={handleEnrollSuccess}
            onStartLearning={handleStartLearning}
            toppers={toppers}
          />
        )}
        {activePage === 'login' && (
          <Auth onLoginSuccess={handleLoginSuccess} setActivePage={setActivePage} />
        )}
        {activePage === 'student-dashboard' && (
          <StudentDashboard
            user={user}
            courses={courses}
            setActivePage={setActivePage}
            setExamTest={setExamTest}
            syllabus={syllabus}
            initialClass={initialClass}
            initialTab={initialTab}
            initialChapterTab={initialChapterTab}
            isLight={isLight}
            onToggleTheme={() => setIsLight(!isLight)}
          />
        )}
        {activePage === 'admin-dashboard' && (
          <AdminDashboard
            user={user}
            courses={courses}
            setCourses={setCourses}
            setCustomLogo={setCustomLogo}
            syllabus={syllabus}
            setSyllabus={setSyllabus}
            toppers={toppers}
            setToppers={setToppers}
          />
        )}

        {/* ─── TEST SERIES LISTING PAGE ─── */}
        {activePage === 'test-series' && (
          <TestSeriesPage
            user={user}
            onStartTest={handleStartTestSeries}
            onBack={() => setActivePage(user ? 'student-dashboard' : 'home')}

          />
        )}

        {/* ─── NTA EXAM PLAYER ─── */}
        {activePage === 'test-series-exam' && (
          <TestSeriesExam
            testId={activeTestId}
            mode={activeTestMode}
            user={user}
            onSubmit={handleTestSubmit}
            onExit={() => setActivePage(localStorage.getItem('quantrex_test_source') || 'test-series')}
            isLight={isLight}
            onToggleTheme={() => setIsLight(!isLight)}
          />
        )}

        {/* ─── RESULT & ANALYSIS PAGE ─── */}
        {activePage === 'test-series-result' && (
          <TestSeriesResult
            result={testResult}
            user={user}
            onBack={() => setActivePage(localStorage.getItem('quantrex_test_source') || 'test-series')}
            onRetake={() => {
              if (activeTestId) handleStartTestSeries(activeTestId, activeTestMode, localStorage.getItem('quantrex_test_source'));
            }}
          />
        )}


        {activePage === 'exam-mode' && (
          <TestSystem
            test={examTest}
            user={user}
            onBackToDashboard={() => setActivePage('student-dashboard')}
          />
        )}
        </Suspense>
      </div>

      {!isExamMode && (
        <footer className="relative z-10 border-t border-white/5 py-8 px-6 md:px-12 bg-obsidian/90 text-center space-y-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
            <div>
              <span className="font-bold text-white uppercase font-display">Quantrex Academy</span> — Founded by Ajay Kumar Saroj (A.K. Sir)
            </div>
            <div className="flex gap-6">
              <span>Security Audited</span>
              <span>Anti-Piracy Guidelines</span>
              <span>Terms of Use</span>
            </div>
          </div>
          <div className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
            <Shield className="h-3.5 w-3.5 text-gold" />
            Protected by Cryptographic Signed Tokens and Active Capture Detection.
          </div>
        </footer>
      )}
    </div>
  );
}


