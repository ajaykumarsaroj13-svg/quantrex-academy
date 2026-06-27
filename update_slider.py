import re

content = open('src/pages/Home.jsx', 'r', encoding='utf-8').read()

# Make sure slider uses only the last 2 (or all if that was what was meant)
# The safest is to map over the exact ones.
# Currently it says {(toppers || []).map((t, idx) => (
content = content.replace('{(toppers || []).map((t, idx) => (', '{(toppers || []).slice(3).map((t, idx) => (')

open('src/pages/Home.jsx', 'w', encoding='utf-8').write(content)
