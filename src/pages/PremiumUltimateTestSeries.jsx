import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import Bookmark from 'lucide-react/dist/esm/icons/bookmark';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ClipboardList from 'lucide-react/dist/esm/icons/clipboard-list';
import MessageCircleQuestion from 'lucide-react/dist/esm/icons/message-circle-question';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Target from 'lucide-react/dist/esm/icons/target';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Layers from 'lucide-react/dist/esm/icons/layers';
import BrainCircuit from 'lucide-react/dist/esm/icons/brain-circuit';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Info from 'lucide-react/dist/esm/icons/info';
import Bell from 'lucide-react/dist/esm/icons/bell';
import BellOff from 'lucide-react/dist/esm/icons/bell-off';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Rocket from 'lucide-react/dist/esm/icons/rocket';
import Lock from 'lucide-react/dist/esm/icons/lock';
import logoImg from '../assets/logo.png';
import PremiumBanner from '../components/PremiumBanner';
const PremiumUltimateTestSeries = ({ user, onStartTest, onViewResult, onBack, isLight }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Landing and Lock
  const [showLanding, setShowLanding] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(localStorage.getItem('quantrex_premium_unlocked') === 'true');
  
  // State for Navigation
  const [activeNav, setActiveNav] = useState('All Tests'); 
  const [activeCategory, setActiveCategory] = useState('Chapter and Topic Wise Tests');
  const [activeGroup, setActiveGroup] = useState('Physics'); 
  
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetch('/data/ultimate-series.json')
      .then(r => r.json())
      .then(d => {
        setTests(d);
        setLoading(false);
      })
      .catch(e => {
        console.error('Failed to load ultimate series data:', e);
        setLoading(false);
      });
  }, []);

  const handlePurchase = () => {
    localStorage.setItem('quantrex_premium_unlocked', 'true');
    setIsUnlocked(true);
    setShowPurchaseModal(false);
  };

  // Dynamic Attempts & Bookmarks
  const attempts = useMemo(() => {
    const list = [];
    tests.forEach(t => {
      const tid = t.testId || t.id || t.title;
      const res = localStorage.getItem(`quantrex_test_result_${tid}`);
      if (res) {
        try {
          list.push({ test: t, result: JSON.parse(res) });
        } catch (e) {}
      }
    });
    return list;
  }, [tests]);

  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('quantrex_ultimate_bookmarked_tests');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleBookmark = (tid) => {
    setBookmarkedIds(prev => {
      const next = prev.includes(tid) ? prev.filter(id => id !== tid) : [...prev, tid];
      localStorage.setItem('quantrex_ultimate_bookmarked_tests', JSON.stringify(next));
      return next;
    });
  };

  const groupTests = useMemo(() => {
    return tests.filter(t => t.category === activeCategory && t.groupName === activeGroup);
  }, [tests, activeCategory, activeGroup]);

  const totalTests = groupTests.length;
  const availableTests = groupTests.filter(t => !t.isUpcoming).length;
  const upcomingTests = groupTests.filter(t => t.isUpcoming).length;
  const attemptedTests = useMemo(() => {
    return attempts.filter(att => att.test.category === activeCategory && att.test.groupName === activeGroup).length;
  }, [attempts, activeCategory, activeGroup]);

  const sectionsMap = useMemo(() => {
    const map = new Map();
    groupTests.forEach(test => {
      const section = test.sectionName || 'General';
      if (!map.has(section)) map.set(section, []);
      map.get(section).push(test);
    });
    return map;
  }, [groupTests]);

  const sections = Array.from(sectionsMap.entries());

  // Theme configuration
  const theme = {
    bg: isLight ? 'bg-gray-50' : 'bg-[#0f1219]',
    bgNav: isLight ? 'bg-white' : 'bg-[#161a27]',
    bgSidebar: isLight ? 'bg-gray-100' : 'bg-[#1b1f2e]',
    bgContent: isLight ? 'bg-white' : 'bg-[#11141e]',
    bgCard: isLight ? 'bg-white' : 'bg-[#1a1f2e]',
    bgCardHover: isLight ? 'hover:bg-gray-50' : 'hover:bg-[#202638]',
    bgExpanded: isLight ? 'bg-gray-50' : 'bg-[#151925]',
    border: isLight ? 'border-gray-200' : 'border-[#262c40]',
    text: isLight ? 'text-gray-900' : 'text-white',
    textMuted: isLight ? 'text-gray-500' : 'text-gray-400',
    primary: 'text-[#3b82f6]',
    borderPrimary: 'border-[#3b82f6]'
  };

  if (showLanding) {
    return <PremiumBanner onStart={() => setShowLanding(false)} onBack={onBack} fullScreen={true} theme={isLight ? 'light' : 'dark'} />;
  }

  // --- Main App Area (After Explore) ---
  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-hidden h-screen ${theme.bg} ${theme.text}`}>
      
      {/* Top Header */}
      <div className={`${theme.bgContent} border-b ${theme.border} px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10`}>
         <div className="flex items-center gap-3">
           <button onClick={() => setShowLanding(true)} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
              <ArrowLeft className={`w-5 h-5 ${theme.textMuted}`} />
           </button>
           <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg overflow-hidden border border-blue-500/30 shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center p-0.5">
               <img src={logoImg} alt="Quantrex" className="h-full w-full object-cover rounded-md" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-[#3b82f6] font-bold text-lg leading-none m-0 tracking-tight">Quantrex Academy</h1>
                <span className={`${theme.textMuted} text-xs font-medium`}>JEE Main Ultimate Series - 2027</span>
             </div>
           </div>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Far-Left Vertical Nav (Icon Bar) */}
        <div className={`w-20 ${theme.bgNav} border-r ${theme.border} flex flex-col items-center py-4 gap-2 shrink-0 z-10 hidden md:flex`}>
          <NavIconButton icon={<FileText className="w-5 h-5" />} label="All Tests" active={activeNav === 'All Tests'} onClick={() => setActiveNav('All Tests')} isLight={isLight} theme={theme} />
          <NavIconButton icon={<BarChart2 className="w-5 h-5" />} label="Analytics" active={activeNav === 'Analytics'} onClick={() => setActiveNav('Analytics')} isLight={isLight} theme={theme} />
          <NavIconButton icon={<XCircle className="w-5 h-5" />} label="Mistakes" active={activeNav === 'Mistakes'} onClick={() => setActiveNav('Mistakes')} isLight={isLight} theme={theme} />
          <NavIconButton icon={<Bookmark className="w-5 h-5" />} label="Bookmarks" active={activeNav === 'Bookmarks'} onClick={() => setActiveNav('Bookmarks')} isLight={isLight} theme={theme} />
        </div>

        {/* Sidebar Menu (Categories & Groups) */}
        <div className={`w-72 ${theme.bgSidebar} border-r ${theme.border} overflow-y-auto shrink-0 py-5 custom-scrollbar hidden md:block`}>
          
          <div className="mb-8">
            <div className={`px-4 text-[10px] ${isLight ? 'text-gray-400 border-gray-300' : 'text-gray-500 border-gray-600/50'} font-black uppercase tracking-wider mb-3 flex items-center gap-2`}>
              <span className={`w-full border-t ${isLight ? 'border-gray-300' : 'border-gray-600/50'}`}></span>
              <span className="whitespace-nowrap">CHAPTER & TOPIC WISE TESTS</span>
              <span className={`w-full border-t ${isLight ? 'border-gray-300' : 'border-gray-600/50'}`}></span>
            </div>
            <SidebarItem label="Physics" active={activeCategory === 'Chapter and Topic Wise Tests' && activeGroup === 'Physics'} onClick={() => { setActiveCategory('Chapter and Topic Wise Tests'); setActiveGroup('Physics'); setExpandedSection(null); }} isLight={isLight} theme={theme} />
            <SidebarItem label="Mathematics" active={activeCategory === 'Chapter and Topic Wise Tests' && activeGroup === 'Mathematics'} onClick={() => { setActiveCategory('Chapter and Topic Wise Tests'); setActiveGroup('Mathematics'); setExpandedSection(null); }} isLight={isLight} theme={theme} />
            <SidebarItem label="Chemistry" active={activeCategory === 'Chapter and Topic Wise Tests' && activeGroup === 'Chemistry'} onClick={() => { setActiveCategory('Chapter and Topic Wise Tests'); setActiveGroup('Chemistry'); setExpandedSection(null); }} isLight={isLight} theme={theme} />
          </div>

          <div>
            <div className={`px-4 text-[10px] ${isLight ? 'text-gray-400 border-gray-300' : 'text-gray-500 border-gray-600/50'} font-black uppercase tracking-wider mb-3 flex items-center gap-2`}>
              <span className={`w-full border-t ${isLight ? 'border-gray-300' : 'border-gray-600/50'}`}></span>
              <span className="whitespace-nowrap">QUANTREX MOCK TESTS</span>
              <span className={`w-full border-t ${isLight ? 'border-gray-300' : 'border-gray-600/50'}`}></span>
            </div>
            <SidebarItem label="Full Tests" active={activeCategory === 'Quantrex Academy Mock Tests' && activeGroup === 'Full Tests'} onClick={() => { setActiveCategory('Quantrex Academy Mock Tests'); setActiveGroup('Full Tests'); setExpandedSection(null); }} isLight={isLight} theme={theme} />
            <SidebarItem label="Part Tests" active={activeCategory === 'Quantrex Academy Mock Tests' && activeGroup === 'Part Tests'} onClick={() => { setActiveCategory('Quantrex Academy Mock Tests'); setActiveGroup('Part Tests'); setExpandedSection(null); }} isLight={isLight} theme={theme} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 ${theme.bgContent} flex flex-col overflow-hidden relative`}>
           
           {/* Top Stats Row */}
           <div className={`px-4 sm:px-8 py-4 sm:py-5 shrink-0 flex flex-wrap gap-2 sm:gap-4 border-b ${theme.border} ${isLight ? 'bg-gray-50' : 'bg-[#1b1f2e]'}`}>
              <StatBadge icon={<FileText className="w-4 h-4" />} label="Total" value={totalTests} color="gray" isLight={isLight} />
              <StatBadge icon={<CheckCircle2 className="w-4 h-4" />} label="Available" value={availableTests} color="emerald" isLight={isLight} />
              <StatBadge icon={<Clock className="w-4 h-4" />} label="Upcoming" value={upcomingTests} color="amber" isLight={isLight} />
              <StatBadge icon={<BarChart2 className="w-4 h-4" />} label="Attempted" value={attemptedTests} color="blue" isLight={isLight} />
           </div>
           
           {/* Mobile Navigation (replaces sidebar on small screens) */}
           <div className={`md:hidden px-4 py-3 border-b ${theme.border} flex flex-wrap gap-2`}>
             {['Physics', 'Mathematics', 'Chemistry'].map(group => (
               <button 
                 key={group}
                 onClick={() => { setActiveCategory('Chapter and Topic Wise Tests'); setActiveGroup(group); setExpandedSection(null); }}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${activeCategory === 'Chapter and Topic Wise Tests' && activeGroup === group ? (isLight ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-blue-500/20 border-blue-500/30 text-blue-400') : (isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-[#22273b] border-[#2d3246] text-gray-400')}`}
               >
                 {group}
               </button>
             ))}
             {['Full Tests', 'Part Tests'].map(group => (
               <button 
                 key={group}
                 onClick={() => { setActiveCategory('Quantrex Academy Mock Tests'); setActiveGroup(group); setExpandedSection(null); }}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${activeCategory === 'Quantrex Academy Mock Tests' && activeGroup === group ? (isLight ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-blue-500/20 border-blue-500/30 text-blue-400') : (isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-[#22273b] border-[#2d3246] text-gray-400')}`}
               >
                 {group}
               </button>
             ))}
           </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 custom-scrollbar relative">
               
               {activeNav === 'All Tests' && (
                 <>
                   <h2 className={`text-xl sm:text-2xl font-bold mb-6 ${theme.text}`}>
                      {activeCategory === 'Chapter and Topic Wise Tests' ? 'Topics' : activeGroup}
                   </h2>

                   {loading ? (
                     <div className={`py-20 flex justify-center ${theme.textMuted} font-medium`}>Loading test series...</div>
                   ) : sections.length === 0 ? (
                     <div className={`py-20 text-center ${theme.textMuted} font-medium`}>No sections found for this group.</div>
                   ) : (
                     <div className="flex flex-col gap-3 max-w-5xl">
                        {sections.map(([sectionName, testsList]) => {
                           const isExpanded = expandedSection === sectionName;
                           const sAvailable = testsList.filter(t => !t.isUpcoming).length;
                           const sUpcoming = testsList.filter(t => t.isUpcoming).length;
                           const sFree = isUnlocked ? testsList.length : 1; 

                           return (
                              <div key={sectionName} className={`${theme.bgCard} rounded-xl border ${isExpanded ? theme.borderPrimary + ' shadow-md' : theme.border} overflow-hidden transition-all duration-300`}>
                                 <div 
                                    onClick={() => setExpandedSection(isExpanded ? null : sectionName)}
                                    className={`px-4 sm:px-6 py-4 cursor-pointer ${theme.bgCardHover} transition-colors flex items-center justify-between group`}
                                 >
                                    <div className="pr-4">
                                       <h3 className={`font-bold text-base sm:text-lg mb-1.5 ${isLight ? 'text-gray-800' : 'text-gray-100'} group-hover:${theme.primary} transition-colors leading-tight`}>{sectionName}</h3>
                                       <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs font-semibold">
                                          {sFree > 0 && <span className="text-blue-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {sFree} {isUnlocked ? 'Unlocked' : 'Free'}</span>}
                                          {sAvailable > 0 && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {sAvailable} Available</span>}
                                          {sUpcoming > 0 && <span className="text-amber-500 flex items-center gap-1"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {sUpcoming} Upcoming</span>}
                                       </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 shrink-0 ${theme.textMuted} transition-transform duration-300 ${isExpanded ? 'rotate-90 text-blue-500' : 'group-hover:text-blue-500'}`} />
                                 </div>

                                 {/* Expanded Tests List */}
                                 <AnimatePresence>
                                    {isExpanded && (
                                       <motion.div 
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className={`border-t ${theme.border} ${theme.bgExpanded} overflow-hidden`}
                                       >
                                          <div className="p-3 sm:p-4 flex flex-col gap-2.5">
                                             {testsList.map((test, index) => {
                                                const isLocked = !isUnlocked && index > 0;
                                                const tid = test.testId || test.id || test.title;
                                                const isBookmarked = bookmarkedIds.includes(tid);
                                                
                                                return (
                                                <div key={tid} className={`${isLight ? 'bg-white' : 'bg-[#22273b]'} border ${theme.border} rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between hover:border-blue-500/50 transition-all shadow-sm group relative overflow-hidden`}>
                                                   {/* Lock overlay visual hint */}
                                                   {isLocked && !test.isUpcoming && (
                                                     <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                                       <Lock className="w-24 h-24" />
                                                     </div>
                                                   )}

                                                   <div className={`flex flex-col gap-2 mb-4 md:mb-0 ${isLocked ? 'opacity-70' : ''}`}>
                                                      <div className={`text-sm sm:text-base font-bold ${theme.text} group-hover:text-blue-500 transition-colors flex items-center gap-2 pr-10`}>
                                                        {isLocked && !test.isUpcoming && <Lock className="w-4 h-4 text-amber-500 shrink-0" />}
                                                        {test.title}
                                                      </div>
                                                      
                                                      {/* Syllabus / Section Tag */}
                                                      <div className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 w-fit rounded-md ${isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-400'}`}>
                                                        Syllabus: {test.sectionName || sectionName}
                                                      </div>

                                                      <div className={`flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm ${theme.textMuted} font-medium mt-1`}>
                                                         <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" /> {test.totalQuestions} Questions</span>
                                                         <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" /> {test.durationMinutes} Mins</span>
                                                         <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" /> {test.maxMarks} Marks</span>
                                                         {test.isUpcoming && (
                                                            <span className="flex items-center gap-1 text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 text-[10px] sm:text-xs font-bold ml-0 sm:ml-1 mt-1 sm:mt-0 w-fit">
                                                               <Calendar className="w-3 h-3" /> 
                                                               Live on {new Date(test.liveAt).toLocaleDateString()}
                                                            </span>
                                                         )}
                                                      </div>
                                                   </div>

                                                   {/* Bookmark Toggle */}
                                                   {!test.isUpcoming && (
                                                     <button 
                                                       onClick={(e) => { e.stopPropagation(); toggleBookmark(tid); }}
                                                       className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${
                                                         isBookmarked 
                                                           ? 'text-amber-500 bg-amber-500/10' 
                                                           : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                       }`}
                                                       title={isBookmarked ? "Remove Bookmark" : "Bookmark Test"}
                                                     >
                                                       <Bookmark className="w-4 h-4 fill-current" style={{ fill: isBookmarked ? 'currentColor' : 'none' }} />
                                                     </button>
                                                   )}

                                                   <div className="shrink-0 flex items-center gap-2.5 relative z-10 w-full md:w-auto mt-2 md:mt-0">
                                                      {test.isUpcoming ? (
                                                         <button disabled className={`w-full md:w-auto px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold ${isLight ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white/5 text-gray-500 border-white/5'} cursor-not-allowed border`}>
                                                            Upcoming
                                                         </button>
                                                      ) : isLocked ? (
                                                         <button 
                                                            onClick={() => setShowPurchaseModal(true)}
                                                            className={`w-full md:w-auto px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-400 hover:to-orange-400 transition-colors flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]`}
                                                         >
                                                            <Lock className="w-4 h-4" /> Unlock Test
                                                         </button>
                                                      ) : (() => {
                                                         const isAttempted = localStorage.getItem(`quantrex_test_result_${tid}`);
                                                         const isResumable = localStorage.getItem(`quantrex_exam_state_${tid}`);
                                                         return (
                                                           <div className="flex gap-2 w-full md:w-auto">
                                                             {isAttempted && (
                                                               <button 
                                                                 onClick={() => onViewResult && onViewResult(tid)}
                                                                 className={`flex-1 md:flex-none px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                                                                   isLight 
                                                                     ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700' 
                                                                     : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400'
                                                                 }`}
                                                               >
                                                                 Result
                                                               </button>
                                                             )}
                                                             <button 
                                                                onClick={() => onStartTest(tid, 'exam', 'ultimate-test-series')}
                                                                className={`flex-1 md:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                                                                  isAttempted 
                                                                    ? (isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-gray-300')
                                                                    : 'bg-blue-600 hover:bg-blue-50 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                                                                }`}
                                                             >
                                                                {isResumable ? 'Resume' : (isAttempted ? 'Retake' : 'Start Test')} <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                                             </button>
                                                           </div>
                                                         );
                                                      })()}
                                                   </div>
                                                </div>
                                             )})}
                                          </div>
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </div>
                           );
                        })}
                     </div>
                   )}
                 </>
               )}

               {/* ANALYTICS TAB */}
               {activeNav === 'Analytics' && (
                 <div className="space-y-6 max-w-5xl">
                   <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${theme.text}`}>Performance & Analytics</h2>
                   <p className={`${theme.textMuted} text-xs mb-6`}>Analytics tailored specifically for the JEE Main Ultimate Test Series.</p>
                   
                   {(() => {
                     const hasData = attempts.length > 0;
                     const displayAttempts = hasData ? attempts.length : 4;
                     const displayAvg = hasData ? Math.round(attempts.reduce((acc, curr) => acc + (curr.result.score || 0), 0) / attempts.length) : 184;
                     const displayBest = hasData ? Math.max(...attempts.map(a => a.result.score || 0)) : 246;
                     const displayAcc = hasData 
                       ? Math.round((attempts.reduce((acc, curr) => acc + (curr.result.correct || 0), 0) / (attempts.reduce((acc, curr) => acc + (curr.result.correct || 0), 0) + attempts.reduce((acc, curr) => acc + (curr.result.wrong || 0), 0) || 1)) * 100) 
                       : 76;

                     const scoreData = hasData 
                       ? attempts.map((a, idx) => ({ name: `T-${idx+1}`, score: a.result.score }))
                       : [
                           { name: 'Test 1', score: 156 },
                           { name: 'Test 2', score: 182 },
                           { name: 'Test 3', score: 204 },
                           { name: 'Test 4', score: 194 }
                         ];

                     const distributionData = hasData
                       ? [
                           { name: 'Correct', value: attempts.reduce((acc, curr) => acc + (curr.result.correct || 0), 0), color: '#10b981' },
                           { name: 'Wrong', value: attempts.reduce((acc, curr) => acc + (curr.result.wrong || 0), 0), color: '#ef4444' }
                         ]
                       : [
                           { name: 'Correct', value: 120, color: '#10b981' },
                           { name: 'Wrong', value: 40, color: '#ef4444' }
                         ];

                     return (
                       <>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                           <div className={`p-5 rounded-2xl border ${theme.bgCard} ${theme.border}`}>
                             <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Attempted</span>
                             <h2 className="text-3xl font-black mt-1 text-blue-500">{displayAttempts} Tests</h2>
                             {!hasData && <span className="text-[9px] text-amber-500 font-bold block mt-1">Showing Demo Stats</span>}
                           </div>
                           <div className={`p-5 rounded-2xl border ${theme.bgCard} ${theme.border}`}>
                             <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Average Score</span>
                             <h2 className="text-3xl font-black mt-1 text-purple-400">{displayAvg} / 300</h2>
                           </div>
                           <div className={`p-5 rounded-2xl border ${theme.bgCard} ${theme.border}`}>
                             <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Best Score</span>
                             <h2 className="text-3xl font-black mt-1 text-emerald-400">{displayBest} / 300</h2>
                           </div>
                           <div className={`p-5 rounded-2xl border ${theme.bgCard} ${theme.border}`}>
                             <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Accuracy</span>
                             <h2 className="text-3xl font-black mt-1 text-amber-500">{displayAcc}%</h2>
                           </div>
                         </div>

                         {/* Charts */}
                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                           <div className={`lg:col-span-8 p-5 rounded-2xl border ${theme.bgCard} ${theme.border} flex flex-col justify-between`}>
                             <h4 className="font-bold text-xs uppercase tracking-wider font-mono mb-4">Score Trends</h4>
                             <div className="h-[220px] w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={scoreData}>
                                   <defs>
                                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                     </linearGradient>
                                   </defs>
                                   <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                   <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} domain={[0, 300]} />
                                   <Tooltip contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                   <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" name="Score" strokeWidth={2} />
                                 </AreaChart>
                               </ResponsiveContainer>
                             </div>
                           </div>

                           <div className={`lg:col-span-4 p-5 rounded-2xl border ${theme.bgCard} ${theme.border} flex flex-col justify-between`}>
                             <h4 className="font-bold text-xs uppercase tracking-wider font-mono mb-4">Answer Accuracy</h4>
                             <div className="h-[180px] w-full flex items-center justify-center">
                               <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                   <Pie
                                     data={distributionData}
                                     cx="50%"
                                     cy="50%"
                                     innerRadius={50}
                                     outerRadius={70}
                                     paddingAngle={5}
                                     dataKey="value"
                                   >
                                     {distributionData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                     ))}
                                   </Pie>
                                   <Tooltip />
                                 </PieChart>
                               </ResponsiveContainer>
                             </div>
                             <div className="flex justify-center gap-4 text-[10px] font-bold">
                               <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Correct</span>
                               <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500"></span> Wrong</span>
                             </div>
                           </div>
                         </div>

                         {/* Subject Accuracy */}
                         <div className={`p-5 rounded-2xl border ${theme.bgCard} ${theme.border} mt-6`}>
                           <h4 className="font-bold text-xs uppercase tracking-wider font-mono mb-4">Subject Wise Correctness</h4>
                           <div className="space-y-4">
                             {[
                               { subject: 'Physics', accuracy: hasData ? Math.round(attempts.reduce((acc, curr) => acc + (curr.result.questionResults?.filter(qr => qr.subject === 'Physics' && qr.isCorrect).length || 0), 0) / (attempts.reduce((acc, curr) => acc + (curr.result.questionResults?.filter(qr => qr.subject === 'Physics' && qr.isAttempted).length || 0), 0) || 1) * 100) || 72 : 72, color: 'bg-blue-500' },
                               { subject: 'Mathematics', accuracy: hasData ? Math.round(attempts.reduce((acc, curr) => acc + (curr.result.questionResults?.filter(qr => qr.subject === 'Mathematics' && qr.isCorrect).length || 0), 0) / (attempts.reduce((acc, curr) => acc + (curr.result.questionResults?.filter(qr => qr.subject === 'Mathematics' && qr.isAttempted).length || 0), 0) || 1) * 100) || 68 : 68, color: 'bg-amber-500' },
                               { subject: 'Chemistry', accuracy: hasData ? Math.round(attempts.reduce((acc, curr) => acc + (curr.result.questionResults?.filter(qr => qr.subject === 'Chemistry' && qr.isCorrect).length || 0), 0) / (attempts.reduce((acc, curr) => acc + (curr.result.questionResults?.filter(qr => qr.subject === 'Chemistry' && qr.isAttempted).length || 0), 0) || 1) * 100) || 82 : 82, color: 'bg-emerald-500' }
                             ].map((subj, idx) => (
                               <div key={idx} className="space-y-1">
                                 <div className="flex justify-between text-xs font-bold">
                                   <span>{subj.subject}</span>
                                   <span>{subj.accuracy}% Accuracy</span>
                                 </div>
                                 <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                                   <div className={`h-full ${subj.color}`} style={{ width: `${subj.accuracy}%` }} />
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               )}

               {/* MISTAKES TAB */}
               {activeNav === 'Mistakes' && (
                 <div className="space-y-6 max-w-5xl">
                   <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${theme.text}`}>Mistakes & Review</h2>
                   <p className={`${theme.textMuted} text-xs mb-6`}>Review questions you answered incorrectly in the Ultimate Series tests.</p>
                   
                   {(() => {
                     const hasData = attempts.length > 0;
                     // Extract mistake questions from attempts
                     const userMistakes = [];
                     attempts.forEach(att => {
                       const qResults = att.result.questionResults || [];
                       qResults.forEach((qr, idx) => {
                         if (qr.isAttempted && !qr.isCorrect) {
                           userMistakes.push({
                             testTitle: att.test.title,
                             testId: att.test.testId || att.test.id,
                             questionNumber: qr.questionNumber || idx + 1,
                             subject: qr.subject || att.test.groupName || 'Miscellaneous',
                             topic: qr.topic || att.test.sectionName || 'General',
                             userAnswer: qr.userAnswer,
                             correctAnswer: qr.correctAnswer || qr.correctOption
                           });
                         }
                       });
                     });

                     const displayMistakes = userMistakes.length > 0 ? userMistakes : [
                       { testTitle: "Units and Measurement Test - 1", testId: "test_units_1", questionNumber: 4, subject: "Physics", topic: "Dimensional Homogeneity", userAnswer: "2", correctAnswer: "1" },
                       { testTitle: "Complex Numbers Test - 2", testId: "test_complex_2", questionNumber: 12, subject: "Mathematics", topic: "De Moivre Theorem", userAnswer: "3", correctAnswer: "4" }
                     ];

                     return (
                       <div className="space-y-3">
                         {!hasData && (
                           <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] rounded-xl font-bold">
                             💡 Note: Showing demo mistakes. Attempt tests to populate this list dynamically.
                           </div>
                         )}
                         {displayMistakes.map((mistake, idx) => (
                           <div key={idx} className={`p-4 rounded-xl border ${theme.bgCard} ${theme.border} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
                             <div className="space-y-1.5">
                               <div className="flex items-center gap-2">
                                 <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                                   Q{mistake.questionNumber} Incorrect
                                 </span>
                                 <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                   {mistake.subject}
                                 </span>
                               </div>
                               <h4 className="font-bold text-sm text-white pr-4">{mistake.testTitle}</h4>
                               <p className="text-[10px] text-gray-400">Topic: <strong className="text-gray-300">{mistake.topic}</strong> • Your Ans: <strong className="text-red-400">{mistake.userAnswer}</strong> • Correct: <strong className="text-emerald-400">{mistake.correctAnswer}</strong></p>
                             </div>
                             
                             <button
                               onClick={() => onViewResult && onViewResult(mistake.testId)}
                               className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
                             >
                               Review Solution <ChevronRight className="w-3.5 h-3.5" />
                             </button>
                           </div>
                         ))}
                       </div>
                     );
                   })()}
                 </div>
               )}

               {/* BOOKMARKS TAB */}
               {activeNav === 'Bookmarks' && (
                 <div className="space-y-6 max-w-5xl">
                   <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${theme.text}`}>Bookmarked Tests</h2>
                   <p className={`${theme.textMuted} text-xs mb-6`}>Access your bookmarked tests from the Ultimate Series.</p>
                   
                   {(() => {
                     const bookmarks = tests.filter(t => bookmarkedIds.includes(t.testId || t.id || t.title));
                     if (bookmarks.length === 0) {
                       return (
                         <div className="py-20 text-center text-gray-500 text-sm font-medium">
                           No bookmarked tests. Click the bookmark icon on any test in the 'All Tests' list to save it here.
                         </div>
                       );
                     }

                     return (
                       <div className="flex flex-col gap-3">
                         {bookmarks.map((test, index) => {
                           const tid = test.testId || test.id || test.title;
                           const isAttempted = localStorage.getItem(`quantrex_test_result_${tid}`);
                           const isResumable = localStorage.getItem(`quantrex_exam_state_${tid}`);
                           
                           return (
                             <div key={tid} className={`${isLight ? 'bg-white' : 'bg-[#22273b]'} border ${theme.border} rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between hover:border-blue-500/50 transition-all shadow-sm group relative overflow-hidden`}>
                               <div className="flex flex-col gap-2 mb-4 md:mb-0">
                                  <div className={`text-sm sm:text-base font-bold ${theme.text} group-hover:text-blue-500 transition-colors flex items-center gap-2 pr-10`}>
                                    {test.title}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <div className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md ${isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/10 text-purple-400'}`}>
                                      {test.groupName}
                                    </div>
                                    <div className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-md ${isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-400'}`}>
                                      Syllabus: {test.sectionName || 'General'}
                                    </div>
                                  </div>

                                  <div className={`flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm ${theme.textMuted} font-medium mt-1`}>
                                     <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" /> {test.totalQuestions} Questions</span>
                                     <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" /> {test.durationMinutes} Mins</span>
                                     <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" /> {test.maxMarks} Marks</span>
                                  </div>
                               </div>

                               {/* Bookmark Toggle */}
                               <button 
                                 onClick={(e) => { e.stopPropagation(); toggleBookmark(tid); }}
                                 className="absolute top-3 right-3 p-1.5 rounded-lg text-amber-500 bg-amber-500/10 transition-colors"
                                 title="Remove Bookmark"
                               >
                                 <Bookmark className="w-4 h-4 fill-current" />
                               </button>

                               <div className="shrink-0 flex items-center gap-2.5 relative z-10 w-full md:w-auto mt-2 md:mt-0">
                                  <div className="flex gap-2 w-full md:w-auto">
                                    {isAttempted && (
                                      <button 
                                        onClick={() => onViewResult && onViewResult(tid)}
                                        className={`flex-1 md:flex-none px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                                          isLight 
                                            ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700' 
                                            : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400'
                                        }`}
                                      >
                                        Result
                                      </button>
                                    )}
                                    <button 
                                       onClick={() => onStartTest(tid, 'exam', 'ultimate-test-series')}
                                       className={`flex-1 md:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                                         isAttempted 
                                           ? (isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-gray-300')
                                           : 'bg-blue-600 hover:bg-blue-50 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                                       }`}
                                    >
                                       {isResumable ? 'Resume' : (isAttempted ? 'Retake' : 'Start Test')} <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                  </div>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     );
                   })()}
                 </div>
               )}

            </div>
        </div>
      </div>
      
      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowPurchaseModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#12182b] border border-[#1e2538] rounded-3xl p-6 sm:p-8 max-w-[400px] w-full relative z-10 shadow-2xl overflow-hidden"
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
              
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 transition-colors rounded-full hover:bg-white/10"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="text-center mt-2">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-6 border border-amber-500/30">
                  <Lock className="w-10 h-10 text-amber-500" />
                </div>
                
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight leading-tight">Unlock Premium Access</h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Get full access to all <strong className="text-white">530+</strong> Topic, Chapter, and Full-length mock tests for JEE Main 2027.
                </p>

                <div className="bg-[#0b101e] border border-amber-500/30 rounded-2xl p-6 mb-8 relative shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                    Limited Time Offer
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center gap-2 mb-1">
                       <span className="text-gray-500 font-bold line-through decoration-red-500/70 decoration-2 text-xl">₹1999</span>
                       <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">75% OFF</span>
                    </div>
                    <div className="flex items-start justify-center gap-1">
                      <span className="text-2xl text-amber-500 font-bold mt-1.5">₹</span>
                      <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md">499</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-lg font-black py-4 rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-[1.03] active:scale-[0.97] border border-amber-400/50 flex flex-col items-center justify-center gap-1"
                >
                  <span>Buy Now</span>
                  <span className="text-[10px] font-medium opacity-80 font-mono tracking-widest uppercase">Unlock Full Series</span>
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4 text-emerald-500/70" />
                  Secured by <span className="font-bold text-blue-400/80 tracking-normal">Razorpay</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isLight ? '#d1d5db' : '#374151'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isLight ? '#9ca3af' : '#4b5563'};
        }
      `}} />
    </div>
  );
};

// Sub-components
const NavIconButton = ({ icon, label, active, onClick, isLight, theme }) => (
   <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 w-[64px] h-[68px] rounded-2xl transition-all duration-300 group ${
         active 
            ? `${isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-[#22273b] border-[#2d3246] text-[#3b82f6]'} shadow-sm border` 
            : `${theme.textMuted} hover:${theme.text} ${isLight ? 'hover:bg-gray-100' : 'hover:bg-[#22273b]/50'} border border-transparent`
      }`}
   >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
         {icon}
      </div>
      <span className="text-[10px] font-bold tracking-tight text-center leading-none">{label}</span>
   </button>
);

const SidebarItem = ({ label, active, onClick, isLight, theme }) => (
   <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-all duration-200 border-l-[3px] font-medium ${
         active 
            ? `border-[#3b82f6] ${isLight ? 'bg-blue-50 text-blue-700' : 'bg-[#22273b] text-white'} shadow-sm` 
            : `border-transparent ${theme.textMuted} hover:${theme.text} ${isLight ? 'hover:bg-gray-200/50' : 'hover:bg-white/5'}`
      }`}
   >
      <span>{label}</span>
      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${active ? 'text-[#3b82f6] translate-x-1' : theme.textMuted}`} />
   </button>
);

const StatBadge = ({ icon, label, value, color, isLight }) => {
   const colorConfig = {
      gray: isLight ? 'border-gray-200 text-gray-600 bg-white' : 'border-gray-500/20 text-gray-300 bg-gray-500/10',
      emerald: isLight ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
      amber: isLight ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-amber-500/20 text-amber-500 bg-amber-500/10',
      blue: isLight ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-blue-500/20 text-[#3b82f6] bg-blue-500/10',
   };

   return (
      <div className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-xl border shadow-sm flex-1 min-w-[120px] ${colorConfig[color]}`}>
         <div className="opacity-80 p-1 sm:p-1.5 rounded-lg bg-white/20 shrink-0">{icon}</div>
         <div className="flex flex-col">
           <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase opacity-80 whitespace-nowrap`}>{label}</span>
           <span className="text-base sm:text-lg font-black leading-none">{value}</span>
         </div>
      </div>
   );
};

export default PremiumUltimateTestSeries;
