import re
import json

file_path = 'ch3_4_7.json'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any \{ and \} that are not properly double-escaped
# In the JSON string, a single backslash followed by { or } is represented as \{ or \}
# But in python string, we can search for '\\{' and '\\}' and replace them with '\\\\{' and '\\\\}'
# Let's check:
fixed = re.sub(r'(?<!\\)\\(?![\\"/bfnrtu])', r'\\\\', content)

# Try parsing
try:
    data = json.loads(fixed)
    print("Parsed successfully after regex fix! Question count:", len(data))
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print("Successfully wrote fixed JSON!")
except Exception as e:
    print("Regex fix failed to parse:", e)
    # Let's do a targeted replace for the specific character
    # \{-x\} -> \\{-x\\}
    fixed_targeted = content.replace('\\{-x\\}', '\\\\{-x\\\\}')
    fixed_targeted = fixed_targeted.replace('\\{\\cdot\\}', '\\\\{\\\\cdot\\\\}')
    try:
        data = json.loads(fixed_targeted)
        print("Targeted parse success! Count:", len(data))
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e2:
        print("Targeted fix failed:", e2)
