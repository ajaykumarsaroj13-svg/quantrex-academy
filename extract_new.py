import fitz
import requests
import json
import base64
import time

API_KEY = 'AQ.Ab8RN6K29KzZs6qrxfgiRK-ScGo5TDyjPqpmNy-mCt6hRtMQ5g'
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}'

def extract_page(page_num, doc):
    print(f'Processing page {page_num}...')
    pix = doc[page_num].get_pixmap(matrix=fitz.Matrix(2, 2))
    img_data = pix.tobytes('png')
    img_b64 = base64.b64encode(img_data).decode('utf-8')
    
    prompt = 'What do you see in this image?'
    
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
    }
    
    resp = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
    print(f'Status: {resp.status_code}')
    print(resp.text[:500])

doc = fitz.open('C:/Users/Admin/Downloads/function back boook.pdf')
extract_page(6, doc)
