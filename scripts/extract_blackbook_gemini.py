import fitz
import base64
import json
import os
import sys
import requests

API_KEY = os.environ.get('GEMINI_API_KEY')
if not API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
    sys.exit(1)

def get_page_image_base64(pdf_path, page_num):
    doc = fitz.open(pdf_path)
    page = doc.load_page(page_num)
    matrix = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=matrix)
    img_bytes = pix.tobytes("jpeg")
    return base64.b64encode(img_bytes).decode('utf-8')

def main():
    print("Extracting images from PDFs...")
    q_pdf = r"C:/Users/Admin/Downloads/882838728-Black-Book.pdf"
    s_pdf = r"C:/Users/Admin/Downloads/1019526640-Black-Book-Solution-Chapter-8-26-Vikas-Gupta-Advanced-Problems-in-Mathematics-for-JEE-260314-165709.pdf"

    q_images = [get_page_image_base64(q_pdf, i) for i in range(175, 178)]
    s_images = [get_page_image_base64(s_pdf, i) for i in range(4, 7)]

    print("Sending request to Gemini REST API...")
    
    prompt = """I am providing images from a textbook. The first few images are the 'Questions' pages and the later images are the 'Solutions' pages for a chapter on 'Sequence and Series'.
Please extract the first 10 questions and their corresponding solutions. Return a JSON array where each object has the following structure:
[
  {
    "questionNumber": 1,
    "text": "The question text here with $math$",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctOption": 2,
    "solution": "The step-by-step solution text here with $math$"
  }
]

Format all math equations in KaTeX (use $ for inline math and $$ for display math, eg: $x^2 + y^2 = 1$). Ensure that the options are in an array of strings, and correctOption is an integer (1, 2, 3, or 4). Match the solutions to the questions by their numbers. Remember to output ONLY a valid JSON array and nothing else."""

    parts = [{"text": prompt}]
    
    for img_b64 in q_images + s_images:
        parts.append({
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": img_b64
            }
        })

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": 0.1
        }
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print("Error calling Gemini API:", e)
        if hasattr(e, 'response') and e.response is not None:
            print("Response:", e.response.text)
        sys.exit(1)
        
    data = response.json()
    try:
        content = data['candidates'][0]['content']['parts'][0]['text']
    except (KeyError, IndexError) as e:
        print("Unexpected response structure:", json.dumps(data, indent=2))
        sys.exit(1)
        
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    
    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    try:
        parsed_json = json.loads(content)
        os.makedirs("public/data/blackbook", exist_ok=True)
        out_path = "public/data/blackbook/sequence-and-series.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(parsed_json, f, indent=2, ensure_ascii=False)
        print(f"Successfully extracted {len(parsed_json)} questions and saved to {out_path}")
    except Exception as e:
        print("Error parsing JSON:", e)
        print("Raw content:")
        print(content)

if __name__ == "__main__":
    main()
