import json
with open('package.json', 'r') as f:
    data = json.load(f)

if 'build' not in data['scripts']:
    data['scripts']['build'] = 'vite build'

with open('package.json', 'w') as f:
    json.dump(data, f, indent=4)
