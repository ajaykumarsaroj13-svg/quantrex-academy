# Read lines around notice tab in AdminDashboard.jsx
with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(1910, 1965):
    if idx < len(lines):
        print(f"{idx+1}: {lines[idx]}", end="")
