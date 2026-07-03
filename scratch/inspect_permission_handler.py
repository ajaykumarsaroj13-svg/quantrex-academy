# Search for handleToggleCoursePermission in AdminDashboard.jsx
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "handleToggleCoursePermission" in line:
        for j in range(idx - 2, min(idx + 35, len(lines))):
            print(f"{j+1}: {lines[j]}", end="")
        break
