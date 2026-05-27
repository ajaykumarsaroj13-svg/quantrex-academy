import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Bell, AlertOctagon, TrendingUp, Lock, ShieldAlert, Ban, Check, DollarSign, PlusCircle } from 'lucide-react';

export default function AdminDashboard({ user, courses, setCourses }) {
  const [adminTab, setAdminTab] = useState('revenue'); // revenue, students, course-manager, security, notice
  
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
  
  // Course creation inputs
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [coursePrice, setCoursePrice] = useState(4999);
  
  // Chapter creation inputs
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
              { id: 'notice', label: 'Broadcast Alerts', icon: Bell }
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

          {/* COURSE MANAGER TAB */}
          {adminTab === 'course-manager' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Syllabus Infrastructure</h3>

              {/* Course Creator Form */}
              <form onSubmit={handleCreateCourse} className="p-5 bg-cyberdark/60 border border-white/5 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Create New Course Package</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="Course Title (e.g. Integral Calculus Master)"
                    className="p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                  />
                  <input
                    type="text"
                    required
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    placeholder="Brief description"
                    className="p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                  />
                  <input
                    type="number"
                    required
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    placeholder="Price (INR)"
                    className="p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-xs rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  Publish Course Live
                </button>
              </form>

              {/* Module & Lecture Creator Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Add Module Form */}
                <form onSubmit={handleAddModule} className="p-5 bg-cyberdark/40 border border-white/5 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Add Module Segment</h4>
                  <div className="space-y-3">
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input
                      type="text"
                      required
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                      placeholder="Module Name (e.g. Limits and Continuity)"
                      className="w-full p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gold hover:bg-yellow-500 text-obsidian font-bold text-xs rounded-lg uppercase tracking-wider transition-colors">
                    Add Module Live
                  </button>
                </form>

                {/* 2. Add Lecture Chapter Form */}
                <form onSubmit={handleAddChapter} className="p-5 bg-cyberdark/40 border border-white/5 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Upload Lecture & Notes</h4>
                  <div className="space-y-2.5">
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        setSelectedModuleId('');
                      }}
                      className="w-full p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>

                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="w-full p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                    >
                      <option value="">-- Choose Module --</option>
                      {courses.find(c => c.id === selectedCourseId)?.modules?.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      required
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      placeholder="Chapter / Lecture Title"
                      className="w-full p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Video Title"
                        className="p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                      />
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Video MP4 URL"
                        className="p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pdfTitle}
                        onChange={(e) => setPdfTitle(e.target.value)}
                        placeholder="PDF Notes Title"
                        className="p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                      />
                      <input
                        type="text"
                        value={pdfUrl}
                        onChange={(e) => setPdfUrl(e.target.value)}
                        placeholder="PDF Path"
                        className="p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full py-2.5 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-xs rounded-lg uppercase tracking-wider transition-colors">
                    Upload & Sync Live
                  </button>
                </form>

              </div>
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

        </div>
      </div>
    </div>
  );
}
