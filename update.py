import sys
import re

content = open('public/data-script.js', 'r', encoding='utf-8').read()
new_toppers = '''window.DEFAULT_TOPPERS = [
  {
    "id": "t1",
    "name": "Topper 1",
    "rank": "",
    "score": "",
    "year": "",
    "photo": "/images/toppers/top_1.png?v=new5",
    "testimonial": "",
    "isPoster": true
  },
  {
    "id": "t2",
    "name": "Topper 2",
    "rank": "",
    "score": "",
    "year": "",
    "photo": "/images/toppers/top_2.png?v=new5",
    "testimonial": "",
    "isPoster": true
  },
  {
    "id": "t3",
    "name": "Topper 3",
    "rank": "",
    "score": "",
    "year": "",
    "photo": "/images/toppers/top_3.png?v=new5",
    "testimonial": "",
    "isPoster": true
  },
  {
    "id": "t4",
    "name": "Topper 4",
    "rank": "",
    "score": "",
    "year": "",
    "photo": "/images/toppers/slider_1.png?v=new5",
    "testimonial": "",
    "isPoster": true
  },
  {
    "id": "t5",
    "name": "Topper 5",
    "rank": "",
    "score": "",
    "year": "",
    "photo": "/images/toppers/slider_2.png?v=new5",
    "testimonial": "",
    "isPoster": true
  }
];'''

content = re.sub(r'window\.DEFAULT_TOPPERS\s*=\s*\[.*\];', new_toppers, content, flags=re.DOTALL)
open('public/data-script.js', 'w', encoding='utf-8').write(content)
