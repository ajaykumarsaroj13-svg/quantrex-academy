import React, { useState, useMemo, useEffect } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import PlayCircle from 'lucide-react/dist/esm/icons/play-circle';
import Target from 'lucide-react/dist/esm/icons/target';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';
import Filter from 'lucide-react/dist/esm/icons/filter';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import List from 'lucide-react/dist/esm/icons/list';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Search from 'lucide-react/dist/esm/icons/search';
import Bookmark from 'lucide-react/dist/esm/icons/bookmark';
import AlignLeft from 'lucide-react/dist/esm/icons/align-left';
import Flag from 'lucide-react/dist/esm/icons/flag';
import MoreVertical from 'lucide-react/dist/esm/icons/more-vertical';
import Flame from 'lucide-react/dist/esm/icons/flame';
import { usePYQProgress } from '../hooks/usePYQProgress';
import BookmarkGroupModal from './BookmarkGroupModal';

// Strip LaTeX delimiters for plain text preview
const stripLatex = (html) => {
  if (!html) return '';
  // Remove display math $$...$$
  let text = html.replace(/\$\$[^$]*\$\$/g, '[Math]');
  // Remove inline math $...$
  text = text.replace(/\$[^$]*\$/g, '[Math]');
  // Remove \(...\) inline math
  text = text.replace(/\\\([^)]*\\\)/g, '[Math]');
  // Remove \[...\] display math
  text = text.replace(/\\\[[^\]]*\\\]/g, '[Math]');
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');
  return text.trim();
};

