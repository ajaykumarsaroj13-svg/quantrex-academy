import re

content = open('public/data-script.js', 'r', encoding='utf-8').read()

new_toppers = '''window.DEFAULT_TOPPERS = [
  {
    "id": "t1",
    "name": "Dibyanshu Sahu",
    "rank": "AIR 2575",
    "score": "JEE Advanced",
    "year": "2026",
    "photo": "/images/toppers/top_1.png?v=new7",
    "testimonial": "Quantrex Academy transformed my preparation.",
    "isPoster": false
  },
  {
    "id": "t2",
    "name": "Rakshit R",
    "rank": "AIR 2773",
    "score": "JEE Main",
    "year": "2026",
    "photo": "/images/toppers/top_2.png?v=new7",
    "testimonial": "The test series was exactly like the real exam.",
    "isPoster": false
  },
  {
    "id": "t3",
    "name": "Rakshit",
    "rank": "AIR 591",
    "score": "JEE Advanced",
    "year": "2022",
    "photo": "/images/toppers/top_3.png?v=new7",
    "testimonial": "The material is perfectly structured.",
    "isPoster": false
  },
  {
    "id": "t4",
    "name": "Arkadeep",
    "rank": "99.85 %ile",
    "score": "JEE Main",
    "year": "2026",
    "photo": "/images/toppers/slider_1.png?v=new7",
    "testimonial": "Best platform for JEE preparation.",
    "isPoster": false
  },
  {
    "id": "t5",
    "name": "Yash Pant",
    "rank": "99.2 %ile",
    "score": "JEE Main",
    "year": "2026",
    "photo": "/images/toppers/slider_2.png?v=new7",
    "testimonial": "The detailed analytics helped me find my weak spots.",
    "isPoster": false
  }
];'''

content = re.sub(r'window\.DEFAULT_TOPPERS\s*=\s*\[.*\];', new_toppers, content, flags=re.DOTALL)
open('public/data-script.js', 'w', encoding='utf-8').write(content)
