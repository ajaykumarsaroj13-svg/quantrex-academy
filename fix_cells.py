import json
import re

def process_cell(cell_text):
    cell_text = cell_text.strip()
    if not cell_text:
        return "\\text{}"
    
    # Split by $
    parts = cell_text.split('$')
    
    formatted_parts = []
    for i, part in enumerate(parts):
        if i % 2 == 0:
            # Text mode
            if part:
                # Wrap in \text{} but handle spaces carefully
                # To prevent \text{ } from being stripped or something, it's fine
                formatted_parts.append(f"\\text{{{part}}}")
        else:
            # Math mode
            if part:
                formatted_parts.append(part)
                
    # Also handle the (A), (B), etc. at the start if it was part of text
    # The split handles this perfectly. e.g. "(A) " -> "\text{(A) }"
    # One small issue: if a cell starts with \text{\textbf{(A)}}, we want to keep it bold.
    # But wait, my previous script didn't make (A) bold. It just kept it as (A).
    # Let's just join them.
    return " ".join(formatted_parts)

def markdown_to_katex_array(match):
    table_text = match.group(0)
    lines = [line.strip() for line in table_text.strip().split('\n') if line.strip()]
    if len(lines) < 3:
        return table_text
    
    header_cells = [cell.strip() for cell in lines[0].strip('|').split('|')]
    num_cols = len(header_cells)
    
    array_rows = []
    
    # Header
    array_rows.append(" & ".join([f"\\text{{\\textbf{{{cell}}}}}" for cell in header_cells]) + " \\\\")
    array_rows.append("\\hline")
    
    for line in lines[2:]:
        cells = [cell.strip() for cell in line.strip('|').split('|')]
        while len(cells) < num_cols:
            cells.append("")
        cells = cells[:num_cols]
        
        formatted_cells = []
        for cell in cells:
            # Strip out markdown bold that we added in the previous script just in case
            cell = cell.replace('**', '')
            formatted_cells.append(process_cell(cell))
            
        array_rows.append(" & ".join(formatted_cells) + " \\\\")
        
    array_content = "\n".join(array_rows)
    cols_format = "|".join(["l"] * num_cols)
    
    return f"\n$$\n\\begin{{array}}{{|{cols_format}|}}\n\\hline\n{array_content}\n\\hline\n\\end{{array}}\n$$\n"

# Since we already converted them to \begin{array} in the previous script, 
# we need to revert them back to markdown or process the current \begin{array} directly.
# Wait! I didn't save the original markdown text!
# Let me just process the current \begin{array} block.

def fix_array(match):
    array_block = match.group(0)
    
    # We want to extract the inner content and re-process it.
    # But wait, the cells currently might look like:
    # \text{(A)} $y = \sin x, y = \cos x$
    # \text{(B) The value of $\left[4 \sum_{n=1}^\infty \cot^{-1}\left(1 + \sum_{k=1}^n 2k\right)\right] = $([.] represent greatest integer function)}
    
    # It's a mess.
    # Let me just re-read the original blackBookDataFull.json from a backup? I don't have one.
    # But I can easily parse the current `array_block` back into text.
    pass

