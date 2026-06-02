import os
import sys
import fitz
import json
import google.generativeai as genai
from pydantic import BaseModel
from PIL import Image
import io

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-2.5-flash')

class Chapter(BaseModel):
    chapter_number: int
    title: str
    start_page_in_pdf: int

class TOC(BaseModel):
    chapters: list[Chapter]

doc = fitz.open("C:/Users/Admin/Downloads/882838728-Black-Book (1).pdf")
page = doc.load_page(6)
pix = page.get_pixmap(dpi=150)
img = Image.open(io.BytesIO(pix.tobytes("png")))

prompt = """
This is the Table of Contents page of a math book.
List all the chapters, their numbers, and their starting page numbers.
Note: The 'start_page_in_pdf' should be the actual physical page number in the PDF. Just output the raw number printed on the page, I will calculate the offset.
"""

resp = model.generate_content([prompt, img], generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=TOC))
print(resp.text)
