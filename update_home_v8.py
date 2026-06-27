import re

content = open('src/pages/Home.jsx', 'r', encoding='utf-8').read()

content = content.replace('/images/toppers/top_1.png?v=new7', '/images/toppers/dibyanshu_adv2.png?v=new8')
content = content.replace('/images/toppers/top_2.png?v=new7', '/images/toppers/dibyanshu_main2.png?v=new8')
content = content.replace('/images/toppers/top_3.png?v=new7', '/images/toppers/rakshit_new2.png?v=new8')

open('src/pages/Home.jsx', 'w', encoding='utf-8').write(content)
