import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. ADD STATE VARIABLES
if 'const [theme, setTheme] = useState' not in content:
    content = content.replace(
        "const [aiLoading, setAiLoading] = useState(false);",
        "const [aiLoading, setAiLoading] = useState(false);\n  const [theme, setTheme] = useState('dark');"
    )

# 2. DEFINE FOCUS MODE AND CSS
css_and_focus = """
  const isFocusMode = selectedVideo || selectedPdf || (activeTab === 'courses' && selectedSyllabusChapterId);

  const globalThemeCSS = `
    .study-portal-wrapper {
      transition: background-color 0.2s, color 0.2s;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }
    
    /* CLEAN DARK THEME (ExamGoal/PW Style) */
    .theme-dark {
      --bg-root: #000000;
      --bg-panel: #111111;
      --bg-card: #1a1a1a;
      --border-color: #333333;
      --text-main: #ffffff;
      --text-muted: #a1a1aa;
      --accent: #3b82f6;
    }
    
    /* CLEAN LIGHT THEME (ExamGoal/PW Style) */
    .theme-light {
      --bg-root: #f8f9fa;
      --bg-panel: #ffffff;
      --bg-card: #ffffff;
      --border-color: #e5e7eb;
      --text-main: #111827;
      --text-muted: #6b7280;
      --accent: #2563eb;
    }

    /* GLOBAL THEME APPLICATION */
    .themed-root {
      background: var(--bg-root) !important;
      color: var(--text-main) !important;
    }
    
    .study-portal-wrapper * {
      border-color: var(--border-color) !important;
    }

    /* OVERRIDE HARDCODED DARK CLASSES FOR LIGHT MODE */
    .theme-light .text-white,
    .theme-light .text-gray-300,
    .theme-light .text-gray-400,
    .theme-light .text-gray-500,
    .theme-light .text-zinc-400,
    .theme-light .text-white\\\\/70 {
      color: var(--text-main) !important;
    }
    
    /* Bold text for maximum readability */
    .theme-light h1, .theme-light h2, .theme-light h3, .theme-light h4, .theme-light h5 {
      font-weight: 800 !important;
      color: #000000 !important;
    }
    .theme-dark h1, .theme-dark h2, .theme-dark h3, .theme-dark h4, .theme-dark h5 {
      font-weight: 700 !important;
      color: #ffffff !important;
    }

    /* Override Backgrounds */
    .theme-light .bg-black,
    .theme-light .bg-zinc-900,
    .theme-light .bg-zinc-950,
    .theme-light .bg-black\\\\/50,
    .theme-light .bg-white\\\\/5,
    .theme-light .glass-panel {
      background-color: var(--bg-panel) !important;
      backdrop-filter: none !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    }

    .theme-dark .bg-black,
    .theme-dark .bg-zinc-900,
    .theme-dark .bg-zinc-950,
    .theme-dark .bg-black\\\\/50,
    .theme-dark .glass-panel {
      background-color: var(--bg-panel) !important;
    }

    /* Preserve Active Button / Accent Colors */
    .study-portal-wrapper .bg-electric,
    .study-portal-wrapper .bg-blue-600 {
      background-color: var(--accent) !important;
      color: #ffffff !important;
      border: none !important;
    }
    .study-portal-wrapper .text-electric,
    .study-portal-wrapper .text-blue-500 {
      color: var(--accent) !important;
    }
    .study-portal-wrapper .bg-electric *,
    .study-portal-wrapper .bg-blue-600 * {
      color: #ffffff !important;
    }
  `;

  return (
    <>
      <style>{globalThemeCSS}</style>
      <div className={`study-portal-wrapper ${theme === 'light' ? 'theme-light' : 'theme-dark'} px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 transition-all duration-300 ${isFocusMode ? 'max-w-[1600px] lg:grid-cols-1' : 'max-w-7xl lg:grid-cols-4'} themed-root`}>
"""

if 'const globalThemeCSS' not in content:
    content = re.sub(
        r'  return \(\s*<div className="min-h-screen px-4 md:px-12 py-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">',
        css_and_focus,
        content
    )

# 3. ADD TOGGLE IN TOP RIGHT OF MAIN PANEL & HIDE SIDEBAR IN FOCUS MODE
content = content.replace(
    "{/* 1. SIDEBAR PROFILE PANEL */}",
    "{/* 1. SIDEBAR PROFILE PANEL */}\n        {!isFocusMode && ("
)
content = content.replace(
    "{/* 2. DYNAMIC WORKSPACE PANEL */}",
    ")}\n\n        {/* 2. DYNAMIC WORKSPACE PANEL */}"
)

# 4. Inject Toggle UI inside Workspace
toggle_ui = """
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 text-sm font-bold rounded-md border flex items-center gap-2 transition-all"
            style={{
               backgroundColor: theme === 'light' ? '#ffffff' : '#222222',
               color: theme === 'light' ? '#000000' : '#ffffff',
               borderColor: theme === 'light' ? '#e5e7eb' : '#444444'
            }}
          >
            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
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

print("Restored clean themes.")
