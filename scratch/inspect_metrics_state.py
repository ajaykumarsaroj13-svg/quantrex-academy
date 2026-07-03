# Inspect metrics default state
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(60, 75):
    if idx < len(lines):
        print(f"{idx+1}: {lines[idx]}", end="")
