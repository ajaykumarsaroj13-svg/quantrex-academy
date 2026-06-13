import re

content = open('src/pages/Home.jsx', 'r', encoding='utf-8').read()

# Replace hardcoded image 1
content = re.sub(r'/images/toppers/dibyanshu_adv\.jpg\?v=[^\"]+', '/images/toppers/top_1.png?v=new5', content)
# Replace hardcoded image 2
content = re.sub(r'/images/toppers/dibyanshu_main\.jpg\?v=[^\"]+', '/images/toppers/top_2.png?v=new5', content)
# Replace hardcoded image 3
content = re.sub(r'/images/toppers/rakshit-2022\.jpg\?v=[^\"]+', '/images/toppers/top_3.png?v=new5', content)

# To ensure the slider only shows the remaining ones, let's make sure toppers in Home.jsx filters them or we just use data-script.js
# Right now data-script.js has all 5. Let's make the slider filter out the top 3 if needed, or just let it map over data-script.js which we will change to only have slider_1 and slider_2.

open('src/pages/Home.jsx', 'w', encoding='utf-8').write(content)
