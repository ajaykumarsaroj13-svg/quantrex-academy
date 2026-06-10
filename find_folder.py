import os

target_dirs = [
    r"C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy",
    r"C:\Users\Admin\Downloads"
]

for target_dir in target_dirs:
    for root, dirs, files in os.walk(target_dir):
        if 'node_modules' in root or '.git' in root:
            continue
        for d in dirs:
            if 'jee' in d.lower() or 'limit' in d.lower():
                print(f"DIR: {os.path.join(root, d)}")
        for f in files:
            if 'jee' in f.lower() or ('limit' in f.lower() and f.endswith('.json')):
                print(f"FILE: {os.path.join(root, f)}")
