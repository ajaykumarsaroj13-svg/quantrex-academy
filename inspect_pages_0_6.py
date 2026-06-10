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
    
    prompt = "Look at this textbook page and tell me: 1. The chapter name shown at the top, 2. The exercise name shown, 3. The question numbers shown, and 4. The text of the first question. Keep it very brief."
    
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
    
    for attempt in range(3):
        try:
            resp = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
            if resp.status_code == 200:
                res_json = resp.json()
                return res_json['candidates'][0]['content']['parts'][0]['text']
            else:
                print(f"Attempt {attempt+1} failed: {resp.status_code}")
                time.sleep(2)
        except Exception as e:
            print(f"Attempt {attempt+1} exception: {e}")
            time.sleep(2)
    return "Failed to inspect"

for p in range(7):
    page_path = f"pdf_pages_ch3/page_{p}.png"
    print(f"--- Page {p} ---")
    print(inspect_page(page_path))
    time.sleep(2)
