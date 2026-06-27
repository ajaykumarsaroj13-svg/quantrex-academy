import urllib.request
import re

html = urllib.request.urlopen('https://quantrexacademy.vercel.app').read().decode('utf-8')
js_files = re.findall(r'src="(/assets/[^"]+\.js)"', html)
for js in js_files:
    url = 'https://quantrexacademy.vercel.app' + js
    try:
        content = urllib.request.urlopen(url).read().decode('utf-8')
        if 'data/questions/' in content:
            print(f"Found in {js}")
            # print a snippet around fetchSlug
            idx = content.find('data/questions/')
            print(content[max(0, idx-100):min(len(content), idx+100)])
    except:
        pass