export default function ChapterPYQDashboard({ chapterId, chapterName, pyqData, isLight, onPracticeMode, onBack, initialTab = 'topic' }) {
  const { progress, stats, updateProgress, bookmarkGroups, addBookmarkGroup } = usePYQProgress(chapterId);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [bookmarkQuestionId, setBookmarkQuestionId] = useState(null); // topic, all, mistakes, buckets, analytics, more
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopic, setExpandedTopic] = useState(null);

  // Trigger MathJax typesetting whenever tab or questions change
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
      }, 100);
    }
  }, [activeTab, pyqData]);

  // Flatten all questions
  const allQuestions = useMemo(() => {
    const list = [];
    if (!pyqData || !pyqData.questions) return list;
    Object.keys(pyqData.questions).forEach(topicId => {
      pyqData.questions[topicId].forEach(q => {
        list.push({ ...q, topicId });
      });
    });
    return list;
  }, [pyqData]);

  // Derived arrays
  const mistakeQuestions = allQuestions.filter(q => progress[q.id]?.status === 'wrong');
  const bookmarkedQuestions = allQuestions.filter(q => progress[q.id]?.bookmarked || (progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0));
    
  const questionsByGroup = {};
  const ungroupedQuestions = [];
  bookmarkedQuestions.forEach(q => {
    const groups = progress[q.id]?.bookmarkGroups || [];
    if (groups.length === 0) {
      ungroupedQuestions.push(q);
    } else {
      groups.forEach(g => {
        if (!questionsByGroup[g]) questionsByGroup[g] = [];
        questionsByGroup[g].push(q);
      });
    }
  });
  
  const getFilteredQuestions = (source) => {
    let list = source;
    if (difficultyFilter !== 'All') list = list.filter(q => q.difficulty === difficultyFilter);
    if (yearFilter !== 'All') list = list.filter(q => q.year == yearFilter);
    if (searchQuery) list = list.filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  };

  const getProgressStats = (questions) => {
    let correct = 0, wrong = 0;
    questions.forEach(q => {
      if (progress[q.id]?.status === 'correct') correct++;
      if (progress[q.id]?.status === 'wrong') wrong++;
    });
    const total = questions.length || 1; // avoid division by zero
    return {
      correctPct: (correct / total) * 100,
      wrongPct: (wrong / total) * 100,
      unattemptedPct: ((questions.length - correct - wrong) / total) * 100
    };
  };

  // ExamGOAL Style Subtopic Card matching screenshot
  const renderTopicCard = (topic) => {
    const qs = pyqData?.questions?.[topic.id] || [];
    if (qs.length === 0) return null;
    
    // Real data from questions
    const years = qs.map(q => q.year).filter(Boolean).sort((a,b) => a - b);
    const minYear = years[0] || '';
    const maxYear = years[years.length - 1] || '';
    const yearRange = minYear && maxYear ? (minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`) : '';
    
    const stats = getProgressStats(qs);
    
    return (
        <div key={topic.id} className={`relative border rounded-xl p-5 shadow-sm flex flex-col transition-all hover:shadow-md ${isLight ? 'bg-white border-gray-200 hover:border-blue-200' : 'bg-[#1e1e24] border-[#2d2d35] hover:border-[#3d3d45]'}`}>
          <div className="flex justify-between items-start mb-3 gap-3">
            <h4 className={`font-bold tracking-tight text-[17px] capitalize leading-snug ${isLight ? 'text-black' : 'text-white'}`}>
              {topic.name.replace(/-/g, ' ')}
            </h4>
            <button className="text-blue-500 font-bold hover:bg-blue-500/10 rounded px-1 transition-colors shrink-0">⋮</button>
          </div>
        
        <div className={`text-[11px] mb-4 font-medium flex items-center flex-wrap gap-2 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
          <span className={`font-bold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>{qs.length} Questions</span>
          {yearRange && <span className="text-blue-400">· {yearRange}</span>}
        </div>

        <div className="flex gap-3 mb-1">
          <button 
            onClick={() => handleStartPractice(qs, 'test')}
            className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${
              isLight ? 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100' 
                      : 'bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            Take Test
          </button>
          <button 
            onClick={() => handleStartPractice(qs, 'practice')}
            className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${
              isLight ? 'bg-orange-50 border border-orange-200 text-orange-500 hover:bg-orange-100'
                      : 'bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
            }`}
          >
            Practice
          </button>
        </div>
        
        {/* Progress Bar at the bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex rounded-b-md overflow-hidden">
           <div className="h-full bg-green-500" style={{ width: `${stats.correctPct}%` }}></div>
           <div className="h-full bg-red-500" style={{ width: `${stats.wrongPct}%` }}></div>
           <div className="h-full bg-[#d1d5db]" style={{ width: `${stats.unattemptedPct}%` }}></div>
        </div>
      </div>
    );
  };

  const handleStartPractice = (questions, mode = 'practice', skipModal = false, startIndex = 0) => {
    if (questions.length === 0) return;
    onPracticeMode(questions, mode, skipModal, startIndex);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handleBookmarkClick = (qId) => {
    setBookmarkQuestionId(qId);
    setBookmarkModalOpen(true);
  };

  const saveBookmarkGroups = (groups) => {
    updateProgress(bookmarkQuestionId, { bookmarkGroups: groups });
  };

  // ExamGOAL Style Question List Item
  const renderQuestionItem = (q, idx, isBookmarkTab = false, groupQs = null) => (
    <div 
      key={q.id} 
      onClick={() => {
        if (groupQs) {
          handleStartPractice(groupQs, 'practice', true, idx);
        }
      }}
      className={`bg-[#1e1e24] border border-[#2d2d35] rounded-xl p-5 mb-4 ${groupQs ? 'cursor-pointer hover:border-blue-500/50 transition-colors' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#111115] border border-[#2d2d35] flex items-center justify-center text-sm font-bold text-gray-400">
            {idx + 1}
          </span>
          <span className="px-3 py-1 bg-[#2d2d35] text-gray-300 text-xs font-bold rounded">{q.shift || q.title || q.year}</span>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded">{q.difficulty || 'Medium'}</span>
          {progress[q.id]?.status === 'correct' && <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Correct</span>}
          {progress[q.id]?.status === 'wrong' && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">Wrong</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); handleBookmarkClick(q.id); }} className={`${(progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0) ? 'text-yellow-400' : 'text-gray-700 hover:text-white'}`}>
          <Bookmark className="w-5 h-5" fill={(progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0) ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">{stripLatex(q.question).substring(0, 220)}{stripLatex(q.question).length > 220 ? '...' : ''}</div>
      {!isBookmarkTab && (
        <div className="flex gap-3">
          <button onClick={(e) => { e.stopPropagation(); handleStartPractice([q], 'practice', true); }} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">Reattempt / View</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full flex flex-col space-y-6 bg-[#111115] min-h-screen p-4 md:p-6 rounded-2xl text-sans">

        
      {/* Header with Back Button */}
        {pyqData?.audioUrl && (
          <div className="mb-4 bg-[#1e1e24] p-4 rounded-xl border border-[#2d2d35]">
            <h3 className="text-sm font-bold text-white mb-2">Chapter Audio</h3>
            <audio controls src={pyqData.audioUrl} className="w-full" />
          </div>
        )}
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white transition-all hover:scale-105 active:scale-95">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-[28px] sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 drop-shadow-sm pb-1">{chapterName || 'Chapter PYQs'}</h2>
        </div>

      {/* EXAMGOAL STYLED TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-[#1e1e24] to-[#25252b] p-4 rounded-xl border border-white/5 shadow-lg relative overflow-hidden">
          <span className="text-xs text-gray-700 font-bold uppercase tracking-wider block mb-1">Total Qs</span>
          <span className="text-2xl font-black text-white">{allQuestions.length}</span>
        </div>
        <div className="bg-gradient-to-br from-[#1e1e24] to-[#25252b] p-4 rounded-xl border border-white/5 shadow-lg relative overflow-hidden border-l-4 border-l-green-500">
          <span className="text-xs text-gray-700 font-bold uppercase tracking-wider block mb-1">Correct (+4)</span>
          <span className="text-2xl font-black text-green-400">{stats.correct}</span>
        </div>
        <div className="bg-gradient-to-br from-[#1e1e24] to-[#25252b] p-4 rounded-xl border border-white/5 shadow-lg relative overflow-hidden border-l-4 border-l-red-500">
          <span className="text-xs text-gray-700 font-bold uppercase tracking-wider block mb-1">Incorrect (-1)</span>
          <span className="text-2xl font-black text-red-400">{stats.wrong}</span>
        </div>
        <div className="bg-gradient-to-br from-[#1e1e24] to-[#25252b] p-4 rounded-xl border border-white/5 shadow-lg relative overflow-hidden border-l-4 border-l-blue-500">
          <span className="text-xs text-gray-700 font-bold uppercase tracking-wider block mb-1">Accuracy</span>
          <span className="text-2xl font-black text-blue-400">{stats.accuracy}%</span>
        </div>
        <div className="bg-gradient-to-br from-[#1e1e24] to-[#25252b] p-4 rounded-xl border border-white/5 shadow-lg relative overflow-hidden border-l-4 border-l-purple-500">
          <span className="text-xs text-gray-700 font-bold uppercase tracking-wider block mb-1">Time Spent</span>
          <span className="text-2xl font-black text-purple-400">{formatTime(stats.timeSpent)}</span>
        </div>
      </div>

      {/* EXAMGOAL PILL TABS */}
      <div className="flex justify-center mb-8">
        <div className={`flex rounded-lg p-1 ${isLight ? 'bg-gray-100' : 'bg-[#1e1e24]'}`}>
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'mistakes', label: 'Mistakes' },
            { id: 'topic', label: 'Topic Wise' },
            { id: 'buckets', label: 'Buckets' },
            { id: 'bookmarks', label: 'Bookmarks' },
            { id: 'analytics', label: 'Analytics' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === t.id 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : `text-gray-700 hover:text-black ${isLight ? 'hover:bg-gray-200/50' : 'hover:bg-white/5'}`
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="pt-2">
        
        {/* TOPIC WISE TAB */}
        {activeTab === 'topic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pyqData?.topics?.map(renderTopicCard)}
          </div>
        )}

        {/* ALL QUESTIONS TAB */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-700"/>
                <input 
                  type="text" placeholder="Search questions..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1e1e24] border border-[#2d2d35] rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <select 
                value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}
                className="bg-[#1e1e24] border border-[#2d2d35] text-white px-4 py-2 rounded-lg outline-none focus:border-blue-500"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            {(() => {
              const filtered = getFilteredQuestions(allQuestions);
              return filtered.map((q, idx) => renderQuestionItem(q, idx, false, filtered));
            })()}
          </div>
        )}

        {/* MISTAKES TAB */}
        {activeTab === 'mistakes' && (
          <div className="space-y-4">
             <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4 text-red-400 text-sm font-medium flex items-center gap-2">
               <AlertTriangle className="w-5 h-5"/> Showing all questions you marked incorrectly. Reattempt them to master your weak spots!
             </div>
             {mistakeQuestions.length === 0 ? (
               <div className="text-center py-12 text-gray-700">No mistakes found. Great job!</div>
             ) : (
               (() => {
                 const filtered = getFilteredQuestions(mistakeQuestions);
                 return filtered.map((q, idx) => renderQuestionItem(q, idx, false, filtered));
               })()
             )}
          </div>
        )}

        {/* BUCKETS TAB */}
        {activeTab === 'buckets' && (() => {
          // Auto-detect year range to decide between recent years vs decade buckets
          const allYears = allQuestions.map(q => q.year).filter(Boolean);
          const minY = Math.min(...allYears);
          const maxY = Math.max(...allYears);
          const isHistorical = (maxY - minY) > 10; // JEE Advanced-style: many years

          let buckets;
          if (isHistorical) {
            // Decade buckets for JEE Advanced
            buckets = [
              { id: '2020s', title: '2020s Questions', desc: `Recent JEE Advanced (2020–${maxY})`, color: 'blue', filter: q => Number(q.year) >= 2020 },
              { id: '2010s', title: '2010s Questions', desc: 'JEE Advanced 2010–2019', color: 'purple', filter: q => Number(q.year) >= 2010 && Number(q.year) < 2020 },
              { id: '2000s', title: '2000s Questions', desc: 'JEE Advanced 2000–2009', color: 'green', filter: q => Number(q.year) >= 2000 && Number(q.year) < 2010 },
              { id: '1990s', title: '1990s Questions', desc: 'IIT-JEE 1990–1999', color: 'orange', filter: q => Number(q.year) >= 1990 && Number(q.year) < 2000 },
              { id: '1980s', title: '1980s Questions', desc: 'IIT-JEE 1980–1989', color: 'red', filter: q => Number(q.year) >= 1980 && Number(q.year) < 1990 },
              { id: 'pre1980', title: 'Pre-1980 Questions', desc: 'IIT-JEE Classic 1978–1979', color: 'yellow', filter: q => Number(q.year) < 1980 },
            ];
          } else {
            // Recent years for JEE Main
            buckets = [
              { id: '2024', title: '2024 Questions', desc: `JEE Main ${maxY} shifts`, color: 'blue', filter: q => Number(q.year) === maxY },
              { id: '2023', title: '2023 Questions', desc: 'JEE Main 2023 shifts', color: 'purple', filter: q => Number(q.year) === maxY - 1 },
              { id: '2022', title: '2022 Questions', desc: 'JEE Main 2022 shifts', color: 'green', filter: q => Number(q.year) === maxY - 2 },
              { id: '2021', title: '2021 Questions', desc: 'JEE Main 2021 shifts', color: 'orange', filter: q => Number(q.year) === maxY - 3 },
              { id: '2020', title: '2020 Questions', desc: 'JEE Main 2020 shifts', color: 'red', filter: q => Number(q.year) === maxY - 4 },
            ];
          }
          
          const colorMap = {
            blue: 'bg-blue-500',
            purple: 'bg-purple-500',
            green: 'bg-green-500',
            orange: 'bg-orange-500',
            red: 'bg-red-500',
            yellow: 'bg-yellow-500',
          };

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buckets.map(bucket => {
                const bucketQs = allQuestions.filter(bucket.filter);
                return (
                  <div key={bucket.id} className={`border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#1e1e24] border-[#2d2d35]'} rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${colorMap[bucket.color]}`}></div>
                    <h4 className={`text-lg font-bold mb-2 ${isLight ? 'text-gray-800' : 'text-white'}`}>{bucket.title}</h4>
                    <p className="text-gray-500 text-sm mb-4">{bucket.desc}</p>
                    <div className={`flex justify-between items-center text-sm font-medium mb-6 ${isLight ? 'bg-gray-50 text-black' : 'bg-[#2d2d35] text-white'} p-2 rounded`}>
                       <span>{bucketQs.length} Questions</span>
                    </div>
                    <button 
                      onClick={() => {
                         if (bucketQs.length === 0) {
                           alert('No questions available in this bucket yet!');
                           return;
                         }
                         handleStartPractice(bucketQs, 'practice', true);
                      }}
                      className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
                    >
                      Practice Now
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}


        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1e1e24] border border-[#2d2d35] rounded-xl p-6">
                   <h4 className="text-white font-bold mb-4">Accuracy Trend</h4>
                   <div className="flex items-end h-40 gap-2">
                     {[40, 50, 45, 60, 75, 80, 85].map((val, i) => (
                       <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm hover:bg-blue-500/40 relative group" style={{ height: `${val}%` }}>
                         <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-blue-400 opacity-0 group-hover:opacity-100">{val}%</span>
                       </div>
                     ))}
                   </div>
                </div>
                <div className="bg-[#1e1e24] border border-[#2d2d35] rounded-xl p-6">
                   <h4 className="text-white font-bold mb-4">Weak Topics Identification</h4>
                   <div className="space-y-4">
                     {pyqData?.topics?.slice(0,3).map((t,i) => (
                       <div key={t.id}>
                         <div className="flex justify-between text-xs mb-1">
                           <span className="text-gray-400">{t.name}</span>
                           <span className="text-red-400">Needs Work</span>
                         </div>
                         <div className="h-2 bg-[#2d2d35] rounded-full overflow-hidden">
                           <div className="h-full bg-red-500" style={{ width: `${Math.random() * 40 + 20}%` }}></div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-6">
             <div className="bg-[#1e1e24] border border-[#2d2d35] p-6 rounded-xl">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Bookmark className="w-5 h-5 text-yellow-400" fill="currentColor"/> Bookmarked Questions</h4>
                {bookmarkedQuestions.length === 0 ? (
                  <p className="text-gray-700 text-sm">You haven't bookmarked any questions yet.</p>
                ) : (
                  <div className="space-y-8">
                    {ungroupedQuestions.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2d2d35] pb-2">
                          <h5 className="text-blue-400 font-bold flex items-center gap-2">
                            Uncategorized Bookmarks
                            <span className="text-xs bg-blue-500/10 px-2 py-1 rounded text-blue-300">{ungroupedQuestions.length} Qs</span>
                          </h5>
                          <button onClick={() => handleStartPractice(ungroupedQuestions, 'practice', true)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg">Practice Group</button>
                        </div>
                        <div className="space-y-4 pl-2 border-l-2 border-[#2d2d35]">
                          {ungroupedQuestions.map((q, idx) => renderQuestionItem(q, idx, true, ungroupedQuestions))}
                        </div>
                      </div>
                    )}
                    
                    {Object.entries(questionsByGroup).map(([group, questions]) => (
                      <div key={group} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2d2d35] pb-2">
                          <h5 className="text-blue-400 font-bold flex items-center gap-2">
                            {group}
                            <span className="text-xs bg-blue-500/10 px-2 py-1 rounded text-blue-300">{questions.length} Qs</span>
                          </h5>
                          <button onClick={() => handleStartPractice(questions, 'practice', true)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg">Practice Group</button>
                        </div>
                        <div className="space-y-4 pl-2 border-l-2 border-[#2d2d35]">
                          {questions.map((q, idx) => renderQuestionItem(q, idx, true, questions))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
