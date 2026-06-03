import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\pages\TestSeriesPage.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Props
content = content.replace(
    "export default function TestSeriesPage({ user, onStartTest, onBack }) {",
    "export default function TestSeriesPage({ user, onStartTest, onBack, isLight, onToggleTheme }) {"
)

# 2. Update GLOBAL_CSS colors to use CSS variables
# TestSeriesPage uses dark backgrounds natively. We'll use CSS variables if defined.
# If not defined globally, we will inject standard ones in the TSP style.
css_replacements = {
    "background: #0a0a1a;": "background: var(--bg-primary, #0a0a1a);",
    "color: #e2e8f0;": "color: var(--text-primary, #e2e8f0);",
    "background: linear-gradient(135deg, #0d0d2b 0%, #0f1535 40%, #0a0a1a 100%);": "background: var(--glass-bg, linear-gradient(135deg, #0d0d2b 0%, #0f1535 40%, #0a0a1a 100%));",
    "background: #0d0d22;": "background: var(--scrollbar-track, #0d0d22);",
    "color: #94a3b8;": "color: var(--text-secondary, #94a3b8);",
    "color: #ffffff;": "color: var(--text-primary, #ffffff);",
    "background: rgba(255,255,255,0.03);": "background: var(--bg-cyberdark, rgba(255,255,255,0.03));",
}

for old, new in css_replacements.items():
    content = content.replace(old, new)

# 3. Add Theme Toggle button in Header
# Find the header-inner flex container
toggle_button = """
        {/* Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className={`relative h-8 w-14 rounded-full border flex items-center transition-all duration-300 ml-4 ${
            isLight
              ? 'bg-blue-50 border-blue-200 justify-end'
              : 'bg-white/5 border-white/10 justify-start'
          }`}
        >
          <span className={`absolute inset-y-0.5 w-6 rounded-full transition-all duration-300 flex items-center justify-center text-xs shadow-sm ${
            isLight
              ? 'right-0.5 bg-amber-400 text-white'
              : 'left-0.5 bg-electric/80 text-obsidian'
          }`}>
            {isLight ? 'L' : 'D'}
          </span>
        </button>
      </div>
"""

content = content.replace(
    '</button>\n      </div>',
    '</button>' + toggle_button
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated TestSeriesPage.jsx successfully.")
