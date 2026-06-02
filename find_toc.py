import os, sys, fitz, json
import google.generativeai as genai
from PIL import Image
import io

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-2.5-flash')

doc = fitz.open("C:/Users/Admin/Downloads/882838728-Black-Book (1).pdf")
for i in range(4, 15):
    page = doc.load_page(i)
    pix = page.get_pixmap(dpi=72)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    prompt = "Is this page the Table of Contents of a book? Answer with ONLY 'YES' or 'NO'."
    resp = model.generate_content([prompt, img])
    print(f"Page {i}: {resp.text.strip()}")
