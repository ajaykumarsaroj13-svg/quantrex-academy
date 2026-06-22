import json
import re

def unwrap_math(s):
    lines = s.split('\n')
    new_lines = []
    
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('$ ') and stripped.endswith(' $') and not '\\begin{vmatrix}' in line:
            inner = stripped[2:-2]
            parts = re.split(r'\\text\{([^}]*)\}', inner)
            
            result = ''
            for i, part in enumerate(parts):
                if i % 2 == 0:
                    if part.strip():
                        result += f'${part}$'
                    else:
                        result += part
                else:
                    result += part
                    
            result = result.replace('$$', '')
            new_lines.append(result)
        else:
            new_lines.append(line)
            
    return '\n'.join(new_lines)

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()
    
start = text.find('[')
end = text.rfind(']')+1
d = json.loads(text[start:end])

for ch in d:
    for q in ch['questions']:
        q['text'] = unwrap_math(q['text'])
        q['options'] = [unwrap_math(opt) for opt in q['options']]

new_script = text[:start] + json.dumps(d, ensure_ascii=False, indent=2) + text[end:]

with open('E:/quantrexacademy/public/blackbook-script.js', 'w', encoding='utf-8') as f:
    f.write(new_script)

print('Done')
