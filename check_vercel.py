import urllib.request
import re

url = 'https://quantrexacademy.vercel.app/'
try:
    req = urllib.request.Request(url, method='GET')
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        # Find script tags
        scripts = re.findall(r'<script[^>]*src="([^"]+)"', html)
        for s in scripts:
            if s.startswith('/assets/'):
                print(f'Checking {s}...')
                s_url = url + s.lstrip('/')
                s_req = urllib.request.Request(s_url, method='GET')
                with urllib.request.urlopen(s_req) as s_resp:
                    content = s_resp.read().decode('utf-8')
                    if 'quantrex-9c898.firebaseapp.com' in content:
                        print('FIREBASE FOUND IN DEPLOYMENT!')
                        break
        else:
            print('Firebase NOT found in deployment.')
except Exception as e:
    print('Error:', e)
