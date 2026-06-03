import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_css = """
  const globalThemeCSS = `
    .study-portal-wrapper {
      transition: background-color 0.4s ease, color 0.4s ease;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }
    
    /* 1. PURE BLACK DARK THEME */
    .theme-dark {
      --bg-root: #000000;
      --bg-panel: #09090b;
      --bg-card: #121217;
      --bg-card-hover: #18181b;
      --border-color: rgba(255, 255, 255, 0.12);
      --border-hover: rgba(0, 225, 255, 0.6);
      --text-main: #ffffff;
      --text-muted: #a1a1aa;
      --btn-bg: rgba(255, 255, 255, 0.05);
      --btn-hover: rgba(255, 255, 255, 0.12);
      --btn-active: linear-gradient(135deg, #2563eb, #8b5cf6);
      --glow: 0 0 25px rgba(0, 225, 255, 0.3);
      --accent-1: #00e1ff;
      --accent-2: #a78bfa;
      --accent-3: #34d399;
      --accent-4: #fb7185;
    }
    
    /* 2. PURE WHITE LIGHT THEME */
    .theme-light {
      --bg-root: #ffffff;
      --bg-panel: #f8fafc;
      --bg-card: #ffffff;
      --bg-card-hover: #f1f5f9;
      --border-color: #cbd5e1;
      --border-hover: #3b82f6;
      --text-main: #000000;
      --text-muted: #334155;
      --btn-bg: #e2e8f0;
      --btn-hover: #cbd5e1;
      --btn-active: linear-gradient(135deg, #1d4ed8, #4338ca);
      --glow: 0 6px 20px rgba(29, 78, 216, 0.25);
      --accent-1: #0284c7;
      --accent-2: #6d28d9;
      --accent-3: #059669;
      --accent-4: #e11d48;
    }

    /* GLOBAL FORCING */
    .study-portal-wrapper, .study-portal-wrapper .themed-root {
      background: var(--bg-root) !important;
      color: var(--text-main) !important;
    }

    /* Override Hardcoded Borders */
    .study-portal-wrapper .border-white\\\\/5,
    .study-portal-wrapper .border-white\\\\/10,
    .study-portal-wrapper .border-white\\\\/20,
    .study-portal-wrapper .border-zinc-800,
    .study-portal-wrapper .border-zinc-700,
    .study-portal-wrapper .border-gray-800 {
      border-color: var(--border-color) !important;
    }

    /* THEME LIGHT OVERRIDES FOR HARDCODED DARK CLASSES */
    .theme-light .text-white,
    .theme-light .text-gray-300,
    .theme-light .text-gray-400,
    .theme-light .text-gray-500,
    .theme-light .text-zinc-400,
    .theme-light .text-zinc-500 {
      color: var(--text-main) !important;
    }
    
    /* Extreme text clarity for headings and labels in light mode */
    .theme-light h1, .theme-light h2, .theme-light h3, .theme-light h4, .theme-light h5, .theme-light span, .theme-light p {
      color: var(--text-main) !important;
      font-weight: 800 !important;
    }
    .theme-dark h1, .theme-dark h2, .theme-dark h3, .theme-dark h4, .theme-dark h5, .theme-dark span, .theme-dark p {
      font-weight: 700 !important;
    }
    
    /* Override specific dark backgrounds */
    .theme-light .bg-black,
    .theme-light .bg-zinc-900,
    .theme-light .bg-zinc-950,
    .theme-light .bg-obsidian,
    .theme-light .bg-black\\\\/50,
    .theme-light .bg-black\\\\/40,
    .theme-light .bg-black\\\\/20,
    .theme-light .bg-white\\\\/5,
    .theme-light .bg-white\\\\/10,
    .theme-light .glass-panel {
      background-color: var(--bg-panel) !important;
      backdrop-filter: none !important;
    }

    .theme-dark .bg-black,
    .theme-dark .bg-zinc-900,
    .theme-dark .bg-zinc-950,
    .theme-dark .bg-obsidian,
    .theme-dark .bg-black\\\\/50,
    .theme-dark .bg-black\\\\/40,
    .theme-dark .glass-panel {
      background-color: var(--bg-panel) !important;
    }

    /* Exceptions: Buttons and Interactive Elements */
    .study-portal-wrapper .text-emerald-400 { color: var(--accent-3) !important; }
    .study-portal-wrapper .text-electric, .study-portal-wrapper .text-cyan-400 { color: var(--accent-1) !important; }
    .study-portal-wrapper .text-gold { color: #d4af37 !important; }
    
    /* Keep white text on active buttons and specific accents */
    .study-portal-wrapper button.themed-btn-active,
    .study-portal-wrapper button.themed-btn-active *,
    .study-portal-wrapper .bg-electric,
    .study-portal-wrapper .bg-electric *,
    .study-portal-wrapper .bg-blue-600,
    .study-portal-wrapper .bg-blue-600 * {
      color: #ffffff !important;
    }
    
    /* MULTI-COLOR THEMATICS FOR CHAPTERS AND HEADINGS */
    /* Alternate border and text colors for lists of chapters/videos to make it highly attractive */
    .study-portal-wrapper .grid > div:nth-child(4n+1) h4, .study-portal-wrapper .grid > div:nth-child(4n+1) h3 { color: var(--accent-1) !important; }
    .study-portal-wrapper .grid > div:nth-child(4n+2) h4, .study-portal-wrapper .grid > div:nth-child(4n+2) h3 { color: var(--accent-2) !important; }
    .study-portal-wrapper .grid > div:nth-child(4n+3) h4, .study-portal-wrapper .grid > div:nth-child(4n+3) h3 { color: var(--accent-3) !important; }
    .study-portal-wrapper .grid > div:nth-child(4n+4) h4, .study-portal-wrapper .grid > div:nth-child(4n+4) h3 { color: var(--accent-4) !important; }

    .study-portal-wrapper .grid > div:nth-child(4n+1) { border-bottom: 3px solid var(--accent-1) !important; }
    .study-portal-wrapper .grid > div:nth-child(4n+2) { border-bottom: 3px solid var(--accent-2) !important; }
    .study-portal-wrapper .grid > div:nth-child(4n+3) { border-bottom: 3px solid var(--accent-3) !important; }
    .study-portal-wrapper .grid > div:nth-child(4n+4) { border-bottom: 3px solid var(--accent-4) !important; }

    /* Test Cards */
    .study-portal-wrapper .border-t-4.border-blue-500 { border-top-color: var(--accent-1) !important; }
    
    /* Specifically target inner elements */
    .study-portal-wrapper .glass-panel, 
    .study-portal-wrapper .themed-panel {
       box-shadow: 0 4px 10px rgba(0,0,0,0.05);
       transition: all 0.3s ease;
    }
    .study-portal-wrapper .glass-panel:hover, 
    .study-portal-wrapper .themed-panel:hover {
       transform: translateY(-2px);
       box-shadow: var(--glow) !important;
    }
  `;
"""

content = re.sub(
    r'const globalThemeCSS = `.*?`;',
    new_css.strip(),
    content,
    flags=re.DOTALL
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch 3 complete.")
