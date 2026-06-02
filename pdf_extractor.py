import os
import sys
import fitz  # PyMuPDF
import json
import time
import google.generativeai as genai
from pydantic import BaseModel
from PIL import Image
import io

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
    sys.exit(1)

genai.configure(api_key=API_KEY)

# Use the latest model
model = genai.GenerativeModel('gemini-2.5-flash')

class Question(BaseModel):
    text: str
    options: list[str]
    correctOption: int
    solution: str

class ChapterQuestions(BaseModel):
    questions: list[Question]

def extract_page(pdf_path, page_num):
    doc = fitz.open(pdf_path)
    page = doc.load_page(page_num)
    # Render page to an image
    pix = page.get_pixmap(dpi=150)
    img_data = pix.tobytes("png")
    img = Image.open(io.BytesIO(img_data))
    
    prompt = """
    This is a page from an advanced mathematics textbook. It contains multiple-choice questions.
    Extract ALL the questions exactly as they appear, preserving all mathematics in perfect LaTeX format (using $...$ for inline math and $$...$$ for block math).
    
    For each question:
    1. 'text': The full question text in LaTeX.
    2. 'options': A list of exactly 4 strings for options A, B, C, D in LaTeX.
    3. 'correctOption': Usually not marked, so put -1. If an answer key is visible, put 0 for A, 1 for B, 2 for C, 3 for D.
    4. 'solution': Put an empty string "".
    
    Output strictly as JSON matching the schema. Ignore any headers/footers/page numbers.
    """
    
    print(f"Sending page {page_num} to Gemini API...")
    try:
        response = model.generate_content(
            [prompt, img],
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=ChapterQuestions,
                temperature=0.1
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error on page {page_num}: {e}")
        return {"questions": []}

def process_pdf(pdf_path, start_page, end_page, output_file):
    all_questions = []
    for i in range(start_page, end_page + 1):
        res = extract_page(pdf_path, i)
        if res and "questions" in res:
            all_questions.extend(res["questions"])
            print(f"Extracted {len(res['questions'])} questions from page {i}.")
        time.sleep(2) # rate limit prevention
        
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(all_questions)} total questions to {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python pdf_extractor.py <pdf_path> <start_page> <end_page> <output_json>")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    start_page = int(sys.argv[2])
    end_page = int(sys.argv[3])
    out_file = sys.argv[4]
    
    process_pdf(pdf_path, start_page, end_page, out_file)
