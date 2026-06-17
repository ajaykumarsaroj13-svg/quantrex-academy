
import os
import json
import re

question_dir = r"public/data/questions"
test_dir = r"public/data/tests"

# Patterns to find multiple options
patterns = [
    r"(?:options?|answers?)\s*([A-Da-d\s,\(\)and]+)\s*(?:are|is)\s*correct",
    r"([A-Da-d\s,\(\)and]+)\s*(?:are|is)\s*correct\s*(?:options?|answers?)",
    r"([A-Da-d\s,\(\)and]+)\s*are\s*correct",
    r"(?:options?|answers?)\s*([A-Da-d\s,\(\)and]+)\s*are\s*true"
]

def extract_options(text):
    # normalize text
    text = text.lower().replace("and", ",").replace("(", "").replace(")", "").replace(" ", "")
    opts = []
    for char in text:
        if char in "abcd":
            opts.append(ord(char) - ord('a'))
    return sorted(list(set(opts)))

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    modified = False
    
    # Check if data is array (questions) or object with questions (tests)
    is_test = False
    if isinstance(data, dict) and "questions" in data:
        q_list = data["questions"]
        is_test = True
    elif isinstance(data, list):
        q_list = data
    else:
        return
        
    for q in q_list:
        if not q or "solution" not in q or not q["solution"]: continue
        
        sol = q["solution"].lower()
        
        # We only want to upgrade if its currently single correct
        q_type = q.get("type", "") if not is_test else q.get("questionType", "")
        if "NUM" in q_type or "NAT" in q_type: continue
        
        # Check patterns
        found_opts = None
        for p in patterns:
            match = re.search(p, sol)
            if match:
                raw_opts = match.group(1)
                extracted = extract_options(raw_opts)
                if len(extracted) > 1 and len(extracted) <= 4:
                    found_opts = extracted
                    break
        
        if found_opts:
            # Upgrade to MCQM
            if is_test:
                q["questionType"] = "MCQM"
                q["correctOptionsArray"] = found_opts
            else:
                q["type"] = "MCQM"
                q["correctOptionIndex"] = found_opts
            modified = True
            
    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, separators=(",", ":"))
        return True
    return False

count = 0
for file in os.listdir(question_dir):
    if file.startswith("adv-") and file.endswith(".json"):
        if process_file(os.path.join(question_dir, file)):
            count += 1
            
for file in os.listdir(test_dir):
    if file.endswith(".json"):
        if process_file(os.path.join(test_dir, file)):
            count += 1

print(f"Modified {count} files.")

