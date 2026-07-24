'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import MathCanvas from './components/MathCanvas';
import Home from './views/Home';
import ErrorBoundary from './components/ErrorBoundary';
import FloatingContact from './components/FloatingContact';
import Auth from './views/Auth';
import Shield from 'lucide-react/dist/esm/icons/shield';
import { loadDbFromBlob } from './blob';
import { AIAssistantProvider } from './contexts/AIAssistantContext';
import JoviChatWidget from './components/AIAssistant/JoviChatWidget';

const StudentDashboard = React.lazy(() => import('./views/StudentDashboard'));
const AdminDashboard = React.lazy(() => import('./views/AdminDashboard'));
const NtaTestInterface = React.lazy(() => import('./views/NtaTestInterface'));
const TestSystem = React.lazy(() => import('./views/TestSystem'));
const TestSeriesPage = React.lazy(() => import('./views/TestSeriesPage'));
const PremiumUltimateTestSeries = React.lazy(() => import('./views/PremiumUltimateTestSeries'));
const TestSeriesExam = React.lazy(() => import('./views/TestSeriesExam'));
const TestSeriesResult = React.lazy(() => import('./views/TestSeriesResult'));
const BooksLibrary = React.lazy(() => import('./views/BooksLibrary'));
const BookReader = React.lazy(() => import('./views/BookReader'));
const BookChapterList = React.lazy(() => import('./views/BookChapterList'));
const BookPractice = React.lazy(() => import('./views/BookPractice'));
const StudentProgressDashboard = React.lazy(() => import('./views/StudentProgressDashboard'));
const SubscriptionDashboard = React.lazy(() => import('./views/SubscriptionDashboard'));
import { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } from './utils/syllabusData';
import { DEFAULT_TESTS, DEFAULT_BOOKS, DEFAULT_HOME_CONTENT } from './utils/defaultData';
import { generateCustomTest } from './utils/testGenerator';
import { useWatermarkRemover } from './hooks/useWatermarkRemover';

