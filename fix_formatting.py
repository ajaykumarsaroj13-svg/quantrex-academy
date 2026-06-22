import json
import re
def html_table_to_markdown(html_table):
    # Find all tr
    rows = re.findall(r'<tr.*?>(.*?)</tr>', html_table, re.IGNORECASE | re.DOTALL)
    if not rows:
        return html_table
    
    md_table = []
    for i, row in enumerate(rows):
        cells = re.findall(r'<(?:td|th).*?>(.*?)</(?:td|th)>', row, re.IGNORECASE | re.DOTALL)
        # Strip internal tags
        cells = [re.sub(r'<[^>]+>', '', cell).strip() for cell in cells]
        
        row_text = "| " + " | ".join(cells) + " |"
        md_table.append(row_text)
        if i == 0:
            md_table.append("|" + "|".join(["---"] * len(cells)) + "|")
            
    return "\n" + "\n".join(md_table) + "\n"

def fix_text(text):
    if not text:
        return text
    
    # Extract and convert tables
    def repl_table(match):
        return html_table_to_markdown(match.group(0))
    
    text = re.sub(r'<table.*?>.*?</table>', repl_table, text, flags=re.DOTALL | re.IGNORECASE)
    
    # Replace strong tags with markdown bold
    text = re.sub(r'<strong.*?>(.*?)</strong>', r'**\1**', text, flags=re.IGNORECASE)
    text = re.sub(r'<b.*?>(.*?)</b>', r'**\1**', text, flags=re.IGNORECASE)
    
    # Replace p tags with newlines
    text = re.sub(r'<p.*?>(.*?)</p>', r'\1\n\n', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Replace br tags with newline
    text = re.sub(r'<br\s*/?>', r'\n', text, flags=re.IGNORECASE)
    
    # Strip any remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Replace $$ with $
    text = text.replace('$$', '$')
    
    return text.strip()

file_path = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\src\\utils\\blackBookDataFull.json"
with open(file_path, "r", encoding="utf-8") as f:
    bb_data = json.load(f)

for ch in bb_data:
    if ch["id"] == "black_book_ch_aod":
        for q in ch["questions"]:
            q["text"] = fix_text(q.get("text", ""))
            
            # Also fix options if any
            new_options = []
            for opt in q.get("options", []):
                new_options.append(fix_text(opt))
            q["options"] = new_options
            
        break

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(bb_data, f, indent=2)

print("Formatting fixed!")
