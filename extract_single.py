import sys
import json
import os
import fitz
from PIL import Image
import io
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

prompt = """You are an expert at extracting mathematics content from JEE preparation books (like Advanced Problems in Mathematics).
Extract all the questions and answers from the provided page image into a JSON structure.

Rules:
1. Every math equation must be written in valid LaTeX format inline ($...$) or block ($$...$$). Do not use \\( \\) or \\[ \\].
2. For multiple choice questions, extract the options into the 'options' array.
3. Identify the question type: "SINGLE CORRECT", "MULTIPLE CORRECT", "MATCH THE COLUMN", "SUBJECTIVE TYPE", "COMPREHENSION".
4. If there is a graph, table, or complex match-the-column figure that cannot be easily written as text, set 'has_graph' to true and provide 'graph_bbox' as [ymin, xmin, ymax, xmax] relative to 1000x1000 page size. Otherwise leave it false and empty.
5. If the page is purely an answer key page, set 'is_answer_key_page' to true and extract the answer keys.

JSON Schema:
{
  "chapter_title": "string (if visible)",
  "is_answer_key_page": boolean,
  "questions": [
    {
      "questionNumber": number,
      "questionType": "string",
      "text": "string (with LaTeX)",
      "options": ["string", "string"],
      "has_graph": boolean,
      "graph_bbox": [ymin, xmin, ymax, xmax]
    }
  ],
  "answer_keys": [
    {
      "questionNumber": number,
      "correctOptionStr": "string (e.g. 'A', 'A,B', '9', 'x=2')"
    }
  ]
}
"""

def extract_single_page(pdf_path, p_num, out_file):
    doc = fitz.open(pdf_path)
    page = doc.load_page(p_num - 1)
    pix = page.get_pixmap(dpi=200)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    
    print(f"Generating content for page {p_num}...")
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, img],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )
        res = json.loads(response.text)
        res["page_num"] = p_num - 1
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(res, f, indent=2, ensure_ascii=False)
        print(f"Success for page {p_num}")
    except Exception as e:
        print(f"Error on page {p_num}: {e}")

if __name__ == "__main__":
    pdf = sys.argv[1]
    p_num = int(sys.argv[2])
    out = sys.argv[3]
    extract_single_page(pdf, p_num, out)
