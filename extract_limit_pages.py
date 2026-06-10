import fitz
import os

pdf_path = "C:/Users/Admin/Downloads/882838728-Black-Book (1).pdf"
doc = fitz.open(pdf_path)

os.makedirs("pdf_pages", exist_ok=True)

# TOC said 30-44, which usually means physical page 30+offset.
# Let's extract 28 to 36 to find where "Limit" exactly starts.
for i in range(28, 38):
    if i < len(doc):
        page = doc.load_page(i)
        pix = page.get_pixmap(dpi=150)
        pix.save(f"pdf_pages/page_{i+1}.png")

print("Saved pages 29 to 38.")
doc.close()
