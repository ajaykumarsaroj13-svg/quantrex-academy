import re

content = open('public/data-script.js', 'r', encoding='utf-8').read()

new_toppers = '''window.DEFAULT_TOPPERS = [
  {
    "id": "t1",
    "name": "DIBYANSHU SAHOO",
    "score": "99.83 %ile",
    "year": "JEE MAIN 2026",
    "photo": "/images/toppers/dibyanshu_main2.png?v=new8",
    "testimonial": "Quantrex Academy transformed my preparation.",
    "isPoster": false
  },
  {
    "id": "t2",
    "name": "RAKSHIT ARYAN",
    "score": "AIR 591",
    "year": "JEE ADV 2022",
    "photo": "/images/toppers/rakshit_new2.png?v=new8",
    "testimonial": "The material is perfectly structured.",
    "isPoster": false
  },
  {
    "id": "t3",
    "name": "DIBYANSHU SAHOO",
    "score": "AIR 2575",
    "year": "JEE ADVANCED 2026",
    "photo": "/images/toppers/dibyanshu_adv2.png?v=new8",
    "testimonial": "The test series was exactly like the real exam.",
    "isPoster": false
  },
  {
    "id": "t4",
    "name": "ARKADEEP JANA",
    "score": "97.69 %ile",
    "year": "JEE MAIN 2026",
    "photo": "/images/toppers/arkadeep_new2.png?v=new8",
    "testimonial": "Best platform for JEE preparation.",
    "isPoster": false
  },
  {
    "id": "t5",
    "name": "YASH PANT",
    "score": "97.38 %ile",
    "year": "JEE MAIN 2026",
    "photo": "/images/toppers/yash_new2.png?v=new8",
    "testimonial": "The detailed analytics helped me find my weak spots.",
    "isPoster": false
  }
];'''

content = re.sub(
    r'window\.DEFAULT_TOPPERS = \[.*?\];',
    new_toppers,
    content,
    flags=re.DOTALL
)

open('public/data-script.js', 'w', encoding='utf-8').write(content)
