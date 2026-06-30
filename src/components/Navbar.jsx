import React from 'react';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Moon from 'lucide-react/dist/esm/icons/moon';
import Sun from 'lucide-react/dist/esm/icons/sun';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Target from 'lucide-react/dist/esm/icons/target';
import logoImg from '../assets/logo.png';

export default function Navbar({ activePage, setActivePage, user, onLogout, customLogo, theme, onToggleTheme, themeColor, onColorChange }) {
  const isLight = theme === 'light';

  return (
    <nav className={`sticky top-0 z-50 w-full backdrop-blur-md border-b py-3.5 px-6 md:px-12 flex items-center justify-between transition-all duration-300 ${
      isLight
        ? 'bg-white/90 border-black/8 shadow-sm'
        : 'bg-obsidian/85 border-white/5'
    }`}>

      {/* ── Brand Logo ── */}
      <div
        onClick={() => setActivePage('home')}
        className="flex items-center gap-2.5 cursor-pointer group"
        id="nav-logo"
      >
        <div className={`relative h-9 w-9 rounded-xl overflow-hidden border shadow-md bg-gradient-to-br from-electric/20 to-blue-600/20 flex items-center justify-center ${
          isLight ? 'border-blue-200' : 'border-electric/30'
        }`}>
          <img src={customLogo || logoImg} alt="Quantrex Logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <span className={`font-logo font-black text-lg md:text-xl tracking-wide uppercase bg-gradient-to-r ${
            isLight
              ? 'from-blue-700 via-blue-500 to-amber-500'
              : 'from-white via-electric to-gold'
          } bg-clip-text text-transparent leading-none`}>
            Quantrex
          </span>
          <span className={`block text-[9px] tracking-[0.18em] font-bold uppercase -mt-0.5 font-logo ${
            isLight ? 'text-amber-600' : 'text-gold'
          }`}>
            Academy
          </span>
        </div>
      </div>

      {/* ── Desktop Nav Links ── */}
      <div className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide">
        <button
          onClick={() => setActivePage('home')}
          className={`uppercase transition-all duration-200 hover:scale-105 ${
            activePage === 'home'
              ? (isLight ? 'text-blue-600' : 'text-electric')
              : (isLight ? 'text-gray-600 hover:text-blue-600' : 'text-platinum hover:text-white')
          }`}
        >
          Home
        </button>

        <button
          onClick={() => setActivePage('student-dashboard')}
          className={`uppercase transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
            activePage === 'student-dashboard'
              ? (isLight ? 'text-blue-600' : 'text-electric')
              : (isLight ? 'text-gray-600 hover:text-blue-600' : 'text-platinum hover:text-white')
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Study Portal
        </button>

        <button
          onClick={() => setActivePage('test-series')}
          className={`uppercase transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
            activePage === 'test-series'
              ? (isLight ? 'text-blue-600' : 'text-electric')
              : (isLight ? 'text-gray-600 hover:text-blue-600' : 'text-platinum hover:text-white')
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          Official Paper
        </button>

        <button
          onClick={() => setActivePage('ultimate-test-series')}
          className={`uppercase transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
            activePage === 'ultimate-test-series'
              ? (isLight ? 'text-blue-600' : 'text-electric')
              : (isLight ? 'text-gray-600 hover:text-blue-600' : 'text-platinum hover:text-white')
          }`}
        >
          <Target className="h-3.5 w-3.5 text-blue-400" />
          Ultimate Series
        </button>

        <button
          onClick={() => setActivePage('books')}
          className={`uppercase transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
            activePage === 'books'
              ? (isLight ? 'text-blue-600' : 'text-electric')
              : (isLight ? 'text-gray-600 hover:text-blue-600' : 'text-platinum hover:text-white')
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 text-gold" />
          Books
        </button>


        {user && user.role === 'admin' && (
          <button
            onClick={() => setActivePage('admin-dashboard')}
            className={`uppercase transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
              activePage === 'admin-dashboard'
                ? (isLight ? 'text-amber-600' : 'text-gold')
                : (isLight ? 'text-gray-600 hover:text-amber-600' : 'text-platinum hover:text-gold')
            }`}
          >
            🔑 Admin Panel
          </button>
        )}
      </div>

      {/* ── Right Side Actions ── */}
      <div className="flex items-center gap-3">

        {/* ── Theme Toggle ── */}
        <button
          onClick={onToggleTheme}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className={`theme-toggle-btn relative h-9 w-16 rounded-full border flex items-center transition-all duration-300 ${
            isLight
              ? 'bg-slate-200 border-slate-300 justify-end shadow-inner'
              : 'bg-slate-800 border-slate-600 justify-start shadow-inner'
          }`}
        >
          <span className={`absolute inset-y-0.5 w-7 rounded-full transition-all duration-300 flex items-center justify-center text-xs shadow-md ${
            isLight
              ? 'right-0.5 bg-white text-amber-500'
              : 'left-0.5 bg-obsidian text-blue-400 border border-slate-600'
          }`}>
            {isLight ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </span>
        </button>



        {/* ── User / Login ── */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              isLight
                ? 'bg-blue-50 border-blue-100 text-blue-700'
                : 'bg-white/5 border-white/10 text-platinum'
            }`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isLight ? 'bg-blue-100 text-blue-700' : 'bg-electric/20 text-electric'
              }`}>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[110px] truncate">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className={`p-2 rounded-lg border transition-all ${
                isLight
                  ? 'border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200'
                  : 'border-transparent text-gray-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
              }`}
              title="Logout"
              id="logout-btn"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActivePage('login')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase border transition-all hover:scale-105 ${
              isLight
                ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                : 'border-white/10 text-platinum hover:border-gold/30 hover:text-gold'
            }`}
            id="login-redirect-btn"
          >
            🔑 Admin Login
          </button>
        )}
      </div>
    </nav>
  );
}

