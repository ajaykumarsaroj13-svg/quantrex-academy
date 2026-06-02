import sys
import fitz
import google.generativeai as genai
from PIL import Image
import io
import os

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

doc = fitz.open(sys.argv[1])
start_page = int(sys.argv[2])
end_page = int(sys.argv[3])

for p_num in range(start_page, end_page + 1):
    page = doc.load_page(p_num)
    pix = page.get_pixmap(dpi=150)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    
    prompt = "Is this page an Answer Key? If so, what chapters does it cover? Be brief."
    resp = model.generate_content([prompt, img])
    print(f"Page {p_num}: {resp.text.strip()}")
