# Search for notifications files
import os
for root, dirs, files in os.walk("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy"):
    for file in files:
        if "notification" in file.lower():
            print(os.path.join(root, file))
