import React, { useState, useEffect, useMemo } from 'react';
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
import logoImg from '../assets/logo.png';

const PremiumUltimateTestSeries = ({ user, onStartTest, onViewResult, onBack, isLight }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const groupTests = useMemo(() => {
    return tests.filter(t => t.category === activeCategory && t.groupName === activeGroup);
  }, [tests, activeCategory, activeGroup]);

  const totalTests = groupTests.length;
  const availableTests = groupTests.filter(t => !t.isUpcoming).length;
  const upcomingTests = groupTests.filter(t => t.isUpcoming).length;
  const attemptedTests = 0; 

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
    bg: isLight ? 'bg-gray-50' : 'bg-[#1b1f2e]',
    bgNav: isLight ? 'bg-white' : 'bg-[#161a27]',
    bgSidebar: isLight ? 'bg-gray-100' : 'bg-[#1b1f2e]',
    bgContent: isLight ? 'bg-white' : 'bg-[#1b1f2e]',
    bgCard: isLight ? 'bg-white' : 'bg-[#22273b]',
    bgCardHover: isLight ? 'hover:bg-gray-50' : 'hover:bg-[#2a3045]',
    bgExpanded: isLight ? 'bg-gray-50' : 'bg-[#1a1e2d]',
    border: isLight ? 'border-gray-200' : 'border-[#2d3246]',
    text: isLight ? 'text-gray-900' : 'text-white',
    textMuted: isLight ? 'text-gray-500' : 'text-gray-400',
    primary: 'text-[#3b82f6]',
    borderPrimary: 'border-[#3b82f6]'
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-hidden h-screen ${theme.bg} ${theme.text}`}>
      
      {/* Top Header */}
      <div className={`${theme.bgContent} border-b ${theme.border} px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10`}>
         <div className="flex items-center gap-3">
           <button onClick={onBack} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
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
        <div className={`w-20 ${theme.bgNav} border-r ${theme.border} flex flex-col items-center py-4 gap-2 shrink-0 z-10`}>
          <NavIconButton icon={<FileText className="w-5 h-5" />} label="All Tests" active={activeNav === 'All Tests'} onClick={() => setActiveNav('All Tests')} isLight={isLight} theme={theme} />
          <NavIconButton icon={<BarChart2 className="w-5 h-5" />} label="Analytics" active={activeNav === 'Analytics'} onClick={() => setActiveNav('Analytics')} isLight={isLight} theme={theme} />
          <NavIconButton icon={<XCircle className="w-5 h-5" />} label="Mistakes" active={activeNav === 'Mistakes'} onClick={() => setActiveNav('Mistakes')} isLight={isLight} theme={theme} />
          <NavIconButton icon={<Bookmark className="w-5 h-5" />} label="Bookmarks" active={activeNav === 'Bookmarks'} onClick={() => setActiveNav('Bookmarks')} isLight={isLight} theme={theme} />
        </div>

        {/* Sidebar Menu (Categories & Groups) */}
        <div className={`w-72 ${theme.bgSidebar} border-r ${theme.border} overflow-y-auto shrink-0 py-5 custom-scrollbar`}>
          
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
           <div className={`px-8 py-5 shrink-0 flex flex-wrap gap-4 border-b ${theme.border} ${isLight ? 'bg-gray-50' : 'bg-[#1b1f2e]'}`}>
              <StatBadge icon={<FileText className="w-4 h-4" />} label="Total" value={totalTests} color="gray" isLight={isLight} />
              <StatBadge icon={<CheckCircle2 className="w-4 h-4" />} label="Available" value={availableTests} color="emerald" isLight={isLight} />
              <StatBadge icon={<Clock className="w-4 h-4" />} label="Upcoming" value={upcomingTests} color="amber" isLight={isLight} />
              <StatBadge icon={<BarChart2 className="w-4 h-4" />} label="Attempted" value={attemptedTests} color="blue" isLight={isLight} />
           </div>

           {/* Scrollable Content */}
           <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar relative">
              
              <h2 className={`text-2xl font-bold mb-6 ${theme.text}`}>
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
                      const sAttempted = 0; 
                      const sFree = 0; 

                      return (
                         <div key={sectionName} className={`${theme.bgCard} rounded-xl border ${isExpanded ? theme.borderPrimary + ' shadow-md' : theme.border} overflow-hidden transition-all duration-300`}>
                            <div 
                               onClick={() => setExpandedSection(isExpanded ? null : sectionName)}
                               className={`px-6 py-4 cursor-pointer ${theme.bgCardHover} transition-colors flex items-center justify-between group`}
                            >
                               <div>
                                  <h3 className={`font-bold text-lg mb-1.5 ${isLight ? 'text-gray-800' : 'text-gray-100'} group-hover:${theme.primary} transition-colors`}>{sectionName}</h3>
                                  <div className="flex gap-4 text-xs font-semibold">
                                     {sFree > 0 && <span className="text-blue-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {sFree} Free</span>}
                                     {sAvailable > 0 && <span className="text-emerald-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {sAvailable} Available</span>}
                                     {sUpcoming > 0 && <span className="text-amber-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {sUpcoming} Upcoming</span>}
                                     {sAttempted > 0 && <span className="text-blue-500 flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> {sAttempted} Attempted</span>}
                                  </div>
                               </div>
                               <ChevronRight className={`w-5 h-5 ${theme.textMuted} transition-transform duration-300 ${isExpanded ? 'rotate-90 text-blue-500' : 'group-hover:text-blue-500'}`} />
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
                                     <div className="p-4 flex flex-col gap-2.5">
                                        {testsList.map(test => (
                                           <div key={test.testId || test.id} className={`${isLight ? 'bg-white' : 'bg-[#22273b]'} border ${theme.border} rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:border-blue-500/50 transition-all shadow-sm group`}>
                                              <div className="flex flex-col gap-2 mb-4 sm:mb-0">
                                                 <div className={`text-base font-bold ${theme.text} group-hover:text-blue-500 transition-colors`}>{test.title}</div>
                                                 
                                                 {/* Syllabus / Section Tag */}
                                                 <div className={`text-xs font-medium px-2.5 py-1 w-fit rounded-md ${isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-400'}`}>
                                                   Syllabus: {test.sectionName || sectionName}
                                                 </div>

                                                 <div className={`flex flex-wrap items-center gap-4 text-sm ${theme.textMuted} font-medium mt-1`}>
                                                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-blue-400" /> {test.totalQuestions} Questions</span>
                                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-400" /> {test.durationMinutes} Mins</span>
                                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {test.maxMarks} Marks</span>
                                                    {test.isUpcoming && (
                                                       <span className="flex items-center gap-1.5 text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20 text-xs font-bold ml-1">
                                                          <Calendar className="w-3.5 h-3.5" /> 
                                                          Live on {new Date(test.liveAt).toLocaleDateString()}
                                                       </span>
                                                    )}
                                                 </div>
                                              </div>
                                              <div className="shrink-0 flex items-center gap-2.5">
                                                 {test.isUpcoming ? (
                                                    <button disabled className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold ${isLight ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white/5 text-gray-500 border-white/5'} cursor-not-allowed border`}>
                                                       Locked
                                                    </button>
                                                 ) : (() => {
                                                    const tid = test.testId || test.id;
                                                    const isAttempted = localStorage.getItem(`quantrex_test_result_${tid}`);
                                                    const isResumable = localStorage.getItem(`quantrex_exam_state_${tid}`);
                                                    return (
                                                      <>
                                                        {isAttempted && (
                                                          <button 
                                                            onClick={() => onViewResult && onViewResult(tid)}
                                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                                                              isLight 
                                                                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700' 
                                                                : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400'
                                                            }`}
                                                          >
                                                            View Result
                                                          </button>
                                                        )}
                                                        <button 
                                                           onClick={() => onStartTest(tid, 'exam', 'ultimate-test-series')}
                                                           className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                                             isAttempted 
                                                               ? (isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-gray-300')
                                                               : 'bg-blue-600 hover:bg-blue-50 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                                                           }`}
                                                        >
                                                           {isResumable ? 'Resume' : (isAttempted ? 'Retake' : 'Start Test')} <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                      </>
                                                    );
                                                 })()}
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                  </motion.div>
                               )}
                            </AnimatePresence>
                         </div>
                      );
                   })}
                </div>
              )}
           </div>

        </div>
      </div>
      
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
      <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border shadow-sm ${colorConfig[color]}`}>
         <div className="opacity-80 p-1.5 rounded-lg bg-white/20">{icon}</div>
         <div className="flex flex-col">
           <span className={`text-[10px] font-bold tracking-wider uppercase opacity-80`}>{label}</span>
           <span className="text-lg font-black leading-none">{value}</span>
         </div>
      </div>
   );
};

export default PremiumUltimateTestSeries;
