import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, PlayCircle, Clock, Target, Calendar, Sparkles, Trophy, BrainCircuit, FileText, BookOpen, Flame } from 'lucide-react';

export default function TestSeries2027({ setActivePage, theme, onStartTest, onBack }) {
  const isLight = theme === 'light';
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load test data from static JSON
  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      try {
        const res = await fetch('/data/test-series.json');
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.tests || data.data || []);
        // Filter only JEE Main tests
        const mockTests = arr.filter(t => t.examType === 'JEE Main' || t.exam === 'JEE Main');
        setTests(mockTests);
      } catch (err) {
        console.error('Failed to load test series:', err);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tests;
    const q = searchQuery.toLowerCase();
    return tests.filter(t =>
      (t.title || t.name || '').toLowerCase().includes(q) ||
      String(t.year || '').includes(q)
    );
  }, [tests, searchQuery]);

  // Group tests by year
  const groupedByYear = useMemo(() => {
    const groups = {};
    filtered.forEach(test => {
      const year = test.year || 'Other';
      if (!groups[year]) groups[year] = [];
      groups[year].push(test);
    });
    // Sort years descending
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  const handleStart = (testId, mode) => {
    if (onStartTest) {
      onStartTest(testId, mode, 'test-series-2027');
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#f8f9fa] text-gray-900' : 'bg-black text-white'} p-6 md:p-12 font-sans`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className={`border-b pb-6 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => onBack ? onBack() : setActivePage('home')}
              className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                <Sparkles className="text-cyan-400 w-8 h-8" />
                Ultimate JEE Main Test Series 2027
              </h1>
              <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Based on Latest NTA Pattern • 75 Questions • 300 Marks • 3 Hours
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className={`px-5 py-3 rounded-xl border flex items-center gap-3 ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-500/30'}`}>
              <BookOpen className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              <div>
                <p className={`text-2xl font-black ${isLight ? 'text-blue-700' : 'text-cyan-400'}`}>{tests.length}</p>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-blue-500' : 'text-gray-400'}`}>Total Tests</p>
              </div>
            </div>
            <div className={`px-5 py-3 rounded-xl border flex items-center gap-3 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-900/20 border-emerald-500/30'}`}>
              <FileText className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <div>
                <p className={`text-2xl font-black ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>75</p>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-emerald-500' : 'text-gray-400'}`}>Questions/Test</p>
              </div>
            </div>
            <div className={`px-5 py-3 rounded-xl border flex items-center gap-3 ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-500/30'}`}>
              <Trophy className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
              <div>
                <p className={`text-2xl font-black ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>300</p>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-amber-500' : 'text-gray-400'}`}>Marks/Test</p>
              </div>
            </div>
            <div className={`px-5 py-3 rounded-xl border flex items-center gap-3 ${isLight ? 'bg-purple-50 border-purple-200' : 'bg-purple-900/20 border-purple-500/30'}`}>
              <Clock className={`w-5 h-5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
              <div>
                <p className={`text-2xl font-black ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>3 Hrs</p>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-purple-500' : 'text-gray-400'}`}>Duration</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by title, year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none transition-colors border ${
                isLight 
                  ? 'bg-white border-gray-200 focus:border-blue-400 text-gray-900 placeholder-gray-400' 
                  : 'bg-[#111] border-white/10 focus:border-cyan-500 text-white placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mb-4 ${isLight ? 'border-blue-500' : 'border-cyan-400'}`}></div>
            <p className={`font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Loading test series...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#111] border-white/10'}`}>
            <BrainCircuit className={`w-16 h-16 mx-auto mb-4 ${isLight ? 'text-gray-300' : 'text-gray-700'}`} />
            <h2 className={`text-xl font-bold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>No Tests Found</h2>
            <p className={`mt-2 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Try a different search term.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedByYear.map(([year, yearTests]) => (
              <div key={year}>
                <div className="flex items-center gap-3 mb-4">
                  <Flame className={`w-5 h-5 ${isLight ? 'text-orange-500' : 'text-orange-400'}`} />
                  <h2 className={`text-xl font-black ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {year}
                  </h2>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-400'}`}>
                    {yearTests.length} Tests
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {yearTests.map(test => (
                    <div 
                      key={test.id || test._id} 
                      className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col group ${
                        isLight 
                          ? 'bg-white border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300' 
                          : 'bg-[#0d0d0d] border-white/5 hover:border-cyan-500/40 hover:bg-[#111]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] uppercase font-black px-2 py-1 rounded border ${
                          isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-900/30 text-cyan-400 border-blue-500/30'
                        }`}>
                          JEE Main
                        </span>
                        {test.year && (
                          <span className={`font-mono text-xs ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                            {test.year}
                          </span>
                        )}
                      </div>
                      
                      <h3 className={`text-base font-bold mb-3 leading-tight transition-colors ${
                        isLight ? 'text-gray-900 group-hover:text-blue-600' : 'text-white group-hover:text-cyan-400'
                      }`}>
                        {test.title || test.name || 'Mock Test'}
                      </h3>
                      
                      <div className={`grid grid-cols-2 gap-3 my-3 text-xs font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{test.duration >= 60 ? `${test.duration / 60} hrs` : `${test.duration || 180} min`}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-blue-400" />
                          <span>{test.totalMarks || 300} Marks</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          <span>{test.totalQuestions || 75} Qs</span>
                        </div>
                        {test.examDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-orange-400" />
                            <span>{test.examDate}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={`mt-auto pt-4 border-t flex gap-3 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                        <button
                          onClick={() => handleStart(test.id || test._id, 'exam')}
                          className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                            isLight 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                              : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white'
                          }`}
                        >
                          <PlayCircle className="w-4 h-4" /> Start Exam
                        </button>
                        <button
                          onClick={() => handleStart(test.id || test._id, 'practice')}
                          className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-all ${
                            isLight 
                              ? 'bg-gray-50 border border-blue-200 text-blue-600 hover:bg-blue-50' 
                              : 'bg-[#0a0a0a] border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400'
                          }`}
                        >
                          Practice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
