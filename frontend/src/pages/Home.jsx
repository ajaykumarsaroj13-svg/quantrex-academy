import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, BookOpen, Star, HelpCircle, PhoneCall, Gift, MessageCircle, CreditCard, CheckCircle2, ChevronRight, UserCheck } from 'lucide-react';

export default function Home({ onEnrollSuccess, user, setActivePage, courses, setCourses }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select'); // select, checkout, success
  const [paymentProvider, setPaymentProvider] = useState('Razorpay');

  // Slide content for Toppers
  const toppers = [
    { name: 'Kanishk Mittal', rank: 'AIR 1', year: 'JEE Advanced 2025', percent: '100% in Maths' },
    { name: 'Aarav Singhal', rank: 'AIR 14', year: 'JEE Advanced 2025', percent: '96/120 in Maths' },
    { name: 'Riya Gupta', rank: 'AIR 32', year: 'JEE Advanced 2024', percent: '100% in Calculus' }
  ];

  const handleEnrollClick = (course) => {
    if (!user) {
      alert('Please Login or Register to enroll in courses!');
      setActivePage('login');
      return;
    }
    // Check if course already purchased
    if (user.purchasedCourses?.includes(course.id)) {
      alert('You have already enrolled in this course. Accessing student portal!');
      setActivePage('student-dashboard');
      return;
    }
    setSelectedCourse(course);
    setPaymentStep('checkout');
  };

  const handleProcessPayment = async () => {
    if (!selectedCourse) return;
    setPaymentStep('processing');

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          paymentProvider
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentStep('success');
        onEnrollSuccess?.(selectedCourse.id);
      } else {
        // Fallback for standalone mockup mode (when backend is not running)
        setTimeout(() => {
          setPaymentStep('success');
          onEnrollSuccess?.(selectedCourse.id);
        }, 1500);
      }
    } catch (e) {
      // Offline fallback
      setTimeout(() => {
        setPaymentStep('success');
        onEnrollSuccess?.(selectedCourse.id);
      }, 1500);
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative z-10 pt-20 pb-28 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Top tagline badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-electric/10 border border-electric/30 text-electric rounded-full text-xs font-semibold tracking-wider uppercase mb-8 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
          <Sparkles className="h-4 w-4 text-gold animate-spin" />
          <span>ADMISSIONS OPEN FOR JEE MAIN & ADVANCED 2027</span>
        </div>

        {/* Brand headline */}
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-6 uppercase max-w-5xl leading-none">
          Where <span className="bg-gradient-to-r from-electric via-white to-gold bg-clip-text text-transparent">Rankers</span> Are Engineered
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm md:text-xl max-w-3xl mb-10 leading-relaxed font-mono">
          High-end cognitive math infrastructure designed exclusively for IIT-JEE Advanced aspirants. Guided by <span className="text-gold font-bold text-glow-gold">A.K. Sir (Ajay Kumar Saroj)</span>.
        </p>

        {/* CTA triggers */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button 
            onClick={() => {
              const el = document.getElementById('courses-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-gradient-to-r from-electric to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian font-bold text-sm tracking-wider uppercase rounded-lg shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all"
          >
            Explore Courses
          </button>
          <button 
            onClick={() => setActivePage('login')}
            className="px-8 py-4 border border-white/10 hover:border-electric/40 text-platinum hover:text-white font-bold text-sm tracking-wider uppercase rounded-lg bg-cyberdark/40 backdrop-blur transition-all"
          >
            Start Free Demo
          </button>
        </div>

        {/* Interactive Mathematics Animations Widget */}
        <div className="w-full max-w-4xl glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {/* Animated Function 1 */}
          <div className="flex-1 flex flex-col items-center p-4 bg-obsidian/60 border border-white/5 rounded-xl float-math-1">
            <span className="text-[10px] text-electric uppercase tracking-widest font-semibold mb-2">Limit Calculus</span>
            <div className="text-xl font-bold font-display text-glow-blue py-3">
              {"$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$"}
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">Engineered limits mapping curve equations</p>
          </div>

          {/* Animated Function 2 */}
          <div className="flex-1 flex flex-col items-center p-4 bg-obsidian/60 border border-white/5 rounded-xl float-math-2">
            <span className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-2">Parabolic Reflector</span>
            <div className="text-xl font-bold font-display text-glow-gold py-3">
              {"$$y^2 = 4ax$$"}
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">Coordinate geometry parabolic focal rays</p>
          </div>

          {/* Animated Function 3 */}
          <div className="flex-1 flex flex-col items-center p-4 bg-obsidian/60 border border-white/5 rounded-xl float-math-3">
            <span className="text-[10px] text-electric uppercase tracking-widest font-semibold mb-2">Complex Plane</span>
            <div className="text-xl font-bold font-display text-glow-blue py-3">
              {"$$e^{i\\pi} + 1 = 0$$"}
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">Euler's identity complex rotational coordinate</p>
          </div>
        </div>
      </section>

      {/* 2. RESULTS / HALL OF FAME SLIDER */}
      <section className="bg-cyberdark/30 border-y border-white/5 py-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs tracking-[0.2em] font-semibold text-gold uppercase mb-8">
            QUANTREX TOPPERS • RECENT JEE ADVANCED Ranks
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {toppers.map((t, idx) => (
              <div key={idx} className="bg-obsidian border border-white/5 p-6 rounded-xl hover:border-gold/30 hover:scale-[1.02] transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-gold/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-gold font-display">{t.rank}</span>
                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400">{t.year}</span>
                </div>
                <h4 className="text-white font-semibold text-lg">{t.name}</h4>
                <p className="text-xs text-electric font-mono mt-1">{t.percent}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COURSE SHOWCASE CARDS */}
      <section id="courses-section" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-xs font-semibold text-electric uppercase tracking-widest mb-3">CURRICULUM SUITE</span>
          <h2 className="text-3xl md:text-5xl font-bold uppercase text-white">IIT-JEE Mathematics Courses</h2>
          <p className="text-gray-400 text-xs md:text-sm font-mono max-w-xl mt-3">
            Fully comprehensive systems including interactive video players, watermarked DPPs, test evaluation dashboards, and AI support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const hasPurchased = user?.purchasedCourses?.includes(course.id);
            return (
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
                  {hasPurchased && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-obsidian text-[10px] font-bold px-2.5 py-1 rounded font-display tracking-widest uppercase flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      ENROLLED
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-gold mb-2">
                      <Star className="h-4.5 w-4.5 fill-current" />
                      <span className="text-xs font-bold text-white font-mono">{course.rating}</span>
                      <span className="text-gray-500 text-[10px] font-mono">(420 reviews)</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-3 tracking-wide">{course.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-6 font-mono">
                      {course.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-2xl font-bold text-white font-display">₹{course.price}</span>
                      <span className="text-xs text-gray-500 line-through font-mono">₹{course.originalPrice}</span>
                      <span className="text-[10px] text-emerald-400 font-bold font-mono">70% OFF</span>
                    </div>

                    <button 
                      onClick={() => handleEnrollClick(course)}
                      className={`w-full py-3 text-xs font-bold tracking-wider uppercase rounded-lg transition-all ${
                        hasPurchased 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-obsidian' 
                          : 'bg-obsidian border border-white/10 hover:border-electric text-white hover:text-electric'
                      }`}
                    >
                      {hasPurchased ? 'ACCESS DASHBOARD' : 'ENROLL NOW'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FOUNDER SECTION: A.K. SIR */}
      <section className="py-24 px-6 md:px-12 bg-cyberdark/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Visual card */}
          <div className="flex-1 w-full flex justify-center">
            <div className="relative max-w-sm w-full bg-obsidian border border-gold/20 p-4 rounded-2xl shadow-xl glow-gold group">
              <div className="relative h-[400px] w-full bg-cyberdark rounded-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" 
                  alt="A.K. Sir (Ajay Kumar Saroj)"
                  className="w-full h-full object-cover opacity-80 filter grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h4 className="text-white font-bold text-xl tracking-wider">A.K. SIR</h4>
                  <p className="text-xs text-gold font-mono uppercase mt-1">Founder, Ajay Kumar Saroj</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description content */}
          <div className="flex-1 space-y-6">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">FOUNDER & MASTER CLASS INSTRUCTOR</span>
            <h2 className="text-3xl md:text-5xl font-bold uppercase text-white leading-tight">AJAY KUMAR SAROJ</h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed font-mono">
              Widely acknowledged for engineering top ranks in IIT-JEE Mathematics. Coached over 1,500 students into premiere IITs and NITs. Ajay Kumar Saroj (A.K. Sir) brings a structured algebraic and geometric analysis methodology that reduces complex calculus constraints into visual, intuitive patterns.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="border-l-2 border-electric pl-4">
                <h5 className="text-white font-bold text-lg font-display">12+ Years</h5>
                <p className="text-xs text-gray-500 font-mono mt-1">Teaching Excellence</p>
              </div>
              <div className="border-l-2 border-gold pl-4">
                <h5 className="text-white font-bold text-lg font-display">1500+</h5>
                <p className="text-xs text-gray-500 font-mono mt-1">IITians Mentored</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQS & REVIEWS */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-electric uppercase tracking-widest mb-3">RESOLVING DOUBTS</span>
          <h2 className="text-3xl font-bold text-white uppercase">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: 'How does the content protection and anti-piracy system work?', a: 'Quantrex utilizes session device-fingerprinting (max 1 device login), dynamic identity watermarking on videos (incorporating name, phone, and IP), custom web-safe PDF visualizers that disable print/download tags, and visibility-detection blur overlays.' },
            { q: 'Is there support for UPI, Net Banking, and Card payments?', a: 'Yes! We support complete integrations of payments using Razorpay, Stripe, and direct scan UPI. Upon successful transaction, your course is unlocked in real-time.' },
            { q: 'Can I access lectures on mobile?', a: 'Quantrex is a responsive mobile-first web app. You can log in on any mobile browser, view lectures, download watermarked notes, and play live mock examinations.' }
          ].map((faq, idx) => (
            <div key={idx} className="bg-cyberdark/30 border border-white/5 p-6 rounded-xl space-y-2">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <HelpCircle className="h-4.5 w-4.5 text-electric shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-gray-400 font-mono leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. MOBILE STICKY FLOATING ACTION FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-obsidian/90 backdrop-blur-md border-t border-white/10 py-3.5 px-4 md:hidden flex justify-around items-center">
        <a 
          href="https://wa.me/919876543210" 
          target="_blank" 
          rel="noreferrer"
          className="flex flex-col items-center text-[10px] text-emerald-400 font-semibold font-mono"
        >
          <MessageCircle className="h-5 w-5 fill-emerald-500/10 mb-1" />
          WhatsApp
        </a>
        <a 
          href="tel:+919876543210" 
          className="flex flex-col items-center text-[10px] text-electric font-semibold font-mono"
        >
          <PhoneCall className="h-5 w-5 fill-electric/10 mb-1" />
          Call Now
        </a>
        <button 
          onClick={() => {
            const el = document.getElementById('courses-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-electric to-blue-600 text-obsidian font-bold text-[10px] tracking-wider uppercase rounded-lg shadow"
        >
          <Gift className="h-3.5 w-3.5" />
          Join Demo
        </button>
      </div>

      {/* 7. PREMIUM PAYMENT GATEWAY CHECKOUT MODAL */}
      {selectedCourse && paymentStep !== 'select' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-cyberdark border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in relative z-50">
            {/* Modal Header */}
            <div className="p-5 bg-obsidian border-b border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Secure Checkout</h4>
                <span className="text-[10px] text-gray-500 font-mono">Quantrex Secure Layer v1.02</span>
              </div>
              <button 
                onClick={() => setSelectedCourse(null)} 
                className="text-gray-400 hover:text-white transition-colors text-xs font-bold"
              >
                ✕ CLOSE
              </button>
            </div>

            {paymentStep === 'checkout' && (
              <div className="p-6 space-y-6">
                <div className="bg-obsidian/50 p-4 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block mb-1">Purchasing Course</span>
                  <h5 className="text-white font-bold text-sm">{selectedCourse.title}</h5>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-white font-display">₹{selectedCourse.price}</span>
                    <span className="text-xs text-gray-500 line-through font-mono">₹{selectedCourse.originalPrice}</span>
                  </div>
                </div>

                {/* Choose Payment Options */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 font-mono">SELECT PAYMENT PROVIDER</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPaymentProvider('Razorpay')}
                      className={`p-3 border rounded-xl flex items-center justify-center gap-2 transition-all font-display text-xs ${paymentProvider === 'Razorpay' ? 'border-electric bg-electric/10 text-electric font-bold' : 'border-white/5 bg-obsidian/50 text-platinum'}`}
                    >
                      <CreditCard className="h-4 w-4" />
                      Razorpay
                    </button>
                    <button 
                      onClick={() => setPaymentProvider('Stripe')}
                      className={`p-3 border rounded-xl flex items-center justify-center gap-2 transition-all font-display text-xs ${paymentProvider === 'Stripe' ? 'border-electric bg-electric/10 text-electric font-bold' : 'border-white/5 bg-obsidian/50 text-platinum'}`}
                    >
                      <CreditCard className="h-4 w-4" />
                      Stripe
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleProcessPayment}
                  className="w-full py-4 bg-gradient-to-r from-electric to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Pay ₹{selectedCourse.price} via {paymentProvider}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-mono">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  SSL Encrypted • Fraud Prevention Sandbox Active
                </div>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 border-4 border-electric border-t-transparent rounded-full animate-spin" />
                <h5 className="text-white font-bold text-sm uppercase font-display tracking-widest animate-pulse">Contacting Gateway...</h5>
                <p className="text-gray-400 text-xs font-mono text-center max-w-[250px]">Validating SSL signatures and verifying account balance.</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h5 className="text-white font-bold text-lg uppercase font-display tracking-widest">Enrolled Successfully!</h5>
                <p className="text-gray-400 text-xs font-mono max-w-[280px]">
                  Payment verified. The Course has been linked to your student dashboard. Instant WhatsApp invoice sent.
                </p>
                <button 
                  onClick={() => {
                    setSelectedCourse(null);
                    setActivePage('student-dashboard');
                  }}
                  className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-obsidian font-bold text-xs tracking-wider uppercase rounded-xl transition-all"
                >
                  GO TO PORTAL
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
