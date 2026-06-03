import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert isFocusMode and styles
style_block = """
  const isFocusMode = selectedVideo || selectedPdf || (activeTab === 'courses' && selectedSyllabusChapterId);

  const globalThemeCSS = `
    .study-portal-wrapper {
      transition: background-color 0.3s, color 0.3s;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }
    
    .theme-dark {
      --bg-root: #0a0a1a;
      --bg-panel: #0d0d2b;
      --bg-card: #0f1535;
      --bg-card-hover: #1e1e40;
      --border-color: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(139, 92, 246, 0.6);
      --text-main: #ffffff;
      --text-muted: #94a3b8;
      --btn-bg: rgba(255, 255, 255, 0.05);
      --btn-hover: rgba(255, 255, 255, 0.1);
      --btn-active: linear-gradient(135deg, #6366f1, #8b5cf6);
      --glow: 0 0 20px rgba(139, 92, 246, 0.35);
    }
    
    .theme-light {
      --bg-root: #ffffff;
      --bg-panel: #f1f5f9;
      --bg-card: #ffffff;
      --bg-card-hover: #f8fafc;
      --border-color: #cbd5e1;
      --border-hover: #3b82f6;
      --text-main: #000000;
      --text-muted: #334155;
      --btn-bg: #e2e8f0;
      --btn-hover: #cbd5e1;
      --btn-active: linear-gradient(135deg, #3b82f6, #4f46e5);
      --glow: 0 4px 15px rgba(59, 130, 246, 0.25);
    }

    .themed-root {
      background: var(--bg-root) !important;
      color: var(--text-main) !important;
    }
    .themed-panel {
      background: var(--bg-panel) !important;
      border-color: var(--border-color) !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
    }
    .themed-card {
      background: var(--bg-card) !important;
      border-color: var(--border-color) !important;
    }
    .themed-card:hover {
      background: var(--bg-card-hover) !important;
      border-color: var(--border-hover) !important;
      box-shadow: var(--glow) !important;
    }
    .themed-btn {
      background: var(--btn-bg) !important;
      border-color: var(--border-color) !important;
      color: var(--text-main) !important;
    }
    .themed-btn:hover {
      background: var(--btn-hover) !important;
    }
    .themed-btn-active {
      background: var(--btn-active) !important;
      border-color: transparent !important;
      color: #ffffff !important;
      box-shadow: var(--glow) !important;
    }
    
    .themed-text {
      color: var(--text-main) !important;
      font-weight: 900 !important;
    }
    .themed-text-muted {
      color: var(--text-muted) !important;
      font-weight: 800 !important;
    }
  `;

  return (
"""
content = content.replace("  return (\n", style_block)

# 2. Update the main container and isFocusMode
content = content.replace(
    '<div className="min-h-screen px-4 md:px-12 py-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">',
    '<style>{globalThemeCSS}</style>\n    <div className={`study-portal-wrapper ${theme === \'light\' ? \'theme-light\' : \'theme-dark\'} px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 transition-all duration-500 ${isFocusMode ? \'max-w-[1600px] lg:grid-cols-1\' : \'max-w-7xl lg:grid-cols-4\'} themed-root`}>'
)

# 3. Hide Sidebar in focus mode
content = content.replace(
    '{/* 1. SIDEBAR PROFILE PANEL */}\n      <div className="lg:col-span-1 space-y-6">',
    '{/* 1. SIDEBAR PROFILE PANEL */}\n      {!isFocusMode && (\n      <div className="lg:col-span-1 space-y-6">'
)

content = content.replace(
    '        </div>\n      </div>\n\n      {/* 2. DYNAMIC WORKSPACE PANEL */}',
    '        </div>\n      </div>\n      )}\n\n      {/* 2. DYNAMIC WORKSPACE PANEL */}'
)

content = content.replace(
    '<div className="lg:col-span-3 space-y-6">',
    '<div className={`${isFocusMode ? \'lg:col-span-1\' : \'lg:col-span-3\'} space-y-6`}>'
)

# 4. Add theme toggle switch in profile panel
toggle_html = """
          <div className="flex justify-between items-center mt-4 p-3 rounded-xl border border-white/10 bg-white/5">
            <span className="text-xs font-bold text-gray-300">Theme</span>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white border border-white/20'}`}
            >
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
"""
content = content.replace('</div>\n\n        {/* Dynamic Nav Menu */}', toggle_html + '\n        {/* Dynamic Nav Menu */}')

# 5. Clean up hardcoded wood colors in the Study Portal area
content = content.replace(
    '<div className="p-8 rounded-2xl border border-[#451a03]/40 min-h-[60vh] space-y-6 bg-gradient-to-br from-[#1c1917] via-black to-[#292524] shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">',
    '<div className="themed-panel p-8 rounded-3xl min-h-[60vh] space-y-6 relative overflow-hidden border-2">'
)
content = content.replace(
    '<span className="text-xl text-gray-200 uppercase tracking-widest block font-black border-b border-[#451a03]/50 pb-3">',
    '<span className="themed-text text-xl uppercase tracking-widest block border-b pb-3" style={{borderColor: "var(--border-color)"}}>'
)
content = content.replace(
    '<div className="flex flex-wrap gap-3 p-2 bg-black/60 border border-[#78350f]/30 rounded-2xl backdrop-blur-md">',
    '<div className="flex flex-wrap gap-3 p-2 rounded-2xl themed-card">'
)

