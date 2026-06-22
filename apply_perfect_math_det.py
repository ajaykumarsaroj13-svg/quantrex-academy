import json
import re

def text_wrapper3(text):
    if 'vmatrix' in text:
        return '$ ' + text.replace('$', '').strip() + ' $'
    text = text.replace('$', '')
    if not text.strip(): return text
    math_funcs = {'sec', 'cos', 'sin', 'tan', 'cot', 'cosec', 'lim', 'log', 'max', 'min', 'ln', 'exp'}
    
    tokens = re.split(r'((?<!\\)\b[a-zA-Z]+(?:-[a-zA-Z]+)*\b)', text)
    
    result = []
    text_buffer = ""
    
    for i, token in enumerate(tokens):
        if i % 2 == 1:
            word = token
            if word.lower() in math_funcs or (len(word) == 1 and word not in ['a', 'A', 'I']) or word in ['xyz', 'abc', 'pqr', 'uvw', 'lmn', 'Sn', 'Tn', 'Pn', 'dx', 'dy', 'dz', 'limit']:
                if text_buffer:
                    result.append(r'\text{' + text_buffer + '}')
                    text_buffer = ""
                result.append(word)
            else:
                text_buffer += word
        else:
            m_leading = re.match(r'^(\s+)(.*)$', token, re.DOTALL)
            if m_leading:
                leading_spaces = m_leading.group(1)
                rest = m_leading.group(2)
                text_buffer += leading_spaces
                token = rest

            if not token:
                continue
                
            m_trailing = re.match(r'^(.*?)(\s+)$', token, re.DOTALL)
            if m_trailing:
                core = m_trailing.group(1)
                trailing_spaces = m_trailing.group(2)
            else:
                core = token
                trailing_spaces = ''
                
            if text_buffer:
                result.append(r'\text{' + text_buffer + '}')
                text_buffer = ""
                
            result.append(core)
            text_buffer += trailing_spaces
            
    if text_buffer:
        result.append(r'\text{' + text_buffer + '}')
        
    return '$ ' + ''.join(result) + ' $'

# 1. Read latest
with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    latest_content = f.read()
start_latest = latest_content.find('[')
latest_d = json.loads(latest_content[start_latest:latest_content.rfind(']')+1])

latest_seq = next(ch for ch in latest_d if ch['title'] == 'Determinants')

# 3. Apply text_wrapper3 line-by-line to q["text"] AND options except matching type
for latest_q in latest_seq["questions"]:
    if latest_q["exerciseName"] != 'Exercise-4: Matching Type Problems':
        # Text
        lines = latest_q["text"].split('\n')
        new_lines = []
        for line in lines:
            new_lines.append(text_wrapper3(line))
        latest_q["text"] = '\n'.join(new_lines)
        
        # Options
        for i in range(len(latest_q["options"])):
            latest_q["options"][i] = text_wrapper3(latest_q["options"][i])

# 4. Save latest
new_content = latest_content[:start_latest] + json.dumps(latest_d, indent=2, ensure_ascii=False) + latest_content[latest_content.rfind(']')+1:]
with open('E:/quantrexacademy/public/blackbook-script.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done successfully!")
