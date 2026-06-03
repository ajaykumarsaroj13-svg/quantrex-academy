import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update component signature
content = content.replace(
    "export default function StudentDashboard({ user, courses, setActivePage, setExamTest, syllabus }) {",
    "export default function StudentDashboard({ user, courses, setActivePage, setExamTest, syllabus, isLight, onToggleTheme }) {"
)

# 2. Add isFocusMode & global CSS
css_and_focus = """
  const isFocusMode = selectedVideo || selectedPdf || (activeTab === 'courses' && selectedSyllabusChapterId);

  const globalThemeCSS = `
    /* Restore the preferred focus mode aesthetics */
    .study-portal-wrapper {
      transition: background-color 0.3s, color 0.3s;
    }
    
    /* Make active chapters look beautiful */
    .chapter-active-glow {
       box-shadow: 0 0 20px rgba(0, 180, 216, 0.15);
       border: 1px solid rgba(0, 180, 216, 0.4) !important;
    }
  `;

  return (
    <>
      <style>{globalThemeCSS}</style>
      <div className={`study-portal-wrapper min-h-screen px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 transition-all duration-300 ${isFocusMode ? 'max-w-[1600px] lg:grid-cols-1' : 'max-w-7xl lg:grid-cols-4'}`}>
"""

content = re.sub(
    r'  return \(\s*<div className="min-h-screen px-4 md:px-12 py-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">',
    css_and_focus,
    content
)

# 3. HIDE sidebar when in focus mode
content = content.replace(
    "{/* 1. SIDEBAR PROFILE PANEL */}",
    "{/* 1. SIDEBAR PROFILE PANEL */}\n        {!isFocusMode && ("
)
content = content.replace(
    "{/* 2. DYNAMIC WORKSPACE PANEL */}",
    ")}\n\n        {/* 2. DYNAMIC WORKSPACE PANEL */}"
)

# 4. Inject Toggle UI inside Workspace at Top Right
toggle_ui = """
        {/* Global Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={onToggleTheme}
            className={`px-5 py-2 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 transition-all shadow-md ${
              isLight 
                ? 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50' 
                : 'bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {isLight ? '~?,? Switch to Dark' : 'dYOT Switch to Light'}
          </button>
        </div>
"""

content = content.replace(
    '<div className="lg:col-span-3 space-y-6">',
    f'<div className={{`${{isFocusMode ? \'lg:col-span-1\' : \'lg:col-span-3\'}} space-y-6`}}>\n{toggle_ui}'
)

# 5. Fix end tags for main container
content = content.replace(
    "  );\n}",
    "    </>\n  );\n}"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restored StudentDashboard layout and global theme props.")
