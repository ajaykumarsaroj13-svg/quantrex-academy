import re
text = r'$ 	ext{The value of }(lpha^2 + eta^2 + lphaeta)	ext{ is equal to}: $'

def unwrap_math(s):
    if not s.startswith('$ ') or not s.endswith(' $'):
        return s
    
    inner = s[2:-2]
    parts = re.split(r'\\text\{([^}]*)\}', inner)
    
    result = ''
    for i, part in enumerate(parts):
        if i % 2 == 0:
            if part.strip():
                result += r'$' + part + r'$'
        else:
            result += part
            
    return result

print(unwrap_math(text))
