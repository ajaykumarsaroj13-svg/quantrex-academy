import fitz
import os

pdf_path = 'C:/Users/Admin/Downloads/continuity and differentiability.pdf'
out_dir = 'pdf_pages_ch3'

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

doc = fitz.open(pdf_path)

for i in range(len(doc)):
    pix = doc[i].get_pixmap(matrix=fitz.Matrix(2, 2))
    pix.save(f'{out_dir}/page_{i}.png')
    print(f'Saved page_{i}.png')

print('All pages sliced.')
