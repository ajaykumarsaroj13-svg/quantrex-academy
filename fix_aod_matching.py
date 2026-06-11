import json
import re

def process_cell(cell_text):
    # Remove HTML tags if any (e.g., <td>, <th>, <b>)
    cell_text = re.sub(r'<[^>]+>', '', cell_text).strip()
    if not cell_text:
        return "\\text{}"
    
    # Split by $$ to separate math and text
    parts = cell_text.split('$$')
    
    formatted_parts = []
    for i, part in enumerate(parts):
        part = part.strip()
        if not part:
            continue
        if i % 2 == 0:
            # Text mode
            formatted_parts.append(f"\\text{{{part}}}")
        else:
            # Math mode (don't add $$ back!)
            formatted_parts.append(part)
                
    return " ".join(formatted_parts)

def html_to_katex_array(match):
    table_html = match.group(0)
    
    # Extract rows using <tr>
    tr_pattern = re.compile(r'<tr>(.*?)</tr>', re.DOTALL | re.IGNORECASE)
    rows = tr_pattern.findall(table_html)
    
    if not rows:
        return table_html
        
    array_rows = []
    
    # Header row
    th_pattern = re.compile(r'<th>(.*?)</th>', re.DOTALL | re.IGNORECASE)
    headers = th_pattern.findall(rows[0])
    
    num_cols = len(headers)
    if num_cols == 0:
        return table_html
        
    array_rows.append(" & ".join([f"\\text{{\\textbf{{{h.strip()}}}}}" for h in headers]) + " \\\\")
    array_rows.append("\\hline")
    
    td_pattern = re.compile(r'<td>(.*?)</td>', re.DOTALL | re.IGNORECASE)
    for row in rows[1:]:
        cells = td_pattern.findall(row)
        while len(cells) < num_cols:
            cells.append("")
        cells = cells[:num_cols]
        
        formatted_cells = [process_cell(c) for c in cells]
        array_rows.append(" & ".join(formatted_cells) + " \\\\")
        
    array_content = "\n".join(array_rows)
    cols_format = "|".join(["l"] * num_cols)
    
    return f"\n$$\n\\begin{{array}}{{|{cols_format}|}}\n\\hline\n{array_content}\n\\hline\n\\end{{array}}\n$$\n"

# Load the raw chunk 5
with open('C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\public\\data\\questions\\extracted_chunk_5.json', 'r', encoding='utf-8') as f:
    chunk5 = json.load(f)

# Load the current full json
file_path = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\src\\utils\\blackBookDataFull.json"
with open(file_path, "r", encoding="utf-8") as f:
    bb_data = json.load(f)

for ch in bb_data:
    if ch["id"] == "black_book_ch_aod":
        matching_questions = [q for q in ch["questions"] if q["questionType"] == "MATCH THE COLUMN" or q["questionType"] == "MATCHING TYPE"]
        
        # We need to map them. Let's just process chunk5 directly and replace the questions
        for i, q in enumerate(matching_questions):
            if i < len(chunk5):
                raw_q = chunk5[i]
                original_text = raw_q['question']
                # Convert <p> to \n\n
                text = re.sub(r'<p.*?>(.*?)</p>', r'\1\n\n', original_text, flags=re.IGNORECASE | re.DOTALL)
                # Convert <table> to \begin{array}
                text = re.sub(r'<table.*?>.*?</table>', html_to_katex_array, text, flags=re.IGNORECASE | re.DOTALL)
                # Also replace any stray $$ outside of tables with $ for MathRenderer compatibility
                # Wait, MathRenderer supports $$, but it renders BlockMath. The user might want inline math.
                # In the previous fix, I replaced $$ with $
                # Let's replace $$ with $ ONLY OUTSIDE the \begin{array} block.
                # Actually, \begin{array} is inside $$ ... $$.
                # So if I replace all $$ with $ now, I'll break \begin{array}.
                # Let's just do it manually for the text outside the table.
                
                parts = text.split("$$\n\\begin{array}")
                if len(parts) == 2:
                    pre_table = parts[0].replace('$$', '$')
                    post_table = "$$\n\\begin{array}" + parts[1]
                    text = pre_table + post_table
                
                q['text'] = text
        break

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(bb_data, f, indent=2)

print("Fixed tables!")
