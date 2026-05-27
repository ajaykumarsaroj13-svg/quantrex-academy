import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Bot, BarChart2, Flame, Award, Download, Clock, ShieldCheck, PlayCircle, Send, AlertTriangle } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import PdfViewer from '../components/PdfViewer';

export default function StudentDashboard({ user, courses, setActivePage, setExamTest }) {
  const [activeTab, setActiveTab] = useState('courses'); // courses, live, tests, ai-analytics, doubts, leaderboard
  const [purchasedList, setPurchasedList] = useState([]);
  
  // Lecture player states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [playerTab, setPlayerTab] = useState('video'); // video, notes
  
  // AI Doubt Solver states
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtChat, setDoubtChat] = useState([
    { role: 'ai', text: 'Hello! I am your Quantrex AI Math Mentor. Ask me any IIT-JEE Mathematics equation or problem from Calculus, Geometry, or Algebra.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Available tests list
  const [tests, setTests] = useState([]);

  // Fetch student courses and tests
  useEffect(() => {
    // Filter courses purchased by student
    const list = courses.filter(c => user?.purchasedCourses?.includes(c.id));
    setPurchasedList(list);

    // Fetch tests
    fetch('/api/tests', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setTests(data))
      .catch(() => {
        // Mock tests fallback
        setTests([
          {
            id: 'test1',
            title: 'Calculus Mega Test 01 (JEE Advanced)',
            description: 'Limits, Continuity, Differentiability. Negative marking +4/-1',
            durationMinutes: 30
          }
        ]);
      });
  }, [courses, user]);

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
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-electric to-blue-600 border border-electric/40 flex items-center justify-center text-3xl font-bold font-display text-white mb-4">
              {user?.name?.charAt(0)}
            </div>
            <h3 className="text-white font-bold text-lg tracking-wide leading-tight">{user?.name}</h3>
            <span className="text-[10px] text-gold font-mono uppercase tracking-widest mt-1">JEE Mathematics Aspirant</span>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3.5 text-xs font-mono">
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
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-row lg:flex-col justify-around">
          {[
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'live', label: 'Live Classes', icon: Clock },
            { id: 'tests', label: 'Mock Tests', icon: Award },
            { id: 'ai-analytics', label: 'AI Strengths', icon: BarChart2 },
            { id: 'doubts', label: 'AI Doubt Solver', icon: Bot }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedVideo(null); }}
                className={`w-full py-4 px-4 text-xs font-bold tracking-wider uppercase text-left transition-colors flex items-center gap-2.5 ${activeTab === item.id ? 'bg-obsidian border-l-2 border-electric text-electric' : 'text-gray-400 hover:text-white'}`}
              >
                <Icon className="h-4.5 w-4.5" />
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
                <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-2">
                  <h4 className="text-white font-bold text-base">{selectedVideo.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-mono">
                    Ensure complete attention. Dynamic security watermark containing your name and credentials rotates automatically. Inspect elements and downloads are blocked in compliance with Quantrex piracy detection terms.
                  </p>
                </div>
              </div>
            ) : (
              selectedPdf && (
                <PdfViewer 
                  pdfUrl={selectedPdf.url} 
                  pdfTitle={selectedPdf.title} 
                  studentInfo={user} 
                  onReportBreach={handleSecurityBreach}
                />
              )
            )}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl border border-white/5 min-h-[60vh] space-y-6">
            
            {/* MY COURSES TAB */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">My Enrolled Courses</h3>
                
                {purchasedList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-xl space-y-4">
                    <BookOpen className="h-12 w-12 text-gray-600" />
                    <h5 className="text-white font-bold text-sm uppercase">No purchased courses</h5>
                    <p className="text-gray-400 text-xs font-mono max-w-sm">You haven't enrolled in any packages. Explore courses on the landing page to start learning!</p>
                    <button 
                      onClick={() => setActivePage('home')}
                      className="px-6 py-2.5 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-xs rounded-lg transition-colors"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchasedList.map((course) => (
                      <div key={course.id} className="p-5 bg-cyberdark border border-white/5 rounded-xl space-y-4 hover:border-electric/30 transition-all">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-white font-bold text-base">{course.title}</h4>
                            <p className="text-[10px] text-gold font-mono mt-0.5 uppercase tracking-wider">{course.tag} • Ajay Kumar Saroj</p>
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-mono">ACTIVE</span>
                        </div>

                        {/* Modules & Chapter listings */}
                        {course.modules && course.modules.length > 0 ? (
                          <div className="space-y-2 pl-3 border-l border-white/10">
                            {course.modules.map((m, mIdx) => (
                              <div key={mIdx} className="space-y-1.5">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">{m.title}</span>
                                {m.chapters && m.chapters.map((ch, chIdx) => (
                                  <div key={chIdx} className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-obsidian border border-white/5 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Video className="h-4 w-4 text-electric shrink-0" />
                                      <span className="text-xs font-semibold text-platinum">{ch.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {ch.videos && ch.videos.map((vid, vIdx) => (
                                        <button
                                          key={vIdx}
                                          onClick={() => handleSelectLecture(course, vid)}
                                          className="px-3 py-1 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-[10px] uppercase rounded flex items-center gap-1 transition-colors"
                                        >
                                          <PlayCircle className="h-3.5 w-3.5" />
                                          Play Lecture
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-500 font-mono">No lectures uploaded yet. Live syncing active.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">JEE Test Series Portal</h3>
                
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
