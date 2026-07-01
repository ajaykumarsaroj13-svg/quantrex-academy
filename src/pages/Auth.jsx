import React, { useState, useEffect } from 'react';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Phone from 'lucide-react/dist/esm/icons/phone';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import Key from 'lucide-react/dist/esm/icons/key';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Target from 'lucide-react/dist/esm/icons/target';
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Layers from 'lucide-react/dist/esm/icons/layers';

export default function Auth({ onLoginSuccess, setActivePage }) {
  const [authMode, setAuthMode] = useState('student-login'); // student-login, student-signup, admin-login
  const [loginMethod, setLoginMethod] = useState('otp'); // otp, password
  
  // Registration Inputs
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [studentClass, setStudentClass] = useState('12th');
  const [targetExam, setTargetExam] = useState('JEE Main');
  
  // OTP Logic
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // Hidden admin trigger counter (click logo/header 5 times to show admin login)
  const [adminClicks, setAdminClicks] = useState(0);

  const handleAdminTrigger = () => {
    setAdminClicks(prev => prev + 1);
    if (adminClicks >= 4) {
      setAuthMode('admin-login');
      setAdminClicks(0);
    }
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number!');
      return;
    }
    setOtpSent(true);
    alert(`DEMO OTP: 7892 has been simulated and sent to +91-${phone}. Enter 7892 to verify.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const redirectTarget = localStorage.getItem('quantrex_redirect_after_login');

    // MOCK SUBMIT (Local sandbox since no backend)
    setTimeout(() => {
      setLoading(false);

      if (authMode === 'admin-login') {
        if (email === 'qauntrexacademy@gmail.com' && password === 'function13@') {
          const adminData = {
            id: 'admin_super',
            name: 'Ajay Kumar Saroj (A.K. Sir)',
            email: 'qauntrexacademy@gmail.com',
            role: 'admin',
            sessions: []
          };
          onLoginSuccess('super_admin_token', adminData);
          setActivePage('admin-dashboard');
          return;
        } else {
          alert("Invalid Admin Credentials");
          return;
        }
      }

      if (authMode === 'student-signup') {
        if (!name || !fatherName || !phone || !email || !password) {
          alert("Please fill all required fields.");
          return;
        }
        const mockUser = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          name: name,
          fatherName: fatherName,
          email: email,
          phone: phone,
          class: studentClass,
          targetExam: targetExam,
          role: 'student',
          purchasedCourses: [],
          hasPurchasedUltimate: false,
          dailyStreak: 1,
          attendance: 100,
          sessions: [{ sessionId: 'sess_mock', ipAddress: '127.0.0.1' }]
        };
        onLoginSuccess('mock_jwt_token', mockUser);
        
        if (redirectTarget) {
          localStorage.removeItem('quantrex_redirect_after_login');
          setActivePage(redirectTarget);
        } else {
          setActivePage('student-dashboard');
        }
      } else if (authMode === 'student-login') {
        if (loginMethod === 'otp' && otp !== '7892') {
          alert('Invalid OTP. Please enter 7892 for demo.');
          return;
        }
        
        const emailCheck = email || 'student@quantrex.com';
        const mockUser = {
          id: 'student_1',
          name: 'Premium Student',
          email: emailCheck,
          phone: phone || '9876543210',
          role: 'student',
          purchasedCourses: [],
          hasPurchasedUltimate: localStorage.getItem('quantrex_ultimate_purchased') === 'true',
          dailyStreak: 12,
          attendance: 98,
          sessions: [{ sessionId: 'sess_1', ipAddress: '192.168.1.1' }]
        };
        onLoginSuccess('mock_jwt_token', mockUser);

        if (redirectTarget) {
          localStorage.removeItem('quantrex_redirect_after_login');
          setActivePage(redirectTarget);
        } else {
          setActivePage('student-dashboard');
        }
      }
    }, 1500);
  };

  // ----------------------------------------
  // RENDER ADMIN LOGIN
  // ----------------------------------------
  if (authMode === 'admin-login') {
    return (
      <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-cyberdark border border-white/5 rounded-2xl shadow-2xl overflow-hidden glass-panel">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display text-glow-gold flex items-center justify-center gap-2">
                <Key className="h-5 w-5 text-gold" /> Secured Admin Gateway
              </h3>
              <p className="text-[10px] text-gray-500 font-mono">
                Quantrex Academy — Ajay Kumar Saroj
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Email ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@quantrex.com" className="w-full pl-10 pr-4 py-3 bg-obsidian/75 border border-white/5 focus:border-gold/40 text-sm rounded-lg focus:outline-none transition-all text-white placeholder-gray-600 font-mono" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-obsidian/75 border border-white/5 focus:border-gold/40 text-sm rounded-lg focus:outline-none transition-all text-white placeholder-gray-600" />
                </div>
              </div>
            </div>
            <button type="submit" className="w-full py-4 text-xs font-bold tracking-widest uppercase rounded-lg shadow-lg bg-gradient-to-r from-gold to-yellow-600 text-obsidian hover:shadow-yellow-500/20 transition-all">
              {loading ? 'Authenticating Secure...' : 'CONFIRM ACCESS'}
            </button>
            <button type="button" onClick={() => setAuthMode('student-login')} className="w-full text-center text-xs text-gray-500 hover:text-white mt-4">
              Return to Student Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // RENDER STUDENT AUTH
  // ----------------------------------------
  return (
    <div className="relative z-10 min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[900px] flex rounded-2xl overflow-hidden shadow-2xl shadow-gold/10 glass-panel border border-gold/20">
        
        {/* Left Side: Branding Banner */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-b from-obsidian via-cyberdark to-obsidian p-8 flex-col justify-between border-r border-gold/10 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none"></div>

          <div onClick={handleAdminTrigger} className="cursor-pointer">
            <h2 className="text-3xl font-black font-logo text-white tracking-wide uppercase leading-tight mb-2">
              Quantrex<br/><span className="text-gold">Academy</span>
            </h2>
            <p className="text-sm font-mono text-gray-400">Where Ambition Meets Excellence.</p>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
            <span className="text-[9px] uppercase font-black tracking-widest text-gold/80 block border-b border-gold/10 pb-1.5 mb-2">Portal Access Includes:</span>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Target className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                  JEE Main Test Series
                  <span className="text-[8px] bg-blue-500/20 text-blue-400 font-extrabold px-1.5 py-0.5 rounded uppercase">Full Syllabus</span>
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Topic-wise practice, mock exams, and instant grading.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Trophy className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                  JEE Advanced Mock Tests
                  <span className="text-[8px] bg-amber-500/20 text-amber-400 font-extrabold px-1.5 py-0.5 rounded uppercase">Advanced</span>
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Vibrant MCQs (multi-correct) and numerical type tests.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                  NDA (Maths & GAT) Mock
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded uppercase">Defense</span>
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Exam-oriented GAT papers & specialized math series.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                <BookOpen className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                  Boards & Foundation
                  <span className="text-[8px] bg-purple-500/20 text-purple-400 font-extrabold px-1.5 py-0.5 rounded uppercase">11th / 12th</span>
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Board pattern mock tests and chapter-wise references.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <Layers className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                  Handbooks & Solutions
                  <span className="text-[8px] bg-cyan-500/20 text-cyan-400 font-extrabold px-1.5 py-0.5 rounded uppercase">PDFs & Formulas</span>
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Complete formula books, study modules & detailed solutions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20">
                <ShieldCheck className="h-4 w-4 text-pink-400" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold">AI Dashboard & Analytics</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Real-time stats tracking, average accuracy, and mistake analysis.</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-mono">
            © 2026 Quantrex Academy. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 bg-obsidian/90 p-8 md:p-12 relative">
          
          {/* Tabs */}
          <div className="flex space-x-1 p-1 bg-cyberdark border border-white/5 rounded-xl mb-8 relative z-10">
            <button
              type="button"
              onClick={() => setAuthMode('student-login')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${authMode === 'student-login' ? 'bg-gold text-obsidian shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('student-signup')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${authMode === 'student-signup' ? 'bg-gold text-obsidian shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 relative z-10">
            {authMode === 'student-login' ? 'Welcome Back!' : 'Start Your Journey'}
          </h3>
          <p className="text-xs text-gray-400 mb-8 font-mono relative z-10">
            {authMode === 'student-login' 
              ? 'Enter your credentials to access the premium portal.' 
              : 'Create an account to unlock the Ultimate Series and more.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            
            {/* ---------------- REGISTRATION FIELDS ---------------- */}
            {authMode === 'student-signup' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Full Name</label>
                  <div className="relative">
                    <UserCheck className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Father's Name</label>
                  <div className="relative">
                    <UserCheck className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                    <input type="text" required value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="Father's Full Name" className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Email ID</label>
                    <div className="relative">
                      <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Class</label>
                    <div className="relative">
                      <GraduationCap className="absolute top-3 left-3 h-4 w-4 text-gray-500 z-10" />
                      <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none appearance-none relative z-0">
                        <option value="11th" className="bg-obsidian">Class 11th</option>
                        <option value="12th" className="bg-obsidian">Class 12th</option>
                        <option value="Dropper" className="bg-obsidian">Dropper</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Target Exam</label>
                    <div className="relative">
                      <Target className="absolute top-3 left-3 h-4 w-4 text-gray-500 z-10" />
                      <select value={targetExam} onChange={(e) => setTargetExam(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none appearance-none relative z-0">
                        <option value="JEE Main" className="bg-obsidian">JEE Main</option>
                        <option value="JEE Advanced" className="bg-obsidian">JEE Advanced</option>
                        <option value="NDA" className="bg-obsidian">NDA</option>
                        <option value="BITSAT" className="bg-obsidian">BITSAT</option>
                        <option value="CUET" className="bg-obsidian">CUET</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Password</label>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none" />
                  </div>
                </div>
              </>
            )}

            {/* ---------------- LOGIN FIELDS ---------------- */}
            {authMode === 'student-login' && (
              <>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={loginMethod === 'otp'} onChange={() => setLoginMethod('otp')} className="text-gold bg-cyberdark border-white/10 focus:ring-gold focus:ring-1" />
                    <span className="text-sm text-gray-300">Login via OTP</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={loginMethod === 'password'} onChange={() => setLoginMethod('password')} className="text-gold bg-cyberdark border-white/10 focus:ring-gold focus:ring-1" />
                    <span className="text-sm text-gray-300">Email & Password</span>
                  </label>
                </div>

                {loginMethod === 'otp' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Phone className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                          <input type="tel" required disabled={otpSent} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none disabled:opacity-50" />
                        </div>
                        {!otpSent && (
                          <button type="button" onClick={handleSendOtp} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-colors whitespace-nowrap">
                            Get OTP
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {otpSent && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[10px] font-bold text-gold uppercase font-mono">Enter OTP</label>
                        <div className="relative">
                          <ShieldCheck className="absolute top-3 left-3 h-4 w-4 text-gold/60" />
                          <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 4-digit code" className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-gold/30 focus:border-gold text-sm rounded-lg text-white transition-colors outline-none" />
                        </div>
                        <div className="text-[10px] text-gray-500 text-right mt-1">
                          <button type="button" onClick={() => setOtpSent(false)} className="hover:text-gold transition-colors">Change Number?</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Email ID</label>
                      <div className="relative">
                        <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Password</label>
                        <span className="text-[10px] text-gold cursor-pointer hover:underline">Forgot?</span>
                      </div>
                      <div className="relative">
                        <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-cyberdark/50 border border-white/10 focus:border-gold/50 text-sm rounded-lg text-white transition-colors outline-none" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-sm font-bold tracking-widest uppercase rounded-xl shadow-lg shadow-gold/20 bg-gradient-to-r from-gold via-yellow-400 to-yellow-600 text-obsidian hover:shadow-yellow-500/40 hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-obsidian border-t-transparent animate-spin"></div>
              ) : (
                <>
                  {authMode === 'student-login' ? 'Access Premium Portal' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
