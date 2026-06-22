import subprocess

commands = [
    "git add .",
    "git commit -m \"Completely rename image paths to bypass caching\"",
    "git push"
]

for cmd in commands:
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print("STDOUT:", result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
