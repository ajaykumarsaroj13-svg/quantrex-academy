# Inspect website api/auth.js login action
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/api/auth.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

found = False
for idx, line in enumerate(lines):
    if "login" in line and "action" in line:
        found = True
        for j in range(idx - 2, min(idx + 40, len(lines))):
            print(f"{j+1}: {lines[j]}", end="")
        break

if not found:
    # Print lines 60-120
    for idx in range(60, min(120, len(lines))):
         print(f"{idx+1}: {lines[idx]}", end="")
