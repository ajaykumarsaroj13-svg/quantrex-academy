import fitz # PyMuPDF

pdf_path = "C:/Users/Admin/Downloads/882838728-Black-Book (1).pdf"
doc = fitz.open(pdf_path)

total_chars = 0
for i in range(10):
    if i < len(doc):
        text = doc[i].get_text()
        total_chars += len(text.strip())

if total_chars < 100:
    print("PDF seems to be SCANNED (no text).")
else:
    print(f"PDF has text. Total chars in first 10 pages: {total_chars}")

doc.close()
