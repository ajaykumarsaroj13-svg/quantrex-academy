import re

with open("C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/src/App.jsx", 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("            isLight={isLight}\n            onToggleTheme={() => setIsLight(!isLight)}", "")

with open("C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/src/App.jsx", 'w', encoding='utf-8') as f:
    f.write(content)
