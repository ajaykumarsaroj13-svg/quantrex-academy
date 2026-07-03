# Inspect AdminDashboard.jsx UI Tabs rendering
with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

in_render = False
for i, line in enumerate(lines):
    if "return (" in line:
        in_render = True
    if in_render:
        # Look for buttons that set adminTab
        if "setAdminTab(" in line or 'adminTab ===' in line:
            print(f"L{i+1}: {line.strip()}")
        if "switch (adminTab)" in line or "switch(adminTab)" in line:
            print(f"L{i+1}: {line.strip()}")
            # Print the next 50 lines to see the switch structure
            for j in range(i, min(i+150, len(lines))):
                if "case " in lines[j] or "default" in lines[j]:
                    print(f"  L{j+1}: {lines[j].strip()}")
