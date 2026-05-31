import React, { useState, useEffect } from 'react';
import { Lock, BookOpen, FolderOpen, Search, Filter, PlayCircle, Trophy, ArrowLeft, Star, Clock } from 'lucide-react';
import { DEFAULT_SYLLABUS } from '../../utils/syllabusData';

export default function MarksPortal({ user, setActivePage }) {
  const [selectedExam, setSelectedExam] = useState('jee-mains');
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [activeView, setActiveView] = useState('folders'); // folders, chapters
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check if user is paid
  const isPaidUser = user && user.isPaid; 

  // Get syllabus data from existing Quantrex data
  const syllabusData = DEFAULT_SYLLABUS[selectedExam]?.subjects || {};
  const subjects = Object.keys(syllabusData);
  
  // Create folders based on subjects
  const folders = subjects.map(sub => {
    const chapters = syllabusData[sub]?.chapters || [];
    let count = chapters.length;
    let icon = '📚';
    let title = sub.charAt(0).toUpperCase() + sub.slice(1);
    
    if (sub === 'mathematics') { icon = '🔢'; }
    else if (sub === 'physics') { icon = '⚛️'; }
    else if (sub === 'chemistry') { icon = '🧪'; }
    
    return { id: sub, title, icon, count: `${count} Chapters`, chapters };
  });

  const books = [
    { id: '1', title: 'Quantrex Advance Math Modules', author: 'A.K. Sir', rating: '5.0', type: 'Exclusive' },
    { id: '2', title: 'IIT-JEE Rank Booster Questions', author: 'A.K. Sir', rating: '4.9', type: 'Premium' },
    { id: '3', title: 'Cengage Mathematics (Selected)', author: 'G. Tewani', rating: '4.8', type: 'Reference' },
    { id: '4', title: 'H.C. Verma Physics Concepts', author: 'H.C. Verma', rating: '4.9', type: 'Reference' },
  ];

  if (!isPaidUser) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Premium Access Required</h2>
          <p className="text-gray-500 mb-8 text-sm">
            This portal contains an extensive library of premium books, tests, and materials reserved for Quantrex Paid Users only.
          </p>
          <button 
            onClick={() => setActivePage('home')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" /> Upgrade to Premium
          </button>
          <button 
            onClick={() => setActivePage('student-dashboard')}
            className="w-full mt-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium py-3 px-6 rounded-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleFolderClick = (subjectId) => {
    setSelectedSubject(subjectId);
    setActiveView('chapters');
  };

  const getFilteredChapters = () => {
    const chapters = syllabusData[selectedSubject]?.chapters || [];
    if (!searchQuery) return chapters;
    return chapters.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (activeView === 'chapters') setActiveView('folders');
              else setActivePage('student-dashboard');
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Marks Portal <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider ml-2 font-bold">Premium</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search books, chapters..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col py-6 overflow-y-auto">
          <div className="px-6 mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Exam Category</p>
          </div>
          <div className="px-3 space-y-1">
            {[
              { id: 'jee-mains', label: 'JEE Main' },
              { id: 'jee-advanced', label: 'JEE Advanced' },
              { id: 'neet', label: 'NEET' },
              { id: 'bitsat', label: 'BITSAT' },
            ].map(exam => (
              <button
                key={exam.id}
                onClick={() => { setSelectedExam(exam.id); setActiveView('folders'); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedExam === exam.id 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {exam.label}
              </button>
            ))}
          </div>

          <div className="px-6 mt-8 mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Library</p>
          </div>
          <div className="px-3 space-y-1">
            <button 
              onClick={() => setActiveView('folders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeView === 'folders' || activeView === 'chapters' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FolderOpen className="w-4 h-4" /> Subjects
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              <BookOpen className="w-4 h-4" /> Reference Books
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              <PlayCircle className="w-4 h-4" /> Video Solutions
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            
            {activeView === 'folders' && (
              <>
                {/* Subject Folders */}
                <section className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Chapter-wise Questions</h2>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {folders.map(folder => (
                      <div 
                        key={folder.id} 
                        onClick={() => handleFolderClick(folder.id)}
                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4"
                      >
                        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-2xl border border-blue-100">
                          {folder.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{folder.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{folder.count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Reference Books */}
                <section className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Premium Books & Modules</h2>
                    <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                      <Filter className="w-4 h-4" /> Filter
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {books.map(book => (
                      <div key={book.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full">
                        <div className="h-40 bg-gradient-to-br from-indigo-50 to-blue-50 border-b border-gray-100 flex flex-col items-center justify-center relative">
                          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-blue-800 shadow-sm">
                            {book.type}
                          </div>
                          <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                          <BookOpen className="w-12 h-12 text-blue-300" />
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{book.title}</h3>
                            <p className="text-xs text-gray-500 mb-3">{book.author}</p>
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-xs font-bold text-green-700">
                              {book.rating} <Star className="w-3 h-3 fill-current" />
                            </div>
                            <button className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">Solve Now</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeView === 'chapters' && (
              <section className="mb-10 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl border border-blue-100">
                      {folders.find(f => f.id === selectedSubject)?.icon || '📚'}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">{folders.find(f => f.id === selectedSubject)?.title || 'Chapters'}</h2>
                      <p className="text-xs text-gray-500">{getFilteredChapters().length} Chapters Available</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredChapters().map((chapter, idx) => (
                    <div key={chapter.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                          {idx + 1}
                        </div>
                        <div className="truncate pr-4">
                          <h3 className="font-bold text-gray-800 text-sm truncate">{chapter.title}</h3>
                          <div className="flex gap-3 mt-1">
                            <p className="text-[10px] text-gray-500">PYQs: {Math.floor(Math.random() * 100) + 50}</p>
                            <p className="text-[10px] text-gray-500">NTA Questions: {Math.floor(Math.random() * 50) + 20}</p>
                          </div>
                        </div>
                      </div>
                      <button className="shrink-0 bg-gray-50 group-hover:bg-blue-50 text-gray-600 group-hover:text-blue-600 p-2 rounded-lg transition-colors">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  ))}
                  {getFilteredChapters().length === 0 && (
                    <div className="col-span-2 text-center py-10">
                      <p className="text-gray-500">No chapters found matching your search.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
