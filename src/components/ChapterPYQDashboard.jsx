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
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import { usePYQProgress } from '../hooks/usePYQProgress';
import BookmarkGroupModal from './BookmarkGroupModal';

// Strip LaTeX delimiters for plain text preview
const stripLatex = (html) => {
  if (!html) return '';
  let text = html;
  if (typeof text === 'object') {
    text = text.en?.content || text.en?.questionText || text.en?.direction || text.content || text.questionText || '';
  }
  if (typeof text !== 'string') {
    text = String(text);
  }
  // Remove display math $$...$$
  text = text.replace(/\$\$[^$]*\$\$/g, '[Math]');
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

export default function ChapterPYQDashboard({ chapterId, chapterName, pyqData, exam, isLight, onPracticeMode, onBack, initialTab = 'topic' }) {
  const { progress, stats, updateProgress, clearProgress, bookmarkGroups, addBookmarkGroup } = usePYQProgress(chapterId);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [bookmarkQuestionId, setBookmarkQuestionId] = useState(null); // topic, all, mistakes, buckets, analytics, more

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart this chapter? All your progress and marks will be permanently reset.")) {
      clearProgress();
    }
  };
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [selectedYears, setSelectedYears] = useState([]);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState('All');
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
      if (selectedYears.length > 0) list = list.filter(q => q.year && selectedYears.includes(q.year.toString()));
      if (typeFilter !== 'All') {
        list = list.filter(q => {
          const t = (q.type || q.questionType || '').toUpperCase().trim();
          if (typeFilter === 'Single Correct') return t === 'SINGLE_CORRECT' || t === 'SCQ' || t === 'SINGLE CORRECT' || t === 'MCQ (SINGLE CORRECT)' || t === 'SINGLE' || t === 'OBJECTIVE';
          if (typeFilter === 'Multi Correct') return t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'MULTIPLE_CORRECT' || t === 'MULTIPLE CORRECT' || t === 'MCQ (MULTIPLE CORRECT)' || t === 'MULTIPLE';
          if (typeFilter === 'Integer Type') return t === 'NUMERICAL' || t === 'NUMERICAL VALUE' || t === 'INTEGER' || t === 'INTEGER-VALUE' || t === 'SUBJECTIVE NUMERICAL' || t === 'NUMERICAL_VALUE' || t === 'NATURAL' || t === 'DECIMAL';
          if (typeFilter === 'Subjective') return t === 'SUBJECTIVE' || t === 'SHORT ANSWER' || t === 'LONG ANSWER';
          if (typeFilter === 'Match the Following') return t === 'MATCH' || t === 'MATCH_FOLLOWING' || t === 'MATCH THE FOLLOWING' || t === 'MATRIX' || t === 'MATRIX_MATCH';
          if (typeFilter === 'Comprehension') return t === 'COMPREHENSION' || t === 'PARAGRAPH' || t === 'PASSAGE';
          if (typeFilter === 'True or False') return t === 'TRUE_FALSE' || t === 'TRUE AND FALSE' || t === 'TRUE/FALSE';
          if (typeFilter === 'Fill in the Blanks') return t === 'FIB' || t === 'FILL_IN_THE_BLANKS' || t === 'FILL IN THE BLANKS' || t === 'FILL';
          return true;
        });
      }
      if (searchQuery) list = list.filter(q => (q.question?.en?.content || q.question || '').toLowerCase().includes(searchQuery.toLowerCase()));
      return list;
    };
  
    const availableTypes = useMemo(() => {
      if (exam === 'jee-mains') return ['Single Correct', 'Integer Type'];
      if (exam === 'jee-advanced') return ['Single Correct', 'Multi Correct', 'Integer Type', 'Fill in the Blanks', 'True or False', 'Subjective', 'Comprehension', 'Match the Following'];
      
      const types = new Set();
      allQuestions.forEach(q => {
        const t = (q.type || q.questionType || '').toUpperCase().trim();
        if (t === 'SINGLE_CORRECT' || t === 'SCQ' || t === 'SINGLE CORRECT' || t === 'MCQ (SINGLE CORRECT)') types.add('Single Correct');
        if (t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'MULTIPLE_CORRECT' || t === 'MULTIPLE CORRECT' || t === 'MCQ (MULTIPLE CORRECT)') types.add('Multi Correct');
        if (t === 'NUMERICAL' || t === 'NUMERICAL VALUE' || t === 'INTEGER' || t === 'INTEGER-VALUE') types.add('Integer Type');
        if (t === 'SUBJECTIVE') types.add('Subjective');
        if (t === 'MATCH' || t === 'MATCH_FOLLOWING' || t === 'MATCH THE FOLLOWING') types.add('Match the Following');
        if (t === 'COMPREHENSION') types.add('Comprehension');
        if (t === 'TRUE_FALSE' || t === 'TRUE AND FALSE') types.add('True or False');
        if (t === 'FIB' || t === 'FILL_IN_THE_BLANKS' || t === 'FILL IN THE BLANKS') types.add('Fill in the Blanks');
      });
      return Array.from(types).sort();
    }, [allQuestions, exam]);

    const availableYears = useMemo(() => {
      const ySet = new Set();
      allQuestions.forEach(q => { if(q.year) ySet.add(q.year.toString()) });
      return Array.from(ySet).sort((a,b) => Number(b) - Number(a));
    }, [allQuestions]);

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
      className={`rounded-xl p-5 mb-4 border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1e1e24] border-[#2d2d35]'} ${groupQs ? (isLight ? 'cursor-pointer hover:border-blue-500 hover:shadow-md' : 'cursor-pointer hover:border-blue-500/50') : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#111115] border-[#2d2d35] text-gray-400'}`}>
            {idx + 1}
          </span>
          <span className={`px-3 py-1 text-xs font-bold rounded ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#2d2d35] text-gray-300'}`}>{q.shift || q.year || q.title}</span>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded capitalize">{q.difficulty || 'Medium'}</span>
          {(() => {
            const t = q.type || q.questionType || 'SCQ';
            let color = 'indigo';
            let label = 'SCQ';
            if (t === 'NUMERICAL') { color = 'orange'; label = 'NUMERICAL'; }
            else if (t === 'MCQM' || t === 'MULTI_CORRECT') { color = 'purple'; label = 'MCQ (Multi)'; }
            else if (t === 'FIB') { color = 'pink'; label = 'FILL IN BLANKS'; }
            else if (t === 'SUBJECTIVE') { color = 'teal'; label = 'SUBJECTIVE'; }
            else if (t === 'MATCH') { color = 'cyan'; label = 'MATCH LIST'; }
            else if (t === 'COMPREHENSION') { color = 'rose'; label = 'COMPREHENSION'; }
            
            return (
              <span className={`px-3 py-1 text-xs font-bold rounded bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
                {label}
              </span>
            );
          })()}
          {progress[q.id]?.status === 'correct' && <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Correct</span>}
          {progress[q.id]?.status === 'wrong' && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">Wrong</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); handleBookmarkClick(q.id); }} className={`${(progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0) ? 'text-yellow-400' : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-700 hover:text-white')}`}>
          <Bookmark className="w-5 h-5" fill={(progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0) ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className={`text-sm mb-4 leading-relaxed line-clamp-3 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{stripLatex(q.question).substring(0, 220)}{stripLatex(q.question).length > 220 ? '...' : ''}</div>
      {!isBookmarkTab && (
        <div className="flex gap-3">
          <button onClick={(e) => { e.stopPropagation(); handleStartPractice([q], 'practice', true); }} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 shadow-sm transition-colors">Reattempt / View</button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`w-full flex flex-col space-y-6 min-h-screen p-4 md:p-6 rounded-2xl text-sans ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#111115] text-white'}`}>

        
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-xl transition-colors ${isLight ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200' : 'bg-black/20 text-gray-400 hover:text-white hover:bg-black/40'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className={`text-[28px] sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${isLight ? 'from-blue-600 via-indigo-600 to-purple-600' : 'from-blue-300 via-indigo-200 to-purple-300'} drop-shadow-sm pb-1`}>{chapterName || 'Chapter PYQs'}</h2>
        </div>
        <button 
          onClick={handleRestart}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-bold border ${isLight ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'}`}
        >
          <RefreshCw className="w-4 h-4" /> Restart
        </button>
      </div>

      {/* EXAMGOAL STYLED TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Qs', val: allQuestions.length, border: 'border-white/5', valClass: isLight ? 'text-slate-800' : 'text-white' },
          { label: 'Correct (+4)', val: stats.correct, border: 'border-l-green-500 border-l-4 border-t-white/5 border-r-white/5 border-b-white/5', valClass: 'text-green-500' },
          { label: 'Incorrect (-1)', val: stats.wrong, border: 'border-l-red-500 border-l-4 border-t-white/5 border-r-white/5 border-b-white/5', valClass: 'text-red-500' },
          { label: 'Accuracy', val: `${stats.accuracy}%`, border: 'border-l-blue-500 border-l-4 border-t-white/5 border-r-white/5 border-b-white/5', valClass: 'text-blue-500' },
          { label: 'Time Spent', val: formatTime(stats.timeSpent), border: 'border-l-purple-500 border-l-4 border-t-white/5 border-r-white/5 border-b-white/5', valClass: 'text-purple-500' }
        ].map((card, idx) => (
          <div key={idx} className={`p-4 rounded-xl shadow-lg relative overflow-hidden border ${isLight ? 'bg-white border-slate-200' : 'bg-gradient-to-br from-[#1e1e24] to-[#25252b] ' + card.border}`}>
            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{card.label}</span>
            <span className={`text-2xl font-black ${card.valClass}`}>{card.val}</span>
          </div>
        ))}
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
                <div className="relative">
                  <button 
                    onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                    className="bg-[#1e1e24] border border-[#2d2d35] text-white px-4 py-2 rounded-lg outline-none focus:border-blue-500 flex items-center gap-2 min-w-[140px] justify-between"
                  >
                    <span className="text-sm">{selectedYears.length === 0 ? 'All Years' : `${selectedYears.length} Years`}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isYearDropdownOpen && (
                    <div className="absolute top-full mt-1 w-48 bg-[#1e1e24] border border-[#2d2d35] rounded-lg shadow-xl z-50 p-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
                      <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2d2d35] rounded cursor-pointer text-sm text-white">
                        <input type="checkbox" checked={selectedYears.length === 0} onChange={() => setSelectedYears([])} className="rounded border-[#3d3d45] bg-[#2d2d35] text-blue-500 focus:ring-blue-500" />
                        All Years
                      </label>
                      {availableYears.map(y => (
                        <label key={y} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2d2d35] rounded cursor-pointer text-sm text-white">
                          <input type="checkbox" 
                            checked={selectedYears.includes(y)} 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedYears([...selectedYears, y]);
                              } else {
                                setSelectedYears(selectedYears.filter(year => year !== y));
                              }
                            }} 
                            className="rounded border-[#3d3d45] bg-[#2d2d35] text-blue-500 focus:ring-blue-500" 
                          />
                          {y}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <select 
                  value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="bg-[#1e1e24] border border-[#2d2d35] text-white px-4 py-2 rounded-lg outline-none focus:border-blue-500"
                >
                <option value="All">All Types</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
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
