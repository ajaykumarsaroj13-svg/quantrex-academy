# Inspect website api/auth.js
import sys
sys.stdout.reconfigure(encoding='utf-8')

if sys.platform == 'win32':
    path = "C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/api/auth.js"
else:
    path = "./api/auth.js"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "User.findOne" in line or "action === 'login'" in line:
        for j in range(idx - 2, min(idx + 25, len(lines))):
            print(f"{j+1}: {lines[j]}", end="")
        break
