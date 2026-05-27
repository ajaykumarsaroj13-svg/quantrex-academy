import React from 'react';
import { Shield, Sparkles, Flame, User, LogOut, BookOpen, Layers } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, user, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-obsidian/85 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
      {/* Brand logo */}
      <div 
        onClick={() => setActivePage('home')} 
        className="flex items-center gap-2 cursor-pointer group"
        id="nav-logo"
      >
        <div className="relative p-2 bg-gradient-to-br from-electric to-blue-600 rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <Layers className="h-5 w-5 text-obsidian" />
        </div>
        <div>
          <span className="font-bold text-lg md:text-xl tracking-wider uppercase font-display bg-gradient-to-r from-white via-electric to-gold bg-clip-text text-transparent">
            Quantrex
          </span>
          <span className="block text-[8px] tracking-[0.2em] font-semibold text-gold uppercase -mt-1 font-display">
            Academy
          </span>
        </div>
      </div>

      {/* Navigation options */}
      <div className="hidden md:flex items-center gap-8">
        <button 
          onClick={() => setActivePage('home')}
          className={`text-sm font-semibold tracking-wider transition-colors ${activePage === 'home' ? 'text-electric' : 'text-platinum hover:text-white'}`}
        >
          COURSES
        </button>

        {user && user.role === 'student' && (
          <>
            <button 
              onClick={() => setActivePage('student-dashboard')}
              className={`text-sm font-semibold tracking-wider transition-colors ${activePage === 'student-dashboard' ? 'text-electric' : 'text-platinum hover:text-white'}`}
            >
              STUDENT PORTAL
            </button>
          </>
        )}

        {user && user.role === 'admin' && (
          <button 
            onClick={() => setActivePage('admin-dashboard')}
            className={`text-sm font-semibold tracking-wider transition-colors ${activePage === 'admin-dashboard' ? 'text-gold' : 'text-platinum hover:text-gold'}`}
          >
            ADMIN PANEL
          </button>
        )}
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3 md:gap-5">
            {/* Daily Streak Tracker */}
            {user.role === 'student' && (
              <div 
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full font-mono text-xs font-bold animate-pulse"
                title="Daily Login Streak"
              >
                <Flame className="h-4 w-4 fill-current" />
                <span>{user.dailyStreak || 1} STREAK</span>
              </div>
            )}

            {/* Profile trigger */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-cyberdark border border-white/10 flex items-center justify-center text-xs font-bold text-electric">
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline text-xs font-semibold font-display text-platinum max-w-[120px] truncate">
                {user.name}
              </span>
            </div>

            <button 
              onClick={onLogout}
              className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"
              title="Logout Session"
              id="logout-btn"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActivePage('login')}
              className="px-4 py-2 border border-white/5 hover:border-electric/30 text-platinum hover:text-electric text-xs font-bold tracking-wider rounded-lg transition-all"
              id="login-redirect-btn"
            >
              LOGIN
            </button>
            <button 
              onClick={() => setActivePage('login')}
              className="px-4 py-2 bg-gradient-to-r from-electric to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian text-xs font-bold tracking-wider rounded-lg shadow-md hover:shadow-cyan-500/20 transition-all"
              id="signup-redirect-btn"
            >
              JOIN FREE
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
