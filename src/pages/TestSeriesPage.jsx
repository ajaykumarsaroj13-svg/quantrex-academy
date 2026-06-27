import React, { useState, useEffect, useMemo } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Search from 'lucide-react/dist/esm/icons/search';
import PlayCircle from 'lucide-react/dist/esm/icons/play-circle';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Target from 'lucide-react/dist/esm/icons/target';
import Calendar from 'lucide-react/dist/esm/icons/calendar';

const TestSeriesPage = ({ user, onStartTest, onBack, testsData }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('JEE Main');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNdaFolder, setActiveNdaFolder] = useState(null);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  const fetchTests = async () => {
    setLoading(true);
    try {
      if (testsData && (testsData.mains || testsData.advanced || testsData.nda)) {
         const arr = [...(testsData.mains || []), ...(testsData.advanced || []), ...(testsData.nda || [])];
         const mapped = arr.map(t => ({
           ...t,
           examType: t.examType || t.exam || (testsData.mains?.includes(t) ? 'JEE Main' : (testsData.advanced?.includes(t) ? 'JEE Advanced' : 'NDA')),
           duration: t.duration || t.durationMinutes
         }));
         setTests(mapped);
         setLoading(false);
         return;
      }
      
      const res = await fetch('/data/test-series.json');
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.tests || data.data || []);
      const mapped = arr.map(t => ({
        ...t,
        examType: t.examType || t.exam,
        duration: t.duration || t.durationMinutes
      }));
      setTests(mapped);
    } catch (err) {
      console.error('Failed to fetch test series:', err);
      setError(err.message || 'Failed to load test series');
      // Fallback
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, [testsData]);

  const filtered = useMemo(() => {
    let arr = tests;
    if (activeTab !== 'All') arr = arr.filter(t => t.examType === activeTab);
    if (activeTab === 'NDA' && activeNdaFolder) {
      if (activeNdaFolder === 'Mathematics') {
        arr = arr.filter(t => t.id && t.id.includes('math'));
      } else if (activeNdaFolder === 'General Ability') {
        arr = arr.filter(t => t.id && t.id.includes('gat'));
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(t =>
        (t.title || t.name || '').toLowerCase().includes(q) ||
        String(t.year || '').includes(q) ||
        (t.examType || '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [tests, activeTab, searchQuery]);

  const totalMainQuestions = 16640;
  const totalAdvQuestions = 2472;

  return (
    <div className="min-h-screen bg-obsidian text-white p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => onBack ? onBack() : window.history.back()}
            className="p-2 rounded-xl transition-all hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-4xl font-bold font-display uppercase tracking-wider text-electric m-0">Mock Test Series</h1>
        </div>
        <div className="flex gap-4 text-gray-400 max-w-2xl text-sm font-medium">
          <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-electric">JEE Main:</span> {tests.filter(t => t.examType === 'JEE Main').length} Tests
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-electric">JEE Advanced:</span> {tests.filter(t => t.examType === 'JEE Advanced').length} Tests
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-electric">NDA:</span> {tests.filter(t => t.examType === 'NDA').length} Tests
          </div>
        </div>
        
        {/* Search & Filters */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-cyberdark/50 p-4 rounded-2xl border border-white/10">
          <div className="flex gap-2 bg-obsidian p-1 rounded-xl w-full md:w-auto">
            {['JEE Main', 'JEE Advanced', 'NDA'].map(tab => {
              const count = tests.filter(t => t.examType === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setActiveNdaFolder(null); }}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-electric text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                  <span className={`text-[10px] ml-2 px-2 py-0.5 rounded-full ${activeTab === tab ? 'bg-obsidian/20 text-obsidian' : 'bg-white/10 text-gray-400'}`}>
                     {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by exam, year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-obsidian border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-electric transition-colors text-white"
            />
          </div>
        </div>
      </div>


      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'NDA' && !activeNdaFolder ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
            <div onClick={() => setActiveNdaFolder('Mathematics')} className="bg-cyberdark border border-white/10 rounded-2xl p-8 hover:border-blue-500 hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]">
              <div className="bg-blue-500/20 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.82A2 2 0 0 0 8.53 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Mathematics</h2>
              <p className="text-gray-400">{tests.filter(t => t.examType === 'NDA' && t.id && t.id.includes('math')).length} Tests</p>
            </div>
            
            <div onClick={() => setActiveNdaFolder('General Ability')} className="bg-cyberdark border border-white/10 rounded-2xl p-8 hover:border-purple-500 hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]">
              <div className="bg-purple-500/20 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.82A2 2 0 0 0 8.53 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">General Ability</h2>
              <p className="text-gray-400">{tests.filter(t => t.examType === 'NDA' && t.id && t.id.includes('gat')).length} Tests</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
          <div className="col-span-full text-center py-20 text-gray-400 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric mb-4"></div>
            Loading test series...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400">No tests found matching your criteria.</div>
        ) : (
          filtered.map(test => (
            <div key={test._id || test.id} className="bg-cyberdark border border-white/10 rounded-2xl p-6 hover:border-electric/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-electric/10 text-electric border border-electric/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {test.examType || 'Mock Test'}
                </span>
                {test.year && <span className="text-gray-400 font-mono text-xs">{test.year}</span>}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-electric transition-colors">{test.title || test.name || 'Untitled Test'}</h3>
              
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{test.duration >= 60 ? `${test.duration / 60} hrs` : `${test.duration || 180} min`}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>{test.totalMarks || test.marks || 300} Marks</span>
                </div>
                {test.examDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span>{test.examDate}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => onStartTest && onStartTest(test.id || test._id, 'exam', 'test-series')}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" /> Start Exam
                </button>
                <button
                  onClick={() => onStartTest && onStartTest(test.id || test._id, 'practice', 'test-series')}
                  className="flex-1 bg-cyberdark border border-electric/30 hover:bg-electric/10 text-electric font-bold py-2.5 rounded-xl text-sm transition-all"
                >
                  Practice Mode
                </button>
              </div>
            </div>
          ))
        )}
        </div>
        )}
      </div>
    </div>
  );
};

export default TestSeriesPage;
