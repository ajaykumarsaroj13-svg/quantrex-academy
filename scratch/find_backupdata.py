# Search for BackupData imports in api directory
import os

api_dir = "C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/api"
for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file.endswith(".js"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                if "BackupData" in content:
                    print(f"Found in: {path}")
