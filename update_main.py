import re

filepath = "src/main.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# The pattern looks for data-script.js?v=3.0 or any version and replaces with 4.0
new_text = re.sub(r'data-script\.js\?v=[\d\.]+', 'data-script.js?v=4.0', text)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_text)

print("Updated main.jsx cache buster!")
