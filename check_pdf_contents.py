import requests
import json
import base64
import time
import os

API_KEY = 'AQ.Ab8RN6K29KzZs6qrxfgiRK-ScGo5TDyjPqpmNy-mCt6hRtMQ5g'
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}'

def inspect_page(page_path):
    if not os.path.exists(page_path):
        return f"{page_path} does not exist"
    
    with open(page_path, 'rb') as f:
        img_data = f.read()
    
    img_b64 = base64.b64encode(img_data).decode('utf-8')
    
    prompt = "Look at this textbook page and tell me: 1. The chapter name shown at the top, 2. The exercise name shown (e.g. Exercise 1), and 3. The first question text or description. Keep it extremely brief (max 2 sentences)."
    
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
    
    try:
        resp = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
        if resp.status_code == 200:
            res_json = resp.json()
            return res_json['candidates'][0]['content']['parts'][0]['text']
        else:
            return f"Error {resp.status_code}: {resp.text[:200]}"
    except Exception as e:
        return f"Request failed: {e}"

out_lines = []
for p in range(30):
    page_path = f"pdf_pages_ch3/page_{p}.png"
    desc = inspect_page(page_path)
    print(f"Processed page {p}")
    out_lines.append(f"=== Page {p} ===\n{desc}\n")
    time.sleep(1)

with open("pdf_pages_ch3_summary.txt", "w", encoding="utf-8") as f:
    f.writelines(out_lines)

print("Done summary!")
