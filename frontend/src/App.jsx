import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MathCanvas from './components/MathCanvas';
import Home from './pages/Home';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TestSystem from './pages/TestSystem';
import { Shield } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [examTest, setExamTest] = useState(null);

  // Parse user object from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Fetch courses from backend or load default mock courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Fallback defaults
      setCourses([
        {
          id: 'course1',
          title: 'Rank Booster JEE Advanced Mathematics 2027',
          description: 'Master Calculus, Coordinate Geometry, and Algebra with A.K. Sir. Includes video lectures, notes, assignments, and test series.',
          price: 4999,
          originalPrice: 14999,
          coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
          tag: 'JEE Advanced',
          rating: 4.95,
          modules: [
            {
              id: 'mod1',
              title: 'Module 1: Differential Calculus',
              chapters: [
                {
                  id: 'ch1',
                  title: 'Chapter 1: Limits & Continuity',
                  videos: [
                    { id: 'v1', title: '1.1 Concept of Limits & Indeterminate Forms', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: '20:15', isDemo: true },
                    { id: 'v2', title: '1.2 Sandwich Theorem & L\'Hopital\'s Rule', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: '25:40', isDemo: false }
                  ],
                  pdfs: [
                    { id: 'p1', title: 'Limits Standard Formulas Sheet', url: '/pdfs/limits_formulas.pdf', size: '2.4 MB' },
                    { id: 'p2', title: 'DPP-01: Limits and Graphing Method', url: '/pdfs/dpp_01.pdf', size: '1.1 MB' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'course2',
          title: 'Complete Algebra & Matrices for JEE Main + Advanced',
          description: 'Comprehensive course covering Matrices, Determinants, Complex Numbers, and Permutations. Designed by Ajay Kumar Saroj (A.K. Sir).',
          price: 3999,
          originalPrice: 9999,
          coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
          tag: 'JEE Main & Advanced',
          rating: 4.88,
          modules: []
        }
      ]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Poll notifications/schedules real-time sync simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (activePage === 'student-dashboard' && user) {
        // simulated live notification or new module sync alert
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
    const updatedUser = {
      ...user,
      purchasedCourses: [...(user.purchasedCourses || []), courseId]
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isExamMode = activePage === 'exam-mode';

  return (
    <div className="relative min-h-screen bg-obsidian flex flex-col justify-between">
      {/* Dynamic background canvas */}
      <MathCanvas />

      {/* Render Navbar only outside active Exam Player */}
      {!isExamMode && (
        <Navbar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}

      {/* Primary Route Container */}
      <div className="flex-grow">
        {activePage === 'home' && (
          <Home 
            setActivePage={setActivePage} 
            user={user} 
            courses={courses}
            setCourses={setCourses}
            onEnrollSuccess={handleEnrollSuccess} 
          />
        )}
        {activePage === 'login' && (
          <Auth 
            onLoginSuccess={handleLoginSuccess} 
            setActivePage={setActivePage} 
          />
        )}
        {activePage === 'student-dashboard' && (
          <StudentDashboard 
            user={user} 
            courses={courses} 
            setActivePage={setActivePage}
            setExamTest={setExamTest}
          />
        )}
        {activePage === 'admin-dashboard' && (
          <AdminDashboard 
            user={user} 
            courses={courses}
            setCourses={setCourses}
          />
        )}
        {activePage === 'exam-mode' && (
          <TestSystem 
            test={examTest} 
            user={user} 
            onBackToDashboard={() => setActivePage('student-dashboard')}
          />
        )}
      </div>

      {/* Footer Branding section */}
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