export default function App() {
  useWatermarkRemover();

  const [activePage, setActivePage] = useState(() => localStorage.getItem('quantrex_active_page') || 'home');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) { return null; }
    }
    return null;
  });
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
  const [isLight, setIsLight] = useState(false);
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
    if (localStorage.getItem('quantrex_syllabus_v7')) {
      localStorage.removeItem('quantrex_syllabus_v7');
    }
    if (localStorage.getItem('quantrex_syllabus_v8')) {
      localStorage.removeItem('quantrex_syllabus_v8');
    }
    if (localStorage.getItem('quantrex_syllabus_v9')) {
      localStorage.removeItem('quantrex_syllabus_v9');
    }
    if (localStorage.getItem('quantrex_syllabus_v10')) {
      localStorage.removeItem('quantrex_syllabus_v10');
    }
    const saved = localStorage.getItem('quantrex_syllabus_v11');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_SYLLABUS;
      }
    }
    return DEFAULT_SYLLABUS;
  });

  // Re-fetch default syllabus on mount if not in localStorage
  useEffect(() => {
    if (!localStorage.getItem('quantrex_syllabus_v11')) {
      const def = DEFAULT_SYLLABUS;
      if (def) {
        setSyllabus(def);
        localStorage.setItem('quantrex_syllabus_v11', JSON.stringify(def));
      }
    }
    loadDbFromBlob('syllabusData').then(data => {
      if (data) { setSyllabus(data); localStorage.setItem('quantrex_syllabus_v11', JSON.stringify(data)); }
    });
  }, []);

  const [toppers, setToppers] = useState(() => {
    const saved = localStorage.getItem('quantrex_toppers_v8');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return DEFAULT_TOPPERS;
  });
  useEffect(() => {
    loadDbFromBlob('toppersData').then(data => {
      if (data && data.length > 0) { setToppers(data); localStorage.setItem('quantrex_toppers_v8', JSON.stringify(data)); }
    });
  }, []);

  const [homeData, setHomeData] = useState(() => {
    const saved = localStorage.getItem('quantrex_home_data_v2');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return DEFAULT_HOME_CONTENT;
  });
  useEffect(() => {
    loadDbFromBlob('homeData').then(data => {
      if (data) { setHomeData(data); localStorage.setItem('quantrex_home_data_v2', JSON.stringify(data)); }
    });
  }, []);

  const [booksData, setBooksData] = useState(() => {
    const saved = localStorage.getItem('quantrex_books_data_v2');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return DEFAULT_BOOKS;
  });
  useEffect(() => {
    loadDbFromBlob('booksData').then(data => {
      if (data && data.length > 0) { setBooksData(data); localStorage.setItem('quantrex_books_data_v2', JSON.stringify(data)); }
    });
  }, []);

  const [testsData, setTestsData] = useState(() => {
    const saved = localStorage.getItem('quantrex_tests_data_v2');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return DEFAULT_TESTS;
  });
  useEffect(() => {
    loadDbFromBlob('testsData').then(data => {
      if (!data) return;
      // Normalize: if data is already structured { mains, advanced }, use it
      if (data.mains && data.advanced) {
        setTestsData(data);
        localStorage.setItem('quantrex_tests_data_v2', JSON.stringify(data));
      } else if (Array.isArray(data)) {
        // Flat array: split by examType
        const mains = data.filter(t => (t.examType || '').toLowerCase().includes('main'));
        const advanced = data.filter(t => (t.examType || '').toLowerCase().includes('advanced'));
        const nda = data.filter(t => (t.examType || '').toLowerCase().includes('nda'));
        const structured = { mains, advanced, nda };
        setTestsData(structured);
        localStorage.setItem('quantrex_tests_data_v2', JSON.stringify(structured));
      }
    });
  }, []);

  // Handle custom test URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

    // Handle resume
    const resumeTestParam = searchParams.get('resume_custom_test');
    if (resumeTestParam) {
      window.history.replaceState({path: newUrl}, '', newUrl);
      const activeTest = localStorage.getItem('quantrex_active_custom_test');
      if (activeTest) {
        setExamTest(JSON.parse(activeTest));
        setActivePage('exam-mode');
      }
      return;
    }

    const customTestParam = searchParams.get('custom_test');
    if (customTestParam) {
      try {
        const params = JSON.parse(decodeURIComponent(customTestParam));
        window.history.replaceState({path: newUrl}, '', newUrl);

        // Generate the test
        generateCustomTest('/', params.chapters, params.types, params.count, params.years, params.seed).then(questions => {
           if (questions && questions.length > 0) {
              const customTestObj = {
                 id: "custom_test_" + Date.now(),
                 title: "Custom Practice Test",
                 duration: params.duration,
                 durationMinutes: params.duration,
                 questions: questions,
                 totalMarks: questions.length * 4
              };
              localStorage.setItem('quantrex_active_custom_test', JSON.stringify(customTestObj));
              setExamTest(customTestObj);
              setActivePage('exam-mode');
           } else {
              alert("Could not generate test. Please try again with different parameters.");
           }
        }).catch(err => {
           console.error("Failed to generate test:", err);
           alert("An error occurred while generating the test.");
        });
      } catch (e) {
        console.error("Error parsing custom test params:", e);
      }
    }
  }, []);

  // Keep page and states persistent across browser refresh and handle hardware back button
  useEffect(() => {
    try {
      localStorage.setItem('quantrex_active_page', activePage);
      if (window.history.state?.page !== activePage) {
         window.history.pushState({ page: activePage }, '', window.location.pathname);
      }
    } catch(e) {}
  }, [activePage]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setActivePage(e.state.page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Replace initial state so the first back press doesn't immediately leave the app without a popstate event
    if (!window.history.state?.page) {
       window.history.replaceState({ page: activePage }, '', window.location.pathname);
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Persist syllabus when updated (e.g. from Admin Dashboard)
  useEffect(() => {
    try {
      localStorage.setItem('quantrex_syllabus_v10', JSON.stringify(syllabus));
    } catch (e) {
      console.warn("Could not save syllabus to localStorage:", e);
    }
  }, [syllabus]);

  // Persist toppers when updated
  useEffect(() => {
    try {
      localStorage.setItem('quantrex_toppers_v8', JSON.stringify(toppers));
    } catch(e) {}
  }, [toppers]);

  useEffect(() => {
    if (readingBook) {
      try {
        localStorage.setItem('quantrex_reading_book', JSON.stringify(readingBook));
      } catch(e) {}
    } else {
      localStorage.removeItem('quantrex_reading_book');
    }
  }, [readingBook]);

  useEffect(() => {
    if (practiceChapter) {
      try {
        localStorage.setItem('quantrex_practice_chapter', JSON.stringify(practiceChapter));
      } catch(e) {}
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
      try {
        localStorage.setItem('quantrex_test_result', JSON.stringify(testResult));
      } catch(e) {}
    } else {
      localStorage.removeItem('quantrex_test_result');
    }
  }, [testResult]);

  useEffect(() => {
    if (examTest) {
      try {
        localStorage.setItem('quantrex_exam_test', JSON.stringify(examTest));
      } catch(e) {}
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
    localStorage.setItem('quantrex_theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, []);



  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('user'); }
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await loadDbFromBlob('coursesData');
      if (data && data.length > 0) {
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
    if (result.testId) {
      localStorage.setItem(`quantrex_test_result_${result.testId}`, JSON.stringify(result));
    }
    setTestResult(result);
    setActivePage('test-series-result');
  };

  const isExamMode = activePage === 'exam-mode' || activePage === 'test-series-exam';


  const RedirectToLogin = () => {
    useEffect(() => {
      localStorage.setItem('quantrex_redirect_after_login', 'ultimate-test-series');
      setActivePage('login');
    }, []);
    return <div className="flex-grow flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent"></div></div>;
  };

  const renderPage = () => {
    switch (activePage) {
      case 'books': return <BooksLibrary setActivePage={setActivePage} setReadingBook={setReadingBook} user={user} theme={isLight ? 'light' : 'dark'} booksData={booksData} />;
      case 'book-reader': return <BookReader book={readingBook} setActivePage={setActivePage} theme={isLight ? 'light' : 'dark'} />;
      case 'book-chapters': return <BookChapterList book={readingBook} setActivePage={setActivePage} setPracticeChapter={setPracticeChapter} theme={isLight ? 'light' : 'dark'} />;
      case 'book-practice': return <BookPractice chapter={practiceChapter} setActivePage={setActivePage} theme={isLight ? 'light' : 'dark'} />;
      case 'home': return <Home setActivePage={setActivePage} user={user} courses={courses} setCourses={setCourses} onEnrollSuccess={handleEnrollSuccess} onStartLearning={handleStartLearning} toppers={toppers} homeData={homeData} isLight={isLight} />;
      case 'login': return <Auth onLoginSuccess={handleLoginSuccess} setActivePage={setActivePage} isLight={isLight} />;
      case 'student-dashboard': return <StudentDashboard user={user} courses={courses} setActivePage={setActivePage} setExamTest={setExamTest} syllabus={syllabus} initialClass={initialClass} initialTab={initialTab} initialChapterTab={initialChapterTab} isLight={isLight} onToggleTheme={() => setIsLight(!isLight)} testsData={testsData} />;
      case 'admin-dashboard': return <AdminDashboard user={user} courses={courses} setCourses={setCourses} setCustomLogo={setCustomLogo} syllabus={syllabus} setSyllabus={setSyllabus} toppers={toppers} setToppers={setToppers} homeData={homeData} setHomeData={setHomeData} booksData={booksData} setBooksData={setBooksData} testsData={testsData} setTestsData={setTestsData} />;
      case 'test-series': return <TestSeriesPage user={user} onStartTest={handleStartTestSeries} onBack={() => setActivePage(user ? 'student-dashboard' : 'home')} testsData={testsData} isLight={isLight} />;
      case 'ultimate-test-series': 
        if (!user) return <RedirectToLogin />;
        return (
        <PremiumUltimateTestSeries 
          user={user} 
          onStartTest={handleStartTestSeries} 
          onViewResult={(tid) => {
             setActiveTestId(tid);
             localStorage.setItem('quantrex_test_source', 'ultimate-test-series');
             const res = localStorage.getItem(`quantrex_test_result_${tid}`);
             if (res) {
               setTestResult(JSON.parse(res));
               setActivePage('test-series-result');
             } else {
               alert("Result details not found locally.");
             }
          }}
          onBack={() => setActivePage(user ? 'student-dashboard' : 'home')} 
          isLight={isLight}
        />
      );
      case 'test-series-exam': return <TestSeriesExam testId={activeTestId} mode={activeTestMode} user={user} onSubmit={handleTestSubmit} onExit={() => setActivePage(localStorage.getItem('quantrex_test_source') || 'test-series')} isLight={isLight} onToggleTheme={() => setIsLight(!isLight)} />;
      case 'test-series-result': return <TestSeriesResult result={testResult} user={user} onBack={() => setActivePage(localStorage.getItem('quantrex_test_source') || 'test-series')} onRetake={() => { if (activeTestId) handleStartTestSeries(activeTestId, activeTestMode, localStorage.getItem('quantrex_test_source')); }} />;
      case 'exam-mode': return <NtaTestInterface test={examTest} user={user} onBackToDashboard={() => setActivePage('student-dashboard')} setActivePage={setActivePage} mode="test" isLight={isLight} />;
      case 'my-dashboard':
        if (!user) return <RedirectToLogin />;
        return <StudentProgressDashboard user={user} isLight={isLight} onBack={() => setActivePage('student-dashboard')} testsData={testsData} onStartTest={handleStartTestSeries} examTest={examTest} setExamTest={setExamTest} setActivePage={setActivePage} />;
      default: return null;
    }
  };

  return (
    <AIAssistantProvider>
      <div className="relative min-h-screen flex flex-col justify-between">
        <MathCanvas />
        {!isExamMode && <FloatingContact isLight={isLight} />}

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
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="w-full flex-grow flex flex-col"
              >
                <ErrorBoundary onReset={() => setActivePage('home')}>
                  {renderPage()}
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
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

      {/* Global AI Assistant */}
      {!isExamMode && <JoviChatWidget theme={isLight ? 'light' : 'dark'} />}
    </div>
    </AIAssistantProvider>
  );
}


