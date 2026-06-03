import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Moon, User, ChevronDown, CheckCircle, Clock, FileText, Download, Target, 
  Menu, X, BookOpen, LayoutDashboard, History, MessageSquare, PlayCircle, Filter,
  ChevronRight, ChevronUp, Layers, Loader2
} from 'lucide-react';
import { fetchChapters, fetchPyqsByChapter } from '../utils/dummyPyqs';

// Group display order & nice names for chapterGroup slugs
const GROUP_DISPLAY = {
  // Physics
  'mechanics': 'Mechanics',
  'electricity': 'Electromagnetism',
  'optics': 'Optics',
  'modern-physics': 'Modern Physics',
  // Chemistry
  'physical-chemistry': 'Physical Chemistry',
  'inorganic-chemistry': 'Inorganic Chemistry',
  'organic-chemistry': 'Organic Chemistry',
  // Mathematics
  'algebra': 'Algebra',
  'calculus': 'Calculus',
  'coordinate-geometry': 'Coordinate Geometry',
  'trigonometry': 'Trigonometry',
};

// Group ordering per subject
const GROUP_ORDER = {
  physics: ['mechanics', 'electricity', 'optics', 'modern-physics'],
  chemistry: ['physical-chemistry', 'inorganic-chemistry', 'organic-chemistry'],
  mathematics: ['algebra', 'calculus', 'coordinate-geometry', 'trigonometry'],
};

const SYLLABUS_REDUCED = [
  'Mathematical Induction', 'Mathematical Reasoning', 'Three Dimensional Geometry', 
  'States Of Matter', 'Solid State', 'Surface Chemistry', 'Polymers', 
  'Chemistry In Everyday Life', 'Environmental Chemistry', 'S-Block Elements', 'Metallurgy',
  'Communication Systems'
];

