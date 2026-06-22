import json, re

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
end = text.rfind(']')+1
d = json.loads(text[start:end])

fixed = 0
for ch in d:
    if ch['title'] in ['Determinants', 'Sequence and Series']:
        for q in ch['questions']:
            t = q.get('text', '')
            if 'Final Answer' in t:
                # Match patterns like:
                # Final Answer$: 3$
                # Final Answer: 3
                # **Final Answer: 3**
                new_t = re.sub(r'\n*\**\s*Final Answer\s*\$?\s*:?\s*\$?\s*\S+\$?\s*\**\s*$', '', t, flags=re.MULTILINE).strip()
                if new_t != t:
                    q['text'] = new_t
                    fixed += 1
                else:
                    print("FAILED TO MATCH: " + repr(t[-80:]))

new_script = text[:start] + json.dumps(d, ensure_ascii=False, indent=2) + text[end:]

with open('E:/quantrexacademy/public/blackbook-script.js', 'w', encoding='utf-8') as f:
    f.write(new_script)

print("Removed Final Answer from " + str(fixed) + " questions")
