import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix double </>
content = re.sub(
    r'</>\s*</>',
    '</>',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed double </>")
