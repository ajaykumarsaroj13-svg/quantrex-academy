import fitz
import base64
import json
import requests
import os
import sys
import re

API_KEY = os.environ.get('OPENAI_API_KEY')
if not API_KEY:
    print("Error: OPENAI_API_KEY environment variable not set.")
    sys.exit(1)

def encode_page_to_base64(pdf_path, page_num):
    doc = fitz.open(pdf_path)
    page = doc.load_page(page_num)
    # Higher resolution matrix
    matrix = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=matrix)
    img_bytes = pix.tobytes("jpeg")
    return base64.b64encode(img_bytes).decode("utf-8")

def main():
    print("Extracting images from PDFs...")
    q_pdf = r"C:/Users/Admin/Downloads/882838728-Black-Book.pdf"
    s_pdf = r"C:/Users/Admin/Downloads/1019526640-Black-Book-Solution-Chapter-8-26-Vikas-Gupta-Advanced-Problems-in-Mathematics-for-JEE-260314-165709.pdf"

    # Sequence and Series: 
    # Questions start at index 175 (let's send 175, 176, 177)
    # Solutions start at index 4 (let's send 4, 5, 6)
    q_images = [encode_page_to_base64(q_pdf, i) for i in range(175, 178)]
    s_images = [encode_page_to_base64(s_pdf, i) for i in range(4, 7)]

    messages = [
        {
            "role": "system",
            "content": "You are a math data extraction assistant. Extract EXACTLY the first 10 questions and their solutions from the provided images. Format all math equations in KaTeX (use $ for inline math and $$ for display math, eg: $x^2 + y^2 = 1$). Never use markdown bold inside math blocks. Output MUST be valid JSON (do not include markdown code block syntax like ```json)."
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """I am providing images from a textbook. The first few images are the 'Questions' pages and the later images are the 'Solutions' pages for a chapter on 'Sequence and Series'.
Please extract the first 10 questions and their corresponding solutions. Return a JSON array where each object has the following structure:
{
  "questionNumber": 1,
  "text": "The question text here with $math$",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctOption": 2,  // integer 1-4 based on the solution
  "solution": "The step-by-step solution text here with $math$"
}

Ensure that the options are in an array of strings, and correctOption is an integer (1, 2, 3, or 4). Match the solutions to the questions by their numbers. Remember to output ONLY a valid JSON array and nothing else."""
                }
            ]
        }
    ]

    for img in q_images:
        messages[1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}"}})
    
    for img in s_images:
        messages[1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}"}})

    print("Sending request to OpenAI API...")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    payload = {
        "model": "gpt-4o",
        "messages": messages,
        "temperature": 0.1,
        "max_tokens": 4096
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    if response.status_code != 200:
        print("Error from OpenAI:", response.text)
        sys.exit(1)

    data = response.json()
    content = data['choices'][0]['message']['content']
    
    # Strip markdown block if GPT still included it
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    try:
        parsed_json = json.loads(content)
        # Ensure public/data/blackbook exists
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
