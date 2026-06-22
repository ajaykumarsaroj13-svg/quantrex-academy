import os
import json

filepath = "public/data-script.js"
with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# Fix image URLs
text = text.replace("dibyanshu_main2.png", "dibyanshu_main.jpg")
text = text.replace("dibyanshu_adv2.png", "dibyanshu_adv.jpg")
text = text.replace("rakshit_new2.png", "rakshit-2022.jpg")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(text)

print("Images replaced.")
