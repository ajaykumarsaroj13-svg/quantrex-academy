import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MathCanvas from './components/MathCanvas';
import Home from './pages/Home';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NtaTestInterface from './pages/NtaTestInterface';
import ExamGoalPlatform from './pages/ExamGoalPlatform';
import ExamGoalPracticeInterface from './pages/ExamGoalPracticeInterface';
import TestSystem from './pages/TestSystem';
import TestSeriesPage from './pages/TestSeriesPage';
import TestSeriesExam from './pages/TestSeriesExam';
import TestSeriesResult from './pages/TestSeriesResult';
import MarksPortal from './pages/MarksPortal/MarksPortal';
import { Shield } from 'lucide-react';
import { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } from './utils/syllabusData';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [examTest, setExamTest] = useState(null);
  const [customLogo, setCustomLogo] = useState(localStorage.getItem('custom_logo') || null);
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeTestMode, setActiveTestMode] = useState('exam'); // 'exam' | 'practice'
  const [testResult, setTestResult] = useState(null);

  const [syllabus, setSyllabus] = useState(() => {
    const saved = localStorage.getItem('quantrex_syllabus_v2');
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

  useEffect(() => {
    localStorage.setItem('quantrex_syllabus_v2', JSON.stringify(syllabus));
  }, [syllabus]);

  useEffect(() => {
    localStorage.setItem('quantrex_toppers_v2', JSON.stringify(toppers));
  }, [toppers]);

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
    setActivePage('home');
  };

  const handleEnrollSuccess = (courseId) => {
    if (!user) return;
    const updatedUser = { ...user, purchasedCourses: [...(user.purchasedCourses || []), courseId] };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Handler: Start a full test series exam
  const handleStartTestSeries = (testId, mode = 'exam') => {
    setActiveTestId(testId);
    setActiveTestMode(mode);
    setTestResult(null);
    setActivePage('test-series-exam');
  };

  // Handler: Test submitted — show result
  const handleTestSubmit = (result) => {
    setTestResult(result);
    setActivePage('test-series-result');
  };

  const isExamMode = activePage === 'exam-mode' || activePage === 'examgoal-test'
    || activePage === 'examgoal-practice' || activePage === 'test-series-exam';
  const isPlatformMode = activePage === 'examgoal-platform';

  return (
    <div className="relative min-h-screen bg-obsidian flex flex-col justify-between">
      <MathCanvas />

      {!isExamMode && !isPlatformMode && (
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
          onLogout={handleLogout}
          customLogo={customLogo}
        />
      )}

      <div className="flex-grow">
        {activePage === 'home' && (
          <Home
            setActivePage={setActivePage}
            user={user}
            courses={courses}
            setCourses={setCourses}
            onEnrollSuccess={handleEnrollSuccess}
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

        {/* ─── MARKS PORTAL ─── */}
        {activePage === 'marks-portal' && (
          <MarksPortal
            user={user}
            setActivePage={setActivePage}
          />
        )}

        {/* ─── NTA EXAM PLAYER ─── */}
        {activePage === 'test-series-exam' && (
          <TestSeriesExam
            testId={activeTestId}
            mode={activeTestMode}
            user={user}
            onSubmit={handleTestSubmit}
            onExit={() => setActivePage('test-series')}
          />
        )}

        {/* ─── RESULT & ANALYSIS PAGE ─── */}
        {activePage === 'test-series-result' && (
          <TestSeriesResult
            result={testResult}
            user={user}
            onBack={() => setActivePage('test-series')}
            onRetake={() => {
              if (activeTestId) handleStartTestSeries(activeTestId, activeTestMode);
            }}
          />
        )}

        {/* ─── EXISTING EXAMGOAL PLATFORM ─── */}
        {(activePage === 'examgoal-platform' || activePage === 'examgoal-test' || activePage === 'examgoal-practice') && (
          <div className={activePage === 'examgoal-platform' ? 'block' : 'hidden'}>
            <ExamGoalPlatform
              user={user}
              onBack={() => setActivePage('student-dashboard')}
              onStartTest={(testData) => { setExamTest(testData); setActivePage('examgoal-test'); }}
              onStartPractice={(testData) => { setExamTest(testData); setActivePage('examgoal-practice'); }}
            />
          </div>
        )}
        {(activePage === 'examgoal-test' || activePage === 'examgoal-practice') ? (
          <ExamGoalPracticeInterface
            test={examTest}
            user={user}
            onBackToDashboard={() => setActivePage('examgoal-platform')}
          />
        ) : null}
        {activePage === 'exam-mode' && (
          <TestSystem
            test={examTest}
            user={user}
            onBackToDashboard={() => setActivePage('student-dashboard')}
          />
        )}
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
