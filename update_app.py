import re

content = open('src/App.jsx', 'r', encoding='utf-8').read()

content = content.replace("localStorage.getItem('quantrex_toppers_v4')", "localStorage.getItem('quantrex_toppers_v5')")
content = content.replace("localStorage.removeItem('quantrex_toppers_v4')", "localStorage.removeItem('quantrex_toppers_v5')")

content = content.replace("localStorage.getItem('quantrex_toppers_v5')", "localStorage.getItem('quantrex_toppers_v6')")
content = content.replace("localStorage.setItem('quantrex_toppers_v5'", "localStorage.setItem('quantrex_toppers_v6'")

open('src/App.jsx', 'w', encoding='utf-8').write(content)
