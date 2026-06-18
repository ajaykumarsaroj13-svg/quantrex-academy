import os
import re

src_dir = 'src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            replacements = {
                'icons/check-circle2': 'icons/check-circle-2',
                'icons/bar-chart2': 'icons/bar-chart-2',
                'icons/maximize2': 'icons/maximize-2',
                'icons/trash2': 'icons/trash-2',
                'icons/volume2': 'icons/volume-2'
            }
            
            for old, new in replacements.items():
                new_content = new_content.replace(old, new)
                
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {path}")
