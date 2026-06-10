import json
import re

def to_latex(s):
    if not s: return s
    
    # Strip (a), (b), etc. if option
    s = re.sub(r'^\s*\([a-e]\)\s*', '', s)

    # Unicode replacements
    s = s.replace('→', '\\to ')
    s = s.replace('∞', '\\infty')
    s = s.replace('π', '\\pi')
    s = s.replace('⁻¹', '^{-1}')
    s = s.replace('²', '^2')
    s = s.replace('³', '^3')
    s = s.replace('⁴', '^4')
    s = s.replace('⁵', '^5')
    s = s.replace('⁶', '^6')
    s = s.replace('⁷', '^7')
    s = s.replace('⁸', '^8')
    s = s.replace('⁹', '^9')
    s = s.replace('⁰', '^0')
    s = s.replace('ⁿ', '^n')
    s = s.replace('½', '{1/2}')
    s = s.replace('≤', '\\le ')
    s = s.replace('≥', '\\ge ')
    s = s.replace('≠', '\\neq ')
    s = s.replace('≈', '\\approx ')
    s = s.replace('θ', '\\theta')
    s = s.replace('α', '\\alpha')
    s = s.replace('β', '\\beta')
    s = s.replace('λ', '\\lambda')
    s = s.replace('∑', '\\sum')
    s = s.replace('√', '\\sqrt')
    
    # Math functions
    s = re.sub(r'\blim_', r'\\lim_', s)
    s = re.sub(r'\bcos\b', r'\\cos', s)
    s = re.sub(r'\bsin\b', r'\\sin', s)
    s = re.sub(r'\btan\b', r'\\tan', s)
    s = re.sub(r'\bcot\b', r'\\cot', s)
    s = re.sub(r'\bsec\b', r'\\sec', s)
    s = re.sub(r'\bcsc\b', r'\\csc', s)
    s = re.sub(r'\blog\b', r'\\log', s)
    s = re.sub(r'\bln\b', r'\\ln', s)
    
    # Remove existing $$ if any
    s = s.replace('$', '')
    
    # Specific patterns for limits questions
    
    # 1. "The value of MATH is equal to:"
    if s.startswith("The value of ") and "is equal to:" in s:
        s = s.replace("The value of ", "The value of $")
        s = s.replace(" is equal to:", "$ is equal to:")
        return s
    
    # 2. "The value of MATH is:"
    if s.startswith("The value of ") and " is:" in s:
        s = s.replace("The value of ", "The value of $")
        s = s.replace(" is:", "$ is:")
        return s

    # 3. "Evaluate: MATH"
    if s.startswith("Evaluate: "):
        s = s.replace("Evaluate: ", "Evaluate: $")
        return s + "$"
        
    # 4. "Evaluate the limit: MATH"
    if s.startswith("Evaluate the limit: "):
        s = s.replace("Evaluate the limit: ", "Evaluate the limit: $")
        return s + "$"

    # 5. "If MATH where n is an even integer, which of the following statements is INCORRECT?"
    if "where n is an even integer" in s:
        s = s.replace("If ", "If $")
        s = s.replace(" where n is an even integer", "$ where n is an even integer")
        return s

    # 6. "Let MATH and MATH. Then a, b, c satisfy:"
    if s.startswith("Let ") and "satisfy:" in s:
        s = s.replace("Let ", "Let $")
        s = s.replace(". Then ", "$. Then ")
        # Also fix internal 'and'
        s = s.replace(", and c =", "$, and $c =")
        return s

    # 7. "If MATH and MATH, then for MATH, MATH is:"
    if s.startswith("If ") and ", then " in s:
        s = s.replace("If ", "If $")
        s = s.replace(" and ", "$ and $")
        s = s.replace(", then ", "$, then ")
        # then for MATH, MATH is:
        if ", \\lim" in s:
            s = s.replace(", \\lim", "$, $\\lim")
            s = s.replace(" is:", "$ is:")
        return s
        
    # 8. "Determine the value of MATH :"
    if s.startswith("Determine the value of "):
        s = s.replace("Determine the value of ", "Determine the value of $")
        if " :" in s:
            s = s.replace(" :", "$ :")
        return s

    # 9. "lim_... = p/q (where [.] denotes...). If ..., find p + q:"
    if "(where [.] denotes" in s:
        # Just wrap the first part up to (where
        s = "$" + s.replace(" (where ", "$ (where ")
        return s

    # 10. "Let f be a continuous function... Then f(0) ="
    if s.startswith("Let f be "):
        s = s.replace("such that ", "such that $")
        s = s.replace(". Then ", "$. Then $")
        return s + "$"

    # 11. "lim... equals (where..."
    if " equals (where" in s:
        s = "$" + s.replace(" equals (where", "$ equals (where")
        return s

    # Fallback: Just assume the whole thing is math if no common english words are found
    if not any(word in s.lower() for word in [" if ", " then ", " let ", " value ", " evaluate ", " where "]):
        return f"${s}$"
        
    # If all else fails, just put it in math mode
    return f"${s}$"

with open('src/utils/blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for q in data[1]['questions']:
    q['text'] = to_latex(q['text'])
    q['options'] = [to_latex(opt) for opt in q['options']]

with open('src/utils/blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Formatting applied successfully.")
