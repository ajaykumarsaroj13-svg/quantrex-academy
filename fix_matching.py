import json
import re

def md_table_to_html(md_text):
    if "|---" not in md_text:
        return md_text
        
    lines = md_text.split('\n')
    html_lines = []
    in_table = False
    
    for line in lines:
        if line.strip().startswith('|') and '|' in line:
            if "|---" in line or "|---|" in line:
                continue # Skip separator
                
            cols = [col.strip() for col in line.split('|')[1:-1]]
            
            if not in_table:
                html_lines.append('<table class="min-w-full text-left text-sm border-collapse border border-gray-300 mt-4 mb-4">')
                html_lines.append('<thead><tr>')
                for col in cols:
                    html_lines.append(f'<th class="border border-gray-300 px-4 py-2 bg-gray-100">{col}</th>')
                html_lines.append('</tr></thead><tbody>')
                in_table = True
            else:
                html_lines.append('<tr>')
                for col in cols:
                    html_lines.append(f'<td class="border border-gray-300 px-4 py-2">{col}</td>')
                html_lines.append('</tr>')
        else:
            if in_table:
                html_lines.append('</tbody></table>')
                in_table = False
            html_lines.append(line)
            
    if in_table:
        html_lines.append('</tbody></table>')
        
    return '\n'.join(html_lines)


def fix_data():
    main_file = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json'
    with open(main_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for q in data[0]["questions"]:
        if q.get("exerciseName") == "Exercise 1":
            if q.get("questionNumber") == 25:
                q["imageUrl"] = "/images/q25_graph.png"
            elif q.get("questionNumber") == 35:
                q["imageUrl"] = "/images/q35_graph.png"
            elif q.get("questionNumber") == 86:
                q["imageUrl"] = "/images/q86_graph.png"
                
        if q.get("exerciseName") == "Exercise-4 : Matching Type Problems":
            q["text"] = md_table_to_html(q["text"])
            
            if q.get("questionNumber") == 3:
                q["imageUrl"] = "/images/ex4_q3_graph.png"
            
            # Ensure it has options
            if not q.get("options"):
                q["options"] = [
                    "(a) A-P; B-Q; C-R; D-S",
                    "(b) A-Q; B-P; C-S; D-R",
                    "(c) A-R; B-S; C-P; D-Q",
                    "(d) A-S; B-R; C-Q; D-P"
                ]
                
    with open(main_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

if __name__ == '__main__':
    fix_data()
