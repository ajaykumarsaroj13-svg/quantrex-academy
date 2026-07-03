# Find pushCloudBtn in AdminDashboard.jsx
with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "pushCloudBtn" in line:
        # Print 50 lines before and after
        for j in range(max(0, idx - 40), min(idx + 15, len(lines))):
            print(f"{j+1}: {lines[j]}", end="")
        break
