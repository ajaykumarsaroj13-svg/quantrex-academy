import React, { useState } from 'react';
import { Shield, Sparkles, BookOpen, Star, HelpCircle, PhoneCall, Gift, MessageCircle, Bot, FileText, Flame, Award, Layers, ChevronRight, Zap, Target, TrendingUp, Rocket, Trophy, CheckCircle } from 'lucide-react';

export default function Home({ user, setActivePage, courses, setCourses, toppers, onStartLearning }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const mathHubCards = [
    {
      id: 'jee-main',
      icon: Target,
      label: 'JEE Main Mathematics',
      desc: 'Complete 20 chapters — Algebra, Calculus, Geometry & more',
      color: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/20',
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      tag: 'JEE Main',
      gradeId: 'jee-mains',
      tab: 'courses',
      chapterTab: 'videos'
    },
    {
      id: 'jee-advanced',
      icon: Zap,
      label: 'JEE Advanced Mathematics',
      desc: 'Advanced level — Complex Numbers, Vectors, 3D Geometry & more',
      color: 'from-gold to-yellow-500',
      glow: 'shadow-yellow-500/20',
      border: 'border-yellow-500/20',
      iconBg: 'bg-yellow-500/10 text-yellow-400',
      tag: 'JEE Advanced',
      gradeId: 'jee-advanced',
      tab: 'courses',
      chapterTab: 'videos'
    },
    {
      id: 'mock-tests',
      icon: Award,
      label: 'Mock Tests',
      desc: 'JEE Pattern chapter-wise + full syllabus mock exams',
      color: 'from-purple-500 to-violet-600',
      glow: 'shadow-purple-500/20',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/10 text-purple-400',
      tag: 'Test Series',
      gradeId: 'jee-mains',
      tab: 'tests',
      chapterTab: 'mockTests'
    },
    {
      id: 'notes-pdfs',
      icon: FileText,
      label: 'Notes & PDFs',
      desc: 'Handwritten lecture notes, DPPs, and past year question papers',
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/20',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      tag: 'Study Material',
      gradeId: 'jee-mains',
      tab: 'courses',
      chapterTab: 'pdfs'
    },
    {
      id: 'formulas',
      icon: Flame,
      label: 'Formula Sheets',
      desc: 'Chapter-wise formula cheat sheets and shortcut tricks',
      color: 'from-orange-500 to-red-500',
      glow: 'shadow-orange-500/20',
      border: 'border-orange-500/20',
      iconBg: 'bg-orange-500/10 text-orange-400',
      tag: 'Quick Revision',
      gradeId: 'jee-mains',
      tab: 'courses',
      chapterTab: 'formulas'
    },
    {
      id: 'ai-doubt',
      icon: Bot,
      label: 'AI Doubt Solver',
      desc: 'Ask any maths problem — get LaTeX-formatted step-by-step solutions',
      color: 'from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/20',
      border: 'border-pink-500/20',
      iconBg: 'bg-pink-500/10 text-pink-400',
      tag: 'AI Powered',
      gradeId: 'jee-mains',
      tab: 'doubts',
      chapterTab: 'videos'
    }
  ];

  const faqs = [
    {
      q: 'Is everything really free on Quantrex Academy?',
      a: 'Yes! 100% free. No hidden charges, no subscriptions, no login required. All mathematics content — videos, notes, formulas, PDFs, and mock tests — is freely accessible to every student.'
    },
    {
      q: 'Do I need to register or login to study?',
      a: 'No registration or login needed for students. Just click any topic and start studying instantly. Only admins need to login to upload content.'
    },
    {
      q: 'What is covered in JEE Main vs JEE Advanced?',
      a: 'Both include all 20 mathematics chapters. JEE Advanced content has more rigorous and harder problems, including advanced calculus, vector algebra, 3D geometry, complex numbers, and special problems from past IIT papers.'
    },
    {
      q: 'Can I access this on mobile?',
      a: 'Absolutely! Quantrex Academy is fully mobile-responsive. Study anywhere — videos, formulas, tests all work perfectly on phones and tablets.'
    }
  ];

  return (
    <div className="relative w-full overflow-hidden bg-obsidian">
      {/* Premium Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-electric/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-gold/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

    {/* ==================== TOPPERS / HALL OF FAME ==================== */}
      <section className="bg-gradient-to-b from-obsidian via-cyberdark/60 to-obsidian border-y border-white/5 pt-32 pb-24 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        {/* Glowing Orbs for Hall of Fame */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-gold/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-electric/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="text-xs font-black text-gold uppercase tracking-widest flex items-center gap-2 mb-4 bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Trophy className="h-4 w-4 fill-current" /> HALL OF FAME
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase text-white font-display mb-4 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-yellow-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">Achievers</span>
            </h2>
              <p className="text-gray-400 text-sm md:text-base font-mono max-w-2xl leading-relaxed">
                Outstanding results by students who prepared under the expert guidance of A.K. Sir.
              </p>
            </div>
            
            {/* FEATURED TOPPERS (2024 & 2022) */}
            <div className="w-full max-w-5xl mx-auto mb-20 px-4 flex flex-col items-center gap-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full">
                {/* Left: Dibyanshu Main */}
                <div className="relative group bg-obsidian border border-gold/20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-gold hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img src="/images/toppers/dibyanshu_main.jpg?v=3" alt="Dibyanshu Sahoo JEE Main 2026" className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                </div>
                
                {/* Right: Dibyanshu Advanced */}
                <div className="relative group bg-obsidian border border-electric/20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:border-electric hover:shadow-[0_0_40px_rgba(0,240,255,0.3)] transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img src="/images/toppers/dibyanshu_adv.jpg?v=3" alt="Dibyanshu Sahoo JEE Advanced 2026" className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                </div>
              </div>

              {/* Third Photo: Rakshit Aryan */}
              <div className="w-full md:w-[60%] lg:w-[50%] relative group bg-obsidian border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 hover:-translate-y-2">
                <img src="/images/toppers/rakshit-2022.jpg?v=3" alt="Rakshit Aryan 2022" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              </div>
            </div>

            {/* MARQUEE SECTION */}
            <div className="w-full overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
              <div className="animate-marquee gap-8 py-6 px-4 flex flex-row flex-nowrap w-max hover:[animation-play-state:paused]">
              {[...(toppers || []), ...(toppers || []), ...(toppers || []), ...(toppers || [])].map((t, idx) => (
                <div
                  key={idx}
                  className={`shrink-0 group relative bg-gradient-to-b from-obsidian to-cyberdark/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-gold/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-500 hover:-translate-y-2 flex flex-col ${t.isPoster ? 'w-[400px] md:w-[500px]' : 'w-[300px] md:w-[400px]'}`}
                >
                  {t.isPoster ? (
                    <img src={t.photo} alt={t.name} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                  ) : (
                    <>
                      {/* Glow effect behind */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Image Container */}
                      {t.photo && (
                      <div className="relative w-full aspect-[4/3] bg-cyberdark overflow-hidden">
                        <img
                          src={t.photo}
                          alt={t.name}
                          className="w-full h-full object-cover object-[center_10%] group-hover:scale-[1.05] transition-transform duration-700"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {/* Subtle overlay border */}
                        <div className="absolute inset-0 border-[4px] border-obsidian/40 pointer-events-none mix-blend-overlay"></div>
                      </div>
                      )}

                      {/* Details Footer */}
                      <div className="p-6 flex items-center justify-between border-t border-white/5 relative z-10 flex-1 bg-gradient-to-t from-obsidian to-transparent">
                        <div>
                          <h4 className="text-white font-black text-lg tracking-wide group-hover:text-gold transition-colors duration-300 drop-shadow-md">{t.name}</h4>
                          <p className="text-[11px] text-gray-400 font-mono mt-1 tracking-wider">{t.year}</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-2xl font-black text-electric font-display drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">{t.rank}</span>
                          <span className="text-[10px] bg-electric/10 text-electric border border-electric/30 px-2.5 py-1 rounded font-mono uppercase tracking-widest inline-block mt-1.5 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                            {t.score || t.percent}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              </div>
            </div>
          </div>
      </section>


      {/* ==================== HERO SECTION ==================== */}
      <section className="relative z-10 pt-16 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-2 bg-electric/10 border border-electric/30 text-electric rounded-full text-xs font-bold tracking-widest uppercase mb-8 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <Sparkles className="h-4 w-4 text-gold animate-spin" />
          <span>NIT Rourkela Alumnus</span>
          <span className="hidden sm:block text-white/30">•</span>
          <span>Ex-ALLEN Career Institute Faculty</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 uppercase max-w-5xl leading-none font-display">
          Concepts Create <br/>
          <span className="bg-gradient-to-r from-electric via-cyan-300 to-gold bg-clip-text text-transparent">Destiny</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-gray-100 text-base md:text-xl max-w-4xl mb-8 leading-relaxed font-semibold">
          Mathematics is not about memorizing formulas; it is about developing analytical thinking, problem-solving ability, and the confidence to tackle challenging questions. Strong concepts today create future success.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-10 text-xs md:text-sm font-black text-white uppercase tracking-widest">
           <span className="px-4 py-1.5 border border-white/20 rounded-lg bg-cyberdark/80 shadow-[0_0_15px_rgba(255,255,255,0.1)]">8+ Years Experience</span>
           <span className="px-4 py-1.5 border border-white/20 rounded-lg bg-cyberdark/80 shadow-[0_0_15px_rgba(255,255,255,0.1)]">500+ JEE Adv. Qualifiers</span>
           <span className="px-4 py-1.5 border border-white/20 rounded-lg bg-cyberdark/80 shadow-[0_0_15px_rgba(255,255,255,0.1)]">3000+ JEE Main Qualifiers</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 mb-20">
          <button
            onClick={() => onStartLearning('jee-mains', 'courses', 'videos')}
            className="group relative px-8 py-4 bg-gradient-to-r from-electric to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian font-bold text-sm tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(0,180,216,0.4)] hover:shadow-[0_0_35px_rgba(0,180,216,0.6)] transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2">
              <Rocket className="h-4 w-4" /> Start JEE Main Now — Free
            </span>
          </button>
          <button
            onClick={() => onStartLearning('jee-advanced', 'courses', 'videos')}
            className="px-8 py-4 border-2 border-gold/40 hover:border-gold text-gold hover:text-white font-bold text-sm tracking-widest uppercase rounded-xl bg-cyberdark/40 backdrop-blur shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:bg-gold/10 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" /> JEE Advanced Portal
          </button>
        </div>

        {/* Math formula ticker */}
        <div className="w-full max-w-5xl glass-panel-glow rounded-3xl p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-gradient-to-br from-cyberdark/80 to-obsidian/90">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
          
          <div className="flex-1 flex flex-col items-center p-6 bg-obsidian/80 border border-white/5 rounded-2xl float-math-1 shadow-lg group hover:border-electric/50 transition-colors">
            <span className="text-[10px] text-electric uppercase tracking-widest font-semibold mb-2">Limit Calculus</span>
            <div className="text-xl font-bold font-display text-glow-blue py-3">
              {"$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$"}
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">Fundamental trigonometric limit</p>
          </div>
          <div className="flex-1 flex flex-col items-center p-6 bg-obsidian/80 border border-white/5 rounded-2xl float-math-2 shadow-lg group hover:border-gold/50 transition-colors">
            <span className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-2">Parabolic Geometry</span>
            <div className="text-xl font-bold font-display text-glow-gold py-3 group-hover:scale-105 transition-transform">
              {"$y^2 = 4ax$"}
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">Standard parabola focus equation</p>
          </div>
          <div className="flex-1 flex flex-col items-center p-6 bg-obsidian/80 border border-white/5 rounded-2xl float-math-3 shadow-lg group hover:border-electric/50 transition-colors">
            <span className="text-[10px] text-electric uppercase tracking-widest font-semibold mb-2">Euler's Identity</span>
            <div className="text-xl font-bold font-display text-glow-blue py-3 group-hover:scale-105 transition-transform">
              {"$e^{i\\pi} + 1 = 0$"}
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">The most beautiful equation in math</p>
          </div>
        </div>
      </section>

      {/* ==================== FACULTY CREDENTIALS SECTION ==================== */}
      <section className="py-24 px-6 md:px-12 bg-cyberdark/40 border-t border-white/5 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric/5 rounded-full filter blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 w-full flex justify-center lg:justify-start">
            <div className="relative max-w-md w-full bg-obsidian border border-electric/30 p-3 rounded-2xl shadow-2xl glow-blue group">
              <div className="relative h-[500px] w-full bg-cyberdark rounded-xl overflow-hidden">
                <img
                  src="/images/aksir-profile.jpg"
                  alt="A.K. Sir (Ajay Kumar Saroj)"
                  className="w-full h-full object-cover object-[center_20%] opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h4 className="text-white font-black text-3xl tracking-wider uppercase font-display">Ajay Kumar Saroj</h4>
                  <p className="text-sm text-electric font-bold uppercase tracking-widest mt-2 bg-electric/10 inline-block px-3 py-1 rounded border border-electric/20">Founder, Quantrex Academy &bull; B.Tech, NIT Rourkela</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-10">
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 fill-current" /> MASTER MATHEMATICS FACULTY
              </span>
              <h2 className="text-4xl md:text-6xl font-black uppercase text-white leading-tight font-display mb-6">
                8+ Years of <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-blue-500">Excellence</span>
              </h2>
              <p className="text-gray-100 text-base md:text-lg leading-relaxed font-semibold border-l-4 border-electric/80 pl-5">
                Specialized in JEE Main & Advanced Mathematics. A dedicated mentor whose philosophy revolves around building unbreakable analytical thinking and problem-solving abilities.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-white font-black text-xl uppercase tracking-wider border-b border-white/20 pb-3 flex items-center gap-3">
                <Award className="h-6 w-6 text-gold" /> Professional Experience
              </h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-electric shadow-[0_0_12px_rgba(0,240,255,0.9)]"></div>
                  <div>
                    <h4 className="text-white font-black text-base tracking-wide">Ex-JEE Advanced Mathematics Faculty</h4>
                    <p className="text-sm text-gray-300 font-bold mt-1">ALLEN Career Institute</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-electric shadow-[0_0_12px_rgba(0,240,255,0.9)]"></div>
                  <div>
                    <h4 className="text-white font-black text-base tracking-wide">Former Centre Head & Mathematics Faculty</h4>
                    <p className="text-sm text-gray-300 font-bold mt-1">Axis Institute, Koelnagar, Rourkela, Odisha</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-white font-black text-xl uppercase tracking-wider border-b border-white/20 pb-3 flex items-center gap-3">
                <Trophy className="h-6 w-6 text-gold" /> Key Achievements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-obsidian border-2 border-gold/40 p-5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-gold transition-colors">
                  <h4 className="text-4xl font-black text-gold font-display mb-2">500+</h4>
                  <p className="text-xs text-white uppercase tracking-widest font-black leading-relaxed">Students Qualified<br/>in JEE Advanced</p>
                </div>
                <div className="bg-obsidian border-2 border-electric/40 p-5 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-electric transition-colors">
                  <h4 className="text-4xl font-black text-electric font-display mb-2">3000+</h4>
                  <p className="text-xs text-white uppercase tracking-widest font-black leading-relaxed">Students Qualified<br/>in JEE Main</p>
                </div>
                <div className="bg-cyberdark border border-emerald-500/40 p-4 rounded-xl sm:col-span-2 shadow-lg">
                  <p className="text-sm text-white font-bold flex items-center gap-3 tracking-wide">
                    <CheckCircle className="h-5 w-5 text-emerald-400" /> Outstanding Results in Board Examinations
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== MATHEMATICS QUICK HUB ==================== */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-14 text-center">
          <span className="text-xs font-semibold text-electric uppercase tracking-widest mb-3">INSTANT ACCESS</span>
          <h2 className="text-3xl md:text-5xl font-bold uppercase text-white mb-4">
            Mathematics Study Hub
          </h2>
          <p className="text-gray-400 text-sm font-mono max-w-xl">
            Click any card below — start studying instantly, no login needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathHubCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onStartLearning(card.gradeId, card.tab, card.chapterTab)}
                className={`group relative bg-cyberdark/50 border ${card.border} rounded-2xl p-6 text-left overflow-hidden hover:shadow-lg ${card.glow} hover:scale-[1.02] transition-all duration-300`}
              >
                {/* Background gradient glow */}
                <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl ${card.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />

                {/* Tag */}
                <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-4 border ${card.border} ${card.iconBg}`}>
                  {card.tag}
                </span>

                {/* Icon */}
                <div className={`h-12 w-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 border ${card.border}`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-white font-bold text-base mb-2 leading-tight">{card.label}</h3>
                <p className="text-gray-400 text-xs font-mono leading-relaxed mb-4">{card.desc}</p>

                {/* CTA Arrow */}
                <div className={`flex items-center gap-1 text-xs font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                  Start Now <ChevronRight className="h-3.5 w-3.5 text-current opacity-70 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== ALL COURSES GRID ==================== */}
      <section id="courses-section" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-xs font-semibold text-electric uppercase tracking-widest mb-3">FULL CURRICULUM</span>
          <h2 className="text-3xl md:text-5xl font-bold uppercase text-white">All Mathematics Courses</h2>
          <p className="text-gray-400 text-xs md:text-sm font-mono max-w-xl mt-3">
            Every course is free and open — no fees, no login, just mathematics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-cyberdark/40 border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-electric/30 hover:shadow-electric/5 transition-all flex flex-col group"
            >
              <div className="relative h-48 w-full bg-obsidian overflow-hidden">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute top-4 left-4 bg-obsidian/80 border border-electric/40 text-electric text-[10px] font-bold px-2.5 py-1 rounded font-display tracking-widest uppercase">
                  {course.tag}
                </div>
                <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  FREE
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-gold mb-2">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-xs font-bold text-white font-mono">{course.rating}</span>
                    <span className="text-gray-500 text-[10px] font-mono">(Open Access)</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3 tracking-wide">{course.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-6 font-mono">
                    {course.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                      ✨ 100% Free — No Login
                    </span>
                  </div>
                  <button
                    onClick={() => onStartLearning(course.id, 'courses', 'videos')}
                    className="w-full py-3 bg-gradient-to-r from-electric to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-cyan-500/20"
                  >
                    Start Learning Free →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== STATS STRIP ==================== */}
      <section className="py-16 px-6 bg-cyberdark/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '20+', label: 'Chapters Per Course', icon: BookOpen },
            { num: '500+', label: 'Practice Problems', icon: Target },
            { num: '100%', label: 'Free Forever', icon: Sparkles },
            { num: '1500+', label: 'Students Mentored', icon: TrendingUp }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="space-y-2">
                <div className="flex justify-center">
                  <div className="h-10 w-10 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-electric" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-white font-display">{stat.num}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>



      {/* ==================== FAQ SECTION ==================== */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-electric uppercase tracking-widest mb-3 block">RESOLVING DOUBTS</span>
          <h2 className="text-3xl font-bold text-white uppercase">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`bg-cyberdark/30 border rounded-xl overflow-hidden transition-all cursor-pointer ${activeFaq === idx ? 'border-electric/30' : 'border-white/5 hover:border-white/10'}`}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between p-5 gap-4">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <HelpCircle className={`h-4 w-4 shrink-0 ${activeFaq === idx ? 'text-electric' : 'text-gray-500'}`} />
                  {faq.q}
                </h4>
                <ChevronRight className={`h-4 w-4 text-gray-500 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-90 text-electric' : ''}`} />
              </div>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-xs text-gray-400 font-mono leading-relaxed pl-6 border-l border-electric/30">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==================== MOBILE STICKY FOOTER ==================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-obsidian/90 backdrop-blur-md border-t border-white/10 py-3.5 px-4 md:hidden flex justify-around items-center">
        <a
          href="https://wa.me/918700508344"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center text-[10px] text-emerald-400 font-semibold font-mono"
        >
          <MessageCircle className="h-5 w-5 fill-emerald-500/10 mb-1" />
          WhatsApp
        </a>
        <a
          href="tel:+918700508344"
          className="flex flex-col items-center text-[10px] text-electric font-semibold font-mono"
        >
          <PhoneCall className="h-5 w-5 fill-electric/10 mb-1" />
          Call Now
        </a>
        <button
          onClick={() => onStartLearning('jee-mains', 'courses', 'videos')}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-electric to-blue-600 text-obsidian font-bold text-[10px] tracking-wider uppercase rounded-lg shadow"
        >
          <Gift className="h-3.5 w-3.5" />
          Study Free
        </button>
      </div>
    </div>
  );
}
