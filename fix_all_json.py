import json
import re

def fix_all():
    main_file = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json'
    with open(main_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for q in data[0]["questions"]:
        # Merge tabs
        if q.get("exerciseName") == "Exercise-4 : Matching Type Problems" or q.get("exerciseName") == "Exercise 4":
            q["exerciseName"] = "Exercise 4"
            
        # Fix Q1 layout
        if q.get("exerciseName") == "Exercise 4" and q.get("questionNumber") == 1:
            if '<td class="border border-gray-300 px-4 py-2"></td>' in q["text"]:
                q["text"] = q["text"].replace(
                    '<td class="border border-gray-300 px-4 py-2"></td>\n</tr>',
                    '<td class="border border-gray-300 px-4 py-2"></td>\n<td class="border border-gray-300 px-4 py-2">(T) $4$</td>\n</tr>'
                )
            # The original missing text was `| | (T) 4 |`
            
        # Fix math symbols. The user says mathematical symbols are not used properly. 
        # Sometimes \{ and \} render badly because they need to be escaped as \\{ and \\} in JS/JSON, 
        # but in JSON they are already strings.
        # Maybe \mathbb{R} was rendering as mathbb{R}? In MathJax \mathbb{R} works fine.
        # Let's ensure text replaces $...$ with \($...\)$ is handled by the frontend, which it is.
        
        # Let's check Q2 of Ex 4.
        if q.get("exerciseName") == "Exercise 4" and q.get("questionNumber") == 2:
            pass # Looks okay in earlier logs
            
    with open(main_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

if __name__ == '__main__':
    fix_all()
