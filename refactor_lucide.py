import os
import re

def to_kebab_case(name):
    # Convert CamelCase to kebab-case
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1-\2', s1).lower()

lucide_regex = re.compile(r"import\s*\{\s*([^}]+)\s*\}\s*from\s*['\"]lucide-react['\"];?")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'lucide-react' in content:
                def replacer(match):
                    imports = [i.strip() for i in match.group(1).split(',')]
                    new_imports = []
                    for imp in imports:
                        if not imp: continue
                        if ' as ' in imp:
                            parts = imp.split(' as ')
                            orig = parts[0].strip()
                            alias = parts[1].strip()
                            kebab = to_kebab_case(orig)
                            new_imports.append(f"import {alias} from 'lucide-react/dist/esm/icons/{kebab}';")
                        else:
                            kebab = to_kebab_case(imp)
                            new_imports.append(f"import {imp} from 'lucide-react/dist/esm/icons/{kebab}';")
                    return '\n'.join(new_imports)
                
                new_content = lucide_regex.sub(replacer, content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Refactored {filepath}")
