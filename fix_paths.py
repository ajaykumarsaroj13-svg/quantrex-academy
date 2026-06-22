import os, shutil, re

base_dir = 'E:/quantrexacademy'
pub_images = os.path.join(base_dir, 'public/images')
old_folder = os.path.join(pub_images, 'toppers')
new_folder = os.path.join(pub_images, 'results')

if not os.path.exists(new_folder):
    os.makedirs(new_folder)

# 1. Copy and rename images
shutil.copy(os.path.join(old_folder, 'dibyanshu_advanced.jpg'), os.path.join(new_folder, 'student1.jpg'))
shutil.copy(os.path.join(old_folder, 'dibyanshu_mains.jpg'), os.path.join(new_folder, 'student2.jpg'))
shutil.copy(os.path.join(old_folder, 'rakshit-2022.jpg'), os.path.join(new_folder, 'student3.jpg'))

# 2. Update Home.jsx
home_jsx_path = os.path.join(base_dir, 'src/pages/Home.jsx')
with open(home_jsx_path, 'r', encoding='utf-8') as f:
    home_content = f.read()

home_content = home_content.replace('/images/toppers/dibyanshu_mains.jpg', '/images/results/student2.jpg')
home_content = home_content.replace('/images/toppers/dibyanshu_advanced.jpg', '/images/results/student1.jpg')
home_content = home_content.replace('/images/toppers/rakshit-2022.jpg', '/images/results/student3.jpg')
home_content = re.sub(r'\?v=[a-zA-Z0-9]+', '', home_content) # clean up all ?v= params

with open(home_jsx_path, 'w', encoding='utf-8') as f:
    f.write(home_content)

# 3. Rename data-script.js to data-v5.js
data_old = os.path.join(base_dir, 'public/data-script.js')
data_new = os.path.join(base_dir, 'public/data-v5.js')
if os.path.exists(data_old):
    shutil.copy(data_old, data_new)
    
with open(data_new, 'r', encoding='utf-8') as f:
    data_content = f.read()

data_content = data_content.replace('/images/toppers/dibyanshu_mains.jpg', '/images/results/student2.jpg')
data_content = data_content.replace('/images/toppers/dibyanshu_advanced.jpg', '/images/results/student1.jpg')
data_content = data_content.replace('/images/toppers/rakshit-2022.jpg', '/images/results/student3.jpg')
data_content = re.sub(r'\?v=[a-zA-Z0-9]+', '', data_content)

with open(data_new, 'w', encoding='utf-8') as f:
    f.write(data_content)

# 4. Update main.jsx
main_jsx = os.path.join(base_dir, 'src/main.jsx')
with open(main_jsx, 'r', encoding='utf-8') as f:
    main_content = f.read()

main_content = main_content.replace('data-script.js?v=4.0', 'data-v5.js')
main_content = main_content.replace('data-script.js', 'data-v5.js')

with open(main_jsx, 'w', encoding='utf-8') as f:
    f.write(main_content)

print("Done")
