import fitz
import requests
import json
import base64
import time

API_KEY = 'AIzaSyBo4rt8yHyCFkR3IutgFH5705VJUVX0BXk'
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}'

def extract_page(page_num, doc):
    print(f'Processing page {page_num}...')
    pix = doc[page_num].get_pixmap(matrix=fitz.Matrix(2, 2)) # Higher resolution
    img_data = pix.tobytes('png')
    img_b64 = base64.b64encode(img_data).decode('utf-8')
    
    prompt = '''
You are an expert at extracting mathematical questions from textbook pages.
Extract ALL the questions from this image into a JSON array.
Use standard LaTeX/MathJax for all mathematical formulas, enclosed in single dollar signs $ for inline math, and  for block math. Do not use \( or \). 
Convert any text like 'Exercise-1 : Single Choice Problems' to set the exercise context.
For each question, return a JSON object with this exact schema:
{
  "questionNumber": <integer>,
  "questionType": <string> (e.g., "SINGLE CORRECT", "MULTIPLE CORRECT", "COMPREHENSION", "MATCH THE COLUMN", "SUBJECTIVE TYPE"),
  "text": <string> (The question text with MathJax),
  "options": <array of strings> (The 4 options A,B,C,D if present, with MathJax. Leave empty [] if it is subjective/matching),
  "exerciseName": <string> (e.g., "Exercise 1", "Exercise 2", etc.),
  "has_graph": false,
  "chapter": "Functions"
}
For "MATCH THE COLUMN" questions, format the text exactly like this:
"Match Column-I with Column-II. Column-I: (A) ... ; (B) ... Column-II: (P) ... ; (Q) ..."
Return ONLY the raw JSON array of objects without any markdown formatting like \\\json.
'''
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": "image/png",
                        "data": img_b64
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1
        }
    }
    
    retries = 3
    for attempt in range(retries):
        try:
            resp = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
            if resp.status_code == 200:
                res_json = resp.json()
                text_res = res_json['candidates'][0]['content']['parts'][0]['text']
                text_res = text_res.strip().removeprefix('`json').removesuffix('`').strip()
                return json.loads(text_res)
            else:
                print(f'API error {resp.status_code}: {resp.text}')
                time.sleep(2)
        except Exception as e:
            print(f'Error on page {page_num}: {e}')
            time.sleep(2)
    return []

doc = fitz.open('C:/Users/Admin/Downloads/function back boook.pdf')
# Let's test on page 7 (which has Q8 to Q17)
# Note: PyMuPDF is 0-indexed, so page 7 is doc[6]
res = extract_page(6, doc)
with open('test_page_7.json', 'w', encoding='utf-8') as f:
    json.dump(res, f, indent=2)
print(f'Extracted {len(res)} questions from page 7.')
