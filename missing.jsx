  // Syllabus selection states
  const [selectedSyllabusClass, setSelectedSyllabusClass] = useState(initialClass || 'jee-mains');
  const [selectedSyllabusChapterId, setSelectedSyllabusChapterId] = useState('');
  const [selectedSyllabusSubject, setSelectedSyllabusSubject] = useState('mathematics');
  const [chapterTab, setChapterTab] = useState(initialChapterTab || 'videos'); // videos, pdfs, formulas, pyqs, mockTests
  const [inlinePdf, setInlinePdf] = useState(null);
  const [selectedPyqTopic, setSelectedPyqTopic] = useState(null);
  const [customPracticeQuestions, setCustomPracticeQuestions] = useState(null);
  const [activePracticeMode, setActivePracticeMode] = useState('practice');
  const [practiceModalConfig, setPracticeModalConfig] = useState(null);
  const [examGoalOverviewConfig, setExamGoalOverviewConfig] = useState(null);

  const pyqSetsProgress = usePYQProgress('sets_and_relations');

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
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (initialClass) {
      setSelectedSyllabusClass(initialClass);
      setSelectedSyllabusChapterId('');
    }
  }, [initialClass]);

  useEffect(() => {
    if (selectedSyllabusClass === 'jee-advanced') {
      setChapterTab('pdfs');
      if (!selectedSyllabusChapterId && syllabus['jee-advanced']?.subjects?.mathematics?.chapters?.length > 0) {
        setSelectedSyllabusChapterId(syllabus['jee-advanced'].subjects.mathematics.chapters[0].id);
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
      const activeData = testCategory === 'jee-advanced' ? advancedTestsData : testsData;
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
  const isLight = theme === 'light';

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
            
            {(selectedPyqTopic || customPracticeQuestions) && (
              <ExamGoalPracticeInterface 
                pyqData={pyqSetsRelationData} 
                topic={selectedPyqTopic} 
                customQuestions={customPracticeQuestions}
                practiceMode={activePracticeMode}
                onProgressUpdate={pyqSetsProgress.updateProgress}
                onClose={() => { setSelectedPyqTopic(null); setCustomPracticeQuestions(null); }}
                isLight={isLight}
              />
            )}
          </div>
        </div>
      )}

      {!isTrueFullScreen && (<div className={`study-portal-wrapper ${theme === 'light' ? 'theme-light' : 'theme-dark'} px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 ${isFocusMode ? 'max-w-[1600px] lg:grid-cols-1' : 'max-w-7xl lg:grid-cols-4'} themed-root`}>

        {!isFocusMode && (
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex flex-col items-center text-center relative">
            <h3 className="text-white font-bold text-lg">{user?.name}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 flex flex-row lg:flex-col justify-around">
          {[
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'test-series', label: 'Full Test Series', icon: FileText, isPage: true, pageId: 'test-series' },
          ].map((item) => (
              <button
                key={item.id}
                onClick={() => { 
                  if (item.isPage) setActivePage(item.pageId);
                  else { setActiveTab(item.id); setSelectedVideo(null); }
                }}
                className={`w-full py-4 px-5 text-xs font-bold uppercase text-left ${activeTab === item.id ? 'text-electric' : 'text-gray-400'}`}
              >
                {item.label}
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
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                  <div className="md:col-span-1 space-y-3 border-r border-white/5 pr-4 max-h-[70vh] overflow-y-auto pr-1">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-4 border-b border-white/10 pb-2">Chapters List</span>
                    {syllabus['jee-mains']?.subjects?.['mathematics']?.chapters?.map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => {
                            setSelectedSyllabusChapterId(ch.id);
                            setChapterTab('videos');
                            setExamGoalOverviewConfig(null);
                          }}
                          className={`w-full p-3 rounded-xl text-[13px] text-left font-bold transition-all block border ${
                            selectedSyllabusChapterId === ch.id 
                              ? 'bg-blue-600/20 text-white border-blue-500/50' 
                              : 'text-gray-400 border-white/5'
                          }`}
                        >
                          {ch.title}
                        </button>
                    ))}
                  </div>

                    <div className="md:col-span-3">
                      {examGoalOverviewConfig ? (
                        <ExamGoalChapterOverview 
                          chapter={examGoalOverviewConfig} 
                          onBack={() => setExamGoalOverviewConfig(null)} 
                          onLaunchPractice={(config, mode) => {
                             setActivePracticeMode(mode);
                             if (config.id === 'ch_mathematics_algebra_0') {
                               let allQs = [];
                               if (typeof pyqSetsRelationData !== 'undefined' && pyqSetsRelationData && pyqSetsRelationData.topics) {
                                 pyqSetsRelationData.topics.forEach(t => {
                                   if (pyqSetsRelationData.questions[t.id]) {
                                     allQs = [...allQs, ...pyqSetsRelationData.questions[t.id]];
                                   }
                                 });
                               }
                               setCustomPracticeQuestions(allQs);
                               setSelectedPyqTopic({ name: config.title });
                             } else {
                               setCustomPracticeQuestions([]);
                               setSelectedPyqTopic({ name: config.title });
                             }
                          }} 
                        />
                      ) : selectedSyllabusChapterId ? (
                        (() => {
                          const chapter = syllabus['jee-mains']?.subjects?.['mathematics']?.chapters?.find(ch => ch.id === selectedSyllabusChapterId);
                          if (!chapter) return null;
                          return (
