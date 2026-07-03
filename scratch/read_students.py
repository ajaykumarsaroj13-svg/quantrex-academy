# Read lines around students tab in AdminDashboard.jsx with utf-8 printing
import sys
# Set console encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(1071, 1200):
    if idx < len(lines):
        print(f"{idx+1}: {lines[idx]}", end="")
