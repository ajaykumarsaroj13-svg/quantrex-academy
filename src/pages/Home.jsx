import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, BookOpen, Star, HelpCircle, PhoneCall, Gift, MessageCircle, Bot, FileText, Flame, Award, Layers, ChevronRight, Zap, Target, TrendingUp, Rocket, Trophy, CheckCircle } from 'lucide-react';
import PremiumBanner from '../components/PremiumBanner';
import ContactSection from '../components/ContactSection';
export default function Home({ user, setActivePage, courses, setCourses, toppers, onStartLearning, homeData, isLight }) {
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
      color: 'from-purple-500 to-indigo-600',
      glow: 'shadow-purple-500/20',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/10 text-purple-400',
      tag: 'JEE Advanced',
      gradeId: 'jee-advanced',
      tab: 'courses',
      chapterTab: 'videos'
    },
    {
      id: 'nda',
      icon: Shield,
      label: 'NDA Mathematics',
      desc: 'Targeted preparation for Mathematics, General Science & English',
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/20',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      tag: 'NDA',
      gradeId: 'nda',
      tab: 'courses',
      chapterTab: 'videos'
    },
    {
      id: 'class-12',
      icon: BookOpen,
      label: 'Class 12 Boards',
      desc: 'Comprehensive coverage of Class 12 CBSE/ICSE syllabus',
      color: 'from-orange-500 to-red-600',
      glow: 'shadow-orange-500/20',
      border: 'border-orange-500/20',
      iconBg: 'bg-orange-500/10 text-orange-400',
      tag: 'CBSE/ICSE',
      gradeId: 'class-12',
      tab: 'courses',
      chapterTab: 'videos'
    },
    {
      id: 'class-11',
      icon: Layers,
      label: 'Class 11 Foundation',
      desc: 'Build strong fundamentals for competitive exams',
      color: 'from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/20',
      border: 'border-pink-500/20',
      iconBg: 'bg-pink-500/10 text-pink-400',
      tag: 'Foundation',
      gradeId: 'class-11',
      tab: 'courses',
      chapterTab: 'videos'
    },
    {
      id: 'test-series',
      icon: Award,
      label: 'Official Paper',
      desc: 'Full length mock tests with NTA interface and detailed analytics',
      color: 'from-gold to-yellow-600',
      glow: 'shadow-yellow-500/20',
      border: 'border-yellow-500/20',
      iconBg: 'bg-yellow-500/10 text-yellow-400',
      tag: 'Testing',
      gradeId: 'jee-mains',
      tab: 'tests',
      chapterTab: 'videos'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const features = homeData?.features || [
    { id: 'f1', title: 'Interactive PYQs', desc: 'Chapter-wise past year questions with smart analytics.' },
    { id: 'f2', title: 'Structured Tests', desc: 'Real exam simulation with NTA & TCS iON interface.' },
    { id: 'f3', title: 'Expert Video Solutions', desc: 'Detailed explanations by A.K. Sir.' },
    { id: 'f4', title: 'Comprehensive Notes', desc: 'Handwritten notes and short tricks.' }
  ];

  const faqs = homeData?.faqs || [
    {
      question: 'Is everything really free on Quantrex Academy?',
      answer: 'Yes! 100% free. No hidden charges, no subscriptions, no login required. All mathematics content — videos, notes, formulas, PDFs, and mock tests — is freely accessible to every student.'
    },
    {
      question: 'Do I need to register or login to study?',
      answer: 'No registration or login needed for students. Just click any topic and start studying instantly. Only admins need to login to upload content.'
    },
    {
      question: 'What is covered in JEE Main vs JEE Advanced?',
      answer: 'Both include all 20 mathematics chapters. JEE Advanced content has more rigorous and harder problems, including advanced calculus, vector algebra, 3D geometry, complex numbers, and special problems from past IIT papers.'
    },
    {
      question: 'Can I access this on mobile?',
      answer: 'Absolutely! Quantrex Academy is fully mobile-responsive. Study anywhere — videos, formulas, tests all work perfectly on phones and tablets.'
    }
  ];

  return (
    <motion.div 
      className={`relative w-full overflow-hidden min-h-screen font-inter ${isLight ? 'bg-white' : 'bg-obsidian'}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Premium Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-electric/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-gold/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      </div>

      {/* ==================== 0. PREMIUM TEST SERIES BANNER (TOP) ==================== */}
      <section className="relative z-20 pt-8 pb-4 px-4 md:px-8 max-w-7xl mx-auto w-full">
         <PremiumBanner onStart={() => setActivePage('ultimate-test-series')} theme={isLight ? 'light' : 'dark'} />
      </section>

      {/* ==================== 1. RESULTS / HALL OF FAME (SLIDING AT THE VERY TOP) ==================== */}
      {toppers && toppers.length > 0 && (
        <section className="bg-cyberdark/30 border-b border-white/5 py-16 px-6 overflow-hidden relative z-10">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10 mb-8">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-semibold text-gold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 fill-current" /> HALL OF FAME
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase text-white font-display mb-3">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-400">Achievers</span>
              </h2>
              <p className="text-gray-400 text-sm font-mono max-w-xl">
                Outstanding results by students who prepared under the expert guidance of A.K. Sir.
              </p>
            </div>
          </div>

          {/* FEATURED TOPPERS (JEE Mains 2026 & JEE Advanced 2026) */}
          <div className="w-full max-w-5xl mx-auto mb-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Left: Dibyanshu 2026 JEE Main */}
              <div className="relative group bg-obsidian border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-gold transition-all duration-500 hover:-translate-y-2">
                <img src="/images/toppers/top_1.png" alt="Dibyanshu Sahoo JEE Main 2026" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              </div>
              
              {/* Right: Dibyanshu 2026 JEE Advanced */}
              <div className="relative group bg-obsidian border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-electric transition-all duration-500 hover:-translate-y-2">
                <img src="/images/toppers/top_2.png" alt="Dibyanshu Sahoo JEE Advanced 2026" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              </div>
            </div>
          </div>

          {/* Sliding Infinite Marquee */}
          <div className="w-full overflow-hidden">
            <div className="animate-marquee gap-8 py-4 px-4 flex flex-row flex-nowrap">
              {(() => {
                const marqueeToppers = (toppers || []).filter(t => (t.name || '').toUpperCase() !== 'DIBYANSHU SAHOO');
                return [...marqueeToppers, ...marqueeToppers, ...marqueeToppers, ...marqueeToppers].map((t, idx) => (
                  <div
                    key={idx}
                    className="w-[300px] md:w-[400px] shrink-0 group relative bg-obsidian border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-gold/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/3] bg-cyberdark overflow-hidden">
                      <img
                        src={t.photo}
                        alt={t.name}
                        className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-700"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'; }}
                      />
                      <div className="absolute inset-0 border-[4px] border-obsidian/20 pointer-events-none mix-blend-overlay"></div>
                    </div>

                    {/* Details Footer */}
                    <div className="p-5 flex items-center justify-between bg-gradient-to-r from-obsidian to-cyberdark/80 border-t border-white/5 relative z-10">
                      <div>
                        <h4 className="text-white font-black text-lg tracking-wide group-hover:text-gold transition-colors">{t.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">{t.year}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-xl font-black text-electric font-display">{t.rank}</span>
                        <span className="text-[10px] bg-electric/10 text-electric border border-electric/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider inline-block mt-1">
                          {t.score || t.percent}
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>
      )}

      {/* ==================== 2. HERO SECTION ==================== */}
      <section className="relative z-10 pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-2 bg-electric/10 border border-electric/30 text-electric rounded-full text-xs font-bold tracking-widest uppercase mb-8 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <Sparkles className="h-4 w-4 text-gold animate-spin" />
          <span>NIT Rourkela Alumnus</span>
          <span className="hidden sm:block text-white/30">•</span>
          <span>Ex-ALLEN Career Institute Faculty</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 uppercase max-w-5xl leading-none font-display">
          {homeData?.heroTitle || 'Concepts Create'} <br/>
          <span className="bg-gradient-to-r from-electric via-cyan-300 to-gold bg-clip-text text-transparent">
            {homeData?.heroSubtitle || 'Destiny'}
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-gray-100 text-base md:text-xl max-w-4xl mb-8 leading-relaxed font-semibold">
          {homeData?.heroDescription || 'Mathematics is not about memorizing formulas; it is about developing analytical thinking, problem-solving ability, and the confidence to tackle challenging questions. Strong concepts today create future success.'}
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
              {"$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$"}
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">Fundamental trigonometric limit</p>
          </div>
          <div className="flex-1 flex flex-col items-center p-6 bg-obsidian/80 border border-white/5 rounded-2xl float-math-2 shadow-lg group hover:border-gold/50 transition-colors">
            <span className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-2">Parabolic Geometry</span>
            <div className="text-xl font-bold font-display text-glow-gold py-3 group-hover:scale-105 transition-transform">
              {"$$y^2 = 4ax$$"}
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">Standard parabola focus equation</p>
          </div>
          <div className="flex-1 flex flex-col items-center p-6 bg-obsidian/80 border border-white/5 rounded-2xl float-math-3 shadow-lg group hover:border-electric/50 transition-colors">
            <span className="text-[10px] text-electric uppercase tracking-widest font-semibold mb-2">Euler's Identity</span>
            <div className="text-xl font-bold font-display text-glow-blue py-3 group-hover:scale-105 transition-transform">
              {"$$e^{i\\pi} + 1 = 0$$"}
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">The most beautiful equation in math</p>
          </div>
        </div>
      </section>


      {/* ==================== 3. FACULTY CREDENTIALS SECTION (RESTORED) ==================== */}
      <section className="py-24 px-6 md:px-12 bg-cyberdark/40 border-t border-white/5 relative overflow-hidden z-10">
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

      {/* ==================== 4. MATHEMATICS STUDY HUB ==================== */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
        <div className="flex flex-col items-center mb-14 text-center">
          <span className="text-xs font-semibold text-electric uppercase tracking-widest mb-3">INSTANT ACCESS</span>
          <h2 className="text-3xl md:text-5xl font-bold uppercase text-white mb-4">
            Choose Your Path
          </h2>
          <p className="text-gray-400 text-sm font-mono max-w-xl">
            Select your target examination module to begin practice or mock testing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathHubCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => {
                  if (card.id === 'test-series') {
                    setActivePage('tests');
                  } else {
                    onStartLearning(card.gradeId, card.tab, card.chapterTab);
                  }
                }}
                className={`group relative bg-cyberdark/50 border ${card.border} rounded-2xl p-6 text-left overflow-hidden hover:shadow-lg ${card.glow} hover:scale-[1.02] transition-all duration-300`}
              >
                <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl ${card.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                
                <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-4 border ${card.border} ${card.iconBg}`}>
                  {card.tag}
                </span>

                <div className={`h-12 w-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 border ${card.border}`}>
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-white font-bold text-base mb-2 leading-tight">{card.label}</h3>
                <p className="text-gray-400 text-xs font-mono leading-relaxed mb-4">{card.desc}</p>

                <div className={`flex items-center gap-1 text-xs font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                  Start Now <ChevronRight className="h-3.5 w-3.5 text-current opacity-70 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== 5. FEATURES / WHY QUANTREX ==================== */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">Why <span className="text-electric">Quantrex?</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => {
            const icons = [Shield, Zap, BookOpen, Trophy];
            const Icon = icons[i % icons.length];
            return (
              <div 
                key={i}
                className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 text-center group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-16 h-16 mx-auto bg-electric/10 text-electric rounded-2xl flex items-center justify-center mb-6 group-hover:bg-electric group-hover:text-white transition-all duration-300 shadow-lg shadow-electric/5">
                  <Icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold mb-3">{feat.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== 6. FAQs SECTION ==================== */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto z-10 relative">
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
                  {faq.question}
                </h4>
                <ChevronRight className={`h-4 w-4 text-gray-500 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-90 text-electric' : ''}`} />
              </div>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-xs text-gray-400 font-mono leading-relaxed pl-6 border-l border-electric/30">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 7. FOOTER CTA ==================== */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
        <div className="text-center p-16 rounded-[2.5rem] bg-gradient-to-br from-electric/20 via-cyan-900/20 to-obsidian border border-electric/30 relative overflow-hidden shadow-[0_0_50px_rgba(0,180,216,0.15)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-electric/20 blur-[120px] pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10 font-display">Ready to transform your preparation?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto relative z-10">Join Quantrex Academy today and unlock your true potential in Mathematics.</p>
          <button 
            onClick={() => onStartLearning('jee-mains', 'courses', 'videos')}
            className="px-10 py-5 bg-white text-obsidian rounded-2xl font-bold text-xl relative z-10 flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Get Started Now <Zap className="w-6 h-6 text-electric animate-pulse" />
          </button>
        </div>
      </section>

      <ContactSection theme={isLight ? 'light' : 'dark'} />

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
    </motion.div>
  );
}