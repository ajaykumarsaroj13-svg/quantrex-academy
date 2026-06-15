import re

content = open('src/App.jsx', 'r', encoding='utf-8').read()

# Remove lines 22-24 block
content = re.sub(
    r"if \(DEFAULT_SYLLABUS\['jee-advanced'\] && DEFAULT_SYLLABUS\['jee-advanced'\]\.subjects && DEFAULT_SYLLABUS\['jee-advanced'\]\.subjects\.mathematics && DEFAULT_SYLLABUS\['jee-advanced'\]\.subjects\.mathematics\.chapters\) \{\n\s*DEFAULT_SYLLABUS\['jee-advanced'\]\.subjects\.mathematics\.chapters = DEFAULT_SYLLABUS\['jee-advanced'\]\.subjects\.mathematics\.chapters\.slice\(0, 4\);\n\}",
    "",
    content
)

# Remove lines 85-91 block
content = re.sub(
    r"\s*// Apply slice for advanced mathematics chapters if present\n\s*if \(activeSyllabus\['jee-advanced'\] && activeSyllabus\['jee-advanced'\]\.subjects && \n\s*activeSyllabus\['jee-advanced'\]\.subjects\.mathematics && \n\s*activeSyllabus\['jee-advanced'\]\.subjects\.mathematics\.chapters\) \{\n\s*activeSyllabus\['jee-advanced'\]\.subjects\.mathematics\.chapters = \n\s*activeSyllabus\['jee-advanced'\]\.subjects\.mathematics\.chapters\.slice\(0, 4\);\n\s*\}",
    "",
    content
)

content = content.replace('const CACHE_VERSION = \"v9\";', 'const CACHE_VERSION = \"v10\";')
content = content.replace('if (cacheVersion !== \"v9\")', 'if (cacheVersion !== \"v10\")')
content = content.replace('localStorage.setItem(\"quantrex_cache_version\", \"v9\");', 'localStorage.setItem(\"quantrex_cache_version\", \"v10\");')
content = content.replace('localStorage.getItem(\'quantrex_syllabus_v9\')', 'localStorage.getItem(\'quantrex_syllabus_v10\')')
content = content.replace('localStorage.removeItem(\'quantrex_syllabus_v8\');', 'localStorage.removeItem(\'quantrex_syllabus_v8\');\n    }\n    if (localStorage.getItem(\'quantrex_syllabus_v9\')) {\n      localStorage.removeItem(\'quantrex_syllabus_v9\');')

open('src/App.jsx', 'w', encoding='utf-8').write(content)
print("Updated App.jsx successfully")
