import React, { useState } from 'react';
import { ShieldAlert, Mail, Lock, Phone, UserCheck, Key, ShieldCheck } from 'lucide-react';

export default function Auth({ onLoginSuccess, setActivePage }) {
  const [authMode, setAuthMode] = useState('admin-login'); // admin-login only
  const [loginMethod, setLoginMethod] = useState('password'); // password, otp
  
  // Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [twoFactor, setTwoFactor] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (!phone) {
      alert('Please enter your mobile number first!');
      return;
    }
    setOtpSent(true);
    alert(`OTP: 7892 has been simulated and sent to +91-${phone}. Enter 7892 to verify.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      email,
      phone,
      password,
      otp: loginMethod === 'otp' ? otp : null,
      fingerprint: 'device_fingerprint_' + Math.random().toString(36).substr(2, 9)
    };

    // If signing up, hit register
    const isSignup = authMode === 'student-signup';
    const isAdmin = authMode === 'admin-login';
    let url = '/api/auth/login';

    if (isSignup) {
      url = '/api/auth/register';
      payload.name = name;
      payload.role = 'student';
    }

    if (isAdmin) {
      payload.email = email || 'admin@quantrex.com';
      payload.password = password || 'admin123';
      payload.role = 'admin';
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data.token, data.user);
        if (data.user.role === 'admin') {
          setActivePage('admin-dashboard');
        } else {
          setActivePage('student-dashboard');
        }
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Authentication failed');
      }
    } catch (err) {
      // Mock Fallback offline verification for quick demo
      console.log('API offline, performing client-side sandbox validation');
      setTimeout(() => {
        setLoading(false);
        if (isSignup) {
          const mockUser = {
            id: 'usr_mock_' + Math.random().toString(36).substr(2, 9),
            name: name || 'Student Aspirant',
            email: email || 'student@quantrex.com',
            phone: phone || '9876543210',
            role: 'student',
            purchasedCourses: [],
            dailyStreak: 3,
            attendance: 97,
            sessions: [{ sessionId: 'sess_mock', ipAddress: '127.0.0.1' }]
          };
          onLoginSuccess('mock_jwt_token', mockUser);
          setActivePage('student-dashboard');
        } else if (isAdmin) {
          if (twoFactor !== '1234') {
            alert('2-Factor Code is invalid! Enter default 1234 for sandbox.');
            return;
          }
          const mockAdmin = {
            id: 'admin_mock',
            name: 'Ajay Kumar Saroj (A.K. Sir)',
            email: email || 'admin@quantrex.com',
            role: 'admin',
            sessions: []
          };
          onLoginSuccess('mock_admin_jwt', mockAdmin);
          setActivePage('admin-dashboard');
        } else {
          // login student
          const emailCheck = email || 'student@quantrex.com';
          const mockUser = {
            id: 'student1',
            name: 'Rohan Sharma',
            email: emailCheck,
            phone: phone || '9876543210',
            role: 'student',
            purchasedCourses: ['course1'],
            dailyStreak: 12,
            attendance: 98,
            sessions: [{ sessionId: 'sess_1', ipAddress: '192.168.1.1' }]
          };
          onLoginSuccess('mock_jwt_token', mockUser);
          setActivePage('student-dashboard');
        }
      }, 1000);
    }
  };

  return (
    <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-cyberdark border border-white/5 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display text-glow-gold flex items-center justify-center gap-2">
              <Key className="h-5 w-5 text-gold" /> Secured Admin Gateway
            </h3>
            <p className="text-[10px] text-gray-500 font-mono">
              Quantrex Academy — Ajay Kumar Saroj (A.K. Sir)
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Email ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@quantrex.com"
                  className="w-full pl-10 pr-4 py-3 bg-obsidian/75 border border-white/5 focus:border-gold/40 text-sm rounded-lg focus:outline-none transition-all text-white placeholder-gray-600 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-obsidian/75 border border-white/5 focus:border-gold/40 text-sm rounded-lg focus:outline-none transition-all text-white placeholder-gray-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gold uppercase font-mono">2-Factor Authentication Code</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gold/60">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.value)}
                  placeholder="Sandbox default: 1234"
                  className="w-full pl-10 pr-4 py-3 bg-obsidian/75 border border-gold/20 focus:border-gold/50 text-sm rounded-lg focus:outline-none transition-all text-white placeholder-gold/30 font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 text-xs font-bold tracking-widest uppercase rounded-lg shadow-lg bg-gradient-to-r from-gold to-yellow-600 text-obsidian hover:shadow-yellow-500/20 transition-all"
          >
            {loading ? 'Authenticating Secure...' : 'CONFIRM ACCESS'}
          </button>
        </form>

        <div className="p-4 bg-obsidian/50 border-t border-white/5 text-center text-[10px] text-gray-500 font-mono flex items-center justify-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-gold animate-pulse" />
          Secured Gateway: Unauthorized operations are monitored.
        </div>
      </div>
    </div>
  );
}
