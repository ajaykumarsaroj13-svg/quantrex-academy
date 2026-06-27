import fitz
import requests
import json
import base64

API_KEY = 'AQ.Ab8RN6K29KzZs6qrxfgiRK-ScGo5TDyjPqpmNy-mCt6hRtMQ5g'
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}'

doc = fitz.open('C:/Users/Admin/Downloads/function back boook.pdf')
pix = doc[6].get_pixmap(matrix=fitz.Matrix(1, 1))
img_data = pix.tobytes('png')
img_b64 = base64.b64encode(img_data).decode('utf-8')

payload = {
    "contents": [{
        "parts": [
            {"text": "Hello, can you see this?"},
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
