import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, History, FileText, BookOpen, Layers, 
  ChevronRight, ChevronDown, Filter, PlayCircle, Clock, 
  BarChart2, MoreHorizontal, Settings, HelpCircle, 
  PieChart, Search, X, CheckCircle, Target, Menu, Lock, Bookmark, ArrowRight, ArrowLeft, Folder, Loader2
} from 'lucide-react';
import { fetchChapters, fetchPyqsByChapter } from '../utils/dummyPyqs';

export default function ExamGoalPlatform({ user, onBack, onStartTest, onStartPractice }) {
  // Navigation State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('pyq');
  const [expandedMenus, setExpandedMenus] = useState({ 'pyq': true, 'jee-main': true });
  
  // Content State
  const [activeSubject, setActiveSubject] = useState('mathematics'); // physics, chemistry, mathematics
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterTab, setChapterTab] = useState('topic-wise');
  
  // Data State
  const [chaptersObj, setChaptersObj] = useState({ mathematics: [], physics: [], chemistry: [] });
  const [chapterQuestions, setChapterQuestions] = useState([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Filter States
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  
  // Bookmark State
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [bookmarkGroups, setBookmarkGroups] = useState(['General']);
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    fetchChapters().then(data => {
      setChaptersObj(data || { mathematics: [], physics: [], chemistry: [] });
      setIsLoadingChapters(false);
    });
  }, []);

  useEffect(() => {
    if (selectedChapter) {
      setIsLoadingQuestions(true);
      fetchPyqsByChapter(selectedChapter.id).then(data => {
        setChapterQuestions(data || []);
        setIsLoadingQuestions(false);
      });
    } else {
      setChapterQuestions([]);
    }
  }, [selectedChapter]);

  useEffect(() => {
    if (activeMenu === 'bookmarks') {
      try {
        const saved = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
        const groups = JSON.parse(localStorage.getItem('quantrex_bookmark_groups') || '["General", "Hard Questions", "Needs Revision"]');
        setBookmarkGroups(groups);
        
        // We might not have PYQ_DATABASE fully loaded locally, but let's fetch bookmarks 
        // using the chapters API if needed, or we might need a dedicated bookmarks endpoint.
        // For now, since bookmarked questions are locally cached in qsCache if visited, 
        // or we might need an API. Let's just leave it empty if we haven't fetched them.
        setBookmarkedQuestions([]);
      } catch(e){}
    }
  }, [activeMenu]);

  // Sidebar Menu Structure
  const menuStructure = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { 
      id: 'pyq', 
      icon: History, 
      label: 'Previous Year Question',
      children: [
        { 
          id: 'jee-main', 
          label: 'JEE Main',
          children: [
            { id: 'physics', label: 'Physics', type: 'subject' },
            { id: 'chemistry', label: 'Chemistry', type: 'subject' },
            { id: 'mathematics', label: 'Mathematics', type: 'subject' }
          ]
        },
        { 
          id: 'jee-adv', 
          label: 'JEE Advanced',
          children: [
            { id: 'adv-physics', label: 'Physics', type: 'subject' },
            { id: 'adv-chemistry', label: 'Chemistry', type: 'subject' },
            { id: 'adv-mathematics', label: 'Mathematics', type: 'subject' }
          ]
        }
      ]
    },
    { id: 'tests', icon: FileText, label: 'Test Series', badge: 'New' },
    { id: 'ncert', icon: BookOpen, label: 'NCERT' }
  ];

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleMenuClick = (item) => {
    if (item.children) {
      toggleMenu(item.id);
    } else if (item.type === 'subject') {
      setActiveMenu(item.id);
      setActiveSubject(item.id);
      setSelectedChapter(null);
    } else {
      setActiveMenu(item.id);
      setSelectedChapter(null);
      setSelectedFolder(null);
    }
  };

  const getChapterTopics = () => {
    const questions = chapterQuestions;
    const topicsMap = {};
    questions.forEach(q => {
      const topicName = q.topic || 'General';
      if (!topicsMap[topicName]) {
        topicsMap[topicName] = { name: topicName, count: 0, easy: 0, medium: 0, hard: 0, weightage: Math.floor(Math.random() * 30 + 10) };
      }
      topicsMap[topicName].count++;
      if (q.difficulty === 'Easy') topicsMap[topicName].easy++;
      else if (q.difficulty === 'Hard') topicsMap[topicName].hard++;
      else topicsMap[topicName].medium++;
    });
    return Object.values(topicsMap);
  };

  const renderSidebarItem = (item, depth = 0) => {
    const isExpanded = expandedMenus[item.id];
    const isActive = activeMenu === item.id;
    
    return (
      <div key={item.id} className="select-none">
        <div 
          onClick={() => handleMenuClick(item)}
          className={`
            flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors
            ${isActive && !item.children ? 'bg-electric/10 text-white border-r-4 border-electric font-medium' : 'text-gray-300 hover:bg-obsidian'}
          `}
          style={{ paddingLeft: depth === 0 ? '1rem' : `${1 + depth * 1.5}rem` }}
        >
          <div className="flex items-center gap-3">
            {item.icon && <item.icon className={`w-5 h-5 ${isActive ? 'text-electric' : 'text-gray-400'}`} />}
            {!item.icon && <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2" />}
            <span className="text-sm">{item.label}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">{item.badge}</span>
            )}
            {item.children && (
              isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
        
        {item.children && isExpanded && (
          <div className="mt-1">
            {item.children.map(child => renderSidebarItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8">Your Progress Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col items-center justify-center">
          <Target className="w-10 h-10 text-blue-400 mb-3" />
          <div className="text-4xl font-bold text-white mb-1">1,240</div>
          <div className="text-sm text-gray-400">Total Attempted</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
          <div className="text-4xl font-bold text-white mb-1">892</div>
          <div className="text-sm text-gray-400">Correct Answers</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col items-center justify-center">
          <X className="w-10 h-10 text-red-400 mb-3" />
          <div className="text-4xl font-bold text-white mb-1">348</div>
          <div className="text-sm text-gray-400">Incorrect Answers</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col items-center justify-center">
          <PieChart className="w-10 h-10 text-gold mb-3" />
          <div className="text-4xl font-bold text-white mb-1">71.9%</div>
          <div className="text-sm text-gray-400">Overall Accuracy</div>
        </div>
      </div>
      <div className="glass-panel p-8 rounded-3xl border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-electric" /> Recent Incorrect Questions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-sm text-gray-400 font-bold">Date</th>
                <th className="p-4 text-sm text-gray-400 font-bold">Chapter</th>
                <th className="p-4 text-sm text-gray-400 font-bold">Year</th>
                <th className="p-4 text-sm text-gray-400 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-sm text-gray-200">Today, 10:45 AM</td>
                <td className="p-4 text-sm text-gray-200">Trigonometric Equations</td>
                <td className="p-4 text-sm text-gray-200">JEE Main 2024</td>
                <td className="p-4 text-sm text-red-400 font-bold">Incorrect</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-sm text-gray-200">Yesterday</td>
                <td className="p-4 text-sm text-gray-200">Sets and Relations</td>
                <td className="p-4 text-sm text-gray-200">JEE Main 2021</td>
                <td className="p-4 text-sm text-red-400 font-bold">Incorrect</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBookmarks = () => {
    if (!selectedFolder) {
      return (
        <div className="p-8 animate-fade-in max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-gold" /> Bookmark Groups
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bookmarkGroups.map(group => {
              const count = bookmarkedQuestions.filter(q => {
                const s = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
                return s[q.id] === group;
              }).length;
              
              return (
                <div key={group} onClick={() => setSelectedFolder(group)} className="glass-panel p-6 rounded-2xl border-white/10 hover:border-gold/50 cursor-pointer hover:bg-white/5 transition-all group flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-110 transition-transform"><Folder className="w-8 h-8"/></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{group}</h3>
                    <p className="text-gray-400 text-sm">{count} Questions</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    const folderQs = bookmarkedQuestions.filter(q => {
      const s = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
      return s[q.id] === selectedFolder;
    });

    return (
      <div className="p-8 animate-fade-in flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setSelectedFolder(null)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Folder className="w-8 h-8 text-gold" /> {selectedFolder}
            </h2>
          </div>
          <button 
            onClick={() => onStartPractice({ title: selectedFolder + ' Practice', questions: folderQs, durationMinutes: 60 })}
            disabled={folderQs.length === 0}
            className="bg-gradient-to-r from-electric to-blue-600 hover:from-blue-500 hover:to-electric shadow-[0_0_15px_rgba(0,180,216,0.4)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            <PlayCircle className="w-5 h-5" /> Practice Group
          </button>
        </div>
        
        {folderQs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 pb-20">
            <p className="text-lg">No questions in this group.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {folderQs.map((q, i) => (
              <div key={q.id} className="glass-panel p-6 rounded-2xl border-white/10 hover:border-gold/50 transition-all flex flex-col min-h-[250px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs font-mono text-gold bg-gold/10 px-2 py-1 rounded truncate max-w-[80%]">{q.chapterId.replace(/_/g, ' ')}</div>
                  <button onClick={() => {
                      const saved = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
                      delete saved[q.id];
                      localStorage.setItem('quantrex_bookmarks_v2', JSON.stringify(saved));
                      setBookmarkedQuestions(bookmarkedQuestions.filter(bq => bq.id !== q.id));
                    }} 
                    className="text-gray-400 hover:text-red-400 transition-colors" title="Remove Bookmark">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-gray-200 text-sm line-clamp-4 mb-6 flex-1 tex2jax_process whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.question }} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSubjectView = () => {
    const chapters = chaptersObj[activeSubject] || [];
    return (
      <div className="p-8 animate-fade-in max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2 capitalize">JEE Main {activeSubject}</h2>
        <p className="text-gray-400 mb-8">Select a chapter to practice previous year questions.</p>
        
        {isLoadingChapters ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 text-electric animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {chapters.map((chapter) => (
              <div 
                key={chapter.id} 
                onClick={() => setSelectedChapter(chapter)}
                className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-electric/50 hover:shadow-[0_0_20px_rgba(0,180,216,0.15)] cursor-pointer transition-all group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {chapter.weightage || '5%'} Weightage
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{chapter.name}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5"><ListIcon /> {chapter.count || 120} Qs</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2h 30m avg</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderChapterView = () => {
    return (
      <div className="p-8 animate-fade-in max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setSelectedChapter(null)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div>
             <h1 className="text-2xl font-bold text-white">{selectedChapter.name}</h1>
             <p className="text-gray-400 text-sm">Chapter-wise Practice</p>
          </div>
        </div>
        
        <div className="glass-panel border-white/10 rounded-3xl overflow-hidden mb-8">
          <div className="flex border-b border-white/10 bg-black/20">
            {['topic-wise', 'all-questions'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setChapterTab(tab)}
                className={`flex-1 py-4 text-sm font-bold capitalize transition-all ${chapterTab === tab ? 'text-electric border-b-2 border-electric bg-electric/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
          
          <div className="p-6 bg-cyberdark">
            {isLoadingQuestions ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-electric animate-spin" />
              </div>
            ) : chapterTab === 'topic-wise' ? (
              <>
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold text-white">Practice Topics</h3>
                   <button 
                    onClick={() => onStartPractice({ title: selectedChapter.name, questions: chapterQuestions, durationMinutes: 60 })}
                    className="bg-electric hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(0,180,216,0.3)] transition-colors flex items-center gap-2"
                   >
                     <PlayCircle className="w-4 h-4"/> Practice All
                   </button>
                </div>
                
                <div className="space-y-4">
                  {getChapterTopics().map(topic => (
                    <div key={topic.name} className="bg-obsidian border border-white/10 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 hover:border-white/20 transition-colors">
                       <div>
                         <h4 className="text-white font-bold mb-1">{topic.name}</h4>
                         <p className="text-gray-400 text-sm">{topic.count} Questions Available</p>
                       </div>
                       <button 
                        onClick={() => {
                           const qs = chapterQuestions.filter(q => (q.topic || 'General') === topic.name);
                           onStartPractice({ title: topic.name, questions: qs, durationMinutes: 30 });
                        }}
                        className="w-full md:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                       >
                         Start Topic
                       </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold text-white">All Questions</h3>
                   <button 
                    onClick={() => onStartPractice({ title: selectedChapter.name, questions: chapterQuestions, durationMinutes: 60 })}
                    className="bg-electric hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(0,180,216,0.3)] transition-colors flex items-center gap-2"
                   >
                     <PlayCircle className="w-4 h-4"/> Start Practice
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chapterQuestions.map((q, i) => (
                    <div key={q.id} className="glass-panel p-6 rounded-2xl border-white/10 hover:border-gold/50 transition-all flex flex-col min-h-[250px]">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-xs font-bold text-gray-400 bg-white/5 px-2 py-1 rounded truncate max-w-[80%]">
                          {q.year || 'PYQ'} • Q. {i + 1}
                        </div>
                        <button onClick={() => {
                            const saved = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
                            if (saved[q.id]) {
                              delete saved[q.id];
                            } else {
                              saved[q.id] = bookmarkGroups[0];
                            }
                            localStorage.setItem('quantrex_bookmarks_v2', JSON.stringify(saved));
                            setBookmarkedQuestions([...bookmarkedQuestions]); 
                          }} 
                          className="text-gray-400 hover:text-gold transition-colors" title="Bookmark">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-gray-200 text-sm line-clamp-4 mb-4 flex-1 tex2jax_process whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.question }} />
                      <button 
                        onClick={() => onStartPractice({ title: selectedChapter.name, questions: [q], durationMinutes: 5 })}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors mt-auto"
                      >
                        Practice Question
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-obsidian font-sans overflow-hidden selection:bg-electric/30">
      <div className={`fixed inset-y-0 left-0 z-40 bg-cyberdark border-r border-white/10 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-electric to-blue-600 flex items-center justify-center font-bold text-white text-lg">Q</div>
            <span className="font-bold text-white text-lg tracking-wide">Quantrex</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar py-4">
          <div className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Main Menu</div>
          <div className="space-y-0.5">
            {menuStructure.map(item => renderSidebarItem(item))}
          </div>
        </div>
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="h-16 flex items-center justify-between px-6 bg-cyberdark border-b border-white/10 z-30 shadow-sm relative shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white p-1">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-bold text-white hidden md:block">Quantrex Neural Platform</h1>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
               <ArrowLeft className="w-4 h-4"/> Back to LMS
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-obsidian to-obsidian relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          {activeMenu === 'dashboard' ? renderDashboard() : 
           activeMenu === 'bookmarks' ? renderBookmarks() : 
           selectedChapter ? renderChapterView() : 
           renderSubjectView()}
           
        </main>
      </div>
    </div>
  );
}

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);
