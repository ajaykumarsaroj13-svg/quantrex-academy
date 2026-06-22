import os

files_to_patch = [
    "src/App.jsx",
    "src/pages/Home.jsx",
    "src/utils/syllabusData.js",
    "public/data-script.js"
]

for filepath in files_to_patch:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Fix the URLs
    content = content.replace("dibyanshu_adv.jpg", "dibyanshu_advanced.jpg")
    content = content.replace("dibyanshu_main.jpg", "dibyanshu_mains.jpg")
    content = content.replace("v=new8", "v=new9")
    content = content.replace("quantrex_toppers_v8", "quantrex_toppers_v9")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Replacement complete.")
