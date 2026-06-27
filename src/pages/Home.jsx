import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, BookOpen, Star, HelpCircle, PhoneCall, Gift, MessageCircle, Bot, FileText, Flame, Award, Layers, ChevronRight, Zap, Target, TrendingUp, Rocket, Trophy, CheckCircle, Calculator, Atom, TestTube, Briefcase } from 'lucide-react';

export default function Home({ user, setActivePage, courses, setCourses, toppers, onStartLearning, homeData }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const mathHubCards = [
    {
      id: 'jee-main',
      icon: Target,
      label: 'JEE Main',
      desc: 'Complete syllabus — Physics, Chemistry, Mathematics',
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
      icon: Rocket,
      label: 'JEE Advanced',
      desc: 'Advanced problem solving techniques for Physics, Chemistry, Mathematics',
      color: 'from-purple-500 to-indigo-600',
      glow: 'shadow-purple-500/20',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/10 text-purple-400',
      tag: 'JEE Adv',
      gradeId: 'jee-advanced',
      tab: 'courses',
      chapterTab: 'videos'
    },
    {
      id: 'nda',
      icon: Shield,
      label: 'NDA',
      desc: 'Targeted preparation for Mathematics, General Science, English, General Studies',
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
      label: 'Mock Test Series',
      desc: 'Full length mock tests with NTA interface and detailed analytics',
      color: 'from-gold to-yellow-600',
      glow: 'shadow-yellow-500/20',
      border: 'border-yellow-500/20',
      iconBg: 'bg-yellow-500/10 text-yellow-400',
      tag: 'Testing',
      gradeId: 'test-series',
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

  const faqsData = homeData?.faqs || [
    { question: 'What is Quantrex Academy?', answer: 'Quantrex Academy is a specialized portal for JEE aspirants focusing deeply on mastering Mathematics.' },
    { question: 'Are the mock tests pattern aligned?', answer: 'Yes, our testing platform exactly mimics the official NTA (JEE Main) and TCS iON (JEE Advanced) environments.' },
    { question: 'Can I access the content on mobile?', answer: 'Yes! Quantrex Academy is fully mobile-responsive and designed to work seamlessly across all your devices.' },
    { question: 'Do you provide study material?', answer: 'Yes, comprehensive notes, practice sheets, and mock tests are provided with every course.' }
  ];

  return (
    <motion.div 
      className="relative w-full overflow-hidden bg-obsidian min-h-screen text-white font-inter"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-electric/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Hero Section */}
        <motion.div className="text-center max-w-4xl mx-auto mb-20 pt-10" variants={itemVariants}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm text-gray-300">Premium Mathematics Education</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            {homeData?.heroTitle || 'Dominate JEE Math with'} <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-cyan-300 to-gold">
              {homeData?.heroSubtitle || 'Quantrex Academy'}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {homeData?.heroDescription || 'Master JEE Main and Advanced Mathematics with A.K. Sir. Access premium video lectures, complete syllabus coverage, structured mock tests, and smart PYQ analytics.'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStartLearning('jee-mains', 'courses', 'videos')}
              className="px-8 py-4 bg-gradient-to-r from-electric to-blue-600 hover:from-blue-500 hover:to-electric text-white rounded-xl font-semibold text-lg shadow-lg shadow-electric/20 flex items-center gap-2 w-full sm:w-auto justify-center transition-all border border-electric/50"
            >
              Start Learning <ChevronRight className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivePage('tests')}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-lg flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
            >
              Take a Mock Test <Target className="w-5 h-5 text-cyan-400" />
            </motion.button>
          </div>
        </motion.div>

        {/* SLIDER SECTION (Infinite Auto-scroll) */}
        <motion.div variants={itemVariants} className="relative w-full overflow-hidden mb-24 py-10 bg-white/5 border-y border-white/10 rounded-3xl">
          <div className="flex animate-marquee whitespace-nowrap items-center space-x-12">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                {["JEE Main", "JEE Advanced", "NDA", "BITSAT", "Class 12 Boards", "Class 11 Foundation", "KVPY"].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <span className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-gray-500 to-gray-700 opacity-60">
                      {item}
                    </span>
                    <Star className="w-6 h-6 text-gray-700 opacity-60" />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* TOPPERS SECTION */}
        {toppers && toppers.length > 0 && (
          <motion.div variants={itemVariants} className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">
                Hall of <span className="text-gold">Fame</span>
              </h2>
              <p className="text-gray-400">Meet our top scorers who dominated the exams.</p>
            </div>
            
            <div className="flex justify-center flex-wrap gap-8">
              {toppers.filter(t => t.isPoster).map((t, idx) => (
                <motion.div 
                  key={t.id || idx}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="relative group w-64 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-xl"
                >
                  <div className="h-64 overflow-hidden relative bg-gradient-to-b from-gray-800 to-obsidian">
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 w-full p-4 text-center">
                    <h3 className="font-bold text-xl text-white mb-1 drop-shadow-md">{t.name}</h3>
                    <div className="inline-block px-3 py-1 bg-gold/20 text-gold border border-gold/30 rounded-full text-sm font-bold shadow-lg shadow-gold/20">
                      {t.rank}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{t.score} ({t.year})</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Math Hub / Courses Section */}
        <motion.div className="mb-24" variants={itemVariants}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">Choose Your <span className="text-electric">Path</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Select your target examination and access curated content designed for top ranks.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mathHubCards.map((card, i) => (
              <motion.div 
                key={card.id}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative p-8 rounded-3xl bg-white/5 border ${card.border} backdrop-blur-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${card.glow}`}
                onClick={() => {
                  if (card.id === 'test-series') {
                    setActivePage('tests');
                  } else {
                    onStartLearning(card.gradeId, card.tab, card.chapterTab);
                  }
                }}
              >
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-500 group-hover:opacity-40`} />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`p-4 rounded-2xl ${card.iconBg} shadow-inner`}>
                    <card.icon className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-white/10 text-gray-200 border border-white/5 shadow-sm">
                    {card.tag}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white relative z-10 group-hover:text-electric transition-colors">{card.label}</h3>
                <p className="text-gray-400 text-sm mb-8 relative z-10 leading-relaxed min-h-[60px]">{card.desc}</p>
                
                <div className="flex items-center text-sm font-semibold text-gray-300 group-hover:text-electric transition-colors relative z-10">
                  Explore Module <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div className="mb-24" variants={itemVariants}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">Why <span className="text-electric">Quantrex?</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => {
              const icons = [Shield, Zap, BookOpen, Trophy];
              const Icon = icons[i % icons.length];
              return (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5, scale: 1.03 }}
                  className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 text-center group"
                >
                  <div className="w-16 h-16 mx-auto bg-electric/10 text-electric rounded-2xl flex items-center justify-center mb-6 group-hover:bg-electric group-hover:text-white transition-all duration-300 shadow-lg shadow-electric/5">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{feat.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div className="max-w-3xl mx-auto mb-20" variants={itemVariants}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">Frequently Asked <span className="text-cyan-400">Questions</span></h2>
          </div>
          
          <div className="space-y-4">
            {faqsData.map((faq, i) => (
              <motion.div 
                key={i}
                className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 hover:bg-white/10 transition-colors"
                initial={false}
              >
                <button 
                  className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-90 text-electric' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div 
          className="text-center p-16 rounded-[2.5rem] bg-gradient-to-br from-electric/20 via-cyan-900/20 to-obsidian border border-electric/30 relative overflow-hidden shadow-[0_0_50px_rgba(0,180,216,0.15)]"
          variants={itemVariants}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-electric/20 blur-[120px] pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10 font-display">Ready to transform your preparation?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto relative z-10">Join Quantrex Academy today and unlock your true potential in Mathematics.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStartLearning('jee-mains', 'courses', 'videos')}
            className="px-10 py-5 bg-white text-obsidian rounded-2xl font-bold text-xl relative z-10 flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl transition-all"
          >
            Get Started Now <Zap className="w-6 h-6 text-electric" />
          </motion.button>
        </motion.div>

      </div>
    </motion.div>
  );
}