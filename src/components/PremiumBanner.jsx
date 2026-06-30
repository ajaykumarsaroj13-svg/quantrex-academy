import React from 'react';
import { motion } from 'framer-motion';
import { FileText, BarChart2, ChevronRight, Clock, ArrowLeft, ClipboardList, MessageCircleQuestion, Globe, Target, BookOpen, BrainCircuit, ShieldCheck, Trophy, Info, Zap, PhoneCall, MessageCircle } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function PremiumBanner({ onStart, onBack, fullScreen = false, theme = 'dark' }) {
  const isLight = theme === 'light';

  const BannerContent = (
    <div className={`max-w-[1200px] w-full rounded-3xl border shadow-2xl overflow-hidden relative mx-auto group/banner transition-colors duration-500 ${
      isLight ? 'bg-white border-blue-100 shadow-[0_10px_40px_rgba(0,119,182,0.1)]' : 'bg-[#0b101e] border-[#1e2538] shadow-[0_0_50px_rgba(8,145,178,0.15)]'
    }`}>
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay ${isLight ? 'opacity-5' : 'opacity-10'}`}></div>
        {!isLight && (
          <div className="absolute inset-0 opacity-20 mix-blend-screen bg-[linear-gradient(rgba(14,165,233,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_10%,transparent_100%)]"></div>
        )}
        <div className={`absolute -top-[20%] left-[10%] w-[30%] h-[50%] rounded-full blur-[100px] animate-[pulse_5s_ease-in-out_infinite] ${isLight ? 'bg-blue-400/20' : 'bg-cyan-500/20'}`}></div>
        <div className={`absolute top-[10%] right-[5%] w-[20%] h-[40%] rounded-full blur-[80px] animate-[pulse_7s_ease-in-out_infinite] ${isLight ? 'bg-amber-400/20' : 'bg-purple-500/10'}`}></div>
      </div>

      {/* Badge */}
      <div className="absolute top-0 right-4 sm:right-8 bg-gradient-to-b from-blue-600 to-indigo-800 px-3 sm:px-5 pt-3 pb-4 rounded-b-xl shadow-lg z-20 flex flex-col items-center justify-center transform hover:scale-105 transition-transform origin-top">
        <span className="text-white text-[8px] sm:text-[10px] font-bold tracking-widest uppercase mb-0.5">New Launch</span>
        <span className="text-amber-400 text-[10px] sm:text-xs font-black whitespace-nowrap">2027 BATCH</span>
      </div>

      <div className="p-5 sm:p-8 relative z-10">
        
        {/* Header Compact */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg shrink-0 border-2 ${isLight ? 'bg-slate-50 border-blue-200' : 'bg-white border-cyan-500/30'}`}>
              <img src={logoImg} alt="Quantrex" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight flex flex-wrap items-center gap-1.5">
                <span className={isLight ? 'text-slate-900' : 'text-white'}>JEE MAIN</span>
                <span className={isLight ? 'text-blue-600' : 'text-cyan-400'}>ULTIMATE</span>
                <span className={isLight ? 'text-amber-600' : 'text-amber-500'}>TEST SERIES 2027</span>
              </h1>
              <p className={`text-[9px] sm:text-[10px] tracking-wider font-semibold uppercase mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Built for Aspirants. Designed for Success.</p>
            </div>
          </div>
          
          {/* Quick Contact Buttons */}
          <div className="flex gap-2 w-full md:w-auto md:mr-28 relative z-30">
            <a href="https://wa.me/918700508344" target="_blank" rel="noreferrer" className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border text-[10px] sm:text-xs font-bold transition-all ${isLight ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'}`}>
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a href="tel:+918700508344" className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border text-[10px] sm:text-xs font-bold transition-all ${isLight ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'}`}>
              <PhoneCall className="w-3.5 h-3.5" /> Call Us
            </a>
          </div>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Stats & Features (Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[ 
                { icon: ClipboardList, val: '530+', label: 'Total Tests', color: 'purple' },
                { icon: MessageCircleQuestion, val: '12.5k+', label: 'Questions', color: 'cyan' },
                { icon: Globe, val: 'Eng & हिंदी', label: 'Languages', color: 'amber' }
              ].map((stat, i) => (
                <div key={i} className={`rounded-xl p-2 sm:p-3 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 border transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200 hover:border-blue-300' : 'bg-[#12182b] border-[#1e2538] hover:border-cyan-500/40'
                }`}>
                  <div className={`rounded-lg p-1.5 shrink-0 shadow-sm ${
                    stat.color === 'purple' ? (isLight ? 'bg-purple-100 text-purple-600' : 'bg-purple-500/20 text-purple-400') :
                    stat.color === 'cyan' ? (isLight ? 'bg-blue-100 text-blue-600' : 'bg-cyan-500/20 text-cyan-400') :
                    (isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-400')
                  }`}>
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className={`text-base sm:text-xl font-black leading-none ${isLight ? 'text-slate-800' : 'text-white'}`}>{stat.val}</div>
                    <div className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coverage Grid */}
            <div className={`rounded-xl p-3 relative overflow-hidden border ${isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#12182b] border-[#1e2538]'}`}>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Target, val: '360+', label: 'Topic Tests', color: 'blue' },
                  { icon: BookOpen, val: '100+', label: 'Chapter Tests', color: 'emerald' },
                  { icon: FileText, val: '40+', label: 'Full Tests', color: 'amber' },
                  { icon: Clock, val: '30+', label: 'Part Tests', color: 'purple' }
                ].map((item, i) => (
                  <div key={i} className={`rounded-lg p-2 flex flex-col items-center justify-center text-center gap-1 border transition-colors group ${
                    isLight ? 'bg-white border-slate-200 hover:border-blue-300' : 'bg-[#0b101e] border-[#1e2538] hover:border-cyan-500/30'
                  }`}>
                    <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${
                      item.color === 'blue' ? (isLight ? 'text-blue-500' : 'text-blue-400') :
                      item.color === 'emerald' ? (isLight ? 'text-emerald-500' : 'text-emerald-400') :
                      item.color === 'amber' ? (isLight ? 'text-amber-500' : 'text-amber-400') :
                      (isLight ? 'text-purple-500' : 'text-purple-400')
                    }`} />
                    <div className={`text-sm sm:text-base font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>{item.val}</div>
                    <div className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Icons Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {[
                { icon: BrainCircuit, text: 'Most Relevant Questions', color: 'cyan' },
                { icon: BarChart2, text: 'Deep Performance Analysis', color: 'purple' },
                { icon: ShieldCheck, text: 'JEE Rank Predictor', color: 'blue' },
                { icon: Zap, text: '100% Brand New Questions (No PYQs)', color: 'amber' }
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <feat.icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${
                    feat.color === 'cyan' ? (isLight ? 'text-blue-600' : 'text-cyan-400') :
                    feat.color === 'purple' ? (isLight ? 'text-purple-600' : 'text-purple-400') :
                    feat.color === 'blue' ? (isLight ? 'text-blue-600' : 'text-blue-400') :
                    (isLight ? 'text-amber-500' : 'text-amber-400')
                  }`} />
                  <span className={`text-[9px] sm:text-[10px] font-semibold leading-tight ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{feat.text}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Right: AI Graphic & Pricing (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* AI Graphic Compact */}
            <div className={`h-[140px] sm:h-[160px] relative rounded-2xl flex items-center justify-center overflow-hidden border group ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070b14] border-[#1e2538]'
            }`}>
               <div className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-[60px] animate-[pulse_4s_ease-in-out_infinite] ${isLight ? 'bg-blue-300/30' : 'bg-cyan-500/20'}`}></div>
               <div className={`absolute bottom-[-50%] w-[150%] h-[150%] animate-[spin_10s_linear_infinite] mix-blend-screen opacity-50 ${isLight ? 'bg-[conic-gradient(from_90deg_at_50%_100%,rgba(0,119,182,0)_0deg,rgba(0,119,182,0.1)_90deg,rgba(0,119,182,0.4)_180deg,rgba(0,119,182,0)_360deg)]' : 'bg-[conic-gradient(from_90deg_at_50%_100%,rgba(6,182,212,0)_0deg,rgba(6,182,212,0.1)_90deg,rgba(6,182,212,0.6)_180deg,rgba(6,182,212,0)_360deg)]'}`}></div>

               {/* AI Core */}
               <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center shadow-lg border backdrop-blur-md relative transform rotate-3 ${
                    isLight ? 'bg-gradient-to-tr from-blue-500 to-indigo-500 border-blue-300' : 'bg-gradient-to-tr from-cyan-600 via-blue-500 to-purple-600 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                  }`}>
                     <BrainCircuit className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse drop-shadow-md" />
                  </div>
               </motion.div>

               {/* Stats Floating */}
               <div className={`absolute top-4 left-4 border backdrop-blur-md rounded-lg p-1.5 flex items-center gap-1.5 ${isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-[#070b14]/60 border-white/10'}`}>
                  <Target className={`w-3 h-3 ${isLight ? 'text-green-600' : 'text-emerald-400'}`} />
                  <div className={`text-[8px] sm:text-[9px] font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>99.8% Accuracy</div>
               </div>
            </div>

            {/* Action Box */}
            <div className={`border rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center shadow-sm ${
              isLight ? 'bg-white border-blue-100' : 'bg-[#12182b]/80 border-[#1e2538]'
            }`}>
              
              {/* Pricing Inline */}
              <div className={`w-full py-2 px-3 rounded-lg flex items-center justify-between mb-4 border ${
                isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'
              }`}>
                <div className="flex flex-col text-left">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-amber-700' : 'text-amber-500'}`}>Launch Offer</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-medium text-xs line-through ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>₹1999</span>
                    <span className={`text-xs font-bold px-1 rounded ${isLight ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-red-400'}`}>75% Off</span>
                  </div>
                </div>
                <div className={`text-3xl font-black ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>₹499</div>
              </div>

              <button 
                onClick={onStart}
                className={`w-full text-white text-sm sm:text-base font-black py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-3 shadow-md ${
                  isLight ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                }`}
              >
                START YOUR JOURNEY <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="flex items-center gap-1.5 text-left w-full justify-center">
                <Info className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-blue-500' : 'text-cyan-400'}`} />
                <p className={`text-[9px] sm:text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  Note: 100% Fresh & original questions. Does not contain JEE Main PYQs.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`min-h-screen font-sans flex items-center justify-center p-4 sm:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-white'}`}>
        {onBack && (
          <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50">
            <button 
              onClick={onBack} 
              className={`p-2.5 rounded-full border transition-colors flex items-center gap-2 ${
                isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600' : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-semibold pr-2 hidden sm:block">Back to Dashboard</span>
            </button>
          </div>
        )}
        <div className="mt-12 sm:mt-0 w-full">
          {BannerContent}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
      {BannerContent}
    </div>
  );
}
