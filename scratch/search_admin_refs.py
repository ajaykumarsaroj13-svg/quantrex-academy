# Search for subscription and notification in AdminDashboard.jsx
with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    text = f.read()

import re
print("Matches for subscription:")
for m in re.finditer(r'(?i)subscription', text):
    start = max(0, m.start() - 40)
    end = min(len(text), m.end() + 40)
    chunk = text[start:end].replace('\n', ' ')
    print(f"  ... {chunk} ...")

print("\nMatches for notification or push:")
for m in re.finditer(r'(?i)notification|push', text):
    start = max(0, m.start() - 40)
    end = min(len(text), m.end() + 40)
    chunk = text[start:end].replace('\n', ' ')
    print(f"  ... {chunk} ...")
