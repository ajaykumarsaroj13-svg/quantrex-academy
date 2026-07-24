import React, { useState } from 'react';
import SubscriptionSidebar from '../components/SubscriptionSidebar';
import { Bell, ChevronDown, CheckSquare, Clock, Edit3, Settings, PlayCircle, BookOpen, GraduationCap, Video, Users, List, Sparkles, X, Play, FileText, Monitor } from 'lucide-react';

const categories = [
  'CUET', 'JEE Main', 'JEE Advanced', 'NEET', 
  'Class 12', 'Class 11', 'Class 10', 'Class 9', 'Class 8', 'Class 7'
];

const SubscriptionDashboard = ({ setActivePage, onStartTest, setExamTest }) => {
  const [activeCategory, setActiveCategory] = useState('JEE Main');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Quick Access items mapping to the screenshot
  const quickAccessItems = [
    { name: 'Quantrex AI', icon: <Sparkles size={24} className="text-purple-600" />, badge: 'New', action: () => setShowAiModal(true) },
    { name: 'Test', icon: <CheckSquare size={24} className="text-blue-500" />, action: () => setShowTestModal(true) },
    { name: 'Notes', icon: <Edit3 size={24} className="text-yellow-500" />, path: `/paid_content/${activeCategory}/Notes.pdf` },
    { name: 'Video Lecture', icon: <Video size={24} className="text-red-500" />, action: () => alert('Video lectures coming soon for ' + activeCategory) },
    { name: 'My Courses', icon: <GraduationCap size={24} className="text-indigo-500" />, action: () => alert('Courses registered for ' + activeCategory) },
    { name: 'Sample papers', icon: <FileTextIcon size={24} className="text-blue-400" />, path: `/paid_content/${activeCategory}/Test.pdf` },
    { name: 'Play Quiz', icon: <Clock size={24} className="text-teal-500" />, action: () => setShowTestModal(true) },
  ];

  const handleStartCbtTest = () => {
    setShowTestModal(false);
    if (setActivePage) {
      // Direct user to official test series page or CBT mode
      setActivePage('test-series');
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans">
      <SubscriptionSidebar setActivePage={setActivePage} />
      
      <div className="flex-1 ml-64 overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex-1"></div>
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-medium text-sm border border-purple-100 hover:bg-purple-100 transition-colors"
              >
                <BookOpen size={16} /> {activeCategory} <ChevronDown size={16} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setDropdownOpen(false); }}
                      className={`text-sm py-2 px-3 rounded-lg border text-center transition-all ${
                        activeCategory === cat 
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' 
                          : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                Aj
              </div>
              <div className="text-sm">
                <div className="font-bold text-gray-800">Ajay</div>
                <div className="text-xs text-gray-500">ajaykumarsaroj13@gmail.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-500">Here's what's happening with your learning journey today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {/* Primary Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-purple-200 mb-1">Welcome Back...</div>
                    <div className="text-2xl font-semibold">Ajay</div>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <List size={20} />
                  </div>
                </div>
                <div className="text-5xl font-bold mb-4">189</div>
                <div className="flex items-center gap-2 text-sm cursor-pointer hover:underline" onClick={() => setActivePage && setActivePage('test-series')}>
                  <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center text-[10px]">?</div>
                  <span className="text-purple-200">Total Tests View Details</span>
                </div>
              </div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Secondary Cards */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-gray-600 font-medium">Total Previous Year<br/>Tests</div>
                <button className="text-gray-400 hover:text-gray-600"><ChevronDown size={20} className="-rotate-90" /></button>
              </div>
              <div className="text-5xl font-bold text-gray-800 my-4">24</div>
              <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-semibold w-max border border-green-100">
                <CheckSquare size={12} /> Updated recently
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-gray-600 font-medium">Total Attempted<br/>Tests</div>
                <button className="text-gray-400 hover:text-gray-600"><ChevronDown size={20} className="-rotate-90" /></button>
              </div>
              <div className="text-5xl font-bold text-gray-800 my-4">12</div>
              <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-semibold w-max border border-green-100">
                <CheckSquare size={12} /> Updated recently
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Quick Access</h2>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-4">
              {quickAccessItems.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 min-w-[100px]">
                  {item.action ? (
                    <button 
                      onClick={item.action}
                      className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center relative hover:shadow-md hover:border-purple-200 transition-all group"
                    >
                      {item.icon}
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <a 
                      href={item.path} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center relative hover:shadow-md hover:border-purple-200 transition-all group"
                    >
                      {item.icon}
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  )}
                  <span className="text-sm font-medium text-gray-700 text-center">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explore Subjects */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Explore Subjects ({activeCategory})</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-6">
              <div 
                onClick={() => setShowTestModal(true)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center min-h-[160px] relative overflow-hidden cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group"
              >
                 <div className="w-32 h-32 rounded-full border-4 border-purple-100 absolute -right-10 -bottom-10 group-hover:scale-110 transition-transform"></div>
                 <span className="font-bold text-gray-800 relative z-10 text-lg group-hover:text-purple-600">Mathematics</span>
              </div>
              <div 
                onClick={() => setShowTestModal(true)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center min-h-[160px] relative overflow-hidden cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group"
              >
                 <div className="w-24 h-24 rounded-full border-4 border-blue-100 absolute right-4 bottom-4 group-hover:scale-110 transition-transform"></div>
                 <span className="font-bold text-gray-800 relative z-10 text-lg group-hover:text-purple-600">Physics</span>
              </div>
              <div 
                onClick={() => setShowTestModal(true)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center min-h-[160px] relative overflow-hidden cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group"
              >
                 <div className="w-24 h-24 rounded-full border-4 border-green-100 absolute left-4 bottom-4 group-hover:scale-110 transition-transform"></div>
                 <span className="font-bold text-gray-800 relative z-10 text-lg group-hover:text-purple-600">Chemistry</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Test Launch Options Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
            <button onClick={() => setShowTestModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <CheckSquare className="text-purple-600" /> {activeCategory} Tests
            </h3>
            <p className="text-sm text-gray-500 mb-6">Choose how you want to attempt or view the test paper:</p>

            <div className="space-y-4">
              <button 
                onClick={handleStartCbtTest}
                className="w-full text-left p-4 rounded-xl border-2 border-purple-600 bg-purple-50/50 hover:bg-purple-50 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Monitor size={24} />
                </div>
                <div>
                  <div className="font-bold text-purple-900 text-base">Launch Live CBT Online Exam</div>
                  <div className="text-xs text-purple-700">Official NTA Computer-Based Test mode with Question Palette, Timer & Detailed Analytics.</div>
                </div>
              </button>

              <a 
                href={`/paid_content/${activeCategory}/Test.pdf`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowTestModal(false)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-gray-50 transition-all flex items-center gap-4 group block"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-base">View / Download PDF Test Paper</div>
                  <div className="text-xs text-gray-500">Open the imported official PDF test paper directly in browser.</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quantrex AI Tutor Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
            <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-md">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Quantrex AI Tutor</h3>
            <p className="text-sm text-gray-500 mb-6">Ask any doubt from Mathematics, Physics, or Chemistry for {activeCategory}.</p>

            <input 
              type="text" 
              placeholder="Ask Quantrex AI your doubt..." 
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:border-purple-600"
            />
            <button 
              onClick={() => alert("Quantrex AI solver is active!")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm"
            >
              Ask Doubt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FileTextIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

export default SubscriptionDashboard;
