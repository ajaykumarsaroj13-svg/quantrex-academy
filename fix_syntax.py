import re

# Fix App.jsx
with open("C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/src/App.jsx", 'r', encoding='utf-8') as f:
    app_content = f.read()

# Remove the block:
#            isLight={isLight}
#            onToggleTheme={() => setIsLight(!isLight)}
app_content = re.sub(r'\s*isLight=\{isLight\}\s*onToggleTheme=\{\(\) => setIsLight\(!isLight\)\}', '', app_content, count=1)

with open("C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/src/App.jsx", 'w', encoding='utf-8') as f:
    f.write(app_content)

# Fix StudentDashboard.jsx
with open("C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/src/pages/StudentDashboard.jsx", 'r', encoding='utf-8') as f:
    dashboard_content = f.read()

dashboard_content = dashboard_content.replace('? "Forensic Watermarking', "? 'Forensic Watermarking")

with open("C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/src/pages/StudentDashboard.jsx", 'w', encoding='utf-8') as f:
    f.write(dashboard_content)

print("Done")
