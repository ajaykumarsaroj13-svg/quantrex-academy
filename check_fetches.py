import urllib.request
import re

html = urllib.request.urlopen('https://quantrexacademy.vercel.app').read().decode('utf-8')
js_files = re.findall(r'src="(/assets/[^"]+\.js)"', html)
for js in js_files:
    url = 'https://quantrexacademy.vercel.app' + js
    try:
        content = urllib.request.urlopen(url).read().decode('utf-8')
        fetches = re.findall(r'fetch\([^)]*\)', content)
        if fetches:
            print(f"--- {js} ---")
            for f in fetches:
                print(f)
    except Exception as e:
        print(f"Error {js}: {e}")
