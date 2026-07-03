# Inspect AdminDashboard.jsx
with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
# Find active tabs or state variables
for i, line in enumerate(lines):
    if "const [" in line and "state" in line.lower():
        print(f"L{i+1}: {line.strip()}")
    if "setActiveTab" in line or 'activeTab ===' in line:
        print(f"L{i+1}: {line.strip()}")
