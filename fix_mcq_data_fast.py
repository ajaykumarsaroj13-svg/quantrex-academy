
import os
import json
import re

question_dir = r"public/data/questions"
test_dir = r"public/data/tests"

def extract_options(text):
    text = text.lower()
    opts = []
    # just extract unique a,b,c,d
    for char in text:
        if char in "abcd":
            opts.append(ord(char) - ord('a'))
    return sorted(list(set(opts)))

def process_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except:
        return False
    
    modified = False
    
    is_test = False
    if isinstance(data, dict) and "questions" in data:
        q_list = data["questions"]
        is_test = True
    elif isinstance(data, list):
        q_list = data
    else:
        return False
        
    for q in q_list:
        if not q or "solution" not in q or not q["solution"]: continue
        
        sol = q["solution"].lower().replace("<br>", "").replace("<p>", "").replace("</p>", "").replace("\n", " ")
        
        q_type = q.get("type", "") if not is_test else q.get("questionType", "")
        if "NUM" in q_type or "NAT" in q_type: continue
        if q_type == "MCQM": continue # already MCQM
        
        idx = sol.find("are correct")
        if idx == -1:
            idx = sol.find("are true")
        if idx == -1:
            idx = sol.find("is correct")
            
        found_opts = None
        if idx != -1:
            # take 30 characters before
            snippet = sol[max(0, idx-30):idx]
            if "option" in snippet or "answer" in snippet or "," in snippet or "and" in snippet:
                extracted = extract_options(snippet)
                # Only trust it if there are 2, 3, or 4 options extracted and no spurious letters (like the word "and" has "a" and "d", so if we see "and" we might get [0, 3]). Wait! "and" contains "a" and "d"!!
                # "options a, b and c" -> "options a, b an c"
                # Actually, replace "and" with "" before extracting!
                snippet_clean = snippet.replace("and", "")
                # also replace "options", "option", "answers", "answer"
                snippet_clean = snippet_clean.replace("options", "").replace("option", "").replace("answers", "").replace("answer", "").replace("hence", "").replace("therefore", "").replace("clearly", "")
                
                extracted = extract_options(snippet_clean)
                if len(extracted) > 1 and len(extracted) <= 4:
                    found_opts = extracted
        
        if found_opts:
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

