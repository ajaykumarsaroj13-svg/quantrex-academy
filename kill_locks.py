import os, subprocess, time

print('Killing git...')
os.system('taskkill /f /im git.exe')
os.system('taskkill /f /im git-remote-https.exe')
time.sleep(1)

locks = [
    'E:/quantrexacademy/.git/index.lock',
    'E:/quantrexacademy/.git/refs/remotes/origin/data-upload-branch.lock'
]

for lock in locks:
    if os.path.exists(lock):
        try:
            os.remove(lock)
            print(f'Removed {lock}')
        except Exception as e:
            print(f'Failed to remove {lock}: {e}')

print('Running git add, commit, push...')
os.system('git add .')
os.system('git commit -m "Force bypass cache"')
os.system('git push')
