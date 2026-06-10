import fitz

pdf_path = "C:/Users/Admin/Downloads/882838728-Black-Book (1).pdf"
doc = fitz.open(pdf_path)

import os
os.makedirs("pdf_pages", exist_ok=True)

for i in range(2, 12):
    page = doc.load_page(i)
    pix = page.get_pixmap(dpi=150)
    pix.save(f"pdf_pages/page_{i+1}.png")

print("Saved pages 3 to 12 as images.")
doc.close()
