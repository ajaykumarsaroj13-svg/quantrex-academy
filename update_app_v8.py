import re

content = open('src/App.jsx', 'r', encoding='utf-8').read()
content = content.replace('const CACHE_VERSION = \"v7\";', 'const CACHE_VERSION = \"v8\";')
content = content.replace('if (cacheVersion !== \"v7\")', 'if (cacheVersion !== \"v8\")')
content = content.replace('localStorage.setItem(\"quantrex_cache_version\", \"v7\");', 'localStorage.setItem(\"quantrex_cache_version\", \"v8\");')
open('src/App.jsx', 'w', encoding='utf-8').write(content)
