import re

with open("C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/src/pages/StudentDashboard.jsx", 'r', encoding='utf-8') as f:
    dashboard_content = f.read()

dashboard_content = dashboard_content.replace('</div>)}\n    </>', ')}\n    </>')

with open("C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/src/pages/StudentDashboard.jsx", 'w', encoding='utf-8') as f:
    f.write(dashboard_content)

print("Done")
