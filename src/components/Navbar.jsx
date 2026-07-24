import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Sparkles, LogOut, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';
import ThemeSettingsPanel from './ThemeSettingsPanel';
import logoImg from '../assets/logo.png';

export default function Navbar({ activePage, setActivePage, user, onLogout }) {
  const { isDark } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'student-dashboard', label: 'Study Portal', icon: BookOpen },
    { id: 'test-series', label: 'Official Paper', icon: Sparkles },
    { id: 'ultimate-test-series', label: 'Ultimate Series', icon: Target },
    { id: 'books', label: 'Books', icon: BookOpen }
  ];

  return (
    <>
      <nav className={`relative z-50 w-full backdrop-blur-xl border-b py-3 px-6 md:px-12 flex items-center justify-between transition-all duration-[var(--transition-normal)] ${
        isDark 
          ? 'bg-[var(--surface-primary)]/80 border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
          : 'bg-white/80 border-slate-200/50 shadow-sm'
      }`}>

        {/* ── Brand Logo ── */}
        <div
          onClick={() => setActivePage('home')}
          className="flex items-center gap-3 cursor-pointer group"
          id="nav-logo"
        >
          <div className={`relative h-10 w-10 rounded-[var(--radius-button)] overflow-hidden border flex items-center justify-center transition-all ${
            isDark 
              ? 'border-white/10 bg-gradient-to-br from-white/5 to-white/0 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
              : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm'
          } group-hover:border-[var(--accent-primary)] group-hover:shadow-[0_0_20px_var(--accent-bg)]`}>
            <img src={logoImg} alt="Quantrex Logo" className="h-[75%] w-[75%] object-contain drop-shadow-md" />
          </div>
          <div>
            <span className={`font-sans font-black text-xl tracking-tight uppercase transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Quantrex
            </span>
            <span className={`block text-[10px] tracking-[0.2em] font-bold uppercase -mt-1 transition-colors ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}>
              Academy
            </span>
          </div>
        </div>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-semibold">
          {navLinks.map(link => {
            const isActive = activePage === link.id;
            const Icon = link.icon;
            
            return (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                className={`relative px-4 py-2 rounded-[var(--radius-button)] flex items-center gap-2 transition-all duration-[var(--transition-fast)] ${
                  isActive
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-bg)]'
                    : isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{link.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-[var(--radius-button)] border border-[var(--accent-primary)]/20 pointer-events-none"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* ── Right Side Actions ── */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2.5 rounded-[var(--radius-button)] transition-all duration-[var(--transition-fast)] ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200'
            }`}
            title="Theme Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-200 dark:border-white/10">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-button)] border text-xs font-semibold ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold bg-[var(--accent-primary)] text-white shadow-sm">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[110px] truncate">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className={`p-2 rounded-[var(--radius-button)] border transition-all ${
                  isDark
                    ? 'border-white/5 text-gray-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
                    : 'border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                }`}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="ml-2 px-5 py-2.5 rounded-[var(--radius-button)] text-sm font-bold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm shadow-[var(--accent-primary)]/20"
            >
              Login
            </button>
          )}
        </div>
      </nav>
      
      <ThemeSettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
