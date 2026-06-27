import re

content = open('src/pages/Home.jsx', 'r', encoding='utf-8').read()

# Remove .slice(3) from the slider map
content = content.replace('{(toppers || []).slice(3).map((t, idx) => (', '{(toppers || []).map((t, idx) => (')

open('src/pages/Home.jsx', 'w', encoding='utf-8').write(content)
