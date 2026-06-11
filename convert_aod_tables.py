import json
import re

def markdown_to_katex_array(match):
    table_text = match.group(0)
    lines = [line.strip() for line in table_text.strip().split('\n') if line.strip()]
    if len(lines) < 3:
        return table_text
    
    # Process headers
    header_cells = [cell.strip() for cell in lines[0].strip('|').split('|')]
    num_cols = len(header_cells)
    
    # Process rows (skip the separator line at index 1)
    array_rows = []
    
    # Add header
    array_rows.append(" & ".join([f"\\text{{\\textbf{{{cell}}}}}" for cell in header_cells]) + " \\\\")
    array_rows.append("\\hline")
    
    # Add data
    for line in lines[2:]:
        cells = [cell.strip() for cell in line.strip('|').split('|')]
        # Make sure we have the right number of columns
        while len(cells) < num_cols:
            cells.append("")
        cells = cells[:num_cols]
        
        # Replace strong or bold markdown with textbf
        formatted_cells = []
        for cell in cells:
            cell = re.sub(r'\*\*(.*?)\*\*', r'\\textbf{\1}', cell)
            # If the cell is mostly plain text, wrap it in \text{}?
            # Actually, KaTeX array cells are in math mode by default.
            # So regular text needs \text{}.
            # Let's wrap the cell in \text{} if it contains non-math characters and isn't purely math.
            # A simpler way is to just let KaTeX handle it, but plain text will look italicized and have no spaces.
            # If a cell has no $, we should wrap it in \text{}.
            if cell.startswith('(') and cell.endswith(')'):
                formatted_cells.append(f"\\text{{{cell}}}")
            elif '$' not in cell:
                # If there's no math, wrap in \text
                formatted_cells.append(f"\\text{{{cell}}}")
            else:
                # If it has math, it's tricky.
                # Actually, in the old chapter:
                # \text{\textbf{(A)} } \text{If } f(x) = \frac{x}{1+x} ...
                # Let's just leave it as is if it has math, but wait, then plain text inside the cell will be squished.
                # In AOD, the cells are like: "(A) $y = \sin x, y = \cos x$"
                # We can replace the "(A)" with "\text{(A)} "
                cell = re.sub(r'^\(([A-Z])\)\s*', r'\\text{(\1)} ', cell)
                formatted_cells.append(cell)
        
        array_rows.append(" & ".join(formatted_cells) + " \\\\")
        
    array_content = "\n".join(array_rows)
    cols_format = "|".join(["l"] * num_cols)
    
    katex_table = f"\n$$\n\\begin{{array}}{{|{cols_format}|}}\n\\hline\n{array_content}\n\\hline\n\\end{{array}}\n$$\n"
    return katex_table

file_path = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\src\\utils\\blackBookDataFull.json"
with open(file_path, "r", encoding="utf-8") as f:
    bb_data = json.load(f)

for ch in bb_data:
    if ch["id"] == "black_book_ch_aod":
        for q in ch["questions"]:
            if q["questionType"] == "MATCHING TYPE":
                q["text"] = re.sub(r'\|.*\|\n\|[-|]+\|\n(?:\|.*\|\n?)*', markdown_to_katex_array, q["text"])
                # Let's change questionType to MATCH THE COLUMN to be safe
                q["questionType"] = "MATCH THE COLUMN"
        break

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(bb_data, f, indent=2)

print("Tables converted!")
