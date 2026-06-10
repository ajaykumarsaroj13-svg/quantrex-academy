import json
import re

def fix_math():
    main_file = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json'
    with open(main_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for q in data[0]["questions"]:
        # Update matching options to use proper math symbols and arrows
        if q.get("exerciseName") == "Exercise 4":
            new_options = []
            for opt in q.get("options", []):
                # Replace 'A-P' with '(A) \rightarrow (P)'
                opt = opt.replace("A-P", "(A) $\\rightarrow$ (P)")
                opt = opt.replace("B-Q", "(B) $\\rightarrow$ (Q)")
                opt = opt.replace("C-R", "(C) $\\rightarrow$ (R)")
                opt = opt.replace("D-S", "(D) $\\rightarrow$ (S)")
                
                opt = opt.replace("A-Q", "(A) $\\rightarrow$ (Q)")
                opt = opt.replace("B-P", "(B) $\\rightarrow$ (P)")
                opt = opt.replace("C-S", "(C) $\\rightarrow$ (S)")
                opt = opt.replace("D-R", "(D) $\\rightarrow$ (R)")
                
                opt = opt.replace("A-R", "(A) $\\rightarrow$ (R)")
                opt = opt.replace("B-S", "(B) $\\rightarrow$ (S)")
                opt = opt.replace("C-P", "(C) $\\rightarrow$ (P)")
                opt = opt.replace("D-Q", "(D) $\\rightarrow$ (Q)")
                
                opt = opt.replace("A-S", "(A) $\\rightarrow$ (S)")
                opt = opt.replace("B-R", "(B) $\\rightarrow$ (R)")
                opt = opt.replace("C-Q", "(C) $\\rightarrow$ (Q)")
                opt = opt.replace("D-P", "(D) $\\rightarrow$ (P)")
                new_options.append(opt)
            if new_options:
                q["options"] = new_options

        # Fix < and > for dangerouslySetInnerHTML by replacing < with &lt; and > with &gt;
        # But we only want to do this OUTSIDE of our generated HTML tags like <table>, <tr>, etc.
        # Since we only generated simple tags, we can just replace them temporarily.
        text = q["text"]
        
        # We need to protect the HTML tags we added for Exercise 4
        html_tags = ['<table class="min-w-full text-left text-sm border-collapse border border-gray-300 mt-4 mb-4">', 
                     '<thead><tr>', '</tr></thead><tbody>', '<tr>', '</tr>', '</tbody></table>',
                     '<th class="border border-gray-300 px-4 py-2 bg-gray-100">', '</th>',
                     '<td class="border border-gray-300 px-4 py-2">', '</td>']
                     
        for i, tag in enumerate(html_tags):
            text = text.replace(tag, f"__HTML_TAG_{i}__")
            
        # Now it's safe to replace < and > in the math text
        # Wait, if there are <br> or other tags from original OCR? The OCR might have outputted some.
        # Actually, let's just replace `< ` with `&lt; ` and ` <` with ` &lt;` to be safe.
        # Even better, let's replace `<0` with `&lt; 0`.
        text = re.sub(r'<(?=[ \d0-9a-zA-Z\$\\])', '&lt;', text)
        text = re.sub(r'(?<=[ \d0-9a-zA-Z\$\\])>', '&gt;', text)
        
        # Restore HTML tags
        for i, tag in enumerate(html_tags):
            text = text.replace(f"__HTML_TAG_{i}__", tag)
            
        q["text"] = text

    with open(main_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

if __name__ == '__main__':
    fix_math()
