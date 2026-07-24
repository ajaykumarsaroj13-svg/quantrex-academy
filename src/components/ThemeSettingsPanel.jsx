import React, { useState } from 'react';
import { Settings, X, Moon, Sun, Monitor, Type, Zap, Paintbrush } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeSettingsPanel({ isOpen, onClose }) {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    borderRadius, setBorderRadius,
    animationSpeed, setAnimationSpeed,
    accentColor, setAccentColor
  } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[90%] sm:w-[400px] bg-white dark:bg-[#1E293B] shadow-2xl z-[10000] border-l border-slate-200 dark:border-white/10 overflow-y-auto"
          >
            <div className="p-6 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-slate-900 dark:text-white" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Mode */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Appearance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', icon: Sun, label: 'Light' },
                    { id: 'dark', icon: Moon, label: 'Dark' },
                    { id: 'system', icon: Monitor, label: 'Auto' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        theme === t.id
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-bg)] text-[var(--accent-primary)]'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <t.icon className="w-5 h-5 mb-2" />
                      <span className="text-xs font-semibold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Paintbrush className="w-4 h-4" /> Accent Color
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'blue', color: 'bg-blue-500', ring: 'ring-blue-500' },
                    { id: 'gold', color: 'bg-amber-500', ring: 'ring-amber-500' },
                    { id: 'emerald', color: 'bg-emerald-500', ring: 'ring-emerald-500' },
                    { id: 'purple', color: 'bg-purple-500', ring: 'ring-purple-500' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setAccentColor(c.id)}
                      className={`w-8 h-8 rounded-full ${c.color} transition-all transform hover:scale-110 ${
                        accentColor === c.id ? `ring-2 ring-offset-2 dark:ring-offset-[#1E293B] ${c.ring}` : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Type className="w-4 h-4" /> Font Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['small', 'normal', 'large', 'xl'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`p-2 rounded-lg text-xs font-bold capitalize border transition-all ${
                        fontSize === size
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-bg)] text-[var(--accent-primary)]'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Type className="w-4 h-4" /> Border Radius
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['compact', 'default', 'comfortable'].map((radius) => (
                    <button
                      key={radius}
                      onClick={() => setBorderRadius(radius)}
                      className={`p-2 rounded-lg text-xs font-bold capitalize border transition-all ${
                        borderRadius === radius
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-bg)] text-[var(--accent-primary)]'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {radius}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Speed */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Animations
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['off', 'normal', 'reduced'].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setAnimationSpeed(speed)}
                      className={`p-2 rounded-lg text-xs font-bold capitalize border transition-all ${
                        animationSpeed === speed
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-bg)] text-[var(--accent-primary)]'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
