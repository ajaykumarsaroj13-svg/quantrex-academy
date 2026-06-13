import re

content = open('src/App.jsx', 'r', encoding='utf-8').read()

content = content.replace("if (localStorage.getItem('quantrex_toppers_v6')) {", "if (localStorage.getItem('quantrex_toppers_v5')) {")

open('src/App.jsx', 'w', encoding='utf-8').write(content)
