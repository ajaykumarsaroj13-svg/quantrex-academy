import React, { useState, useMemo } from 'react';
import { DEFAULT_SYLLABUS } from '../utils/syllabusData';

const CustomTestBuilder = ({ selectedSyllabusClass, isLight, syllabus = DEFAULT_SYLLABUS }) => {
  
  const [duration, setDuration] = useState(60);
  const [yearFilter, setYearFilter] = useState('All');
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedSubjectTab, setSelectedSubjectTab] = useState('all');
  
  const [mainsTypes, setMainsTypes] = useState({ MCQ: 15, NUMERICAL: 5 });
  const [advTypes, setAdvTypes] = useState({ MCQ: 10, MULTI_CORRECT: 5, COMPREHENSION: 2, MATCHING: 2 });
  
  const actualClassKey = selectedSyllabusClass === 'jee-mains' ? 'mains' : selectedSyllabusClass === 'jee-advanced' ? 'advanced' : selectedSyllabusClass;
  
  // Use passed syllabus instead of DEFAULT_SYLLABUS
  const subjects = syllabus[actualClassKey]?.subjects || {};
  
  const handleChapterToggle = (chapterSlug) => {
    setSelectedChapters(prev => {
      if (prev.includes(chapterSlug)) {
        return prev.filter(c => c !== chapterSlug);
      } else {
        return [...prev, chapterSlug];
      }
    });
  };

  const handleSelectAllSubject = (subjKey) => {
    const chapters = subjects[subjKey]?.chapters || [];
    const fetchSlugs = chapters.map(ch => getFetchSlug(ch));
    setSelectedChapters(prev => {
      const newSelection = new Set([...prev]);
      let allSelected = true;
      for (const slug of fetchSlugs) {
        if (!newSelection.has(slug)) {
          allSelected = false;
          break;
        }
      }
      
      if (allSelected) {
        // Deselect all
        fetchSlugs.forEach(slug => newSelection.delete(slug));
      } else {
        // Select all
        fetchSlugs.forEach(slug => newSelection.add(slug));
      }
      return Array.from(newSelection);
    });
  };

  const getFetchSlug = (ch) => {
    const slug = (ch.url && ch.url !== '#') ? ch.url.split('/').pop() : (ch.id || '');
    let fetchSlug = String(slug || ch.id || 'unknown');
    if (selectedSyllabusClass === 'jee-advanced') {
      if (fetchSlug.startsWith('physics_')) fetchSlug = fetchSlug.replace('physics_', '');
      else if (fetchSlug.startsWith('chemistry_')) fetchSlug = fetchSlug.replace('chemistry_', '');
      else if (fetchSlug.startsWith('mathematics_')) fetchSlug = fetchSlug.replace('mathematics_', '');

      if (!fetchSlug.startsWith('adv-') && !fetchSlug.startsWith('ch_adv_math_')) {
        fetchSlug = 'adv-' + fetchSlug;
      }
    }
    return fetchSlug;
  };

  const handleGenerateTest = (action = 'start') => {
    if (selectedChapters.length === 0) {
      alert("Please select at least one chapter.");
      return;
    }
    
    const seed = Math.floor(Math.random() * 1000000);
    const isAdv = selectedSyllabusClass === 'jee-advanced';
    const typeCounts = isAdv ? advTypes : mainsTypes;
    
    const totalQ = Object.values(typeCounts).reduce((a,b)=>a+b, 0);
    if (totalQ === 0) {
      alert("Please select at least one question to generate.");
      return;
    }

    const params = {
      exam: selectedSyllabusClass,
      chapters: selectedChapters,
      types: typeCounts,
      count: totalQ,
      duration: duration,
      years: yearFilter,
      seed: seed
    };
    
    const encodedParams = encodeURIComponent(JSON.stringify(params));
    const url = `${window.location.origin}/?custom_test=${encodedParams}`;
    
    if (action === 'share') {
      navigator.clipboard.writeText(url).then(() => {
        alert('Test link copied to clipboard!');
      });
    } else {
      window.location.href = `/?custom_test=${encodedParams}`;
    }
  };

  const hasActiveTest = !!localStorage.getItem('quantrex_active_custom_test');

  return (
    <div className={`flex flex-col lg:flex-row gap-6 p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#0a0a0c] border-white/10'}`}>
      
      {/* Left Panel - Settings */}
      <div className={`w-full lg:w-1/3 flex flex-col gap-6 p-6 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
        <div>
          <h2 className={`text-lg font-black uppercase tracking-wider mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>Test Settings</h2>
        </div>
        
        {/* Source */}
        <div>
          <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Create Test From</label>
          <div className={`p-3 rounded-lg border text-sm font-bold ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-black/20 border-white/10 text-gray-300'}`}>
            All PYQs (Previous Year Questions)
          </div>
        </div>

        {/* Question Types */}
        {selectedSyllabusClass === 'jee-advanced' ? (
          <div>
            <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Question Types (JEE Advanced)</label>
            <div className="space-y-3">
              {Object.keys(advTypes).map(type => (
                <div key={type} className="flex justify-between items-center bg-black/5 p-2 rounded-lg border border-black/5 dark:bg-white/5 dark:border-white/5">
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{type.replace('_', ' ')}</span>
                  <input type="number" min="0" value={advTypes[type]} onChange={e => setAdvTypes({...advTypes, [type]: Number(e.target.value)})} className={`w-16 p-1.5 rounded border text-center text-sm font-bold outline-none ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-black/40 border-white/10 text-white focus:border-cyan-500'}`} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Question Types (JEE Mains)</label>
            <div className="space-y-3">
              {Object.keys(mainsTypes).map(type => (
                <div key={type} className="flex justify-between items-center bg-black/5 p-2 rounded-lg border border-black/5 dark:bg-white/5 dark:border-white/5">
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{type}</span>
                  <input type="number" min="0" value={mainsTypes[type]} onChange={e => setMainsTypes({...mainsTypes, [type]: Number(e.target.value)})} className={`w-16 p-1.5 rounded border text-center text-sm font-bold outline-none ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-black/40 border-white/10 text-white focus:border-cyan-500'}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duration */}
        <div>
          <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Test Duration (Mins)</label>
          <div className="flex items-center gap-4">
            <button onClick={() => setDuration(Math.max(5, duration - 5))} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-gray-400'}`}>-</button>
            <span className={`text-xl font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>{duration}</span>
            <button onClick={() => setDuration(duration + 5)} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-gray-400'}`}>+</button>
          </div>
        </div>

        {/* Year Filter */}
        <div>
          <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Year of Paper</label>
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className={`w-full p-3 rounded-lg border text-sm font-bold outline-none transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-700 focus:border-cyan-500' : 'bg-black/20 border-white/10 text-gray-300 focus:border-cyan-500'
            }`}
          >
            <option value="All">All Years</option>
            <option value="Last 3 years">Last 3 Years</option>
            <option value="Last 5 years">Last 5 Years</option>
            <option value="Last 10 years">Last 10 Years</option>
          </select>
        </div>

        {/* Generate Button */}
        <div className="mt-auto space-y-3">
          <div className="flex gap-2">
            <button 
              onClick={() => handleGenerateTest('start')}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Start Now Here
            </button>
            <button 
              onClick={() => handleGenerateTest('share')}
              className="flex-1 py-3 rounded-xl border-2 border-cyan-500 text-cyan-500 font-black text-sm uppercase tracking-wider hover:bg-cyan-500/10 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              Share Link
            </button>
          </div>
          
          {hasActiveTest && (
            <button 
              onClick={() => {
                window.location.href = '/?resume_custom_test=true';
              }}
              className="w-full py-3 rounded-xl border-2 border-amber-500 text-amber-500 font-black text-sm uppercase tracking-wider hover:bg-amber-500/10 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              Resume Paused Test
            </button>
          )}
        </div>
      </div>

      {/* Right Panel - Chapter Selection */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className={`text-lg font-black uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>Select Chapters</h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Choose the chapters you want to include in your custom test. ({selectedChapters.length} selected)</p>
            </div>
            {selectedChapters.length > 0 && (
              <button 
                onClick={() => setSelectedChapters([])}
                className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors"
              >
                Clear All Selections
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setSelectedSubjectTab('all')}
              className={`py-1.5 px-4 text-[10px] font-extrabold uppercase rounded-full border transition-all duration-300 ${
                selectedSubjectTab === 'all'
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/40 text-cyan-400 shadow-sm'
                  : (isLight ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-800' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white')
              }`}
            >
              All Subjects
            </button>
            {Object.entries(subjects).map(([subjKey, subjVal]) => (
              <button
                key={subjKey}
                onClick={() => setSelectedSubjectTab(subjKey)}
                className={`py-1.5 px-4 text-[10px] font-extrabold uppercase rounded-full border transition-all duration-300 ${
                  selectedSubjectTab === subjKey
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/40 text-cyan-400 shadow-sm'
                    : (isLight ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-800' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white')
                }`}
              >
                {subjVal.label || subjKey}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar pr-2 space-y-6">
          {Object.entries(subjects).filter(([subjKey]) => selectedSubjectTab === 'all' || selectedSubjectTab === subjKey).map(([subjKey, subjVal]) => {
            const subjectChapterSlugs = (subjVal.chapters || []).map(ch => getFetchSlug(ch));
            const selectedCount = subjectChapterSlugs.filter(slug => selectedChapters.includes(slug)).length;
            const allSelected = subjectChapterSlugs.length > 0 && selectedCount === subjectChapterSlugs.length;
            
            return (
              <div key={subjKey} className="space-y-3">
                <div className={`sticky top-0 py-2 z-10 backdrop-blur-md flex items-center justify-between border-b ${isLight ? 'border-slate-200 bg-white/80' : 'border-white/10 bg-[#0a0a0c]/80'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
                    {subjVal.label || subjKey}
                  </h3>
                  <button 
                    onClick={() => handleSelectAllSubject(subjKey)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${
                      allSelected 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' 
                      : (isLight ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10')
                    }`}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjVal.chapters?.map(ch => {
                  const fetchSlug = getFetchSlug(ch);
                  const isSelected = selectedChapters.includes(fetchSlug);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleChapterToggle(fetchSlug)}
                      className={`text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                        isSelected 
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                        : (isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/5 hover:bg-white/10')
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected 
                        ? 'bg-cyan-500 border-cyan-500 text-[#0a0a0c]' 
                        : (isLight ? 'border-slate-300' : 'border-gray-500')
                      }`}>
                        {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M3 7.5L6 10.5L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span className={`text-sm font-semibold leading-tight ${isSelected ? (isLight ? 'text-slate-800' : 'text-white') : (isLight ? 'text-slate-600' : 'text-gray-300')}`}>
                        {ch.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      </div>
      
    </div>
  );
};

export default CustomTestBuilder;
