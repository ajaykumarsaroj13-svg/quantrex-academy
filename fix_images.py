import os

def replace_in_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace('"/images/toppers/', '"https://raw.githubusercontent.com/ajaykumarsaroj13-svg/quantrex-academy/main/public/images/toppers/')
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Replaced in {path}')
    else:
        print(f'No changes in {path}')

replace_in_file('src/pages/Home.jsx')
replace_in_file('public/data-script.js')
