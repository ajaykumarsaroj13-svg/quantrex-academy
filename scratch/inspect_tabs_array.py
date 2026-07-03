# Search for tabs array in AdminDashboard.jsx
with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "const tabs =" in line or "const adminTabs =" in line:
        for j in range(idx, min(idx + 30, len(lines))):
            print(f"{j+1}: {lines[j]}", end="")
        break
