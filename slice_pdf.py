import fitz
import os

pdf_path = 'C:/Users/Admin/Downloads/function back boook.pdf'
out_dir = 'pdf_pages'

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

doc = fitz.open(pdf_path)

# Pages 6 to 31 (0-indexed: 5 to 30)
for i in range(5, 31):
    pix = doc[i].get_pixmap(matrix=fitz.Matrix(2, 2))
    pix.save(f'{out_dir}/page_{i+1}.png')
    print(f'Saved page_{i+1}.png')

print('All pages sliced.')