content = content.replace(
    """className={`px-8 py-4 rounded-xl text-sm font-black uppercase transition-all duration-300 flex items-center gap-3 ${
                            selectedSyllabusClass === grade.id 
                              ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-[0_0_25px_rgba(180,83,9,0.5)] border border-[#d4af37]/30 scale-[1.02]' 
                              : 'text-gray-300 hover:text-white hover:bg-[#3e2723]/60 border border-transparent'
                          }`}""",
    """className={`px-8 py-4 rounded-xl text-sm uppercase transition-all duration-300 flex items-center gap-3 ${
                            selectedSyllabusClass === grade.id 
                              ? 'themed-btn-active scale-[1.02] font-black' 
                              : 'themed-btn font-bold'
                          }`}"""
)

content = content.replace(
    '<span className="text-sm text-gray-300 uppercase tracking-widest block font-bold">',
    '<span className="themed-text text-sm uppercase tracking-widest block">'
)

content = content.replace(
    """className={`px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all duration-300 ${
                            selectedSyllabusSubject === subj.id 
                              ? 'bg-[#451a03]/80 text-[#facc15] border border-[#d4af37]/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                              : 'bg-black/40 border border-[#451a03]/30 text-gray-400 hover:text-white hover:bg-[#3e2723]/40'
                          }`}""",
    """className={`px-8 py-3.5 rounded-xl text-sm uppercase tracking-wide transition-all duration-300 ${
                            selectedSyllabusSubject === subj.id 
                              ? 'themed-btn-active font-black' 
                              : 'themed-btn font-bold'
                          }`}"""
)

content = content.replace(
    '<span className="text-base text-gray-300 uppercase tracking-widest block font-black mb-4 border-b border-[#451a03]/30 pb-2">',
    '<span className="themed-text text-base uppercase tracking-widest block mb-4 border-b pb-2" style={{borderColor: "var(--border-color)"}}>'
)

content = content.replace(
    '<p className="text-sm text-gray-500 italic p-10 text-center bg-black/40 rounded-3xl border border-[#451a03]/30">',
    '<p className="themed-text-muted italic p-10 text-center rounded-3xl themed-card border">'
)

content = content.replace(
    'className="w-full p-8 rounded-3xl text-left transition-all duration-300 block bg-gradient-to-br from-[#1c1917] to-black border-2 border-[#451a03]/40 hover:border-[#d4af37]/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:-translate-y-1 group"',
    'className="w-full p-8 rounded-3xl text-left transition-all duration-300 block themed-card border-2 hover:-translate-y-1 group"'
)

content = content.replace(
    '<h4 className="text-white text-xl font-black tracking-wide leading-snug group-hover:text-[#facc15] transition-colors">',
    '<h4 className="themed-text text-xl tracking-wide leading-snug transition-colors group-hover:opacity-80">'
)

content = content.replace(
    '<p className="text-xs text-[#d4af37] mt-5 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">',
    '<p className="themed-text-muted mt-5 uppercase tracking-widest flex items-center gap-2 transition-colors text-xs">'
)

content = content.replace(
    'className="bg-[#3e2723]/60 hover:bg-[#451a03] text-gray-300 hover:text-[#facc15] px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all duration-300 border border-[#451a03]/50 hover:border-[#d4af37]/40 shadow-lg"',
    'className="themed-btn px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all duration-300 border shadow-md hover:-translate-x-1"'
)

content = content.replace(
    '<h4 className="text-white font-black text-3xl md:text-4xl uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 border-b-2 border-[#451a03]/40 pb-6 mb-8">',
    '<h4 className="themed-text text-3xl md:text-4xl uppercase tracking-widest border-b-2 pb-6 mb-8" style={{borderColor: "var(--border-color)"}}>'
)

content = content.replace(
    '<div className="p-6 bg-[#1c1917]/80 border border-[#451a03]/30 rounded-3xl space-y-4 mb-8 backdrop-blur-md">',
    '<div className="p-6 themed-card rounded-3xl space-y-4 mb-8 border backdrop-blur-md">'
)

content = content.replace(
    '<span className="text-sm text-[#d4af37] uppercase font-black tracking-widest block">',
    '<span className="themed-text-muted text-sm uppercase tracking-widest block">'
)

content = content.replace(
    '<span key={t.id} className="text-sm text-gray-300 font-bold bg-black/60 px-4 py-2 rounded-xl border border-[#451a03]/40 shadow-sm">',
    '<span key={t.id} className="themed-btn text-sm px-4 py-2 rounded-xl border shadow-sm">'
)

content = content.replace(
    '<div className="flex bg-black/50 p-2 border border-[#451a03]/30 rounded-2xl justify-between gap-3 overflow-x-auto mb-8 backdrop-blur-lg shadow-inner">',
    '<div className="flex themed-card p-2 border rounded-2xl justify-between gap-3 overflow-x-auto mb-8 shadow-inner">'
)

content = content.replace(
    """className={`flex-1 py-4 px-6 text-sm font-black rounded-xl transition-all duration-300 uppercase whitespace-nowrap tracking-widest ${
                                        chapterTab === subTab.id 
                                          ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-[0_0_20px_rgba(180,83,9,0.4)] border border-[#d4af37]/30 scale-[1.02]' 
                                          : 'text-gray-400 hover:text-white hover:bg-[#3e2723]/60'
                                      }`}""",
    """className={`flex-1 py-4 px-6 text-sm uppercase whitespace-nowrap tracking-widest rounded-xl transition-all duration-300 ${
                                        chapterTab === subTab.id 
                                          ? 'themed-btn-active font-black scale-[1.02]' 
                                          : 'themed-btn font-bold'
                                      }`}"""
)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patching complete.")
