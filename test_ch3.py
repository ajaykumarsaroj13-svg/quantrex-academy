import fitz
import sys

print("Hello", flush=True)
pdf_path = 'C:/Users/Admin/Downloads/continuity and differentiability.pdf'
try:
    doc = fitz.open(pdf_path)
    print(f'Total pages: {len(doc)}', flush=True)
except Exception as e:
    print(f"Error: {e}", flush=True)
