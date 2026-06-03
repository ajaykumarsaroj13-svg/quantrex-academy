import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. REMOVE toggle from sidebar
content = re.sub(
    r'<div className="flex justify-between items-center mt-4 p-3 rounded-xl border border-white/10 bg-white/5">\s*<span className="text-xs font-bold text-gray-300">Theme</span>\s*<button.*?</button>\s*</div>',
    '',
    content,
    flags=re.DOTALL
)

# 2. INSERT toggle in the DYNAMIC WORKSPACE PANEL
toggle_ui = """
        {/* Global Dashboard Header */}
        <div className="flex justify-end items-center mb-2">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${theme === 'light' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-[0_4px_15px_rgba(59,130,246,0.4)]' : 'bg-[#1a1a3a] text-white border border-white/20 hover:bg-[#2a2a4a]'}`}
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
"""

# Using explicit string replacement for the workspace opening div
content = content.replace(
    '<div className={`${isFocusMode ? \'lg:col-span-1\' : \'lg:col-span-3\'} space-y-6`}>',
    '<div className={`${isFocusMode ? \'lg:col-span-1\' : \'lg:col-span-3\'} space-y-6`}>\n' + toggle_ui
)

# 3. Clean up sidebar text and panel classes
content = content.replace(
    '<div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">',
    '<div className="themed-panel p-6 rounded-3xl space-y-6">'
)
content = content.replace(
    '<div className="border-t border-white/10 pt-5 space-y-3.5 text-xs font-mono">',
    '<div className="border-t pt-5 space-y-3.5 text-xs font-mono" style={{borderColor: "var(--border-color)"}}>'
)
content = content.replace(
    '<h3 className="text-white font-bold text-lg tracking-wide leading-tight">',
    '<h3 className="themed-text text-lg tracking-wide leading-tight">'
)
content = content.replace(
    '<span className="text-gray-500">Target Exam:</span>',
    '<span className="themed-text-muted">Target Exam:</span>'
)
content = content.replace(
    '<span className="text-white text-right max-w-[130px] truncate">',
    '<span className="themed-text text-right max-w-[130px] truncate">'
)
content = content.replace(
    '<span className="text-gray-500">Batch Code:</span>',
    '<span className="themed-text-muted">Batch Code:</span>'
)
content = content.replace(
    '<span className="text-gray-500">Attendance:</span>',
    '<span className="themed-text-muted">Attendance:</span>'
)
content = content.replace(
    '<div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-row lg:flex-col justify-around shadow-lg">',
    '<div className="themed-panel rounded-3xl overflow-hidden flex flex-row lg:flex-col justify-around">'
)

content = content.replace(
    "className={`w-full py-4 px-5 text-xs font-bold tracking-wider uppercase text-left transition-all duration-300 flex items-center gap-3 relative overflow-hidden group ${isActive ? 'text-electric bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}",
    "className={`w-full py-4 px-5 text-xs font-black tracking-widest uppercase text-left transition-all duration-300 flex items-center gap-3 relative overflow-hidden group ${isActive ? 'themed-btn-active' : 'themed-btn themed-text-muted hover:!opacity-100'}`}"
)

# 4. Update the CSS for even more aggressive overrides
new_css = """
    .study-portal-wrapper {
      transition: background-color 0.3s, color 0.3s;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }
    
    .theme-dark {
      --bg-root: #0a0a1a;
      --bg-panel: #111122;
      --bg-card: #171730;
      --bg-card-hover: #1e1e40;
      --border-color: rgba(255, 255, 255, 0.12);
      --border-hover: rgba(139, 92, 246, 0.7);
      --text-main: #ffffff;
      --text-muted: #94a3b8;
      --btn-bg: rgba(255, 255, 255, 0.05);
      --btn-hover: rgba(255, 255, 255, 0.1);
      --btn-active: linear-gradient(135deg, #6366f1, #8b5cf6);
      --glow: 0 0 25px rgba(139, 92, 246, 0.4);
    }
    
    .theme-light {
      --bg-root: #f8fafc;
      --bg-panel: #ffffff;
      --bg-card: #f1f5f9;
      --bg-card-hover: #e2e8f0;
      --border-color: #cbd5e1;
      --border-hover: #3b82f6;
      --text-main: #020617;
      --text-muted: #475569;
      --btn-bg: #e2e8f0;
      --btn-hover: #cbd5e1;
      --btn-active: linear-gradient(135deg, #2563eb, #4f46e5);
      --glow: 0 6px 20px rgba(59, 130, 246, 0.3);
    }

    /* GLOBAL TEXT FORCING for maximum readability */
    .study-portal-wrapper * {
      color: var(--text-main);
    }
    .study-portal-wrapper .themed-text-muted,
    .study-portal-wrapper .themed-text-muted * {
      color: var(--text-muted) !important;
    }
    
    /* Exceptions for specifically colored text */
    .study-portal-wrapper .text-emerald-400 { color: #34d399 !important; }
    .study-portal-wrapper .text-electric { color: #00b4d8 !important; }
    .study-portal-wrapper .text-gold { color: #d4af37 !important; }
    .study-portal-wrapper .text-red-400 { color: #f87171 !important; }
    
    /* Buttons that are ACTIVE should have white text regardless of theme */
    .study-portal-wrapper .themed-btn-active,
    .study-portal-wrapper .themed-btn-active * {
      color: #ffffff !important;
    }

    .themed-root {
      background: var(--bg-root) !important;
    }
    .themed-panel {
      background: var(--bg-panel) !important;
      border: 1px solid var(--border-color) !important;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08) !important;
    }
    .themed-card {
      background: var(--bg-card) !important;
      border: 1px solid var(--border-color) !important;
    }
    .themed-card:hover {
      background: var(--bg-card-hover) !important;
      border-color: var(--border-hover) !important;
      box-shadow: var(--glow) !important;
    }
    .themed-btn {
      background: var(--btn-bg) !important;
      border: 1px solid var(--border-color) !important;
    }
    .themed-btn:hover {
      background: var(--btn-hover) !important;
    }
    .themed-btn-active {
      background: var(--btn-active) !important;
      border: 1px solid transparent !important;
      box-shadow: var(--glow) !important;
    }
    
    /* VERY BOLD Typography for both themes */
    .study-portal-wrapper h1,
    .study-portal-wrapper h2,
    .study-portal-wrapper h3,
    .study-portal-wrapper h4,
    .themed-text {
      font-weight: 900 !important;
    }
    .study-portal-wrapper p,
    .study-portal-wrapper span,
    .study-portal-wrapper button,
    .themed-text-muted {
      font-weight: 800 !important;
    }
    
    /* Specific bold overrides to keep normal text legible if needed */
    .study-portal-wrapper .font-mono {
      font-weight: 700 !important;
    }
"""

content = re.sub(
    r'\.study-portal-wrapper \{.*?(?=\`\s*;)',
    new_css.strip(),
    content,
    flags=re.DOTALL
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patching complete.")
