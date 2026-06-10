import sys
from PIL import Image

img = Image.open('test_img.png').convert('RGBA')
# create white background
bg = Image.new('RGBA', img.size, (255, 255, 255, 255))
out = Image.alpha_composite(bg, img).convert('L')
out = out.resize((100, 50))

pixels = out.load()
width, height = out.size

chars = "@%#*+=-:. "
output = ""
for y in range(height):
    for x in range(width):
        val = pixels[x, y]
        char_idx = int((val / 256) * len(chars))
        output += chars[char_idx]
    output += "\n"

print(output)
