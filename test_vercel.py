import urllib.request
import re

try:
    html = urllib.request.urlopen('https://quantrexacademy.vercel.app').read().decode('utf-8')
    m = re.search(r'src="/assets/(index-[^"]+\.js)"', html)
    if m:
        print('JS:', m.group(1))
        js = urllib.request.urlopen('https://quantrexacademy.vercel.app/assets/' + m.group(1)).read().decode('utf-8')
        print('Is Updated:', 'Exercise 1' in js)
    else:
        print('No JS found')
except Exception as e:
    print('Error:', e)
