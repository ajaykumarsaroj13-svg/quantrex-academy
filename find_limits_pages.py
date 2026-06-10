import fitz # PyMuPDF

pdf_path = "C:/Users/Admin/Downloads/882838728-Black-Book (1).pdf"
doc = fitz.open(pdf_path)

# Print table of contents if available
toc = doc.get_toc()
if toc:
    print("Table of Contents:")
    for item in toc:
        if 'limit' in item[1].lower():
            print(item)
else:
    print("No TOC found. Searching first 30 pages for 'Limit'...")
    for i in range(min(30, len(doc))):
        text = doc[i].get_text().lower()
        if 'limit' in text:
            print(f"Page {i+1}: Found 'limit'")

doc.close()
