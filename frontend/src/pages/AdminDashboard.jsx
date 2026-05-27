import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Bell, AlertOctagon, TrendingUp, Lock, ShieldAlert, Ban, Check, DollarSign, PlusCircle, Sparkles, Trash2, Calendar, FileText, Play, Plus, Book } from 'lucide-react';

export default function AdminDashboard({ user, courses, setCourses, setCustomLogo, syllabus, setSyllabus, toppers, setToppers }) {
  const [adminTab, setAdminTab] = useState('revenue'); // revenue, students, course-manager, security, notice, settings
  
  // Dashboard Metric States
  const [metrics, setMetrics] = useState({
    totalRevenue: 28990,
    activeStudents: 154,
    purchasedCount: 42,
    activeStreams: 2,
    recentOrders: []
  });
  
  const [students, setStudents] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  
  // Syllabus state controls
  const [selectedClass, setSelectedClass] = useState('jee-advanced');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  
  // Resource upload fields
  const [resType, setResType] = useState('video'); // video, pdf, formula, pyq
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resDetail, setResDetail] = useState(''); // duration, size, or formula content
  const [restrictDownload, setRestrictDownload] = useState(true);
  
  // Toppers fields
  const [topperName, setTopperName] = useState('');
  const [topperRank, setTopperRank] = useState('');
  const [topperScore, setTopperScore] = useState('');
  const [topperYear, setTopperYear] = useState('');
  const [topperPhoto, setTopperPhoto] = useState('');
  
  // Mock Test Builder state
  const [mockTestTitle, setMockTestTitle] = useState('');
  const [mockTestDuration, setMockTestDuration] = useState(60);
  const [mockTestType, setMockTestType] = useState('link'); // link, structured
  const [mockTestLink, setMockTestLink] = useState('');
  
  // Structured Mock Test questions builder array
  const [questions, setQuestions] = useState([]);
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qMarks, setQMarks] = useState(4);
  const [qNegMarks, setQNegMarks] = useState(-1);
  const [qExplanation, setQExplanation] = useState('');

  // Course creation inputs (legacy course manager)
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [coursePrice, setCoursePrice] = useState(4999);
  
  // Chapter creation inputs (legacy course manager)
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [newModuleName, setNewModuleName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  // Notification inputs
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');

  // Syllabus resource management handlers
  const handleAddResource = (e) => {
    e.preventDefault();
    if (!selectedChapterId) {
      alert('Please select a chapter folder first!');
      return;
    }
    if (!resTitle) {
      alert('Please enter a title!');
      return;
    }
    
    let resource = null;
    if (resType === 'video') {
      resource = {
        id: 'vid_' + Math.random().toString(36).substr(2, 9),
        title: resTitle,
        url: resUrl || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
        duration: resDetail || '30:00',
        downloadBlocked: restrictDownload
      };
    } else if (resType === 'pdf') {
      resource = {
        id: 'pdf_' + Math.random().toString(36).substr(2, 9),
        title: resTitle,
        url: resUrl || '/pdfs/dpp.pdf',
        size: resDetail || '1.5 MB',
        downloadBlocked: restrictDownload
      };
    } else if (resType === 'formula') {
      resource = {
        id: 'form_' + Math.random().toString(36).substr(2, 9),
        title: resTitle,
        content: resDetail || 'Quick formulas sheet text.'
      };
    } else if (resType === 'pyq') {
      resource = {
        id: 'pyq_' + Math.random().toString(36).substr(2, 9),
        title: resTitle,
        year: resDetail || '2025',
        url: resUrl || '/pdfs/pyq.pdf'
      };
    }
    
    const updatedSyllabus = { ...syllabus };
    const classData = updatedSyllabus[selectedClass];
    if (classData) {
      classData.chapters = classData.chapters.map(ch => {
        if (ch.id === selectedChapterId) {
          if (resType === 'video') ch.videos = [...(ch.videos || []), resource];
          if (resType === 'pdf') ch.pdfs = [...(ch.pdfs || []), resource];
          if (resType === 'formula') ch.formulas = [...(ch.formulas || []), resource];
          if (resType === 'pyq') ch.pyqs = [...(ch.pyqs || []), resource];
        }
        return ch;
      });
      setSyllabus(updatedSyllabus);
      alert(`Published ${resType.toUpperCase()} content into selected chapter successfully!`);
      setResTitle('');
      setResUrl('');
      setResDetail('');
    }
  };

  const handleDeleteResource = (chapterId, type, resId) => {
    const updatedSyllabus = { ...syllabus };
    const classData = updatedSyllabus[selectedClass];
    if (classData) {
      classData.chapters = classData.chapters.map(ch => {
        if (ch.id === chapterId) {
          if (type === 'video') ch.videos = ch.videos.filter(v => v.id !== resId);
          if (type === 'pdf') ch.pdfs = ch.pdfs.filter(p => p.id !== resId);
          if (type === 'formula') ch.formulas = ch.formulas.filter(f => f.id !== resId);
          if (type === 'pyq') ch.pyqs = ch.pyqs.filter(p => p.id !== resId);
        }
        return ch;
      });
      setSyllabus(updatedSyllabus);
      alert('Resource deleted successfully from folder.');
    }
  };

  // Mock Test Builder handlers
  const handleAddQuestion = () => {
    if (!qText || qOptions.some(o => o.trim() === '')) {
      alert('Please fill out the question text and all 4 choices!');
      return;
    }
    const newQ = {
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      questionText: qText,
      options: [...qOptions],
      correctOption: parseInt(qCorrect),
      marks: parseInt(qMarks),
      negativeMarks: parseInt(qNegMarks),
      subject: 'Mathematics',
      explanation: qExplanation
    };
    setQuestions([...questions, newQ]);
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
    setQExplanation('');
    alert('Question registered in mock test builder buffer!');
  };

  const handlePublishMockTest = (e) => {
    e.preventDefault();
    if (!selectedChapterId) {
      alert('Please select a chapter folder first!');
      return;
    }
    if (!mockTestTitle) {
      alert('Enter Mock Test Exam Name!');
      return;
    }

    let mockTestObj = {
      id: 'mock_' + Math.random().toString(36).substr(2, 9),
      title: mockTestTitle,
      durationMinutes: parseInt(mockTestDuration),
      type: mockTestType
    };

    if (mockTestType === 'link') {
      if (!mockTestLink) {
        alert('Paste AI Generated Quiz / external link!');
        return;
      }
      mockTestObj.linkUrl = mockTestLink;
    } else {
      if (questions.length === 0) {
        alert('Builder requires at least 1 question for structured mode!');
        return;
      }
      mockTestObj.questions = questions;
    }

    const updatedSyllabus = { ...syllabus };
    const classData = updatedSyllabus[selectedClass];
    if (classData) {
      classData.chapters = classData.chapters.map(ch => {
        if (ch.id === selectedChapterId) {
          ch.mockTests = [...(ch.mockTests || []), mockTestObj];
        }
        return ch;
      });
      setSyllabus(updatedSyllabus);
      alert('Published Mock Test successfully! Synced to student exam dashboards.');
      setMockTestTitle('');
      setMockTestLink('');
      setQuestions([]);
    }
  };

  const handleDeleteMockTest = (chapterId, testId) => {
    const updatedSyllabus = { ...syllabus };
    const classData = updatedSyllabus[selectedClass];
    if (classData) {
      classData.chapters = classData.chapters.map(ch => {
        if (ch.id === chapterId) {
          ch.mockTests = (ch.mockTests || []).filter(t => t.id !== testId);
        }
        return ch;
      });
      setSyllabus(updatedSyllabus);
      alert('Mock Test deleted successfully.');
    }
  };

  // Topper/Results Handlers
  const handleAddTopper = (e) => {
    e.preventDefault();
    if (!topperName || !topperRank || !topperScore) {
      alert('Please enter Name, Rank/Percentile, and Score!');
      return;
    }
    const newTopper = {
      id: 'topper_' + Math.random().toString(36).substr(2, 9),
      name: topperName,
      rank: topperRank,
      score: topperScore,
      year: topperYear || 'JEE Advanced 2026',
      photo: topperPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'
    };
    setToppers([...toppers, newTopper]);
    setTopperName('');
    setTopperRank('');
    setTopperScore('');
    setTopperYear('');
    setTopperPhoto('');
    alert('Topper result published live to the Hall of Fame!');
  };

  const handleDeleteTopper = (topperId) => {
    setToppers(toppers.filter(t => t.id !== topperId));
    alert('Topper deleted from Hall of Fame.');
  };

  // Fetch dashboards data
  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const revRes = await fetch('/api/admin/revenue', { headers });
      if (revRes.ok) setMetrics(await revRes.ok ? await revRes.json() : metrics);

      const studRes = await fetch('/api/admin/students', { headers });
      if (studRes.ok) setStudents(await studRes.json());

      const secRes = await fetch('/api/admin/security/alerts', { headers });
      if (secRes.ok) setSecurityAlerts(await secRes.json());
    } catch (e) {
      // Mock Fallback when server is not running
      setStudents([
        { id: 'student1', name: 'Rohan Sharma', email: 'student@quantrex.com', phone: '9876543210', isBanned: false, dailyStreak: 12, attendance: 98, purchasedCourses: ['course1'], sessionsCount: 1 },
        { id: 'student2', name: 'Amit Verma', email: 'amit@gmail.com', phone: '9123456780', isBanned: false, dailyStreak: 4, attendance: 94, purchasedCourses: [], sessionsCount: 0 },
        { id: 'student3', name: 'Priya Sen', email: 'priya@gmail.com', phone: '9988776655', isBanned: true, dailyStreak: 0, attendance: 88, purchasedCourses: ['course1'], sessionsCount: 0 }
      ]);

      setSecurityAlerts([
        { id: 'alert1', userName: 'Priya Sen', type: 'devtools_inspect', details: 'Attempted right click on player context', ipAddress: '192.168.2.14', createdAt: new Date().toISOString() },
        { id: 'alert2', userName: 'Rohan Sharma', type: 'screenshot', details: 'Hotkey combo triggered: Ctrl+Shift+I', ipAddress: '192.168.1.1', createdAt: new Date().toISOString() }
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courses]);

  const handleBanToggle = async (studentId, currentBanStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${studentId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ban: !currentBanStatus })
      });
      if (response.ok) {
        alert(`Student banned status set to: ${!currentBanStatus}`);
        fetchData();
      }
    } catch (e) {
      // offline mock toggle
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isBanned: !currentBanStatus } : s));
      alert(`Student ban status modified in sandbox mode.`);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) return;

    const payload = {
      title: courseTitle,
      description: courseDesc,
      price: coursePrice,
      originalPrice: coursePrice * 3,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      tag: 'JEE Advanced'
    };

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const newCourse = await response.json();
        setCourses(prev => [...prev, newCourse]);
        setCourseTitle('');
        setCourseDesc('');
        alert('Course created and broadcasted live to all students!');
      }
    } catch (e) {
      // Offline fallback
      const newMockCourse = {
        id: 'course_mock_' + Math.random().toString(36).substr(2, 9),
        ...payload,
        rating: 5.0,
        modules: []
      };
      setCourses(prev => [...prev, newMockCourse]);
      setCourseTitle('');
      setCourseDesc('');
      alert('Course created in standalone mockup sandbox.');
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !newModuleName) return;

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: newModuleName })
      });
      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(prev => prev.map(c => c.id === selectedCourseId ? updatedCourse : c));
        setNewModuleName('');
        alert('Module added and synced live!');
      }
    } catch (e) {
      // offline fallback
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          const mod = { id: 'mod_mock_' + Math.random().toString(36).substr(2, 9), title: newModuleName, chapters: [] };
          return { ...c, modules: [...(c.modules || []), mod] };
        }
        return c;
      }));
      setNewModuleName('');
      alert('Module added to course in sandbox mode.');
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedModuleId || !chapterTitle) return;

    const payload = {
      title: chapterTitle,
      videoTitle,
      videoUrl: videoUrl || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      pdfTitle,
      pdfUrl: pdfUrl || '/pdfs/dpp.pdf'
    };

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourseId}/modules/${selectedModuleId}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(prev => prev.map(c => c.id === selectedCourseId ? updatedCourse : c));
        // Reset
        setChapterTitle('');
        setVideoTitle('');
        setVideoUrl('');
        setPdfTitle('');
        setPdfUrl('');
        alert('Lecture details added and broadcasted to enrolled students!');
      }
    } catch (e) {
      // offline fallback
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          const updatedModules = c.modules.map(m => {
            if (m.id === selectedModuleId) {
              const ch = {
                id: 'ch_mock_' + Math.random().toString(36).substr(2, 9),
                title: chapterTitle,
                videos: [{ title: videoTitle || 'Lecture Video', url: payload.videoUrl, duration: '45:00' }],
                pdfs: [{ title: pdfTitle || 'Class Handouts', url: payload.pdfUrl, size: '2.5 MB' }],
                assignments: []
              };
              return { ...m, chapters: [...(m.chapters || []), ch] };
            }
            return m;
          });
          return { ...c, modules: updatedModules };
        }
        return c;
      }));
      setChapterTitle('');
      setVideoTitle('');
      setVideoUrl('');
      setPdfTitle('');
      setPdfUrl('');
      alert('Chapter uploaded to local sandbox modules.');
    }
  };

  const handleBroadcastNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMsg) return;

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: noticeTitle, message: noticeMsg, type: 'general' })
      });
      if (response.ok) {
        alert('Notice broadcasted to all portals dynamically!');
        setNoticeTitle('');
        setNoticeMsg('');
      }
    } catch (e) {
      alert('Notice mock-broadcasted. Sockets synced in local scope.');
      setNoticeTitle('');
      setNoticeMsg('');
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-12 py-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Side Menu */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="text-center pb-4 border-b border-white/5 mb-6">
            <span className="text-[10px] text-gold font-mono uppercase tracking-wider block">Security Level 3 Active</span>
            <h3 className="text-base font-bold text-white uppercase font-display tracking-widest mt-1">Admin Console</h3>
          </div>
          
          <div className="flex flex-col gap-1">
            {[
              { id: 'revenue', label: 'Revenue & Sales', icon: TrendingUp },
              { id: 'students', label: 'Manage Students', icon: Users },
              { id: 'course-manager', label: 'Manage Courses', icon: BookOpen },
              { id: 'security', label: 'Anti-Piracy Logs', icon: AlertOctagon },
              { id: 'notice', label: 'Broadcast Alerts', icon: Bell },
              { id: 'settings', label: 'Branding Settings', icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`w-full py-3.5 px-4 text-xs font-bold tracking-wider uppercase text-left rounded-xl transition-all flex items-center gap-2.5 ${adminTab === tab.id ? 'bg-gold/10 border border-gold/30 text-gold shadow-[0_0_15px_rgba(255,215,0,0.05)]' : 'text-gray-400 hover:text-white border border-transparent'}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workspace Panel */}
      <div className="lg:col-span-3">
        <div className="glass-panel p-8 rounded-2xl border border-white/5 min-h-[65vh] space-y-6">
          
          {/* REVENUE DASHBOARD TAB */}
          {adminTab === 'revenue' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Revenue Dashboard</h3>
              
              {/* Metric stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                {[
                  { label: 'Total Revenue', value: `₹${metrics.totalRevenue}`, icon: DollarSign, color: 'text-emerald-400' },
                  { label: 'Active Students', value: metrics.activeStudents, icon: Users, color: 'text-electric' },
                  { label: 'Course Orders', value: metrics.purchasedCount, icon: BookOpen, color: 'text-platinum' },
                  { label: 'Active Streams', value: metrics.activeStreams, icon: Lock, color: 'text-gold' }
                ].map((m, idx) => (
                  <div key={idx} className="bg-obsidian/60 border border-white/5 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase block">{m.label}</span>
                    <span className={`text-lg md:text-xl font-bold ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Transactions details */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Recent Orders Logs</h4>
                <div className="overflow-x-auto border border-white/5 rounded-xl">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-obsidian border-b border-white/5 text-gray-500">
                        <th className="p-4">Student</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Amt</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-400">
                      {metrics.recentOrders && metrics.recentOrders.length > 0 ? (
                        metrics.recentOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 text-white font-semibold">{o.studentName}</td>
                            <td className="p-4 truncate max-w-[200px]">{o.courseTitle}</td>
                            <td className="p-4">₹{o.amount}</td>
                            <td className="p-4"><span className="text-emerald-400 bg-emerald-950/20 border border-emerald-900 px-2 py-0.5 rounded text-[10px]">SUCCESS</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 text-white font-semibold">Rohan Sharma</td>
                          <td className="p-4">Rank Booster JEE Advanced Mathematics</td>
                          <td className="p-4">₹4999</td>
                          <td className="p-4"><span className="text-emerald-400 bg-emerald-950/20 border border-emerald-900 px-2 py-0.5 rounded text-[10px]">SUCCESS</span></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STUDENT MANAGEMENT TAB */}
          {adminTab === 'students' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Student Directory</h3>
              
              <div className="overflow-x-auto border border-white/5 rounded-xl font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-obsidian border-b border-white/5 text-gray-500">
                      <th className="p-4">Name</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Courses</th>
                      <th className="p-4">Sessions</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-400">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">{s.name}</span>
                            <span className="text-[10px] text-gray-600">{s.email}</span>
                          </div>
                        </td>
                        <td className="p-4">{s.phone}</td>
                        <td className="p-4">{s.purchasedCourses?.length || 0}</td>
                        <td className="p-4 text-glow-blue">{s.sessionsCount || 0} Active</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleBanToggle(s.id, s.isBanned)}
                            className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] transition-colors ${
                              s.isBanned
                                ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400 hover:bg-emerald-500 hover:text-obsidian'
                                : 'bg-red-950/20 border-red-900 text-red-400 hover:bg-red-500 hover:text-obsidian'
                            }`}
                          >
                            {s.isBanned ? 'UNBAN ACCOUNT' : 'BAN STUDENT'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SYLLABUS & CONTENT MANAGER TAB */}
          {adminTab === 'course-manager' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Mathematics Syllabus Infrastructure</h3>
                <span className="text-xs text-gold font-mono uppercase bg-gold/10 px-3 py-1 rounded border border-gold/20">Class 6th to 12th & JEE Portal</span>
              </div>
              
              {/* Folder Selector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-obsidian/60 border border-white/5 rounded-xl font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase block">Select Target Grade / Category</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedChapterId('');
                    }}
                    className="w-full p-3 bg-cyberdark border border-white/10 rounded-lg text-white focus:outline-none"
                  >
                    {Object.keys(syllabus || {}).map(key => (
                      <option key={key} value={key}>{syllabus[key].label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase block">Select Chapter Folder</label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full p-3 bg-cyberdark border border-white/10 rounded-lg text-white focus:outline-none"
                  >
                    <option value="">-- Choose Chapter --</option>
                    {syllabus[selectedClass]?.chapters?.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedChapterId ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Form to Upload Content */}
                  <div className="space-y-6">
                    {/* Upload General Resource Form */}
                    <form onSubmit={handleAddResource} className="p-5 bg-cyberdark/50 border border-white/5 rounded-xl space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider text-glow-blue flex items-center gap-1.5">
                          <Book className="h-4 w-4 text-electric" /> Upload Lecture, Notes & Tips
                        </h4>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase block">Resource Type</label>
                        <div className="flex bg-obsidian/60 p-1 border border-white/5 rounded-lg justify-between gap-1">
                          {[
                            { id: 'video', label: '🎥 Video' },
                            { id: 'pdf', label: '📄 PDF' },
                            { id: 'formula', label: '⚡ Formula/Trick' },
                            { id: 'pyq', label: '📝 PYQ' }
                          ].map(t => {
                            if (t.id === 'pyq' && !selectedClass.startsWith('jee')) return null;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setResType(t.id)}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all uppercase ${resType === t.id ? 'bg-cyberdark border border-white/5 text-electric shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'text-gray-400'}`}
                              >
                                {t.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase block">Resource Title</label>
                        <input
                          type="text"
                          required
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          placeholder={resType === 'video' ? 'e.g. Concept of Continuity' : resType === 'pdf' ? 'e.g. DPP-01: Continuity Practice' : 'e.g. Limits Quick Formula List'}
                          className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>

                      {resType !== 'formula' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 uppercase block">Resource Asset Link / URL</label>
                          <input
                            type="text"
                            value={resUrl}
                            onChange={(e) => setResUrl(e.target.value)}
                            placeholder={resType === 'video' ? 'https://example.com/lecture.mp4' : '/pdfs/document.pdf'}
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase block">
                          {resType === 'video' && 'Duration (e.g. 45:12)'}
                          {resType === 'pdf' && 'File Size (e.g. 2.4 MB)'}
                          {resType === 'formula' && 'Formula & Cheat Sheet Content'}
                          {resType === 'pyq' && 'PYQ Year (e.g. 2025)'}
                        </label>
                        {resType === 'formula' ? (
                          <textarea
                            required
                            rows={4}
                            value={resDetail}
                            onChange={(e) => setResDetail(e.target.value)}
                            placeholder="Enter formulas, tricks, equations in LaTeX (e.g. $$\lim_{x \to 0} \frac{\sin x}{x} = 1$$)..."
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white focus:outline-none focus:border-electric/40"
                          />
                        ) : (
                          <input
                            type="text"
                            value={resDetail}
                            onChange={(e) => setResDetail(e.target.value)}
                            placeholder={resType === 'video' ? '30:00' : resType === 'pdf' ? '1.5 MB' : '2025'}
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white"
                          />
                        )}
                      </div>

                      {(resType === 'video' || resType === 'pdf') && (
                        <div className="flex items-center gap-2 py-2">
                          <input
                            type="checkbox"
                            id="download-block-toggle"
                            checked={restrictDownload}
                            onChange={(e) => setRestrictDownload(e.target.checked)}
                            className="h-4 w-4 accent-electric cursor-pointer"
                          />
                          <label htmlFor="download-block-toggle" className="text-[11px] text-gray-300 font-bold uppercase tracking-wider cursor-pointer">
                            🔒 Restrict Download & Force Safe-Player Canvas Viewer
                          </label>
                        </div>
                      )}

                      <button type="submit" className="w-full py-3 bg-electric hover:bg-cyan-400 text-obsidian font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                        <Plus className="h-4 w-4" /> Add Chapter Content
                      </button>
                    </form>

                    {/* AI Mock Test Creator Form */}
                    <form onSubmit={handlePublishMockTest} className="p-5 bg-cyberdark/50 border border-white/5 rounded-xl space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider text-glow-gold flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gold" /> Mock Test & Exam Generator
                        </h4>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase block">Mock Test Title</label>
                        <input
                          type="text"
                          required
                          value={mockTestTitle}
                          onChange={(e) => setMockTestTitle(e.target.value)}
                          placeholder="e.g. Chapter Practice Test - Medium Level"
                          className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 uppercase block">Duration (Minutes)</label>
                          <input
                            type="number"
                            value={mockTestDuration}
                            onChange={(e) => setMockTestDuration(e.target.value)}
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 uppercase block">Test Mode</label>
                          <select
                            value={mockTestType}
                            onChange={(e) => setMockTestType(e.target.value)}
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white focus:outline-none"
                          >
                            <option value="link">AI Generated Link Embed</option>
                            <option value="structured">Interactive Test Builder</option>
                          </select>
                        </div>
                      </div>

                      {mockTestType === 'link' ? (
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 uppercase block">Paste Claude/Gemini generated Quiz URL</label>
                          <input
                            type="text"
                            value={mockTestLink}
                            onChange={(e) => setMockTestLink(e.target.value)}
                            placeholder="https://forms.gle/... or external exam link"
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white font-mono text-[11px]"
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-obsidian/60 border border-white/5 rounded-lg space-y-3">
                          <span className="text-[10px] text-gold uppercase tracking-wider block font-bold">Interactive MCQ Builder ({questions.length} Added)</span>
                          
                          <input
                            type="text"
                            value={qText}
                            onChange={(e) => setQText(e.target.value)}
                            placeholder="Enter Question Text"
                            className="w-full p-2.5 bg-cyberdark border border-white/5 rounded text-xs text-white"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            {qOptions.map((opt, idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const copy = [...qOptions];
                                  copy[idx] = e.target.value;
                                  setQOptions(copy);
                                }}
                                placeholder={`Choice Option ${String.fromCharCode(65 + idx)}`}
                                className="w-full p-2 bg-cyberdark border border-white/5 rounded text-xs text-white"
                              />
                            ))}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[8px] text-gray-500 uppercase block mb-0.5 font-bold">Correct Option</label>
                              <select
                                value={qCorrect}
                                onChange={(e) => setQCorrect(e.target.value)}
                                className="w-full p-1.5 bg-cyberdark border border-white/5 rounded text-xs text-white"
                              >
                                <option value="0">A</option>
                                <option value="1">B</option>
                                <option value="2">C</option>
                                <option value="3">D</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[8px] text-gray-500 uppercase block mb-0.5 font-bold">Marks (+)</label>
                              <input
                                type="number"
                                value={qMarks}
                                onChange={(e) => setQMarks(e.target.value)}
                                className="w-full p-1.5 bg-cyberdark border border-white/5 rounded text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] text-gray-500 uppercase block mb-0.5 font-bold">Neg (-)</label>
                              <input
                                type="number"
                                value={qNegMarks}
                                onChange={(e) => setQNegMarks(e.target.value)}
                                className="w-full p-1.5 bg-cyberdark border border-white/5 rounded text-xs text-white"
                              />
                            </div>
                          </div>

                          <input
                            type="text"
                            value={qExplanation}
                            onChange={(e) => setQExplanation(e.target.value)}
                            placeholder="Explanation / Solution Steps"
                            className="w-full p-2.5 bg-cyberdark border border-white/5 rounded text-xs text-white"
                          />

                          <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="w-full py-2 bg-gold/10 hover:bg-gold hover:text-obsidian text-gold border border-gold/30 font-bold rounded text-[10px] uppercase tracking-wider transition-colors"
                          >
                            Add Question to Test
                          </button>
                        </div>
                      )}

                      <button type="submit" className="w-full py-3 bg-gold hover:bg-yellow-500 text-obsidian font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                        <PlusCircle className="h-4 w-4" /> Publish Mock Exam
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List of Existing Content in Selected Chapter */}
                  <div className="space-y-6 font-mono text-xs">
                    <div className="p-5 bg-cyberdark/40 border border-white/5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                        Folder Contents: {syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.title}
                      </h4>
                      
                      {/* Videos List */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-electric uppercase font-bold tracking-wider block">🎥 Video Lectures</span>
                        {(!syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.videos || syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.videos.length === 0) ? (
                          <p className="text-[10px] text-gray-600 italic">No video lectures uploaded yet.</p>
                        ) : (
                          syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.videos?.map(v => (
                            <div key={v.id} className="flex justify-between items-center bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-white font-semibold truncate text-[11px]">{v.title}</h5>
                                <span className="text-[9px] text-gray-500 block">Duration: {v.duration} {v.downloadBlocked && '• 🔒 Secured'}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteResource(selectedChapterId, 'video', v.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* PDFs List */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-electric uppercase font-bold tracking-wider block">📄 PDF Notes & DPPs</span>
                        {(!syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.pdfs || syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.pdfs.length === 0) ? (
                          <p className="text-[10px] text-gray-600 italic">No PDF notes uploaded.</p>
                        ) : (
                          syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.pdfs?.map(p => (
                            <div key={p.id} className="flex justify-between items-center bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-white font-semibold truncate text-[11px]">{p.title}</h5>
                                <span className="text-[9px] text-gray-500 block">Size: {p.size} {p.downloadBlocked && '• 🔒 Protected'}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteResource(selectedChapterId, 'pdf', p.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Formulas & Tricks List */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-gold uppercase font-bold tracking-wider block">⚡ Formulas & Quick Tricks</span>
                        {(!syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.formulas || syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.formulas.length === 0) ? (
                          <p className="text-[10px] text-gray-600 italic">No quick tricks added.</p>
                        ) : (
                          syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.formulas?.map(f => (
                            <div key={f.id} className="flex justify-between items-start bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-white font-semibold text-[11px]">{f.title}</h5>
                                <p className="text-[9px] text-gray-500 mt-1 line-clamp-2 leading-relaxed bg-black/25 p-1 rounded font-mono">{f.content}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteResource(selectedChapterId, 'formula', f.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* PYQs (only for JEE levels) */}
                      {selectedClass.startsWith('jee') && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-gold uppercase font-bold tracking-wider block">📝 Previous Year Questions (PYQs)</span>
                          {(!syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.pyqs || syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.pyqs.length === 0) ? (
                            <p className="text-[10px] text-gray-600 italic">No PYQs uploaded.</p>
                          ) : (
                            syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.pyqs?.map(p => (
                              <div key={p.id} className="flex justify-between items-center bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-white font-semibold truncate text-[11px]">{p.title}</h5>
                                  <span className="text-[9px] text-gray-500 block">Year: {p.year}</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteResource(selectedChapterId, 'pyq', p.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Mock Tests List */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-gold uppercase font-bold tracking-wider block">🏆 Mock Tests & Exams</span>
                        {(!syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.mockTests || syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.mockTests.length === 0) ? (
                          <p className="text-[10px] text-gray-600 italic">No mock exams published yet.</p>
                        ) : (
                          syllabus[selectedClass]?.chapters?.find(ch => ch.id === selectedChapterId)?.mockTests?.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-white font-semibold truncate text-[11px]">{t.title}</h5>
                                <span className="text-[9px] text-gray-500 block font-mono">
                                  {t.type === 'link' ? 'AI Quiz Embed' : 'JEE Exam Builder'} • {t.durationMinutes} mins
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteMockTest(selectedChapterId, t.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-cyberdark/20 border border-white/5 border-dashed rounded-xl min-h-[30vh]">
                  <BookOpen className="h-10 w-10 text-gray-600 mb-2" />
                  <p className="text-xs text-gray-500 font-mono">Select a Chapter Folder from the dropdown above to manage content.</p>
                </div>
              )}
            </div>
          )}

          {/* SECURITY & ANTI PIRACY LOGS TAB */}
          {adminTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Anti-Piracy Breaches</h3>
                <span className="text-[10px] bg-red-950/40 border border-red-900 text-red-400 px-2 py-0.5 rounded font-mono flex items-center gap-1.5 animate-pulse">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  REAL-TIME TELEMETRY FEED ACTIVE
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {securityAlerts.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-12">No piracy attempts or security warnings registered today.</p>
                ) : (
                  securityAlerts.map((alert, idx) => (
                    <div key={idx} className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl space-y-2 relative">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] bg-red-500 text-obsidian px-1.5 py-0.5 rounded font-bold uppercase">
                            {alert.type}
                          </span>
                          <h5 className="text-white font-bold text-sm mt-1.5">{alert.userName}</h5>
                        </div>
                        <span className="text-[10px] text-gray-500">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-400 leading-relaxed text-[11px]">{alert.details}</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-600 pt-2 border-t border-red-900/20">
                        <span>IP Address: {alert.ipAddress}</span>
                        <span>Log ID: {alert.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* BROADCAST ALERTS TAB */}
          {adminTab === 'notice' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Broadcast Global Announcement</h3>
              
              <form onSubmit={handleBroadcastNotice} className="p-5 bg-cyberdark border border-white/5 rounded-xl space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Announcement Title</label>
                  <input
                    type="text"
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Dynamic Limits Lecture starts now!"
                    className="w-full p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono focus:border-electric/40 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Detailed Message</label>
                  <textarea
                    required
                    rows={4}
                    value={noticeMsg}
                    onChange={(e) => setNoticeMsg(e.target.value)}
                    placeholder="Provide details about the notice or class schedules."
                    className="w-full p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono focus:border-electric/40 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Bell className="h-4.5 w-4.5 fill-current" />
                  Broadcast Live Notification
                </button>
              </form>
            </div>
          )}

          {/* SETTINGS / BRANDING & RESULTS TAB */}
          {adminTab === 'settings' && (
            <div className="space-y-8 animate-fade-in font-mono text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Branding Custom Logo */}
                <div className="p-6 bg-cyberdark/60 border border-white/5 rounded-xl space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display border-b border-white/5 pb-2 text-glow-blue">Branding Controls</h3>
                  
                  <div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">Upload Custom Brand Logo</h4>
                    <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
                      Select a new logo image (PNG/JPG/SVG). The image will be converted to a Base64 string and stored dynamically to customize the top navbar brand image.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <label className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-electric to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian font-bold text-xs rounded-lg uppercase tracking-wider transition-all cursor-pointer text-center shadow-lg hover:shadow-cyan-500/20">
                        Choose Logo File
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target.result;
                                localStorage.setItem('custom_logo', base64);
                                if (setCustomLogo) setCustomLogo(base64);
                                alert('Logo updated successfully! Changes are applied across the ecosystem.');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden" 
                        />
                      </label>
                      
                      <button
                        onClick={() => {
                          localStorage.removeItem('custom_logo');
                          if (setCustomLogo) setCustomLogo(null);
                          alert('Logo reset to default.');
                        }}
                        className="w-full sm:w-auto px-5 py-3 bg-red-950/20 border border-red-900/50 hover:bg-red-900/20 text-red-400 font-bold text-xs rounded-lg uppercase tracking-wider transition-all"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg overflow-hidden border border-electric/30 bg-obsidian flex items-center justify-center p-1">
                      <img 
                        src={localStorage.getItem('custom_logo') || '/quantrex-academy/logo.png'} 
                        alt="Brand Logo Preview" 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=80&q=80';
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase block">Active Logo Status</span>
                      <span className="text-xs font-bold text-white">
                        {localStorage.getItem('custom_logo') ? 'Custom Uploaded Logo' : 'Default Brand Logo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Toppers / Results Registry Form */}
                <div className="p-6 bg-cyberdark/60 border border-white/5 rounded-xl space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display border-b border-white/5 pb-2 text-glow-gold">Hall of Fame Results Registry</h3>
                  
                  <form onSubmit={handleAddTopper} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase block">Student Name</label>
                        <input
                          type="text"
                          required
                          value={topperName}
                          onChange={(e) => setTopperName(e.target.value)}
                          placeholder="e.g. Kabir Mehta"
                          className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase block">Rank / Board %</label>
                        <input
                          type="text"
                          required
                          value={topperRank}
                          onChange={(e) => setTopperRank(e.target.value)}
                          placeholder="e.g. AIR 4 / 99.8%"
                          className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase block">Math Score / Percentile</label>
                        <input
                          type="text"
                          required
                          value={topperScore}
                          onChange={(e) => setTopperScore(e.target.value)}
                          placeholder="e.g. 118 / 120 (Maths)"
                          className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase block">Exam details & Year</label>
                        <input
                          type="text"
                          value={topperYear}
                          onChange={(e) => setTopperYear(e.target.value)}
                          placeholder="e.g. JEE Advanced 2026"
                          className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase block">Profile Image URL</label>
                      <input
                        type="text"
                        value={topperPhoto}
                        onChange={(e) => setTopperPhoto(e.target.value)}
                        placeholder="Paste image URL (or leave blank for default avatar)"
                        className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gold hover:bg-yellow-500 text-obsidian font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg hover:shadow-yellow-500/10 flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Student Result
                    </button>
                  </form>
                </div>

              </div>

              {/* Toppers Achievement List */}
              <div className="p-6 bg-cyberdark/40 border border-white/5 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 text-glow-gold">Registered Hall of Fame Toppers</h4>
                
                {toppers.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-6">No topper results listed yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {toppers.map(t => (
                      <div key={t.id} className="bg-obsidian border border-white/5 p-4 rounded-xl flex items-center gap-3 relative group">
                        <div className="h-11 w-11 rounded-full overflow-hidden border border-gold/30 bg-cyberdark shrink-0">
                          <img 
                            src={t.photo} 
                            alt={t.name} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-gold font-bold uppercase tracking-wider">{t.rank}</span>
                          <h5 className="text-white font-bold text-xs truncate mt-0.5">{t.name}</h5>
                          <span className="text-[9px] text-gray-500 block truncate">{t.year} • {t.score}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteTopper(t.id)}
                          className="absolute top-2 right-2 p-1 text-gray-600 hover:text-red-400 rounded transition-colors bg-cyberdark/50 border border-transparent hover:border-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