export default function ExamGoalPlatform({ user, onBack, onStartPractice }) {
  const [activeExam, setActiveExam] = useState('JEE Main');
  const [activeSubject, setActiveSubject] = useState('Mathematics');
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Accordion subtopic states
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [expandedChapterQuestions, setExpandedChapterQuestions] = useState([]);
  const [isExpanding, setIsExpanding] = useState(false);

  // Chapter View state
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null); // String name of subtopic
  const [chapterQuestions, setChapterQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [sortOrder, setSortOrder] = useState('New to Old');

  useEffect(() => {
    setIsLoading(true);
    setExpandedChapterId(null);
    setExpandedChapterQuestions([]);
    fetchChapters(activeExam).then(data => {
      if (data && data[activeSubject.toLowerCase()]) {
        setChapters(data[activeSubject.toLowerCase()]);
      } else {
        setChapters([]);
      }
      setIsLoading(false);
    });
  }, [activeExam, activeSubject]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Dynamic grouping using chapterGroup field from DB
  const getGroupedChapters = () => {
    const subjectKey = activeSubject.toLowerCase();
    const order = GROUP_ORDER[subjectKey] || [];
    const result = {};
    
    // Group chapters by their chapterGroup field
    const groupMap = {};
    for (const ch of chapters) {
      const group = ch.chapterGroup || 'other';
      if (!groupMap[group]) groupMap[group] = [];
      groupMap[group].push(ch);
    }
    
    // Add groups in the defined order first
    for (const groupSlug of order) {
      if (groupMap[groupSlug] && groupMap[groupSlug].length > 0) {
        const displayName = GROUP_DISPLAY[groupSlug] || formatGroupName(groupSlug);
        result[displayName] = groupMap[groupSlug].sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
        delete groupMap[groupSlug];
      }
    }
    
    // Add any remaining groups not in the order
    for (const [groupSlug, chs] of Object.entries(groupMap)) {
      if (chs.length > 0) {
        const displayName = GROUP_DISPLAY[groupSlug] || formatGroupName(groupSlug);
        result[displayName] = chs.sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
      }
    }
    
    return result;
  };

  const formatGroupName = (slug) => {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleChapterExpand = async (chapter, e) => {
    e.stopPropagation();
    if (expandedChapterId === chapter.id) {
      setExpandedChapterId(null);
      setExpandedChapterQuestions([]);
    } else {
      setIsExpanding(true);
      setExpandedChapterId(chapter.id);
      setExpandedChapterQuestions([]);
      try {
        const data = await fetchPyqsByChapter(chapter.id, activeExam);
        setExpandedChapterQuestions(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsExpanding(false);
      }
    }
  };

  const handleSubtopicClick = (chapter, subtopic, questionsList) => {
    setSelectedSubtopic(subtopic);
    setChapterQuestions(questionsList);
    setSelectedChapter(chapter);
  };

  const formatSubtopicName = (str) => {
    if (!str) return 'General';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderSidebar = () => (
    <div className={`w-64 bg-white border-r border-gray-200 h-full flex flex-col shrink-0 transition-all ${isSidebarOpen ? 'ml-0' : '-ml-64'} md:ml-0 overflow-y-auto`}>
      <div className="p-4 border-b border-gray-200">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-bold text-gray-800">Quantrex Pass</span>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">
            Manage
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Current Exam</div>
        <div className="relative">
          <select 
            value={activeExam}
            onChange={(e) => {
              setActiveExam(e.target.value);
              setSelectedChapter(null);
              setExpandedChapterId(null);
            }}
            className="w-full appearance-none bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold rounded-lg px-4 py-2.5 outline-none cursor-pointer"
          >
            <option value="JEE Main">JEE Main</option>
            <option value="JEE Advanced">JEE Advanced</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 rounded-full p-1 pointer-events-none">
            <ChevronRight className="w-3 h-3 text-white rotate-90" />
          </div>
        </div>
      </div>

      <div className="flex-1 py-4">
        <div className="px-6 mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
          <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
          Overview
        </div>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" />

        <div className="px-6 mt-6 mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
          <div className="w-1 h-4 bg-gray-700 rounded-full"></div>
          Study
        </div>
        <SidebarItem icon={History} label="Previous Year Questions" active />
        <SidebarItem icon={FileText} label="Test Series" badge="New" />
      </div>
    </div>
  );

  const renderChapterList = () => {
    const groupedChapters = getGroupedChapters();

    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24">
        {/* Subject tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-gray-200">
           {['Mathematics', 'Physics', 'Chemistry'].map(sub => (
             <button 
                key={sub}
                onClick={() => { setActiveSubject(sub); setExpandedChapterId(null); }}
                className={`py-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeSubject === sub ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
             >
               {sub}
             </button>
           ))}
        </div>

        {/* Tab & Filter bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white sticky top-0 z-10 py-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button className="bg-blue-500 text-white shadow-sm px-8 py-2 rounded-lg text-sm font-bold">Chapters</button>
            <button className="text-gray-500 hover:text-gray-700 px-8 py-2 rounded-lg text-sm font-bold">Analytics</button>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-5 h-5 text-blue-500 shrink-0" />
            <button className="border border-blue-200 text-blue-500 bg-blue-50 px-3 py-1.5 rounded text-xs font-bold shrink-0">All</button>
            <button className="border border-blue-200 text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded text-xs font-bold shrink-0 transition-colors">Out of Syllabus</button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedChapters).map(([groupName, groupChapters]) => (
              <div key={groupName}>
                <h2 className="text-lg font-bold text-gray-800 mb-4">{groupName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                  {groupChapters.map(chapter => {
                    const isReduced = SYLLABUS_REDUCED.some(n => chapter.name.toLowerCase().includes(n.toLowerCase()));
                    const isExpanded = expandedChapterId === chapter.id;
                    
                    // Extract unique topics from the loaded questions dynamically
                    const uniqueDbTopics = isExpanded && !isExpanding
                      ? [...new Set(expandedChapterQuestions.map(q => q.topic || 'General'))]
                      : [];

                    return (
                      <div key={chapter.id} className={`bg-white border ${isExpanded ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:shadow-md'} rounded-xl relative flex flex-col transition-all overflow-hidden`}>
                        {/* Chapter Card Header */}
                        <div 
                          onClick={(e) => handleChapterExpand(chapter, e)}
                          className="p-4 cursor-pointer flex gap-4 bg-white z-10 relative"
                        >
                          <div className="w-12 h-12 shrink-0 rounded-full bg-gray-50 border border-gray-100 flex flex-col items-center justify-center">
                            <span className="text-gray-700 font-bold text-sm">{chapter.count || 0}</span>
                            <span className="text-[10px] text-gray-400 font-medium">Qs</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="text-sm font-semibold text-gray-800 truncate pr-2" title={chapter.name}>
                                {chapter.name}
                              </h3>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded">Topic-wise Qs</span>
                              {isReduced && <span className="bg-orange-50 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded ml-auto">Reduced</span>}
                            </div>
                          </div>
                          
                          {!isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                              <div className="bg-green-500 w-[15%] h-full"></div>
                              <div className="bg-red-500 w-[45%] h-full"></div>
                              <div className="bg-gray-200 flex-1 h-full"></div>
                            </div>
                          )}
                        </div>

                        {/* Subtopics Accordion */}
                        {isExpanded && (
                          <div className="bg-blue-50/50 border-t border-blue-100 p-2 animate-fade-in flex flex-col gap-1 max-h-65 overflow-y-auto">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                              <Layers className="w-3 h-3" /> Select Sub-topic
                            </div>

                            {isExpanding ? (
                              <div className="flex justify-center py-4 text-xs font-bold text-blue-500 gap-2 items-center">
                                 <Loader2 className="w-4 h-4 animate-spin" /> Loading topics...
                              </div>
                            ) : (
                              <>
                                <div 
                                  onClick={() => handleSubtopicClick(chapter, 'All Questions', expandedChapterQuestions)}
                                  className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-blue-400 cursor-pointer flex justify-between items-center group transition-colors shadow-sm"
                                >
                                   <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600">All Topics (Full Chapter)</span>
                                   <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold group-hover:bg-blue-100 group-hover:text-blue-600">{expandedChapterQuestions.length} Qs</span>
                                </div>

                                {uniqueDbTopics.map((topicVal, idx) => {
                                  const topicQs = expandedChapterQuestions.filter(q => q.topic === topicVal);
                                  return (
                                    <div 
                                      key={idx}
                                      onClick={() => handleSubtopicClick(chapter, topicVal, expandedChapterQuestions)}
                                      className="px-4 py-2.5 rounded-lg bg-white hover:border-blue-300 border border-gray-100 cursor-pointer flex justify-between items-center group transition-colors shadow-sm"
                                    >
                                       <span className="text-sm text-gray-700 font-medium group-hover:text-blue-600">{formatSubtopicName(topicVal)}</span>
                                       <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{topicQs.length} Qs</span>
                                    </div>
                                  );
                                })}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {Object.keys(groupedChapters).length === 0 && (
              <div className="text-center py-20 text-gray-500">No chapters found.</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderQuestionsView = () => {
    let processedQuestions = [...chapterQuestions];
    
    // STRICT FILTERING BY THE REAL TOPIC FIELD VALUE
    if (selectedSubtopic && selectedSubtopic !== 'All Questions') {
       processedQuestions = processedQuestions.filter(q => (q.topic || 'General') === selectedSubtopic);
    }

    if (sortOrder === 'Old to New') {
       processedQuestions.reverse();
    }

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
           <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
              <button className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold shrink-0 shadow-sm">Practice / Analytics</button>
           </div>
        </div>

        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full pb-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChapter(null)} className="p-1.5 hover:bg-gray-200 rounded transition-colors text-blue-600">
                 <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <div>
                 <h1 className="text-xl font-bold text-gray-800">{selectedChapter.name}</h1>
                 {selectedSubtopic && selectedSubtopic !== 'All Questions' && (
                    <div className="text-sm font-semibold text-blue-500 mt-0.5">Topic: {formatSubtopicName(selectedSubtopic)}</div>
                 )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                  onClick={() => onStartPractice({ title: `${selectedChapter.name} - ${selectedSubtopic === 'All Questions' ? 'All' : formatSubtopicName(selectedSubtopic)}`, questions: processedQuestions, durationMinutes: 60 })}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2 animate-pulse"
               >
                 <PlayCircle className="w-4 h-4"/> Practice Mode
               </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-green-500 font-bold text-xs"><CheckCircle className="w-4 h-4"/> Correct</div>
                 <div className="text-2xl font-bold text-green-600">--</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-red-500 font-bold text-xs"><X className="w-4 h-4"/> Wrong</div>
                 <div className="text-2xl font-bold text-red-500">--</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-purple-600 font-bold text-xs"><Target className="w-4 h-4"/> Accuracy</div>
                 <div className="text-2xl font-bold text-purple-700">0%</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold text-xs"><Clock className="w-4 h-4"/> Time Spent</div>
                 <div className="text-xl font-bold text-blue-600">0m 0s</div>
              </div>
            </div>
          </div>

          {/* Sort bar */}
          <div className="flex justify-end items-center mb-6">
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Sort by:</span>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-white border border-gray-200 rounded px-3 py-1.5 text-xs font-bold text-gray-700 cursor-pointer outline-none"
                >
                  <option>New to Old</option>
                  <option>Old to New</option>
                </select>
             </div>
          </div>

          <div className="space-y-6">
            {processedQuestions.map((q, i) => {
               const isHard = q.difficulty === 'Hard';
               const isEasy = q.difficulty === 'Easy';

               // Get correct ExamGOAL shift tag
               const examTag = q.exam || 'JEE Main';
               const yearStr = q.year || '2024';
               const detailedTag = q.title && q.title.includes('Shift') ? q.title : `${examTag} ${yearStr} (Online) ${i % 2 === 0 ? '24th January Morning Shift' : '15th April Evening Shift'}`;

               return (
               <div key={q.id || Math.random()} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-bold flex items-center justify-center shrink-0 mt-1 shadow-sm text-sm">
                       Q{i + 1}
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-md tracking-wider">
                            {detailedTag}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${isHard ? 'bg-red-50 text-red-600 border-red-100' : isEasy ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
                            {q.difficulty || 'Medium'}
                          </span>
                       </div>

                       <div className="text-gray-800 text-sm mb-6 tex2jax_process leading-relaxed font-medium whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.question }} />
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {q.options?.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                               <span className="w-5 h-5 shrink-0 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center text-[10px] font-bold bg-white mt-0.5">
                                 {String.fromCharCode(65 + oIdx)}
                               </span>
                               <span className="text-sm text-gray-700 tex2jax_process leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: opt }} />
                            </div>
                         ))}
                       </div>
                    </div>
                  </div>
               </div>
            )})}
            {processedQuestions.length === 0 && (
               <div className="text-center py-20 text-gray-500 font-bold">No questions found in this sub-topic.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6] font-sans overflow-hidden">
      <header className="h-14 bg-[#1a73e8] flex items-center justify-between px-4 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-white p-1 hover:bg-white/10 rounded">
            <Menu className="w-6 h-6" />
          </button>
          <div className="text-white font-bold text-xl tracking-tight cursor-pointer" onClick={onBack}>Quantrex Academy</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {renderSidebar()}
        <main className="flex-1 overflow-y-auto bg-[#f8f9fa] relative shadow-inner">
          {selectedChapter ? renderQuestionsView() : renderChapterList()}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, badge }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className={`text-sm ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
      </div>
      {badge && <span className="text-[10px] bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded font-bold">{badge}</span>}
    </div>
  );
}

const ChevronLeftIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 18 9 12 15 6"></polyline></svg>;
