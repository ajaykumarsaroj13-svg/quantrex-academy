# Search for BackupData usage in api/backup.js
with open("C:/Users/Admin/.gemini/antigravity/scratch/project_ajay2/quantrex-academy/api/backup.js", "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "BackupData" in line:
            print(f"{idx+1}: {line}", end="")
